#!/usr/bin/env python3
"""
Find Grant Revenue in Sage Intacct
Search comprehensively for grant-related transactions.
"""

import asyncio
import json
from datetime import datetime
from mcp_client.services.sage_intacct import SageIntacctMCPService


def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def extract_records(data):
    """Extract records from Sage Intacct response."""
    if not data or not data.get('success'):
        return []
    
    result = data.get('data')
    if not result:
        return []
    
    # Handle different response structures
    if isinstance(result, list):
        return result
    elif isinstance(result, dict):
        # Look for records in various possible fields
        for key in ['customer', 'arinvoice', 'arpayment', 'records', 'data']:
            if key in result:
                value = result[key]
                if isinstance(value, list):
                    return value
                elif isinstance(value, dict):
                    return [value]
        # If it's a single record dict, return it
        if 'RECORDNO' in result or 'CUSTOMERID' in result:
            return [result]
    
    return []


def analyze_amounts(records, amount_field, description_field=None):
    """Analyze records to find large amounts (potential grants)."""
    large_transactions = []
    
    for record in records:
        try:
            amount_str = record.get(amount_field, '0')
            if isinstance(amount_str, str):
                amount = float(amount_str.replace(',', ''))
            else:
                amount = float(amount_str)
            
            # Consider amounts > $10,000 as potential grants
            if amount >= 10000:
                item = {
                    'amount': amount,
                    'customer_id': record.get('CUSTOMERID', 'N/A'),
                    'customer_name': record.get('CUSTOMERNAME', 'N/A'),
                    'date': record.get('WHENCREATED') or record.get('PAYMENTDATE', 'N/A'),
                    'doc_number': record.get('DOCNUMBER', 'N/A'),
                    'record_no': record.get('RECORDNO', 'N/A'),
                }
                if description_field:
                    item['description'] = record.get(description_field, 'N/A')
                large_transactions.append(item)
        except (ValueError, TypeError):
            continue
    
    return sorted(large_transactions, key=lambda x: x['amount'], reverse=True)


def search_for_foundations(records):
    """Search for foundation or grant-related keywords in customer names."""
    keywords = [
        'foundation', 'fund', 'grant', 'trust', 'endowment', 'charity',
        'robin hood', 'ford', 'gates', 'mellon', 'rockefeller',
        'google', 'facebook', 'microsoft', 'amazon', 'chase',
        'jpmorgan', 'citi', 'bank of america', 'wells fargo',
        'inc', 'corp', 'llc', 'company', 'organization'
    ]
    
    foundation_matches = []
    for record in records:
        customer_name = record.get('CUSTOMERNAME', '').lower()
        customer_id = record.get('CUSTOMERID', '')
        
        for keyword in keywords:
            if keyword in customer_name:
                foundation_matches.append({
                    'customer_id': customer_id,
                    'customer_name': record.get('CUSTOMERNAME'),
                    'matched_keyword': keyword,
                    'record': record
                })
                break
    
    return foundation_matches


