#!/usr/bin/env python3
"""Basic usage example for the MCP client."""

import asyncio
import os
from dotenv import load_dotenv

from mcp_client import UnifiedMCPClient

# Load environment variables
load_dotenv()


async def main():
    """Demonstrate basic MCP client usage."""
    # Create unified client
    client = UnifiedMCPClient()
    
    try:
        print("🚀 Starting MCP client demo...")
        
        # Connect to services (you'll need to have MCP servers running)
        # For demo purposes, we'll use stdio transport (assuming servers are available as CLI tools)
        
        print("\n📱 Connecting to Slack...")
        try:
            slack = await client.connect_slack("stdio")  # or ws://localhost:8001/mcp/slack
            print("✅ Slack connected!")
            
            # Get service info
            slack_info = await slack.get_service_info()
            print(f"   User: {slack_info['config'].get('user_id', 'Unknown')}")
            print(f"   Team: {slack_info['config'].get('team', 'Unknown')}")
            
        except Exception as e:
            print(f"❌ Slack connection failed: {e}")
        
        print("\n💼 Connecting to Salesforce...")
        try:
            salesforce = await client.connect_salesforce("stdio")  # or ws://localhost:8002/mcp/salesforce
            print("✅ Salesforce connected!")
            
            # Get service info
            sf_info = await salesforce.get_service_info()
            print(f"   User: {sf_info['config'].get('user_name', 'Unknown')}")
            print(f"   Instance: {sf_info['config'].get('instance_url', 'Unknown')}")
            
        except Exception as e:
            print(f"❌ Salesforce connection failed: {e}")
        
        print("\n💾 Connecting to Google Drive...")
        try:
            gdrive = await client.connect_google_drive("stdio")  # or ws://localhost:8003/mcp/gdrive
            print("✅ Google Drive connected!")
            
            # Get service info
            gdrive_info = await gdrive.get_service_info()
            print(f"   User: {gdrive_info['config'].get('user_name', 'Unknown')}")
            print(f"   Email: {gdrive_info['config'].get('user_email', 'Unknown')}")
            
        except Exception as e:
            print(f"❌ Google Drive connection failed: {e}")
        
        # Show connected services
        print(f"\n🔗 Connected services: {', '.join(client.connected_services)}")
        
        # Health check
        print("\n🏥 Performing health check...")
        health = await client.health_check()
        for service, status in health.items():
            status_icon = "✅" if status["status"] == "healthy" else "❌"
            print(f"   {status_icon} {service}: {status['status']}")
        
        # List available tools
        print("\n🛠️  Available tools:")
        tools = await client.list_all_tools()
        for service, service_tools in tools.items():
            print(f"   {service}: {len(service_tools)} tools")
            for tool in service_tools[:3]:  # Show first 3 tools
                print(f"     - {tool}")
            if len(service_tools) > 3:
                print(f"     ... and {len(service_tools) - 3} more")
        
        # Demonstrate some basic operations if services are connected
        if "slack" in client.connected_services:
            print("\n💬 Slack Demo:")
            try:
                slack_service = client.get_slack_service()
                channels = await slack_service.get_channels(limit=5)
                print(f"   Found {len(channels)} channels")
                
                # Post a test message (uncomment if you want to actually post)
                # await slack_service.post_message("#general", "Hello from MCP client! 🤖")
                # print("   ✅ Test message posted")
                
            except Exception as e:
                print(f"   ❌ Slack demo failed: {e}")
        
        if "salesforce" in client.connected_services:
            print("\n📊 Salesforce Demo:")
            try:
                sf_service = client.get_salesforce_service()
                accounts = await sf_service.query("SELECT Id, Name FROM Account LIMIT 5")
                print(f"   Found {accounts.get('totalSize', 0)} accounts")
                
            except Exception as e:
                print(f"   ❌ Salesforce demo failed: {e}")
        
        if "google_drive" in client.connected_services:
            print("\n📁 Google Drive Demo:")
            try:
                gdrive_service = client.get_google_drive_service()
                files = await gdrive_service.list_files(page_size=5)
                file_count = len(files.get("files", []))
                print(f"   Found {file_count} files")
                
            except Exception as e:
                print(f"   ❌ Google Drive demo failed: {e}")
        
        print("\n✨ Demo completed successfully!")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")
    
    finally:
        # Clean up connections
        print("\n🧹 Cleaning up connections...")
        await client.disconnect_all()
        print("✅ All connections closed")


if __name__ == "__main__":
    asyncio.run(main())
