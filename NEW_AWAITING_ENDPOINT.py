@app.get("/api/finance/awaiting-invoices")
async def get_awaiting_invoices():
    """Get payments that are ready to be invoiced.
    
    Returns individual payment records (not opportunities) that:
    - Belong to opportunities in 'Collecting / In Effect' stage
    - Don't have an invoice yet (Invoice__c is null)
    - Aren't marked as paid yet
    """
    try:
        sf = get_salesforce()
        
        # Query for payments that need invoices
        query = """
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c, npe01__Paid__c,
               npe01__Opportunity__c, npe01__Opportunity__r.Name, 
               npe01__Opportunity__r.Account.Name, npe01__Opportunity__r.CloseDate,
               npe01__Opportunity__r.Owner.Name, npe01__Opportunity__r.StageName,
               Invoice__c
        FROM npe01__OppPayment__c
        WHERE npe01__Opportunity__r.StageName = 'Collecting / In Effect'
        AND Invoice__c = null
        AND npe01__Paid__c = false
        ORDER BY npe01__Scheduled_Date__c ASC
        """
        
        result = sf.query(query)
        
        payments = []
        for record in result.get('records', []):
            payments.append({
                'Id': record['Id'],
                'PaymentAmount': record.get('npe01__Payment_Amount__c', 0),
                'ScheduledDate': record.get('npe01__Scheduled_Date__c'),
                'OpportunityId': record.get('npe01__Opportunity__c'),
                'OpportunityName': record.get('npe01__Opportunity__r', {}).get('Name'),
                'AccountName': record.get('npe01__Opportunity__r', {}).get('Account', {}).get('Name'),
                'OwnerName': record.get('npe01__Opportunity__r', {}).get('Owner', {}).get('Name'),
                'CloseDate': record.get('npe01__Opportunity__r', {}).get('CloseDate'),
                'HasInvoice': record.get('Invoice__c') is not None,
                'IsPaid': record.get('npe01__Paid__c', False)
            })
        
        return {
            "success": True,
            "count": len(payments),
            "payments": payments,
            "summary": {
                "total_amount": sum(p['PaymentAmount'] for p in payments)
            }
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })

