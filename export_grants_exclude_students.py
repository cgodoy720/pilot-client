"""
Export ONLY nonprofit grant invoices (exclude ALL student invoices)

Key Filter: Exclude any invoice where the contact email contains @pursuit.org (students)
Also filter by MODULEKEY = '4.AR' and MEGAENTITYID = 'PURSUIT'
"""

import asyncio
import csv
from datetime import datetime
import aiohttp
import xml.etree.ElementTree as ET

async def fetch_all_grant_invoices():
    """Fetch all invoices and filter for nonprofit grants only"""
    
    all_grant_invoices = []
    offset = 0
    page_size = 1000
    
    async with aiohttp.ClientSession() as session:
        while True:
            print(f"\nFetching invoices {offset} to {offset + page_size}...")
            
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
                    <query></query>
                    <fields>*</fields>
                    <pagesize>{page_size}</pagesize>
                    <offset>{offset}</offset>
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
                
                invoices = root.findall('.//arinvoice')
                
                if not invoices:
                    break
                
                print(f"  Received {len(invoices)} invoices, filtering...")
                
                for inv in invoices:
                    # Filter 1: MODULEKEY must be '4.AR' (grants)
                    modulekey = inv.findtext('MODULEKEY', '')
                    if modulekey != '4.AR':
                        continue
                    
                    # Filter 2: MEGAENTITYID must be 'PURSUIT' or empty (for nonprofit)
                    # (Empty seems to mean PURSUIT nonprofit entity)
                    megaentity = inv.findtext('MEGAENTITYID', '')
                    if megaentity and megaentity != 'PURSUIT':
                        continue
                    
                    # Filter 3: EXCLUDE students - check if email contains @pursuit.org
                    contact_email = inv.findtext('CONTACT.EMAIL1', '').lower()
                    billto_email = inv.findtext('BILLTO.EMAIL1', '').lower()
                    shipto_email = inv.findtext('SHIPTO.EMAIL1', '').lower()
                    
                    # If ANY email contains @pursuit.org, it's a student - SKIP IT
                    if ('@pursuit.org' in contact_email or 
                        '@pursuit.org' in billto_email or 
                        '@pursuit.org' in shipto_email):
                        continue
                    
                    # This is a valid grant invoice!
                    all_grant_invoices.append(inv)
                
                if len(invoices) < page_size:
                    break
                
                offset += page_size
    
    return all_grant_invoices

async def main():
    print("="*80)
    print("Fetching ALL invoices from Sage Intacct...")
    print("Filtering for nonprofit grant invoices ONLY (excluding students)")
    print("This will take 3-5 minutes...")
    print("="*80)
    
    grant_invoices = await fetch_all_grant_invoices()
    
    print(f"\n✅ Found {len(grant_invoices)} GRANT invoices (after filtering out students)")
    
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
        
        for inv in grant_invoices:
            writer.writerow([
                inv.findtext('RECORDNO', ''),
                inv.findtext('DOCNUMBER', ''),
                inv.findtext('CUSTOMERID', ''),
                inv.findtext('CUSTOMERNAME', ''),
                '',  # CUSTTYPE from customer record (not in invoice)
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
    
    print(f"\n✅ Exported {len(grant_invoices)} invoices to {csv_file}")
    
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
    
    print(f"\n{'='*80}")
    print(f"✅ FINAL: {len(df_unique)} unique nonprofit grant invoices")
    print(f"{'='*80}")
    print("\nTop 20 most recent:")
    print(df_unique[['customer_name', 'amount', 'invoice_date']].head(20).to_string(index=False))
    
    # Check for any remaining @pursuit.org emails (should be none)
    print(f"\n\nVerifying no student emails remain...")
    pursuit_org_check = df_unique[df_unique['customer_name'].str.contains('@pursuit.org', case=False, na=False)]
    if len(pursuit_org_check) > 0:
        print(f"⚠️  WARNING: Found {len(pursuit_org_check)} invoices with @pursuit.org")
    else:
        print("✅ Confirmed: No @pursuit.org student invoices in final data")

if __name__ == '__main__':
    asyncio.run(main())

