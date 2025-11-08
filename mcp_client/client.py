"""Core MCP client implementation."""

import asyncio
import uuid
from typing import Any, Dict, List, Optional, Union

from .transport import Transport
from .types import (
    MCPRequest,
    MCPResponse,
    MCPNotification,
    ClientCapabilities,
    ServerCapabilities,
    ToolDefinition,
    ResourceDefinition,
    PromptDefinition,
)


class MCPClient:
    """MCP client for communicating with MCP servers."""

    def __init__(self, transport: Transport, client_info: Optional[Dict[str, str]] = None):
        self.transport = transport
        self.client_info = client_info or {
            "name": "pursuit-mcp-client",
            "version": "0.1.0"
        }
        self._request_id = 0
        self._pending_requests: Dict[Union[str, int], asyncio.Future] = {}
        self._server_capabilities: Optional[ServerCapabilities] = None
        self._tools: Dict[str, ToolDefinition] = {}
        self._resources: Dict[str, ResourceDefinition] = {}
        self._prompts: Dict[str, PromptDefinition] = {}
        self._connected = False
        self._message_handler_task: Optional[asyncio.Task] = None

    def _next_request_id(self) -> int:
        """Get the next request ID."""
        self._request_id += 1
        return self._request_id

    async def connect(self) -> None:
        """Connect to the MCP server and perform handshake."""
        await self.transport.connect()
        
        # Start message handler
        self._message_handler_task = asyncio.create_task(self._handle_messages())
        
        # Perform initialization handshake
        await self._initialize()
        
        self._connected = True

    async def disconnect(self) -> None:
        """Disconnect from the MCP server."""
        self._connected = False
        
        if self._message_handler_task:
            self._message_handler_task.cancel()
            try:
                await self._message_handler_task
            except asyncio.CancelledError:
                pass
        
        await self.transport.disconnect()

    async def _handle_messages(self) -> None:
        """Handle incoming messages from the server."""
        try:
            async for message in self.transport.receive():
                if isinstance(message, MCPResponse):
                    # Handle response to a request
                    if message.id in self._pending_requests:
                        future = self._pending_requests.pop(message.id)
                        if message.error:
                            future.set_exception(
                                Exception(f"MCP Error: {message.error}")
                            )
                        else:
                            future.set_result(message.result)
                
                elif isinstance(message, MCPNotification):
                    # Handle server notifications
                    await self._handle_notification(message)
                    
                elif isinstance(message, MCPRequest):
                    # Handle server requests (not typically used in client)
                    pass
                    
        except Exception as e:
            print(f"Message handler error: {e}")

    async def _handle_notification(self, notification: MCPNotification) -> None:
        """Handle server notifications."""
        if notification.method == "notifications/tools/list_changed":
            # Refresh tools list
            await self.list_tools()
        elif notification.method == "notifications/resources/list_changed":
            # Refresh resources list
            await self.list_resources()
        elif notification.method == "notifications/prompts/list_changed":
            # Refresh prompts list
            await self.list_prompts()

    async def _send_request(
        self, method: str, params: Optional[Dict[str, Any]] = None
    ) -> Any:
        """Send a request and wait for response."""
        request_id = self._next_request_id()
        request = MCPRequest(id=request_id, method=method, params=params)
        
        # Create future for response
        future = asyncio.Future()
        self._pending_requests[request_id] = future
        
        # Send request
        await self.transport.send(request)
        
        # Wait for response
        try:
            return await asyncio.wait_for(future, timeout=30.0)
        except asyncio.TimeoutError:
            self._pending_requests.pop(request_id, None)
            raise TimeoutError(f"Request {method} timed out")

    async def _initialize(self) -> None:
        """Initialize the MCP session."""
        # Send initialize request
        client_capabilities = ClientCapabilities()
        
        result = await self._send_request(
            "initialize",
            {
                "protocolVersion": "2024-11-05",
                "capabilities": client_capabilities.model_dump(exclude_none=True),
                "clientInfo": self.client_info,
            },
        )
        
        # Parse server capabilities
        if "capabilities" in result:
            self._server_capabilities = ServerCapabilities(**result["capabilities"])
        
        # Send initialized notification
        notification = MCPNotification(method="notifications/initialized")
        await self.transport.send(notification)
        
        # Load available tools, resources, and prompts
        await asyncio.gather(
            self.list_tools(),
            self.list_resources(), 
            self.list_prompts(),
            return_exceptions=True,
        )

    async def list_tools(self) -> List[ToolDefinition]:
        """List available tools from the server."""
        try:
            result = await self._send_request("tools/list")
            tools = result.get("tools", [])
            
            self._tools = {}
            tool_definitions = []
            
            for tool_data in tools:
                tool = ToolDefinition(**tool_data)
                self._tools[tool.name] = tool
                tool_definitions.append(tool)
            
            return tool_definitions
        except Exception as e:
            print(f"Failed to list tools: {e}")
            return []

    async def call_tool(self, name: str, arguments: Optional[Dict[str, Any]] = None) -> Any:
        """Call a tool on the server."""
        if name not in self._tools:
            raise ValueError(f"Tool '{name}' not found")
        
        result = await self._send_request(
            "tools/call",
            {"name": name, "arguments": arguments or {}},
        )
        
        return result

    async def list_resources(self) -> List[ResourceDefinition]:
        """List available resources from the server."""
        try:
            result = await self._send_request("resources/list")
            resources = result.get("resources", [])
            
            self._resources = {}
            resource_definitions = []
            
            for resource_data in resources:
                resource = ResourceDefinition(**resource_data)
                self._resources[resource.uri] = resource
                resource_definitions.append(resource)
            
            return resource_definitions
        except Exception as e:
            print(f"Failed to list resources: {e}")
            return []

    async def read_resource(self, uri: str) -> Any:
        """Read a resource from the server."""
        if uri not in self._resources:
            raise ValueError(f"Resource '{uri}' not found")
        
        result = await self._send_request("resources/read", {"uri": uri})
        return result

    async def list_prompts(self) -> List[PromptDefinition]:
        """List available prompts from the server."""
        try:
            result = await self._send_request("prompts/list")
            prompts = result.get("prompts", [])
            
            self._prompts = {}
            prompt_definitions = []
            
            for prompt_data in prompts:
                prompt = PromptDefinition(**prompt_data)
                self._prompts[prompt.name] = prompt
                prompt_definitions.append(prompt)
            
            return prompt_definitions
        except Exception as e:
            print(f"Failed to list prompts: {e}")
            return []

    async def get_prompt(
        self, name: str, arguments: Optional[Dict[str, Any]] = None
    ) -> Any:
        """Get a prompt from the server."""
        if name not in self._prompts:
            raise ValueError(f"Prompt '{name}' not found")
        
        result = await self._send_request(
            "prompts/get",
            {"name": name, "arguments": arguments or {}},
        )
        
        return result

    @property
    def server_capabilities(self) -> Optional[ServerCapabilities]:
        """Get server capabilities."""
        return self._server_capabilities

    @property
    def available_tools(self) -> Dict[str, ToolDefinition]:
        """Get available tools."""
        return self._tools.copy()

    @property
    def available_resources(self) -> Dict[str, ResourceDefinition]:
        """Get available resources."""
        return self._resources.copy()

    @property
    def available_prompts(self) -> Dict[str, PromptDefinition]:
        """Get available prompts."""
        return self._prompts.copy()

    @property
    def is_connected(self) -> bool:
        """Check if client is connected."""
        return self._connected
