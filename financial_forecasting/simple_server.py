#!/usr/bin/env python3
"""
Simplified FastAPI server for Financial Forecasting POC.
Uses direct Salesforce connection without MCP layer for simplicity.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
import uvicorn

from simple_salesforce import Salesforce, SalesforceLogin

# Import config
from config import SALESFORCE_CONFIG

app = FastAPI(
    title="Financial Forecasting API",
    description="Simplified API for Pursuit financial forecasting POC",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global Salesforce connection
sf_client: Optional[Salesforce] = None

def get_salesforce():
    """Get or create Salesforce connection."""
    global sf_client
    if sf_client is None:
        session_id, instance = SalesforceLogin(
            username=SALESFORCE_CONFIG['USERNAME'],
            password=SALESFORCE_CONFIG['PASSWORD'],
            domain=SALESFORCE_CONFIG['DOMAIN']
        )
        sf_client = Salesforce(instance=instance, session_id=session_id)
    return sf_client

# Request/Response Models
class OpportunityUpdate(BaseModel):
    opportunity_id: str
    updates: Dict[str, Any]
    user_id: str = "demo_user"
    reason: Optional[str] = None

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/health/services")
async def services_health():
    try:
        sf = get_salesforce()
        # Test query
        sf.query("SELECT Id FROM Account LIMIT 1")
        return {
            "salesforce": {
                "status": "healthy",
                "authenticated": True,
                "instance": sf.sf_instance
            }
        }
    except Exception as e:
        return {
            "salesforce": {
                "status": "error",
                "authenticated": False,
                "error": str(e)
            }
        }

# Salesforce - Opportunities
@app.get("/api/salesforce/opportunities")
async def get_opportunities(stage: Optional[str] = None, limit: int = 10000):
    """Get ALL Salesforce opportunities (no artificial limit)."""
    try:
        sf = get_salesforce()
        
        # Salesforce has a 2000 record limit per query, so we use query_all to get everything
        query = """
        SELECT Id, AccountId, Account.Name, Name, StageName, Amount, Probability, 
               CloseDate, ExpectedRevenue, ForecastCategory, LeadSource, NextStep,
               Description, OwnerId, Owner.Name, CreatedDate, LastModifiedDate,
               npe01__Payments_Made__c, Outstanding_Payments__c, 
               Number_of_Payments_Received__c, Most_Recent_Payment_Date__c,
               Last_Actual_Payment__c, npe01__Number_of_Payments__c
        FROM Opportunity
        """
        
        if stage:
            query += f" WHERE StageName = '{stage}'"
        
        query += " ORDER BY CloseDate DESC"
        
        # Use query_all to automatically handle pagination and get ALL records
        result = sf.query_all(query)
        
        return result.get("records", [])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/salesforce/opportunities/{opportunity_id}")
async def update_opportunity(opportunity_id: str, update_request: OpportunityUpdate):
    """Update a Salesforce opportunity."""
    try:
        sf = get_salesforce()
        
        # Update the opportunity
        sobject = sf.Opportunity
        result = sobject.update(opportunity_id, update_request.updates)
        
        if result == 204:  # Success code
            return {
                "success": True,
                "message": "Opportunity updated successfully",
                "opportunity_id": opportunity_id
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to update opportunity")
            
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Salesforce - Accounts
@app.get("/api/salesforce/accounts")
async def get_accounts(limit: int = 50000):
    """Get ALL Salesforce accounts."""
    try:
        sf = get_salesforce()
        
        query = """
        SELECT Id, Name, Type, Industry
        FROM Account
        WHERE IsDeleted = false
        ORDER BY Name ASC
        """
        
        # Use query_all to get all records (handles pagination automatically)
        result = sf.query_all(query)
        return result.get("records", [])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Salesforce - Users
@app.get("/api/salesforce/users")
async def get_users(limit: int = 1000):
    """Get Salesforce users for autocomplete."""
    try:
        sf = get_salesforce()
        
        query = f"""
        SELECT Id, Name, Email, Username, IsActive
        FROM User
        WHERE IsActive = true
        ORDER BY Name ASC
        LIMIT {limit}
        """
        
        result = sf.query(query)
        return result.get("records", [])
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Forecasting - Dashboard
@app.get("/api/forecasting/dashboard")
async def get_dashboard(date_range_days: int = 90, scenario: str = "realistic"):
    """Get dashboard data with forecasts."""
    try:
        sf = get_salesforce()
        
        # Get opportunities
        opps_query = """
        SELECT Id, AccountId, Account.Name, Name, StageName, Amount, Probability,
               CloseDate, CreatedDate
        FROM Opportunity
        WHERE Amount > 0
        ORDER BY CloseDate DESC
        LIMIT 100
        """
        opps_result = sf.query(opps_query)
        opportunities = opps_result.get("records", [])
        
        # Calculate metrics
        total_pipeline = sum(float(opp.get('Amount') or 0) for opp in opportunities)
        
        open_opps = [opp for opp in opportunities 
                     if 'Closed' not in opp.get('StageName', '') 
                     and 'Withdrawn' not in opp.get('StageName', '')]
        
        weighted_pipeline = sum(
            float(opp.get('Amount') or 0) * (float(opp.get('Probability') or 0) / 100)
            for opp in open_opps
        )
        
        closed_won = [opp for opp in opportunities 
                      if 'Closed Won' in opp.get('StageName', '') 
                      or 'Completed' in opp.get('StageName', '')]
        
        avg_deal_size = sum(float(opp.get('Amount') or 0) for opp in closed_won) / max(len(closed_won), 1)
        win_rate = len(closed_won) / max(len(opportunities), 1)
        
        # Generate payment forecasts
        payment_forecasts = []
        for opp in open_opps[:20]:  # Top 20
            if opp.get('CloseDate'):
                close_date = datetime.strptime(opp['CloseDate'], '%Y-%m-%d').date()
                amount = float(opp.get('Amount') or 0)
                probability = float(opp.get('Probability') or 0) / 100
                expected_amount = amount * probability
                
                # Estimate payment date (30 days after close)
                payment_date = close_date + timedelta(days=30)
                
                payment_forecasts.append({
                    "opportunity_name": opp['Name'],
                    "account_name": opp.get('Account', {}).get('Name', 'Unknown'),
                    "amount": amount,
                    "expected_amount": expected_amount,
                    "payment_date": payment_date.isoformat(),
                    "probability": probability,
                    "stage": opp.get('StageName', 'Unknown')
                })
        
        # Generate cash flow chart data (next 6 months)
        cash_flow_data = []
        today = date.today()
        
        for month_offset in range(6):
            period_start = (today.replace(day=1) + timedelta(days=32 * month_offset)).replace(day=1)
            
            if period_start.month == 12:
                period_end = period_start.replace(year=period_start.year + 1, month=1, day=1) - timedelta(days=1)
            else:
                period_end = period_start.replace(month=period_start.month + 1, day=1) - timedelta(days=1)
            
            # Sum forecasts for this month
            month_receipts = sum(
                f['expected_amount']
                for f in payment_forecasts
                if period_start.isoformat() <= f['payment_date'] <= period_end.isoformat()
            )
            
            cash_flow_data.append({
                "period": period_start.strftime("%B %Y"),
                "receipts": month_receipts,
                "payments": 25000,  # TODO: PLACEHOLDER - Replace with actual expense data from accounting system
                "net_flow": month_receipts - 25000,
                "balance": 50000 + month_receipts - 25000,  # TODO: PLACEHOLDER - Replace with actual bank balance
                "confidence": 0.75
            })
        
        return {
            "current_metrics": {
                "total_pipeline_value": total_pipeline,
                "weighted_pipeline_value": weighted_pipeline,
                "expected_revenue_30_days": weighted_pipeline * 0.15,
                "expected_revenue_60_days": weighted_pipeline * 0.35,
                "expected_revenue_90_days": weighted_pipeline * 0.50,
                "average_deal_size": avg_deal_size,
                "average_sales_cycle_days": 90,
                "win_rate": win_rate,
                "payment_collection_rate": 0.88,
                "average_payment_delay_days": 8,
                "cash_conversion_cycle_days": 45,
                "overdue_invoices_amount": 0,
                "at_risk_opportunities_amount": total_pipeline * 0.10,
                "concentration_risk_score": 0.3
            },
            "pipeline_summary": {
                "total_opportunities": len(opportunities),
                "total_value": total_pipeline,
                "weighted_value": weighted_pipeline,
                "avg_deal_size": avg_deal_size,
                "win_rate": win_rate
            },
            "cash_flow_chart_data": cash_flow_data,
            "payment_forecast_data": payment_forecasts,
            "risk_indicators": [
                {
                    "type": "at_risk_opportunities",
                    "amount": total_pipeline * 0.10,
                    "severity": "medium"
                }
            ],
            "recent_activities": [
                {
                    "type": "opportunity_updated",
                    "description": "Large grant moved to Proposal stage",
                    "timestamp": datetime.now().isoformat(),
                    "impact": "positive"
                }
            ],
            "date_range": {
                "start": today.isoformat(),
                "end": (today + timedelta(days=date_range_days)).isoformat()
            },
            "selected_scenario": scenario,
            "refresh_timestamp": datetime.now().isoformat()
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Data Sync
@app.post("/api/sync/trigger")
async def trigger_sync(sync_type: str = "all"):
    """Trigger manual data synchronization."""
    try:
        # For POC, just refresh the Salesforce connection
        global sf_client
        sf_client = None
        get_salesforce()
        
        return {
            "success": True,
            "message": f"Data sync ({sync_type}) completed",
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("🚀 Starting Financial Forecasting API...")
    print("📊 Connected to Salesforce:", SALESFORCE_CONFIG['USERNAME'])
    print("🌐 API available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")
    
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
