"""Admin endpoints for Salesforce schema drift management.

Provides on-demand drift scanning, unresolved drift listing,
and resolution workflow. All endpoints require admin auth.
"""

import logging

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import get_db
from dependencies import get_mcp_client
from routes.permissions import require_admin
from services.sf_schema_drift import detect_schema_drift, get_unresolved_drifts, resolve_drift

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/admin/sf-schema-drift", tags=["admin-sf-drift"])


class DriftResolveRequest(BaseModel):
    action_taken: str


@router.post("/scan")
async def scan_schema_drift(
    user=Depends(require_admin),
    conn=Depends(get_db),
    client=Depends(get_mcp_client),
):
    """Run drift detection across all tracked SObjects."""
    results = await detect_schema_drift(conn, client)
    total_drifts = sum(r["drifts_found"] for r in results)
    sobjects_scanned = sum(1 for r in results if r["error"] is None)
    return {
        "success": True,
        "data": {
            "sobjects_scanned": sobjects_scanned,
            "total_drifts": total_drifts,
            "results": results,
        },
    }


@router.get("")
async def list_unresolved_drifts(
    user=Depends(require_admin),
    conn=Depends(get_db),
):
    """List all unresolved schema drift entries."""
    drifts = await get_unresolved_drifts(conn)
    return {"success": True, "data": drifts}


@router.post("/{drift_id}/resolve")
async def resolve_drift_entry(
    drift_id: int,
    body: DriftResolveRequest,
    user=Depends(require_admin),
    conn=Depends(get_db),
):
    """Mark a drift entry as resolved with an action description."""
    resolved = await resolve_drift(
        conn, drift_id, user.get("email", "unknown"), body.action_taken,
    )
    if resolved is None:
        raise HTTPException(404, "Drift entry not found or already resolved")
    return {"success": True, "data": resolved}
