"""FastAPI backend for financial forecasting system."""

import os
import asyncio
from dotenv import load_dotenv
load_dotenv(override=False)
from typing import Any, Dict, List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
import logging

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query, Request
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
import uvicorn

# Import our MCP client and models
import sys
# Prefer financial_forecasting/mcp_client (has Calendar, Gmail, Fireflies services)
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from mcp_client import UnifiedMCPClient
from models import (
    SalesforceOpportunity, SalesforceAccount, IntacctInvoice, IntacctPayment,
    PaymentForecast, CashFlowProjection, ForecastingMetrics, ForecastingReport,
    OpportunityUpdateRequest, InvoiceCreationRequest, ForecastingDashboardData,
    OpportunityStage, PaymentTerms, InvoiceStatus,
    OPEN_STAGES, CLOSED_STAGES,
    ApiResponse,
)
from forecasting_engine import ForecastingEngine
from data_sync import DataSyncService
from db import init_db, close_db, get_db
from routes.projects import router as projects_router
from routes.auth import router as auth_router
from routes.sf_dependencies import router as sf_deps_router
from routes.permissions import router as permissions_router, opp_router as opp_lock_router, check_permission, resolve_task_lock
from auth import get_current_user_dep, require_auth, IS_PRODUCTION, JWT_SECRET_KEY
from security import validate_salesforce_id, escape_soql_string

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Production detection (duplicated here for app init; also in auth.py)
_IS_PROD = os.getenv('FRONTEND_URL', '').startswith('https')

# Initialize FastAPI app
app = FastAPI(
    title="Financial Forecasting API",
    description="API for sales pipeline and financial forecasting integration",
    version="1.0.0",
    docs_url=None if _IS_PROD else "/docs",
    redoc_url=None if _IS_PROD else "/redoc",
)

