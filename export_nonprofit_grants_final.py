#!/usr/bin/env python3
"""
Export ALL nonprofit grant invoices (excluding Pursuit Bond students).

FILTER CRITERIA:
- CUSTTYPE != 'Pursuit Bond' (exclude students)
- MEGAENTITYID != 'PBC' (nonprofit only)
- MODULEKEY = '4.AR' (accounts receivable / philanthropy)
"""

import asyncio
import pandas as pd
from datetime import datetime
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def get_all_customers(sage_service):
    """Get all customers with their types."""
    print("\n📊 Fetching all customers...")
    
    all_customers = {}
    
    # Use the existing get_customers method with high limit
    response = await sage_service.get_customers(limit=10000)
    
    if not response.get('success'):
        print("⚠️  Failed to fetch customers")
        return all_customers
    
    data = response.get('data', {})
    
    if isinstance(data, dict) and 'customer' in data:
        customers = data['customer']
        if isinstance(customers, list):
            for cust in customers:
                cust_id = cust.get('CUSTOMERID')
                all_customers[cust_id] = {
                    'name': cust.get('NAME'),
                    'custtype': cust.get('CUSTTYPE') or 'No Type'
                }
        elif isinstance(customers, dict):
            cust_id = customers.get('CUSTOMERID')
            all_customers[cust_id] = {
                'name': customers.get('NAME'),
                'custtype': customers.get('CUSTTYPE') or 'No Type'
            }
    
    print(f"✅ Got {len(all_customers)} total customers")
    
    # Show breakdown by type
    type_counts = {}
    for cust in all_customers.values():
        cust_type = cust['custtype']
        type_counts[cust_type] = type_counts.get(cust_type, 0) + 1
    
    print("\n📊 Customer Type Breakdown:")
    for cust_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cust_type:<30} {count:>4} customers")
    
    return all_customers


async def get_all_grant_invoices(sage_service, customers_by_id):
    """Get ALL nonprofit grant invoices (excluding Pursuit Bond)."""
    print("\n📊 Fetching all invoices...")
    
    all_invoices = []
    offset = 0
    limit = 1000
    max_invoices = 100000  # Safety limit
    
    while len(all_invoices) < max_invoices:
        print(f"   Fetching invoices {offset} to {offset + limit}... ({len(all_invoices)} so far)")
        
        response = await sage_service.get_invoices(limit=limit)
        
        if not response.get('success'):
            print(f"   ⚠️  API error, stopping pagination")
            break
        
        data = response.get('data', {})
        
        if isinstance(data, dict) and 'arinvoice' in data:
            invoices = data['arinvoice']
        elif isinstance(data, list):
            invoices = data
        else:
            break
        
        if not invoices:
            break
        
        if isinstance(invoices, dict):
            invoices = [invoices]
        
        all_invoices.extend(invoices)
        
        if len(invoices) < limit:
            break
        
        offset += limit
    
    print(f"✅ Got {len(all_invoices)} total invoices")
    
    # Filter for nonprofit grants (exclude Pursuit Bond students)
    print("\n🔍 Filtering for nonprofit grant invoices...")
    
    grant_invoices = []
    
    for inv in all_invoices:
        module_key = inv.get('MODULEKEY')
        entity_id = inv.get('MEGAENTITYID')
        customer_id = inv.get('CUSTOMERID')
        
        # Get customer type
        customer_info = customers_by_id.get(customer_id, {})
        cust_type = customer_info.get('custtype', 'Unknown')
        
        # FILTER CRITERIA
        is_ar_module = module_key == '4.AR'  # Accounts Receivable / Philanthropy
        is_not_pbc = entity_id != 'PBC'  # Nonprofit only
        is_not_student = cust_type != 'Pursuit Bond'  # Exclude students
        
        if is_ar_module and is_not_pbc and is_not_student:
            grant_invoices.append({
                'invoice_id': inv.get('RECORDNO'),
                'invoice_number': inv.get('DOCNUMBER'),
                'customer_id': customer_id,
                'customer_name': inv.get('CUSTOMERNAME'),
                'customer_type': cust_type,
                'amount': float(str(inv.get('TOTALENTERED', '0')).replace(',', '')),
                'due_amount': float(str(inv.get('TOTALDUE', '0')).replace(',', '')),
                'invoice_date': inv.get('WHENCREATED'),
                'due_date': inv.get('WHENDUE'),
                'state': inv.get('STATE'),
                'description': inv.get('DESCRIPTION', ''),
                'entity_id': entity_id or 'PURSUIT',
                'entity_name': inv.get('MEGAENTITYNAME', 'Pursuit Transformation Company'),
                'module_key': module_key
            })
    
    print(f"✅ Found {len(grant_invoices)} nonprofit grant invoices")
    
    # Show breakdown by customer type
    type_counts = {}
    type_totals = {}
    
    for inv in grant_invoices:
        cust_type = inv['customer_type']
        type_counts[cust_type] = type_counts.get(cust_type, 0) + 1
        type_totals[cust_type] = type_totals.get(cust_type, 0) + inv['amount']
    
    print("\n📊 Grant Invoice Breakdown by Customer Type:")
    for cust_type in sorted(type_counts.keys()):
        count = type_counts[cust_type]
        total = type_totals[cust_type]
        avg = total / count if count > 0 else 0
        print(f"   {cust_type:<30} {count:>4} invoices | ${total:>12,.2f} | avg ${avg:>10,.2f}")
    
    return grant_invoices


