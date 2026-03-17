"""Unified MCP client interface for all services."""

from typing import Any, Dict, List, Optional, Union
import asyncio
from .client import MCPClient
from .transport import Transport, WebSocketTransport, StdioTransport
from .services import (
    SlackMCPService, SalesforceMCPService, GoogleDriveMCPService, SageIntacctMCPService,
    GoogleCalendarMCPService, GmailMCPService, FirefliesMCPService,
)


class UnifiedMCPClient:
    """Unified client for managing multiple MCP service connections."""

    def __init__(self):
        self.clients: Dict[str, MCPClient] = {}
        self.services: Dict[str, Any] = {}
        self._connected_services: List[str] = []

    async def connect_slack(
        self,
        transport: Union[Transport, str],
        bot_token: Optional[str] = None,
        team_id: Optional[str] = None,
    ) -> SlackMCPService:
        """Connect to Slack MCP server."""
        # Create transport if string provided
        if isinstance(transport, str):
            if transport.startswith("ws://") or transport.startswith("wss://"):
                transport = WebSocketTransport(transport)
            else:
                transport = StdioTransport()  # Assume stdio for other cases

        # Create MCP client
        client = MCPClient(transport, {"name": "pursuit-mcp-client-slack", "version": "0.1.0"})
        await client.connect()
        
        # Create service
        service = SlackMCPService(client, bot_token, team_id)
        await service.authenticate()
        
        # Store references
        self.clients["slack"] = client
        self.services["slack"] = service
        self._connected_services.append("slack")
        
        return service

    async def connect_salesforce(
        self,
        transport: Union[Transport, str],
        username: Optional[str] = None,
        password: Optional[str] = None,
        security_token: Optional[str] = None,
        domain: Optional[str] = None,
    ) -> SalesforceMCPService:
        """Connect to Salesforce MCP server."""
        # Create transport if string provided
        if isinstance(transport, str):
            if transport.startswith("ws://") or transport.startswith("wss://"):
                transport = WebSocketTransport(transport)
            else:
                transport = StdioTransport()

        # Create MCP client
        client = MCPClient(transport, {"name": "pursuit-mcp-client-salesforce", "version": "0.1.0"})
        await client.connect()

        # Create service
        service = SalesforceMCPService(client, username, password, security_token, domain)
        await service.authenticate()
        
        # Store references
        self.clients["salesforce"] = client
        self.services["salesforce"] = service
        self._connected_services.append("salesforce")
        
        return service

    async def connect_google_drive(
        self,
        transport: Union[Transport, str],
        client_id: Optional[str] = None,
        client_secret: Optional[str] = None,
        redirect_uri: Optional[str] = None,
        credentials_file: Optional[str] = None,
        token_file: Optional[str] = None,
    ) -> GoogleDriveMCPService:
        """Connect to Google Drive MCP server."""
        # Create transport if string provided
        if isinstance(transport, str):
            if transport.startswith("ws://") or transport.startswith("wss://"):
                transport = WebSocketTransport(transport)
            else:
                transport = StdioTransport()

        # Create MCP client
        client = MCPClient(transport, {"name": "pursuit-mcp-client-gdrive", "version": "0.1.0"})
        await client.connect()
        
        # Create service
        service = GoogleDriveMCPService(
            client, client_id, client_secret, redirect_uri, credentials_file, token_file
        )
        await service.authenticate()
        
        # Store references
        self.clients["google_drive"] = client
        self.services["google_drive"] = service
        self._connected_services.append("google_drive")
        
        return service

    async def connect_sage_intacct(
        self,
        transport: Union[Transport, str],
        company_id: Optional[str] = None,
        user_id: Optional[str] = None,
        user_password: Optional[str] = None,
        sender_id: Optional[str] = None,
        sender_password: Optional[str] = None,
        endpoint_url: Optional[str] = None,
    ) -> SageIntacctMCPService:
        """Connect to Sage Intacct MCP server."""
        # Create transport if string provided
        if isinstance(transport, str):
            if transport.startswith("ws://") or transport.startswith("wss://"):
                transport = WebSocketTransport(transport)
            else:
                transport = StdioTransport()

        # Create MCP client
        client = MCPClient(transport, {"name": "pursuit-mcp-client-intacct", "version": "0.1.0"})
        await client.connect()
        
        # Create service
        service = SageIntacctMCPService(
            client, company_id, user_id, user_password, sender_id, sender_password, endpoint_url
        )
        await service.authenticate()
        
        # Store references
        self.clients["sage_intacct"] = client
        self.services["sage_intacct"] = service
        self._connected_services.append("sage_intacct")
        
        return service

    async def connect_google_calendar(
        self,
        credentials_file: Optional[str] = None,
        token_file: Optional[str] = None,
    ) -> GoogleCalendarMCPService:
        """Connect to Google Calendar API (direct API, no MCP transport)."""
        service = GoogleCalendarMCPService(None, credentials_file, token_file)
        authenticated = await service.authenticate()
        if not authenticated:
            raise RuntimeError("Google Calendar authentication failed — check token file")
        self.services["google_calendar"] = service
        self._connected_services.append("google_calendar")
        return service

    async def connect_gmail(
        self,
        credentials_file: Optional[str] = None,
        token_file: Optional[str] = None,
    ) -> GmailMCPService:
        """Connect to Gmail API (direct API, no MCP transport)."""
        service = GmailMCPService(None, credentials_file, token_file)
        authenticated = await service.authenticate()
        if not authenticated:
            raise RuntimeError("Gmail authentication failed — check token file")
        self.services["gmail"] = service
        self._connected_services.append("gmail")
        return service

    async def connect_fireflies(
        self,
        api_key: Optional[str] = None,
    ) -> FirefliesMCPService:
        """Connect to Fireflies.ai meeting transcript service."""
        service = FirefliesMCPService(None, api_key)
        authenticated = await service.authenticate()
        if not authenticated:
            raise RuntimeError("Fireflies authentication failed — check API key")
        self.services["fireflies"] = service
        self._connected_services.append("fireflies")
        return service

    async def connect_all_services(
        self,
        slack_transport: Optional[Union[Transport, str]] = None,
        salesforce_transport: Optional[Union[Transport, str]] = None,
        gdrive_transport: Optional[Union[Transport, str]] = None,
        intacct_transport: Optional[Union[Transport, str]] = None,
        **kwargs
    ) -> Dict[str, Any]:
        """Connect to all available services."""
        results = {}
        
        # Connect to services in parallel where possible
        tasks = []
        
        if slack_transport:
            tasks.append(("slack", self.connect_slack(slack_transport, **kwargs.get("slack", {}))))
        
        if salesforce_transport:
            tasks.append(("salesforce", self.connect_salesforce(salesforce_transport, **kwargs.get("salesforce", {}))))
        
        if gdrive_transport:
            tasks.append(("google_drive", self.connect_google_drive(gdrive_transport, **kwargs.get("google_drive", {}))))
        
        if intacct_transport:
            tasks.append(("sage_intacct", self.connect_sage_intacct(intacct_transport, **kwargs.get("sage_intacct", {}))))
        
        # Execute connections
        for service_name, task in tasks:
            try:
                service = await task
                results[service_name] = {
                    "status": "connected",
                    "service": service,
                    "info": await service.get_service_info(),
                }
            except Exception as e:
                results[service_name] = {
                    "status": "failed",
                    "error": str(e),
                }
        
        return results

    async def disconnect_service(self, service_name: str) -> None:
        """Disconnect from a specific service."""
        if service_name in self.clients:
            await self.clients[service_name].disconnect()
            del self.clients[service_name]
            del self.services[service_name]
            if service_name in self._connected_services:
                self._connected_services.remove(service_name)

    async def disconnect_all(self) -> None:
        """Disconnect from all services."""
        for service_name in list(self._connected_services):
            await self.disconnect_service(service_name)

    def get_service(self, service_name: str) -> Optional[Any]:
        """Get a connected service by name."""
        return self.services.get(service_name)

    # ── Typed accessors (prefer these over services["key"]) ────────────────

    @property
    def salesforce(self) -> SalesforceMCPService:
        """Typed Salesforce service accessor."""
        svc = self.services.get("salesforce")
        if svc is None:
            raise RuntimeError("Salesforce service not connected")
        return svc

    @property
    def sage_intacct(self) -> SageIntacctMCPService:
        """Typed Sage Intacct service accessor."""
        svc = self.services.get("sage_intacct")
        if svc is None:
            raise RuntimeError("Sage Intacct service not connected")
        return svc

    @property
    def slack(self) -> Optional[SlackMCPService]:
        """Typed Slack service accessor."""
        return self.services.get("slack")

    @property
    def google_drive(self) -> Optional[GoogleDriveMCPService]:
        """Typed Google Drive service accessor."""
        return self.services.get("google_drive")

    @property
    def google_calendar(self) -> Optional[GoogleCalendarMCPService]:
        """Typed Google Calendar service accessor."""
        return self.services.get("google_calendar")

    @property
    def gmail(self) -> Optional[GmailMCPService]:
        """Typed Gmail service accessor."""
        return self.services.get("gmail")

    @property
    def fireflies(self) -> Optional[FirefliesMCPService]:
        """Typed Fireflies service accessor."""
        return self.services.get("fireflies")

    # Legacy accessors (kept for backward compatibility)
    def get_slack_service(self) -> Optional[SlackMCPService]:
        return self.slack

    def get_salesforce_service(self) -> Optional[SalesforceMCPService]:
        return self.services.get("salesforce")

    def get_google_drive_service(self) -> Optional[GoogleDriveMCPService]:
        return self.google_drive

    @property
    def connected_services(self) -> List[str]:
        """Get list of connected services."""
        return self._connected_services.copy()

    async def get_all_service_info(self) -> Dict[str, Any]:
        """Get information about all connected services."""
        info = {}
        for service_name, service in self.services.items():
            try:
                info[service_name] = await service.get_service_info()
            except Exception as e:
                info[service_name] = {"error": str(e)}
        return info

    async def list_all_tools(self) -> Dict[str, List[str]]:
        """List all available tools across all services."""
        tools = {}
        for service_name, client in self.clients.items():
            tools[service_name] = list(client.available_tools.keys())
        return tools

    async def list_all_resources(self) -> Dict[str, List[str]]:
        """List all available resources across all services."""
        resources = {}
        for service_name, client in self.clients.items():
            resources[service_name] = list(client.available_resources.keys())
        return resources

    async def call_tool_on_service(
        self, service_name: str, tool_name: str, arguments: Optional[Dict[str, Any]] = None
    ) -> Any:
        """Call a tool on a specific service."""
        if service_name not in self.clients:
            raise ValueError(f"Service '{service_name}' not connected")
        
        client = self.clients[service_name]
        return await client.call_tool(tool_name, arguments)

    async def health_check(self) -> Dict[str, Any]:
        """Perform health check on all connected services."""
        health = {}
        
        for service_name in self._connected_services:
            try:
                client = self.clients[service_name]
                service = self.services[service_name]
                
                # Basic connectivity check
                tools = await client.list_tools()
                auth_status = service.is_authenticated
                
                health[service_name] = {
                    "status": "healthy",
                    "authenticated": auth_status,
                    "tools_count": len(tools),
                    "connected": client.is_connected,
                }
            except Exception as e:
                health[service_name] = {
                    "status": "unhealthy",
                    "error": str(e),
                }
        
        return health

    def __enter__(self):
        """Context manager entry."""
        return self

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        asyncio.create_task(self.disconnect_all())

    async def __aenter__(self):
        """Async context manager entry."""
        return self

    async def __aexit__(self, exc_type, exc_val, exc_tb):
        """Async context manager exit."""
        await self.disconnect_all()
