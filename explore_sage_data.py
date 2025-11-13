#!/usr/bin/env python3
"""
Explore Sage Intacct Data (READ-ONLY)
This script safely explores your Sage Intacct data to understand the structure
and inform PRD requirements.
"""

import asyncio
import json
from datetime import datetime
from mcp_client.services.sage_intacct import SageIntacctMCPService


def print_section(title):
    """Print a formatted section header."""
    print("\n" + "=" * 80)
    print(f"  {title}")
    print("=" * 80)


def print_subsection(title):
    """Print a formatted subsection header."""
    print(f"\n--- {title} ---")


def format_data_sample(data, max_items=3):
    """Format data for readable display."""
    if isinstance(data, dict):
        return json.dumps(data, indent=2, default=str)
    elif isinstance(data, list):
        if len(data) > max_items:
            return json.dumps(data[:max_items], indent=2, default=str) + f"\n... ({len(data) - max_items} more items)"
        return json.dumps(data, indent=2, default=str)
    return str(data)


async def explore_customers(sage):
    """Explore customer data structure."""
    print_section("1. CUSTOMER DATA EXPLORATION")
    
    print("\n📊 Fetching customers...")
    customers = await sage.get_customers(limit=100)
    
    if customers.get('success'):
        count = customers.get('count', 0)
        print(f"✅ Found {count} customer(s)")
        
        data = customers.get('data')
        print(f"\n📋 Data structure type: {type(data).__name__}")
        
        if data:
            print("\n🔍 Sample customer data:")
            print(format_data_sample(data, max_items=2))
            
            # Analyze structure
            if isinstance(data, dict):
                print(f"\n📊 Available fields: {list(data.keys())}")
            elif isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], dict):
                    print(f"\n📊 Available fields: {list(data[0].keys())}")
        
        return customers
    else:
        print(f"❌ Error: {customers.get('errors')}")
        return None


async def explore_invoices(sage):
    """Explore invoice data structure."""
    print_section("2. INVOICE DATA EXPLORATION")
    
    print("\n📊 Fetching invoices...")
    invoices = await sage.get_invoices(limit=100)
    
    if invoices.get('success'):
        count = invoices.get('count', 0)
        print(f"✅ Found {count} invoice(s)")
        
        data = invoices.get('data')
        print(f"\n📋 Data structure type: {type(data).__name__}")
        
        if data:
            print("\n🔍 Sample invoice data:")
            print(format_data_sample(data, max_items=2))
            
            # Analyze structure
            if isinstance(data, dict):
                fields = list(data.keys())
                print(f"\n📊 Available fields ({len(fields)}): {fields}")
            elif isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], dict):
                    fields = list(data[0].keys())
                    print(f"\n📊 Available fields ({len(fields)}): {fields}")
        
        return invoices
    else:
        print(f"❌ Error: {invoices.get('errors')}")
        return None


async def explore_payments(sage):
    """Explore payment data structure."""
    print_section("3. PAYMENT DATA EXPLORATION")
    
    print("\n📊 Fetching payments...")
    payments = await sage.get_payments(limit=100)
    
    if payments.get('success'):
        count = payments.get('count', 0)
        print(f"✅ Found {count} payment(s)")
        
        data = payments.get('data')
        print(f"\n📋 Data structure type: {type(data).__name__}")
        
        if data:
            print("\n🔍 Sample payment data:")
            print(format_data_sample(data, max_items=2))
            
            # Analyze structure
            if isinstance(data, dict):
                fields = list(data.keys())
                print(f"\n📊 Available fields ({len(fields)}): {fields}")
            elif isinstance(data, list) and len(data) > 0:
                if isinstance(data[0], dict):
                    fields = list(data[0].keys())
                    print(f"\n📊 Available fields ({len(fields)}): {fields}")
        
        return payments
    else:
        print(f"❌ Error: {payments.get('errors')}")
        return None


