#!/usr/bin/env python3
"""
Check actual invoices from invoice matching to see real dimensions being used
"""
import os, sys
from dotenv import load_dotenv
load_dotenv()
sys.path.append('/Users/jacquelinereverand/pursuit-mcp-client')
from mcp_client.services.sage_intacct_sync import SageIntacctService

sage = SageIntacctService({
    'company_id': os.getenv('SAGE_COMPANY_ID'),
    'user_id': os.getenv('SAGE_USER_ID'),
    'user_password': os.getenv('SAGE_USER_PASSWORD'),
    'sender_id': os.getenv('SAGE_SENDER_ID'),
    'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
})

print("=" * 100)
print("CHECKING ACTUAL INVOICES TO GET REAL DIMENSIONS")
print("=" * 100)

# Get invoices the same way the invoice matching page does
print("\n📄 Fetching invoices...")

# This is what we use for invoice matching
query = """
<function controlid="get-invoices">
    <readByQuery>
        <object>ARINVOICE</object>
        <fields>RECORDNO,CUSTOMERID,CUSTOMERNAME,TOTALDUE,WHENCREATED,STATE,TRX_TOTALENTERED</fields>
        <query></query>
        <pagesize>100</pagesize>
    </readByQuery>
</function>
"""

result = sage._make_api_request(query)

if result.get('success'):
    invoices = result.get('data', {}).get('arinvoice', [])
    if not isinstance(invoices, list):
        invoices = [invoices]
    
    print(f"Found {len(invoices)} invoices")
    
    if invoices:
        print(f"\nGetting details of first 10 invoices to extract dimensions...\n")
        
        # Collect unique dimensions
        gl_accounts = set()
        departments = set()
        classes = set()
        locations = set()
        
        for i, inv in enumerate(invoices[:10]):
            recordno = inv.get('RECORDNO')
            customer = inv.get('CUSTOMERNAME', 'N/A')
            total = inv.get('TOTALDUE', 'N/A')
            
            print(f"  Invoice #{recordno} - {customer} - ${total}")
            
            # Get full invoice details including line items
            detail_query = f"""
            <function controlid="get-detail">
                <read>
                    <object>ARINVOICE</object>
                    <keys>{recordno}</keys>
                    <fields>*</fields>
                </read>
            </function>
            """
            
            detail_result = sage._make_api_request(detail_query)
            if detail_result.get('success'):
                invoice_data = detail_result.get('data', {}).get('arinvoice', {})
                
                # Get line items
                line_items = invoice_data.get('ARINVOICEITEMS', {})
                if line_items:
                    items = line_items.get('arinvoiceitem', [])
                    if not isinstance(items, list):
                        items = [items]
                    
                    for item in items:
                        # Collect dimensions
                        if item.get('ACCOUNTNO'):
                            gl_accounts.add((item.get('ACCOUNTNO'), item.get('ACCOUNTTITLE', 'N/A')))
                        if item.get('LOCATIONID'):
                            locations.add((item.get('LOCATIONID'), item.get('LOCATIONNAME', 'N/A')))
                        if item.get('DEPARTMENTID'):
                            departments.add((item.get('DEPARTMENTID'), item.get('DEPARTMENTNAME', 'N/A')))
                        if item.get('CLASSID'):
                            classes.add((item.get('CLASSID'), item.get('CLASSNAME', 'N/A')))
        
        print("\n" + "=" * 100)
        print("DIMENSIONS ACTUALLY USED IN INVOICES")
        print("=" * 100)
        
        print(f"\n📊 GL ACCOUNTS ({len(gl_accounts)} unique):")
        print("-" * 100)
        for acc_no, acc_title in sorted(gl_accounts):
            print(f"  {acc_no:10} - {acc_title}")
        
        print(f"\n📍 LOCATIONS ({len(locations)} unique):")
        print("-" * 100)
        for loc_id, loc_name in sorted(locations):
            print(f"  {loc_id:15} - {loc_name}")
        
        print(f"\n🏢 DEPARTMENTS ({len(departments)} unique):")
        print("-" * 100)
        for dept_id, dept_name in sorted(departments):
            print(f"  {dept_id:15} - {dept_name}")
        
        print(f"\n📂 CLASSES ({len(classes)} unique):")
        print("-" * 100)
        for cls_id, cls_name in sorted(classes):
            print(f"  {cls_id:15} - {cls_name}")
    else:
        print("No invoices found!")
else:
    print(f"❌ Error: {result.get('errors')}")

print("\n" + "=" * 100)

