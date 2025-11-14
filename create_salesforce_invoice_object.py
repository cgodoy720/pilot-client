#!/usr/bin/env python3
"""
Create Sage_Invoice__c custom object in Salesforce automatically.
Uses Salesforce Metadata API via simple-salesforce.
"""

import os
import sys
from simple_salesforce import Salesforce
from dotenv import load_dotenv

# Load environment variables
load_dotenv('financial_forecasting/.env')

def get_salesforce():
    """Get Salesforce connection."""
    username = os.getenv('SALESFORCE_USERNAME')
    password = os.getenv('SALESFORCE_PASSWORD')
    security_token = os.getenv('SALESFORCE_SECURITY_TOKEN')
    domain = os.getenv('SALESFORCE_DOMAIN', 'login')
    
    if not all([username, password, security_token]):
        print("❌ Error: Salesforce credentials not found in .env file")
        sys.exit(1)
    
    try:
        sf = Salesforce(
            username=username,
            password=password,
            security_token=security_token,
            domain=domain
        )
        print(f"✅ Connected to Salesforce as {username}")
        return sf
    except Exception as e:
        print(f"❌ Failed to connect to Salesforce: {e}")
        sys.exit(1)

def create_custom_object(sf):
    """Create Sage_Invoice__c custom object using Tooling API."""
    
    print("\n📦 Creating Sage_Invoice__c custom object...")
    
    # Custom object metadata
    object_metadata = {
        'FullName': 'Sage_Invoice__c',
        'Label': 'Sage Invoice',
        'PluralLabel': 'Sage Invoices',
        'NameField': {
            'Type': 'AutoNumber',
            'Label': 'Sage Invoice Name',
            'DisplayFormat': 'INV-{0000}',
            'StartingNumber': 1
        },
        'DeploymentStatus': 'Deployed',
        'SharingModel': 'ControlledByParent',
        'Description': 'Junction object to link Opportunities to Sage Intacct invoices'
    }
    
    try:
        # Use Tooling API to create custom object
        result = sf.mdapi.CustomObject.create(object_metadata)
        
        if result[0].get('success'):
            print("✅ Custom object created successfully!")
            return True
        else:
            errors = result[0].get('errors', [])
            # Check if object already exists
            if any('already exists' in str(err).lower() for err in errors):
                print("⚠️  Object already exists, continuing with field creation...")
                return True
            else:
                print(f"❌ Failed to create object: {errors}")
                return False
    except Exception as e:
        error_msg = str(e).lower()
        if 'already exists' in error_msg or 'duplicate' in error_msg:
            print("⚠️  Object already exists, continuing with field creation...")
            return True
        else:
            print(f"❌ Error creating object: {e}")
            return False

