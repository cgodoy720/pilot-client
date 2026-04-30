"""Awards API — read endpoints over bedrock.award.

Award is a thin lifecycle entity layered over closed-won Philanthropy
Opportunities. See `tasks/bedrock-redesign-data-model.md` for the model.

This router intentionally does **not** expose POST /awards — awards are
auto-created by `services.awards_service.ensure_for_opp` when an opp
transitions into a closed/active-grant Philanthropy stage. Manual award
creation is not part of the workflow today.

Endpoints:
    GET    /api/awards                    — list (filterable)
    GET    /api/awards/{award_id}         — single award by Bedrock id
    GET    /api/awards/by-opp/{opp_id}    — single award by SF opportunity id
    PATCH  /api/awards/{award_id}         — update mutable fields
                                            (status, period_end_date, notes)
"""

from __future__ import annotations

import logging
import uuid
from typing import Any, Dict, List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel, Field

from auth import require_auth
from db import get_db
from security import validate_salesforce_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/awards", tags=["awards"])


# ── Pydantic ──────────────────────────────────────────────────────────────


class AwardOut(BaseModel):
    id: str
    opportunity_id: str
    award_status: str
    award_date: Optional[str] = None
    period_end_date: Optional[str] = None
    notes: str
    created_at: str
    updated_at: str


class AwardUpdate(BaseModel):
    award_status: Optional[str] = Field(
        default=None,
        description="Active | Closing | Closed",
    )
    period_end_date: Optional[str] = None  # YYYY-MM-DD
    notes: Optional[str] = None


_ALLOWED_STATUS = frozenset({"Active", "Closing", "Closed"})


def _serialize(row: Dict[str, Any]) -> Dict[str, Any]:
    """Convert asyncpg row to JSON-friendly dict."""
    out = dict(row)
    out["id"] = str(out["id"])
    for k in ("award_date", "period_end_date", "created_at", "updated_at"):
        v = out.get(k)
        if v is not None:
            out[k] = v.isoformat()
    return out


# ── Endpoints ─────────────────────────────────────────────────────────────


@router.get("")
async def list_awards(
    status: Optional[str] = Query(None, description="Filter by award_status"),
    conn=Depends(get_db),
    user=Depends(require_auth),
) -> List[Dict[str, Any]]:
    """List awards. Filter by status if provided.

    No pagination yet — total award count is small (~hundreds at most after
    backfill). Add pagination if list size exceeds 500.
    """
    if status is not None and status not in _ALLOWED_STATUS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid status. Must be one of: {sorted(_ALLOWED_STATUS)}",
        )

    if status:
        rows = await conn.fetch(
            """
            SELECT id, opportunity_id, award_status, award_date,
                   period_end_date, notes, created_at, updated_at
            FROM bedrock.award
            WHERE deleted_at IS NULL AND award_status = $1
            ORDER BY award_date DESC NULLS LAST, created_at DESC
            """,
            status,
        )
    else:
        rows = await conn.fetch(
            """
            SELECT id, opportunity_id, award_status, award_date,
                   period_end_date, notes, created_at, updated_at
            FROM bedrock.award
            WHERE deleted_at IS NULL
            ORDER BY award_date DESC NULLS LAST, created_at DESC
            """
        )
    return [_serialize(r) for r in rows]


@router.get("/by-opp/{opp_id}")
async def get_award_by_opp(
    opp_id: str,
    conn=Depends(get_db),
    user=Depends(require_auth),
) -> Dict[str, Any]:
    validate_salesforce_id(opp_id, "opportunity_id")
    row = await conn.fetchrow(
        """
        SELECT id, opportunity_id, award_status, award_date,
               period_end_date, notes, created_at, updated_at
        FROM bedrock.award
        WHERE opportunity_id = $1 AND deleted_at IS NULL
        """,
        opp_id,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Award not found for this opportunity")
    return _serialize(row)


@router.get("/{award_id}")
async def get_award(
    award_id: str,
    conn=Depends(get_db),
    user=Depends(require_auth),
) -> Dict[str, Any]:
    try:
        aid = uuid.UUID(award_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid award_id")
    row = await conn.fetchrow(
        """
        SELECT id, opportunity_id, award_status, award_date,
               period_end_date, notes, created_at, updated_at
        FROM bedrock.award
        WHERE id = $1 AND deleted_at IS NULL
        """,
        aid,
    )
    if not row:
        raise HTTPException(status_code=404, detail="Award not found")
    return _serialize(row)


@router.patch("/{award_id}")
async def update_award(
    award_id: str,
    payload: AwardUpdate,
    conn=Depends(get_db),
    user=Depends(require_auth),
) -> Dict[str, Any]:
    try:
        aid = uuid.UUID(award_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid award_id")

    # Validate status enum if provided
    if payload.award_status is not None and payload.award_status not in _ALLOWED_STATUS:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid award_status. Must be one of: {sorted(_ALLOWED_STATUS)}",
        )

    sets: List[str] = []
    vals: List[Any] = []
    if payload.award_status is not None:
        sets.append(f"award_status = ${len(vals) + 2}")
        vals.append(payload.award_status)
    if payload.period_end_date is not None:
        sets.append(f"period_end_date = ${len(vals) + 2}")
        vals.append(payload.period_end_date)
    if payload.notes is not None:
        sets.append(f"notes = ${len(vals) + 2}")
        vals.append(payload.notes)

    if not sets:
        raise HTTPException(status_code=400, detail="No fields to update")

    sql = (
        f"UPDATE bedrock.award SET {', '.join(sets)} "
        f"WHERE id = $1 AND deleted_at IS NULL "
        f"RETURNING id, opportunity_id, award_status, award_date, "
        f"period_end_date, notes, created_at, updated_at"
    )
    row = await conn.fetchrow(sql, aid, *vals)
    if not row:
        raise HTTPException(status_code=404, detail="Award not found")
    return _serialize(row)
