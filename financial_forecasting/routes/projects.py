"""Projects API router — CRUD for projects, workstreams, milestones, and tasks."""

import uuid
import logging
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from auth import require_auth
from db import get_db
from security import validate_salesforce_id

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


class ProjectCreate(BaseModel):
    name: str
    description: str = ""


class ProjectUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class OpportunityLink(BaseModel):
    opportunity_id: str
    role: str = "linked"


class ProjectImportTask(BaseModel):
    title: str
    status: str = "Not Started"
    owner: str = ""
    deadline: Optional[str] = None
    start_date: Optional[str] = None
    description: str = ""


class ProjectImportMilestone(BaseModel):
    title: str
    status: str = "On Track"
    priority: str = "Now"
    owner: str = ""
    tasks: List[ProjectImportTask] = []


class ProjectImportWorkstream(BaseModel):
    name: str
    description: str = ""
    milestones: List[ProjectImportMilestone] = []


class ProjectImportPayload(BaseModel):
    workstreams: List[ProjectImportWorkstream]
    replace: bool = False


# ── Project endpoints ──


@router.get("/projects")
async def list_projects(user=Depends(require_auth), conn=Depends(get_db)):
    """List all projects."""
    rows = await conn.fetch(
        "SELECT id, name, description, created_at, updated_at FROM project ORDER BY created_at"
    )
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/projects/{project_id}")
async def get_project(project_id: str, user=Depends(require_auth), conn=Depends(get_db)):
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


@router.post("/projects")
async def create_project(body: ProjectCreate, user=Depends(require_auth), conn=Depends(get_db)):
    """Create a new project."""
    row = await conn.fetchrow(
        "INSERT INTO project (name, description) VALUES ($1, $2) RETURNING id, name, description, created_at",
        body.name, body.description,
    )
    return {"success": True, "data": {
        "id": str(row["id"]),
        "name": row["name"],
        "description": row["description"],
        "created_at": row["created_at"].isoformat() if row["created_at"] else None,
    }}


@router.put("/projects/{project_id}")
async def update_project(project_id: str, body: ProjectUpdate, user=Depends(require_auth), conn=Depends(get_db)):
    """Update a project."""
    pid = uuid.UUID(project_id)
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")
    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    vals = [pid] + list(fields.values())
    await conn.execute(f"UPDATE project SET {sets} WHERE id = $1", *vals)
    return {"success": True, "data": {"message": "Project updated"}}


