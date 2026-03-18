"""
Configuration example for Sage Intacct and Salesforce credentials.

Set these as environment variables (e.g. in .env or Cloud Run env).
See env.production.template for the full list.
"""

# Salesforce - set in env:
# SALESFORCE_CLIENT_ID, SALESFORCE_CLIENT_SECRET
# SALESFORCE_USERNAME, SALESFORCE_PASSWORD, SALESFORCE_SECURITY_TOKEN
# SALESFORCE_DOMAIN (login or test)

# Sage Intacct - set in env:
# SAGE_COMPANY_ID, SAGE_USER_ID, SAGE_USER_PASSWORD
# SAGE_SENDER_ID, SAGE_SENDER_PASSWORD
# SAGE_ENDPOINT_URL (default: https://api.intacct.com/ia/xml/xmlgw.phtml)

# Access control - set in env:
# ALLOWED_EMAILS=comma,separated,list@domain.com (optional; if unset, all authenticated users allowed)
