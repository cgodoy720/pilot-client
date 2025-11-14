#!/usr/bin/env python3
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

print("Getting ALL dimensions (no filter)...")

for obj, name in [('GLACCOUNT', 'GL Accounts'), ('DEPARTMENT', 'Departments'), ('CLASS', 'Classes'), ('LOCATION', 'Locations')]:
    fields = {
        'GLACCOUNT': '<field>ACCOUNTNO</field><field>TITLE</field><field>STATUS</field>',
        'DEPARTMENT': '<field>DEPARTMENTID</field><field>TITLE</field><field>STATUS</field>',
        'CLASS': '<field>CLASSID</field><field>NAME</field><field>STATUS</field>',
        'LOCATION': '<field>LOCATIONID</field><field>NAME</field><field>STATUS</field>',
    }[obj]
    
    query = f"""
    <function controlid="get-{obj}">
        <query>
            <object>{obj}</object>
            <select>{fields}</select>
            <pagesize>1000</pagesize>
        </query>
    </function>
    """
    
    result = sage._make_api_request(query)
    if result.get('success'):
        items = result.get('data', {}).get(obj.lower(), [])
        if not isinstance(items, list):
            items = [items]
        print(f"\n{name}: {len(items)} found")
        for item in items:
            print(f"  {item}")
    else:
        print(f"{name}: Error - {result.get('errors')}")