limiter = Limiter(key_func=get_remote_address, default_limits=["60/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# Session middleware (required for Authlib OAuth state)
app.add_middleware(
    SessionMiddleware,
    secret_key=JWT_SECRET_KEY,
    session_cookie="session",
    max_age=3600 * 24,
    same_site="none" if IS_PRODUCTION else "lax",
    https_only=IS_PRODUCTION,
)

# CORS middleware
CORS_ORIGINS = ["http://localhost:3000", "http://localhost:3001"]
FRONTEND_URL = os.getenv('FRONTEND_URL')
if FRONTEND_URL:
    CORS_ORIGINS.append(FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Api-Key", "Cookie"],
)

# Routers
app.include_router(projects_router)
app.include_router(auth_router)
app.include_router(sf_deps_router)
app.include_router(permissions_router)
app.include_router(opp_lock_router)

# Service singletons — initialized on startup, injected via Depends()
_services: Dict[str, Any] = {}
_sync_lock = asyncio.Lock()

# Startup and shutdown events

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting up Financial Forecasting API...")

    # Initialize PostgreSQL (non-blocking — app works without it)
    await init_db()

    client = UnifiedMCPClient()
    _services["mcp_client"] = client

    # Connect all services gracefully — each is independent
    for svc_name, connect_fn in [
        ("Salesforce", lambda: client.connect_salesforce(None)),
        ("Sage Intacct", lambda: client.connect_sage_intacct(None)),
        ("Slack", lambda: client.connect_slack(None)),
        ("Google Calendar", lambda: client.connect_google_calendar()),
        ("Gmail", lambda: client.connect_gmail()),
        ("Fireflies", lambda: client.connect_fireflies()),
    ]:
        try:
            await connect_fn()
            logger.info(f"{svc_name} connected successfully")
        except Exception as e:
            logger.warning(f"{svc_name} not available: {e}")

    # Set up dependent services if Salesforce connected
    if "salesforce" in client.connected_services:
        _services["forecasting_engine"] = ForecastingEngine(client)
        _services["data_sync_service"] = DataSyncService(client)
        asyncio.create_task(background_sync_task())

    logger.info(f"API started — connected services: {client.connected_services or ['none']}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Financial Forecasting API...")
    await close_db()
    client = _services.get("mcp_client")
    if client:
        await client.disconnect_all()
    logger.info("Shutdown complete.")


# Background tasks

async def background_sync_task():
    """Background task to sync data periodically."""
    while True:
        try:
            data_sync_service = _services.get("data_sync_service")
            if data_sync_service:
                        # Non-blocking acquire — skip cycle if lock held
                if _sync_lock.locked():
                    logger.warning("Sync already in progress, skipping cycle.")
                else:
                    async with _sync_lock:
                        logger.info("Running background data sync...")
                        await data_sync_service.sync_all_data()
                        logger.info("Background data sync completed.")
        except Exception as e:
            logger.error(f"Background sync error: {e}")

        # Wait 15 minutes before next sync
        await asyncio.sleep(900)


# Dependency functions — get_current_user is now cookie-based (see auth.py)
get_current_user = get_current_user_dep


def get_mcp_client() -> UnifiedMCPClient:
    """Get MCP client dependency."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    return client


def get_forecasting_engine() -> ForecastingEngine:
    """Get forecasting engine dependency."""
    engine = _services.get("forecasting_engine")
    if not engine:
        raise HTTPException(status_code=503, detail="Forecasting engine not initialized")
    return engine


def get_data_sync_service() -> DataSyncService:
    """Get data sync service dependency."""
    svc = _services.get("data_sync_service")
    if not svc:
        raise HTTPException(status_code=503, detail="Data sync service not available")
    return svc


@app.get("/api/cashflow/summary")
async def cashflow_summary():
    """Placeholder cashflow summary for frontend."""
    return ApiResponse(success=True, data={
        "total_pipeline": 0,
        "weighted_pipeline": 0,
        "ytd_received": 0,
        "outstanding": 0,
    })


# Health check endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return ApiResponse(
        success=True,
        data={"status": "healthy"},
        meta={
            "timestamp": datetime.utcnow().isoformat(),
            "services": {
                "mcp_client": "mcp_client" in _services,
                "forecasting_engine": "forecasting_engine" in _services,
                "data_sync_service": "data_sync_service" in _services,
            },
        },
    )


@app.get("/health/services")
async def services_health_check(client: UnifiedMCPClient = Depends(get_mcp_client)):
    """Check health of connected services."""
    health_status = {}

    for service_name in client._connected_services:
        try:
            service = client.services[service_name]
            info = await service.get_service_info()
            health_status[service_name] = {
                "status": "healthy" if info["authenticated"] else "unhealthy",
                "authenticated": info["authenticated"],
                "config": info.get("config", {})
            }
        except Exception as e:
            health_status[service_name] = {
                "status": "error",
                "error": str(e)
            }

    return ApiResponse(success=True, data=health_status)


# Salesforce endpoints

# Valid stages derived from the OpportunityStage enum — single source of truth
VALID_STAGES = {s.value for s in OpportunityStage}


@app.get("/api/salesforce/opportunities")
async def get_opportunities(
    stage: Optional[OpportunityStage] = None,
    stages: Optional[List[str]] = Query(None),
    limit: int = Query(500, le=2000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(require_auth)
):
    """Get Salesforce opportunities."""
    try:
        salesforce = client.salesforce

        # Build SOQL query
        query = """
        SELECT Id, AccountId, Account.Name, Name, StageName, Amount, Probability,
               CloseDate, ForecastCategory, LeadSource, NextStep,
               Description, Type, OwnerId, Owner.Name, CreatedDate, LastModifiedDate,
               npe01__Payments_Made__c, Outstanding_Payments__c,
               Number_of_Payments_Received__c, Most_Recent_Payment_Date__c,
               Last_Actual_Payment__c, npe01__Number_of_Payments__c,
               PaymentDate__c, Earliest_Scheduled_Payment__c,
               RecordType.Name, Active_Opportunity__c
        FROM Opportunity
        """

        where_clauses = []
        if stage:
            where_clauses.append(f"StageName = '{stage.value}'")
        if stages:
            validated = [s for s in stages if s in VALID_STAGES]
            if validated:
                stage_list = ", ".join(f"'{s}'" for s in validated)
                where_clauses.append(f"StageName IN ({stage_list})")
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)

        query += " ORDER BY CloseDate DESC"

        # Use query_all to get ALL records with automatic pagination
        result = await salesforce.query_all(query)
        records = result.get("records", [])

        # Refresh entity cache for Slack parser
        _refresh_opp_cache(records)

        return records
        
    except Exception as e:
        logger.error(f"Error fetching opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/salesforce/opportunities/{opportunity_id}")
async def update_opportunity(
    opportunity_id: str,
    update_request: OpportunityUpdateRequest,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(check_permission("edit_own_opportunities")),
    db = Depends(get_db),
):
    """Update a Salesforce opportunity."""
    validate_salesforce_id(opportunity_id, "opportunity_id")
    try:
        # Enforce opportunity lock — only owner or admin can edit locked opportunities
        lock = await db.fetchrow(
            "SELECT locked_by FROM opportunity_lock WHERE sf_opportunity_id = $1", opportunity_id
        )
        if lock:
            perms = user.get("_permissions", {})
            sf_user_id = (user.get("_app_user") or {}).get("sf_user_id")
            is_lock_owner = (lock["locked_by"] == sf_user_id)
            is_admin = perms.get("manage_users_roles", False)
            if not is_lock_owner and not is_admin:
                raise HTTPException(status_code=403, detail="This opportunity is locked by its owner")

        salesforce = client.salesforce
        success = await salesforce.update_record(
            "Opportunity",
            opportunity_id,
            update_request.updates
        )

        if success:
            logger.info(f"Opportunity {opportunity_id} updated by {user['user_id']}")
            return ApiResponse(success=True, data={"id": opportunity_id, "message": "Opportunity updated successfully"})
        else:
            raise HTTPException(status_code=400, detail="Failed to update opportunity")

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating opportunity: {e}")
        raise HTTPException(status_code=500, detail="Failed to update opportunity")


@app.get("/api/salesforce/accounts")
async def get_accounts(
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(require_auth)
):
    """Get Salesforce accounts."""
    try:
        salesforce = client.salesforce

        query = f"""
        SELECT Id, Name, Type, Industry
        FROM Account
        ORDER BY Name ASC
        LIMIT {limit}
        """
        
        result = await salesforce.query(query)
        
        return result.get("records", [])
        
    except Exception as e:
        logger.error(f"Error fetching accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/accounts")
async def create_account(
    account_data: Dict[str, Any],
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(check_permission("create_opportunities"))
):
    """Create a new Salesforce account."""
    try:
        salesforce = client.salesforce
        
        # Create the account
        result = await salesforce.create_record("Account", account_data)
        
        if result and result.get("id"):
            logger.info(f"Account created with ID: {result['id']} by {user['user_id']}")
            return ApiResponse(success=True, data={"id": result["id"], "message": "Account created successfully"})
        else:
            raise HTTPException(status_code=400, detail="Failed to create account")
            
    except Exception as e:
        logger.error(f"Error creating account: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/salesforce/contacts")
async def get_contacts(
    account_id: Optional[str] = None,
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(require_auth)
):
    """Get Salesforce contacts, optionally filtered by account."""
    try:
        salesforce = client.salesforce

        query = f"""
        SELECT Id, FirstName, LastName, Name, AccountId, Account.Name, Title, Email, Phone,
               npsp__Primary_Affiliation__c, npsp__Primary_Affiliation__r.Name,
               CreatedDate, LastModifiedDate
        FROM Contact
        """

        if account_id:
            validate_salesforce_id(account_id, "account_id")
            query += f" WHERE AccountId = '{account_id}'"
        
        query += f" ORDER BY LastName ASC LIMIT {limit}"
        
        result = await salesforce.query(query)
        
        contacts = []
        for record in result.get("records", []):
            contacts.append(record)
        
        return contacts
        
    except Exception as e:
        logger.error(f"Error fetching contacts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/contacts")
async def create_contact(
    contact_data: Dict[str, Any],
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(check_permission("create_opportunities"))
):
    """Create a new Salesforce contact."""
    try:
        salesforce = client.salesforce
        
        # Create the contact
        result = await salesforce.create_record("Contact", contact_data)
        
        if result and result.get("id"):
            logger.info(f"Contact created with ID: {result['id']} by {user['user_id']}")
            return ApiResponse(success=True, data={"id": result["id"], "message": "Contact created successfully"})
        else:
            raise HTTPException(status_code=400, detail="Failed to create contact")
            
    except Exception as e:
        logger.error(f"Error creating contact: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/salesforce/users")
async def get_users(
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(require_auth)
):
    """Get Salesforce users."""
    try:
        salesforce = client.salesforce
        
        query = f"""
        SELECT Id, Name, Email, IsActive
        FROM User
        WHERE IsActive = true
        ORDER BY Name ASC
        LIMIT {limit}
        """
        
        result = await salesforce.query(query)
        
        users = []
        for record in result.get("records", []):
            users.append(record)
        
        return users
        
    except Exception as e:
        logger.error(f"Error fetching users: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# My Tasks / Calendar endpoints (for My Priorities page)
# ---------------------------------------------------------------------------

@app.get("/api/salesforce/my-tasks")
async def get_my_tasks(
    start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(200, le=500),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Get current user's Salesforce Tasks in a date range."""
    try:
        salesforce = client.salesforce

        where_clauses = ["IsClosed = false"]
        if start:
            where_clauses.append(f"ActivityDate >= {start}")
        if end:
            where_clauses.append(f"ActivityDate <= {end}")

        where_sql = " AND ".join(where_clauses)
        query = f"""
        SELECT Id, Subject, ActivityDate, Status, Priority, WhatId, WhoId,
               OwnerId, Owner.Name, CreatedById, CreatedBy.Name, Description, CreatedDate, LastModifiedDate
        FROM Task
        WHERE {where_sql}
        ORDER BY ActivityDate ASC
        LIMIT {limit}
        """

        result = await salesforce.query(query)
        tasks = result.get("records", [])
        return ApiResponse(success=True, data=tasks, meta={"count": len(tasks)})

    except Exception as e:
        logger.error(f"Error fetching tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Salesforce Task CRUD (linked to Opportunities)
# ---------------------------------------------------------------------------

class TaskCreateRequest(BaseModel):
    Subject: str
    Status: str = "Not Started"
    Priority: str = "Normal"
    ActivityDate: Optional[str] = None
    Description: Optional[str] = None
    OwnerId: Optional[str] = None


class TaskUpdateRequest(BaseModel):
    Subject: Optional[str] = None
    Status: Optional[str] = None
    Priority: Optional[str] = None
    ActivityDate: Optional[str] = None
    Description: Optional[str] = None
    OwnerId: Optional[str] = None
    WhatId: Optional[str] = None


class TaskDuplicateRequest(BaseModel):
    WhatId: Optional[str] = None  # Opportunity to link the duplicate to


@app.get("/api/salesforce/opportunities/{opportunity_id}/tasks")
async def get_opportunity_tasks(
    opportunity_id: str,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Get all tasks linked to a specific opportunity."""
    validate_salesforce_id(opportunity_id, "opportunity_id")
    try:
        salesforce = client.salesforce
        query = f"""
        SELECT Id, Subject, Status, Priority, ActivityDate, Description,
               OwnerId, Owner.Name, WhoId, Who.Name, Type, TaskSubtype,
               CreatedById, CreatedBy.Name, CreatedDate, LastModifiedDate
        FROM Task
        WHERE WhatId = '{opportunity_id}'
        ORDER BY ActivityDate DESC NULLS LAST
        """
        result = await salesforce.query(query)
        tasks = result.get("records", [])

        formatted = []
        for t in tasks:
            formatted.append({
                "Id": t.get("Id"),
                "Subject": t.get("Subject"),
                "Status": t.get("Status"),
                "Priority": t.get("Priority"),
                "ActivityDate": t.get("ActivityDate"),
                "Description": t.get("Description"),
                "OwnerId": t.get("OwnerId"),
                "OwnerName": (t.get("Owner") or {}).get("Name"),
                "WhoId": t.get("WhoId"),
                "WhoName": (t.get("Who") or {}).get("Name"),
                "Type": t.get("Type"),
                "TaskSubtype": t.get("TaskSubtype"),
                "CreatedById": t.get("CreatedById"),
                "CreatedByName": (t.get("CreatedBy") or {}).get("Name"),
                "CreatedDate": t.get("CreatedDate"),
                "LastModifiedDate": t.get("LastModifiedDate"),
                "WhatId": t.get("WhatId"),
            })

        return ApiResponse(success=True, data=formatted, meta={"count": len(formatted)})
    except Exception as e:
        logger.error(f"Error fetching opportunity tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/opportunities/{opportunity_id}/tasks")
async def create_opportunity_task(
    opportunity_id: str,
    task_data: TaskCreateRequest,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(check_permission("create_tasks")),
    db=Depends(get_db),
):
    """Create a new task linked to an opportunity."""
    validate_salesforce_id(opportunity_id, "opportunity_id")
    try:
        # Check if the target opportunity is locked
        lock = await db.fetchrow(
            "SELECT locked_by FROM opportunity_lock WHERE sf_opportunity_id = $1", opportunity_id
        )
        if lock:
            perms = user.get("_permissions", {})
            sf_user_id = (user.get("_app_user") or {}).get("sf_user_id")
            if lock["locked_by"] != sf_user_id and not perms.get("manage_users_roles", False):
                raise HTTPException(403, "Cannot create tasks on a locked opportunity")
        salesforce = client.salesforce
        fields = {"WhatId": opportunity_id, **task_data.model_dump(exclude_none=True)}
        result = await salesforce.create_record("Task", fields)
        task_id = result.get("id") or result.get("Id")
        return ApiResponse(success=True, data={"id": task_id, "message": "Task created"})
    except Exception as e:
        logger.error(f"Error creating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to create task")


@app.put("/api/salesforce/tasks/{task_id}")
async def update_task(
    task_id: str,
    updates: TaskUpdateRequest,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(check_permission("edit_own_tasks")),
    db=Depends(get_db),
):
    """Update an existing Salesforce task. Respects opportunity locks."""
    validate_salesforce_id(task_id, "task_id")
    try:
        salesforce = client.salesforce
        # Server-side lock resolution — fetches task's actual WhatId + OwnerId from SF
        lock_info = await resolve_task_lock(task_id, user, db, salesforce)

        fields = updates.model_dump(exclude_none=True)
        if not fields:
            raise HTTPException(status_code=400, detail="No fields to update")

        if lock_info["is_locked"]:
            if lock_info["is_lock_owner"] or lock_info["is_admin"]:
                pass  # Full access
            elif lock_info["is_task_owner"]:
                # Task owner: allow field updates but BLOCK WhatId changes
                if updates.WhatId and updates.WhatId != lock_info["what_id"]:
                    raise HTTPException(403, "Cannot move task from a locked opportunity")
                fields.pop("WhatId", None)  # Strip WhatId to prevent relocation
            else:
                raise HTTPException(403, "This task's opportunity is locked")

        await salesforce.update_record("Task", task_id, fields)
        return ApiResponse(success=True, data={"message": "Task updated"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to update task")


@app.delete("/api/salesforce/tasks/{task_id}")
async def delete_task(
    task_id: str,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(check_permission("edit_own_tasks")),
    db=Depends(get_db),
):
    """Delete a Salesforce task. Blocked on locked opportunities."""
    validate_salesforce_id(task_id, "task_id")
    try:
        salesforce = client.salesforce
        # Check if task's opportunity is locked — only lock owner + admin can delete
        lock_info = await resolve_task_lock(task_id, user, db, salesforce)
        if lock_info["is_locked"] and not lock_info["is_lock_owner"] and not lock_info["is_admin"]:
            raise HTTPException(403, "Cannot delete tasks from a locked opportunity")
        await salesforce.delete_record("Task", task_id)
        return ApiResponse(success=True, data={"message": "Task deleted"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting task: {e}")
        raise HTTPException(status_code=500, detail="Failed to delete task")


@app.post("/api/salesforce/tasks/{task_id}/duplicate")
async def duplicate_task(
    task_id: str,
    body: TaskDuplicateRequest,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(check_permission("create_tasks")),
    db=Depends(get_db),
):
    """Duplicate a Salesforce task, optionally linking to a different opportunity."""
    validate_salesforce_id(task_id, "task_id")
    if body.WhatId is not None:
        validate_salesforce_id(body.WhatId, "WhatId")
    try:
        salesforce = client.salesforce
        # Check if source task's opportunity is locked
        lock_info = await resolve_task_lock(task_id, user, db, salesforce)
        if lock_info["is_locked"] and not lock_info["is_lock_owner"] and not lock_info["is_admin"]:
            raise HTTPException(403, "Cannot duplicate tasks from a locked opportunity")
        # Check if destination opportunity is locked
        dest_opp = body.WhatId
        if dest_opp:
            dest_lock = await db.fetchrow(
                "SELECT locked_by FROM opportunity_lock WHERE sf_opportunity_id = $1", dest_opp
            )
            if dest_lock:
                perms = user.get("_permissions", {})
                sf_user_id = (user.get("_app_user") or {}).get("sf_user_id")
                if dest_lock["locked_by"] != sf_user_id and not perms.get("manage_users_roles", False):
                    raise HTTPException(403, "Cannot duplicate tasks to a locked opportunity")
        # Fetch the original task
        safe_id = escape_soql_string(task_id)
        result = await salesforce.query(
            f"SELECT Subject, Status, Priority, ActivityDate, Description, OwnerId, WhatId "
            f"FROM Task WHERE Id = '{safe_id}'"
        )
        records = result.get("records", [])
        if not records:
            raise HTTPException(status_code=404, detail="Task not found")
        original = records[0]
        # Build the new task fields, copying from original
        fields = {
            "Subject": original.get("Subject", ""),
            "Status": original.get("Status", "Not Started"),
            "Priority": original.get("Priority", "Normal"),
        }
        if original.get("ActivityDate"):
            fields["ActivityDate"] = original["ActivityDate"]
        if original.get("Description"):
            fields["Description"] = original["Description"]
        if original.get("OwnerId"):
            fields["OwnerId"] = original["OwnerId"]
        # Use provided WhatId or keep original
        if body.WhatId is not None:
            fields["WhatId"] = body.WhatId
        elif original.get("WhatId"):
            fields["WhatId"] = original["WhatId"]
        new_task = await salesforce.create_record("Task", fields)
        new_id = new_task.get("id") or new_task.get("Id")
        return ApiResponse(success=True, data={"id": new_id, "message": "Task duplicated"})
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error duplicating task: {e}")
        raise HTTPException(status_code=500, detail="Failed to duplicate task")


@app.get("/api/calendar/my-events")
async def get_my_calendar_events(
    start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(100, le=200),
    calendar_id: str = Query("primary", description="Calendar ID (default: primary)"),
    user=Depends(require_auth),
):
    """Get Google Calendar events in a date range. Supports shared calendars via calendar_id."""
    client = _services.get("mcp_client")
    cal_service = client.services.get("google_calendar") if client else None
    if not cal_service or not cal_service.is_authenticated:
        return ApiResponse(
            success=True,
            data=[],
            meta={"message": "Calendar not connected"},
        )

    try:
        from datetime import datetime as dt

        days_back = 0
        days_forward = 14
        if start:
            delta = dt.now() - dt.strptime(start, "%Y-%m-%d")
            days_back = max(0, delta.days)
        if end:
            delta = dt.strptime(end, "%Y-%m-%d") - dt.now()
            days_forward = max(1, delta.days)

        events = await cal_service.search_events(
            query="",
            days_back=days_back,
            days_forward=days_forward,
            max_results=limit,
            calendar_id=calendar_id,
        )
        return ApiResponse(success=True, data=events, meta={"count": len(events)})
    except Exception as e:
        logger.error(f"Error fetching calendar events: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Sage Intacct endpoints

@app.get("/api/intacct/invoices", response_model=List[IntacctInvoice])
async def get_invoices(
    customer_id: Optional[str] = None,
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(require_auth)
):
    """Get Sage Intacct invoices."""
    try:
        intacct = client.sage_intacct
        
        result = await intacct.get_invoices(customer_id=customer_id, limit=limit)
        
        invoices = []
        if result.get("success") and result.get("data"):
            invoice_data = result["data"] if isinstance(result["data"], list) else [result["data"]]
            for record in invoice_data:
                invoices.append(IntacctInvoice(**record))
        
        return invoices
        
    except Exception as e:
        logger.error(f"Error fetching invoices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/intacct/invoices")
async def create_invoice(
    invoice_request: InvoiceCreationRequest,
    background_tasks: BackgroundTasks,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(check_permission("create_sage_invoices"))
):
    """Create a new invoice in Sage Intacct."""
    try:
        intacct = client.sage_intacct
        
        # Prepare invoice data
        invoice_data = {
            "customer_id": invoice_request.customer_id,
            "date_created": datetime.now().strftime("%m/%d/%Y"),
            "line_items": invoice_request.line_items
        }
        
        result = await intacct.create_invoice(invoice_data)
        
        if result.get("success"):
            # Schedule background task to update opportunity mapping
            background_tasks.add_task(
                update_opportunity_invoice_mapping,
                invoice_request.opportunity_id,
                result.get("data", {}).get("RECORDNO"),
                user["user_id"]
            )
            
            return ApiResponse(
                success=True,
                data={"invoice_id": result.get("data", {}).get("RECORDNO"), "message": "Invoice created successfully"},
            )
        else:
            raise HTTPException(
                status_code=400, 
                detail=f"Failed to create invoice: {result.get('errors', ['Unknown error'])}"
            )
            
    except Exception as e:
        logger.error(f"Error creating invoice: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/intacct/payments", response_model=List[IntacctPayment])
async def get_payments(
    customer_id: Optional[str] = None,
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(require_auth)
):
    """Get Sage Intacct payments."""
    try:
        intacct = client.sage_intacct
        
        result = await intacct.get_payments(customer_id=customer_id, limit=limit)
        
        payments = []
        if result.get("success") and result.get("data"):
            payment_data = result["data"] if isinstance(result["data"], list) else [result["data"]]
            for record in payment_data:
                payments.append(IntacctPayment(**record))
        
        return payments
        
    except Exception as e:
        logger.error(f"Error fetching payments: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Forecasting endpoints

@app.get("/api/forecasting/dashboard", response_model=ForecastingDashboardData)
async def get_forecasting_dashboard(
    date_range_days: int = Query(90, ge=30, le=365),
    scenario: str = Query("realistic"),
    engine: ForecastingEngine = Depends(get_forecasting_engine),
    user = Depends(require_auth)
):
    """Get forecasting dashboard data."""
    try:
        end_date = date.today() + timedelta(days=date_range_days)
        start_date = date.today()
        
        dashboard_data = await engine.generate_dashboard_data(
            start_date=start_date,
            end_date=end_date,
            scenario=scenario
        )
        
        return dashboard_data
        
    except Exception as e:
        logger.error(f"Error generating dashboard data: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/forecasting/payment-forecast", response_model=List[PaymentForecast])
async def get_payment_forecast(
    days_ahead: int = Query(90, ge=30, le=365),
    min_probability: int = Query(0, ge=0, le=100),
    engine: ForecastingEngine = Depends(get_forecasting_engine),
    user = Depends(require_auth)
):
    """Get payment forecast for opportunities."""
    try:
        forecasts = await engine.generate_payment_forecasts(
            days_ahead=days_ahead,
            min_probability=min_probability
        )
        
        return forecasts
        
    except Exception as e:
        logger.error(f"Error generating payment forecast: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/forecasting/cash-flow", response_model=List[CashFlowProjection])
async def get_cash_flow_projection(
    months_ahead: int = Query(6, ge=1, le=24),
    engine: ForecastingEngine = Depends(get_forecasting_engine),
    user = Depends(require_auth)
):
    """Get cash flow projections."""
    try:
        projections = await engine.generate_cash_flow_projections(
            months_ahead=months_ahead
        )
        
        return projections
        
    except Exception as e:
        logger.error(f"Error generating cash flow projections: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/forecasting/metrics", response_model=ForecastingMetrics)
async def get_forecasting_metrics(
    engine: ForecastingEngine = Depends(get_forecasting_engine),
    user = Depends(require_auth)
):
    """Get key forecasting metrics."""
    try:
        metrics = await engine.calculate_forecasting_metrics()
        return metrics
        
    except Exception as e:
        logger.error(f"Error calculating metrics: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/forecasting/generate-report", response_model=ForecastingReport)
async def generate_forecasting_report(
    background_tasks: BackgroundTasks,
    period_days: int = Query(90, ge=30, le=365),
    user = Depends(check_permission("generate_financial_reports")),
    engine: ForecastingEngine = Depends(get_forecasting_engine),
):
    """Generate comprehensive forecasting report."""
    try:
        start_date = date.today()
        end_date = start_date + timedelta(days=period_days)
        
        report = await engine.generate_comprehensive_report(
            start_date=start_date,
            end_date=end_date,
            user_id=user["user_id"]
        )
        
        # Schedule background task to save/email report
        background_tasks.add_task(
            save_and_notify_report,
            report,
            user["user_id"]
        )
        
        return report
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Data sync endpoints

@app.post("/api/sync/trigger")
async def trigger_data_sync(
    background_tasks: BackgroundTasks,
    sync_type: str = Query("all", regex="^(all|salesforce|intacct)$"),
    user = Depends(check_permission("trigger_data_sync")),
    sync_service: DataSyncService = Depends(get_data_sync_service),
):
    """Trigger manual data synchronization."""
    try:

        if _sync_lock.locked():
            raise HTTPException(status_code=409, detail="Sync already in progress")

        async def _locked_sync(sync_fn):
            async with _sync_lock:
                await sync_fn()

        if sync_type == "all":
            background_tasks.add_task(_locked_sync, sync_service.sync_all_data)
        elif sync_type == "salesforce":
            background_tasks.add_task(_locked_sync, sync_service.sync_salesforce_data)
        elif sync_type == "intacct":
            background_tasks.add_task(_locked_sync, sync_service.sync_intacct_data)

        return ApiResponse(
            success=True,
            data={"message": f"Data sync ({sync_type}) triggered successfully"},
            meta={"triggered_by": user["user_id"]},
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error triggering sync: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Invoice Matching endpoints

class InvoiceMatchRequest(BaseModel):
    """Request model for matching an invoice to an opportunity."""
    invoice_id: str
    opportunity_id: str
    confidence: str = "Confirmed"
    notes: Optional[str] = None
    customer_name: Optional[str] = None
    invoice_amount: Optional[float] = None
    invoice_date: Optional[str] = None


@app.get("/api/matching/grant-invoices")
async def get_grant_invoices(
    user = Depends(require_auth)
):
    """Get nonprofit grant invoices for matching."""
    try:
        import pandas as pd
        import os
        
        csv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'nonprofit_grant_invoices.csv')
        
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail="Grant invoices CSV not found")
        
        df = pd.read_csv(csv_path)
        
        # Convert to list of dicts
        invoices = df.to_dict('records')
        
        return ApiResponse(success=True, data=invoices, meta={"count": len(invoices)})
        
    except Exception as e:
        logger.error(f"Error loading grant invoices: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/matching/matches")
async def get_invoice_matches(
    user = Depends(require_auth)
):
    """Get saved invoice-opportunity matches."""
    try:
        import json
        import os
        
        matches_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'invoice_opportunity_matches.json')
        
        if os.path.exists(matches_path):
            with open(matches_path, 'r') as f:
                matches = json.load(f)
        else:
            matches = {}
        
        return ApiResponse(success=True, data=matches, meta={"count": len(matches)})
        
    except Exception as e:
        logger.error(f"Error loading matches: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/matching/save-match")
async def save_invoice_match(
    match_request: InvoiceMatchRequest,
    user = Depends(check_permission("match_invoices"))
):
    """Save an invoice-opportunity match."""
    try:
        import json
        import os
        from datetime import datetime
        
        matches_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'invoice_opportunity_matches.json')
        
        # Load existing matches
        if os.path.exists(matches_path):
            with open(matches_path, 'r') as f:
                matches = json.load(f)
        else:
            matches = {}
        
        # Add/update match
        matches[match_request.invoice_id] = {
            'opportunity_id': match_request.opportunity_id,
            'confidence': match_request.confidence,
            'notes': match_request.notes or '',
            'matched_at': datetime.now().isoformat(),
            'matched_by': user['user_id'],
            'invoice_data': {
                'customer_name': match_request.customer_name or '',
                'invoice_amount': match_request.invoice_amount or 0,
                'invoice_date': match_request.invoice_date or ''
            }
        }
        
        # Save matches
        with open(matches_path, 'w') as f:
            json.dump(matches, f, indent=2)
        
        logger.info(f"Saved match: Invoice {match_request.invoice_id} -> Opportunity {match_request.opportunity_id}")
        
        return ApiResponse(
            success=True,
            data={"message": "Match saved successfully", "invoice_id": match_request.invoice_id, "opportunity_id": match_request.opportunity_id},
        )
        
    except Exception as e:
        logger.error(f"Error saving match: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/matching/delete-match/{invoice_id}")
async def delete_invoice_match(
    invoice_id: str,
    user = Depends(check_permission("match_invoices"))
):
    """Delete an invoice-opportunity match."""
    try:
        import json
        import os
        
        matches_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'invoice_opportunity_matches.json')
        
        if not os.path.exists(matches_path):
            raise HTTPException(status_code=404, detail="No matches found")
        
        # Load matches
        with open(matches_path, 'r') as f:
            matches = json.load(f)
        
        # Delete match
        if invoice_id in matches:
            del matches[invoice_id]
            
            # Save matches
            with open(matches_path, 'w') as f:
                json.dump(matches, f, indent=2)
            
            logger.info(f"Deleted match for invoice {invoice_id}")
            
            return ApiResponse(success=True, data={"message": "Match deleted successfully"})
        else:
            raise HTTPException(status_code=404, detail="Match not found")
        
    except Exception as e:
        logger.error(f"Error deleting match: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Background task functions

async def update_opportunity_invoice_mapping(opportunity_id: str, invoice_id: str, user_id: str):
    """Background task to update opportunity-invoice mapping."""
    try:
        # In a real implementation, this would update a database
        logger.info(f"Updated mapping: Opportunity {opportunity_id} -> Invoice {invoice_id} by {user_id}")
    except Exception as e:
        logger.error(f"Error updating opportunity-invoice mapping: {e}")


async def save_and_notify_report(report: ForecastingReport, user_id: str):
    """Background task to save report and send notifications."""
    try:
        # In a real implementation, this would save to database and send notifications
        logger.info(f"Saved forecasting report {report.report_id} for user {user_id}")
    except Exception as e:
        logger.error(f"Error saving/notifying report: {e}")


# ---------------------------------------------------------------------------
# Automation Review — human-in-the-loop CRM update queue
# ---------------------------------------------------------------------------

# In-memory queue for pending parsed updates (production: use DB)
import uuid as _uuid

_automation_queue: Dict[str, Dict[str, Any]] = {}


class SlackCRMUpdate(BaseModel):
    """Parsed CRM update from a Slack message."""
    text: str
    channel: Optional[str] = None
    user_name: Optional[str] = None


import re as _re
import difflib as _difflib
import calendar as _calendar

# Module-level opportunity cache for entity resolution
_opp_cache: List[Dict[str, Any]] = []
_opp_cache_loaded: bool = False


def _get_opp_cache(client=None) -> List[Dict[str, Any]]:
    """Return cached opportunity list; populate from SF on first call."""
    global _opp_cache, _opp_cache_loaded
    if _opp_cache_loaded:
        return _opp_cache
    # Will be populated lazily when opportunities are fetched
    return _opp_cache


def _refresh_opp_cache(opportunities: List[Dict[str, Any]]) -> None:
    """Refresh the opportunity cache from a list of opportunity dicts."""
    global _opp_cache, _opp_cache_loaded
    _opp_cache = opportunities
    _opp_cache_loaded = True


def _extract_amount(text: str) -> Optional[int]:
    """Extract dollar amount from text like $250K, $1.2M, $100,000."""
    match = _re.search(r'\$[\d,]+(?:\.\d+)?[KkMm]?', text)
    if not match:
        return None
    raw = match.group(0).replace('$', '').replace(',', '')
    multiplier = 1
    if raw[-1] in ('K', 'k'):
        multiplier = 1_000
        raw = raw[:-1]
    elif raw[-1] in ('M', 'm'):
        multiplier = 1_000_000
        raw = raw[:-1]
    try:
        return int(float(raw) * multiplier)
    except ValueError:
        return None


def _extract_close_date(text: str) -> Optional[str]:
    """Extract a close date from natural language text. Returns ISO date string."""
    text_lower = text.lower()
    today = date.today()

    # "end of [month]"
    m = _re.search(r'end of (\w+)', text_lower)
    if m:
        month_name = m.group(1).capitalize()
        for i, name in enumerate(_calendar.month_name):
            if name and name.lower().startswith(month_name.lower()):
                year = today.year if i >= today.month else today.year + 1
                last_day = _calendar.monthrange(year, i)[1]
                return date(year, i, last_day).isoformat()

    # "by Q[1-4]"
    m = _re.search(r'by q([1-4])', text_lower)
    if m:
        q = int(m.group(1))
        end_month = q * 3
        year = today.year if end_month >= today.month else today.year + 1
        last_day = _calendar.monthrange(year, end_month)[1]
        return date(year, end_month, last_day).isoformat()

    # "[month] [day]" e.g. "April 15"
    m = _re.search(r'(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*)\s+(\d{1,2})\b', text_lower)
    if m:
        month_name = m.group(1).capitalize()
        day_num = int(m.group(2))
        for i, name in enumerate(_calendar.month_name):
            if name and name.lower().startswith(month_name.lower()):
                year = today.year if i > today.month or (i == today.month and day_num >= today.day) else today.year + 1
                try:
                    return date(year, i, day_num).isoformat()
                except ValueError:
                    pass

    # "next [weekday]"
    weekdays = {'monday': 0, 'tuesday': 1, 'wednesday': 2, 'thursday': 3, 'friday': 4, 'saturday': 5, 'sunday': 6}
    m = _re.search(r'next (\w+day)', text_lower)
    if m and m.group(1) in weekdays:
        target = weekdays[m.group(1)]
        days_ahead = target - today.weekday()
        if days_ahead <= 0:
            days_ahead += 7
        return (today + timedelta(days=days_ahead)).isoformat()

    return None


def _fuzzy_match_opportunity(text: str, opportunities: List[Dict[str, Any]]) -> Optional[Dict[str, Any]]:
    """Find the best-matching opportunity by name or account name using fuzzy matching."""
    if not opportunities:
        return None
    text_lower = text.lower()
    best_match = None
    best_ratio = 0.0

    for opp in opportunities:
        for field in [opp.get("Name", ""), (opp.get("Account") or {}).get("Name", "")]:
            if not field:
                continue
            ratio = _difflib.SequenceMatcher(None, text_lower, field.lower()).ratio()
            if ratio > best_ratio:
                best_ratio = ratio
                best_match = opp
            # Also check if the name appears as substring
            if field.lower() in text_lower and len(field) > 3:
                sub_ratio = max(ratio, 0.65)
                if sub_ratio > best_ratio:
                    best_ratio = sub_ratio
                    best_match = opp

    if best_ratio > 0.6 and best_match:
        return best_match
    return None


def _parse_crm_message(text: str, opportunities: List[Dict] = None) -> Dict[str, Any]:
    """NLP-style parser for CRM update messages.

    Extracts: opportunity reference, action type (note, stage_change, task),
    details, amount, and close date.
    """
    text_lower = text.lower()
    parsed: Dict[str, Any] = {
        "action": "note",
        "detail": text,
        "confidence": 0.5,
        "matched_opportunity": None,
        "stage": None,
        "amount": None,
        "close_date": None,
    }

    # Detect stage changes
    stage_keywords = {
        "qualifying": "Qualifying",
        "qualified": "Qualifying",
        "proposal": "Design / Proposal Creation",
        "negotiat": "Proposal Negotiation",
        "contract": "Contract Creation",
        "closed won": "Closed / Completed",
        "closed lost": "Closed Lost",
        "withdrawn": "Withdrawn",
        "collecting": "Collecting / In Effect",
    }
    for keyword, stage in stage_keywords.items():
        if keyword in text_lower:
            parsed["action"] = "stage_change"
            parsed["stage"] = stage
            parsed["confidence"] = 0.7
            break

    # Detect task creation
    task_keywords = ["follow up", "schedule", "send", "call", "email", "prepare", "set up", "next step"]
    for kw in task_keywords:
        if kw in text_lower:
            if parsed["action"] == "note":
                parsed["action"] = "task"
                parsed["confidence"] = 0.6
            break

    # Entity resolution — fuzzy match against known opportunities
    opp_list = opportunities or _get_opp_cache()
    matched = _fuzzy_match_opportunity(text, opp_list)
    if matched:
        parsed["matched_opportunity"] = matched.get("Id")
        parsed["confidence"] = min(parsed["confidence"] + 0.15, 0.95)

    # Amount extraction
    amount = _extract_amount(text)
    if amount is not None:
        parsed["amount"] = amount

    # Date extraction
    close_date = _extract_close_date(text)
    if close_date:
        parsed["close_date"] = close_date

    return parsed


@app.post("/api/slack/webhook")
async def slack_webhook(
    payload: Dict[str, Any],
    user=Depends(require_auth),
    db=Depends(get_db),
):
    """Receive a Slack message and parse it as a CRM update."""
    text = payload.get("text", "")
    channel = payload.get("channel", "")
    user_name = payload.get("user_name", user.get("name", "Unknown"))

    if not text:
        raise HTTPException(status_code=400, detail="Empty message text")

    parsed = _parse_crm_message(text, _get_opp_cache())

    item_id = str(_uuid.uuid4())
    _automation_queue[item_id] = {
        "id": item_id,
        "source": "slack",
        "source_detail": {"channel": channel, "user": user_name},
        "raw_text": text,
        "parsed": parsed,
        "status": "pending",
        "created_at": datetime.now().isoformat(),
    }

    return ApiResponse(
        success=True,
        data={"id": item_id, "parsed": parsed},
        meta={"message": "CRM update queued for review"},
    )


@app.get("/api/automation-review/pending")
async def get_pending_reviews(user=Depends(require_auth)):
    """List all pending CRM updates awaiting review."""
    pending = [
        item for item in _automation_queue.values()
        if item["status"] == "pending"
    ]
    pending.sort(key=lambda x: x["created_at"], reverse=True)
    return ApiResponse(success=True, data=pending, meta={"count": len(pending)})


@app.get("/api/automation-review/all")
async def get_all_reviews(user=Depends(require_auth)):
    """List all CRM updates (pending, approved, rejected)."""
    items = list(_automation_queue.values())
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return ApiResponse(success=True, data=items, meta={"count": len(items)})


@app.post("/api/automation-review/{item_id}/approve")
async def approve_review(
    item_id: str,
    edits: Optional[Dict[str, Any]] = None,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(require_auth),
):
    """Approve a pending CRM update and apply to Salesforce."""
    item = _automation_queue.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")
    if item["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Item already {item['status']}")

    parsed = item["parsed"]
    if edits:
        parsed.update(edits)

    # Apply to Salesforce
    try:
        salesforce = client.salesforce
        opp_id = parsed.get("matched_opportunity")
        if opp_id:
            validate_salesforce_id(opp_id, "matched_opportunity")

        if parsed["action"] == "stage_change" and opp_id and parsed.get("stage"):
            update_fields: Dict[str, Any] = {"StageName": parsed["stage"]}
            if parsed.get("amount"):
                update_fields["Amount"] = parsed["amount"]
            if parsed.get("close_date"):
                update_fields["CloseDate"] = parsed["close_date"]
            await salesforce.update_record("Opportunity", opp_id, update_fields)
        elif parsed["action"] == "task" and opp_id:
            # Check if opportunity is locked before creating task via Slack
            opp_lock = await db.fetchrow(
                "SELECT locked_by FROM opportunity_lock WHERE sf_opportunity_id = $1", opp_id
            )
            if opp_lock:
                logger.warning(f"Slack task creation blocked — opportunity {opp_id} is locked")
            else:
                await salesforce.create_record("Task", {
                    "Subject": parsed.get("detail", "Follow up")[:255],
                    "WhatId": opp_id,
                    "Status": "Not Started",
                    "Priority": "Normal",
                })
        elif parsed["action"] == "note" and opp_id:
            # Append to Description
            opp = await salesforce.query(
                f"SELECT Description FROM Opportunity WHERE Id = '{opp_id}' LIMIT 1"
            )
            existing = opp.get("records", [{}])[0].get("Description", "") or ""
            note = f"\n[{datetime.now().strftime('%Y-%m-%d')} via Slack] {parsed['detail']}"
            await salesforce.update_record("Opportunity", opp_id, {"Description": existing + note})

        item["status"] = "approved"
        item["approved_at"] = datetime.now().isoformat()
        item["approved_by"] = user.get("user_id", "unknown")
        return ApiResponse(success=True, data=item)

    except Exception as e:
        logger.error(f"Failed to apply CRM update {item_id}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/automation-review/{item_id}/reject")
async def reject_review(
    item_id: str,
    reason: Optional[str] = None,
    user=Depends(require_auth),
):
    """Reject a pending CRM update."""
    item = _automation_queue.get(item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Review item not found")
    if item["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Item already {item['status']}")

    item["status"] = "rejected"
    item["rejected_at"] = datetime.now().isoformat()
    item["rejected_by"] = user.get("user_id", "unknown")
    item["rejection_reason"] = reason
    return ApiResponse(success=True, data=item)


# ---------------------------------------------------------------------------
# Slack integration endpoints
# ---------------------------------------------------------------------------

@app.get("/api/slack/health")
async def slack_health_check():
    """Check Slack service health."""
    client = _services.get("mcp_client")
    if not client or "slack" not in getattr(client, '_connected_services', set()):
        return ApiResponse(success=True, data={"status": "not_configured", "message": "Slack service not connected"})
    try:
        slack_service = client.services.get("slack")
        if slack_service and slack_service.is_authenticated:
            info = await slack_service.get_service_info()
            return ApiResponse(success=True, data={"status": "healthy", "config": info.get("config", {})})
        return ApiResponse(success=True, data={"status": "unhealthy", "message": "Not authenticated"})
    except Exception as e:
        return ApiResponse(success=True, data={"status": "error", "message": str(e)})


@app.get("/api/slack/account-activity/{account_name}")
async def get_slack_account_activity(
    account_name: str,
    limit: int = Query(20, le=100),
    user=Depends(require_auth),
):
    """Get Slack messages mentioning an account."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    slack_service = client.services.get("slack")
    if not slack_service:
        raise HTTPException(status_code=503, detail="Slack service not connected")
    try:
        results = await slack_service.search_messages(account_name, count=limit)
        messages = results.get("messages", {}).get("matches", []) if isinstance(results, dict) else []
        activity = [
            {
                "id": msg.get("ts", ""),
                "type": "slack_message",
                "channel": msg.get("channel", {}).get("name", "") if isinstance(msg.get("channel"), dict) else str(msg.get("channel", "")),
                "text": msg.get("text", ""),
                "user": msg.get("username", msg.get("user", "")),
                "timestamp": msg.get("ts", ""),
                "permalink": msg.get("permalink", ""),
                "source": "slack",
            }
            for msg in messages[:limit]
        ]
        return ApiResponse(success=True, data=activity, meta={"count": len(activity), "account": account_name})
    except Exception as e:
        logger.error(f"Error fetching Slack activity for {account_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Fireflies integration endpoints
# ---------------------------------------------------------------------------

@app.get("/api/fireflies/health")
async def fireflies_health_check():
    """Check Fireflies service health."""
    client = _services.get("mcp_client")
    if not client or "fireflies" not in getattr(client, '_connected_services', set()):
        return ApiResponse(success=True, data={"status": "not_configured", "message": "Fireflies service not connected"})
    try:
        ff_service = client.services.get("fireflies")
        if ff_service and ff_service.is_authenticated:
            info = await ff_service.get_service_info()
            return ApiResponse(success=True, data={"status": "healthy", "config": info.get("config", {})})
        return ApiResponse(success=True, data={"status": "unhealthy", "message": "Not authenticated"})
    except Exception as e:
        return ApiResponse(success=True, data={"status": "error", "message": str(e)})


@app.get("/api/fireflies/account-meetings/{account_name}")
async def get_fireflies_account_meetings(
    account_name: str,
    limit: int = Query(20, le=100),
    user=Depends(require_auth),
):
    """Get Fireflies meeting transcripts mentioning an account."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    ff_service = client.services.get("fireflies")
    if not ff_service:
        raise HTTPException(status_code=503, detail="Fireflies service not connected")
    try:
        meetings = await ff_service.get_account_meetings(account_name, limit=limit)
        return ApiResponse(success=True, data=meetings, meta={"count": len(meetings), "account": account_name})
    except Exception as e:
        logger.error(f"Error fetching Fireflies meetings for {account_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Gmail integration endpoints
# ---------------------------------------------------------------------------

@app.get("/api/gmail/health")
async def gmail_health_check():
    """Check Gmail service health."""
    client = _services.get("mcp_client")
    if not client or "gmail" not in getattr(client, '_connected_services', set()):
        return ApiResponse(success=True, data={"status": "not_configured", "message": "Gmail service not connected"})
    try:
        gmail_service = client.services.get("gmail")
        if gmail_service and gmail_service.is_authenticated:
            info = await gmail_service.get_service_info()
            return ApiResponse(success=True, data={"status": "healthy", "config": info.get("config", {})})
        return ApiResponse(success=True, data={"status": "unhealthy", "message": "Not authenticated"})
    except Exception as e:
        return ApiResponse(success=True, data={"status": "error", "message": str(e)})


@app.get("/api/gmail/account-activity/{account_name}")
async def get_gmail_account_activity(
    account_name: str,
    limit: int = Query(20, le=100),
    user=Depends(require_auth),
):
    """Get Gmail emails related to an account."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    gmail_service = client.services.get("gmail")
    if not gmail_service:
        raise HTTPException(status_code=503, detail="Gmail service not connected")
    try:
        activity = await gmail_service.get_account_activity(account_name, limit=limit)
        return ApiResponse(success=True, data=activity, meta={"count": len(activity), "account": account_name})
    except Exception as e:
        logger.error(f"Error fetching Gmail activity for {account_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Google Calendar integration endpoints
# ---------------------------------------------------------------------------

@app.get("/api/calendar/health")
async def calendar_health_check():
    """Check Google Calendar service health."""
    client = _services.get("mcp_client")
    if not client or "google_calendar" not in getattr(client, '_connected_services', set()):
        return ApiResponse(success=True, data={"status": "not_configured", "message": "Calendar service not connected"})
    try:
        cal_service = client.services.get("google_calendar")
        if cal_service and cal_service.is_authenticated:
            info = await cal_service.get_service_info()
            return ApiResponse(success=True, data={"status": "healthy", "config": info.get("config", {})})
        return ApiResponse(success=True, data={"status": "unhealthy", "message": "Not authenticated"})
    except Exception as e:
        return ApiResponse(success=True, data={"status": "error", "message": str(e)})


@app.get("/api/calendar/account-activity/{account_name}")
async def get_calendar_account_activity(
    account_name: str,
    limit: int = Query(20, le=100),
    user=Depends(require_auth),
):
    """Get Google Calendar events related to an account."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")
    cal_service = client.services.get("google_calendar")
    if not cal_service:
        raise HTTPException(status_code=503, detail="Calendar service not connected")
    try:
        activity = await cal_service.get_account_activity(account_name, limit=limit)
        return ApiResponse(success=True, data=activity, meta={"count": len(activity), "account": account_name})
    except Exception as e:
        logger.error(f"Error fetching Calendar activity for {account_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# ---------------------------------------------------------------------------
# Activity Intelligence — unified aggregator
# ---------------------------------------------------------------------------

@app.get("/api/activity-intelligence/{account_name}")
async def get_activity_intelligence(
    account_name: str,
    force_refresh: bool = Query(False),
    opportunity_name: Optional[str] = None,
    user=Depends(require_auth),
):
    """Aggregate activity data from all sources into a unified timeline."""
    client = _services.get("mcp_client")
    if not client:
        raise HTTPException(status_code=503, detail="MCP client not initialized")

    activities: List[Dict[str, Any]] = []
    errors: List[str] = []

    # Fan out to all available services
    service_calls = []

    # Slack
    slack_service = client.services.get("slack")
    if slack_service and slack_service.is_authenticated:
        service_calls.append(("slack", _fetch_slack_activity(slack_service, account_name)))

    # Fireflies
    ff_service = client.services.get("fireflies")
    if ff_service and ff_service.is_authenticated:
        service_calls.append(("fireflies", _fetch_fireflies_activity(ff_service, account_name)))

    # Gmail
    gmail_service = client.services.get("gmail")
    if gmail_service and gmail_service.is_authenticated:
        service_calls.append(("gmail", _fetch_gmail_activity(gmail_service, account_name)))

    # Google Calendar
    cal_service = client.services.get("google_calendar")
    if cal_service and cal_service.is_authenticated:
        service_calls.append(("calendar", _fetch_calendar_activity(cal_service, account_name)))

    # Google Drive
    drive_service = client.services.get("google_drive")
    if drive_service and drive_service.is_authenticated:
        service_calls.append(("drive", _fetch_drive_activity(drive_service, account_name, opportunity_name)))

    if not service_calls:
        return ApiResponse(
            success=True,
            data={"activities": [], "summary": {"total": 0, "sources": {}}},
            meta={"account": account_name, "message": "No data sources connected"},
        )

    # Execute all calls concurrently
    results = await asyncio.gather(
        *[coro for _, coro in service_calls],
        return_exceptions=True,
    )

    source_counts: Dict[str, int] = {}
    for (source_name, _), result in zip(service_calls, results):
        if isinstance(result, Exception):
            errors.append(f"{source_name}: {result}")
            source_counts[source_name] = 0
        else:
            activities.extend(result)
            source_counts[source_name] = len(result)

    # Sort by timestamp (most recent first)
    activities.sort(key=lambda a: a.get("date", a.get("timestamp", "")), reverse=True)

    return ApiResponse(
        success=True,
        data={
            "activities": activities,
            "summary": {"total": len(activities), "sources": source_counts},
        },
        meta={"account": account_name, "errors": errors if errors else None},
    )


# Helper coroutines for activity intelligence fan-out
async def _fetch_slack_activity(service, account_name: str) -> List[Dict]:
    results = await service.search_messages(account_name, count=20)
    messages = results.get("messages", {}).get("matches", []) if isinstance(results, dict) else []
    return [
        {
            "type": "slack_message",
            "title": msg.get("text", "")[:100],
            "date": msg.get("ts", ""),
            "source": "slack",
            "detail": msg.get("text", ""),
            "channel": msg.get("channel", {}).get("name", "") if isinstance(msg.get("channel"), dict) else "",
        }
        for msg in messages
    ]


async def _fetch_fireflies_activity(service, account_name: str) -> List[Dict]:
    meetings = await service.get_account_meetings(account_name, limit=20)
    return [
        {
            "type": "meeting",
            "title": m.get("title", ""),
            "date": m.get("date", ""),
            "source": "fireflies",
            "detail": m.get("summary", ""),
            "participants": m.get("participants", []),
        }
        for m in meetings
    ]


async def _fetch_gmail_activity(service, account_name: str) -> List[Dict]:
    emails = await service.get_account_activity(account_name, limit=20)
    return [
        {
            "type": "email",
            "title": e.get("subject", ""),
            "date": e.get("date", ""),
            "source": "gmail",
            "detail": e.get("snippet", ""),
            "from": e.get("from", ""),
        }
        for e in emails
    ]


async def _fetch_calendar_activity(service, account_name: str) -> List[Dict]:
    events = await service.get_account_activity(account_name, limit=20)
    return [
        {
            "type": "calendar_event",
            "title": e.get("title", ""),
            "date": e.get("start", ""),
            "source": "google_calendar",
            "detail": e.get("location", ""),
            "attendees": e.get("attendees", []),
        }
        for e in events
    ]


async def _fetch_drive_activity(service, account_name: str, opportunity_name: Optional[str] = None) -> List[Dict]:
    query = f"name contains '{account_name}'"
    if opportunity_name:
        query += f" or name contains '{opportunity_name}'"
    try:
        result = await service.list_files(query=query, page_size=20)
        files = result.get("files", [])
        return [
            {
                "type": "document",
                "title": f.get("name", ""),
                "date": f.get("modifiedTime", ""),
                "source": "google_drive",
                "detail": f.get("mimeType", ""),
                "file_id": f.get("id", ""),
            }
            for f in files
        ]
    except Exception:
        return []


# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )

