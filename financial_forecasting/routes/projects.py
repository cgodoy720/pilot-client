"""Projects API router — CRUD for projects, workstreams, milestones, and tasks."""

import uuid
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from db import get_db

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api", tags=["projects"])

# ── Pydantic models ──


class WorkstreamCreate(BaseModel):
    name: str
    description: str = ""
    sort_order: int = 0


class WorkstreamUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    sort_order: Optional[int] = None


class MilestoneCreate(BaseModel):
    title: str
    status: str = "On Track"
    priority: str = "Now"
    owner: str = ""
    description: str = ""
    source_links: List[str] = []
    sort_order: int = 0


class MilestoneUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    owner: Optional[str] = None
    description: Optional[str] = None
    source_links: Optional[List[str]] = None
    sort_order: Optional[int] = None


class ProjectTaskCreate(BaseModel):
    title: str
    status: str = "Not Started"
    owner: str = ""
    deadline: Optional[str] = None
    start_date: Optional[str] = None
    description: str = ""
    updates: str = ""
    links: List[str] = []
    depends_on: List[str] = []
    sort_order: int = 0


class ProjectTaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[str] = None
    owner: Optional[str] = None
    deadline: Optional[str] = None
    start_date: Optional[str] = None
    description: Optional[str] = None
    updates: Optional[str] = None
    links: Optional[List[str]] = None
    depends_on: Optional[List[str]] = None
    sort_order: Optional[int] = None


# ── Project endpoints ──


