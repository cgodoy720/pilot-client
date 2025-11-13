"""Check specific invoices to find what identifies them as student invoices"""
import asyncio
import aiohttp
import xml.etree.ElementTree as ET

async def check_invoice(invoice_id):
    """Check a specific invoice's details including line items"""
    
    # Build XML request
    xml_request = f"""<?xml version="1.0" encoding="UTF-8"?>
<request>
    <control>
        <senderid>pursuit</senderid>
        <password>Pursuit1234!</password>
        <controlid>check-invoice</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
        <includewhitespace>false</includewhitespace>
    </control>
    <operation>
        <authentication>
            <userid>Pursuit Systems</userid>
            <companyid>pursuit</companyid>
            <password>Queenstech!23</password>
        </authentication>
        <content>
            <function controlid="readInvoice">
                <readByQuery>
                    <object>ARINVOICE</object>
                    <query>RECORDNO = '{invoice_id}'</query>
                    <fields>*</fields>
                    <pagesize>1</pagesize>
                </readByQuery>
            </function>
        </content>
    </operation>
</request>"""
    
    async with aiohttp.ClientSession() as session:
        async with session.post(
            'https://api.intacct.com/ia/xml/xmlgw.phtml',
            data=xml_request,
            headers={'Content-Type': 'application/xml'}
        ) as response:
            xml_text = await response.text()
            root = ET.fromstring(xml_text)
            
            # Parse invoice
            for invoice in root.findall('.//arinvoice'):
                customer = invoice.findtext('BILLTONAME', 'N/A')
                amount = invoice.findtext('TOTALDUE', '0')
                modulekey = invoice.findtext('MODULEKEY', 'N/A')
                
                print(f"\n{'='*80}")
                print(f"Invoice ID: {invoice_id}")
                print(f"Customer: {customer}")
                print(f"Amount: ${amount}")
                print(f"MODULEKEY: {modulekey}")
                
                # Check line items for DEPARTMENTID
                items = invoice.find('ARINVOICEITEMS')
                if items is not None:
                    line_items = items.findall('arinvoiceitem')
                    print(f"Line Items: {len(line_items)}")
                    
                    for i, item in enumerate(line_items, 1):
                        dept_id = item.findtext('DEPARTMENTID', 'NONE')
                        account = item.findtext('ACCOUNTNO', 'N/A')
                        item_amount = item.findtext('AMOUNT', '0')
                        
                        print(f"  Item {i}: DEPARTMENTID={dept_id}, ACCOUNT={account}, AMOUNT=${item_amount}")
                        
                        if dept_id == '304':
                            print(f"    ⚠️  THIS IS A STUDENT INVOICE (DEPT 304)")
                else:
                    print("  No line items found")

async def main():
    # Check known student invoices
    student_invoices = [
        ('25838', 'Abubakar Adams'),
        ('29386', 'Loren Smith'),
        ('30264', 'Kamesh Karra')
    ]
    
    print("Checking suspected student invoices...")
    print("Looking for DEPARTMENTID = '304' on line items")
    
    for invoice_id, name in student_invoices:
        await check_invoice(invoice_id)
    
    print(f"\n{'='*80}")
    print("\nNow checking a known foundation grant for comparison...")
    await check_invoice('30302')  # Mizuho USA Foundation

if __name__ == '__main__':
    asyncio.run(main())