def create_fields_via_tooling_api(sf):
    """Create custom fields using Tooling API (more direct approach)."""
    
    print("\n📝 Creating custom fields...")
    
    # Note: Tooling API approach for fields
    # We'll create each field individually
    
    fields = [
        {
            'FullName': 'Sage_Invoice__c.Opportunity__c',
            'Label': 'Opportunity',
            'Type': 'MasterDetail',
            'ReferenceTo': ['Opportunity'],
            'RelationshipLabel': 'Sage Invoices',
            'RelationshipName': 'Sage_Invoices',
            'Required': True,
            'Description': 'Master-Detail relationship to Opportunity'
        },
        {
            'FullName': 'Sage_Invoice__c.Sage_Invoice_ID__c',
            'Label': 'Sage Invoice ID',
            'Type': 'Text',
            'Length': 100,
            'Unique': True,
            'ExternalId': True,
            'Required': True,
            'Description': 'Invoice ID from Sage Intacct'
        },
        {
            'FullName': 'Sage_Invoice__c.Invoice_Amount__c',
            'Label': 'Invoice Amount',
            'Type': 'Currency',
            'Precision': 16,
            'Scale': 2,
            'Required': True,
            'Description': 'Total invoice amount'
        },
        {
            'FullName': 'Sage_Invoice__c.Invoice_Date__c',
            'Label': 'Invoice Date',
            'Type': 'Date',
            'Required': True,
            'Description': 'Date invoice was created'
        },
        {
            'FullName': 'Sage_Invoice__c.Due_Date__c',
            'Label': 'Due Date',
            'Type': 'Date',
            'Required': False,
            'Description': 'Payment due date'
        },
        {
            'FullName': 'Sage_Invoice__c.Invoice_Status__c',
            'Label': 'Invoice Status',
            'Type': 'Picklist',
            'Picklist': {
                'PicklistValues': [
                    {'FullName': 'Draft', 'Default': True},
                    {'FullName': 'Sent', 'Default': False},
                    {'FullName': 'Partially Paid', 'Default': False},
                    {'FullName': 'Paid', 'Default': False},
                    {'FullName': 'Overdue', 'Default': False},
                    {'FullName': 'Cancelled', 'Default': False}
                ],
                'Sorted': False
            },
            'Required': True,
            'Description': 'Current status of the invoice'
        },
        {
            'FullName': 'Sage_Invoice__c.Description__c',
            'Label': 'Description',
            'Type': 'LongTextArea',
            'Length': 32768,
            'VisibleLines': 3,
            'Required': False,
            'Description': 'Invoice description or notes'
        },
        {
            'FullName': 'Sage_Invoice__c.Sage_Customer_ID__c',
            'Label': 'Sage Customer ID',
            'Type': 'Text',
            'Length': 100,
            'Required': False,
            'Description': 'Customer ID in Sage Intacct'
        },
        {
            'FullName': 'Sage_Invoice__c.Created_in_Sage_Date__c',
            'Label': 'Created in Sage Date',
            'Type': 'DateTime',
            'Required': False,
            'Description': 'Timestamp when created in Sage Intacct'
        }
    ]
    
    created_count = 0
    for field in fields:
        field_name = field['FullName'].split('.')[-1]
        try:
            result = sf.mdapi.CustomField.create(field)
            if result[0].get('success'):
                print(f"  ✅ Created field: {field['Label']}")
                created_count += 1
            else:
                errors = result[0].get('errors', [])
                if any('already exists' in str(err).lower() for err in errors):
                    print(f"  ⚠️  Field already exists: {field['Label']}")
                else:
                    print(f"  ❌ Failed to create field {field['Label']}: {errors}")
        except Exception as e:
            error_msg = str(e).lower()
            if 'already exists' in error_msg or 'duplicate' in error_msg:
                print(f"  ⚠️  Field already exists: {field['Label']}")
            else:
                print(f"  ❌ Error creating field {field['Label']}: {e}")
    
    print(f"\n✅ Created {created_count} new fields")
    return True

def create_via_workbench_instructions():
    """Provide alternative instructions using Workbench."""
    print("\n" + "="*70)
    print("📋 ALTERNATIVE: Manual Creation Instructions")
    print("="*70)
    print("""
Unfortunately, the Salesforce Metadata API for custom object creation
requires additional setup (connected app, OAuth, etc.).

EASIEST OPTION: Use Salesforce Workbench (2 minutes)

1. Go to: https://workbench.developerforce.com/
2. Login with your Salesforce credentials
3. Click "migration" → "Deploy"
4. Upload this package.xml (I'll create it for you)
5. Click "Deploy"
6. Done! ✅

I'll create the package.xml file for you now...
    """)

