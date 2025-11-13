#!/usr/bin/env python3
"""
Examine the actual invoice structure to find:
1. Category/type codes (to identify philanthropy/grants vs students)
2. Organization/entity codes (to separate nonprofit vs PBC)
3. Any other classification fields
"""

import asyncio
import json
from collections import Counter
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Examine invoice data structure."""
    
    print("\n" + "=" * 80)
    print("  EXAMINING SAGE INTACCT DATA STRUCTURE")
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
    
    # Get sample invoices
    print("📊 Fetching sample invoices to examine structure...")
    response = await sage.get_invoices(limit=100)
    
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
    
    if not invoices:
        print("❌ No invoices found")
        return
    
    print(f"✅ Got {len(invoices)} sample invoices\n")
    
    # Get ALL field names from first invoice
    print("=" * 80)
    print("  ALL AVAILABLE FIELDS IN INVOICE RECORDS")
    print("=" * 80)
    
    if invoices:
        first_invoice = invoices[0]
        all_fields = sorted(first_invoice.keys())
        
        print(f"\n📋 Total Fields: {len(all_fields)}\n")
        
        for i, field in enumerate(all_fields, 1):
            value = first_invoice.get(field, '')
            # Show field name and sample value (truncated)
            value_str = str(value)[:50] if value else 'None'
            print(f"{i:3d}. {field:<40} = {value_str}")
    
    # Look for potential category/classification fields
    print("\n" + "=" * 80)
    print("  POTENTIAL CATEGORY/CLASSIFICATION FIELDS")
    print("=" * 80)
    
    category_keywords = ['type', 'category', 'class', 'department', 'location', 
                        'entity', 'division', 'project', 'program', 'fund',
                        'account', 'costcenter', 'segment']
    
    category_fields = [f for f in all_fields 
                      if any(keyword in f.lower() for keyword in category_keywords)]
    
    print(f"\n🔍 Found {len(category_fields)} potential classification fields:\n")
    
    for field in category_fields:
        # Get unique values for this field
        values = set()
        for inv in invoices:
            val = inv.get(field)
            if val and val not in ['None', '', 'null']:
                values.add(str(val))
        
        print(f"📌 {field}")
        if values:
            print(f"   Unique values ({len(values)}): {', '.join(list(values)[:10])}")
            if len(values) > 10:
                print(f"   ... and {len(values) - 10} more")
        else:
            print(f"   (empty/null in all samples)")
        print()
    
    # Look for entity/organization fields
    print("=" * 80)
    print("  ORGANIZATION/ENTITY IDENTIFICATION")
    print("=" * 80)
    
    entity_keywords = ['entity', 'mega', 'company', 'org', 'corporation']
    entity_fields = [f for f in all_fields 
                    if any(keyword in f.lower() for keyword in entity_keywords)]
    
    print(f"\n🏢 Found {len(entity_fields)} potential entity fields:\n")
    
    for field in entity_fields:
        values = Counter()
        for inv in invoices:
            val = inv.get(field)
            if val and val not in ['None', '', 'null']:
                values[str(val)] += 1
        
        print(f"📌 {field}")
        if values:
            for val, count in values.most_common(10):
                print(f"   '{val}': {count} invoices")
        else:
            print(f"   (empty/null in all samples)")
        print()
    
    # Sample large invoice to see its full structure
    print("=" * 80)
    print("  SAMPLE LARGE INVOICE (LIKELY A GRANT)")
    print("=" * 80)
    
    large_invoices = [inv for inv in invoices 
                     if float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) >= 10000]
    
    if large_invoices:
        sample = large_invoices[0]
        print(f"\n💰 Customer: {sample.get('CUSTOMERNAME')}")
        print(f"💵 Amount: ${sample.get('TOTALENTERED')}")
        print(f"📅 Date: {sample.get('WHENCREATED')}")
        print(f"\n📋 Full Record:\n")
        
        # Print all non-empty fields
        for field in sorted(sample.keys()):
            value = sample.get(field)
            if value and value not in ['None', '', 'null', 'N/A']:
                print(f"   {field:<40} = {value}")
    
    # Sample small invoice to compare
    print("\n" + "=" * 80)
    print("  SAMPLE SMALL INVOICE (LIKELY STUDENT)")
    print("=" * 80)
    
    small_invoices = [inv for inv in invoices 
                     if 0 < float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) < 2000]
    
    if small_invoices:
        sample = small_invoices[0]
        print(f"\n💰 Customer: {sample.get('CUSTOMERNAME')}")
        print(f"💵 Amount: ${sample.get('TOTALENTERED')}")
        print(f"📅 Date: {sample.get('WHENCREATED')}")
        print(f"\n📋 Full Record:\n")
        
        for field in sorted(sample.keys()):
            value = sample.get(field)
            if value and value not in ['None', '', 'null', 'N/A']:
                print(f"   {field:<40} = {value}")
    
    # Show entity/PBC identifier if found
    print("\n" + "=" * 80)
    print("  RECOMMENDED FILTERING STRATEGY")
    print("=" * 80)
    print("""
Based on the fields above, we can filter for:

1. PHILANTHROPY/GRANTS:
   - Look for specific field value that indicates "grant" or "philanthropy"
   - OR filter by amount (e.g., >= $10,000)
   - AND exclude student-related categories

2. NONPROFIT vs PBC:
   - Look for MEGAENTITY fields or similar
   - Filter by entity ID or name
   - May need to exclude specific entity IDs

Please review the fields above and tell me:
   a) Which field(s) indicate grant/philanthropy vs student revenue?
   b) Which field(s) indicate nonprofit vs PBC?
   c) What values should I filter for?
""")


if __name__ == "__main__":
    asyncio.run(main())

