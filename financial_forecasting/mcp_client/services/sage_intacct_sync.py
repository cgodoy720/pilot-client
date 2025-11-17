"""Synchronous Sage Intacct service for financial forecasting system."""

import xml.etree.ElementTree as ET
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
import os


class SageIntacctService:
    """Synchronous Sage Intacct API client.
    
    Sage Intacct Data Structure:
    - CUSTOMER: Represents funders/grantors
    - ARINVOICE: Invoices for grants
        - RECORDNO: Unique invoice ID
        - CUSTOMERID: Links to customer
        - TOTALDUE: Invoice amount
        - STATE: Draft, Sent, Paid, etc.
    - ARPAYMENT: Payments received
        - RECORDNO: Unique payment ID
        - CUSTOMERID: Links to customer
        - INVOICES: Links to one or more invoices
        - PAYMENTAMOUNT: Amount paid
    
    KEY INSIGHT: In Sage, payments are applied TO invoices, not directly to grants.
    """
    
    def __init__(self, config: Dict[str, str]):
        """Initialize with Sage credentials."""
        self.company_id = config.get('company_id')
        self.user_id = config.get('user_id')
        self.user_password = config.get('user_password')
        self.sender_id = config.get('sender_id')
        self.sender_password = config.get('sender_password')
        self.endpoint_url = config.get('endpoint_url', 'https://api.intacct.com/ia/xml/xmlgw.phtml')
        
        # Validate credentials
        if not all([self.company_id, self.user_id, self.user_password, self.sender_id, self.sender_password]):
            raise ValueError("Missing required Sage Intacct credentials")
        
        self.session_id = None
        self.endpoint_url_session = None
    
    def authenticate(self) -> bool:
        """Authenticate and get session."""
        try:
            auth_xml = self._create_auth_request()
            response = requests.post(
                self.endpoint_url,
                data=auth_xml,
                headers={'Content-Type': 'application/xml'}
            )
            
            if response.status_code == 200:
                return self._parse_auth_response(response.text)
            return False
        except Exception as e:
            print(f"Sage authentication error: {e}")
            return False
    
    def _create_auth_request(self) -> str:
        """Create XML authentication request."""
        control_id = f"auth-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        return f"""<?xml version="1.0" encoding="UTF-8"?>
<request>
    <control>
        <senderid>{self.sender_id}</senderid>
        <password>{self.sender_password}</password>
        <controlid>{control_id}</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
    </control>
    <operation>
        <authentication>
            <login>
                <userid>{self.user_id}</userid>
                <companyid>{self.company_id}</companyid>
                <password>{self.user_password}</password>
            </login>
        </authentication>
        <content>
            <function controlid="get-session">
                <getAPISession></getAPISession>
            </function>
        </content>
    </operation>
</request>"""
    
    def _parse_auth_response(self, response_xml: str) -> bool:
        """Parse authentication response."""
        try:
            root = ET.fromstring(response_xml)
            status = root.find('.//authentication/status')
            
            if status is not None and status.text == 'success':
                session_id = root.find('.//sessionid')
                endpoint = root.find('.//endpoint')
                
                if session_id is not None and endpoint is not None:
                    self.session_id = session_id.text
                    self.endpoint_url_session = endpoint.text
                    return True
            
            error = root.find('.//error/description2')
            if error is not None:
                print(f"Sage auth error: {error.text}")
            
            return False
        except Exception as e:
            print(f"Failed to parse auth response: {e}")
            return False
    
    def _make_api_request(self, function_xml: str) -> Dict[str, Any]:
        """Make authenticated API request."""
        if not self.session_id:
            if not self.authenticate():
                raise Exception("Failed to authenticate with Sage Intacct")
        
        control_id = f"request-{datetime.now().strftime('%Y%m%d%H%M%S%f')}"
        request_xml = f"""<?xml version="1.0" encoding="UTF-8"?>
<request>
    <control>
        <senderid>{self.sender_id}</senderid>
        <password>{self.sender_password}</password>
        <controlid>{control_id}</controlid>
        <uniqueid>false</uniqueid>
        <dtdversion>3.0</dtdversion>
    </control>
    <operation>
        <authentication>
            <sessionid>{self.session_id}</sessionid>
        </authentication>
        <content>
            {function_xml}
        </content>
    </operation>
