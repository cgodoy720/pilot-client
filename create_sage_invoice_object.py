#!/usr/bin/env python3
"""
Automatically create Sage_Invoice__c object in Salesforce.
Uses Tooling API to create the object and fields.
"""

import os
import sys
import time
import getpass
from simple_salesforce import Salesforce

def get_salesforce_credentials():
    """Prompt user for Salesforce credentials."""
    print("\n" + "="*70)
    print("🔐 SALESFORCE LOGIN")
    print("="*70)
    print("\n💡 Need your Security Token? ")
    print("   1. Login to Salesforce → Click your profile icon")
    print("   2. Settings → My Personal Information")
    print("   3. Reset My Security Token → Check your email")
    print("\n" + "="*70 + "\n")
    
    # Get username
    username = input("Salesforce Username (email): ").strip()
    if not username:
        print("❌ Username is required")
        sys.exit(1)
    
    # Get password (hidden input)
    password = getpass.getpass("Salesforce Password (hidden): ").strip()
    if not password:
        print("❌ Password is required")
        sys.exit(1)
    
    # Get security token
    print("\n💡 Security Token is emailed when you reset it")
    security_token = getpass.getpass("Security Token (hidden): ").strip()
    if not security_token:
        print("❌ Security Token is required")
        sys.exit(1)
    
    # Get domain
    print("\n🌐 Environment:")
    print("   1. Production (login.salesforce.com)")
    print("   2. Sandbox (test.salesforce.com)")
    domain_choice = input("\nChoose [1 or 2] (default: 1): ").strip() or "1"
    
    if domain_choice == "2":
        domain = "test"
        print("   → Using Sandbox")
    else:
        domain = "login"
        print("   → Using Production")
    
    return username, password, security_token, domain

def get_salesforce():
    """Get Salesforce connection."""
    username, password, security_token, domain = get_salesforce_credentials()
    
    print("\n🔌 Connecting to Salesforce...")
    print(f"   Username: {username}")
    print(f"   Domain: {domain}.salesforce.com")
    
    try:
        sf = Salesforce(
            username=username,
            password=password,
            security_token=security_token,
            domain=domain
        )
        print(f"✅ Connected successfully!\n")
        return sf
    except Exception as e:
        print(f"\n❌ Connection failed: {e}")
        print("\n💡 Common issues:")
        print("   - Wrong password or security token")
        print("   - Security token is case-sensitive")
        print("   - If you recently changed password, reset security token")
        print("   - Check if you selected correct environment (Production/Sandbox)")
        print("\n🔄 Run the script again to retry")
        sys.exit(1)

def check_object_exists(sf):
    """Check if Sage_Invoice__c already exists."""
    try:
        result = sf.query("SELECT Id FROM Sage_Invoice__c LIMIT 1")
        return True
    except Exception as e:
        if 'sObject type' in str(e) or 'does not exist' in str(e):
            return False
        raise

def create_custom_object(sf):
    """Create Sage_Invoice__c custom object using Tooling API."""
    
    print("📦 Creating Sage_Invoice__c custom object...")
    
    # Create custom object metadata using Tooling API
    metadata = {
        'FullName': 'Sage_Invoice__c',
        'Label': 'Sage Invoice',
        'PluralLabel': 'Sage Invoices',
        'NameField': {
            'type': 'AutoNumber',
            'label': 'Sage Invoice Name',
            'displayFormat': 'INV-{0000}'
        },
        'DeploymentStatus': 'Deployed',
        'SharingModel': 'ControlledByParent',
        'Description': 'Junction object to link Opportunities to Sage Intacct invoices'
    }
    
    try:
        # Use REST API to create via Tooling API
        endpoint = f"{sf.base_url}tooling/sobjects/CustomObject"
        
        # Convert metadata to Tooling API format
        tooling_metadata = {
            'FullName': 'Sage_Invoice__c',
            'Metadata': {
                'label': 'Sage Invoice',
                'pluralLabel': 'Sage Invoices',
                'nameField': {
                    'type': 'AutoNumber',
                    'label': 'Sage Invoice Name',
                    'displayFormat': 'INV-{0000}'
                },
                'deploymentStatus': 'Deployed',
                'sharingModel': 'ControlledByParent'
            }
        }
        
        response = sf.restful(endpoint, method='POST', data=tooling_metadata)
        
        if response.get('success'):
            print("✅ Custom object created successfully!")
            time.sleep(2)  # Wait for Salesforce to process
            return True
        else:
            errors = response.get('errors', [])
            print(f"⚠️  Response: {response}")
            return False
            
    except Exception as e:
        error_str = str(e).lower()
        if 'already exists' in error_str or 'duplicate' in error_str:
            print("⚠️  Object already exists, continuing...")
            return True
        else:
            print(f"❌ Error creating object: {e}")
            return False

def create_field(sf, field_config):
    """Create a single custom field using Tooling API."""
    
    field_name = field_config['fullName']
    field_label = field_config['label']
    
    try:
        endpoint = f"{sf.base_url}tooling/sobjects/CustomField"
        
        response = sf.restful(endpoint, method='POST', data={
            'FullName': field_name,
            'Metadata': field_config
        })
        
        if response.get('success'):
            print(f"  ✅ Created: {field_label}")
            return True
        else:
            errors = response.get('errors', [])
            error_msg = str(errors)
            if 'already exists' in error_msg.lower() or 'duplicate' in error_msg.lower():
                print(f"  ⚠️  Already exists: {field_label}")
                return True
            else:
                print(f"  ❌ Failed: {field_label} - {errors}")
                return False
                
    except Exception as e:
        error_str = str(e).lower()
        if 'already exists' in error_str or 'duplicate' in error_str:
            print(f"  ⚠️  Already exists: {field_label}")
            return True
        else:
            print(f"  ❌ Error: {field_label} - {e}")
            return False

