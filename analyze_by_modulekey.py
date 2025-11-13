#!/usr/bin/env python3
"""
Analyze invoices by MODULEKEY to understand grant vs student classification.
Also look for nonprofit vs PBC indicators.
"""

import asyncio
from collections import Counter
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Analyze invoice classification."""
    
    print("\n" + "=" * 80)
    print("  ANALYZING INVOICE CLASSIFICATION BY MODULEKEY")
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
    
    # Get larger sample
    print("📊 Fetching 1000 invoices for analysis...")
    response = await sage.get_invoices(limit=1000)
    
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
    
    # Analyze by MODULEKEY
    print("=" * 80)
    print("  BREAKDOWN BY MODULEKEY")
    print("=" * 80)
    
    by_module = {}
    
    for inv in invoices:
        module = inv.get('MODULEKEY', 'Unknown')
        
        if module not in by_module:
            by_module[module] = {
                'count': 0,
                'total_amount': 0,
                'sample_customers': set(),
                'sample_amounts': []
            }
        
        by_module[module]['count'] += 1
        
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
            by_module[module]['total_amount'] += amount
            
            if len(by_module[module]['sample_amounts']) < 5:
                by_module[module]['sample_amounts'].append(amount)
        except:
            pass
        
        customer = inv.get('CUSTOMERNAME', 'Unknown')
        if len(by_module[module]['sample_customers']) < 5:
            by_module[module]['sample_customers'].add(customer)
    
    print(f"\n📊 Found {len(by_module)} different MODULE types:\n")
    
    for module, data in sorted(by_module.items(), key=lambda x: x[1]['count'], reverse=True):
        print(f"\n{'=' * 80}")
        print(f"MODULE: {module}")
        print(f"{'=' * 80}")
        print(f"  Count: {data['count']} invoices")
        print(f"  Total Amount: ${data['total_amount']:,.2f}")
        print(f"  Average Amount: ${data['total_amount']/data['count']:,.2f}")
        print(f"\n  Sample Customers:")
        for customer in list(data['sample_customers'])[:5]:
            print(f"    • {customer}")
        print(f"\n  Sample Amounts:")
        for amt in sorted(data['sample_amounts'], reverse=True):
            print(f"    • ${amt:,.2f}")
    
    # Look for entity/PBC indicators in customers
    print("\n\n" + "=" * 80)
    print("  LOOKING FOR NONPROFIT vs PBC INDICATORS")
    print("=" * 80)
    
    # Check customer names for PBC keywords
    pbc_keywords = ['pbc', 'transformation', 'benefit corp', 'public benefit']
    potential_pbc = []
    
    for inv in invoices:
        customer = inv.get('CUSTOMERNAME', '').lower()
        for keyword in pbc_keywords:
            if keyword in customer:
                potential_pbc.append(inv)
                break
    
    print(f"\n🔍 Found {len(potential_pbc)} invoices with PBC-related customer names:")
    for inv in potential_pbc[:10]:
        print(f"   • {inv.get('CUSTOMERNAME')} - ${inv.get('TOTALENTERED')}")
    
    # Check for entity fields
    megaentity_values = Counter()
    for inv in invoices:
        entity_id = inv.get('MEGAENTITYID')
        entity_name = inv.get('MEGAENTITYNAME')
        if entity_id and entity_id not in ['None', '', 'null']:
            megaentity_values[f"{entity_name} ({entity_id})"] += 1
    
    if megaentity_values:
        print(f"\n📊 MEGAENTITY distribution:")
        for entity, count in megaentity_values.most_common():
            print(f"   {entity}: {count} invoices")
    else:
        print(f"\n⚠️  MEGAENTITY fields are empty - need to ask user how to identify nonprofit vs PBC")
    
    # Recommendations
    print("\n" + "=" * 80)
    print("  RECOMMENDATIONS")
    print("=" * 80)
    print(f"""
Based on the analysis above:

1. FOR PHILANTHROPY/GRANTS:
   Filter by: MODULEKEY = '4.AR' (if that's the grants module)
   
   This would give you:
   • {by_module.get('4.AR', {}).get('count', 0)} invoices
   • ${by_module.get('4.AR', {}).get('total_amount', 0):,.2f} total

2. FOR STUDENTS:
   Filter by: MODULEKEY = '8.SO' (if that's the student module)
   
   This would give you:
   • {by_module.get('8.SO', {}).get('count', 0)} invoices
   • ${by_module.get('8.SO', {}).get('total_amount', 0):,.2f} total

3. FOR NONPROFIT vs PBC:
   Need your input! Options:
   a) Customer name contains "PBC" or "Transformation"?
   b) Specific customer IDs to exclude?
   c) Different field entirely?

Please confirm which MODULEKEY value(s) represent philanthropy grants!
""")


if __name__ == "__main__":
    asyncio.run(main())

