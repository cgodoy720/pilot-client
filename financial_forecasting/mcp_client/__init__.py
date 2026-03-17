"""MCP Client for connecting to Slack, Salesforce, and Google Drive."""

from .client import MCPClient
from .unified_client import UnifiedMCPClient
from .transport import Transport, WebSocketTransport, StdioTransport
from .types import MCPMessage, MCPRequest, MCPResponse, MCPNotification
from .services import (
    SlackMCPService, SalesforceMCPService, GoogleDriveMCPService, SageIntacctMCPService,
    GoogleCalendarMCPService, GmailMCPService, FirefliesMCPService,
)

__version__ = "0.1.0"
__all__ = [
    "MCPClient",
    "UnifiedMCPClient",
    "Transport",
    "WebSocketTransport",
    "StdioTransport",
    "MCPMessage",
    "MCPRequest",
    "MCPResponse",
    "MCPNotification",
    "SlackMCPService",
    "SalesforceMCPService",
    "GoogleDriveMCPService",
    "SageIntacctMCPService",
    "GoogleCalendarMCPService",
    "GmailMCPService",
    "FirefliesMCPService",
]
