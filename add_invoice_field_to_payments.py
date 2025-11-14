#!/usr/bin/env python3
"""
Add Invoice__c lookup field to npe01__OppPayment__c object.

CRITICAL FIX #1: Links Salesforce payments to Sage invoices.

This field enables:
- Tracking which payments belong to which invoice
- Supporting multi-invoice scenarios in Phase 2
- Syncing payment status from Sage back to Salesforce

Run this script ONCE before demo to add the field.
"""

import os
from dotenv import load_dotenv
from simple_salesforce import Salesforce

load_dotenv()

def add_invoice_field():
    """Add Invoice__c lookup field to npe01__OppPayment__c."""
    
    print("=" * 60)
    print("Adding Invoice__c Field to NPSP Payments")
    print("=" * 60)
    
    # Get Salesforce credentials
    username = os.getenv('SALESFORCE_USERNAME')
    password = os.getenv('SALESFORCE_PASSWORD')
    security_token = os.getenv('SALESFORCE_SECURITY_TOKEN')
    domain = os.getenv('SALESFORCE_DOMAIN', 'login')
    
    if not all([username, password, security_token]):
        print("\n❌ ERROR: Missing Salesforce credentials")
        print("Please set SALESFORCE_USERNAME, SALESFORCE_PASSWORD, and SALESFORCE_SECURITY_TOKEN")
        return False
    
    # Connect to Salesforce
    print("\n1. Connecting to Salesforce...")
    try:
        sf = Salesforce(
            username=username,
            password=password,
            security_token=security_token,
            domain=domain
        )
        print("   ✅ Connected successfully")
    except Exception as e:
        print(f"   ❌ Failed to connect: {e}")
        return False
    
    # Check if Sage_Invoice__c object exists
    print("\n2. Checking if Sage_Invoice__c object exists...")
    try:
        sf.Sage_Invoice__c.describe()
        print("   ✅ Sage_Invoice__c object found")
    except Exception as e:
        print("   ❌ Sage_Invoice__c object not found")
        print("   Please run create_sage_invoice_object_oauth.py first!")
        return False
    
    # Create the Invoice__c field using Metadata API
    print("\n3. Creating Invoice__c lookup field on npe01__OppPayment__c...")
    
    # Note: Salesforce REST API doesn't support field creation
    # We need to use Tooling API or Metadata API
    
    # Using Tooling API
    field_metadata = {
        "Metadata": {
            "type": "Lookup",
            "label": "Sage Invoice",
            "referenceTo": ["Sage_Invoice__c"],
            "relationshipLabel": "Payments",
            "relationshipName": "Payments",
            "required": False,
            "description": "Links this payment to the Sage Intacct invoice"
        },
        "FullName": "npe01__OppPayment__c.Invoice__c"
    }
    
    try:
        # Use Tooling API to create custom field
        result = sf.restful(
            'tooling/sobjects/CustomField',
            method='POST',
            data=field_metadata
        )
        print("   ✅ Invoice__c field created successfully")
        print(f"   Field ID: {result.get('id')}")
        return True
    except Exception as e:
        # Check if field already exists
        if "duplicate" in str(e).lower() or "already exists" in str(e).lower():
            print("   ⚠️  Invoice__c field already exists (this is OK)")
            return True
        else:
            print(f"   ❌ Failed to create field: {e}")
            print("\n   MANUAL STEPS:")
            print("   1. Go to Setup → Object Manager → NPSP Payment")
            print("   2. Click 'Fields & Relationships' → 'New'")
            print("   3. Select 'Lookup Relationship'")
            print("   4. Related To: Sage Invoice")
            print("   5. Field Label: 'Sage Invoice'")
            print("   6. Field Name: 'Invoice'")
            print("   7. Save")
            return False

def main():
    """Main function."""
    success = add_invoice_field()
    
    print("\n" + "=" * 60)
    if success:
        print("✅ SUCCESS! Invoice__c field is ready")
        print("\nYou can now:")
        print("  - Create invoices from opportunities")
        print("  - Link payments to specific invoices")
        print("  - Track payment status")
    else:
        print("❌ FAILED! Please add the field manually")
        print("\nFollow the manual steps above")
    print("=" * 60)

if __name__ == "__main__":
    main()

