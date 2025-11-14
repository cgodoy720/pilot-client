#!/usr/bin/env python3
"""Add Invoice_Sent__c checkbox field to Invoice__c object in Salesforce."""

import os
from simple_salesforce import Salesforce
from dotenv import load_dotenv

load_dotenv()

def add_invoice_sent_field():
    """Add Invoice_Sent__c checkbox field to track email delivery status."""
    
    print("=" * 70)
    print("ADD INVOICE_SENT__C FIELD TO SALESFORCE")
    print("=" * 70)
    
    print("\n📋 MANUAL STEPS TO ADD FIELD:")
    print("\n1. Go to Salesforce Setup")
    print("2. Search for 'Object Manager'")
    print("3. Find and click 'Invoice'")
    print("4. Click 'Fields & Relationships'")
    print("5. Click 'New'")
    print("6. Select 'Checkbox' and click 'Next'")
    print("\n7. Enter field details:")
    print("   - Field Label: Invoice Sent")
    print("   - Field Name: Invoice_Sent")
    print("   - Default Value: Unchecked")
    print("   - Description: Indicates whether the invoice email has been sent to the customer")
    print("   - Help Text: Check this box after sending the invoice email via Sage Intacct")
    print("\n8. Click 'Next'")
    print("9. Set Field-Level Security (make visible to all profiles)")
    print("10. Click 'Next'")
    print("11. Add to page layouts if desired")
    print("12. Click 'Save'")
    
    print("\n" + "=" * 70)
    print("✅ After completing these steps, the invoice email workflow will be ready!")
    print("=" * 70)

if __name__ == "__main__":
    add_invoice_sent_field()

