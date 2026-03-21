"""Salesforce Task Dependencies API — CRUD for dependency edges stored locally."""

import logging
import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel

from auth import require_auth
from db import get_db
from security import validate_salesforce_id

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/salesforce", tags=["sf-dependencies"])


class DependencyCreate(BaseModel):
    depends_on_id: str


# ── Endpoints ──


@router.get("/opportunities/{opp_id}/task-dependencies")
async def get_opportunity_task_dependencies(
    opp_id: str,
    task_ids: Optional[str] = Query(None, description="Comma-separated SF Task IDs to filter by"),
    user=Depends(require_auth),
    db=Depends(get_db),
):
    """Get dependency edges for tasks under an opportunity.

    Pass ?task_ids=00T...,00T... to filter to only deps involving those tasks.
    Without task_ids, returns an empty list (no global overfetch).
    """
    if not task_ids:
        return {"success": True, "data": []}
    ids = [t.strip() for t in task_ids.split(",") if t.strip()]
    if not ids:
        return {"success": True, "data": []}
    # Parameterized IN clause
    placeholders = ", ".join(f"${i+1}" for i in range(len(ids)))
    rows = await db.fetch(
        f"SELECT id, task_id, depends_on_id, created_at FROM sf_task_dependency "
        f"WHERE task_id IN ({placeholders}) OR depends_on_id IN ({placeholders}) "
        f"ORDER BY created_at",
        *ids, *ids,
    )
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/tasks/{task_id}/dependencies")
async def get_task_dependencies(task_id: str, user=Depends(require_auth), db=Depends(get_db)):
    """Get all dependencies for a specific task."""
    validate_salesforce_id(task_id, "task_id")
    rows = await db.fetch(
        "SELECT id, task_id, depends_on_id, created_at FROM sf_task_dependency "
        "WHERE task_id = $1 OR depends_on_id = $1 ORDER BY created_at",
        task_id,
    )
    return {"success": True, "data": [dict(r) for r in rows]}


@router.post("/tasks/{task_id}/dependencies")
async def add_task_dependency(
    task_id: str, body: DependencyCreate, user=Depends(require_auth), db=Depends(get_db)
):
    """Add a dependency edge: task_id depends on body.depends_on_id."""
    validate_salesforce_id(task_id, "task_id")
    validate_salesforce_id(body.depends_on_id, "depends_on_id")
    if task_id == body.depends_on_id:
        raise HTTPException(status_code=400, detail="A task cannot depend on itself")
    try:
        row = await db.fetchrow(
            "INSERT INTO sf_task_dependency (task_id, depends_on_id) "
            "VALUES ($1, $2) "
            "ON CONFLICT (task_id, depends_on_id) DO NOTHING "
            "RETURNING id, task_id, depends_on_id, created_at",
            task_id,
            body.depends_on_id,
        )
        if not row:
            return {"success": True, "data": None, "message": "Dependency already exists"}
        return {"success": True, "data": dict(row)}
    except Exception as e:
        logger.error(f"Error adding dependency: {e}")
        raise HTTPException(status_code=500, detail="Failed to add dependency")


@router.delete("/task-dependencies/{dep_id}")
async def remove_task_dependency(dep_id: str, user=Depends(require_auth), db=Depends(get_db)):
    """Remove a dependency edge by its ID."""
    # Validate UUID format
    try:
        uuid.UUID(dep_id)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid dependency ID format")
    result = await db.execute(
        "DELETE FROM sf_task_dependency WHERE id = $1", dep_id
    )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Dependency not found")
    return {"success": True, "data": {"message": "Dependency removed"}}


@router.get("/tasks/search")
async def search_tasks(q: str, user=Depends(require_auth), db=Depends(get_db)):
    """Search for tasks globally — used for cross-opportunity dependency picking.

    For MVP, the frontend uses the already-loaded inbox tasks for cross-opp search.
    A dedicated Salesforce SOQL search can be added later if needed.
    """
    return {"success": True, "data": [], "message": "Use frontend task cache for search"}