async def main():
    """Export all nonprofit grant invoices."""
    
    print("\n" + "=" * 80)
    print("  EXPORTING ALL NONPROFIT GRANT INVOICES")
    print("  (Excluding Pursuit Bond Students)")
    print("=" * 80)
    
    # Initialize
    class MockClient:
        available_tools = {}
    
    client = MockClient()
    
    print("\n🔐 Authenticating...")
    sage = SageIntacctMCPService(
        client=client,
        company_id="pursuit",
        user_id="Pursuit Systems",
        user_password="Queenstech!23",
        sender_id="pursuit",
        sender_password="Pursuit1234!"
    )
    
    if not await sage.authenticate():
        print("❌ Authentication failed!")
        return
    
    print("✅ Authenticated!")
    
    # Step 1: Get all customers
    customers_by_id = await get_all_customers(sage)
    
    # Step 2: Get and filter invoices
    grant_invoices = await get_all_grant_invoices(sage, customers_by_id)
    
    # Step 3: Export to CSV
    print("\n📝 Exporting to CSV...")
    
    if grant_invoices:
        df = pd.DataFrame(grant_invoices)
        
        # Sort by date (most recent first)
        df = df.sort_values('invoice_date', ascending=False)
        
        # Export
        csv_filename = 'nonprofit_grant_invoices.csv'
        df.to_csv(csv_filename, index=False)
        
        print(f"✅ Exported {len(grant_invoices)} invoices to {csv_filename}")
        
        # Show summary
        print("\n" + "=" * 80)
        print("  SUMMARY")
        print("=" * 80)
        
        total_amount = df['amount'].sum()
        total_due = df['due_amount'].sum()
        
        print(f"""
📊 Grant Invoice Statistics:
   • Total Invoices: {len(grant_invoices):,}
   • Total Amount: ${total_amount:,.2f}
   • Total Due: ${total_due:,.2f}
   • Date Range: {df['invoice_date'].min()} to {df['invoice_date'].max()}
   
📁 File: {csv_filename}

🎯 NEXT STEP:
   1. Run the matching UI: python3 matching_ui.py
   2. Open http://localhost:5000
   3. Match these {len(grant_invoices)} grant invoices to Salesforce opportunities
   
✅ Filter Applied:
   • MODULEKEY = '4.AR' (Accounts Receivable / Grants)
   • CUSTTYPE != 'Pursuit Bond' (Excluded students)
   • MEGAENTITYID != 'PBC' (Nonprofit only)
""")
        
        # Show sample
        print("\n📋 Sample Grant Invoices:")
        print(df[['customer_name', 'customer_type', 'amount', 'invoice_date']].head(10).to_string(index=False))
    else:
        print("⚠️  No grant invoices found matching the criteria")


if __name__ == "__main__":
    asyncio.run(main())

