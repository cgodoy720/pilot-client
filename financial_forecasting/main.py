"""FastAPI backend for financial forecasting system."""

import os
import asyncio
from typing import Any, Dict, List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
import logging

from fastapi import FastAPI, HTTPException, Depends, BackgroundTasks, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel
import uvicorn

# Import our MCP client and models
import sys
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

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Financial Forecasting API",
    description="API for sales pipeline and financial forecasting integration",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],  # React dev servers
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

# Service singletons — initialized on startup, injected via Depends()
_services: Dict[str, Any] = {}
_sync_lock = asyncio.Lock()

# Startup and shutdown events

@app.on_event("startup")
async def startup_event():
    """Initialize services on startup."""
    logger.info("Starting up Financial Forecasting API...")

    try:
        client = UnifiedMCPClient()

        logger.info("Connecting to Salesforce...")
        await client.connect_salesforce("stdio")

        logger.info("Connecting to Sage Intacct...")
        await client.connect_sage_intacct("stdio")

        _services["mcp_client"] = client
        _services["forecasting_engine"] = ForecastingEngine(client)
        _services["data_sync_service"] = DataSyncService(client)

        asyncio.create_task(background_sync_task())
        logger.info("Financial Forecasting API started successfully!")

    except Exception as e:
        logger.error(f"Failed to start services: {e}")
        raise


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown."""
    logger.info("Shutting down Financial Forecasting API...")
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


# Dependency functions

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get current user from token (simplified for POC)."""
    # In production, validate JWT token and return user info
    return {"user_id": "demo_user", "name": "Demo User", "role": "admin"}


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


@app.get("/api/salesforce/opportunities", response_model=List[SalesforceOpportunity])
async def get_opportunities(
    stage: Optional[OpportunityStage] = None,
    stages: Optional[List[str]] = Query(None),
    limit: int = Query(500, le=2000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(get_current_user)
):
    """Get Salesforce opportunities."""
    try:
        salesforce = client.salesforce

        # Build SOQL query
        query = """
        SELECT Id, AccountId, Name, StageName, Amount, Probability, CloseDate,
               ExpectedRevenue, ForecastCategory, LeadSource, NextStep, Description,
               OwnerId, CreatedDate, LastModifiedDate, Payment_Terms__c,
               Contract_Start_Date__c, Contract_End_Date__c, Billing_Frequency__c
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

        query += f" ORDER BY CloseDate ASC LIMIT {limit}"
        
        result = await salesforce.query(query)
        
        opportunities = []
        for record in result.get("records", []):
            opportunities.append(SalesforceOpportunity(**record))
        
        return opportunities
        
    except Exception as e:
        logger.error(f"Error fetching opportunities: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/salesforce/opportunities/{opportunity_id}")
async def update_opportunity(
    opportunity_id: str,
    update_request: OpportunityUpdateRequest,
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(get_current_user)
):
    """Update a Salesforce opportunity."""
    try:
        salesforce = client.salesforce
        
        # Update the opportunity
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
            
    except Exception as e:
        logger.error(f"Error updating opportunity: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/salesforce/accounts", response_model=List[SalesforceAccount])
async def get_accounts(
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(get_current_user)
):
    """Get Salesforce accounts."""
    try:
        salesforce = client.salesforce
        
        query = f"""
        SELECT Id, Name, Type, Industry, AnnualRevenue, NumberOfEmployees,
               BillingStreet, BillingCity, BillingState, BillingPostalCode,
               BillingCountry, Phone, Website, CreatedDate, LastModifiedDate
        FROM Account
        ORDER BY Name ASC
        LIMIT {limit}
        """
        
        result = await salesforce.query(query)
        
        accounts = []
        for record in result.get("records", []):
            accounts.append(SalesforceAccount(**record))
        
        return accounts
        
    except Exception as e:
        logger.error(f"Error fetching accounts: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/accounts")
async def create_account(
    account_data: Dict[str, Any],
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
):
    """Get Salesforce contacts, optionally filtered by account."""
    try:
        salesforce = client.salesforce
        
        query = f"""
        SELECT Id, FirstName, LastName, Name, AccountId, Title, Email, Phone,
               Primary_Affiliation__c, CreatedDate, LastModifiedDate
        FROM Contact
        """
        
        if account_id:
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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


# Sage Intacct endpoints

@app.get("/api/intacct/invoices", response_model=List[IntacctInvoice])
async def get_invoices(
    customer_id: Optional[str] = None,
    limit: int = Query(100, le=1000),
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    engine: ForecastingEngine = Depends(get_forecasting_engine),
    user = Depends(get_current_user)
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
    sync_service: DataSyncService = Depends(get_data_sync_service),
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user = Depends(get_current_user)
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
    user=Depends(get_current_user),
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
    user=Depends(get_current_user),
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
    user=Depends(get_current_user),
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
    user=Depends(get_current_user),
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
    user=Depends(get_current_user),
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

