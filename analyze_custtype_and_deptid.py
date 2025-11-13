#!/usr/bin/env python3
"""
Analyze CUSTTYPE (customer level) and DEPARTMENTID (line item level)
to identify students vs grants.
"""

import asyncio
from collections import Counter
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Analyze customer types and department IDs."""
    
    print("\n" + "=" * 80)
    print("  ANALYZING CUSTOMER TYPES AND DEPARTMENT IDS")
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
    
    print("✅ Authenticated!\n")
    
    # Get customers with types
    print("=" * 80)
    print("  1. CUSTOMER TYPES")
    print("=" * 80)
    
    print("\n📊 Fetching customers...")
    customers_response = await sage.get_customers(limit=500)
    
    customers_by_id = {}
    custtype_breakdown = Counter()
    
    if customers_response.get('success'):
        data = customers_response.get('data', {})
        
        if isinstance(data, dict) and 'customer' in data:
            customers = data['customer']
            if isinstance(customers, list):
                print(f"✅ Got {len(customers)} customers\n")
                
                for cust in customers:
                    cust_id = cust.get('CUSTOMERID')
                    cust_type = cust.get('CUSTTYPE') or 'No Type'
                    cust_type_key = cust.get('CUSTTYPEKEY', '')
                    
                    customers_by_id[cust_id] = {
                        'name': cust.get('NAME'),
                        'custtype': cust_type,
                        'custtypekey': cust_type_key
                    }
                    
                    custtype_breakdown[cust_type] += 1
                
                print("📊 CUSTOMER TYPE Breakdown:\n")
                for cust_type, count in custtype_breakdown.most_common():
                    print(f"   {cust_type:<30} {count:>4} customers")
    
    # Get invoices and join with customer types
    print("\n" + "=" * 80)
    print("  2. INVOICES BY CUSTOMER TYPE")
    print("=" * 80)
    
    print("\n📊 Fetching invoices...")
    invoices_response = await sage.get_invoices(limit=1000)
    
    if not invoices_response.get('success'):
        print("❌ Failed to fetch invoices")
        return
    
    data = invoices_response.get('data', {})
    
    if isinstance(data, dict) and 'arinvoice' in data:
        invoices = data['arinvoice']
    elif isinstance(data, list):
        invoices = data
    else:
        invoices = []
    
    print(f"✅ Got {len(invoices)} invoices\n")
    
    # Analyze by customer type
    type_breakdown = {}
    
    for inv in invoices:
        cust_id = inv.get('CUSTOMERID')
        cust_info = customers_by_id.get(cust_id, {})
        cust_type = cust_info.get('custtype', 'Unknown')
        
        if cust_type not in type_breakdown:
            type_breakdown[cust_type] = {
                'count': 0,
                'total': 0,
                'samples': []
            }
        
        type_breakdown[cust_type]['count'] += 1
        
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
            type_breakdown[cust_type]['total'] += amount
        except:
            pass
        
        if len(type_breakdown[cust_type]['samples']) < 3:
            type_breakdown[cust_type]['samples'].append({
                'customer': inv.get('CUSTOMERNAME'),
                'amount': inv.get('TOTALENTERED')
            })
    
    print("📊 INVOICES by CUSTOMER TYPE:\n")
    for cust_type in sorted(type_breakdown.keys()):
        data = type_breakdown[cust_type]
        avg = data['total'] / data['count'] if data['count'] > 0 else 0
        
        print(f"\n{'─' * 80}")
        print(f"CUSTOMER TYPE: {cust_type}")
        print(f"{'─' * 80}")
        print(f"  Invoices: {data['count']} ({data['count']/len(invoices)*100:.1f}%)")
        print(f"  Total: ${data['total']:,.2f}")
        print(f"  Average: ${avg:,.2f}")
        print(f"  Sample Customers:")
        for sample in data['samples']:
            print(f"    • {sample['customer']:<40} ${sample['amount']}")
    
    # Check line items for DEPARTMENTID
    print("\n" + "=" * 80)
    print("  3. LINE ITEM DEPARTMENT IDs")
    print("=" * 80)
    
    print("\n📊 Fetching line items...")
    function_xml = """
    <function controlid="get-line-items">
        <readByQuery>
            <object>ARINVOICEITEM</object>
            <query></query>
            <fields>RECORDNO,CUSTOMERID,CUSTOMERNAME,AMOUNT,DEPARTMENTID,DEPARTMENTNAME,ACCOUNTTITLE,CLASSID,CLASSNAME</fields>
            <pagesize>500</pagesize>
        </readByQuery>
    </function>"""
    
    response = await sage._make_api_request(function_xml)
    
    if response.get('success'):
        data = response.get('data', {})
        
        if isinstance(data, dict) and 'arinvoiceitem' in data:
            items = data['arinvoiceitem']
            if isinstance(items, list):
                print(f"✅ Got {len(items)} line items\n")
                
                # Analyze by DEPARTMENTID
                dept_breakdown = {}
                
                for item in items:
                    dept_id = item.get('DEPARTMENTID') or 'No Dept'
                    dept_name = item.get('DEPARTMENTNAME') or ''
                    
                    if dept_id not in dept_breakdown:
                        dept_breakdown[dept_id] = {
                            'name': dept_name,
                            'count': 0,
                            'total': 0,
                            'samples': []
                        }
                    
                    dept_breakdown[dept_id]['count'] += 1
                    
                    try:
                        amount = float(str(item.get('AMOUNT', '0')).replace(',', ''))
                        dept_breakdown[dept_id]['total'] += amount
                    except:
                        pass
                    
                    if len(dept_breakdown[dept_id]['samples']) < 3:
                        dept_breakdown[dept_id]['samples'].append({
                            'customer': item.get('CUSTOMERNAME'),
                            'amount': item.get('AMOUNT'),
                            'account': item.get('ACCOUNTTITLE')
                        })
                
                print("📊 LINE ITEMS by DEPARTMENTID:\n")
                for dept_id in sorted(dept_breakdown.keys()):
                    data = dept_breakdown[dept_id]
                    avg = data['total'] / data['count'] if data['count'] > 0 else 0
                    
                    print(f"\n{'─' * 80}")
                    print(f"DEPARTMENT: {dept_id} - {data['name']}")
                    print(f"{'─' * 80}")
                    print(f"  Line Items: {data['count']} ({data['count']/len(items)*100:.1f}%)")
                    print(f"  Total: ${data['total']:,.2f}")
                    print(f"  Average: ${avg:,.2f}")
                    print(f"  Sample Line Items:")
                    for sample in data['samples']:
                        print(f"    • {sample['customer']:<35} ${str(sample['amount']):<12} {sample['account']}")
    
    # Summary
    print("\n" + "=" * 80)
    print("  CONCLUSION")
    print("=" * 80)
    print("""
✅ FOUND TWO WAYS TO FILTER:

METHOD 1: By CUSTOMER TYPE (invoice level)
   • CUSTTYPE = "Pursuit Bond" → Students
   • Other types → Grants/Philanthropy

METHOD 2: By DEPARTMENTID (line item level)
   • Check if DEPARTMENTID = '304' → Students (Pursuit Bond)
   • Other departments → Grants

RECOMMENDED FILTER FOR NONPROFIT GRANTS:
   WHERE:
     MODULEKEY = '4.AR'                    (Accounts Receivable)
     AND CUSTTYPE != 'Pursuit Bond'        (Exclude students)
     AND MEGAENTITYID != 'PBC'             (Keep only nonprofit)

Please confirm:
1. Is CUSTTYPE = "Pursuit Bond" correct for students?
2. Is DEPARTMENTID = '304' also students?
3. Which method should we use?
""")


if __name__ == "__main__":
    asyncio.run(main())

