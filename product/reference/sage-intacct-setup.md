# Sage Intacct Setup Guide

✅ **STATUS: SUCCESSFULLY CONNECTED!** (November 12, 2025)

This guide walks you through setting up Sage Intacct integration with the Pursuit MCP Client.

## Prerequisites

1. Active Sage Intacct account
2. Web Services subscription enabled (required for API access)
3. Appropriate user permissions to access financial data

## Step 1: Obtain Web Services Credentials

### Getting Sender Credentials

Sender credentials are required for all API requests to Sage Intacct.

1. Log in to Sage Intacct as an administrator
2. Navigate to **Company > Admin > Web Services subscriptions**
3. If you don't have a Web Services subscription:
   - Click **New** to create one
   - Contact Sage Intacct support to enable Web Services on your account
4. Note your **Sender ID** and **Sender Password**
   - These are different from your user login credentials
   - The Sender ID is usually a short alphanumeric string

### Getting User Credentials

1. **Company ID**: Your Sage Intacct company identifier
   - Found in your login URL or dashboard
   - Usually a short string like "ACME123"

2. **User ID**: Your Sage Intacct username
   - The username you use to log in to Sage Intacct
   - Must have API access permissions

3. **User Password**: Your Sage Intacct password
   - The password you use to log in

## Step 2: Configure Environment Variables

