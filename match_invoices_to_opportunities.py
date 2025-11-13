#!/usr/bin/env python3
"""
Match Sage Intacct Invoices to Salesforce Opportunities
Creates a matching report for review before linking.
"""

import asyncio
import json
import csv
from datetime import datetime, timedelta
from difflib import SequenceMatcher
from mcp_client.services.sage_intacct import SageIntacctMCPService
from mcp_client.services.salesforce import SalesforceMCPService


def normalize_name(name):
    """Normalize company names for matching."""
    if not name:
        return ""
    
    # Convert to lowercase
    name = name.lower().strip()
    
    # Remove common suffixes
    suffixes = [
        'inc.', 'inc', 'llc', 'llc.', 'corporation', 'corp', 'corp.',
        'foundation', 'charitable foundation', 'usa', 'services'
    ]
    for suffix in suffixes:
        name = name.replace(suffix, '')
    
    # Remove extra whitespace
    name = ' '.join(name.split())
    
    return name


def name_similarity(name1, name2):
    """Calculate similarity between two names (0.0 to 1.0)."""
    norm1 = normalize_name(name1)
    norm2 = normalize_name(name2)
    
    if not norm1 or not norm2:
        return 0.0
    
    # Exact match after normalization
    if norm1 == norm2:
        return 1.0
    
    # Check if one contains the other
    if norm1 in norm2 or norm2 in norm1:
        return 0.9
    
    # Calculate sequence similarity
    return SequenceMatcher(None, norm1, norm2).ratio()


def amount_similarity(amount1, amount2, tolerance=0.05):
    """Check if amounts are similar within tolerance."""
    try:
        amt1 = float(str(amount1).replace(',', ''))
        amt2 = float(str(amount2).replace(',', ''))
        
        if amt1 == 0 or amt2 == 0:
            return 0.0
        
        # Calculate percentage difference
        diff = abs(amt1 - amt2) / max(amt1, amt2)
        
        if diff == 0:
            return 1.0
        elif diff <= tolerance:
            return 0.9
        elif diff <= tolerance * 2:
            return 0.7
        else:
            return 0.0
            
    except (ValueError, TypeError):
        return 0.0


def date_proximity(date1_str, date2_str, max_days=90):
    """Calculate date proximity score (1.0 if within max_days)."""
    try:
        # Parse dates - handle different formats
        if '/' in date1_str:
            date1 = datetime.strptime(date1_str, '%m/%d/%Y')
        else:
            date1 = datetime.strptime(date1_str, '%Y-%m-%d')
        
        if '/' in date2_str:
            date2 = datetime.strptime(date2_str, '%m/%d/%Y')
        else:
            date2 = datetime.strptime(date2_str, '%Y-%m-%d')
        
        days_diff = abs((date1 - date2).days)
        
        if days_diff == 0:
            return 1.0
        elif days_diff <= max_days:
            return 1.0 - (days_diff / max_days) * 0.3  # 0.7 to 1.0
        else:
            return max(0.0, 0.7 - (days_diff - max_days) / 365 * 0.5)
            
    except (ValueError, TypeError):
        return 0.0


def calculate_match_score(invoice, opportunity):
    """Calculate overall match score between invoice and opportunity."""
    
    # Name similarity (weight: 40%)
    name_score = name_similarity(
        invoice.get('CUSTOMERNAME', ''),
        opportunity.get('Account', {}).get('Name', '')
    )
    
    # Amount similarity (weight: 35%)
    amount_score = amount_similarity(
        invoice.get('TOTALENTERED', 0),
        opportunity.get('Amount', 0)
    )
    
    # Date proximity (weight: 25%)
    date_score = date_proximity(
        invoice.get('WHENCREATED', ''),
        opportunity.get('CloseDate', '')
    )
    
    # Weighted average
    total_score = (name_score * 0.4) + (amount_score * 0.35) + (date_score * 0.25)
    
    return {
        'total': total_score,
        'name': name_score,
        'amount': amount_score,
        'date': date_score
    }


