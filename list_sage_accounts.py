#!/usr/bin/env python3
"""List GL accounts from Sage Intacct to find a valid revenue account."""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mcp_client.services.sage_intacct_sync import SageIntacctService

load_dotenv()

def list_gl_accounts():
    """List GL accounts from Sage."""
    
    print("=" * 70)
    print("SAGE INTACCT GL ACCOUNTS")
    print("=" * 70)
    
    # Initialize Sage
    print("\n1. Connecting to Sage Intacct...")
    sage = SageIntacctService({
        'company_id': os.getenv('SAGE_COMPANY_ID'),
        'user_id': os.getenv('SAGE_USER_ID'),
        'user_password': os.getenv('SAGE_USER_PASSWORD'),
        'sender_id': os.getenv('SAGE_SENDER_ID'),
        'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
    })
    
    if not sage.authenticate():
        print("   ❌ Authentication failed")
        return False
    
    print("   ✅ Connected")
    
    # Query GL accounts
    print("\n2. Fetching ALL GL accounts...")
    
    function_xml = """
    <function controlid="list-accounts">
        <readByQuery>
            <object>GLACCOUNT</object>
            <query></query>
            <fields>ACCOUNTNO,TITLE,ACCOUNTTYPE,NORMALBALANCE</fields>
            <pagesize>50</pagesize>
        </readByQuery>
    </function>"""
    
    try:
        response = sage._make_api_request(function_xml)
        
        if response.get('success'):
            data = response.get('data', {})
            accounts = data if isinstance(data, list) else [data] if data else []
            
            if accounts:
                print(f"\n   Found {len(accounts)} GL accounts:\n")
                for account in accounts:
                    account_no = account.get('ACCOUNTNO', 'N/A')
                    title = account.get('TITLE', 'N/A')
                    acct_type = account.get('ACCOUNTTYPE', 'N/A')
                    balance = account.get('NORMALBALANCE', 'N/A')
                    print(f"   • {account_no} - {title} ({acct_type}, {balance})")
                
                print("\n   💡 Look for a revenue/income account to use for invoices!")
                return True
            else:
                print("   ⚠️  No accounts found")
                return False
        else:
            print(f"   ❌ Failed: {response.get('errors')}")
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

if __name__ == "__main__":
    list_gl_accounts()

