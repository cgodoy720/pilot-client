"""Shared FastAPI dependency functions.

Separated from main.py to avoid circular imports when route files
need to inject services via Depends().
"""

import asyncio
from typing import Any, Dict

from fastapi import HTTPException

from mcp_client import UnifiedMCPClient
from data_sync import DataSyncService

# Service singletons — populated by main.py startup_event()
_services: Dict[str, Any] = {}

# Shared sync lock — used by background_sync_task, /api/sync/trigger,
# and /api/activities/sync/trigger to prevent concurrent syncs.
_sync_lock = asyncio.Lock()


def get_mcp_client() -> UnifiedMCPClient:
    """Get MCP client dependency."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    return client


def get_data_sync_service() -> DataSyncService:
    """Get data sync service dependency."""
    svc = _services.get("data_sync_service")
    if not svc:
        raise HTTPException(status_code=503, detail="Data sync service not available")
    return svc
