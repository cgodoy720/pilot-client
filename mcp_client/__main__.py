#!/usr/bin/env python3
"""Command-line interface for the MCP client."""

import asyncio
import argparse
import sys
from pathlib import Path

from .unified_client import UnifiedMCPClient


async def run_demo(service: str = "all"):
    """Run a demo of the MCP client."""
    client = UnifiedMCPClient()
    
    print(f"🚀 MCP Client Demo - {service.upper()}")
    print("=" * 50)
    
    try:
        if service in ["all", "slack"]:
            try:
                print("\n📱 Testing Slack connection...")
                slack = await client.connect_slack("stdio")
                info = await slack.get_service_info()
                print(f"✅ Slack: {info['authenticated']}")
            except Exception as e:
                print(f"❌ Slack: {e}")
        
        if service in ["all", "salesforce"]:
            try:
                print("\n💼 Testing Salesforce connection...")
                salesforce = await client.connect_salesforce("stdio")
                info = await salesforce.get_service_info()
                print(f"✅ Salesforce: {info['authenticated']}")
            except Exception as e:
                print(f"❌ Salesforce: {e}")
        
        if service in ["all", "google_drive"]:
            try:
                print("\n💾 Testing Google Drive connection...")
                gdrive = await client.connect_google_drive("stdio")
                info = await gdrive.get_service_info()
                print(f"✅ Google Drive: {info['authenticated']}")
            except Exception as e:
                print(f"❌ Google Drive: {e}")
        
        # Show connected services
        connected = client.connected_services
        if connected:
            print(f"\n🔗 Connected services: {', '.join(connected)}")
            
            # Health check
            health = await client.health_check()
            print("\n🏥 Health Check:")
            for svc, status in health.items():
                icon = "✅" if status["status"] == "healthy" else "❌"
                print(f"   {icon} {svc}: {status['status']}")
        else:
            print("\n⚠️  No services connected")
        
    except Exception as e:
        print(f"❌ Demo failed: {e}")
    
    finally:
        await client.disconnect_all()
        print("\n🧹 Cleanup completed")


def main():
    """Main CLI entry point."""
    parser = argparse.ArgumentParser(
        description="MCP Client for Slack, Salesforce, and Google Drive"
    )
    
    parser.add_argument(
        "--demo",
        choices=["all", "slack", "salesforce", "google_drive"],
        default="all",
        help="Run demo for specific service or all services"
    )
    
    parser.add_argument(
        "--version",
        action="version",
        version="pursuit-mcp-client 0.1.0"
    )
    
    args = parser.parse_args()
    
    if args.demo:
        asyncio.run(run_demo(args.demo))
    else:
        parser.print_help()


if __name__ == "__main__":
    main()
