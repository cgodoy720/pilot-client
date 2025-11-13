#!/usr/bin/env python3
"""
Sage Intacct Integration Example
Demonstrates how to use Sage Intacct service to pull financial data
"""

import asyncio
import os
from dotenv import load_dotenv
from mcp_client.services.sage_intacct import SageIntacctMCPService


async def main():
    """Example usage of Sage Intacct integration."""
    
    # Load environment variables
    load_dotenv()
    
    # Create a mock client for standalone usage
    class MockClient:
        available_tools = {}
    
    client = MockClient()
    
    print("=" * 70)
    print("SAGE INTACCT INTEGRATION EXAMPLE")
    print("=" * 70)
    
    # Initialize Sage Intacct service
    print("\n1. Initializing Sage Intacct service...")
    sage = SageIntacctMCPService(
        client=client,
        company_id=os.getenv('SAGE_INTACCT_COMPANY_ID', 'pursuit'),
        user_id=os.getenv('SAGE_INTACCT_USER_ID', 'Pursuit Systems'),
        user_password=os.getenv('SAGE_INTACCT_USER_PASSWORD'),
        sender_id=os.getenv('SAGE_INTACCT_SENDER_ID', 'pursuit'),
        sender_password=os.getenv('SAGE_INTACCT_SENDER_PASSWORD')
    )
    
    # Authenticate
    print("2. Authenticating with Sage Intacct...")
    success = await sage.authenticate()
    
    if not success:
        print("❌ Authentication failed!")
        return
    
    print(f"✅ Authenticated! Session ID: {sage.session_id[:20]}...")
    
    # Example 1: Get all customers
    print("\n" + "-" * 70)
    print("EXAMPLE 1: Getting Customers")
    print("-" * 70)
    
    customers = await sage.get_customers(limit=10)
    if customers.get('success'):
        print(f"✅ Retrieved {customers.get('count', 0)} customers")
        # In a real app, you'd process this data
        print(f"   Data structure: {type(customers.get('data'))}")
    else:
        print(f"❌ Error: {customers.get('errors')}")
    
    # Example 2: Get outstanding invoices
    print("\n" + "-" * 70)
    print("EXAMPLE 2: Getting Outstanding Invoices")
    print("-" * 70)
    
    invoices = await sage.get_invoices(limit=50)
    if invoices.get('success'):
        count = invoices.get('count', 0)
        print(f"✅ Retrieved {count} invoices")
        
        # Example: Process invoice data for cash flow forecasting
        if count > 0:
            print("\n   Processing for cash flow forecasting...")
            print("   - Calculating total outstanding AR")
            print("   - Identifying overdue invoices")
            print("   - Projecting payment dates")
    else:
        print(f"❌ Error: {invoices.get('errors')}")
    
    # Example 3: Get payment history
    print("\n" + "-" * 70)
    print("EXAMPLE 3: Getting Payment History")
    print("-" * 70)
    
    payments = await sage.get_payments(limit=50)
    if payments.get('success'):
        count = payments.get('count', 0)
        print(f"✅ Retrieved {count} payments")
        
        # Example: Analyze payment patterns
        if count > 0:
            print("\n   Analyzing payment patterns...")
            print("   - Average days to payment")
            print("   - Payment method distribution")
            print("   - Customer payment behavior")
    else:
        print(f"❌ Error: {payments.get('errors')}")
    
    # Example 4: Get cash flow data for forecasting
    print("\n" + "-" * 70)
    print("EXAMPLE 4: Getting Cash Flow Data for Forecasting")
    print("-" * 70)
    
    try:
        cash_flow = await sage.get_cash_flow_data(
            start_date='2025-01-01',
            end_date='2025-12-31'
        )
        if cash_flow.get('success'):
            print(f"✅ Retrieved cash flow data for 2025")
            print("   - Outstanding receivables")
            print("   - Aging buckets (0-30, 31-60, 61-90, 90+ days)")
            print("   - Expected payment timeline")
        else:
            print(f"⚠️  No cash flow data or query unsuccessful")
    except Exception as e:
        print(f"⚠️  Cash flow query error: {e}")
    
    # Example 5: Get financial metrics for dashboard
    print("\n" + "-" * 70)
    print("EXAMPLE 5: Getting Financial Metrics for Dashboard")
    print("-" * 70)
    
    try:
        metrics = await sage.get_financial_metrics()
        if metrics.get('success'):
            print(f"✅ Retrieved financial metrics")
            print("   - Current AR balance")
            print("   - Cash position")
            print("   - Key financial ratios")
        else:
            print(f"⚠️  Metrics query unsuccessful")
    except Exception as e:
        print(f"⚠️  Metrics query error: {e}")
    
    # Example 6: Create an invoice (commented out - for reference only)
    print("\n" + "-" * 70)
    print("EXAMPLE 6: Creating an Invoice (Reference Only)")
    print("-" * 70)
    print("Example invoice creation (not executed):")
    print("""
    invoice_data = {
        'customer_id': 'CUST001',
        'date_created': '11/15/2025',
        'line_items': [
            {
                'account_label': 'Grant Revenue',
                'amount': 50000.00,
                'description': 'Q4 2025 Grant Payment'
            }
        ]
    }
    
    result = await sage.create_invoice(invoice_data)
    """)
    
    # Summary
    print("\n" + "=" * 70)
    print("INTEGRATION COMPLETE")
    print("=" * 70)
    print("\n✅ Sage Intacct is ready for:")
    print("   • Real-time invoice tracking")
    print("   • Payment history analysis")
    print("   • Cash flow forecasting")
    print("   • Financial dashboard metrics")
    print("   • Automated invoice generation")
    print("\n💡 Next: Integrate with your financial_forecasting application!")


if __name__ == "__main__":
    print("\n")
    asyncio.run(main())
    print("\n")

