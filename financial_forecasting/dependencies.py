"""Shared FastAPI dependency functions.

Separated from main.py to avoid circular imports when route files
need to inject services via Depends().
"""

from typing import Any, Dict

from fastapi import HTTPException

from mcp_client import UnifiedMCPClient

# Service singletons — populated by main.py startup_event()
_services: Dict[str, Any] = {}


def get_mcp_client() -> UnifiedMCPClient:
    """Get MCP client dependency."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    return client
