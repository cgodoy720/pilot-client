"""
Export ONLY nonprofit grant invoices (exclude ALL student/Pursuit Bond invoices)

Filters:
1. MODULEKEY = '4.AR' (Accounts Receivable = grants, NOT '8.SO' = Sales Order = students)
2. DEPARTMENTID != '304' on line items (304 = Pursuit Bond students)
3. MEGAENTITYID = 'PURSUIT' (nonprofit entity, not PBC)
4. Exclude customer names containing 'Pursuit Bond' or individual student names
"""

import asyncio
import csv
from datetime import datetime
from mcp_client.services.sage_intacct import SageIntacctService

async def main():
    # Initialize Sage Intacct service
    sage = SageIntacctService()
    sage.company_id = "pursuit"
    sage.user_id = "Pursuit Systems"
    sage.user_password = "Queenstech!23"
    sage.sender_id = "pursuit"
    sage.sender_password = "Pursuit1234!"
    
    print("Fetching ALL invoices from Sage Intacct...")
    print("This will take 3-5 minutes for 100k+ invoices...")
    
    all_invoices = []
    offset = 0
    page_size = 1000
    
    while True:
        print(f"\nFetching invoices {offset} to {offset + page_size}...")
        
        # Get invoices with detailed line items and customer info
        invoices = await sage.call_api(
            'readByQuery',
            {
                'object': 'ARINVOICE',
                'query': '',  # No query = all records
                'fields': '*',  # Get all fields including MODULEKEY
                'pagesize': page_size,
                'offset': offset
            }
        )
        
        if not invoices or len(invoices) == 0:
            break
        
        print(f"  Received {len(invoices)} invoices")
        
        for inv in invoices:
            # Filter 1: MODULEKEY must be '4.AR' (grants), NOT '8.SO' (students)
            modulekey = inv.get('MODULEKEY', '')
            if modulekey != '4.AR':
                continue
            
            # Filter 2: MEGAENTITYID must be 'PURSUIT' (nonprofit), not 'PBC'
            megaentity = inv.get('MEGAENTITYID', '')
            if megaentity != 'PURSUIT':
                continue
            
            # Filter 3: Check line items for DEPARTMENTID = '304' (students)
            line_items = inv.get('ARINVOICEITEMS', {})
            if isinstance(line_items, dict):
                line_items = line_items.get('arinvoiceitem', [])
            if not isinstance(line_items, list):
                line_items = [line_items] if line_items else []
            
            # Skip if ANY line item has DEPARTMENTID = '304'
            has_student_dept = False
            for item in line_items:
                if item.get('DEPARTMENTID') == '304':
                    has_student_dept = True
                    break
            
            if has_student_dept:
                continue
            
            # Filter 4: Exclude known student/bond customer names
            customer_name = inv.get('BILLTONAME', '').lower()
            if 'pursuit bond' in customer_name or 'pbc' in customer_name:
                continue
            
            all_invoices.append(inv)
        
        if len(invoices) < page_size:
            break
        
        offset += page_size
    
    print(f"\n✅ Found {len(all_invoices)} GRANT invoices (after filtering)")
    
    # Export to CSV
    csv_file = 'nonprofit_grant_invoices.csv'
    with open(csv_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            'invoice_id',
            'customer_id',
            'customer_name',
            'customer_type',
            'amount',
            'invoice_date',
            'due_date',
            'state',
            'description',
            'modulekey',
            'megaentity'
        ])
        
        for inv in all_invoices:
            writer.writerow([
                inv.get('RECORDNO', ''),
                inv.get('CUSTOMERID', ''),
                inv.get('BILLTONAME', ''),
                inv.get('CUSTTYPE', ''),  # May be empty
                inv.get('TOTALDUE', 0),
                inv.get('WHENDUE', ''),
                inv.get('WHENPAID', ''),
                inv.get('STATE', ''),
                inv.get('DESCRIPTION', ''),
                inv.get('MODULEKEY', ''),
                inv.get('MEGAENTITYID', '')
            ])
    
    print(f"\n✅ Exported {len(all_invoices)} invoices to {csv_file}")
    
    # Remove duplicates and sort
    import pandas as pd
    df = pd.read_csv(csv_file)
    
    print(f"\nBefore deduplication: {len(df)} rows")
    df_unique = df.drop_duplicates(subset=['invoice_id'])
    print(f"After deduplication: {len(df_unique)} unique invoices")
    
    # Sort by date (most recent first)
    def parse_date(date_str):
        try:
            return datetime.strptime(str(date_str), '%m/%d/%Y')
        except:
            return datetime.min
    
    df_unique['date_parsed'] = df_unique['invoice_date'].apply(parse_date)
    df_unique = df_unique.sort_values('date_parsed', ascending=False)
    df_unique = df_unique.drop('date_parsed', axis=1)
    
    df_unique.to_csv(csv_file, index=False)
    
    print(f"\n✅ Final CSV: {len(df_unique)} unique nonprofit grant invoices")
    print("\nSample of data:")
    print(df_unique[['customer_name', 'amount', 'invoice_date', 'modulekey']].head(20).to_string(index=False))
    
    print("\nMODULEKEY distribution:")
    print(df_unique['modulekey'].value_counts())

if __name__ == '__main__':
    asyncio.run(main())