async def main():
    """Comprehensive search for grant revenue."""
    print("\n" + "=" * 80)
    print("  🔍 COMPREHENSIVE GRANT REVENUE SEARCH")
    print("=" * 80)
    print("\n📋 Searching all Sage Intacct data for grant-related transactions...")
    
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
    
    # ========== SEARCH 1: ALL CUSTOMERS ==========
    print_section("1. ANALYZING ALL CUSTOMERS")
    print("Looking for foundation names...")
    
    customers_response = await sage.get_customers(limit=1000)
    customer_records = extract_records(customers_response)
    print(f"📊 Found {len(customer_records)} total customer(s)")
    
    if customer_records:
        foundation_customers = search_for_foundations(customer_records)
        if foundation_customers:
            print(f"\n🎯 Found {len(foundation_customers)} customer(s) with foundation/organization keywords:")
            for match in foundation_customers[:20]:  # Show first 20
                print(f"   • {match['customer_name']} (ID: {match['customer_id']}) - matched: '{match['matched_keyword']}'")
        else:
            print("\n⚠️  No foundation names found in customers")
            print("Sample customer names:")
            for i, cust in enumerate(customer_records[:10]):
                print(f"   {i+1}. {cust.get('CUSTOMERNAME', 'N/A')} (ID: {cust.get('CUSTOMERID', 'N/A')})")
    
    # ========== SEARCH 2: ALL INVOICES ==========
    print_section("2. ANALYZING ALL INVOICES")
    print("Looking for large invoice amounts (>$10,000)...")
    
    invoices_response = await sage.get_invoices(limit=1000)
    invoice_records = extract_records(invoices_response)
    print(f"📊 Found {len(invoice_records)} total invoice(s)")
    
    if invoice_records:
        large_invoices = analyze_amounts(invoice_records, 'TOTALENTERED', 'DESCRIPTION')
        
        if large_invoices:
            print(f"\n💰 Found {len(large_invoices)} invoice(s) >= $10,000:")
            for inv in large_invoices[:20]:  # Show first 20
                print(f"\n   Amount: ${inv['amount']:,.2f}")
                print(f"   Customer: {inv['customer_name']} (ID: {inv['customer_id']})")
                print(f"   Date: {inv['date']}")
                print(f"   Doc#: {inv['doc_number']}")
                print(f"   Record#: {inv['record_no']}")
        else:
            print("\n⚠️  No invoices >= $10,000 found")
            print("Sample invoice amounts:")
            for i, inv in enumerate(invoice_records[:10]):
                amt = inv.get('TOTALENTERED', '0')
                print(f"   {i+1}. ${amt} - {inv.get('CUSTOMERNAME', 'N/A')} ({inv.get('WHENCREATED', 'N/A')})")
    
    # ========== SEARCH 3: ALL PAYMENTS ==========
    print_section("3. ANALYZING ALL PAYMENTS")
    print("Looking for large payments (>$10,000)...")
    
    payments_response = await sage.get_payments(limit=1000)
    payment_records = extract_records(payments_response)
    print(f"📊 Found {len(payment_records)} total payment(s)")
    
    if payment_records:
        large_payments = analyze_amounts(payment_records, 'PAYMENTAMOUNT', 'MEMO')
        
        if large_payments:
            print(f"\n💰 Found {len(large_payments)} payment(s) >= $10,000:")
            for pmt in large_payments[:20]:  # Show first 20
                print(f"\n   Amount: ${pmt['amount']:,.2f}")
                print(f"   Customer: {pmt['customer_name']} (ID: {pmt['customer_id']})")
                print(f"   Date: {pmt['date']}")
                print(f"   Doc#: {pmt['doc_number']}")
                if 'description' in pmt:
                    print(f"   Memo: {pmt['description']}")
        else:
            print("\n⚠️  No payments >= $10,000 found")
            print("Top 10 payment amounts:")
            amounts = []
            for pmt in payment_records:
                try:
                    amt = float(str(pmt.get('PAYMENTAMOUNT', '0')).replace(',', ''))
                    amounts.append((amt, pmt))
                except:
                    pass
            amounts.sort(reverse=True)
            for i, (amt, pmt) in enumerate(amounts[:10]):
                print(f"   {i+1}. ${amt:,.2f} - {pmt.get('CUSTOMERNAME', 'N/A')} ({pmt.get('PAYMENTDATE', 'N/A')})")
    
    # ========== SEARCH 4: FOUNDATION MATCHES IN PAYMENTS ==========
    print_section("4. CROSS-REFERENCING FOUNDATIONS WITH TRANSACTIONS")
    
    if foundation_customers and payment_records:
        foundation_ids = {f['customer_id'] for f in foundation_customers}
        foundation_payments = [p for p in payment_records if p.get('CUSTOMERID') in foundation_ids]
        
        if foundation_payments:
            print(f"\n🎯 Found {len(foundation_payments)} payment(s) from foundation customers:")
            for pmt in foundation_payments[:20]:
                amt = pmt.get('PAYMENTAMOUNT', '0')
                print(f"\n   ${amt} - {pmt.get('CUSTOMERNAME')} ")
                print(f"   Date: {pmt.get('PAYMENTDATE')} | Doc: {pmt.get('DOCNUMBER')}")
        else:
            print("\n⚠️  No payments found from foundation customers")
    
    # ========== SEARCH 5: RECENT TRANSACTIONS (2023-2025) ==========
    print_section("5. ANALYZING RECENT TRANSACTIONS (2023-2025)")
    
    recent_payments = []
    for pmt in payment_records:
        date_str = pmt.get('PAYMENTDATE', '')
        if date_str:
            try:
                # Parse dates like "12/20/2021"
                month, day, year = date_str.split('/')
                if int(year) >= 2023:
                    recent_payments.append(pmt)
            except:
                pass
    
    if recent_payments:
        print(f"\n📅 Found {len(recent_payments)} payment(s) from 2023-2025:")
        for pmt in recent_payments[:20]:
            amt = pmt.get('PAYMENTAMOUNT', '0')
            print(f"   ${amt} - {pmt.get('CUSTOMERNAME')} ({pmt.get('PAYMENTDATE')})")
    else:
        print("\n⚠️  No payments found from 2023-2025")
        print("Most recent payment dates:")
        dates = []
        for pmt in payment_records:
            date_str = pmt.get('PAYMENTDATE', '')
            if date_str:
                try:
                    month, day, year = date_str.split('/')
                    dates.append((int(year), int(month), int(day), pmt))
                except:
                    pass
        dates.sort(reverse=True)
        for i, (y, m, d, pmt) in enumerate(dates[:10]):
            print(f"   {i+1}. {pmt.get('PAYMENTDATE')} - {pmt.get('CUSTOMERNAME')} (${pmt.get('PAYMENTAMOUNT', '0')})")
    
    # ========== SUMMARY ==========
    print_section("SUMMARY")
    
    print(f"\n📊 Data Overview:")
    print(f"   • Total Customers: {len(customer_records)}")
    print(f"   • Total Invoices: {len(invoice_records)}")
    print(f"   • Total Payments: {len(payment_records)}")
    print(f"   • Foundation-like Customers: {len(foundation_customers) if customer_records else 0}")
    print(f"   • Large Invoices (>$10K): {len(large_invoices) if invoice_records else 0}")
    print(f"   • Large Payments (>$10K): {len(large_payments) if payment_records else 0}")
    print(f"   • Recent Payments (2023+): {len(recent_payments)}")
    
    print(f"\n💡 Next Steps:")
    if len(large_invoices if invoice_records else []) == 0 and len(large_payments if payment_records else []) == 0:
        print("   ⚠️  No large transactions (>$10K) found in current data")
        print("   → This suggests grants may be:")
        print("      1. Not yet entered in Sage Intacct")
        print("      2. In a different date range")
        print("      3. Managed in a different system")
        print("      4. Using different customer records")
    else:
        print("   ✅ Found potential grant transactions!")
        print("   → Review the large transactions above")
        print("   → Map these customers to Salesforce accounts")
    
    print("\n")


if __name__ == "__main__":
    asyncio.run(main())

