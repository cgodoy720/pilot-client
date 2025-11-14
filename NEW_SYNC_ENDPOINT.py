@app.post("/api/finance/sync-invoice-status")
async def sync_invoice_status():
    """Sync invoice and payment status from Sage back to Salesforce.
    
    ENHANCED WORKFLOW:
    1. Checks all invoices in Salesforce
    2. Gets status from Sage (paid/unpaid, emailed/not emailed)
    3. Updates Salesforce:
       - Marks invoice as sent if emailed
       - Marks invoice as paid if paid in Sage
       - Marks linked payment as paid (npe01__Paid__c)
    4. Auto-completes opportunity when all payments are paid
    """
    try:
        from mcp_client.services.sage_intacct_sync import SageIntacctService as SageService
        import os
        
        sf = get_salesforce()
        
        # Get all invoices from Salesforce that aren't fully processed
        query = """
        SELECT Id, Invoice_ID__c, Invoice_Status__c, Invoice_Sent__c,
               Opportunity__c, Opportunity__r.Name, Opportunity__r.StageName
        FROM Invoice__c
        WHERE Invoice_Status__c != 'Paid'
        OR Invoice_Sent__c = false
        """
        
        result = sf.query(query)
        invoices = result.get('records', [])
        
        if not invoices:
            return {
                "success": True,
                "message": "No invoices to sync",
                "updated": 0
            }
        
        # Initialize Sage
        sage = SageService({
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        })
        
        invoices_updated = 0
        payments_updated = 0
        opportunities_completed = set()
        
        for invoice in invoices:
            sage_invoice_id = invoice.get('Invoice_ID__c')
            if not sage_invoice_id:
                continue
            
            # Get invoice data from Sage
            sage_data = sage.get_invoice(sage_invoice_id)
            
            if not sage_data.get('success'):
                continue
                
            invoice_data = sage_data.get('data', {})
            
            # Check invoice state in Sage
            # STATE can be: Draft, Submitted, Approved, Partially Paid, Paid, Voided
            sage_state = invoice_data.get('STATE', '').lower()
            
            # Check if modified (indicates it was sent/viewed)
            when_created = invoice_data.get('WHENCREATED')
            when_modified = invoice_data.get('WHENMODIFIED')
            was_modified = when_modified and when_created and when_modified != when_created
            
            # Prepare updates for Salesforce Invoice
            invoice_updates = {}
            
            # Update email sent status
            if was_modified and not invoice.get('Invoice_Sent__c'):
                invoice_updates['Invoice_Sent__c'] = True
            
            # Update paid status
            is_paid = sage_state in ['paid', 'closed']
            if is_paid and invoice.get('Invoice_Status__c') != 'Paid':
                invoice_updates['Invoice_Status__c'] = 'Paid'
                
                # CRITICAL: Find and mark the linked payment as paid
                # Query for payments linked to this invoice
                payment_query = f"""
                SELECT Id, npe01__Paid__c, npe01__Opportunity__c
                FROM npe01__OppPayment__c
                WHERE Invoice__c = '{invoice['Id']}'
                """
                payment_result = sf.query(payment_query)
                payments = payment_result.get('records', [])
                
                for payment in payments:
                    if not payment.get('npe01__Paid__c'):
                        # Mark payment as paid
                        sf.npe01__OppPayment__c.update(payment['Id'], {
                            'npe01__Paid__c': True,
                            'npe01__Payment_Date__c': datetime.now().strftime('%Y-%m-%d')
                        })
                        payments_updated += 1
                        
                        # Track opportunity for completion check
                        opp_id = payment.get('npe01__Opportunity__c')
                        if opp_id:
                            opportunities_completed.add(opp_id)
            
            # Update invoice in Salesforce if there are changes
            if invoice_updates:
                sf.Invoice__c.update(invoice['Id'], invoice_updates)
                invoices_updated += 1
        
        # Check if any opportunities should be completed
        opps_completed_count = 0
        for opp_id in opportunities_completed:
            # Check if ALL payments for this opportunity are now paid
            check_query = f"""
            SELECT COUNT(Id) total, SUM(CASE WHEN npe01__Paid__c = true THEN 1 ELSE 0 END) paid
            FROM npe01__OppPayment__c
            WHERE npe01__Opportunity__c = '{opp_id}'
            """
            # Note: SOQL doesn't support CASE in SELECT, so we need a different approach
            
            all_payments_query = f"""
            SELECT Id, npe01__Paid__c
            FROM npe01__OppPayment__c
            WHERE npe01__Opportunity__c = '{opp_id}'
            """
            all_payments_result = sf.query(all_payments_query)
            all_payments = all_payments_result.get('records', [])
            
            if all_payments:
                total_payments = len(all_payments)
                paid_payments = sum(1 for p in all_payments if p.get('npe01__Paid__c'))
                
                # If all payments are paid, mark opportunity as complete
                if total_payments == paid_payments:
                    sf.Opportunity.update(opp_id, {
                        'StageName': 'Closed / Completed'
                    })
                    opps_completed_count += 1
        
        return {
            "success": True,
            "message": f"Synced {invoices_updated} invoice(s), {payments_updated} payment(s) marked as paid, {opps_completed_count} opportunity(ies) completed",
            "checked": len(invoices),
            "invoices_updated": invoices_updated,
            "payments_updated": payments_updated,
            "opportunities_completed": opps_completed_count
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })

