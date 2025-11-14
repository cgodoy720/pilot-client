# New payment-based invoice creation endpoint
# Replace the existing @app.post("/api/finance/create-invoice") with this

@app.post("/api/finance/create-invoice")
async def create_sage_invoice(request: CreateInvoiceRequest):
    """Create invoice in Sage Intacct from a Salesforce payment record.
    
    NEW WORKFLOW (Per Payment):
    - Creates ONE invoice per payment (not per opportunity)
    - Links invoice to specific payment record
    - Payment marked as paid when invoice is paid in Sage
    
    SAFETY FEATURES:
    - Duplicate detection (checks for existing invoice on this payment)
    - Validates payment isn't already paid or invoiced
    - Proper error handling with detailed messages
    """
    try:
        from mcp_client.services.sage_intacct_sync import SageIntacctService as SageService
        import os
        
        sf = get_salesforce()
        payment_id = request.payment_id
        
        # Get payment details from Salesforce
        payment_query = f"""
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c, npe01__Paid__c,
               npe01__Opportunity__c, npe01__Opportunity__r.Name, npe01__Opportunity__r.Account.Name,
               npe01__Opportunity__r.StageName, Invoice__c
        FROM npe01__OppPayment__c
        WHERE Id = '{payment_id}'
        """
        payment_result = sf.query(payment_query)
        
        if not payment_result.get('records'):
            raise HTTPException(status_code=404, detail="Payment not found")
        
        payment = payment_result['records'][0]
        opp_name = payment.get('npe01__Opportunity__r', {}).get('Name')
        opp_id = payment.get('npe01__Opportunity__c')
        
        # DUPLICATE DETECTION: Check if invoice already exists for this payment
        if payment.get('Invoice__c'):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Invoice already exists for this payment",
                    "message": "This payment already has an invoice. Cannot create duplicate."
                }
            )
        
        # Validate payment isn't already paid
        if payment.get('npe01__Paid__c'):
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Payment is already marked as paid",
                    "message": "Cannot create invoice for paid payment."
                }
            )
        
        # Validate opportunity stage
        opp_stage = payment.get('npe01__Opportunity__r', {}).get('StageName')
        if opp_stage not in ['Collecting / In Effect', 'Closed Won']:
            raise HTTPException(
                status_code=400,
                detail=f"Opportunity must be in 'Collecting / In Effect' stage. Current stage: {opp_stage}"
            )
        
        # Initialize Sage Intacct service
        try:
            sage = SageService({
                'company_id': os.getenv('SAGE_COMPANY_ID'),
                'user_id': os.getenv('SAGE_USER_ID'),
                'user_password': os.getenv('SAGE_USER_PASSWORD'),
                'sender_id': os.getenv('SAGE_SENDER_ID'),
                'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
            })
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to initialize Sage Intacct connection",
                    "message": str(e),
                    "suggestion": "Check Sage credentials in .env file"
                }
            )
        
        # Prepare invoice data
        customer_id = payment.get('npe01__Opportunity__r', {}).get('Account', {}).get('Name')
        amount = float(payment.get('npe01__Payment_Amount__c', 0))
        due_date = payment.get('npe01__Scheduled_Date__c')
        
        # Create single line item for this payment
        line_items = [{
            'description': f"{opp_name} - Payment",
            'amount': amount,
            'glaccountno': '4010'  # Individual contributions
        }]
        
        # Create invoice in Sage
        try:
            sage_response = sage.create_invoice(
                customer_id=customer_id,
                amount=amount,
                description=f"{opp_name} - Payment",
                invoice_date=datetime.now().strftime('%Y-%m-%d'),
                due_date=due_date,
                line_items=line_items
            )
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to create invoice in Sage Intacct",
                    "message": str(e),
                    "suggestion": "Check if customer exists in Sage Intacct",
                    "customer_id": customer_id
                }
            )
        
        # Validate Sage response
        if not sage_response.get('success'):
            errors = sage_response.get('errors', ['Unknown error'])
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Sage Intacct rejected invoice creation",
                    "sage_errors": errors,
                    "customer_id": customer_id
                }
            )
        
        # Extract invoice ID
        sage_invoice_id = sage_response.get('invoice_id') or sage_response.get('RECORDNO')
        
        if not sage_invoice_id:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Failed to get invoice ID from Sage Intacct response",
                    "sage_response": sage_response
                }
            )
        
        # Track email sent status
        email_sent = request.send_email
        
        # Create Invoice__c record in Salesforce
        try:
            invoice_record = {
                'Opportunity__c': opp_id,
                'Invoice_ID__c': str(sage_invoice_id),
                'Invoice_Amount__c': amount,
                'Invoice_Date__c': datetime.now().strftime('%Y-%m-%d'),
                'Due_Date__c': due_date,
                'Invoice_Status__c': 'Posted',
                'Invoice_Sent__c': email_sent,
                'Description__c': f"{opp_name} - Payment",
                'Created_in_Sage_Date__c': datetime.now().isoformat()
            }
            
            sf_invoice_result = sf.Invoice__c.create(invoice_record)
            sf_invoice_id = sf_invoice_result.get('id')
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail={
                    "error": "Invoice created in Sage but failed to save to Salesforce",
                    "sage_invoice_id": sage_invoice_id,
                    "salesforce_error": str(e),
                    "action_required": f"Manually create Invoice__c record for Sage Invoice {sage_invoice_id}",
                    "critical": True
                }
            )
        
        # Link invoice to payment
        try:
            sf.npe01__OppPayment__c.update(payment_id, {
                'Invoice__c': sf_invoice_id
            })
        except Exception as e:
            print(f"Warning: Failed to link invoice to payment: {e}")
        
        # Update opportunity stage if needed
        try:
            if opp_stage == 'Closed Won':
                sf.Opportunity.update(opp_id, {
                    'StageName': 'Collecting / In Effect'
                })
        except Exception as e:
            print(f"Warning: Failed to update opportunity stage: {e}")
        
        return {
            "success": True,
            "message": f"Invoice created for payment",
            "sage_invoice_id": sage_invoice_id,
            "salesforce_invoice_id": sf_invoice_id,
            "payment_id": payment_id,
            "opportunity_name": opp_name,
            "amount": amount,
            "email_sent": email_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })

