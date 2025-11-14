"""
Export ONLY nonprofit grant invoices (exclude ALL student invoices)

Uses correct Sage Intacct pagination with resultId
"""

import asyncio
import csv
from datetime import datetime
import aiohttp
import xml.etree.ElementTree as ET

async def fetch_invoices_batch(session, result_id=None):
    """Fetch a batch of invoices using proper Sage pagination"""
    
    page_size = 2000
    
    if result_id:
        # Continue from previous result
        xml_request = f"""<?xml version="1.0" encoding="UTF-8"?>
<request>
    <control>
        <senderid>pursuit</senderid>
        <password>Pursuit1234!</password>
        <controlid>fetch</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
    </control>
    <operation>
        <authentication>
            <login>
                <userid>Pursuit Systems</userid>
                <companyid>pursuit</companyid>
                <password>Queenstech!23</password>
            </login>
        </authentication>
        <content>
            <function controlid="readMore">
                <readMore>
                    <resultId>{result_id}</resultId>
                </readMore>
            </function>
        </content>
    </operation>
</request>"""
    else:
        # Initial query
        xml_request = f"""<?xml version="1.0" encoding="UTF-8"?>
<request>
    <control>
        <senderid>pursuit</senderid>
        <password>Pursuit1234!</password>
        <controlid>fetch</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
    </control>
    <operation>
        <authentication>
            <login>
                <userid>Pursuit Systems</userid>
                <companyid>pursuit</companyid>
                <password>Queenstech!23</password>
            </login>
        </authentication>
        <content>
            <function controlid="read">
                <readByQuery>
                    <object>ARINVOICE</object>
                    <query>MODULEKEY = '4.AR'</query>
                    <fields>*</fields>
                    <pagesize>{page_size}</pagesize>
                </readByQuery>
            </function>
        </content>
    </operation>
</request>"""
    
    async with session.post(
        'https://api.intacct.com/ia/xml/xmlgw.phtml',
        data=xml_request,
        headers={'Content-Type': 'application/xml'}
    ) as response:
        xml_text = await response.text()
        root = ET.fromstring(xml_text)
        
        # Check for errors
        errors = root.findall('.//error')
        if errors:
            error_msg = errors[0].findtext('description2', 'Unknown error')
            print(f"  ⚠️ API Error: {error_msg}")
            return [], None, 0
        
        # Get invoices
        invoices = root.findall('.//arinvoice')
        
        # Get pagination info
        data_elem = root.find('.//data')
        new_result_id = data_elem.get('resultId', '') if data_elem is not None else ''
        num_remaining = int(data_elem.get('numremaining', 0)) if data_elem is not None else 0
        
        return invoices, new_result_id, num_remaining

async def main():
    print("="*80)
    print("Fetching grant invoices from Sage Intacct (MODULEKEY='4.AR')...")
    print("Filtering out student invoices (@pursuit.org emails)")
    print("="*80)
    
    all_grant_invoices = []
    result_id = None
    batch_num = 0
    
    async with aiohttp.ClientSession() as session:
        while True:
            batch_num += 1
            print(f"\nBatch {batch_num}...")
            
            invoices, result_id, num_remaining = await fetch_invoices_batch(session, result_id)
            
            if not invoices:
                print("  No more invoices")
                break
            
            print(f"  Received {len(invoices)} invoices ({num_remaining} remaining), filtering...")
            
            grants_in_batch = 0
            students_in_batch = 0
            
            for inv in invoices:
                # Check email fields for @pursuit.org (students)
                contact_email = inv.findtext('CONTACT.EMAIL1', '').lower()
                billto_email = inv.findtext('BILLTO.EMAIL1', '').lower()
                shipto_email = inv.findtext('SHIPTO.EMAIL1', '').lower()
                
                # If ANY email contains @pursuit.org, it's a student - SKIP IT
                if ('@pursuit.org' in contact_email or 
                    '@pursuit.org' in billto_email or 
                    '@pursuit.org' in shipto_email):
                    students_in_batch += 1
                    continue
                
                # This is a valid grant invoice!
                all_grant_invoices.append(inv)
                grants_in_batch += 1
            
            print(f"  ✅ {grants_in_batch} grants, ❌ {students_in_batch} students filtered out")
            print(f"  Total grants so far: {len(all_grant_invoices)}")
            
            if num_remaining == 0:
                print("\n  ✅ Reached end of results")
                break
    
    print(f"\n{'='*80}")
    print(f"✅ Found {len(all_grant_invoices)} GRANT invoices (after filtering)")
    print(f"{'='*80}")
    
    # Export to CSV
    csv_file = 'nonprofit_grant_invoices.csv'
    with open(csv_file, 'w', newline='') as f:
        writer = csv.writer(f)
        writer.writerow([
            'invoice_id',
            'invoice_number',
            'customer_id',
            'customer_name',
            'customer_type',
            'amount',
            'due_amount',
            'invoice_date',
            'due_date',
            'state',
            'description',
            'entity_id',
            'entity_name',
            'module_key'
        ])
        
        for inv in all_grant_invoices:
            writer.writerow([
                inv.findtext('RECORDNO', ''),
                inv.findtext('DOCNUMBER', ''),
                inv.findtext('CUSTOMERID', ''),
                inv.findtext('CUSTOMERNAME', ''),
                '',  # CUSTTYPE
                inv.findtext('TOTALENTERED', 0),
                inv.findtext('TOTALDUE', 0),
                inv.findtext('WHENCREATED', ''),
                inv.findtext('WHENDUE', ''),
                inv.findtext('STATE', ''),
                inv.findtext('DESCRIPTION', ''),
                inv.findtext('MEGAENTITYID', ''),
                inv.findtext('MEGAENTITYNAME', ''),
                inv.findtext('MODULEKEY', '')
            ])
    
    print(f"\n✅ Exported {len(all_grant_invoices)} invoices to {csv_file}")
    
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
    
    df_unique.loc[:, 'date_parsed'] = df_unique['invoice_date'].apply(parse_date)
    df_unique = df_unique.sort_values('date_parsed', ascending=False)
    df_unique = df_unique.drop('date_parsed', axis=1)
    
    df_unique.to_csv(csv_file, index=False)
    
    print(f"\n{'='*80}")
    print(f"✅ FINAL: {len(df_unique)} unique nonprofit grant invoices")
    print(f"{'='*80}")
    print("\nTop 20 most recent:")
    print(df_unique[['customer_name', 'amount', 'invoice_date']].head(20).to_string(index=False))

if __name__ == '__main__':
    asyncio.run(main())

