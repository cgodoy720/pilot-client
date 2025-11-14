#!/usr/bin/env python3
import os
from dotenv import load_dotenv
load_dotenv()

import sys
sys.path.append('/Users/jacquelinereverand/pursuit-mcp-client')
from mcp_client.services.sage_intacct_sync import SageIntacctService

sage = SageIntacctService({
    'company_id': os.getenv('SAGE_COMPANY_ID'),
    'user_id': os.getenv('SAGE_USER_ID'),
    'user_password': os.getenv('SAGE_USER_PASSWORD'),
    'sender_id': os.getenv('SAGE_SENDER_ID'),
    'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
})

print("=" * 80)
print("ALL GL ACCOUNTS IN SAGE")
print("=" * 80)
query = """
<function controlid="get-all-gl">
    <readByQuery>
        <object>GLACCOUNT</object>
        <fields>ACCOUNTNO,TITLE,STATUS,ACCOUNTTYPE</fields>
        <query></query>
        <pagesize>1000</pagesize>
    </readByQuery>
</function>
"""
result = sage._make_api_request(query)

if result.get('success'):
    accounts = result.get('data', {}).get('glaccount', [])
    if not isinstance(accounts, list):
        accounts = [accounts]
    
    print(f"\nFound {len(accounts)} GL accounts\n")
    
    # Group by first digit
    by_range = {}
    for account in accounts:
        accountno = account.get('ACCOUNTNO', 'N/A')
        first_digit = accountno[0] if accountno != 'N/A' else 'Other'
        if first_digit not in by_range:
            by_range[first_digit] = []
        by_range[first_digit].append(account)
    
    for digit in sorted(by_range.keys()):
        if digit == '4':
            print(f"\n💰 {digit}000 series (REVENUE):")
        elif digit == '3':
            print(f"\n📈 {digit}000 series (EQUITY):")
        elif digit == '2':
            print(f"\n💳 {digit}000 series (LIABILITIES):")
        elif digit == '1':
            print(f"\n🏦 {digit}000 series (ASSETS):")
        elif digit == '5':
            print(f"\n💸 {digit}000 series (EXPENSES):")
        else:
            print(f"\n📋 {digit} series:")
        print("-" * 80)
        for account in by_range[digit]:
            accountno = account.get('ACCOUNTNO', 'N/A')
            title = account.get('TITLE', 'N/A')
            acctype = account.get('ACCOUNTTYPE', 'N/A')
            status = account.get('STATUS', 'N/A')
            if status == 'active':
                print(f"  ✅ {accountno} - {title} ({acctype})")
            else:
                print(f"  ⚠️  {accountno} - {title} ({acctype}) - {status}")
else:
    print(f"❌ Error: {result.get('errors')}")

print("\n" + "=" * 80)