1. Create a `.env` file in the project root (if it doesn't exist):
   ```bash
   cp .env.example .env
   ```

2. Add your Sage Intacct credentials to `.env`:
   ```env
   SAGE_INTACCT_COMPANY_ID=your-company-id
   SAGE_INTACCT_USER_ID=your-user-id
   SAGE_INTACCT_USER_PASSWORD=your-user-password
   SAGE_INTACCT_SENDER_ID=your-sender-id
   SAGE_INTACCT_SENDER_PASSWORD=your-sender-password
   ```

3. (Optional) Override the default API endpoint if using a custom endpoint:
   ```env
   SAGE_INTACCT_ENDPOINT_URL=https://api.intacct.com/ia/xml/xmlgw.phtml
   ```

## Step 3: Verify User Permissions

Ensure your Sage Intacct user has the necessary permissions:

### Required Permissions:
- **Web Services User** role enabled
- Read access to:
  - Customers (CUSTOMER)
  - AR Invoices (ARINVOICE)
  - AR Payments (ARPAYMENT)
  - GL Accounts (GLACCOUNT)
- Write access to:
  - AR Invoices (if creating invoices)

### Setting Permissions:
1. Go to **Company > Admin > Users**
2. Select your user
3. Click **Edit**
4. Under **Roles**, ensure "Web Services User" is checked
5. Under **Subscriptions**, grant access to necessary modules

## Step 4: Test the Connection

Create a test script to verify your connection:

```python
import asyncio
import os
from dotenv import load_dotenv
from mcp_client.services.sage_intacct import SageIntacctMCPService
from mcp_client import MCPClient

load_dotenv()

async def test_sage_intacct():
    # Create a mock client for testing
    class MockClient:
        available_tools = {}
    
    client = MockClient()
    
    # Initialize Sage Intacct service
    sage = SageIntacctMCPService(
        client=client,
        company_id=os.getenv('SAGE_INTACCT_COMPANY_ID'),
        user_id=os.getenv('SAGE_INTACCT_USER_ID'),
        user_password=os.getenv('SAGE_INTACCT_USER_PASSWORD'),
        sender_id=os.getenv('SAGE_INTACCT_SENDER_ID'),
        sender_password=os.getenv('SAGE_INTACCT_SENDER_PASSWORD')
    )
    
    # Test authentication
    print("Testing Sage Intacct authentication...")
    success = await sage.authenticate()
    
    if success:
        print("✅ Authentication successful!")
        print(f"Session ID: {sage.session_id}")
        print(f"Endpoint URL: {sage.endpoint_url_session}")
        
        # Test getting customers
        print("\nTesting customer retrieval...")
        customers = await sage.get_customers(limit=5)
        print(f"✅ Retrieved {customers.get('count', 0)} customers")
        
        # Test getting invoices
        print("\nTesting invoice retrieval...")
        invoices = await sage.get_invoices(limit=5)
        print(f"✅ Retrieved {invoices.get('count', 0)} invoices")
        
    else:
        print("❌ Authentication failed")
        print("Please check your credentials and try again")

if __name__ == "__main__":
    asyncio.run(test_sage_intacct())
```

Save this as `test_sage_intacct_connection.py` and run:
```bash
python test_sage_intacct_connection.py
```

## Step 5: Integrate with Your Application

Once authentication is working, you can use the Sage Intacct service in your application:

```python
from mcp_client.services.sage_intacct import SageIntacctMCPService

# Initialize the service (credentials loaded from environment)
sage = SageIntacctMCPService(client=your_mcp_client)

# Authenticate
await sage.authenticate()

# Get customers
customers = await sage.get_customers(limit=100)

# Get invoices
invoices = await sage.get_invoices(customer_id="CUST001", limit=50)

# Get payments
payments = await sage.get_payments(customer_id="CUST001")

# Create an invoice
new_invoice = await sage.create_invoice({
    'customer_id': 'CUST001',
    'date_created': '11/15/2025',
    'line_items': [
        {
            'account_label': 'Sales',
            'amount': 1000.00,
            'description': 'Grant payment installment'
        }
    ]
})

# Get cash flow data for forecasting
cash_flow = await sage.get_cash_flow_data(
    start_date='2025-01-01',
    end_date='2025-12-31'
)

# Get financial metrics
metrics = await sage.get_financial_metrics()
```

## Available Methods

The Sage Intacct service provides these methods:

### Core Methods
- `authenticate()` - Authenticate and create session
- `get_service_info()` - Get service configuration and status

### Customer & Account Methods
- `get_customers(limit=100)` - Retrieve customer list
- `get_invoices(customer_id=None, limit=100)` - Get invoices (all or by customer)
- `get_payments(customer_id=None, limit=100)` - Get payments (all or by customer)
- `create_invoice(invoice_data)` - Create new invoice

### Financial Data Methods
- `get_cash_flow_data(start_date, end_date)` - Get AR aging for cash flow projections
- `get_financial_metrics()` - Get key financial metrics (AR and cash positions)

## Troubleshooting

### Common Issues

**Error: "Sage Intacct credentials are required"**
- Ensure all 5 credentials are set in your `.env` file
- Load environment variables with `load_dotenv()` before initializing service

**Error: "Authentication failed"**
- Verify your Company ID, User ID, and User Password are correct
- Ensure your Sender ID and Sender Password are correct
- Check that Web Services subscription is active

**Error: "User not authorized"**
- Ensure user has "Web Services User" role in Sage Intacct
- Verify user has permissions to access required modules

**Error: "Invalid session"**
- Session may have expired - call `authenticate()` again
- The service automatically re-authenticates when needed

**XML Parse Error**
- Check that your endpoint URL is correct
- Verify you're using the production endpoint (not sandbox)

### Getting Help

1. Review Sage Intacct's [Web Services Documentation](https://developer.intacct.com/web-services/)
2. Check your Web Services subscription status in Sage Intacct admin panel
3. Contact Sage Intacct support if you need to enable Web Services
4. Review the service implementation in `mcp_client/services/sage_intacct.py`

## Security Best Practices

1. **Never commit `.env` file** - It's already in `.gitignore`
2. **Use environment variables** - Don't hardcode credentials
3. **Rotate passwords regularly** - Update both user and sender passwords
4. **Limit user permissions** - Grant only necessary access levels
5. **Monitor API usage** - Track API calls in Sage Intacct admin panel
6. **Use HTTPS** - The API endpoint uses HTTPS by default

## Next Steps

After successful setup:

1. Integrate Sage Intacct with your financial forecasting dashboard
2. Set up automated invoice creation workflows
3. Configure cash flow projection reports
4. Link Sage Intacct data with Salesforce opportunities

## API Documentation

For more details on Sage Intacct's API:
- [Web Services Developer Guide](https://developer.intacct.com/web-services/)
- [API Reference](https://developer.intacct.com/api/)
- [Object Definitions](https://developer.intacct.com/api/company-console/objects/)

