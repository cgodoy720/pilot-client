#!/usr/bin/env python3
"""
Get ALL invoices and payments with proper pagination.
Sage Intacct returns max 1000 records per request - need to paginate.
"""

import asyncio
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def get_all_records(sage, record_type='invoices'):
    """Get all records with pagination."""
    all_records = []
    offset = 0
    page_size = 1000
    
    print(f"\n📊 Fetching all {record_type}...")
    
    while True:
        # Get a page of results
        if record_type == 'invoices':
            response = await sage.get_invoices(limit=page_size)
        elif record_type == 'payments':
            response = await sage.get_payments(limit=page_size)
        elif record_type == 'customers':
            response = await sage.get_customers(limit=page_size)
        else:
            break
        
        if not response.get('success'):
            print(f"❌ Error fetching {record_type}: {response.get('errors')}")
            break
        
        # Extract records
        data = response.get('data', {})
        
        if isinstance(data, dict):
            # Check for pagination info
            count = int(data.get('count', 0))
            total_count = int(data.get('totalcount', 0))
            num_remaining = int(data.get('numremaining', 0))
            
            print(f"   Page: {len(all_records)} records so far, {num_remaining} remaining...")
            
            # Get the actual records
            records = None
            if record_type == 'invoices' and 'arinvoice' in data:
                records = data['arinvoice']
            elif record_type == 'payments' and 'arpayment' in data:
                records = data['arpayment']
            elif record_type == 'customers' and 'customer' in data:
                records = data['customer']
            
            if records:
                if isinstance(records, list):
                    all_records.extend(records)
                else:
                    all_records.append(records)
            
            # Check if there are more results
            if num_remaining == 0 or count == 0:
                break
                
            # If we got the full page, there might be more
            if count < page_size:
                break
                
            offset += page_size
            
        elif isinstance(data, list):
            all_records.extend(data)
            if len(data) < page_size:
                break
            offset += page_size
        else:
            break
        
        # Safety check - don't loop forever
        if len(all_records) > 50000:
            print(f"⚠️  Stopping at 50,000 records (safety limit)")
            break
    
    print(f"✅ Total {record_type}: {len(all_records)}")
    return all_records


async def analyze_by_year(records, date_field, amount_field):
    """Analyze records by year."""
    by_year = {}
    
    for record in records:
        date_str = record.get(date_field, '')
        if not date_str or date_str == 'N/A':
            year = 'Unknown'
        else:
            try:
                # Parse date like "05/13/2024"
                parts = date_str.split('/')
                if len(parts) == 3:
                    year = parts[2]
                else:
                    year = 'Unknown'
            except:
                year = 'Unknown'
        
        if year not in by_year:
            by_year[year] = {'count': 0, 'total': 0, 'records': []}
        
        by_year[year]['count'] += 1
        by_year[year]['records'].append(record)
        
        try:
            amount = float(str(record.get(amount_field, '0')).replace(',', ''))
            by_year[year]['total'] += amount
        except:
            pass
    
    return by_year