</request>"""
        
        response = requests.post(
            self.endpoint_url_session or self.endpoint_url,
            data=request_xml,
            headers={'Content-Type': 'application/xml'}
        )
        
        if response.status_code != 200:
            raise Exception(f"API request failed with status: {response.status_code}")
        
        return self._parse_api_response(response.text)
    
    def _parse_api_response(self, response_xml: str) -> Dict[str, Any]:
        """Parse API response."""
        try:
            root = ET.fromstring(response_xml)
            status = root.find('.//operation/result/status')
            
            if status is not None and status.text == 'success':
                # Try to find invoice ID in various places
                # create_invoice returns <key> element under result
                result_element = root.find('.//operation/result')
                
                if result_element is not None:
                    # Check for key element directly under result (for create operations)
                    key_elem = result_element.find('key')
                    if key_elem is not None and key_elem.text:
                        return {
                            'success': True,
                            'invoice_id': key_elem.text,
                            'RECORDNO': key_elem.text
                        }
                
                # For read operations, check data element
                data_element = root.find('.//operation/result/data')
                
                if data_element is not None:
                    # Check for key attribute on data element
                    key_attr = data_element.get('key')
                    if key_attr:
                        return {
                            'success': True,
                            'invoice_id': key_attr,
                            'RECORDNO': key_attr
                        }
                    
                    # Check for RECORDNO child element
                    recordno = data_element.find('RECORDNO')
                    if recordno is not None and recordno.text:
                        return {
                            'success': True,
                            'invoice_id': recordno.text,
                            'RECORDNO': recordno.text
                        }
                    
                    # Check for key child element
                    key_elem = data_element.find('key')
                    if key_elem is not None and key_elem.text:
                        return {
                            'success': True,
                            'invoice_id': key_elem.text,
                            'RECORDNO': key_elem.text
                        }
                    
                    # Return full data dict
                    return {
                        'success': True,
                        'data': self._xml_to_dict(data_element),
                        'raw_xml': response_xml[:2000]  # First 2000 chars for debugging
                    }
                
                # No data element - might still be success
                return {
                    'success': True,
                    'raw_xml': response_xml[:2000]  # First 2000 chars for debugging
                }
            
            # Handle errors
            errors = []
            for error in root.findall('.//error'):
                desc = error.find('description2')
                if desc is not None:
                    errors.append(desc.text)
            
            return {
                'success': False,
                'errors': errors,
                'response_xml': response_xml  # Include for debugging
            }
        
        except Exception as e:
            return {
                'success': False,
                'errors': [f"Failed to parse response: {str(e)}"],
                'response_xml': response_xml
            }
    
    def _xml_to_dict(self, element) -> Dict[str, Any]:
        """Convert XML element to dict, handling multiple elements with same tag."""
        result = {}
        for child in element:
            if len(child) == 0:
                # Leaf node
                value = child.text
            else:
                # Nested element
                value = self._xml_to_dict(child)
            
            # Handle multiple elements with same tag (create list)
            if child.tag in result:
                # Already exists - convert to list or append
                if not isinstance(result[child.tag], list):
                    result[child.tag] = [result[child.tag]]
                result[child.tag].append(value)
            else:
                result[child.tag] = value
        
        return result
    
    def create_invoice(
        self,
        customer_id: str,
        amount: float,
        description: str,
        invoice_date: str,
        due_date: Optional[str] = None,
        line_items: Optional[List[Dict[str, Any]]] = None
    ) -> Dict[str, Any]:
        """Create invoice in Sage Intacct.
        
        Args:
            customer_id: Sage customer ID (e.g., "ACME Foundation")
            amount: Total invoice amount
            description: Invoice description (grant name)
            invoice_date: Invoice date (YYYY-MM-DD format)
            due_date: Payment due date (YYYY-MM-DD format)
            line_items: Optional line items (otherwise creates single line)
        
        Returns:
            Dict with invoice_id and success status
        
        Note: After creating invoice in Sage, payments received will be
        applied to this invoice (not directly to the grant).
        """
        # Convert date format from YYYY-MM-DD to MM/DD/YYYY for Sage
        invoice_date_parts = invoice_date.split('-')
        invoice_date_formatted = f"{invoice_date_parts[1]}/{invoice_date_parts[2]}/{invoice_date_parts[0]}"
        
        # Create line items XML
        if not line_items:
            line_items = [{
                'description': description,
                'amount': amount,
                'glaccountno': '4010'  # Individual contributions (from actual Sage GL accounts)
            }]
        
        line_items_xml = ""
        for item in line_items:
            # Use actual GL account from Sage instance (4010 = Individual contributions)
            gl_account = item.get('glaccountno', '4010')
            
            line_items_xml += f"""
            <lineitem>
                <glaccountno>{gl_account}</glaccountno>
                <amount>{item.get('amount', 0)}</amount>
                <memo>{item.get('description', '')}</memo>
                <locationid>PURSUIT</locationid>
                <departmentid>204</departmentid>
                <classid>10</classid>
            </lineitem>"""
        
        # Build due date XML if provided
        due_date_xml = ""
        if due_date:
            due_parts = due_date.split('-')
            due_date_xml = f"""
                <datedue>
                    <year>{due_parts[0]}</year>
                    <month>{due_parts[1]}</month>
                    <day>{due_parts[2]}</day>
                </datedue>"""
        
        function_xml = f"""
        <function controlid="create-invoice">
            <create_invoice>
                <customerid>{customer_id}</customerid>
                <datecreated>
                    <year>{invoice_date_parts[0]}</year>
                    <month>{invoice_date_parts[1]}</month>
                    <day>{invoice_date_parts[2]}</day>
                </datecreated>
                {due_date_xml}
                <action>Submit</action>
                <invoiceitems>
                    {line_items_xml}
                </invoiceitems>
            </create_invoice>
        </function>"""
        
        try:
            result = self._make_api_request(function_xml)
            return result
        except Exception as e:
            return {
                'success': False,
                'errors': [str(e)]
            }
    
    def send_invoice_email(self, invoice_record_no: str, email_to: str = None) -> Dict[str, Any]:
        """Send invoice email via Sage Intacct.
        
        Args:
            invoice_record_no: The RECORDNO of the invoice (not the invoice number)
            email_to: Optional email address to override customer default
        
        Returns:
            Dict with success status
        """
        # Sage uses ARINVOICE_EMAIL function to send invoice emails
        email_options = f"<to>{email_to}</to>" if email_to else ""
        
        function_xml = f"""
        <function controlid="email-invoice">
            <emailInvoice>
                <invoicekey>{invoice_record_no}</invoicekey>
                {email_options}
            </emailInvoice>
        </function>"""
        
        try:
            result = self._make_api_request(function_xml)
            return result
        except Exception as e:
            return {
                'success': False,
                'errors': [str(e)]
            }
    
    def get_invoice(self, invoice_id: str) -> Dict[str, Any]:
        """Get invoice details by ID.
        
        Returns invoice with payment status - useful for syncing back to Salesforce.
        Includes DELIVERY_OPTIONS to check if invoice was emailed.
        """
        function_xml = f"""
        <function controlid="get-invoice">
            <read>
                <object>ARINVOICE</object>
                <keys>{invoice_id}</keys>
                <fields>RECORDNO,RECORDID,STATE,TOTALENTERED,TOTALDUE,WHENCREATED,WHENMODIFIED,WHENPAID,DELIVERY_OPTIONS</fields>
            </read>
        </function>"""
        
        return self._make_api_request(function_xml)
    
    def get_invoice_payments(self, invoice_id: str) -> Dict[str, Any]:
        """Get payments applied to an invoice.
        
        This is KEY for syncing: when payments are received in Sage and applied
        to an invoice, we need to sync that back to Salesforce to mark the
        npe01__OppPayment__c records as paid.
        """
        function_xml = f"""
        <function controlid="get-invoice-payments">
            <readByQuery>
                <object>ARPAYMENT</object>
                <query>INVOICES = '{invoice_id}'</query>
                <fields>*</fields>
                <pagesize>100</pagesize>
            </readByQuery>
        </function>"""
        
        return self._make_api_request(function_xml)
    
    def get_customer(self, customer_id: str) -> Dict[str, Any]:
        """Get customer details."""
        function_xml = f"""
        <function controlid="get-customer">
            <read>
                <object>CUSTOMER</object>
                <keys>{customer_id}</keys>
                <fields>*</fields>
            </read>
        </function>"""
        
        return self._make_api_request(function_xml)

