#!/usr/bin/env python3
"""
Improved export of nonprofit grant invoices with better filtering.

FILTER LOGIC:
- Include: MODULEKEY = '4.AR' (Accounts Receivable / Philanthropy)
- Exclude: MODULEKEY = '8.SO' (Sales Order / Students)
- Exclude: CUSTTYPE = 'Pursuit Bond' (Student customers)
- Exclude: MEGAENTITYID = 'PBC' (PBC entity)
- Also check line items for DEPARTMENTID = 304 (Pursuit Bond) as extra verification
"""

import asyncio
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def get_all_customers(sage_service):
    """Get all customers with their types."""
    print("\n📊 Fetching all customers...")
    
    response = await sage_service.get_customers(limit=10000)
    
    customers_by_id = {}
    
    if response.get('success'):
        data = response.get('data', {})
        
        if isinstance(data, dict) and 'customer' in data:
            customers = data['customer']
            if isinstance(customers, list):
                for cust in customers:
                    cust_id = cust.get('CUSTOMERID')
                    customers_by_id[cust_id] = {
                        'name': cust.get('NAME'),
                        'custtype': cust.get('CUSTTYPE') or 'No Type'
                    }
    
    print(f"✅ Got {len(customers_by_id)} customers")
    
    # Show customer type breakdown
    type_counts = {}
    for cust in customers_by_id.values():
        cust_type = cust['custtype']
        type_counts[cust_type] = type_counts.get(cust_type, 0) + 1
    
    print("\n📊 Customer Type Breakdown:")
    for cust_type, count in sorted(type_counts.items(), key=lambda x: x[1], reverse=True):
        print(f"   {cust_type:<30} {count:>4} customers")
    
    return customers_by_id


async def check_invoice_line_items(sage_service, invoice_id):
    """Check if invoice has line items with DEPARTMENTID = 304 (students)."""
    try:
        function_xml = f"""
        <function controlid="get-line-items">
            <readByQuery>
                <object>ARINVOICEITEM</object>
                <query>RECORDKEY = '{invoice_id}'</query>
                <fields>DEPARTMENTID</fields>
                <pagesize>100</pagesize>
            </readByQuery>
        </function>"""
        
        response = await sage_service._make_api_request(function_xml)
        
        if response.get('success'):
            data = response.get('data', {})
            if isinstance(data, dict) and 'arinvoiceitem' in data:
                items = data['arinvoiceitem']
                if isinstance(items, list):
                    for item in items:
                        dept_id = item.get('DEPARTMENTID')
                        if dept_id == '304':  # Pursuit Bond / Students
                            return True
                elif isinstance(items, dict):
                    dept_id = items.get('DEPARTMENTID')
                    if dept_id == '304':
                        return True
        
        return False
    except:
        return False


async def get_all_grant_invoices(sage_service, customers_by_id):
    """Get ALL nonprofit grant invoices with improved filtering."""
    print("\n📊 Fetching all invoices...")
    
    all_invoices = []
    offset = 0
    limit = 1000
    
    # Fetch all invoices
    while True:
        print(f"   Fetching invoices {offset} to {offset + limit}... ({len(all_invoices)} so far)")
        
        response = await sage_service.get_invoices(limit=limit)
        
        if not response.get('success'):
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
    
    # Apply comprehensive filters
    print("\n🔍 Applying comprehensive filters for nonprofit grants...")
    print("   Criteria:")
    print("   ✓ MODULEKEY = '4.AR' (Accounts Receivable / Philanthropy)")
    print("   ✗ MODULEKEY = '8.SO' (Sales Order / Students)")
    print("   ✗ CUSTTYPE = 'Pursuit Bond' (Student customers)")
    print("   ✗ MEGAENTITYID = 'PBC' (PBC entity)")
    print()
    
    grant_invoices = []
    module_stats = {}
    exclusion_reasons = {}
    
    for inv in all_invoices:
        module_key = inv.get('MODULEKEY')
        entity_id = inv.get('MEGAENTITYID')
        customer_id = inv.get('CUSTOMERID')
        
        # Track module key distribution
        module_stats[module_key] = module_stats.get(module_key, 0) + 1
        
        # Get customer type
        customer_info = customers_by_id.get(customer_id, {})
        cust_type = customer_info.get('custtype', 'Unknown')
        
        # PRIMARY FILTER: Must be AR module (Accounts Receivable / Philanthropy)
        if module_key != '4.AR':
            exclusion_reasons['Wrong Module (not 4.AR)'] = exclusion_reasons.get('Wrong Module (not 4.AR)', 0) + 1
            continue
        
        # EXCLUSION 1: Skip Sales Order module (students)
        if module_key == '8.SO':
            exclusion_reasons['Sales Order (8.SO) - Students'] = exclusion_reasons.get('Sales Order (8.SO) - Students', 0) + 1
            continue
        
        # EXCLUSION 2: Skip PBC entity
        if entity_id == 'PBC':
            exclusion_reasons['PBC Entity'] = exclusion_reasons.get('PBC Entity', 0) + 1
            continue
        
        # EXCLUSION 3: Skip Pursuit Bond customer type
        if cust_type == 'Pursuit Bond':
            exclusion_reasons['Pursuit Bond Customer'] = exclusion_reasons.get('Pursuit Bond Customer', 0) + 1
            continue
        
        # PASSED ALL FILTERS - This is a grant invoice
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
    
    # Show filtering statistics
    print("\n📊 Module Key Distribution (all invoices):")
    for module, count in sorted(module_stats.items(), key=lambda x: x[1], reverse=True):
        print(f"   {module or 'None':<20} {count:>6} invoices")
    
    print("\n📊 Exclusion Reasons:")
    for reason, count in sorted(exclusion_reasons.items(), key=lambda x: x[1], reverse=True):
        print(f"   {reason:<40} {count:>6} invoices")
    
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
        print(f"   {cust_type:<30} {count:>4} invoices | ${total:>14,.2f} | avg ${avg:>10,.2f}")
    
    return grant_invoices


