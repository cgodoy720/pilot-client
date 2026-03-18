"""Service integrations for MCP client."""

from .slack import SlackMCPService
from .salesforce import SalesforceMCPService
from .google_drive import GoogleDriveMCPService
from .sage_intacct import SageIntacctMCPService
from .fireflies import FirefliesMCPService
from .gmail import GmailMCPService
from .calendar import GoogleCalendarMCPService

__all__ = [
    "SlackMCPService",
    "SalesforceMCPService",
    "GoogleDriveMCPService",
    "SageIntacctMCPService",
    "FirefliesMCPService",
    "GmailMCPService",
    "GoogleCalendarMCPService",
]