async def explore_cash_flow(sage):
    """Explore cash flow data."""
    print_section("4. CASH FLOW DATA EXPLORATION")
    
    print("\n📊 Fetching cash flow data (2025)...")
    try:
        cash_flow = await sage.get_cash_flow_data(
            start_date='2025-01-01',
            end_date='2025-12-31'
        )
        
        if cash_flow.get('success'):
            count = cash_flow.get('count', 0)
            print(f"✅ Found {count} AR record(s)")
            
            data = cash_flow.get('data')
            if data:
                print("\n🔍 Sample cash flow data:")
                print(format_data_sample(data, max_items=2))
            
            return cash_flow
        else:
            print(f"⚠️  Query unsuccessful: {cash_flow}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


async def explore_financial_metrics(sage):
    """Explore financial metrics."""
    print_section("5. FINANCIAL METRICS EXPLORATION")
    
    print("\n📊 Fetching financial metrics...")
    try:
        metrics = await sage.get_financial_metrics()
        
        if metrics.get('success'):
            count = metrics.get('count', 0)
            print(f"✅ Found {count} account(s)")
            
            data = metrics.get('data')
            if data:
                print("\n🔍 Sample metrics data:")
                print(format_data_sample(data, max_items=2))
            
            return metrics
        else:
            print(f"⚠️  Query unsuccessful: {metrics}")
            return None
    except Exception as e:
        print(f"❌ Error: {e}")
        return None


async def generate_questions(customers, invoices, payments, cash_flow, metrics):
    """Generate questions based on the data discovered."""
    print_section("6. QUESTIONS FOR PRD COMPLETION")
    
    print("\n🤔 Based on the Sage Intacct data structure, here are key questions:")
    print("\n" + "-" * 80)
    
    questions = [
        {
            "category": "CUSTOMER/ACCOUNT MAPPING",
            "questions": [
                "1. How do Sage Intacct customers map to Salesforce accounts?",
                "   - Is it by name matching? By a custom ID field?",
                "   - Do all Salesforce accounts have corresponding Sage customers?",
                "   - Should we create Sage customers when opportunities close?",
            ]
        },
        {
            "category": "INVOICE GENERATION WORKFLOW",
            "questions": [
                "2. When should invoices be created in Sage Intacct?",
                "   - Automatically when a Salesforce opportunity closes?",
                "   - Manually by the bookkeeper after contract is signed?",
                "   - Based on payment schedule in the opportunity?",
                "",
                "3. What fields from Salesforce opportunities should populate invoices?",
                "   - Opportunity Amount → Invoice Amount?",
                "   - Close Date → Invoice Date?",
                "   - Payment Schedule → Multiple invoices?",
            ]
        },
        {
            "category": "PAYMENT TRACKING",
            "questions": [
                "4. How do you currently track expected vs. actual payments?",
                "   - Is the payment schedule in Salesforce or Sage Intacct?",
                "   - When a payment is received in Sage, should Salesforce be updated?",
                "   - How do you handle partial payments?",
                "",
                "5. What payment statuses matter for your dashboard?",
                "   - Invoiced (sent but not paid)",
                "   - Overdue (past due date)",
                "   - Paid (received)",
                "   - Partially paid",
            ]
        },
        {
            "category": "MULTI-YEAR GRANTS",
            "questions": [
                "6. For multi-year grants, how are invoices structured?",
                "   - One invoice per year? Per quarter? Per milestone?",
                "   - Are payment schedules stored in Salesforce custom fields?",
                "   - Should we auto-generate invoice reminders?",
            ]
        },
        {
            "category": "CASH FLOW FORECASTING",
            "questions": [
                "7. What time horizon do you need for cash flow forecasts?",
                "   - Next 3 months? 6 months? 12 months?",
                "   - Should we show both 'best case' and 'realistic' scenarios?",
                "",
                "8. What assumptions should drive the forecast?",
                "   - Average days to payment from historical data?",
                "   - Opportunity probability from Salesforce?",
                "   - Different payment patterns by funder type?",
            ]
        },
        {
            "category": "BOOKKEEPER WORKFLOW (Phase 2)",
            "questions": [
                "9. What's the current invoice creation process?",
                "   - How does the bookkeeper know when to create an invoice?",
                "   - What information do they need from the partnerships team?",
                "   - What are the pain points in the current process?",
                "",
                "10. What automations would help the bookkeeper most?",
                "   - Auto-draft invoices from closed opportunities?",
                "   - Payment reminders for overdue invoices?",
                "   - Automatic reconciliation with bank deposits?",
            ]
        },
        {
            "category": "REPORTING & METRICS",
            "questions": [
                "11. What financial metrics does the CEO need to see daily?",
                "   - Total AR (accounts receivable)?",
                "   - Expected cash in next 30/60/90 days?",
                "   - Overdue invoices?",
                "   - Collection rate/trends?",
                "",
                "12. How should we visualize the relationship between:",
                "   - Salesforce pipeline (future revenue)",
                "   - Sage invoices (billed but not collected)",
                "   - Bank deposits (actual cash received)",
            ]
        },
        {
            "category": "DATA SYNC & INTEGRITY",
            "questions": [
                "13. What's the source of truth for different data types?",
                "   - Grant details: Salesforce?",
                "   - Invoice details: Sage Intacct?",
                "   - Payment schedule: Where should this live?",
                "",
                "14. How often should data sync between systems?",
                "   - Real-time? Hourly? Daily?",
                "   - What triggers should cause a sync?",
            ]
        },
        {
            "category": "ERROR HANDLING",
            "questions": [
                "15. What should happen if an invoice creation fails?",
                "   - Alert the bookkeeper?",
                "   - Flag the opportunity in Salesforce?",
                "   - Retry automatically?",
                "",
                "16. What validations are needed before creating an invoice?",
                "   - Customer exists in Sage Intacct?",
                "   - Contract is fully executed?",
                "   - Payment schedule is defined?",
            ]
        }
    ]
    
    for q in questions:
        print(f"\n{'*' * 80}")
        print(f"  {q['category']}")
        print('*' * 80)
        for question in q['questions']:
            print(question)
    
    print("\n" + "-" * 80)
    print("\n💡 These questions will help us define:")
    print("   • Phase 1 scope (MVP features)")
    print("   • Phase 2 scope (Bookkeeper features)")
    print("   • Data models and field mappings")
    print("   • Automation rules and triggers")
    print("   • Dashboard metrics and visualizations")


async def main():
    """Main exploration function."""
    print("\n" + "=" * 80)
    print("  🔍 SAGE INTACCT DATA EXPLORATION (READ-ONLY)")
    print("=" * 80)
    print("\n⚠️  READ-ONLY MODE: This script will only read data, not modify anything")
    print("📅 Date:", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
    
    # Create mock client
    class MockClient:
        available_tools = {}
    
    client = MockClient()
    
    # Initialize Sage Intacct
    print("\n🔐 Authenticating with Sage Intacct...")
    sage = SageIntacctMCPService(
        client=client,
        company_id="pursuit",
        user_id="Pursuit Systems",
        user_password="Queenstech!23",
        sender_id="pursuit",
        sender_password="Pursuit1234!"
    )
    
    success = await sage.authenticate()
    if not success:
        print("❌ Authentication failed!")
        return
    
    print(f"✅ Authenticated! Session ID: {sage.session_id[:30]}...")
    
    # Explore each data type
    customers = await explore_customers(sage)
    invoices = await explore_invoices(sage)
    payments = await explore_payments(sage)
    cash_flow = await explore_cash_flow(sage)
    metrics = await explore_financial_metrics(sage)
    
    # Generate questions for PRD
    await generate_questions(customers, invoices, payments, cash_flow, metrics)
    
    print_section("EXPLORATION COMPLETE")
    print("\n✅ Data exploration finished successfully!")
    print("\n📝 Next steps:")
    print("   1. Review the questions above")
    print("   2. Discuss answers with stakeholders")
    print("   3. Update PRD with Sage Intacct integration details")
    print("   4. Define data mapping between Salesforce <-> Sage Intacct")
    print("   5. Design invoice creation workflow")
    print("\n")


if __name__ == "__main__":
    asyncio.run(main())

