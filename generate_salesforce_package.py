#!/usr/bin/env python3
"""
Generate Salesforce deployment package for Sage_Invoice__c object.
No credentials needed - just creates the metadata files.
"""

import os
import zipfile

def create_package_xml():
    """Create package.xml manifest."""
    return """<?xml version="1.0" encoding="UTF-8"?>
<Package xmlns="http://soap.sforce.com/2006/04/metadata">
    <types>
        <members>Sage_Invoice__c</members>
        <name>CustomObject</name>
    </types>
    <version>59.0</version>
</Package>"""

def create_custom_object_xml():
    """Create Sage_Invoice__c.object metadata."""
    return """<?xml version="1.0" encoding="UTF-8"?>
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
        <writeRequiresMasterRead>false</writeRequiresMasterRead>
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
                    <label>Draft</label>
                </value>
                <value>
                    <fullName>Sent</fullName>
                    <default>false</default>
                    <label>Sent</label>
                </value>
                <value>
                    <fullName>Partially Paid</fullName>
                    <default>false</default>
                    <label>Partially Paid</label>
                </value>
                <value>
                    <fullName>Paid</fullName>
                    <default>false</default>
                    <label>Paid</label>
                </value>
                <value>
                    <fullName>Overdue</fullName>
                    <default>false</default>
                    <label>Overdue</label>
                </value>
                <value>
                    <fullName>Cancelled</fullName>
                    <default>false</default>
                    <label>Cancelled</label>
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

def main():
    """Generate deployment package."""
    print("="*70)
    print("📦 Salesforce Deployment Package Generator")
    print("="*70)
    print("\n🔨 Creating Sage_Invoice__c metadata...")
    
    # Create directory structure
    base_dir = 'salesforce_metadata'
    objects_dir = f'{base_dir}/objects'
    os.makedirs(objects_dir, exist_ok=True)
    
    # Write package.xml
    with open(f'{base_dir}/package.xml', 'w') as f:
        f.write(create_package_xml())
    print(f"  ✅ Created package.xml")
    
    # Write object metadata
    with open(f'{objects_dir}/Sage_Invoice__c.object', 'w') as f:
        f.write(create_custom_object_xml())
    print(f"  ✅ Created Sage_Invoice__c.object")
    
    # Create zip file
    zip_path = 'Sage_Invoice_Deployment.zip'
    with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
        zipf.write(f'{base_dir}/package.xml', 'package.xml')
        zipf.write(f'{objects_dir}/Sage_Invoice__c.object', 'objects/Sage_Invoice__c.object')
    
    print(f"\n✅ Created deployment package: {zip_path}")
    
    print("\n" + "="*70)
    print("📋 DEPLOYMENT INSTRUCTIONS")
    print("="*70)
    print("""
OPTION 1: Workbench (Easiest - 2 minutes)
==========================================
1. Go to: https://workbench.developerforce.com/
2. Login with your Salesforce credentials
3. Select "migration" → "Deploy"
4. Choose the file: Sage_Invoice_Deployment.zip
5. Check "Single Package"
6. Click "Next" → "Deploy"
7. Wait for deployment to complete (30 seconds)
8. Done! ✅

OPTION 2: VS Code (If you have Salesforce extensions)
======================================================
1. Open the 'salesforce_metadata' folder in VS Code
2. Right-click on the folder → "SFDX: Deploy Source to Org"
3. Wait for deployment
4. Done! ✅

OPTION 3: Salesforce CLI (If installed)
========================================
1. Run: sf project deploy start --metadata-dir salesforce_metadata
2. Wait for deployment
3. Done! ✅

After Deployment:
=================
1. Go to Salesforce Setup → Object Manager → Opportunity
2. Click "Page Layouts"
3. Edit your active layout
4. Add "Sage Invoices" related list
5. Save

Then test in Finance Dashboard!
""")
    
    print("="*70)
    print(f"📦 Package ready: {os.path.abspath(zip_path)}")
    print("="*70)

if __name__ == "__main__":
    main()