async def main():
    """Match invoices to opportunities."""
    
    print("\n" + "=" * 80)
    print("  SAGE INTACCT ↔ SALESFORCE MATCHING TOOL")
    print("=" * 80)
    
    # Initialize services
    class MockClient:
        available_tools = {}
    
    client = MockClient()
    
    # Connect to Sage Intacct
    print("\n🔐 Connecting to Sage Intacct...")
    sage = SageIntacctMCPService(
        client=client,
        company_id="pursuit",
        user_id="Pursuit Systems",
        user_password="Queenstech!23",
        sender_id="pursuit",
        sender_password="Pursuit1234!"
    )
    
    if not await sage.authenticate():
        print("❌ Sage Intacct authentication failed!")
        return
    
    print("✅ Sage Intacct connected")
    
    # Connect to Salesforce
    print("\n🔐 Connecting to Salesforce...")
    # Note: Add your Salesforce credentials here
    print("⚠️  Salesforce connection not yet configured")
    print("   For now, we'll analyze Sage Intacct data only\n")
    
    # Get Sage Intacct invoices
    print("📊 Fetching Sage Intacct invoices...")
    invoices_response = await sage.get_invoices(limit=1000)
    
    if not invoices_response.get('success'):
        print("❌ Failed to fetch invoices")
        return
    
    # Extract and filter large invoices (grants)
    all_records = []
    data = invoices_response.get('data', {})
    
    if isinstance(data, dict) and 'arinvoice' in data:
        all_records = data['arinvoice']
    elif isinstance(data, list):
        all_records = data
    
    large_invoices = []
    for inv in all_records:
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
            if amount >= 10000:  # Consider invoices >= $10K as grants
                large_invoices.append(inv)
        except:
            pass
    
    print(f"✅ Found {len(large_invoices)} grant invoices (>=$10,000)")
    
    # Export to CSV for review
    output_file = 'sage_grant_invoices.csv'
    
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
            'Notes_for_Matching'
        ]
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        
        for inv in sorted(large_invoices, key=lambda x: x.get('WHENCREATED', ''), reverse=True):
            writer.writerow({
                'Invoice_Record_No': inv.get('RECORDNO', ''),
                'Customer_Name': inv.get('CUSTOMERNAME', ''),
                'Customer_ID': inv.get('CUSTOMERID', ''),
                'Invoice_Amount': inv.get('TOTALENTERED', ''),
                'Invoice_Date': inv.get('WHENCREATED', ''),
                'Doc_Number': inv.get('DOCNUMBER', ''),
                'Status': inv.get('STATE', ''),
                'Total_Due': inv.get('TOTALDUE', ''),
                'Notes_for_Matching': ''  # For manual review
            })
    
    print(f"\n✅ Exported {len(large_invoices)} invoices to: {output_file}")
    
    # Show summary statistics
    print("\n" + "=" * 80)
    print("  SUMMARY")
    print("=" * 80)
    
    # Group by customer
    by_customer = {}
    total_amount = 0
    total_outstanding = 0
    
    for inv in large_invoices:
        customer = inv.get('CUSTOMERNAME', 'Unknown')
        amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
        outstanding = float(str(inv.get('TOTALDUE', '0')).replace(',', ''))
        
        if customer not in by_customer:
            by_customer[customer] = {
                'count': 0,
                'total': 0,
                'outstanding': 0
            }
        
        by_customer[customer]['count'] += 1
        by_customer[customer]['total'] += amount
        by_customer[customer]['outstanding'] += outstanding
        
        total_amount += amount
        total_outstanding += outstanding
    
    print(f"\n📊 Total Grant Invoices: {len(large_invoices)}")
    print(f"💰 Total Invoiced Amount: ${total_amount:,.2f}")
    print(f"💵 Total Outstanding: ${total_outstanding:,.2f}")
    print(f"✅ Total Paid: ${total_amount - total_outstanding:,.2f}")
    
    print(f"\n🏢 Top 10 Grant Funders by Invoice Amount:")
    sorted_customers = sorted(by_customer.items(), key=lambda x: x[1]['total'], reverse=True)
    for i, (customer, data) in enumerate(sorted_customers[:10], 1):
        print(f"   {i:2d}. {customer[:50]:<50} ${data['total']:>12,.2f} ({data['count']} invoices)")
    
    print("\n" + "=" * 80)
    print("  NEXT STEPS")
    print("=" * 80)
    print(f"""
1. ✅ Review the exported file: {output_file}
2. 📝 In Salesforce, find matching opportunities for each invoice
3. ✍️  Add the Salesforce Opportunity ID in the 'Notes_for_Matching' column
4. 🔗 Run the linking script to save the connections
5. 📊 Dashboard will then show complete pipeline → invoice → payment flow

KEY MATCHING CRITERIA:
- Customer/Account name should match (or be very similar)
- Invoice amount should match opportunity amount (±5%)
- Invoice date should be within ~90 days of close date
- Consider multi-year grants may have multiple invoices per opportunity

EDGE CASES TO WATCH FOR:
- Same customer with multiple concurrent grants
- Multi-year grants with annual invoices
- Amended grant amounts (original opp amount ≠ invoice amount)
- Parent/subsidiary organizations with different names
""")


if __name__ == "__main__":
    asyncio.run(main())