@router.get("/projects")
async def list_projects(conn=Depends(get_db)):
    """List all projects."""
    rows = await conn.fetch(
        "SELECT id, name, description, created_at, updated_at FROM project ORDER BY created_at"
    )
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/projects/{project_id}")
async def get_project(project_id: str, conn=Depends(get_db)):
    """Get a full project tree: workstreams → milestones → tasks (single query)."""
    pid = uuid.UUID(project_id)

    project = await conn.fetchrow("SELECT * FROM project WHERE id = $1", pid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    rows = await conn.fetch(
        """
        SELECT
            w.id AS w_id, w.name AS w_name, w.description AS w_desc, w.sort_order AS w_sort,
            m.id AS m_id, m.title AS m_title, m.status AS m_status, m.priority AS m_priority,
            m.owner AS m_owner, m.description AS m_desc, m.source_links AS m_links, m.sort_order AS m_sort,
            t.id AS t_id, t.title AS t_title, t.status AS t_status, t.owner AS t_owner,
            t.deadline AS t_deadline, t.start_date AS t_start_date, t.description AS t_desc,
            t.updates AS t_updates, t.links AS t_links, t.depends_on AS t_depends, t.sort_order AS t_sort
        FROM workstream w
        LEFT JOIN milestone m ON m.workstream_id = w.id
        LEFT JOIN project_task t ON t.milestone_id = m.id
        WHERE w.project_id = $1
        ORDER BY w.sort_order, m.sort_order, t.sort_order
        """,
        pid,
    )

    # Build nested dict
    ws_map: dict = {}
    ms_map: dict = {}

    for r in rows:
        wid = str(r["w_id"])
        if wid not in ws_map:
            ws_map[wid] = {
                "id": wid,
                "name": r["w_name"],
                "description": r["w_desc"],
                "sort_order": r["w_sort"],
                "milestones": [],
            }

        mid = str(r["m_id"]) if r["m_id"] else None
        if mid and mid not in ms_map:
            ms_obj = {
                "id": mid,
                "title": r["m_title"],
                "status": r["m_status"],
                "priority": r["m_priority"],
                "owner": r["m_owner"],
                "description": r["m_desc"],
                "sourceLinks": r["m_links"] or [],
                "sort_order": r["m_sort"],
                "tasks": [],
            }
            ms_map[mid] = ms_obj
            ws_map[wid]["milestones"].append(ms_obj)

        if r["t_id"] and mid:
            ms_map[mid]["tasks"].append({
                "id": str(r["t_id"]),
                "title": r["t_title"],
                "status": r["t_status"],
                "owner": r["t_owner"],
                "deadline": r["t_deadline"].isoformat() if r["t_deadline"] else None,
                "startDate": r["t_start_date"].isoformat() if r["t_start_date"] else None,
                "description": r["t_desc"],
                "updates": r["t_updates"],
                "links": r["t_links"] or [],
                "dependsOn": [str(d) for d in (r["t_depends"] or [])],
                "sort_order": r["t_sort"],
            })

    result = {
        "id": str(project["id"]),
        "name": project["name"],
        "description": project["description"],
        "workstreams": list(ws_map.values()),
    }
    return {"success": True, "data": result}


# ── Workstream CRUD ──


@router.post("/projects/{project_id}/workstreams")
async def create_workstream(project_id: str, body: WorkstreamCreate, conn=Depends(get_db)):
    pid = uuid.UUID(project_id)
    row = await conn.fetchrow(
        """INSERT INTO workstream (project_id, name, description, sort_order)
           VALUES ($1, $2, $3, $4) RETURNING id""",
        pid, body.name, body.description, body.sort_order,
    )
    return {"success": True, "data": {"id": str(row["id"])}}


@router.put("/workstreams/{workstream_id}")
async def update_workstream(workstream_id: str, body: WorkstreamUpdate, conn=Depends(get_db)):
    wid = uuid.UUID(workstream_id)
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    vals = [wid] + list(fields.values())
    await conn.execute(f"UPDATE workstream SET {sets} WHERE id = $1", *vals)
    return {"success": True, "data": {"message": "Workstream updated"}}


@router.delete("/workstreams/{workstream_id}")
async def delete_workstream(workstream_id: str, conn=Depends(get_db)):
    wid = uuid.UUID(workstream_id)
    await conn.execute("DELETE FROM workstream WHERE id = $1", wid)
    return {"success": True, "data": {"message": "Workstream deleted"}}


# ── Milestone CRUD ──


@router.post("/workstreams/{workstream_id}/milestones")
async def create_milestone(workstream_id: str, body: MilestoneCreate, conn=Depends(get_db)):
    wid = uuid.UUID(workstream_id)
    row = await conn.fetchrow(
        """INSERT INTO milestone (workstream_id, title, status, priority, owner, description, source_links, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id""",
        wid, body.title, body.status, body.priority, body.owner,
        body.description, body.source_links, body.sort_order,
    )
    return {"success": True, "data": {"id": str(row["id"])}}


@router.put("/milestones/{milestone_id}")
async def update_milestone(milestone_id: str, body: MilestoneUpdate, conn=Depends(get_db)):
    mid = uuid.UUID(milestone_id)
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    vals = [mid] + list(fields.values())
    await conn.execute(f"UPDATE milestone SET {sets} WHERE id = $1", *vals)
    return {"success": True, "data": {"message": "Milestone updated"}}


@router.delete("/milestones/{milestone_id}")
async def delete_milestone(milestone_id: str, conn=Depends(get_db)):
    mid = uuid.UUID(milestone_id)
    await conn.execute("DELETE FROM milestone WHERE id = $1", mid)
    return {"success": True, "data": {"message": "Milestone deleted"}}


# ── Project Task CRUD ──


@router.post("/milestones/{milestone_id}/tasks")
async def create_project_task(milestone_id: str, body: ProjectTaskCreate, conn=Depends(get_db)):
    mid = uuid.UUID(milestone_id)
    deadline = None
    if body.deadline:
        from datetime import date as d
        deadline = d.fromisoformat(body.deadline)

    start_date_val = None
    if body.start_date:
        from datetime import date as d
        start_date_val = d.fromisoformat(body.start_date)

    depends = [uuid.UUID(x) for x in body.depends_on] if body.depends_on else []

    row = await conn.fetchrow(
        """INSERT INTO project_task (milestone_id, title, status, owner, deadline, start_date, description, updates, links, depends_on, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id""",
        mid, body.title, body.status, body.owner, deadline, start_date_val,
        body.description, body.updates, body.links, depends, body.sort_order,
    )
    return {"success": True, "data": {"id": str(row["id"])}}


@router.put("/project-tasks/{task_id}")
async def update_project_task(task_id: str, body: ProjectTaskUpdate, conn=Depends(get_db)):
    tid = uuid.UUID(task_id)
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    # Convert special fields
    if "deadline" in fields:
        if fields["deadline"]:
            from datetime import date as d
            fields["deadline"] = d.fromisoformat(fields["deadline"])
        else:
            fields["deadline"] = None
    if "start_date" in fields:
        if fields["start_date"]:
            from datetime import date as d
            fields["start_date"] = d.fromisoformat(fields["start_date"])
        else:
            fields["start_date"] = None
    if "depends_on" in fields:
        fields["depends_on"] = [uuid.UUID(x) for x in fields["depends_on"]]

    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    vals = [tid] + list(fields.values())
    await conn.execute(f"UPDATE project_task SET {sets} WHERE id = $1", *vals)
    return {"success": True, "data": {"message": "Task updated"}}


@router.delete("/project-tasks/{task_id}")
async def delete_project_task(task_id: str, conn=Depends(get_db)):
    tid = uuid.UUID(task_id)
    await conn.execute("DELETE FROM project_task WHERE id = $1", tid)
    return {"success": True, "data": {"message": "Task deleted"}}
