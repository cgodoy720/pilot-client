"""Shared FastAPI dependency functions.

Separated from main.py to avoid circular imports when route files
need to inject services via Depends().
"""

import asyncio
import logging
from typing import Any, Dict

from fastapi import HTTPException, Request

from mcp_client import UnifiedMCPClient
from data_sync import DataSyncService

logger = logging.getLogger(__name__)

# Service singletons — populated by main.py startup_event()
_services: Dict[str, Any] = {}

# Shared sync lock — used by background_sync_task, /api/sync/trigger,
# and /api/activities/sync/trigger to prevent concurrent syncs.
_sync_lock = asyncio.Lock()


def get_mcp_client(request: Request = None) -> UnifiedMCPClient:
    """Get MCP client dependency.

    If Salesforce isn't connected via service account, tries to use
    the per-user OAuth token from the sf_tokens cookie.
    """
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")

    # If SF is already connected via service account, use as-is
    if "salesforce" in (client.connected_services or []):
        return client

    # Try per-user SF OAuth token from cookie
    if request:
        sf_cookie = request.cookies.get("sf_tokens")
        if sf_cookie:
            try:
                from auth import decrypt_tokens
                from simple_salesforce import Salesforce
                from mcp_client.services.salesforce import SalesforceMCPService

                tokens = decrypt_tokens(sf_cookie)
                if tokens and tokens.get("access_token") and tokens.get("instance_url"):
                    instance = tokens["instance_url"].replace("https://", "")
                    sf = Salesforce(instance=instance, session_id=tokens["access_token"])

                    # Create a lightweight SF service with the user's token
                    svc = SalesforceMCPService.__new__(SalesforceMCPService)
                    svc.client = None
                    svc._config = {}
                    svc._authenticated = True
                    svc.sf_client = sf
                    svc._reauth_lock = asyncio.Lock()
                    svc.username = None
                    svc.password = None
                    svc.security_token = None
                    svc.client_id = None
                    svc.client_secret = None
                    svc.domain = None
                    client.services["salesforce"] = svc
                    if "salesforce" not in client._connected_services:
                        client._connected_services.append("salesforce")
                    logger.info("Using per-user SF OAuth token for this request")
            except Exception as e:
                logger.debug(f"Could not use per-user SF token: {e}")

    return client


def get_data_sync_service() -> DataSyncService:
    """Get data sync service dependency."""
    svc = _services.get("data_sync_service")
    if not svc:
        raise HTTPException(status_code=503, detail="Data sync service not available")
    return svc