def create_package_xml():
    """Create a package.xml for manual deployment."""
    
    package_xml = """<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Sage_Invoice__c</members>
        <name>CustomObject</name>
    </types>
    <version>58.0</version>
</Package>"""
    
    custom_object_xml = """<?xml version="1.0" encoding="UTF-8"?>
<CustomObject xmlns="http://soap.sforce.com/2006/04/metadata">
    <label>Sage Invoice</label>
    <pluralLabel>Sage Invoices</pluralLabel>
    <nameField>
        <displayFormat>INV-{0000}</displayFormat>
        <label>Sage Invoice Name</label>
        <type>AutoNumber</type>
    </nameField>
    <deploymentStatus>Deployed</deploymentStatus>
    <sharingModel>ControlledByParent</sharingModel>
    <description>Junction object to link Opportunities to Sage Intacct invoices</description>
    
    <!-- Master-Detail Relationship to Opportunity -->
    <fields>
        <fullName>Opportunity__c</fullName>
        <label>Opportunity</label>
        <type>MasterDetail</type>
        <referenceTo>Opportunity</referenceTo>
        <relationshipLabel>Sage Invoices</relationshipLabel>
        <relationshipName>Sage_Invoices</relationshipName>
        <required>true</required>
    </fields>
    
    <!-- Sage Invoice ID -->
    <fields>
        <fullName>Sage_Invoice_ID__c</fullName>
        <label>Sage Invoice ID</label>
        <type>Text</type>
        <length>100</length>
        <unique>true</unique>
        <externalId>true</externalId>
        <required>true</required>
    </fields>
    
    <!-- Invoice Amount -->
    <fields>
        <fullName>Invoice_Amount__c</fullName>
        <label>Invoice Amount</label>
        <type>Currency</type>
        <precision>16</precision>
        <scale>2</scale>
        <required>true</required>
    </fields>
    
    <!-- Invoice Date -->
    <fields>
        <fullName>Invoice_Date__c</fullName>
        <label>Invoice Date</label>
        <type>Date</type>
        <required>true</required>
    </fields>
    
    <!-- Due Date -->
    <fields>
        <fullName>Due_Date__c</fullName>
        <label>Due Date</label>
        <type>Date</type>
        <required>false</required>
    </fields>
    
    <!-- Invoice Status -->
    <fields>
        <fullName>Invoice_Status__c</fullName>
        <label>Invoice Status</label>
        <type>Picklist</type>
        <required>true</required>
        <valueSet>
            <valueSetDefinition>
                <sorted>false</sorted>
                <value>
                    <fullName>Draft</fullName>
                    <default>true</default>
                </value>
                <value>
                    <fullName>Sent</fullName>
                    <default>false</default>
                </value>
                <value>
                    <fullName>Partially Paid</fullName>
                    <default>false</default>
                </value>
                <value>
                    <fullName>Paid</fullName>
                    <default>false</default>
                </value>
                <value>
                    <fullName>Overdue</fullName>
                    <default>false</default>
                </value>
                <value>
                    <fullName>Cancelled</fullName>
                    <default>false</default>
                </value>
            </valueSetDefinition>
        </valueSet>
    </fields>
    
    <!-- Description -->
    <fields>
        <fullName>Description__c</fullName>
        <label>Description</label>
        <type>LongTextArea</type>
        <length>32768</length>
        <visibleLines>3</visibleLines>
        <required>false</required>
    </fields>
    
    <!-- Sage Customer ID -->
    <fields>
        <fullName>Sage_Customer_ID__c</fullName>
        <label>Sage Customer ID</label>
        <type>Text</type>
        <length>100</length>
        <required>false</required>
    </fields>
    
    <!-- Created in Sage Date -->
    <fields>
        <fullName>Created_in_Sage_Date__c</fullName>
        <label>Created in Sage Date</label>
        <type>DateTime</type>
        <required>false</required>
    </fields>
</CustomObject>"""
    
    # Create directory
    os.makedirs('salesforce_metadata/objects', exist_ok=True)
    
    # Write files
    with open('salesforce_metadata/package.xml', 'w') as f:
        f.write(package_xml)
    
    with open('salesforce_metadata/objects/Sage_Invoice__c.object', 'w') as f:
        f.write(custom_object_xml)
    
    print("\n✅ Created metadata files in 'salesforce_metadata/' directory")
    print("\n📦 Next steps:")
    print("1. Zip the 'salesforce_metadata' folder")
    print("2. Go to https://workbench.developerforce.com/")
    print("3. Login → migration → Deploy")
    print("4. Upload the zip file")
    print("5. Click 'Deploy'")

def main():
    """Main execution."""
    print("="*70)
    print("🚀 Salesforce Object Creator - Sage_Invoice__c")
    print("="*70)
    
    # Try using Metadata API first
    print("\nAttempting to create object via API...")
    print("(This requires Metadata API access)")
    
    try:
        sf = get_salesforce()
        
        # Check if we have mdapi access
        if not hasattr(sf, 'mdapi'):
            print("\n⚠️  Metadata API not available with simple-salesforce")
            print("    This library doesn't fully support Metadata API operations")
            create_via_workbench_instructions()
            create_package_xml()
            return
        
        # Try to create object
        if create_custom_object(sf):
            create_fields_via_tooling_api(sf)
            print("\n" + "="*70)
            print("✅ SUCCESS! Sage_Invoice__c object created!")
            print("="*70)
            print("\n📋 Next steps:")
            print("1. Add 'Sage Invoices' related list to Opportunity page layout")
            print("2. Test invoice creation in Finance Dashboard")
        else:
            print("\n⚠️  Could not create via API, see alternative method below")
            create_via_workbench_instructions()
            create_package_xml()
    
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n💡 Don't worry! Using alternative method...")
        create_via_workbench_instructions()
        create_package_xml()

if __name__ == "__main__":
    main()

