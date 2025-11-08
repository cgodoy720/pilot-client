#!/usr/bin/env python3
"""Slack-specific example for the MCP client."""

import asyncio
import os
from dotenv import load_dotenv

from mcp_client import UnifiedMCPClient

# Load environment variables
load_dotenv()


async def slack_demo():
    """Demonstrate Slack MCP client functionality."""
    client = UnifiedMCPClient()
    
    try:
        print("📱 Slack MCP Client Demo")
        print("=" * 40)
        
        # Connect to Slack
        print("\n🔌 Connecting to Slack...")
        slack = await client.connect_slack("stdio")  # Change to WebSocket URI if needed
        print("✅ Connected to Slack!")
        
        # Get service information
        info = await slack.get_service_info()
        print(f"\n📋 Service Info:")
        print(f"   Service: {info['service']}")
        print(f"   Authenticated: {info['authenticated']}")
        print(f"   Available Tools: {len(info['available_tools'])}")
        
        # List channels
        print("\n📺 Channels:")
        try:
            channels = await slack.get_channels(limit=10)
            for i, channel in enumerate(channels[:5], 1):
                channel_type = "🔒" if channel.get("is_private") else "📢"
                print(f"   {i}. {channel_type} #{channel['name']} ({channel['id']})")
            
            if len(channels) > 5:
                print(f"   ... and {len(channels) - 5} more channels")
                
        except Exception as e:
            print(f"   ❌ Failed to list channels: {e}")
        
        # List users
        print("\n👥 Users:")
        try:
            users = await slack.get_users(limit=10)
            active_users = [u for u in users if not u.get("deleted", False)]
            
            for i, user in enumerate(active_users[:5], 1):
                status = "🟢" if not user.get("is_bot") else "🤖"
                real_name = user.get("real_name", user.get("name", "Unknown"))
                print(f"   {i}. {status} {real_name} (@{user['name']})")
            
            print(f"   Total active users: {len(active_users)}")
                
        except Exception as e:
            print(f"   ❌ Failed to list users: {e}")
        
        # Search for recent messages (if available)
        print("\n🔍 Recent Messages:")
        try:
            # Search for messages from the last day
            search_results = await slack.search_messages("in:#general", count=5)
            
            if "messages" in search_results and search_results["messages"]["matches"]:
                for i, match in enumerate(search_results["messages"]["matches"][:3], 1):
                    text = match.get("text", "")[:50] + "..." if len(match.get("text", "")) > 50 else match.get("text", "")
                    user = match.get("user", "Unknown")
                    print(f"   {i}. @{user}: {text}")
            else:
                print("   No recent messages found")
                
        except Exception as e:
            print(f"   ❌ Failed to search messages: {e}")
        
        # Demonstrate posting a message (commented out by default)
        print("\n💬 Message Posting:")
        print("   📝 Ready to post messages (uncomment code to test)")
        
        # Uncomment the following lines to actually post a message
        """
        try:
            # Post to a test channel (make sure it exists and bot has access)
            result = await slack.post_message(
                channel="#test",  # Change to your test channel
                text="Hello from MCP Client! 🤖 This is a test message.",
                username="MCP Bot"
            )
            print(f"   ✅ Message posted successfully: {result.get('ts')}")
            
        except Exception as e:
            print(f"   ❌ Failed to post message: {e}")
        """
        
        # Get channel history
        print("\n📜 Channel History:")
        try:
            # Try to get history from general channel (if accessible)
            history = await slack.get_channel_history("C1234567890", limit=3)  # Replace with actual channel ID
            
            if history:
                print(f"   Found {len(history)} recent messages")
                for i, message in enumerate(history[:2], 1):
                    text = message.get("text", "")[:50] + "..." if len(message.get("text", "")) > 50 else message.get("text", "")
                    user = message.get("user", "Unknown")
                    print(f"   {i}. {user}: {text}")
            else:
                print("   No message history available")
                
        except Exception as e:
            print(f"   ❌ Failed to get channel history: {e}")
        
        print("\n✨ Slack demo completed!")
        
    except Exception as e:
        print(f"❌ Slack demo failed: {e}")
        import traceback
        traceback.print_exc()
    
    finally:
        # Clean up
        await client.disconnect_all()
        print("🧹 Disconnected from Slack")


if __name__ == "__main__":
    asyncio.run(slack_demo())
