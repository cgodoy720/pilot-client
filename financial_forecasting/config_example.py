"""
Configuration example for Sage Intacct and Salesforce credentials.

Copy this file to config.py and fill in your actual credentials.
"""

# Sage Intacct Configuration
# You'll need these from your Sage Intacct developer account:

SAGE_INTACCT_CONFIG = {
    # Company ID - This is your Intacct company/entity ID
    "COMPANY_ID": "your-company-id",
    
    # User credentials - Your Intacct user login
    "USER_ID": "your-user-id", 
    "USER_PASSWORD": "your-user-password",
    
    # Sender credentials - These are for API access
    # You get these when you register as a developer
    "SENDER_ID": "your-sender-id",
    "SENDER_PASSWORD": "your-sender-password",
    
    # API endpoint (usually this default)
    "ENDPOINT_URL": "https://api.intacct.com/ia/xml/xmlgw.phtml"
}

# Salesforce Configuration
SALESFORCE_CONFIG = {
    "USERNAME": "your-salesforce-username",
    "PASSWORD": "your-salesforce-password", 
    "SECURITY_TOKEN": "your-security-token",
    "DOMAIN": "login"  # or "test" for sandbox
}

# Instructions for getting Sage Intacct credentials:
"""
1. Log into your Sage Intacct system
2. Go to Company > Admin > Company info
3. Note your Company ID

4. For API access, you need to register as a developer:
   - Go to https://developer.intacct.com/
   - Register for a developer account
   - You'll receive Sender ID and Sender Password

5. Your User ID and Password are your regular Intacct login credentials

6. Make sure your user has API permissions:
   - Go to Company > Admin > Users
   - Edit your user
   - Check "Web Services" permission
"""

# Instructions for getting Salesforce credentials:
"""
1. Username: Your Salesforce login username
2. Password: Your Salesforce login password
3. Security Token: 
   - Go to Setup > Personal Information > Reset My Security Token
   - Click "Reset Security Token"
   - Check your email for the new token
4. Domain: 
   - Use "login" for production
   - Use "test" for sandbox/developer org
"""