async def main():
    """Export improved nonprofit grant invoices."""
    
    print("\n" + "=" * 80)
    print("  IMPROVED EXPORT: NONPROFIT GRANT INVOICES")
    print("  (Excluding ALL student payments)")
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
    
    # Step 3: Remove duplicates and sort
    print("\n🔧 Removing duplicates and sorting...")
    seen_ids = set()
    unique_invoices = []
    
    for inv in grant_invoices:
        if inv['invoice_id'] not in seen_ids:
            seen_ids.add(inv['invoice_id'])
            unique_invoices.append(inv)
    
    # Sort by date (most recent first)
    from datetime import datetime
    
    def parse_date(date_str):
        try:
            return datetime.strptime(date_str, '%m/%d/%Y')
        except:
            return datetime.min
    
    unique_invoices.sort(key=lambda x: parse_date(x['invoice_date']), reverse=True)
    
    print(f"✅ {len(grant_invoices) - len(unique_invoices)} duplicates removed")
    print(f"✅ {len(unique_invoices)} unique grant invoices")
    
    # Step 4: Export to CSV
    print("\n📝 Exporting to CSV...")
    
    if unique_invoices:
        import pandas as pd
        
        df = pd.DataFrame(unique_invoices)
        
        # Export
        csv_filename = 'nonprofit_grant_invoices.csv'
        df.to_csv(csv_filename, index=False)
        
        print(f"✅ Exported {len(unique_invoices)} invoices to {csv_filename}")
        
        # Show summary
        print("\n" + "=" * 80)
        print("  SUMMARY")
        print("=" * 80)
        
        total_amount = df['amount'].sum()
        total_due = df['due_amount'].sum()
        
        print(f"""
📊 Grant Invoice Statistics:
   • Total Invoices: {len(unique_invoices):,}
   • Total Amount: ${total_amount:,.2f}
   • Total Due: ${total_due:,.2f}
   • Date Range: {df['invoice_date'].min()} to {df['invoice_date'].max()}
   
📁 File: {csv_filename}

✅ Filters Applied:
   • MODULEKEY = '4.AR' (Accounts Receivable / Grants)
   • MODULEKEY != '8.SO' (Excluded Sales Orders / Students)
   • CUSTTYPE != 'Pursuit Bond' (Excluded student customers)
   • MEGAENTITYID != 'PBC' (Nonprofit only)
   • Duplicates removed
   • Sorted by most recent date first
   
🔄 NEXT STEP: Restart your backend server to load the updated CSV
   cd financial_forecasting && lsof -ti:8000 | xargs kill -9; python3 simple_server.py
""")
        
        # Show sample
        print("\n📋 Sample Grant Invoices (Most Recent):")
        print(df[['customer_name', 'customer_type', 'amount', 'invoice_date']].head(10).to_string(index=False))
    else:
        print("⚠️  No grant invoices found matching the criteria")


if __name__ == "__main__":
    asyncio.run(main())


