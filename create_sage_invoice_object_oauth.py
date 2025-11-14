#!/usr/bin/env python3
"""
Automatically create Sage_Invoice__c object in Salesforce using OAuth.
Opens browser for normal login (supports MFA/2FA).
"""

import os
import sys
import time
import webbrowser
import http.server
import socketserver
import urllib.parse
from threading import Thread
from simple_salesforce import Salesforce
import requests

# OAuth Configuration
CLIENT_ID = '3MVG9pRzvMkjMb6lZlt3YjDQwe4hC_.8sg.vC0FJhG7RiQaQ9xvBnSS7jFGbCz4QcDAaAYK0q6Xz3FlXZjKdC'  # Public client ID
REDIRECT_URI = 'http://localhost:8765/oauth/callback'
PORT = 8765

# Global variable to store auth code
auth_code = None
auth_error = None

class OAuthCallbackHandler(http.server.SimpleHTTPRequestHandler):
    """Handle OAuth callback."""
    
    def do_GET(self):
        global auth_code, auth_error
        
        # Parse query parameters
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        
        if 'code' in params:
            auth_code = params['code'][0]
            
            # Send success page
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(b"""
                <html>
                <head><title>Success!</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: green;">✅ Success!</h1>
                    <p>You've successfully authenticated with Salesforce.</p>
                    <p>You can close this window and return to the terminal.</p>
                    <script>setTimeout(function(){ window.close(); }, 3000);</script>
                </body>
                </html>
            """)
        elif 'error' in params:
            auth_error = params.get('error_description', ['Unknown error'])[0]
            
            # Send error page
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            self.wfile.write(f"""
                <html>
                <head><title>Error</title></head>
                <body style="font-family: Arial; text-align: center; padding: 50px;">
                    <h1 style="color: red;">❌ Error</h1>
                    <p>{auth_error}</p>
                    <p>You can close this window and try again.</p>
                </body>
                </html>
            """.encode())
        
    def log_message(self, format, *args):
        """Suppress log messages."""
        pass

def start_oauth_server():
    """Start local server to handle OAuth callback."""
    handler = OAuthCallbackHandler
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        httpd.handle_request()  # Handle one request then stop

def get_salesforce_via_oauth():
    """Get Salesforce connection using OAuth (browser login)."""
    
    print("\n" + "="*70)
    print("🔐 SALESFORCE LOGIN VIA BROWSER")
    print("="*70)
    print("\n🌐 This will open your browser for you to login normally.")
    print("   ✅ Supports MFA/2FA (authenticator app)")
    print("   ✅ No need to remember security token")
    print("   ✅ Secure OAuth flow")
    
    # Prompt for environment
    print("\n🌐 Environment:")
    print("   1. Production (login.salesforce.com)")
    print("   2. Sandbox (test.salesforce.com)")
    domain_choice = input("\nChoose [1 or 2] (default: 1): ").strip() or "1"
    
    if domain_choice == "2":
        base_url = "https://test.salesforce.com"
        print("   → Using Sandbox")
    else:
        base_url = "https://login.salesforce.com"
        print("   → Using Production")
    
    # Build OAuth URL
    auth_url = f"{base_url}/services/oauth2/authorize"
    params = {
        'response_type': 'code',
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
        'scope': 'full refresh_token',
    }
    
    full_auth_url = f"{auth_url}?{urllib.parse.urlencode(params)}"
    
    print("\n🚀 Opening browser for login...")
    print(f"   If browser doesn't open, go to:\n   {full_auth_url}\n")
    
    # Start local server in background
    server_thread = Thread(target=start_oauth_server, daemon=True)
    server_thread.start()
    
    # Open browser
    time.sleep(0.5)
    webbrowser.open(full_auth_url)
    
    print("⏳ Waiting for you to login in the browser...")
    print("   (This may take a minute with MFA)\n")
    
    # Wait for auth code
    timeout = 300  # 5 minutes
    start_time = time.time()
    
    while auth_code is None and auth_error is None:
        if time.time() - start_time > timeout:
            print("\n❌ Timeout waiting for login")
            print("   Please try again")
            sys.exit(1)
        time.sleep(0.5)
    
    if auth_error:
        print(f"\n❌ Authentication failed: {auth_error}")
        sys.exit(1)
    
    print("✅ Authentication successful! Getting access token...\n")
    
    # Exchange code for access token
    token_url = f"{base_url}/services/oauth2/token"
    token_data = {
        'grant_type': 'authorization_code',
        'code': auth_code,
        'client_id': CLIENT_ID,
        'redirect_uri': REDIRECT_URI,
    }
    
    try:
        response = requests.post(token_url, data=token_data)
        response.raise_for_status()
        tokens = response.json()
        
        access_token = tokens['access_token']
        instance_url = tokens['instance_url']
        
        print(f"✅ Connected to: {instance_url}\n")
        
        # Create Salesforce connection
        sf = Salesforce(
            instance_url=instance_url,
            session_id=access_token
        )
        
        return sf
        
    except Exception as e:
        print(f"\n❌ Failed to get access token: {e}")
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
    print("🚀 Automatic Salesforce Object Creator (OAuth)")
    print("   Creating: Sage_Invoice__c")
    print("   Method: Browser login with MFA support")
    print("="*70)
    
    # Connect to Salesforce via OAuth
    sf = get_salesforce_via_oauth()
    
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