def create_fields(sf):
    """Create all custom fields."""
    
    print("\n📝 Creating custom fields...")
    
    fields = [
        {
            'fullName': 'Sage_Invoice__c.Opportunity__c',
            'label': 'Opportunity',
            'type': 'MasterDetail',
            'referenceTo': 'Opportunity',
            'relationshipLabel': 'Sage Invoices',
            'relationshipName': 'Sage_Invoices',
            'required': True,
            'writeRequiresMasterRead': False,
            'reparentableMasterDetail': False
        },
        {
            'fullName': 'Sage_Invoice__c.Sage_Invoice_ID__c',
            'label': 'Sage Invoice ID',
            'type': 'Text',
            'length': 100,
            'unique': True,
            'externalId': True,
            'required': True
        },
        {
            'fullName': 'Sage_Invoice__c.Invoice_Amount__c',
            'label': 'Invoice Amount',
            'type': 'Currency',
            'precision': 16,
            'scale': 2,
            'required': True
        },
        {
            'fullName': 'Sage_Invoice__c.Invoice_Date__c',
            'label': 'Invoice Date',
            'type': 'Date',
            'required': True
        },
        {
            'fullName': 'Sage_Invoice__c.Due_Date__c',
            'label': 'Due Date',
            'type': 'Date',
            'required': False
        },
        {
            'fullName': 'Sage_Invoice__c.Invoice_Status__c',
            'label': 'Invoice Status',
            'type': 'Picklist',
            'required': True,
            'valueSet': {
                'valueSetDefinition': {
                    'sorted': False,
                    'value': [
                        {'fullName': 'Draft', 'default': True, 'label': 'Draft'},
                        {'fullName': 'Sent', 'default': False, 'label': 'Sent'},
                        {'fullName': 'Partially Paid', 'default': False, 'label': 'Partially Paid'},
                        {'fullName': 'Paid', 'default': False, 'label': 'Paid'},
                        {'fullName': 'Overdue', 'default': False, 'label': 'Overdue'},
                        {'fullName': 'Cancelled', 'default': False, 'label': 'Cancelled'}
                    ]
                }
            }
        },
        {
            'fullName': 'Sage_Invoice__c.Description__c',
            'label': 'Description',
            'type': 'LongTextArea',
            'length': 32768,
            'visibleLines': 3,
            'required': False
        },
        {
            'fullName': 'Sage_Invoice__c.Sage_Customer_ID__c',
            'label': 'Sage Customer ID',
            'type': 'Text',
            'length': 100,
            'required': False
        },
        {
            'fullName': 'Sage_Invoice__c.Created_in_Sage_Date__c',
            'label': 'Created in Sage Date',
            'type': 'DateTime',
            'required': False
        }
    ]
    
    success_count = 0
    for field in fields:
        if create_field(sf, field):
            success_count += 1
        time.sleep(0.5)  # Small delay between field creation
    
    print(f"\n✅ Successfully created/verified {success_count}/{len(fields)} fields")
    return success_count > 0

def verify_object(sf):
    """Verify the object was created successfully."""
    print("\n🔍 Verifying object creation...")
    
    try:
        # Try to query the object
        result = sf.query("SELECT Id FROM Sage_Invoice__c LIMIT 1")
        print("✅ Object is accessible and ready to use!")
        return True
    except Exception as e:
        if 'sObject type' in str(e):
            print("⚠️  Object created but not yet available (may need a few minutes)")
            print("   Try refreshing Salesforce or wait a moment")
            return False
        else:
            print(f"⚠️  Verification check: {e}")
            return False

def main():
    """Main execution."""
    print("="*70)
    print("🚀 Automatic Salesforce Object Creator")
    print("   Creating: Sage_Invoice__c")
    print("="*70)
    
    # Connect to Salesforce
    sf = get_salesforce()
    
    # Check if object already exists
    if check_object_exists(sf):
        print("✅ Sage_Invoice__c already exists!")
        print("\n📋 Next steps:")
        print("   1. Go to Setup → Object Manager → Opportunity")
        print("   2. Page Layouts → Edit your layout")
        print("   3. Add 'Sage Invoices' related list")
        print("   4. Test in Finance Dashboard!")
        return
    
    print("📦 Object doesn't exist yet. Creating now...\n")
    
    # Create object
    if not create_custom_object(sf):
        print("\n❌ Failed to create object")
        print("\n💡 Alternative: Use Workbench deployment")
        print("   File: Sage_Invoice_Deployment.zip")
        print("   URL: https://workbench.developerforce.com/")
        return
    
    # Wait a moment for object to be available
    print("\n⏳ Waiting for object to be available...")
    time.sleep(3)
    
    # Create fields
    if not create_fields(sf):
        print("\n⚠️  Some fields may not have been created")
    
    # Verify
    time.sleep(2)
    verify_object(sf)
    
    print("\n" + "="*70)
    print("🎉 SUCCESS! Object creation complete!")
    print("="*70)
    print("\n📋 Next steps:")
    print("   1. Go to Salesforce Setup → Object Manager → Opportunity")
    print("   2. Click 'Page Layouts' → Edit your active layout")
    print("   3. Add 'Sage Invoices' related list to the page")
    print("   4. Save")
    print("   5. Test invoice creation in Finance Dashboard!")
    print("\n💡 If you don't see the fields immediately, refresh Salesforce")
    print("   or wait 1-2 minutes for metadata to propagate.")

if __name__ == "__main__":
    main()