@router.delete("/projects/{project_id}")
async def delete_project(project_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Delete a project and all its workstreams/milestones/tasks (cascading)."""
    pid = uuid.UUID(project_id)
    result = await conn.execute("DELETE FROM project WHERE id = $1", pid)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Project not found")
    return {"success": True, "data": {"message": "Project deleted"}}


# ── Project ↔ Opportunity Linking ──


@router.post("/projects/{project_id}/opportunities")
async def link_opportunity(project_id: str, body: OpportunityLink, user=Depends(require_auth), conn=Depends(get_db)):
    """Link a CRM Opportunity to a Project."""
    pid = uuid.UUID(project_id)
    validate_salesforce_id(body.opportunity_id, "opportunity_id")
    try:
        row = await conn.fetchrow(
            "INSERT INTO project_opportunity (project_id, opportunity_id, role) "
            "VALUES ($1, $2, $3) "
            "ON CONFLICT (project_id, opportunity_id) DO UPDATE SET role = $3 "
            "RETURNING id, project_id, opportunity_id, role",
            pid, body.opportunity_id, body.role,
        )
        return {"success": True, "data": {
            "id": str(row["id"]),
            "project_id": str(row["project_id"]),
            "opportunity_id": row["opportunity_id"],
            "role": row["role"],
        }}
    except Exception as e:
        logger.error(f"Error linking opportunity to project: {e}")
        raise HTTPException(status_code=500, detail="Failed to link opportunity")


@router.delete("/projects/{project_id}/opportunities/{opportunity_id}")
async def unlink_opportunity(project_id: str, opportunity_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Remove the link between a Project and an Opportunity."""
    pid = uuid.UUID(project_id)
    validate_salesforce_id(opportunity_id, "opportunity_id")
    result = await conn.execute(
        "DELETE FROM project_opportunity WHERE project_id = $1 AND opportunity_id = $2",
        pid, opportunity_id,
    )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Link not found")
    return {"success": True, "data": {"message": "Opportunity unlinked"}}


@router.get("/projects/{project_id}/opportunities")
async def get_project_opportunities(project_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Get all Opportunities linked to a Project."""
    pid = uuid.UUID(project_id)
    rows = await conn.fetch(
        "SELECT id, opportunity_id, role, created_at "
        "FROM project_opportunity WHERE project_id = $1 ORDER BY created_at",
        pid,
    )
    return {"success": True, "data": [
        {"id": str(r["id"]), "opportunity_id": r["opportunity_id"],
         "role": r["role"], "created_at": r["created_at"].isoformat() if r["created_at"] else None}
        for r in rows
    ]}


# ── Bulk Import ──


@router.post("/projects/{project_id}/import")
async def import_project_data(project_id: str, body: ProjectImportPayload, user=Depends(require_auth), conn=Depends(get_db)):
    """Bulk import workstreams/milestones/tasks into a project.

    Smart merge: matches by name/title (case-insensitive) within hierarchy.
    If replace=True, deletes all existing data first.
    """
    from datetime import date as d

    pid = uuid.UUID(project_id)

    project = await conn.fetchrow("SELECT id FROM project WHERE id = $1", pid)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    summary = {
        "workstreams": {"new": 0, "updated": 0},
        "milestones": {"new": 0, "updated": 0},
        "tasks": {"new": 0, "updated": 0, "unchanged": 0},
    }

    async with conn.transaction():
        if body.replace:
            await conn.execute("DELETE FROM workstream WHERE project_id = $1", pid)

        existing_ws = await conn.fetch(
            "SELECT id, name FROM workstream WHERE project_id = $1", pid
        )
        ws_by_name = {r["name"].lower(): r for r in existing_ws}

        for ws_idx, ws in enumerate(body.workstreams):
            ws_key = ws.name.lower()
            existing = ws_by_name.get(ws_key)

            if existing:
                wid = existing["id"]
                if ws.description:
                    await conn.execute(
                        "UPDATE workstream SET description = $2, sort_order = $3 WHERE id = $1",
                        wid, ws.description, ws_idx,
                    )
                summary["workstreams"]["updated"] += 1
            else:
                row = await conn.fetchrow(
                    "INSERT INTO workstream (project_id, name, description, sort_order) "
                    "VALUES ($1, $2, $3, $4) RETURNING id",
                    pid, ws.name, ws.description, ws_idx,
                )
                wid = row["id"]
                summary["workstreams"]["new"] += 1

            existing_ms = await conn.fetch(
                "SELECT id, title FROM milestone WHERE workstream_id = $1", wid
            )
            ms_by_title = {r["title"].lower(): r for r in existing_ms}

            for ms_idx, ms in enumerate(ws.milestones):
                ms_key = ms.title.lower()
                existing_m = ms_by_title.get(ms_key)

                if existing_m:
                    mid = existing_m["id"]
                    await conn.execute(
                        "UPDATE milestone SET status = $2, priority = $3, owner = $4, sort_order = $5 WHERE id = $1",
                        mid, ms.status, ms.priority, ms.owner, ms_idx,
                    )
                    summary["milestones"]["updated"] += 1
                else:
                    row = await conn.fetchrow(
                        "INSERT INTO milestone (workstream_id, title, status, priority, owner, sort_order) "
                        "VALUES ($1, $2, $3, $4, $5, $6) RETURNING id",
                        wid, ms.title, ms.status, ms.priority, ms.owner, ms_idx,
                    )
                    mid = row["id"]
                    summary["milestones"]["new"] += 1

                existing_tasks = await conn.fetch(
                    "SELECT id, title, status, owner, deadline, start_date FROM project_task WHERE milestone_id = $1", mid
                )
                task_by_title = {r["title"].lower(): r for r in existing_tasks}

                for t_idx, task in enumerate(ms.tasks):
                    t_key = task.title.lower()
                    existing_t = task_by_title.get(t_key)

                    deadline_val = d.fromisoformat(task.deadline) if task.deadline else None
                    start_val = d.fromisoformat(task.start_date) if task.start_date else None
                    if deadline_val and not start_val:
                        from datetime import timedelta
                        start_val = deadline_val - timedelta(days=7)

                    if existing_t:
                        changed = (
                            existing_t["status"] != task.status
                            or existing_t["owner"] != task.owner
                            or existing_t["deadline"] != deadline_val
                            or existing_t["start_date"] != start_val
                        )
                        if changed:
                            await conn.execute(
                                "UPDATE project_task SET status = $2, owner = $3, deadline = $4, "
                                "start_date = $5, description = $6, sort_order = $7 WHERE id = $1",
                                existing_t["id"], task.status, task.owner,
                                deadline_val, start_val, task.description, t_idx,
                            )
                            summary["tasks"]["updated"] += 1
                        else:
                            summary["tasks"]["unchanged"] += 1
                    else:
                        await conn.execute(
                            "INSERT INTO project_task (milestone_id, title, status, owner, deadline, "
                            "start_date, description, sort_order) "
                            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8)",
                            mid, task.title, task.status, task.owner,
                            deadline_val, start_val, task.description, t_idx,
                        )
                        summary["tasks"]["new"] += 1

    return {"success": True, "data": summary}


# ── Workstream CRUD ──


@router.post("/projects/{project_id}/workstreams")
async def create_workstream(project_id: str, body: WorkstreamCreate, user=Depends(require_auth), conn=Depends(get_db)):
    pid = uuid.UUID(project_id)
    row = await conn.fetchrow(
        """INSERT INTO workstream (project_id, name, description, sort_order)
           VALUES ($1, $2, $3, $4) RETURNING id""",
        pid, body.name, body.description, body.sort_order,
    )
    return {"success": True, "data": {"id": str(row["id"])}}


@router.put("/workstreams/{workstream_id}")
async def update_workstream(workstream_id: str, body: WorkstreamUpdate, user=Depends(require_auth), conn=Depends(get_db)):
    wid = uuid.UUID(workstream_id)
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    vals = [wid] + list(fields.values())
    await conn.execute(f"UPDATE workstream SET {sets} WHERE id = $1", *vals)
    return {"success": True, "data": {"message": "Workstream updated"}}


@router.delete("/workstreams/{workstream_id}")
async def delete_workstream(workstream_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    wid = uuid.UUID(workstream_id)
    await conn.execute("DELETE FROM workstream WHERE id = $1", wid)
    return {"success": True, "data": {"message": "Workstream deleted"}}


# ── Milestone CRUD ──


@router.post("/workstreams/{workstream_id}/milestones")
async def create_milestone(workstream_id: str, body: MilestoneCreate, user=Depends(require_auth), conn=Depends(get_db)):
    wid = uuid.UUID(workstream_id)
    row = await conn.fetchrow(
        """INSERT INTO milestone (workstream_id, title, status, priority, owner, description, source_links, sort_order)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id""",
        wid, body.title, body.status, body.priority, body.owner,
        body.description, body.source_links, body.sort_order,
    )
    return {"success": True, "data": {"id": str(row["id"])}}


@router.put("/milestones/{milestone_id}")
async def update_milestone(milestone_id: str, body: MilestoneUpdate, user=Depends(require_auth), conn=Depends(get_db)):
    mid = uuid.UUID(milestone_id)
    fields = body.model_dump(exclude_none=True)
    if not fields:
        raise HTTPException(status_code=400, detail="No fields to update")

    sets = ", ".join(f"{k} = ${i+2}" for i, k in enumerate(fields))
    vals = [mid] + list(fields.values())
    await conn.execute(f"UPDATE milestone SET {sets} WHERE id = $1", *vals)
    return {"success": True, "data": {"message": "Milestone updated"}}


@router.delete("/milestones/{milestone_id}")
async def delete_milestone(milestone_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    mid = uuid.UUID(milestone_id)
    await conn.execute("DELETE FROM milestone WHERE id = $1", mid)
    return {"success": True, "data": {"message": "Milestone deleted"}}


# ── Project Task CRUD ──


@router.post("/milestones/{milestone_id}/tasks")
async def create_project_task(milestone_id: str, body: ProjectTaskCreate, user=Depends(require_auth), conn=Depends(get_db)):
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
async def update_project_task(task_id: str, body: ProjectTaskUpdate, user=Depends(require_auth), conn=Depends(get_db)):
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
async def delete_project_task(task_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    tid = uuid.UUID(task_id)
    await conn.execute("DELETE FROM project_task WHERE id = $1", tid)
    return {"success": True, "data": {"message": "Task deleted"}}


# ── Salesforce Task ↔ Project Bridge ──


class SfTaskProjectLink(BaseModel):
    sf_task_id: str
    milestone_id: Optional[str] = None
    sort_order: int = 0


@router.post("/projects/{project_id}/sf-tasks")
async def link_sf_task_to_project(
    project_id: str, body: SfTaskProjectLink, user=Depends(require_auth), conn=Depends(get_db)
):
    """Link a Salesforce task to a project (and optionally a milestone)."""
    pid = uuid.UUID(project_id)
    validate_salesforce_id(body.sf_task_id, "sf_task_id")
    mid = uuid.UUID(body.milestone_id) if body.milestone_id else None
    try:
        row = await conn.fetchrow(
            "INSERT INTO sf_task_project (sf_task_id, project_id, milestone_id, sort_order) "
            "VALUES ($1, $2, $3, $4) "
            "ON CONFLICT (sf_task_id) DO UPDATE SET project_id = $2, milestone_id = $3, sort_order = $4, updated_at = now() "
            "RETURNING id, sf_task_id, project_id, milestone_id, sort_order",
            body.sf_task_id, pid, mid, body.sort_order,
        )
        return {"success": True, "data": dict(row)}
    except Exception as e:
        logger.error(f"Error linking SF task to project: {e}")
        raise HTTPException(status_code=500, detail="Failed to link task to project")


@router.delete("/sf-task-project/{link_id}")
async def unlink_sf_task_from_project(link_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Remove a Salesforce task ↔ project link."""
    lid = uuid.UUID(link_id)
    result = await conn.execute("DELETE FROM sf_task_project WHERE id = $1", lid)
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Link not found")
    return {"success": True, "data": {"message": "Task unlinked from project"}}


@router.get("/projects/{project_id}/sf-tasks")
async def get_project_sf_tasks(project_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Get all Salesforce task IDs linked to a project."""
    pid = uuid.UUID(project_id)
    rows = await conn.fetch(
        "SELECT id, sf_task_id, milestone_id, sort_order, created_at "
        "FROM sf_task_project WHERE project_id = $1 ORDER BY sort_order, created_at",
        pid,
    )
    return {"success": True, "data": [dict(r) for r in rows]}


@router.get("/projects/by-opportunity/{opportunity_id}")
async def get_project_by_opportunity(opportunity_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Check if a project exists for the given opportunity."""
    validate_salesforce_id(opportunity_id, "opportunity_id")
    row = await conn.fetchrow(
        "SELECT id, name, description, opportunity_id FROM project WHERE opportunity_id = $1",
        opportunity_id,
    )
    if not row:
        return {"success": True, "data": None}
    return {"success": True, "data": dict(row)}


@router.get("/sf-task-project/by-task/{sf_task_id}")
async def get_sf_task_project_link(sf_task_id: str, user=Depends(require_auth), conn=Depends(get_db)):
    """Get the project link for a specific Salesforce task (if any)."""
    validate_salesforce_id(sf_task_id, "sf_task_id")
    row = await conn.fetchrow(
        "SELECT stp.id, stp.sf_task_id, stp.project_id, stp.milestone_id, p.name as project_name "
        "FROM sf_task_project stp JOIN project p ON p.id = stp.project_id "
        "WHERE stp.sf_task_id = $1",
        sf_task_id,
    )
    if not row:
        return {"success": True, "data": None}
    return {"success": True, "data": dict(row)}
