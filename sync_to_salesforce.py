#!/usr/bin/env python3
"""
Sync invoice-to-opportunity matches to Salesforce.

Creates/updates Grant_Invoice__c records from invoice_opportunity_matches.json.
"""

import asyncio
import json
import os
from datetime import datetime
from typing import Dict, List
from mcp_client.client import MCPClient


def load_matches() -> Dict:
    """Load invoice-opportunity matches from JSON."""
    matches_file = 'invoice_opportunity_matches.json'
    
    if os.path.exists(matches_file):
        with open(matches_file, 'r') as f:
            return json.load(f)
    return {}


def load_invoices() -> Dict:
    """Load invoice data from CSV."""
    import pandas as pd
    
    csv_file = 'nonprofit_grant_invoices.csv'
    
    if not os.path.exists(csv_file):
        print(f"❌ Invoice CSV not found: {csv_file}")
        return {}
    
    df = pd.read_csv(csv_file)
    
    # Create lookup dict by invoice_id
    invoices = {}
    for _, row in df.iterrows():
        invoice_id = str(row['invoice_id'])
        invoices[invoice_id] = row.to_dict()
    
    return invoices


async def create_grant_invoice_record(salesforce_service, invoice_data: Dict, match_data: Dict) -> Dict:
    """
    Create a Grant_Invoice__c record in Salesforce.
    
    Args:
        salesforce_service: Salesforce MCP service
        invoice_data: Invoice details from Sage Intacct
        match_data: Match metadata (opportunity_id, confidence, notes)
    
    Returns:
        Result of the create operation
    """
    
    # Map invoice status
    status = invoice_data.get('state', 'Posted')
    amount_due = invoice_data.get('due_amount', 0)
    invoice_amount = invoice_data.get('amount', 0)
    amount_paid = invoice_amount - amount_due
    
    # Determine picklist status
    if status == 'Draft':
        status_value = 'Draft'
    elif status == 'Voided':
        status_value = 'Voided'
    elif amount_due <= 0:
        status_value = 'Paid'
    elif amount_paid > 0:
        status_value = 'Partially Paid'
    else:
        status_value = 'Posted'
    
    # Prepare Grant_Invoice__c record
    grant_invoice = {
        'Opportunity__c': match_data.get('opportunity_id'),
        'Sage_Invoice_ID__c': str(invoice_data.get('invoice_id')),
        'Sage_Invoice_Number__c': invoice_data.get('invoice_number', ''),
        'Invoice_Amount__c': float(invoice_amount),
        'Amount_Paid__c': float(amount_paid),
        'Amount_Due__c': float(amount_due),
        'Invoice_Date__c': invoice_data.get('invoice_date'),
        'Due_Date__c': invoice_data.get('due_date'),
        'Status__c': status_value,
        'Customer_Name__c': invoice_data.get('customer_name', ''),
        'Customer_Type__c': invoice_data.get('customer_type', ''),
        'Description__c': invoice_data.get('description', ''),
        'Sage_Entity__c': invoice_data.get('entity_name', ''),
        'Match_Confidence__c': match_data.get('confidence', 'Confirmed'),
        'Match_Notes__c': match_data.get('notes', ''),
        'Last_Synced__c': datetime.now().isoformat()
    }
    
    # Remove None values
    grant_invoice = {k: v for k, v in grant_invoice.items() if v is not None}
    
    # Create or update record (upsert on Sage_Invoice_ID__c)
    try:
        # Try to upsert using external ID
        result = await salesforce_service.upsert_record(
            'Grant_Invoice__c',
            'Sage_Invoice_ID__c',
            str(invoice_data.get('invoice_id')),
            grant_invoice
        )
        return result
    except Exception as e:
        print(f"❌ Error upserting Grant_Invoice__c: {e}")
        
        # Fallback: Try to find existing record and update, or create new
        try:
            # Search for existing record
            query = f"SELECT Id FROM Grant_Invoice__c WHERE Sage_Invoice_ID__c = '{invoice_data.get('invoice_id')}'"
            existing = await salesforce_service.query(query)
            
            if existing and existing.get('records') and len(existing['records']) > 0:
                # Update existing
                record_id = existing['records'][0]['Id']
                result = await salesforce_service.update_record('Grant_Invoice__c', record_id, grant_invoice)
                return {'success': True, 'id': record_id, 'action': 'updated'}
            else:
                # Create new
                result = await salesforce_service.create_record('Grant_Invoice__c', grant_invoice)
                return {'success': True, 'id': result.get('id'), 'action': 'created'}
        
        except Exception as e2:
            return {'success': False, 'error': str(e2)}


