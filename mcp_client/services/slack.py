"""Slack MCP service integration."""

from typing import Any, Dict, List, Optional
import asyncio
from slack_sdk.web.async_client import AsyncWebClient
from slack_sdk.errors import SlackApiError

from .base import BaseMCPService


class SlackMCPService(BaseMCPService):
    """Slack MCP service integration."""

    def __init__(self, client, bot_token: Optional[str] = None, team_id: Optional[str] = None):
        super().__init__(client)
        self.bot_token = bot_token or self.get_config_value("SLACK_BOT_TOKEN")
        self.team_id = team_id or self.get_config_value("SLACK_TEAM_ID")
        self.slack_client: Optional[AsyncWebClient] = None
        
        if not self.bot_token:
            raise ValueError("Slack bot token is required")

    async def authenticate(self) -> bool:
        """Authenticate with Slack API."""
        try:
            self.slack_client = AsyncWebClient(token=self.bot_token)
            
            # Test authentication
            response = await self.slack_client.auth_test()
            if response["ok"]:
                self._authenticated = True
                self._config.update({
                    "user_id": response["user_id"],
                    "team": response["team"],
                    "url": response["url"],
                })
                return True
            return False
            
        except SlackApiError as e:
            print(f"Slack authentication failed: {e}")
            return False

    async def get_service_info(self) -> Dict[str, Any]:
        """Get Slack service information."""
        await self.ensure_authenticated()
        
        return {
            "service": "slack",
            "authenticated": self._authenticated,
            "config": self._config,
            "available_tools": await self._get_available_tools(),
        }

    async def _get_available_tools(self) -> List[str]:
        """Get available Slack tools from MCP server."""
        tools = []
        for tool_name, tool_def in self.client.available_tools.items():
            if "slack" in tool_name.lower():
                tools.append(tool_name)
        return tools

    async def post_message(self, channel: str, text: str, **kwargs) -> Dict[str, Any]:
        """Post a message to a Slack channel."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "slack_post_message" in self.client.available_tools:
                return await self.client.call_tool(
                    "slack_post_message",
                    {"channel": channel, "text": text, **kwargs}
                )
            
            # Fallback to direct API call
            if self.slack_client:
                response = await self.slack_client.chat_postMessage(
                    channel=channel, text=text, **kwargs
                )
                return response.data
            
            raise Exception("No Slack client available")
            
        except SlackApiError as e:
            raise Exception(f"Failed to post message: {e}")

    async def get_channels(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get list of channels."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "slack_list_channels" in self.client.available_tools:
                result = await self.client.call_tool(
                    "slack_list_channels",
                    {"limit": limit}
                )
                return result.get("channels", [])
            
            # Fallback to direct API call
            if self.slack_client:
                response = await self.slack_client.conversations_list(limit=limit)
                return response["channels"]
            
            raise Exception("No Slack client available")
            
        except SlackApiError as e:
            raise Exception(f"Failed to get channels: {e}")

    async def get_users(self, limit: int = 100) -> List[Dict[str, Any]]:
        """Get list of users."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "slack_list_users" in self.client.available_tools:
                result = await self.client.call_tool(
                    "slack_list_users",
                    {"limit": limit}
                )
                return result.get("users", [])
            
            # Fallback to direct API call
            if self.slack_client:
                response = await self.slack_client.users_list(limit=limit)
                return response["members"]
            
            raise Exception("No Slack client available")
            
        except SlackApiError as e:
            raise Exception(f"Failed to get users: {e}")

    async def search_messages(
        self, query: str, count: int = 20, sort: str = "timestamp"
    ) -> Dict[str, Any]:
        """Search messages in Slack."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "slack_search_messages" in self.client.available_tools:
                return await self.client.call_tool(
                    "slack_search_messages",
                    {"query": query, "count": count, "sort": sort}
                )
            
            # Fallback to direct API call
            if self.slack_client:
                response = await self.slack_client.search_messages(
                    query=query, count=count, sort=sort
                )
                return response.data
            
            raise Exception("No Slack client available")
            
        except SlackApiError as e:
            raise Exception(f"Failed to search messages: {e}")

    async def get_channel_history(
        self, channel: str, limit: int = 100
    ) -> List[Dict[str, Any]]:
        """Get channel message history."""
        await self.ensure_authenticated()
        
        try:
            # Use MCP tool if available
            if "slack_get_history" in self.client.available_tools:
                result = await self.client.call_tool(
                    "slack_get_history",
                    {"channel": channel, "limit": limit}
                )
                return result.get("messages", [])
            
            # Fallback to direct API call
            if self.slack_client:
                response = await self.slack_client.conversations_history(
                    channel=channel, limit=limit
                )
                return response["messages"]
            
            raise Exception("No Slack client available")
            
        except SlackApiError as e:
            raise Exception(f"Failed to get channel history: {e}")
