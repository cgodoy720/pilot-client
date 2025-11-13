#!/usr/bin/env python3
"""
Find ALL grant invoices (not just large ones).
Search by customer name patterns instead of just amount.
"""

import asyncio
import csv
from mcp_client.services.sage_intacct import SageIntacctMCPService


def is_likely_grant_customer(customer_name):
    """Determine if customer name suggests grant (not individual student)."""
    if not customer_name or customer_name == 'N/A':
        return False
    
    name_lower = customer_name.lower()
    
    # Grant indicators (foundations, companies, government)
    grant_keywords = [
        'foundation', 'fund', 'trust', 'endowment',
        'llc', 'inc', 'corp', 'corporation', 'company',
        'bank', 'capital', 'ventures', 'partners',
        'google', 'amazon', 'facebook', 'meta', 'apple', 'microsoft',
        'city', 'department', 'government', 'federal', 'state',
        'charity', 'charitable', 'philanthropy',
        'group', 'holdings', 'investment',
    ]
    
    for keyword in grant_keywords:
        if keyword in name_lower:
            return True
    
    # Check if it looks like a company (has legal suffix)
    legal_suffixes = ['llc', 'inc', 'corp', 'ltd', 'co']
    words = name_lower.split()
    if any(suffix in words for suffix in legal_suffixes):
        return True
    
    # Individual names typically have 2-3 words without business indicators
    # (This is imperfect but catches most cases)
    if len(words) == 2 or len(words) == 3:
        # If no business keywords, likely an individual
        if not any(keyword in name_lower for keyword in grant_keywords):
            return False
    
    return False


async def main():
    """Find all grant invoices comprehensively."""
    
    print("\n" + "=" * 80)
    print("  COMPREHENSIVE GRANT INVOICE SEARCH")
    print("=" * 80)
    print("\nSearching by customer type (foundations/companies) instead of just amount\n")
    
    # Initialize
    class MockClient:
        available_tools = {}
    
    client = MockClient()
    
    print("🔐 Authenticating...")
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
    
    # Get ALL invoices
    print("📊 Fetching ALL invoices (this may take a moment)...")
    invoices_response = await sage.get_invoices(limit=10000)
    
    if not invoices_response.get('success'):
        print("❌ Failed to fetch invoices")
        return
    
    # Extract records
    data = invoices_response.get('data', {})
    all_records = []
    
    if isinstance(data, dict) and 'arinvoice' in data:
        all_records = data['arinvoice']
    elif isinstance(data, list):
        all_records = data
    
    print(f"✅ Retrieved {len(all_records)} total invoice records\n")
    
    # Categorize invoices
    grant_invoices = []
    student_invoices = []
    uncertain_invoices = []
    
    for inv in all_records:
        customer_name = inv.get('CUSTOMERNAME', '')
        
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
        except:
            amount = 0
        
        if is_likely_grant_customer(customer_name):
            grant_invoices.append(inv)
        elif amount >= 10000:  # Large amount but individual name - uncertain
            uncertain_invoices.append(inv)
        else:
            student_invoices.append(inv)
    
    print("=" * 80)
    print("  RESULTS")
    print("=" * 80)
    print(f"\n📊 Total Invoices: {len(all_records)}")
    print(f"🏢 Grant Invoices (companies/foundations): {len(grant_invoices)}")
    print(f"👤 Student Invoices (individuals): {len(student_invoices)}")
    print(f"❓ Uncertain (large amounts, individual names): {len(uncertain_invoices)}")
    
    # Calculate totals
    grant_total = sum(float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) 
                     for inv in grant_invoices)
    student_total = sum(float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) 
                       for inv in student_invoices)
    
    print(f"\n💰 Grant Revenue: ${grant_total:,.2f}")
    print(f"💵 Student Revenue: ${student_total:,.2f}")
    
    # Export grant invoices
    output_file = 'all_grant_invoices.csv'
    
    print(f"\n📝 Exporting {len(grant_invoices)} grant invoices to: {output_file}")
    
    with open(output_file, 'w', newline='', encoding='utf-8') as f:
        fieldnames = [
            'Invoice_Record_No',
            'Customer_Name',
            'Customer_ID',
            'Invoice_Amount',
            'Invoice_Date',
            'Doc_Number',
            'Status',
            'Total_Due',
            'Salesforce_Opportunity_ID',
            'Match_Confidence',
            'Notes'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        # Sort by date (most recent first)
        sorted_grants = sorted(grant_invoices, 
                              key=lambda x: x.get('WHENCREATED', ''), 
                              reverse=True)
        
        for inv in sorted_grants:
            writer.writerow({
                'Invoice_Record_No': inv.get('RECORDNO', ''),
                'Customer_Name': inv.get('CUSTOMERNAME', ''),
                'Customer_ID': inv.get('CUSTOMERID', ''),
                'Invoice_Amount': inv.get('TOTALENTERED', ''),
                'Invoice_Date': inv.get('WHENCREATED', ''),
                'Doc_Number': inv.get('DOCNUMBER', ''),
                'Status': inv.get('STATE', ''),
                'Total_Due': inv.get('TOTALDUE', ''),
                'Salesforce_Opportunity_ID': '',  # To be filled in matching UI
                'Match_Confidence': '',  # Auto-calculated by matching tool
                'Notes': ''
            })
    
    print(f"✅ Export complete!")
    
    # Show summary by customer
    print("\n" + "=" * 80)
    print("  TOP GRANT FUNDERS (All Amounts)")
    print("=" * 80)
    
    by_customer = {}
    for inv in grant_invoices:
        customer = inv.get('CUSTOMERNAME', 'Unknown')
        amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
        
        if customer not in by_customer:
            by_customer[customer] = {'count': 0, 'total': 0}
        
        by_customer[customer]['count'] += 1
        by_customer[customer]['total'] += amount
    
    sorted_customers = sorted(by_customer.items(), 
                             key=lambda x: x[1]['total'], 
                             reverse=True)
    
    print(f"\nTop 20 Grant Funders:")
    for i, (customer, data) in enumerate(sorted_customers[:20], 1):
        print(f"   {i:2d}. {customer[:60]:<60} ${data['total']:>12,.2f} ({data['count']:>3} inv)")
    
    # Show uncertain invoices
    if uncertain_invoices:
        print("\n" + "=" * 80)
        print("  UNCERTAIN INVOICES (Review These)")
        print("=" * 80)
        print("\nLarge amounts but individual names - might be grants:\n")
        for inv in uncertain_invoices[:20]:
            amt = inv.get('TOTALENTERED', '0')
            print(f"   ${amt:>10} - {inv.get('CUSTOMERNAME', 'N/A')} ({inv.get('WHENCREATED', 'N/A')})")
    
    print("\n" + "=" * 80)
    print("  NEXT STEP: Use the matching UI web tool")
    print("=" * 80)
    print(f"""
The file '{output_file}' is ready for the matching UI.

Run the matching UI:
    python matching_ui.py

Then open your browser to:
    http://localhost:5000

The UI will help you:
• Review all {len(grant_invoices)} grant invoices
• Search for matching Salesforce opportunities
• Save the links automatically
• Handle edge cases and multi-year grants
""")


if __name__ == "__main__":
    asyncio.run(main())

