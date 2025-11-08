#!/usr/bin/env python3
"""Salesforce-specific example for the MCP client."""

import asyncio
import os
from datetime import datetime
from dotenv import load_dotenv

from mcp_client import UnifiedMCPClient

# Load environment variables
load_dotenv()


async def salesforce_demo():
    """Demonstrate Salesforce MCP client functionality."""
    client = UnifiedMCPClient()
    
    try:
        print("💼 Salesforce MCP Client Demo")
        print("=" * 40)
        
        # Connect to Salesforce
        print("\n🔌 Connecting to Salesforce...")
        salesforce = await client.connect_salesforce("stdio")  # Change to WebSocket URI if needed
        print("✅ Connected to Salesforce!")
        
        # Get service information
        info = await salesforce.get_service_info()
        print(f"\n📋 Service Info:")
        print(f"   Service: {info['service']}")
        print(f"   Authenticated: {info['authenticated']}")
        print(f"   User: {info['config'].get('user_name', 'Unknown')}")
        print(f"   Instance: {info['config'].get('instance_url', 'Unknown')}")
        print(f"   Available Tools: {len(info['available_tools'])}")
        
        # Query Accounts
        print("\n🏢 Account Records:")
        try:
            accounts_query = "SELECT Id, Name, Type, Industry, CreatedDate FROM Account ORDER BY CreatedDate DESC LIMIT 5"
            accounts_result = await salesforce.query(accounts_query)
            
            print(f"   Total Accounts: {accounts_result.get('totalSize', 0)}")
            
            for i, account in enumerate(accounts_result.get("records", []), 1):
                name = account.get("Name", "Unknown")
                account_type = account.get("Type", "N/A")
                industry = account.get("Industry", "N/A")
                print(f"   {i}. {name}")
                print(f"      Type: {account_type} | Industry: {industry}")
                
        except Exception as e:
            print(f"   ❌ Failed to query accounts: {e}")
        
        # Query Contacts
        print("\n👥 Contact Records:")
        try:
            contacts_query = "SELECT Id, FirstName, LastName, Email, Account.Name FROM Contact WHERE Email != null ORDER BY CreatedDate DESC LIMIT 5"
            contacts_result = await salesforce.query(contacts_query)
            
            print(f"   Total Contacts: {contacts_result.get('totalSize', 0)}")
            
            for i, contact in enumerate(contacts_result.get("records", []), 1):
                first_name = contact.get("FirstName", "")
                last_name = contact.get("LastName", "Unknown")
                email = contact.get("Email", "No email")
                account_name = contact.get("Account", {}).get("Name", "No account") if contact.get("Account") else "No account"
                
                print(f"   {i}. {first_name} {last_name}")
                print(f"      Email: {email} | Account: {account_name}")
                
        except Exception as e:
            print(f"   ❌ Failed to query contacts: {e}")
        
        # Query Opportunities
        print("\n💰 Opportunity Records:")
        try:
            opportunities_query = "SELECT Id, Name, StageName, Amount, CloseDate, Account.Name FROM Opportunity ORDER BY CreatedDate DESC LIMIT 5"
            opportunities_result = await salesforce.query(opportunities_query)
            
            print(f"   Total Opportunities: {opportunities_result.get('totalSize', 0)}")
            
            for i, opp in enumerate(opportunities_result.get("records", []), 1):
                name = opp.get("Name", "Unknown")
                stage = opp.get("StageName", "Unknown")
                amount = opp.get("Amount", 0)
                close_date = opp.get("CloseDate", "Unknown")
                account_name = opp.get("Account", {}).get("Name", "No account") if opp.get("Account") else "No account"
                
                print(f"   {i}. {name}")
                print(f"      Stage: {stage} | Amount: ${amount:,.2f} | Close: {close_date}")
                print(f"      Account: {account_name}")
                
        except Exception as e:
            print(f"   ❌ Failed to query opportunities: {e}")
        
        # Describe an SObject
        print("\n📊 SObject Metadata (Account):")
        try:
            account_metadata = await salesforce.describe_sobject("Account")
            
            print(f"   Label: {account_metadata.get('label', 'Unknown')}")
            print(f"   API Name: {account_metadata.get('name', 'Unknown')}")
            print(f"   Fields: {len(account_metadata.get('fields', []))}")
            print(f"   Createable: {account_metadata.get('createable', False)}")
            print(f"   Updateable: {account_metadata.get('updateable', False)}")
            print(f"   Deletable: {account_metadata.get('deletable', False)}")
            
            # Show some key fields
            fields = account_metadata.get('fields', [])
            key_fields = [f for f in fields if f.get('name') in ['Name', 'Type', 'Industry', 'Phone', 'Website']]
            
            if key_fields:
                print("   Key Fields:")
                for field in key_fields:
                    field_name = field.get('name', 'Unknown')
                    field_type = field.get('type', 'Unknown')
                    required = "✓" if field.get('nillable', True) == False else "○"
                    print(f"     {required} {field_name} ({field_type})")
                
        except Exception as e:
            print(f"   ❌ Failed to describe Account: {e}")
        
        # Search using SOSL
        print("\n🔍 Search Results:")
        try:
            # Search for records containing "test" (adjust as needed)
            search_query = "FIND {test*} IN ALL FIELDS RETURNING Account(Name, Type), Contact(FirstName, LastName, Email) LIMIT 5"
            search_result = await salesforce.search(search_query)
            
            if search_result:
                print("   Search completed successfully")
                for sobject_results in search_result:
                    sobject_type = sobject_results.get('sobjectType', 'Unknown')
                    records = sobject_results.get('records', [])
                    print(f"   {sobject_type}: {len(records)} matches")
            else:
                print("   No search results found")
                
        except Exception as e:
            print(f"   ❌ Failed to perform search: {e}")
        
        # Demonstrate CRUD operations (commented out by default)
        print("\n✏️  CRUD Operations:")
        print("   📝 Ready to perform CRUD operations (uncomment code to test)")
        
        # Uncomment the following lines to test CRUD operations
        """
        try:
            # Create a test account
            new_account_data = {
                'Name': f'Test Account - {datetime.now().strftime("%Y%m%d_%H%M%S")}',
                'Type': 'Prospect',
                'Industry': 'Technology'
            }
            
            create_result = await salesforce.create_record('Account', new_account_data)
            account_id = create_result.get('id')
            print(f"   ✅ Created test account: {account_id}")
            
            # Update the account
            update_data = {
                'Description': 'Test account created by MCP Client'
            }
            update_result = await salesforce.update_record('Account', account_id, update_data)
            print(f"   ✅ Updated account: {update_result}")
            
            # Get the account
            account_record = await salesforce.get_record('Account', account_id)
            print(f"   ✅ Retrieved account: {account_record.get('Name')}")
            
            # Delete the account (cleanup)
            delete_result = await salesforce.delete_record('Account', account_id)
            print(f"   ✅ Deleted test account: {delete_result}")
            
        except Exception as e:
            print(f"   ❌ CRUD operations failed: {e}")
        """
        
        print("\n✨ Salesforce demo completed!")
        
    except Exception as e:
        print(f"❌ Salesforce demo failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up
        await client.disconnect_all()
        print("🧹 Disconnected from Salesforce")


if __name__ == "__main__":
    asyncio.run(salesforce_demo())
