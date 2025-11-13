#!/usr/bin/env python3
"""
Check line items and customer records for department field.
"""

import asyncio
import json
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Check line items and customers for department."""
    
    print("\n" + "=" * 80)
    print("  CHECKING LINE ITEMS AND CUSTOMERS FOR DEPARTMENT")
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
    
    # Method 1: Try to get invoice line items
    print("=" * 80)
    print("  METHOD 1: Query ARINVOICEITEM (invoice line items)")
    print("=" * 80)
    
    function_xml = """
    <function controlid="get-line-items">
        <readByQuery>
            <object>ARINVOICEITEM</object>
            <query></query>
            <fields>*</fields>
            <pagesize>20</pagesize>
        </readByQuery>
    </function>"""
    
    try:
        response = await sage._make_api_request(function_xml)
        
        if response.get('success'):
            print("✅ Got line items!")
            data = response.get('data', {})
            
            # Parse line items
            if isinstance(data, dict) and 'arinvoiceitem' in data:
                items = data['arinvoiceitem']
                if isinstance(items, list):
                    print(f"✅ Got {len(items)} line items\n")
                    
                    if items:
                        # Show all fields
                        all_fields = set()
                        for item in items:
                            all_fields.update(item.keys())
                        
                        dept_fields = [f for f in all_fields if 'dept' in f.lower() or 'class' in f.lower() or 'location' in f.lower()]
                        
                        print(f"📋 All fields in line items ({len(all_fields)} total):")
                        for field in sorted(all_fields):
                            marker = "✅" if any(x in field.lower() for x in ['dept', 'class', 'location']) else "  "
                            print(f"   {marker} {field}")
                        
                        if dept_fields:
                            print(f"\n✅ Found department-related fields: {dept_fields}")
                            
                            # Show sample values
                            print(f"\n📊 Sample line items with department info:")
                            for i, item in enumerate(items[:10]):
                                print(f"\n   Line Item {i+1}:")
                                for field in dept_fields:
                                    print(f"      {field}: {item.get(field, 'N/A')}")
                                print(f"      ACCOUNTTITLE: {item.get('ACCOUNTTITLE', 'N/A')}")
                                print(f"      AMOUNT: {item.get('AMOUNT', 'N/A')}")
                        else:
                            print(f"\n❌ No department fields found in line items")
                else:
                    print(f"Line items not in expected format: {type(items)}")
        else:
            print(f"❌ Failed to get line items: {response.get('errors')}")
    
    except Exception as e:
        print(f"❌ Error querying line items: {e}")
    
    # Method 2: Check customer records
    print("\n" + "=" * 80)
    print("  METHOD 2: Check CUSTOMER records for department")
    print("=" * 80)
    
    print("\n🔍 Fetching customers...")
    customers_response = await sage.get_customers(limit=50)
    
    if customers_response.get('success'):
        data = customers_response.get('data', {})
        
        if isinstance(data, dict) and 'customer' in data:
            customers = data['customer']
            if isinstance(customers, list):
                print(f"✅ Got {len(customers)} customers\n")
                
                if customers:
                    # Show all fields
                    all_fields = set()
                    for cust in customers:
                        all_fields.update(cust.keys())
                    
                    dept_fields = [f for f in all_fields if 'dept' in f.lower() or 'class' in f.lower() or 'type' in f.lower()]
                    
                    print(f"📋 Department/Classification fields in customers:")
                    if dept_fields:
                        for field in sorted(dept_fields):
                            print(f"   ✅ {field}")
                        
                        # Show sample values
                        print(f"\n📊 Sample customer classifications:")
                        for i, cust in enumerate(customers[:15]):
                            cust_id = cust.get('CUSTOMERID', 'N/A')
                            cust_name = cust.get('NAME', 'N/A')
                            print(f"\n   Customer {i+1}: {cust_id} - {cust_name}")
                            for field in dept_fields:
                                value = cust.get(field)
                                if value and value not in ['None', '', 'null']:
                                    print(f"      {field}: {value}")
                    else:
                        print("   ❌ No department fields found")
    
    # Method 3: Try alternative objects
    print("\n" + "=" * 80)
    print("  METHOD 3: Query GLENTRY (general ledger entries)")
    print("=" * 80)
    
    function_xml_gl = """
    <function controlid="get-gl-entries">
        <readByQuery>
            <object>GLENTRY</object>
            <query>BATCHNO = '815'</query>
            <fields>*</fields>
            <pagesize>20</pagesize>
        </readByQuery>
    </function>"""
    
    try:
        response = await sage._make_api_request(function_xml_gl)
        
        if response.get('success'):
            print("✅ Got GL entries!")
            data = response.get('data', {})
            
            if isinstance(data, dict) and 'glentry' in data:
                entries = data['glentry']
                if isinstance(entries, list) and entries:
                    print(f"✅ Got {len(entries)} GL entries\n")
                    
                    # Show all fields
                    all_fields = set()
                    for entry in entries:
                        all_fields.update(entry.keys())
                    
                    dept_fields = [f for f in all_fields if 'dept' in f.lower() or 'class' in f.lower() or 'location' in f.lower()]
                    
                    if dept_fields:
                        print(f"✅ Found department fields in GL entries: {dept_fields}\n")
                        
                        # Show sample
                        for i, entry in enumerate(entries[:5]):
                            print(f"   GL Entry {i+1}:")
                            for field in dept_fields:
                                print(f"      {field}: {entry.get(field, 'N/A')}")
                            print(f"      ACCOUNTTITLE: {entry.get('ACCOUNTTITLE', 'N/A')}")
                            print(f"      AMOUNT: {entry.get('AMOUNT', 'N/A')}")
                            print()
                    else:
                        print("❌ No department fields in GL entries")
        else:
            print(f"❌ Failed to get GL entries: {response.get('errors')}")
    
    except Exception as e:
        print(f"❌ Error querying GL entries: {e}")
    
    print("\n" + "=" * 80)
    print("  SUMMARY")
    print("=" * 80)
    print("""
I've checked:
  1. ❌ Invoice header (ARINVOICE) - no department field
  2. ⏳ Invoice line items (ARINVOICEITEM) - checking above
  3. ⏳ Customer records (CUSTOMER) - checking above
  4. ⏳ GL entries (GLENTRY) - checking above

If none of these have department 304, then:
  • It might be stored in a custom field
  • It might only exist in certain modules/views
  • The field might have a completely different name

Please check: In Sage Intacct UI, when you look at an invoice and see 
"Department 304", what is the EXACT field label next to it?
""")


if __name__ == "__main__":
    asyncio.run(main())

