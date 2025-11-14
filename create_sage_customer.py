#!/usr/bin/env python3
"""
Create a customer in Sage Intacct via API.
"""

import os
import sys
from dotenv import load_dotenv

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from mcp_client.services.sage_intacct_sync import SageIntacctService

load_dotenv()

def create_sage_customer():
    """Create customer in Sage Intacct."""
    
    print("=" * 70)
    print("CREATE SAGE INTACCT CUSTOMER")
    print("=" * 70)
    
    # Initialize Sage
    print("\n1. Connecting to Sage Intacct...")
    try:
        sage = SageIntacctService({
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        })
        
        if not sage.authenticate():
            print("   ❌ Authentication failed")
            return False
        
        print("   ✅ Connected successfully")
    except Exception as e:
        print(f"   ❌ Failed: {e}")
        return False
    
    # Customer details
    customer_id = "jacqueline reverand"
    customer_name = "Jacqueline Reverand"
    email = "jacquelinereverand@gmail.com"
    
    print(f"\n2. Creating customer '{customer_id}'...")
    print(f"   Email: {email}")
    
    # Create customer using Sage API
    function_xml = f"""
    <function controlid="create-customer">
        <create>
            <CUSTOMER>
                <CUSTOMERID>{customer_id}</CUSTOMERID>
                <NAME>{customer_name}</NAME>
                <STATUS>active</STATUS>
                <PRINTAS>{customer_name}</PRINTAS>
                <CONTACTINFO>
                    <CONTACT>
                        <PRINTAS>{customer_name}</PRINTAS>
                        <EMAIL1>{email}</EMAIL1>
                    </CONTACT>
                </CONTACTINFO>
            </CUSTOMER>
        </create>
    </function>"""
    
    try:
        response = sage._make_api_request(function_xml)
        
        if response.get('success'):
            print(f"   ✅ Customer created successfully!")
            print(f"   Customer ID: {customer_id}")
            print(f"   Email: {email}")
            return True
        else:
            errors = response.get('errors', ['Unknown error'])
            print(f"   ❌ Failed to create customer")
            print(f"   Errors: {errors}")
            
            # Check if customer already exists
            if any('already exists' in str(e).lower() or 'duplicate' in str(e).lower() for e in errors):
                print("\n   ℹ️  Customer already exists - this is OK!")
                return True
            
            return False
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False

def main():
    """Main function."""
    print("\n🏗️  Sage Customer Creation Script")
    print("Creates 'jacqueline reverand' customer for testing\n")
    
    success = create_sage_customer()
    
    print("\n" + "=" * 70)
    if success:
        print("✅ SUCCESS! Customer is ready")
        print("\nNext steps:")
        print("  1. Run: python test_sage_integration.py")
        print("  2. Test invoice will be sent to jacquelinereverand@gmail.com")
        print("  3. Check your email!")
    else:
        print("❌ FAILED! Customer creation failed")
        print("\nTry creating manually:")
        print("  1. Log into Sage Intacct")
        print("  2. Go to: Accounts Receivable → Customers")
        print("  3. Click + (New)")
        print("  4. Customer ID: jacqueline reverand")
        print("  5. Email: jacquelinereverand@gmail.com")
    print("=" * 70)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())

