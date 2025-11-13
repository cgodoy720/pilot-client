#!/usr/bin/env python3
"""
Deep search for DEPARTMENT field in all possible locations.
"""

import asyncio
import json
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Deep search for department field."""
    
    print("\n" + "=" * 80)
    print("  DEEP SEARCH FOR DEPARTMENT FIELD")
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
    
    # Try different ways to get department info
    print("=" * 80)
    print("  METHOD 1: Search ALL field names for 'dept' or 'department'")
    print("=" * 80)
    
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
    
    print(f"✅ Got {len(invoices)} invoices\n")
    
    # Get ALL fields and search for department-related ones
    if invoices:
        all_fields = set()
        for inv in invoices:
            all_fields.update(inv.keys())
        
        dept_related = [f for f in all_fields if 'dept' in f.lower() or 'dep' in f.lower()]
        
        print(f"🔍 Fields containing 'dept' or 'dep': {len(dept_related)}")
        for field in sorted(dept_related):
            print(f"   • {field}")
        
        # Also check for common variations
        variations = ['DEPARTMENT', 'DEPARTMENTID', 'DEPT', 'DEPTID', 'DEPTKEY', 
                     'DEPARTMENTKEY', 'DEPARTMENT_ID', 'DEPARTMENTNAME',
                     'LOCATION', 'LOCATIONID', 'CLASS', 'CLASSID']
        
        print(f"\n🔍 Checking specific field name variations:")
        found_fields = {}
        for field in variations:
            if field in all_fields:
                print(f"   ✅ Found: {field}")
                found_fields[field] = True
                
                # Show sample values
                sample_values = set()
                for inv in invoices[:50]:
                    val = inv.get(field)
                    if val and val not in ['None', '', 'null']:
                        sample_values.add(str(val))
                
                if sample_values:
                    print(f"      Sample values: {', '.join(list(sample_values)[:10])}")
            else:
                print(f"   ❌ Not found: {field}")
    
    # Check nested fields
    print("\n" + "=" * 80)
    print("  METHOD 2: Check for nested/sub-fields")
    print("=" * 80)
    
    if invoices:
        first_invoice = invoices[0]
        
        # Look for nested objects that might contain department
        nested_candidates = ['PCBINVSUMMARY', 'BILLTO', 'SHIPTO', 'CONTACT']
        
        for candidate in nested_candidates:
            matching_fields = [f for f in first_invoice.keys() if candidate in f]
            if matching_fields:
                print(f"\n📦 Fields under {candidate}:")
                dept_fields = [f for f in matching_fields if 'dept' in f.lower() or 'dep' in f.lower()]
                if dept_fields:
                    print(f"   ✅ Department-related: {dept_fields}")
                else:
                    print(f"   ❌ No department fields found")
    
    # Try querying with explicit field request
    print("\n" + "=" * 80)
    print("  METHOD 3: Query with explicit DEPARTMENT field request")
    print("=" * 80)
    
    print("\n🔍 Making custom API request to explicitly request DEPARTMENT field...")
    
    # Create custom XML query
    function_xml = """
    <function controlid="get-invoices-with-dept">
        <readByQuery>
            <object>ARINVOICE</object>
            <query></query>
            <fields>RECORDNO,CUSTOMERID,CUSTOMERNAME,TOTALENTERED,WHENCREATED,DEPARTMENT,DEPARTMENTID,DEPT,DEPTID,LOCATIONID,CLASSID</fields>
            <pagesize>50</pagesize>
        </readByQuery>
    </function>"""
    
    try:
        custom_response = await sage._make_api_request(function_xml)
        
        if custom_response.get('success'):
            print("✅ Custom query succeeded!")
            custom_data = custom_response.get('data', {})
            
            if isinstance(custom_data, dict):
                # Show all fields returned
                if 'arinvoice' in custom_data:
                    sample_records = custom_data['arinvoice']
                    if isinstance(sample_records, list) and len(sample_records) > 0:
                        sample = sample_records[0]
                    elif isinstance(sample_records, dict):
                        sample = sample_records
                    else:
                        sample = {}
                    
                    if sample:
                        print(f"\n📋 Fields returned by custom query:")
                        dept_fields = []
                        for field in sorted(sample.keys()):
                            if 'dept' in field.lower() or 'dep' in field.lower():
                                dept_fields.append(field)
                                value = sample.get(field)
                                print(f"   ✅ {field} = {value}")
                        
                        if not dept_fields:
                            print("   ❌ No department fields in response")
                        
                        # Show a few records with all their data
                        print(f"\n📊 Sample invoices with explicit fields:")
                        for i, record in enumerate(sample_records[:5] if isinstance(sample_records, list) else [sample_records]):
                            print(f"\n   Invoice {i+1}:")
                            print(f"      Customer: {record.get('CUSTOMERNAME', 'N/A')}")
                            print(f"      Amount: ${record.get('TOTALENTERED', '0')}")
                            for field in sorted(record.keys()):
                                if 'dept' in field.lower() or 'class' in field.lower() or 'location' in field.lower():
                                    print(f"      {field}: {record.get(field, 'N/A')}")
        else:
            print(f"❌ Custom query failed: {custom_response.get('errors')}")
    
    except Exception as e:
        print(f"❌ Error with custom query: {e}")
    
    # Try looking at invoice line items
    print("\n" + "=" * 80)
    print("  METHOD 4: Check invoice LINE ITEMS for department")
    print("=" * 80)
    
    print("\n🔍 Fetching invoice with line items...")
    
    # Try to get line items
    function_xml_with_items = """
    <function controlid="get-invoice-detail">
        <read>
            <object>ARINVOICE</object>
            <keys>815</keys>
            <fields>*</fields>
            <returnFormat>xml</returnFormat>
        </read>
    </function>"""
    
    try:
        detail_response = await sage._make_api_request(function_xml_with_items)
        
        if detail_response.get('success'):
            print("✅ Got invoice detail!")
            detail_data = detail_response.get('data', {})
            
            # Look for line items
            if isinstance(detail_data, dict):
                print(f"\n📋 Top-level keys in detail response:")
                for key in detail_data.keys():
                    print(f"   • {key}")
                
                # Check if there are line items
                line_item_keys = [k for k in detail_data.keys() if 'item' in k.lower() or 'line' in k.lower()]
                if line_item_keys:
                    print(f"\n✅ Found potential line item fields: {line_item_keys}")
                    for key in line_item_keys:
                        items = detail_data.get(key)
                        if items:
                            print(f"\n   {key} structure:")
                            if isinstance(items, list) and len(items) > 0:
                                sample_item = items[0]
                                if isinstance(sample_item, dict):
                                    dept_fields = [f for f in sample_item.keys() if 'dept' in f.lower()]
                                    if dept_fields:
                                        print(f"      ✅ Department fields in line items: {dept_fields}")
                                    else:
                                        print(f"      Available fields: {list(sample_item.keys())}")
        else:
            print(f"❌ Detail query failed: {detail_response.get('errors')}")
    
    except Exception as e:
        print(f"❌ Error with detail query: {e}")
    
    print("\n" + "=" * 80)
    print("  CONCLUSION")
    print("=" * 80)
    print("""
If DEPARTMENT field is still not found, possible reasons:
1. Field is only on line items (not invoice header)
2. Field requires different API endpoint or permissions
3. Field name is different (maybe LOCATIONID, CLASSID, etc.)
4. Need to query a different object (ARINVOICEITEM instead of ARINVOICE)

Please check your Sage Intacct UI and tell me:
- Where exactly do you see "Department 304"?
- Is it on the invoice header or line item detail?
- What's the exact label in the UI?
""")


if __name__ == "__main__":
    asyncio.run(main())