async def main():
    """Get ALL data with pagination."""
    
    print("\n" + "=" * 80)
    print("  COMPREHENSIVE DATA EXTRACTION (ALL YEARS, ALL RECORDS)")
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
    
    # Get ALL invoices
    print("=" * 80)
    print("  INVOICES")
    print("=" * 80)
    all_invoices = await get_all_records(sage, 'invoices')
    
    # Analyze invoices by year
    invoices_by_year = await analyze_by_year(all_invoices, 'WHENCREATED', 'TOTALENTERED')
    
    print(f"\n📊 Invoice Summary by Year:")
    print(f"{'Year':<10} {'Count':>10} {'Total Amount':>20}")
    print("-" * 50)
    
    total_invoices = 0
    total_amount = 0
    
    for year in sorted(invoices_by_year.keys(), reverse=True):
        data = invoices_by_year[year]
        print(f"{year:<10} {data['count']:>10} ${data['total']:>18,.2f}")
        total_invoices += data['count']
        total_amount += data['total']
    
    print("-" * 50)
    print(f"{'TOTAL':<10} {total_invoices:>10} ${total_amount:>18,.2f}")
    
    # Get ALL payments
    print("\n" + "=" * 80)
    print("  PAYMENTS")
    print("=" * 80)
    all_payments = await get_all_records(sage, 'payments')
    
    # Analyze payments by year
    payments_by_year = await analyze_by_year(all_payments, 'PAYMENTDATE', 'PAYMENTAMOUNT')
    
    print(f"\n📊 Payment Summary by Year:")
    print(f"{'Year':<10} {'Count':>10} {'Total Amount':>20}")
    print("-" * 50)
    
    total_payments = 0
    total_paid = 0
    
    for year in sorted(payments_by_year.keys(), reverse=True):
        data = payments_by_year[year]
        print(f"{year:<10} {data['count']:>10} ${data['total']:>18,.2f}")
        total_payments += data['count']
        total_paid += data['total']
    
    print("-" * 50)
    print(f"{'TOTAL':<10} {total_payments:>10} ${total_paid:>18,.2f}")
    
    # Get ALL customers
    print("\n" + "=" * 80)
    print("  CUSTOMERS")
    print("=" * 80)
    all_customers = await get_all_records(sage, 'customers')
    
    print(f"\n📊 Total Customers: {len(all_customers)}")
    
    # Summary
    print("\n" + "=" * 80)
    print("  COMPLETE DATA SUMMARY")
    print("=" * 80)
    print(f"""
📈 TOTALS ACROSS ALL YEARS:
   • Invoices: {total_invoices:,} records (${total_amount:,.2f})
   • Payments: {total_payments:,} records (${total_paid:,.2f})
   • Customers: {len(all_customers):,} records
   
📅 DATE RANGE:
   • Earliest invoice: {min(invoices_by_year.keys())}
   • Latest invoice: {max([y for y in invoices_by_year.keys() if y != 'Unknown'])}
   • Earliest payment: {min(payments_by_year.keys())}
   • Latest payment: {max([y for y in payments_by_year.keys() if y != 'Unknown'])}

💰 FINANCIAL SUMMARY:
   • Total Invoiced: ${total_amount:,.2f}
   • Total Paid: ${total_paid:,.2f}
   • Outstanding: ${total_amount - total_paid:,.2f}
   • Collection Rate: {(total_paid/total_amount*100) if total_amount > 0 else 0:.1f}%
""")
    
    # Identify grants vs students
    print("\n" + "=" * 80)
    print("  CATEGORIZING INVOICES")
    print("=" * 80)
    
    grant_keywords = ['foundation', 'fund', 'llc', 'inc', 'corp', 'trust',
                     'company', 'group', 'ventures', 'capital', 'bank',
                     'department', 'city', 'federal', 'state', 'government']
    
    grant_invoices = []
    student_invoices = []
    
    for inv in all_invoices:
        customer_name = inv.get('CUSTOMERNAME', '').lower()
        amount = 0
        try:
            amount = float(str(inv.get('TOTALENTERED', '0')).replace(',', ''))
        except:
            pass
        
        is_grant = any(keyword in customer_name for keyword in grant_keywords)
        
        if is_grant or amount >= 10000:
            grant_invoices.append(inv)
        else:
            student_invoices.append(inv)
    
    grant_total = sum(float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) 
                     for inv in grant_invoices)
    student_total = sum(float(str(inv.get('TOTALENTERED', '0')).replace(',', '')) 
                       for inv in student_invoices)
    
    print(f"\n🏢 Grant/Corporate Invoices: {len(grant_invoices):,} (${grant_total:,.2f})")
    print(f"👤 Student/Individual Invoices: {len(student_invoices):,} (${student_total:,.2f})")
    
    print(f"\n✅ Ready to export full dataset!")
    print(f"\nNext: Run find_all_grants.py to export just the grant invoices")


if __name__ == "__main__":
    asyncio.run(main())

