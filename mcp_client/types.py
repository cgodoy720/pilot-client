"""Type definitions for MCP protocol."""

from typing import Any, Dict, List, Optional, Union
from pydantic import BaseModel, Field


class MCPMessage(BaseModel):
    """Base MCP message."""
    jsonrpc: str = "2.0"


class MCPRequest(MCPMessage):
    """MCP request message."""
    id: Union[str, int]
    method: str
    params: Optional[Dict[str, Any]] = None


class MCPResponse(MCPMessage):
    """MCP response message."""
    id: Union[str, int]
    result: Optional[Any] = None
    error: Optional[Dict[str, Any]] = None


class MCPNotification(MCPMessage):
    """MCP notification message."""
    method: str
    params: Optional[Dict[str, Any]] = None


class MCPError(BaseModel):
    """MCP error object."""
    code: int
    message: str
    data: Optional[Any] = None


class ToolDefinition(BaseModel):
    """MCP tool definition."""
    name: str
    description: str
    inputSchema: Dict[str, Any]


class ResourceDefinition(BaseModel):
    """MCP resource definition."""
    uri: str
    name: str
    description: Optional[str] = None
    mimeType: Optional[str] = None


class PromptDefinition(BaseModel):
    """MCP prompt definition."""
    name: str
    description: str
    arguments: Optional[List[Dict[str, Any]]] = None


class ServerCapabilities(BaseModel):
    """MCP server capabilities."""
    tools: Optional[Dict[str, Any]] = None
    resources: Optional[Dict[str, Any]] = None
    prompts: Optional[Dict[str, Any]] = None
    logging: Optional[Dict[str, Any]] = None


class ClientCapabilities(BaseModel):
    """MCP client capabilities."""
    experimental: Optional[Dict[str, Any]] = None
    sampling: Optional[Dict[str, Any]] = None
