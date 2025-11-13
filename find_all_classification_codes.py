#!/usr/bin/env python3
"""
Find ALL classification codes including:
- DEPARTMENT codes
- MODULEKEY codes  
- MEGAENTITY codes
- Any other classification fields
"""

import asyncio
from collections import Counter
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Find all classification codes."""
    
    print("\n" + "=" * 80)
    print("  FINDING ALL CLASSIFICATION CODES")
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
    
    # Get sample of 2000 invoices for good coverage
    print("📊 Fetching 2000 invoices for classification analysis...")
    response = await sage.get_invoices(limit=2000)
    
    if not response.get('success'):
        print("❌ Failed to fetch invoices")
        return
    
    data = response.get('data', {})
    
    if isinstance(data, dict) and 'arinvoice' in data:
        invoices = data['arinvoice']
    elif isinstance(data, list):
        invoices = data
    else:
        invoices = []
    
    print(f"✅ Got {len(invoices)} invoices\n")
    
    # Get first invoice to check field names
    if invoices:
        first_invoice = invoices[0]
        dept_fields = [f for f in first_invoice.keys() if 'dept' in f.lower() or 'department' in f.lower()]
        print(f"🔍 Found {len(dept_fields)} department-related fields: {dept_fields}\n")
    
    # Analyze DEPARTMENT codes
    print("=" * 80)
    print("  1. DEPARTMENT CODES")
    print("=" * 80)
    
    dept_breakdown = {}
    
    for inv in invoices:
        # Try different possible field names
        dept = inv.get('DEPARTMENT') or inv.get('DEPARTMENTID') or inv.get('DEPT')
        
        if not dept or dept in ['None', '', 'null']:
            dept = 'No Department'
        else:
            dept = str(dept)
        
        if dept not in dept_breakdown:
            dept_breakdown[dept] = {
                'count': 0,
                'total_amount': 0,
                'sample_customers': set(),
                'sample_amounts': []
            }
        
        dept_breakdown[dept]['count'] += 1
        
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
            dept_breakdown[dept]['total_amount'] += amount
            
            if len(dept_breakdown[dept]['sample_amounts']) < 3:
                dept_breakdown[dept]['sample_amounts'].append(amount)
        except:
            pass
        
        customer = inv.get('CUSTOMERNAME', 'Unknown')
        if len(dept_breakdown[dept]['sample_customers']) < 3:
            dept_breakdown[dept]['sample_customers'].add(customer)
    
    print(f"\n📊 DEPARTMENT Code Distribution:\n")
    
    for dept in sorted(dept_breakdown.keys()):
        data = dept_breakdown[dept]
        print(f"\n{'─' * 80}")
        print(f"DEPARTMENT: {dept}")
        print(f"{'─' * 80}")
        print(f"  Count: {data['count']} invoices ({data['count']/len(invoices)*100:.1f}%)")
        print(f"  Total Amount: ${data['total_amount']:,.2f}")
        print(f"  Average: ${data['total_amount']/data['count']:,.2f}")
        print(f"  Sample Customers: {', '.join(list(data['sample_customers'])[:3])}")
        print(f"  Sample Amounts: {', '.join(f'${a:,.2f}' for a in data['sample_amounts'])}")
    
    # Analyze MODULEKEY
    print("\n\n" + "=" * 80)
    print("  2. MODULEKEY CODES")
    print("=" * 80)
    
    module_breakdown = Counter()
    module_amounts = {}
    
    for inv in invoices:
        module = inv.get('MODULEKEY', 'Unknown')
        module_breakdown[module] += 1
        
        if module not in module_amounts:
            module_amounts[module] = 0
        
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
            module_amounts[module] += amount
        except:
            pass
    
    print(f"\n📊 MODULEKEY Distribution:\n")
    for module, count in module_breakdown.most_common():
        total = module_amounts.get(module, 0)
        avg = total / count if count > 0 else 0
        print(f"  {module:<10} {count:>6} invoices ({count/len(invoices)*100:>5.1f}%) | "
              f"${total:>14,.2f} total | ${avg:>10,.2f} avg")
    
    # Analyze MEGAENTITY
    print("\n\n" + "=" * 80)
    print("  3. MEGAENTITY CODES (Nonprofit vs PBC)")
    print("=" * 80)
    
    entity_breakdown = Counter()
    entity_amounts = {}
    entity_names = {}
    
    for inv in invoices:
        entity_id = inv.get('MEGAENTITYID')
        entity_name = inv.get('MEGAENTITYNAME')
        
        if not entity_id or entity_id in ['None', '', 'null']:
            entity_id = 'No Entity'
            entity_name = 'No Entity'
        
        entity_breakdown[entity_id] += 1
        entity_names[entity_id] = entity_name
        
        if entity_id not in entity_amounts:
            entity_amounts[entity_id] = 0
        
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
            entity_amounts[entity_id] += amount
        except:
            pass
    
    print(f"\n📊 MEGAENTITY Distribution:\n")
    for entity_id, count in entity_breakdown.most_common():
        entity_name = entity_names.get(entity_id, '')
        total = entity_amounts.get(entity_id, 0)
        print(f"  {entity_id:<15} ({entity_name:<40}) {count:>6} invoices | ${total:>12,.2f}")
    
    # Combined analysis
    print("\n\n" + "=" * 80)
    print("  4. RECOMMENDED FILTERING FOR NONPROFIT PHILANTHROPY")
    print("=" * 80)
    
    # Find philanthropy grants from nonprofit
    nonprofit_philanthropy = []
    
    for inv in invoices:
        dept = str(inv.get('DEPARTMENT', 'None'))
        module = inv.get('MODULEKEY', '')
        entity_id = inv.get('MEGAENTITYID', '')
        
        # Filter logic
        is_philanthropy = (
            module == '4.AR' and  # Philanthropy module
            dept != '304' and  # NOT Pursuit Bond (students)
            entity_id != 'PBC'  # NOT the PBC entity
        )
        
        if is_philanthropy:
            nonprofit_philanthropy.append(inv)
    
    total_phil_amount = sum(float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) 
                            for inv in nonprofit_philanthropy)
    
    print(f"""
✅ FILTER CRITERIA FOR NONPROFIT PHILANTHROPY GRANTS:

   WHERE:
     MODULEKEY = '4.AR'            (Accounts Receivable / Philanthropy)
     AND DEPARTMENT != '304'        (Exclude Pursuit Bond / Students)
     AND MEGAENTITYID != 'PBC'      (Exclude PBC, keep Nonprofit)

   RESULTS (in sample of {len(invoices)} invoices):
     • {len(nonprofit_philanthropy)} philanthropy grant invoices
     • ${total_phil_amount:,.2f} total amount
     • Avg ${total_phil_amount/len(nonprofit_philanthropy):,.2f} per invoice
     
   Sample customers:
""")
    
    for inv in nonprofit_philanthropy[:10]:
        print(f"     • {inv.get('CUSTOMERNAME'):<50} ${inv.get('TOTALENTERED'):>12}")
    
    if len(nonprofit_philanthropy) > 10:
        print(f"     ... and {len(nonprofit_philanthropy) - 10} more")
    
    print(f"""

🎯 NEXT STEP:
   Run the full export with these filters to get ALL nonprofit philanthropy grants
   from 2019-2025!
""")


if __name__ == "__main__":
    asyncio.run(main())

