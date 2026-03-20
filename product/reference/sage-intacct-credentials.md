# Sage Intacct Connection

## Credentials

All Sage Intacct credentials are stored in `.env` — see `env.production.template` for required variable names.

**Required environment variables:**
```bash
SAGE_INTACCT_COMPANY_ID=
SAGE_INTACCT_USER_ID=
SAGE_INTACCT_USER_PASSWORD=
SAGE_INTACCT_SENDER_ID=
SAGE_INTACCT_SENDER_PASSWORD=
```

## Connection Details

- **Session Endpoint**: https://api.intacct.com/ia/xml/xmlgw.phtml
- **Tested Operations**:
  - Customer retrieval
  - Invoice retrieval
  - Payment retrieval
  - Financial metrics

## Usage in Your Application

```python
from mcp_client.services.sage_intacct import SageIntacctMCPService
import os

# Initialize the service (credentials from environment)
sage = SageIntacctMCPService(
    client=your_mcp_client,
    company_id=os.getenv('SAGE_INTACCT_COMPANY_ID'),
    user_id=os.getenv('SAGE_INTACCT_USER_ID'),
    user_password=os.getenv('SAGE_INTACCT_USER_PASSWORD'),
    sender_id=os.getenv('SAGE_INTACCT_SENDER_ID'),
    sender_password=os.getenv('SAGE_INTACCT_SENDER_PASSWORD')
)

# Authenticate
await sage.authenticate()

# Get data
customers = await sage.get_customers(limit=100)
invoices = await sage.get_invoices(limit=100)
payments = await sage.get_payments(limit=100)
metrics = await sage.get_financial_metrics()
```

## Available Methods

### Data Retrieval
- `get_customers(limit=100)` - Retrieve customer list
- `get_invoices(customer_id=None, limit=100)` - Get invoices (all or by customer)
- `get_payments(customer_id=None, limit=100)` - Get payments (all or by customer)
- `get_cash_flow_data(start_date, end_date)` - Get AR aging for projections
- `get_financial_metrics()` - Get key financial metrics

### Data Creation
- `create_invoice(invoice_data)` - Create new invoice

### Session Management
- `authenticate()` - Establish API session
- `get_service_info()` - Get service configuration

## Troubleshooting

### Session Expired
The service will automatically re-authenticate when calling `ensure_authenticated()`.

### Permission Errors
Ensure the Web Services user has permissions for:
- Web Services User role
- Access to AR modules
- Read/write permissions for invoices and payments

### Authorization Errors
If you see "sender not authorized" errors:
- Check that the sender ID is in the authorized list
- Go to Company > Company Info > Security
- Verify the sender is checked/listed

## Security Notes

- Never commit `.env` file with credentials
- Keep credentials secure and rotate periodically
- The Web Services user should only be used for API access
- Monitor API usage in Sage Intacct admin panel

---

**Date Connected**: November 12, 2025
**Connection Status**: Operational