async def sync_matches_to_salesforce():
    """Main sync function."""
    
    print("\n" + "=" * 80)
    print("  SYNCING INVOICE MATCHES TO SALESFORCE")
    print("=" * 80)
    
    # Load matches
    print("\n📂 Loading matches from invoice_opportunity_matches.json...")
    matches = load_matches()
    
    if not matches:
        print("⚠️  No matches found. Please use the matching UI first.")
        return
    
    print(f"✅ Found {len(matches)} invoice-opportunity matches")
    
    # Load invoice data
    print("\n📂 Loading invoice data from nonprofit_grant_invoices.csv...")
    invoices = load_invoices()
    
    if not invoices:
        print("❌ No invoice data found")
        return
    
    print(f"✅ Loaded {len(invoices)} invoices")
    
    # Initialize Salesforce
    print("\n🔐 Connecting to Salesforce...")
    client = MCPClient()
    await client.connect()
    
    salesforce_service = client.get_service('salesforce')
    
    if not salesforce_service:
        print("❌ Salesforce service not available")
        return
    
    print("✅ Connected to Salesforce!")
    
    # Sync each match
    print("\n🔄 Syncing matches to Salesforce...\n")
    
    results = {
        'created': 0,
        'updated': 0,
        'failed': 0,
        'errors': []
    }
    
    for invoice_id, match_data in matches.items():
        invoice_data = invoices.get(invoice_id)
        
        if not invoice_data:
            print(f"⚠️  Invoice {invoice_id} not found in CSV, skipping")
            results['failed'] += 1
            continue
        
        opportunity_id = match_data.get('opportunity_id')
        customer_name = invoice_data.get('customer_name')
        amount = invoice_data.get('amount', 0)
        
        print(f"   Syncing: Invoice {invoice_id} → Opportunity {opportunity_id}")
        print(f"            {customer_name} - ${amount:,.2f}")
        
        result = await create_grant_invoice_record(salesforce_service, invoice_data, match_data)
        
        if result.get('success'):
            action = result.get('action', 'synced')
            if action == 'created':
                results['created'] += 1
                print(f"            ✅ Created Grant_Invoice__c: {result.get('id')}")
            else:
                results['updated'] += 1
                print(f"            ✅ Updated Grant_Invoice__c: {result.get('id')}")
        else:
            results['failed'] += 1
            error = result.get('error', 'Unknown error')
            results['errors'].append({
                'invoice_id': invoice_id,
                'error': error
            })
            print(f"            ❌ Failed: {error}")
        
        print()
    
    # Summary
    print("=" * 80)
    print("  SYNC SUMMARY")
    print("=" * 80)
    print(f"""
📊 Results:
   • Created: {results['created']} Grant_Invoice__c records
   • Updated: {results['updated']} Grant_Invoice__c records
   • Failed: {results['failed']} records
   • Total: {len(matches)} matches processed
""")
    
    if results['errors']:
        print("\n❌ Errors:")
        for error in results['errors'][:10]:  # Show first 10
            print(f"   • Invoice {error['invoice_id']}: {error['error']}")
        
        if len(results['errors']) > 10:
            print(f"   ... and {len(results['errors']) - 10} more errors")
    
    print("\n✅ Sync complete!")
    print("\n💡 Next Steps:")
    print("   1. Open Salesforce and view an Opportunity")
    print("   2. Check the 'Grant Invoices' related list")
    print("   3. Verify invoice data is correct")
    
    await client.disconnect()


if __name__ == "__main__":
    asyncio.run(sync_matches_to_salesforce())

