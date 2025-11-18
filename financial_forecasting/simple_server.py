#!/usr/bin/env python3
"""
Simplified FastAPI server for Financial Forecasting POC.
Uses direct Salesforce connection without MCP layer for simplicity.
"""

from fastapi import FastAPI, HTTPException, Depends, Response, Request, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime, date, timedelta
from decimal import Decimal
import uvicorn
import os
import secrets
from jose import jwt, JWTError

from simple_salesforce import Salesforce, SalesforceLogin
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import requests
from urllib.parse import urlencode, parse_qs
from authlib.integrations.starlette_client import OAuth
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
import logging

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Import config
from config import SALESFORCE_CONFIG

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Financial Forecasting API",
    description="Simplified API for Pursuit financial forecasting POC",
    version="1.0.0"
)

# CORS middleware
# Allow both local development and production Cloud Run domains
CORS_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:3001",
]

# Add production frontend origin if in production
FRONTEND_URL = os.getenv('FRONTEND_URL')
if FRONTEND_URL:
    CORS_ORIGINS.append(FRONTEND_URL)

# Also allow any *.run.app domain for Cloud Run deployments
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.run\.app",  # Allow all Cloud Run domains
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Session middleware (required for OAuth)
SESSION_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    session_cookie="session",
    max_age=3600 * 24,  # 24 hours
    same_site="none",    # Allow cross-origin
    https_only=True      # Require HTTPS for security
)

# Global connections
sf_client: Optional[Salesforce] = None
slack_client: Optional[WebClient] = None

# Fireflies API configuration
# Loaded from .env file
FIREFLIES_API_KEY = os.getenv('FIREFLIES_API_KEY')
FIREFLIES_API_URL = "https://api.fireflies.ai/graphql"

# Fireflies cache to avoid hitting rate limits
# Cache all transcripts for 4 hours (saves to file for persistence)
FIREFLIES_CACHE_FILE = '/tmp/fireflies_cache.json'
fireflies_cache = {
    'transcripts': None,
    'fetched_at': None,
    'expires_at': None
}
CACHE_DURATION_HOURS = 4  # Increased to reduce API calls

def load_fireflies_cache():
    """Load cached Fireflies data from disk if available."""
    global fireflies_cache
    try:
        if os.path.exists(FIREFLIES_CACHE_FILE):
            with open(FIREFLIES_CACHE_FILE, 'r') as f:
                data = json.load(f)
                # Convert ISO strings back to datetime
                if data.get('fetched_at'):
                    data['fetched_at'] = datetime.fromisoformat(data['fetched_at'])
                if data.get('expires_at'):
                    data['expires_at'] = datetime.fromisoformat(data['expires_at'])
                fireflies_cache.update(data)
                print(f"Loaded {len(data.get('transcripts', []))} cached Fireflies meetings from disk (expires: {data.get('expires_at')})")
    except Exception as e:
        print(f"Error loading Fireflies cache: {e}")

def save_fireflies_cache():
    """Save Fireflies cache to disk for persistence across restarts."""
    try:
        data = fireflies_cache.copy()
        # Convert datetime to ISO strings for JSON serialization
        if data.get('fetched_at'):
            data['fetched_at'] = data['fetched_at'].isoformat()
        if data.get('expires_at'):
            data['expires_at'] = data['expires_at'].isoformat()
        with open(FIREFLIES_CACHE_FILE, 'w') as f:
            json.dump(data, f)
        print(f"Saved {len(fireflies_cache.get('transcripts', []))} Fireflies meetings to disk cache")
    except Exception as e:
        print(f"Error saving Fireflies cache: {e}")

# Load cache on startup
load_fireflies_cache()

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

def get_slack():
    """Get or create Slack client."""
    global slack_client
    if slack_client is None:
        slack_token = os.getenv('SLACK_BOT_TOKEN')
        if not slack_token:
            raise HTTPException(status_code=503, detail="Slack not configured. Set SLACK_BOT_TOKEN environment variable.")
        slack_client = WebClient(token=slack_token)
    return slack_client

# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/auth/google/callback')
# FRONTEND_URL already defined above (line 48) - don't redefine it here
if not FRONTEND_URL:  # If not set for CORS, set default for OAuth
    FRONTEND_URL = 'http://localhost:3000'
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={'scope': 'openid email profile'}
)

def create_access_token(data: dict) -> str:
    """Create JWT access token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(hours=JWT_EXPIRATION_HOURS)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def verify_token(token: str) -> Optional[Dict]:
    """Verify JWT token and return payload."""
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except JWTError:
        return None

async def get_current_user(request: Request) -> Optional[Dict]:
    """Get current authenticated user from cookie."""
    token = request.cookies.get("access_token")
    if not token:
        return None
    return verify_token(token)

# Request/Response Models
class OpportunityUpdate(BaseModel):
    updates: Dict[str, Any]
    user_id: str = "demo_user"
    reason: Optional[str] = None

# Health Check
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.utcnow()}

@app.get("/debug/config")
async def debug_config():
    """Debug endpoint to check configuration values"""
    return {
        "FRONTEND_URL": FRONTEND_URL,
        "GOOGLE_CLIENT_ID": GOOGLE_CLIENT_ID[:20] + "..." if GOOGLE_CLIENT_ID else None,
        "GOOGLE_REDIRECT_URI": GOOGLE_REDIRECT_URI,
        "env_FRONTEND_URL": os.getenv('FRONTEND_URL'),
    }

# ============================================================================
# AUTHENTICATION ENDPOINTS
# ============================================================================

@app.get("/auth/google")
async def auth_google(request: Request):
    """Initiate Google OAuth flow."""
    redirect_uri = GOOGLE_REDIRECT_URI
    return await oauth.google.authorize_redirect(request, redirect_uri)

@app.get("/auth/google/callback")
async def auth_google_callback(request: Request, response: Response):
    """Handle Google OAuth callback."""
    try:
        # Get access token from Google
        token = await oauth.google.authorize_access_token(request)
        
        # Get user info from Google
        user_info = token.get('userinfo')
        if not user_info:
            raise HTTPException(status_code=400, detail="Failed to get user info from Google")
        
        # Create JWT token with user data
        access_token = create_access_token({
            "email": user_info['email'],
            "name": user_info.get('name', ''),
            "picture": user_info.get('picture', ''),
            "sub": user_info['sub']
        })
        
        # Set cookie with token
        response = RedirectResponse(url=f"{FRONTEND_URL}/overview")
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=JWT_EXPIRATION_HOURS * 3600,
            samesite="none",  # Required for cross-origin cookies
            secure=True       # Required for HTTPS (samesite=none requires secure=True)
        )
        
        return response
        
    except Exception as e:
        print(f"OAuth callback error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=auth_failed")

@app.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

@app.post("/auth/logout")
async def logout(response: Response):
    """Logout user by clearing the auth cookie."""
    response.delete_cookie(
        "access_token",
        samesite="none",
        secure=True
    )
    return {"message": "Logged out successfully"}

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
async def get_opportunities(stage: Optional[str] = None):
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
               Last_Actual_Payment__c, npe01__Number_of_Payments__c,
               PaymentDate__c, Earliest_Scheduled_Payment__c
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

# Salesforce - Create Opportunity
@app.post("/api/salesforce/opportunities")
async def create_opportunity(opportunity_data: Dict[str, Any]):
    """Create a new Salesforce opportunity."""
    try:
        sf = get_salesforce()
        
        # Create the opportunity
        result = sf.Opportunity.create(opportunity_data)
        
        if result.get('success'):
            return {
                "success": True,
                "id": result.get('id'),
                "opportunity": opportunity_data
            }
        else:
            errors = result.get('errors', [])
            error_msg = '; '.join([str(e) for e in errors]) if errors else "Failed to create opportunity"
            raise HTTPException(status_code=400, detail=error_msg)
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/salesforce/opportunities/{opportunity_id}")
async def update_opportunity(opportunity_id: str, update_request: OpportunityUpdate):
    """Update a Salesforce opportunity."""
    try:
        sf = get_salesforce()
        
        # Only send the updates to Salesforce (user_id and reason are just for logging)
        # Don't send them to Salesforce as they're not real fields
        updates_to_send = update_request.updates
        
        # Update the opportunity
        sobject = sf.Opportunity
        result = sobject.update(opportunity_id, updates_to_send)
        
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
async def get_accounts():
    """Get ALL Salesforce accounts for customer selection."""
    try:
        sf = get_salesforce()
        
        query = """
        SELECT Id, Name, Type, Industry
        FROM Account
        WHERE IsDeleted = false
        ORDER BY Name ASC
        """
        
        # Use query_all to automatically handle Salesforce pagination (gets ALL records)
        result = sf.query_all(query)
        accounts = result.get("records", [])
        
        # Format for frontend - keep Salesforce field names (uppercase)
        formatted_accounts = [
            {
                "Id": acc.get("Id"),
                "Name": acc.get("Name"),
                "Type": acc.get("Type"),
                "Industry": acc.get("Industry")
            }
            for acc in accounts
        ]
        
        return {
            "success": True,
            "count": len(formatted_accounts),
            "accounts": formatted_accounts
        }
        
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


# Salesforce - Contacts
@app.get("/api/salesforce/contacts")
async def get_contacts(account_id: Optional[str] = None):
    """Get ALL Salesforce contacts, optionally filtered by account.
    When account_id is provided, returns contacts where the account is either:
    - Their household account (AccountId), OR
    - Their primary affiliation (npsp__Primary_Affiliation__c)
    """
    try:
        sf = get_salesforce()
        
        # Query with Primary Affiliation (the organization/company where they work)
        query = """
        SELECT Id, FirstName, LastName, Name, AccountId, Account.Name, Title, Email, Phone,
               npsp__Primary_Affiliation__c, npsp__Primary_Affiliation__r.Name,
               CreatedDate, LastModifiedDate
        FROM Contact
        """
        if account_id:
            # Include contacts where account is either household OR primary affiliation
            query += f" WHERE (AccountId = '{account_id}' OR npsp__Primary_Affiliation__c = '{account_id}')"
        query += " ORDER BY LastName ASC"
        
        # Use query_all to get ALL records (handles Salesforce's 2000 record pagination automatically)
        result = sf.query_all(query)
        return result.get("records", [])
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/salesforce/contact-fields")
async def get_contact_fields():
    """Get all available fields for the Contact object."""
    try:
        sf = get_salesforce()
        contact_metadata = sf.Contact.describe()
        fields = []
        for field in contact_metadata['fields']:
            if 'affiliation' in field['label'].lower() or 'organization' in field['label'].lower():
                fields.append({
                    'name': field['name'],
                    'label': field['label'],
                    'type': field['type'],
                    'referenceTo': field.get('referenceTo', [])
                })
        return {
            'affiliation_related_fields': fields,
            'all_field_count': len(contact_metadata['fields'])
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/accounts")
async def create_account(account_data: Dict[str, Any]):
    """Create a new Salesforce account."""
    try:
        sf = get_salesforce()
        result = sf.Account.create(account_data)
        if result.get('success'):
            return {
                "success": True,
                "id": result['id'],
                "message": "Account created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create account")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/contacts")
async def create_contact(contact_data: Dict[str, Any]):
    """Create a new Salesforce contact."""
    try:
        sf = get_salesforce()
        result = sf.Contact.create(contact_data)
        if result.get('success'):
            return {
                "success": True,
                "id": result['id'],
                "message": "Contact created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create contact")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Forecasting - Dashboard (DEPRECATED - Overview page uses direct queries instead)
@app.get("/api/forecasting/dashboard")
async def get_dashboard(date_range_days: int = 90, scenario: str = "realistic"):
    """Get dashboard data with forecasts. DEPRECATED - not used by frontend."""
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

# Slack Integration
@app.get("/api/slack/account-activity/{account_name}")
async def get_account_slack_activity(account_name: str, limit: int = 50):
    """Get Slack activity related to an account by searching channel history."""
    try:
        slack = get_slack()
        
        # Get list of public channels the bot is in
        channels_response = slack.conversations_list(
            types="public_channel",
            exclude_archived=True,
            limit=200
        )
        
        if not channels_response["ok"]:
            raise HTTPException(status_code=500, detail="Failed to list channels")
        
        all_messages = []
        account_name_lower = account_name.lower()
        # Create search terms from account name (e.g., "Ford Foundation" -> ["ford", "foundation"])
        account_terms = [term.lower() for term in account_name.split() if len(term) > 3]
        
        # Search through channels for mentions of the account
        for channel in channels_response.get("channels", []):
            channel_id = channel["id"]
            channel_name = channel["name"]
            channel_name_lower = channel_name.lower()
            
            # Only search channels the bot is a member of
            if not channel.get("is_member", False):
                continue
            
            # Check if channel name is related to the account
            # Match if any significant term from account name is in channel name
            channel_matches_account = any(
                term in channel_name_lower.replace('-', ' ').replace('_', ' ')
                for term in account_terms
            )
            
            try:
                # Get messages from this channel (with pagination for more history)
                all_channel_messages = []
                cursor = None
                
                # Fetch up to 500 messages per channel (5 pages x 100 messages)
                for _ in range(5):
                    history = slack.conversations_history(
                        channel=channel_id,
                        limit=100,
                        cursor=cursor
                    )
                    
                    if not history["ok"]:
                        break
                    
                    all_channel_messages.extend(history.get("messages", []))
                    
                    # Check if there are more messages
                    cursor = history.get("response_metadata", {}).get("next_cursor")
                    if not cursor:
                        break
                
                # Process all fetched messages
                for message in all_channel_messages:
                    text = message.get("text", "")
                    
                    # Include message if:
                    # 1. Account name is mentioned in the message, OR
                    # 2. Channel name matches the account (e.g., #ford-foundation channel for "Ford Foundation")
                    text_matches = account_name_lower in text.lower()
                    
                    if text_matches or channel_matches_account:
                        # Get user info
                        user_id = message.get("user", "Unknown")
                        user_name = user_id
                        
                        if user_id != "Unknown":
                            try:
                                user_info = slack.users_info(user=user_id)
                                if user_info["ok"]:
                                    user_name = user_info["user"].get("real_name", user_info["user"].get("name", user_id))
                            except:
                                pass
                        
                        # Build permalink
                        ts = message.get("ts", "")
                        permalink = f"https://slack.com/archives/{channel_id}/p{ts.replace('.', '')}" if ts else ""
                        
                        # Determine match type
                        match_type = "mention" if text_matches else "channel"
                        
                        all_messages.append({
                            "text": text,
                            "user": user_name,
                            "channel": channel_name,
                            "timestamp": ts,
                            "permalink": permalink,
                            "date": datetime.fromtimestamp(float(ts)).isoformat() if ts else None,
                            "match_type": match_type,  # "mention" or "channel"
                        })
            except SlackApiError as e:
                # Skip channels we can't access
                if e.response["error"] in ["channel_not_found", "not_in_channel"]:
                    continue
                # Continue on other errors too
                continue
        
        # Sort by timestamp descending and limit
        all_messages.sort(key=lambda x: x["timestamp"], reverse=True)
        all_messages = all_messages[:limit]
        
        return {
            "account_name": account_name,
            "messages": all_messages,
            "total": len(all_messages),
        }
        
    except HTTPException:
        raise
    except SlackApiError as e:
        if e.response["error"] == "ratelimited":
            raise HTTPException(status_code=429, detail="Slack rate limit exceeded. Try again later.")
        raise HTTPException(status_code=500, detail=f"Slack API error: {e.response['error']}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/slack/health")
async def slack_health_check():
    """Check if Slack integration is configured and working."""
    try:
        slack_token = os.getenv('SLACK_BOT_TOKEN')
        if not slack_token:
            return {"configured": False, "message": "SLACK_BOT_TOKEN not set"}
        
        slack = get_slack()
        response = slack.auth_test()
        
        if response["ok"]:
            return {
                "configured": True,
                "connected": True,
                "team": response.get("team"),
                "user": response.get("user"),
            }
        else:
            return {"configured": True, "connected": False, "error": "Authentication failed"}
            
    except Exception as e:
        return {"configured": True, "connected": False, "error": str(e)}

# Fireflies Integration
def query_fireflies(query: str, variables: dict = None):
    """Execute a GraphQL query against Fireflies API."""
    headers = {
        "Authorization": f"Bearer {FIREFLIES_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {"query": query}
    if variables:
        payload["variables"] = variables
    
    print(f"Fireflies request payload: {payload}")
    
    response = requests.post(FIREFLIES_API_URL, json=payload, headers=headers)
    
    print(f"Fireflies response status: {response.status_code}")
    print(f"Fireflies response text: {response.text[:500]}")
    
    response.raise_for_status()
    return response.json()

@app.get("/api/fireflies/account-meetings/{account_name}")
async def get_account_fireflies_meetings(account_name: str, limit: int = 20):
    """Get Fireflies meeting transcripts related to an account."""
    try:
        # Get account details from Salesforce for better matching
        sf = get_salesforce()
        # Escape single quotes for SOQL query
        escaped_account_name = account_name.replace("'", "\\'")
        account_query = f"""
        SELECT Id, Name, Website, 
               (SELECT Id, Name, Email FROM Contacts)
        FROM Account
        WHERE Name = '{escaped_account_name}'
        LIMIT 1
        """
        account_result = sf.query(account_query)
        
        account_website = None
        contact_emails = []
        contact_names = []
        
        if account_result['totalSize'] > 0:
            account = account_result['records'][0]
            account_website = account.get('Website', '')
            
            # Extract domain from website (e.g., https://fordfoundation.org -> fordfoundation.org)
            if account_website:
                account_website = account_website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]
            
            # Get contact emails and names
            if account.get('Contacts'):
                for contact in account['Contacts']['records']:
                    if contact.get('Email'):
                        contact_emails.append(contact['Email'].lower())
                    if contact.get('Name'):
                        contact_names.append(contact['Name'].lower())
        
        # Query Fireflies for ALL transcripts using pagination with caching
        # Check if we have cached transcripts that are still valid
        global fireflies_cache
        now = datetime.now()
        
        if (fireflies_cache['transcripts'] is not None and 
            fireflies_cache['expires_at'] is not None and 
            now < fireflies_cache['expires_at']):
            print(f"Using cached Fireflies transcripts ({len(fireflies_cache['transcripts'])} meetings)")
            transcripts = fireflies_cache['transcripts']
        else:
            # Cache expired or doesn't exist - fetch all transcripts
            all_transcripts = []
            skip = 0
            limit = 50
            max_requests = 100  # Safety limit to prevent infinite loops (5000 meetings max)
            
            print(f"Fetching all Fireflies transcripts for {account_name}...")
            
            for request_num in range(max_requests):
                query = f"""
                query {{
                  transcripts(limit: {limit}, skip: {skip}) {{
                    id
                    title
                    date
                    duration
                    meeting_attendees {{
                      displayName
                      email
                    }}
                    sentences {{
                      text
                    }}
                    summary {{
                      keywords
                      action_items
                      overview
                    }}
                  }}
                }}
                """
                
                result = query_fireflies(query)
                
                if "errors" in result:
                    raise HTTPException(status_code=500, detail=f"Fireflies API error: {result['errors']}")
                
                batch_transcripts = result.get("data", {}).get("transcripts", [])
                
                if not batch_transcripts or len(batch_transcripts) == 0:
                    # No more transcripts to fetch
                    print(f"No more transcripts. Fetched {len(all_transcripts)} total meetings.")
                    break
                
                all_transcripts.extend(batch_transcripts)
                print(f"Fetched batch {request_num + 1}: {len(batch_transcripts)} meetings (total: {len(all_transcripts)})")
                
                if len(batch_transcripts) < limit:
                    # Last page - fewer results than limit means we're done
                    print(f"Last page reached. Total meetings: {len(all_transcripts)}")
                    break
                
                skip += limit
            
            transcripts = all_transcripts
            print(f"Total transcripts fetched: {len(transcripts)}")
            
            # Update cache in memory and save to disk
            fireflies_cache['transcripts'] = transcripts
            fireflies_cache['fetched_at'] = now
            fireflies_cache['expires_at'] = now + timedelta(hours=CACHE_DURATION_HOURS)
            print(f"Cached transcripts until {fireflies_cache['expires_at']}")
            save_fireflies_cache()  # Persist to disk
        
        # Match transcripts to account
        matched_meetings = []
        account_name_lower = account_name.lower()
        account_terms = [term.lower() for term in account_name.split() if len(term) > 3]
        
        for transcript in transcripts:
            if not transcript:
                continue
                
            match_score = 0
            match_reasons = []
            
            title = (transcript.get('title') or '').lower()
            
            # 1. Check if account name is in title (exact match only for high confidence)
            if account_name_lower in title:
                match_score += 15
                match_reasons.append('title_exact')
            
            # 2. Check participant emails for domain match
            attendees = transcript.get('meeting_attendees', []) or []
            found_domain_match = False
            found_contact_match = False
            
            for attendee in attendees:
                if not attendee:
                    continue
                email = (attendee.get('email') or '').lower()
                name = (attendee.get('displayName') or '').lower()
                
                # SMART MATCH: Extract company from email domain and compare to account name
                # e.g., someone@microsoft.com matches "Microsoft" account
                # This is the STRONGEST signal and most reliable
                if email and '@' in email:
                    email_domain = email.split('@')[1]
                    # Remove common TLDs and get company name
                    company_from_email = email_domain.split('.')[0]  # microsoft.com -> microsoft
                    
                    # Check if company name from email matches account name
                    if company_from_email in account_name_lower or account_name_lower in company_from_email:
                        if not found_domain_match:
                            match_score += 25  # Increased score for domain match
                            match_reasons.append(f'smart_domain_match:{email}')
                            found_domain_match = True
                        continue
                    
                    # Also check against individual account terms
                    if any(term == company_from_email for term in account_terms):
                        if not found_domain_match:
                            match_score += 25
                            match_reasons.append(f'smart_domain_match:{email}')
                            found_domain_match = True
                        continue
                
                # Match by email domain from Website field
                if account_website and email.endswith(account_website):
                    if not found_domain_match:
                        match_score += 20
                        match_reasons.append('email_domain')
                        found_domain_match = True
                    continue
                
                # Match by exact contact email (person is a known contact in Salesforce)
                if email in contact_emails:
                    if not found_contact_match:
                        match_score += 15
                        match_reasons.append('contact_email')
                        found_contact_match = True
                    continue
            
            # 3. Check transcript content for account mentions (only exact account name)
            # Check first 50 sentences to avoid processing entire transcript
            sentences = (transcript.get('sentences') or [])[:50]
            transcript_text = ' '.join([s.get('text', '') for s in sentences if s and s.get('text')]).lower()
            
            if account_name_lower in transcript_text:
                match_score += 10
                match_reasons.append('content_mention')
            
            # 4. Check keywords/overview (only exact account name)
            summary = transcript.get('summary') or {}
            keywords = ' '.join(summary.get('keywords', []) or []).lower()
            overview = (summary.get('overview') or '').lower()
            
            if account_name_lower in keywords or account_name_lower in overview:
                match_score += 10
                match_reasons.append('summary_mention')
            
            # Include if match score is high enough
            # Threshold: 15+ ensures we only show meetings with strong signals
            # (domain match OR title + content, OR contact email, etc.)
            if match_score >= 15:
                # Get a preview of the transcript
                preview_sentences = sentences[:5]
                preview_text = ' '.join([s.get('text', '') for s in preview_sentences if s and s.get('text')])
                if len(preview_text) > 300:
                    preview_text = preview_text[:300] + '...'
                
                matched_meetings.append({
                    'id': transcript.get('id'),
                    'title': transcript.get('title'),
                    'date': transcript.get('date'),
                    'duration': transcript.get('duration'),
                    'attendees': [
                        {
                            'name': a.get('displayName'),
                            'email': a.get('email')
                        }
                        for a in attendees if a and (a.get('displayName') or a.get('email'))
                    ],
                    'preview': preview_text,
                    'keywords': summary.get('keywords', []) or [],
                    'action_items': summary.get('action_items', []) or [],
                    'overview': summary.get('overview'),
                    'match_score': match_score,
                    'match_reasons': match_reasons,
                    'fireflies_url': f"https://app.fireflies.ai/view/{transcript.get('id')}" if transcript.get('id') else None
                })
        
        # Sort by match score (highest first) and date (newest first)
        matched_meetings.sort(key=lambda x: (x['match_score'], x.get('date') or ''), reverse=True)
        matched_meetings = matched_meetings[:limit]
        
        return {
            'account_name': account_name,
            'meetings': matched_meetings,
            'total': len(matched_meetings),
            'cache_info': {
                'using_cache': fireflies_cache.get('transcripts') is not None,
                'total_cached': len(fireflies_cache.get('transcripts', [])),
                'expires_at': fireflies_cache.get('expires_at').isoformat() if fireflies_cache.get('expires_at') else None
            }
        }
        
    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Fireflies API request failed: {str(e)}")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/fireflies/refresh-cache")
async def refresh_fireflies_cache():
    """Manually refresh the Fireflies cache (force re-fetch from API)."""
    global fireflies_cache
    try:
        # Clear cache to force refresh
        fireflies_cache['transcripts'] = None
        fireflies_cache['fetched_at'] = None
        fireflies_cache['expires_at'] = None
        
        print("Manual cache refresh requested - cache cleared")
        
        return {
            'success': True,
            'message': 'Cache cleared. Next account request will fetch fresh data from Fireflies.',
            'note': 'This may take 10-15 seconds for the first request after refresh.'
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/fireflies/health")
async def fireflies_health_check():
    """Check if Fireflies integration is configured and working."""
    try:
        if not FIREFLIES_API_KEY:
            return {"configured": False, "message": "FIREFLIES_API_KEY not set"}
        
        print(f"Testing Fireflies API with key: {FIREFLIES_API_KEY[:10]}...")
        
        # Test API with a simple query
        query = """
        query {
          transcripts(limit: 1) {
            id
            title
          }
        }
        """
        
        print(f"Sending test query to Fireflies...")
        result = query_fireflies(query)
        print(f"Fireflies health check response: {result}")
        
        if "errors" in result:
            error_msg = result["errors"]
            print(f"Fireflies returned errors: {error_msg}")
            return {"configured": True, "connected": False, "error": error_msg}
        
        return {
            "configured": True,
            "connected": True,
            "message": "Fireflies API is working",
            "sample_meeting": result.get("data", {}).get("transcripts", [{}])[0] if result.get("data", {}).get("transcripts") else None,
            "api_key_preview": f"{FIREFLIES_API_KEY[:10]}...{FIREFLIES_API_KEY[-4:]}",
            "cache_info": {
                "cached": fireflies_cache.get('transcripts') is not None,
                "total_cached_meetings": len(fireflies_cache.get('transcripts', [])),
                "expires_at": fireflies_cache.get('expires_at').isoformat() if fireflies_cache.get('expires_at') else None,
                "cache_duration_hours": CACHE_DURATION_HOURS
            }
        }
            
    except requests.exceptions.HTTPError as e:
        error_details = f"HTTP {e.response.status_code}: {e.response.text}"
        print(f"HTTP Error: {error_details}")
        return {"configured": True, "connected": False, "error": error_details}
    except Exception as e:
        error_msg = str(e)
        print(f"Error in health check: {error_msg}")
        import traceback
        traceback.print_exc()
        return {"configured": True, "connected": False, "error": error_msg}

@app.get("/api/fireflies/recent-meetings")
async def get_recent_fireflies_meetings(limit: int = 10):
    """Get recent Fireflies meetings to help identify test accounts."""
    try:
        if not FIREFLIES_API_KEY:
            raise HTTPException(status_code=503, detail="FIREFLIES_API_KEY not set")
        
        print(f"Querying Fireflies API for {limit} transcripts...")
        
        # Use inline limit instead of variable
        query = f"""
        query {{
          transcripts(limit: {limit}) {{
            id
            title
            date
            meeting_attendees {{
              displayName
              email
            }}
          }}
        }}
        """
        
        print(f"GraphQL query: {query}")
        result = query_fireflies(query)
        
        print(f"Fireflies API response: {result}")
        
        if "errors" in result:
            error_details = result['errors']
            print(f"Fireflies API returned errors: {error_details}")
            raise HTTPException(status_code=500, detail=f"Fireflies API error: {error_details}")
        
        transcripts = result.get("data", {}).get("transcripts", [])
        
        if transcripts is None:
            transcripts = []
        
        print(f"Found {len(transcripts)} transcripts")
        
        # Extract unique organizations/companies from email domains
        domains = set()
        for transcript in transcripts:
            if not transcript:
                continue
            attendees = transcript.get('meeting_attendees', [])
            if attendees is None:
                continue
            for attendee in attendees:
                if not attendee:
                    continue
                email = attendee.get('email', '')
                if email and '@' in email:
                    try:
                        domain = email.split('@')[1]
                        if domain not in ['gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com']:
                            domains.add(domain)
                    except IndexError:
                        continue
        
        return {
            "meetings": transcripts,
            "total": len(transcripts),
            "unique_domains": sorted(list(domains)),
            "suggestion": "Look for account names in your Salesforce that match these domains or meeting titles"
        }
            
    except HTTPException:
        raise
    except requests.exceptions.RequestException as e:
        print(f"Request error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Fireflies API request failed: {str(e)}")
    except Exception as e:
        print(f"Unexpected error: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Error: {str(e)}")

@app.get("/api/fireflies/debug-account/{account_name}")
async def debug_account_matching(account_name: str):
    """Debug endpoint to see ALL meetings and their match scores for an account."""
    try:
        sf = get_salesforce()
        
        # Get account details
        # Escape single quotes for SOQL query
        escaped_account_name = account_name.replace("'", "\\'")
        account_query = f"""
        SELECT Id, Name, Website, 
               (SELECT Id, Name, Email FROM Contacts)
        FROM Account
        WHERE Name = '{escaped_account_name}'
        LIMIT 1
        """
        account_result = sf.query(account_query)
        
        if account_result['totalSize'] == 0:
            return {"error": f"Account '{account_name}' not found in Salesforce"}
        
        account = account_result['records'][0]
        account_website = account.get('Website', '')
        
        # Extract domain from website
        if account_website:
            account_website = account_website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]
        
        contact_emails = []
        contact_names = []
        if account.get('Contacts'):
            for contact in account['Contacts']['records']:
                if contact.get('Email'):
                    contact_emails.append(contact['Email'].lower())
                if contact.get('Name'):
                    contact_names.append(contact['Name'].lower())
        
        # Query Fireflies
        query = f"""
        query {{
          transcripts(limit: 50) {{
            id
            title
            date
            meeting_attendees {{
              displayName
              email
            }}
          }}
        }}
        """
        
        result = query_fireflies(query)
        transcripts = result.get("data", {}).get("transcripts", [])
        
        # Score ALL meetings (no filtering)
        all_meetings = []
        account_name_lower = account_name.lower()
        account_terms = [term.lower() for term in account_name.split() if len(term) > 3]
        
        for transcript in transcripts:
            match_score = 0
            match_reasons = []
            
            title = (transcript.get('title') or '').lower()
            
            # Check title
            if account_name_lower in title:
                match_score += 10
                match_reasons.append('title_exact')
            elif any(term in title for term in account_terms):
                match_score += 5
                match_reasons.append('title_partial')
            
            # Check attendees
            attendee_details = []
            for attendee in transcript.get('meeting_attendees', []):
                email = (attendee.get('email') or '').lower()
                name = (attendee.get('displayName') or '').lower()
                
                attendee_info = {'name': name, 'email': email, 'matches': []}
                
                if account_website and email.endswith(account_website):
                    match_score += 15
                    match_reasons.append(f'email_domain:{email}')
                    attendee_info['matches'].append('domain_match')
                
                # SMART MATCH: Extract company from email domain
                if email and '@' in email:
                    email_domain = email.split('@')[1]
                    company_from_email = email_domain.split('.')[0]
                    
                    if company_from_email in account_name_lower or account_name_lower in company_from_email:
                        match_score += 18
                        match_reasons.append(f'smart_domain:{email}')
                        attendee_info['matches'].append(f'smart_domain_match({company_from_email})')
                    elif any(term == company_from_email for term in account_terms):
                        match_score += 18
                        match_reasons.append(f'smart_domain:{email}')
                        attendee_info['matches'].append(f'smart_domain_match({company_from_email})')
                
                if email in contact_emails:
                    match_score += 20
                    match_reasons.append(f'contact_email:{email}')
                    attendee_info['matches'].append('contact_match')
                
                if any(contact_name in name or name in contact_name for contact_name in contact_names if contact_name):
                    match_score += 10
                    match_reasons.append(f'contact_name:{name}')
                    attendee_info['matches'].append('name_match')
                
                attendee_details.append(attendee_info)
            
            all_meetings.append({
                'id': transcript.get('id'),
                'title': transcript.get('title'),
                'date': transcript.get('date'),
                'match_score': match_score,
                'match_reasons': match_reasons,
                'attendees': attendee_details,
                'would_show': match_score >= 15
            })
        
        # Sort by score
        all_meetings.sort(key=lambda x: x['match_score'], reverse=True)
        
        return {
            'account_name': account_name,
            'account_website': account_website,
            'contact_emails': contact_emails,
            'contact_names': contact_names,
            'account_terms': account_terms,
            'total_meetings_checked': len(all_meetings),
            'meetings_that_would_show': len([m for m in all_meetings if m['would_show']]),
            'all_meetings': all_meetings[:20],  # Show top 20
            'threshold': 15,
            'explanation': 'Only meetings with score >= 15 are shown. Domain match = 25pts, Contact email = 15pts, Title exact = 15pts, Content/Summary mention = 10pts each'
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Invoice Matching Endpoints
# ============================================================================

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
async def get_grant_invoices():
    """Get nonprofit grant invoices for matching."""
    try:
        import os
        from datetime import datetime
        
        # Use absolute path
        csv_path = '/Users/jacquelinereverand/pursuit-mcp-client/nonprofit_grant_invoices.csv'
        
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail=f"Grant invoices CSV not found at {csv_path}")
        
        # Read CSV manually to avoid pandas dependency
        import csv
        invoices = []
        seen_ids = set()
        
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                # Remove duplicates based on invoice_id
                invoice_id = row['invoice_id']
                if invoice_id not in seen_ids:
                    seen_ids.add(invoice_id)
                    invoices.append(row)
        
        # Sort by invoice date (most recent first)
        def parse_date(date_str):
            try:
                return datetime.strptime(date_str, '%m/%d/%Y')
            except:
                return datetime.min
        
        invoices.sort(key=lambda x: parse_date(x.get('invoice_date', '')), reverse=True)
        
        return {
            "success": True,
            "count": len(invoices),
            "invoices": invoices
        }
        
    except Exception as e:
        import traceback
        error_detail = {
            "error": str(e),
            "traceback": traceback.format_exc()
        }
        raise HTTPException(status_code=500, detail=error_detail)


@app.get("/api/matching/search-opportunities")
async def search_opportunities(
    q: str = "", 
    limit: int = 20,
    customer_name: str = Query(None),
    invoice_amount: float = Query(None),
    invoice_date: str = Query(None)
):
    """Search Salesforce opportunities by name or account with smart matching."""
    try:
        from difflib import SequenceMatcher
        from datetime import datetime, timedelta
        
        sf = get_salesforce()
        
        # Build search query - show all opportunities, but scoring will prefer won/collecting
        if q:
            query = f"""
            SELECT Id, Name, AccountId, Account.Name, Amount, StageName, 
                   CloseDate, Description, Type
            FROM Opportunity
            WHERE (Name LIKE '%{q}%' OR Account.Name LIKE '%{q}%')
            ORDER BY CloseDate DESC
            LIMIT {limit}
            """
        else:
            query = f"""
            SELECT Id, Name, AccountId, Account.Name, Amount, StageName, 
                   CloseDate, Description, Type
            FROM Opportunity
            ORDER BY CloseDate DESC
            LIMIT {limit}
            """
        
        result = sf.query(query)
        
        def calculate_match_score(opp, customer_name, invoice_amount, invoice_date):
            """Calculate match score between invoice and opportunity."""
            score = 0
            explanation = {}
            
            # Name matching (40% weight)
            if customer_name and opp.get('AccountName'):
                name_ratio = SequenceMatcher(None, 
                    customer_name.lower(), 
                    opp['AccountName'].lower()
                ).ratio() * 100
                score += name_ratio * 0.4
                explanation['name_match'] = name_ratio
            
            # Amount matching (30% weight)
            if invoice_amount and opp.get('Amount'):
                opp_amount = float(opp['Amount'])
                amount_diff = abs(opp_amount - invoice_amount)
                amount_ratio = max(0, 100 - (amount_diff / max(opp_amount, invoice_amount) * 100))
                score += amount_ratio * 0.3
                explanation['amount_match'] = amount_ratio
            
            # Date proximity (20% weight) - use for scoring but not filtering
            if invoice_date and opp.get('CloseDate'):
                try:
                    inv_date = datetime.strptime(invoice_date, '%Y-%m-%d')
                    close_date = datetime.strptime(opp['CloseDate'], '%Y-%m-%d')
                    days_diff = abs((inv_date - close_date).days)
                    
                    # Score based on days difference (perfect match = 100, degrades over time)
                    # More lenient - just use it for ranking, not filtering
                    if days_diff <= 30:
                        date_score = 100
                    elif days_diff <= 90:
                        date_score = 100 - ((days_diff - 30) * 1.5)  # Lose 1.5 points per day after 30
                    elif days_diff <= 180:
                        date_score = max(0, 10 - ((days_diff - 90) / 30))  # Minimal score after 90 days
                    else:
                        date_score = 0
                    
                    score += date_score * 0.2
                    explanation['date_proximity_days'] = days_diff
                except:
                    pass
            
            # Stage weighting (30% weight) - heavily favor won/collecting but allow others
            stage = opp.get('StageName', '')
            if 'Collecting' in stage or 'In Effect' in stage:
                score += 30  # Maximum bonus for active collection
                explanation['stage_bonus'] = '🟢 Active collection'
            elif 'Closed / Completed' in stage:
                score += 20
                explanation['stage_bonus'] = '✓ Completed'
            elif 'Closed Won' in stage:
                score += 25
                explanation['stage_bonus'] = '✓ Won (not yet collecting)'
            elif 'Closed Lost' in stage or 'Withdrawn' in stage:
                score -= 20  # Penalty for closed/lost
                explanation['stage_bonus'] = '❌ Closed/Lost'
            else:
                # Open pipeline stages - show but don't recommend
                score -= 10  # Slight penalty
                explanation['stage_bonus'] = '⚠️ Open pipeline (not yet won)'
            
            return score, explanation
        
        opportunities = []
        for record in result.get('records', []):
            opp_data = {
                'Id': record.get('Id'),
                'Name': record.get('Name'),
                'AccountName': record.get('Account', {}).get('Name') if record.get('Account') else '',
                'Amount': record.get('Amount'),
                'StageName': record.get('StageName'),
                'CloseDate': record.get('CloseDate'),
                'Description': record.get('Description'),
                'Type': record.get('Type')
            }
            
            # Calculate match score if invoice data provided (no filtering by date)
            if customer_name or invoice_amount or invoice_date:
                score, explanation = calculate_match_score(
                    opp_data, customer_name, invoice_amount, invoice_date
                )
                opp_data['matchScore'] = score
                opp_data['matchExplanation'] = explanation
            
            opportunities.append(opp_data)
        
        # Sort by match score if available
        if customer_name or invoice_amount or invoice_date:
            opportunities.sort(key=lambda x: x.get('matchScore', 0), reverse=True)
        
        return {
            "success": True,
            "count": len(opportunities),
            "opportunities": opportunities
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/matching/matches")
async def get_invoice_matches():
    """Get saved invoice-opportunity matches."""
    try:
        import json
        import os
        
        matches_path = '/Users/jacquelinereverand/pursuit-mcp-client/invoice_opportunity_matches.json'
        
        if os.path.exists(matches_path):
            with open(matches_path, 'r') as f:
                matches = json.load(f)
        else:
            matches = {}
        
        return {
            "success": True,
            "count": len(matches),
            "matches": matches
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/matching/save-match")
async def save_invoice_match(match_request: InvoiceMatchRequest):
    """Save an invoice-opportunity match."""
    try:
        import json
        import os
        from datetime import datetime
        
        matches_path = os.path.join(os.path.dirname(__file__), '..', 'invoice_opportunity_matches.json')
        
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
            'matched_by': 'web_user',
            'invoice_data': {
                'customer_name': match_request.customer_name or '',
                'invoice_amount': match_request.invoice_amount or 0,
                'invoice_date': match_request.invoice_date or ''
            }
        }
        
        # Save matches
        with open(matches_path, 'w') as f:
            json.dump(matches, f, indent=2)
        
        return {
            "success": True,
            "message": "Match saved successfully",
            "invoice_id": match_request.invoice_id,
            "opportunity_id": match_request.opportunity_id
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/matching/delete-match/{invoice_id}")
async def delete_invoice_match(invoice_id: str):
    """Delete an invoice-opportunity match."""
    try:
        import json
        import os
        
        matches_path = os.path.join(os.path.dirname(__file__), '..', 'invoice_opportunity_matches.json')
        
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
            
            return {
                "success": True,
                "message": "Match deleted successfully"
            }
        else:
            raise HTTPException(status_code=404, detail="Match not found")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# FINANCE DASHBOARD - INVOICE & PAYMENT MANAGEMENT
# ============================================================================

@app.get("/api/finance/awaiting-invoices")
async def get_awaiting_invoices():
    """Get payments that are ready to be invoiced.
    
    Returns individual payment records (not opportunities) that:
    - Belong to opportunities in 'Collecting / In Effect' stage
    - Don't have an invoice yet (Invoice__c is null)
    - Aren't marked as paid yet
    """
    try:
        sf = get_salesforce()
        
        # Query for payments that need invoices
        query = """
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c, npe01__Paid__c,
               npe01__Opportunity__c, npe01__Opportunity__r.Name, 
               npe01__Opportunity__r.Account.Name, npe01__Opportunity__r.CloseDate,
               npe01__Opportunity__r.Owner.Name, npe01__Opportunity__r.StageName,
               Invoice__c
        FROM npe01__OppPayment__c
        WHERE npe01__Opportunity__r.StageName = 'Collecting / In Effect'
        AND Invoice__c = null
        AND npe01__Paid__c = false
        ORDER BY npe01__Scheduled_Date__c ASC
        """
        
        # Use query_all to get ALL payments awaiting invoices
        result = sf.query_all(query)
        
        payments = []
        for record in result.get('records', []):
            payments.append({
                'Id': record['Id'],
                'PaymentAmount': record.get('npe01__Payment_Amount__c', 0),
                'ScheduledDate': record.get('npe01__Scheduled_Date__c'),
                'OpportunityId': record.get('npe01__Opportunity__c'),
                'OpportunityName': record.get('npe01__Opportunity__r', {}).get('Name'),
                'AccountName': record.get('npe01__Opportunity__r', {}).get('Account', {}).get('Name'),
                'OwnerName': record.get('npe01__Opportunity__r', {}).get('Owner', {}).get('Name'),
                'CloseDate': record.get('npe01__Opportunity__r', {}).get('CloseDate'),
                'HasInvoice': record.get('Invoice__c') is not None,
                'IsPaid': record.get('npe01__Paid__c', False)
            })
        
        return {
            "success": True,
            "count": len(payments),
            "payments": payments,
            "summary": {
                "total_amount": sum(p['PaymentAmount'] for p in payments)
            }
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


class CreateInvoiceRequest(BaseModel):
    payment_id: str  # The npe01__OppPayment__c record ID
    send_email: bool = False


@app.post("/api/finance/create-invoice")
async def create_sage_invoice(request: CreateInvoiceRequest):
    """Create invoice in Sage Intacct from a Salesforce payment record.
    
    NOTE: This is a simplified version for demo. 
    For full production, we'd integrate with Sage Intacct API.
    """
    try:
        sf = get_salesforce()
        payment_id = request.payment_id
        
        # Get payment details
        payment_query = f"""
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c,
               npe01__Opportunity__c, npe01__Opportunity__r.Name, npe01__Opportunity__r.Account.Name
        FROM npe01__OppPayment__c
        WHERE Id = '{payment_id}'
        """
        payment_result = sf.query(payment_query)
        
        if not payment_result.get('records'):
            raise HTTPException(status_code=404, detail="Payment not found")
        
        payment = payment_result['records'][0]
        opp_name = payment.get('npe01__Opportunity__r', {}).get('Name')
        opp_id = payment.get('npe01__Opportunity__c')
        amount = float(payment.get('npe01__Payment_Amount__c', 0))
        
        # For demo: Create placeholder invoice ID
        # TODO: Replace with actual Sage Intacct integration
        sage_invoice_id = f"DEMO-{payment_id[:8]}"
        
        # Create Invoice__c record in Salesforce
        invoice_record = {
            'Opportunity__c': opp_id,
            'Sage_Invoice_ID__c': sage_invoice_id,  # FIXED: was Invoice_ID__c
            'Invoice_Amount__c': amount,
            'Invoice_Date__c': datetime.now().strftime('%Y-%m-%d'),
            # Note: Due_Date__c field doesn't exist on Invoice__c
            'Invoice_Status__c': 'Posted',  # Valid values: Posted (default), Sent, Partially Paid, Paid, Overdue, Cancelled
            'Description__c': f"{opp_name} - Payment",
        }
        
        sf_invoice_result = sf.Invoice__c.create(invoice_record)
        sf_invoice_id = sf_invoice_result.get('id')
        
        # Link invoice to payment
        sf.npe01__OppPayment__c.update(payment_id, {
            'Invoice__c': sf_invoice_id
        })
        
        return {
            "success": True,
            "message": f"Invoice created for payment",
            "sage_invoice_id": sage_invoice_id,
            "salesforce_invoice_id": sf_invoice_id,
            "payment_id": payment_id,
            "opportunity_name": opp_name,
            "amount": amount,
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


# ============================================================================
# AUTOMATIC PAYMENT SYNC FROM SAGE INTACCT
# ============================================================================

def sync_invoice_payments_from_sage():
    """
    Background job that syncs invoice payment status from Sage Intacct to Salesforce.
    Runs automatically every 5 minutes.
    """
    try:
        logger.info("🔄 Starting automatic Sage → Salesforce payment sync...")
        
        # Import here to avoid circular imports
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sf = get_salesforce()
        
        # Initialize Sage service
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        # Get all Invoice__c records that aren't marked as Paid yet
        invoice_query = """
        SELECT Id, Sage_Invoice_ID__c, Invoice_Status__c, Invoice_Amount__c
        FROM Invoice__c
        WHERE Invoice_Status__c != 'Paid'
        AND Sage_Invoice_ID__c != null
        """
        
        # Use query_all to get ALL unpaid invoices
        invoices_result = sf.query_all(invoice_query)
        invoices = invoices_result.get('records', [])
        
        if not invoices:
            logger.info("   No unpaid invoices to sync")
            return
        
        logger.info(f"   Checking {len(invoices)} unpaid invoices in Sage...")
        
        invoices_updated = 0
        payments_updated = 0
        opportunities_completed = set()
        
        for invoice in invoices:
            sage_invoice_id = invoice.get('Sage_Invoice_ID__c', '')
            
            # Skip DEMO invoices (not real Sage invoices)
            if sage_invoice_id.startswith('DEMO-'):
                continue
            
            try:
                # Query Sage for this invoice
                function_xml = f"""
                <function controlid="get-invoice-{sage_invoice_id}">
                    <read>
                        <object>ARINVOICE</object>
                        <keys>{sage_invoice_id}</keys>
                        <fields>RECORDNO,STATE,TOTALDUE,TOTALPAID</fields>
                    </read>
                </function>"""
                
                sage_response = sage._make_api_request(function_xml)
                
                if not sage_response.get('success'):
                    continue
                
                sage_data = sage_response.get('data', {})
                sage_invoice = sage_data.get('arinvoice', {})
                
                if not sage_invoice:
                    continue
                
                # Check if invoice is paid in Sage
                sage_state = str(sage_invoice.get('STATE', '')).lower()
                total_paid = float(sage_invoice.get('TOTALPAID', 0))
                total_due = float(sage_invoice.get('TOTALDUE', 0))
                
                is_fully_paid = (sage_state == 'paid' or 
                                 sage_state == 'closed' or 
                                 total_due == 0)
                
                invoice_updates = {}
                
                # Update invoice status
                if is_fully_paid and invoice.get('Invoice_Status__c') != 'Paid':
                    invoice_updates['Invoice_Status__c'] = 'Paid'
                    logger.info(f"   ✅ Invoice {sage_invoice_id} is PAID in Sage")
                    
                    # Mark the linked payment(s) as paid
                    payment_query = f"""
                    SELECT Id, npe01__Paid__c, npe01__Opportunity__c
                    FROM npe01__OppPayment__c
                    WHERE Invoice__c = '{invoice['Id']}'
                    """
                    payment_result = sf.query(payment_query)
                    payments = payment_result.get('records', [])
                    
                    for payment in payments:
                        if not payment.get('npe01__Paid__c'):
                            # Mark payment as paid
                            sf.npe01__OppPayment__c.update(payment['Id'], {
                                'npe01__Paid__c': True,
                                'npe01__Payment_Date__c': datetime.now().strftime('%Y-%m-%d')
                            })
                            payments_updated += 1
                            logger.info(f"      → Marked Payment {payment['Id']} as PAID")
                            
                            # Track opportunity for completion check
                            opp_id = payment.get('npe01__Opportunity__c')
                            if opp_id:
                                opportunities_completed.add(opp_id)
                
                elif total_paid > 0 and invoice.get('Invoice_Status__c') == 'Posted':
                    # Partially paid
                    invoice_updates['Invoice_Status__c'] = 'Partially Paid'
                    logger.info(f"   💵 Invoice {sage_invoice_id} is PARTIALLY PAID (${total_paid})")
                
                # Update invoice in Salesforce if there are changes
                if invoice_updates:
                    sf.Invoice__c.update(invoice['Id'], invoice_updates)
                    invoices_updated += 1
                    
            except Exception as e:
                logger.error(f"   ❌ Error syncing invoice {sage_invoice_id}: {str(e)}")
                continue
        
        # Check if any opportunities should be completed
        opps_completed_count = 0
        for opp_id in opportunities_completed:
            # Check if ALL payments for this opportunity are paid
            check_query = f"""
            SELECT Id, npe01__Paid__c
            FROM npe01__OppPayment__c
            WHERE npe01__Opportunity__c = '{opp_id}'
            """
            all_payments = sf.query(check_query).get('records', [])
            
            if all_payments and all(p.get('npe01__Paid__c') for p in all_payments):
                # All payments paid! Complete the opportunity
                sf.Opportunity.update(opp_id, {
                    'StageName': 'Closed / Completed'
                })
                opps_completed_count += 1
                logger.info(f"   🎉 Opportunity {opp_id} COMPLETED (all payments received)")
        
        logger.info(f"✅ Sync complete: {invoices_updated} invoices updated, {payments_updated} payments marked as paid, {opps_completed_count} opportunities completed")
        
        return {
            "success": True,
            "invoices_updated": invoices_updated,
            "payments_updated": payments_updated,
            "opportunities_completed": opps_completed_count
        }
        
    except Exception as e:
        logger.error(f"❌ Sync failed: {str(e)}")
        import traceback
        logger.error(traceback.format_exc())
        return {"success": False, "error": str(e)}


@app.post("/api/finance/sync-payments")
async def manual_sync_payments():
    """
    Manually trigger the Sage → Salesforce payment sync.
    Useful for testing or forcing an immediate sync.
    """
    result = sync_invoice_payments_from_sage()
    return result


# ============================================================================
# SAGE INTACCT MASTER DATA (for invoice form dropdowns)
# ============================================================================

@app.get("/api/sage/customers")
async def get_sage_customers():
    """Get Sage Intacct customers for invoice creation.
    
    Uses the pre-exported grant invoices CSV to get list of grant customers.
    This is more reliable than querying Sage API with pagination issues.
    """
    try:
        import csv
        
        # Use the exported grant invoices CSV
        csv_path = '/Users/jacquelinereverand/pursuit-mcp-client/nonprofit_grant_invoices.csv'
        
        if not os.path.exists(csv_path):
            raise HTTPException(status_code=404, detail=f"Grant invoices CSV not found")
        
        # Extract unique customers from CSV
        customers_map = {}
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                cust_id = row.get('customer_id')
                cust_name = row.get('customer_name')
                cust_type = row.get('customer_type', '')
                
                if cust_id and cust_name and cust_id not in customers_map:
                    customers_map[cust_id] = {
                        'id': cust_id,
                        'name': cust_name,
                        'type': cust_type if cust_type else None,
                        'status': 'active'
                    }
        
        customers = list(customers_map.values())
        customers.sort(key=lambda x: x['name'])  # Sort alphabetically
        
        logger.info(f"Loaded {len(customers)} grant customers from CSV")
        
        return {
            "success": True,
            "count": len(customers),
            "customers": customers
        }
        
    except Exception as e:
        import traceback
        logger.error(f"Error loading customers: {str(e)}")
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/gl-accounts")
async def get_sage_gl_accounts():
    """Get Sage Intacct GL accounts for invoice line items."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = """
        <function controlid="get-glaccount">
            <readByQuery>
                <object>GLACCOUNT</object>
                <query></query>
                <fields>ACCOUNTNO,TITLE,ACCOUNTTYPE</fields>
                <pagesize>1000</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch GL accounts")
        
        data = response.get('data', {})
        accounts_data = data.get('glaccount', [])
        
        if not isinstance(accounts_data, list):
            accounts_data = [accounts_data] if accounts_data else []
        
        accounts = [
            {
                'value': acc.get('ACCOUNTNO'),
                'label': f"{acc.get('ACCOUNTNO')} - {acc.get('TITLE')}",
                'type': acc.get('ACCOUNTTYPE')
            }
            for acc in accounts_data
            if acc.get('ACCOUNTNO')
        ]
        
        return {
            "success": True,
            "count": len(accounts),
            "accounts": accounts
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/departments")
async def get_sage_departments():
    """Get Sage Intacct departments."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = """
        <function controlid="get-departments">
            <readByQuery>
                <object>DEPARTMENT</object>
                <query></query>
                <fields>DEPARTMENTID,TITLE</fields>
                <pagesize>500</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch departments")
        
        data = response.get('data', {})
        dept_data = data.get('department', [])
        
        if not isinstance(dept_data, list):
            dept_data = [dept_data] if dept_data else []
        
        departments = [
            {
                'value': d.get('DEPARTMENTID'),
                'label': f"{d.get('DEPARTMENTID')} - {d.get('TITLE')}"
            }
            for d in dept_data
            if d.get('DEPARTMENTID')
        ]
        
        return {
            "success": True,
            "count": len(departments),
            "departments": departments
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/classes")
async def get_sage_classes():
    """Get Sage Intacct classes."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = """
        <function controlid="get-classes">
            <readByQuery>
                <object>CLASS</object>
                <query></query>
                <fields>CLASSID,NAME</fields>
                <pagesize>500</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch classes")
        
        data = response.get('data', {})
        class_data = data.get('class', [])
        
        if not isinstance(class_data, list):
            class_data = [class_data] if class_data else []
        
        classes = [
            {
                'value': c.get('CLASSID'),
                'label': f"{c.get('CLASSID')} - {c.get('NAME')}"
            }
            for c in class_data
            if c.get('CLASSID')
        ]
        
        return {
            "success": True,
            "count": len(classes),
            "classes": classes
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/locations")
async def get_sage_locations():
    """Get Sage Intacct locations."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = """
        <function controlid="get-locations">
            <readByQuery>
                <object>LOCATION</object>
                <query></query>
                <fields>LOCATIONID,NAME</fields>
                <pagesize>500</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch locations")
        
        data = response.get('data', {})
        loc_data = data.get('location', [])
        
        if not isinstance(loc_data, list):
            loc_data = [loc_data] if loc_data else []
        
        locations = [
            {
                'value': l.get('LOCATIONID'),
                'label': f"{l.get('LOCATIONID')} - {l.get('NAME')}"
            }
            for l in loc_data
            if l.get('LOCATIONID')
        ]
        
        return {
            "success": True,
            "count": len(locations),
            "locations": locations
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/payments")
async def get_sage_payments(limit: int = 1000):
    """Get payment transactions from Sage Intacct."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = f"""
        <function controlid="get-payments">
            <readByQuery>
                <object>ARPAYMENT</object>
                <query></query>
                <fields>*</fields>
                <pagesize>{limit}</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch payments")
        
        data = response.get('data', {})
        payments_data = data.get('arpayment', [])
        
        if not isinstance(payments_data, list):
            payments_data = [payments_data] if payments_data else []
        
        return {
            "success": True,
            "count": len(payments_data),
            "payments": payments_data
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/invoices")
async def get_sage_invoices(limit: int = 1000):
    """Get AR invoices from Sage Intacct."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = f"""
        <function controlid="get-invoices">
            <readByQuery>
                <object>ARINVOICE</object>
                <query></query>
                <fields>*</fields>
                <pagesize>{limit}</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch invoices")
        
        data = response.get('data', {})
        invoices_data = data.get('arinvoice', [])
        
        if not isinstance(invoices_data, list):
            invoices_data = [invoices_data] if invoices_data else []
        
        return {
            "success": True,
            "count": len(invoices_data),
            "invoices": invoices_data
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/expenses")
async def get_sage_expenses(limit: int = 1000):
    """Get expense transactions from Sage Intacct (AP bills)."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = f"""
        <function controlid="get-expenses">
            <readByQuery>
                <object>APBILL</object>
                <query></query>
                <fields>*</fields>
                <pagesize>{limit}</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch expenses")
        
        data = response.get('data', {})
        expenses_data = data.get('apbill', [])
        
        if not isinstance(expenses_data, list):
            expenses_data = [expenses_data] if expenses_data else []
        
        return {
            "success": True,
            "count": len(expenses_data),
            "expenses": expenses_data
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/sage/gl-accounts-balance")
async def get_sage_gl_accounts_balance():
    """Get GL account balances from Sage Intacct (cash accounts)."""
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        sage = SageIntacctService(sage_config)
        
        function_xml = """
        <function controlid="get-gl-balances">
            <readByQuery>
                <object>GLACCOUNT</object>
                <query>ACCOUNTTYPE = 'balancesheet' OR ACCOUNTTYPE = 'cash'</query>
                <fields>ACCOUNTNO,TITLE,ACCOUNTTYPE,NORMALBALANCE</fields>
                <pagesize>1000</pagesize>
            </readByQuery>
        </function>"""
        
        response = sage._make_api_request(function_xml)
        
        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch GL accounts")
        
        data = response.get('data', {})
        accounts_data = data.get('glaccount', [])
        
        if not isinstance(accounts_data, list):
            accounts_data = [accounts_data] if accounts_data else []
        
        return {
            "success": True,
            "count": len(accounts_data),
            "accounts": accounts_data
        }
        
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/cashflow/summary")
async def get_cashflow_summary():
    """
    Comprehensive cash flow summary combining:
    - Sage Intacct: payments, invoices, expenses, cash balances
    - Salesforce: pipeline forecast (weighted by probability and payment dates)
    """
    try:
        import sys
        import os
        # Add parent directory to path (works in both Docker and local dev)
        parent_dir = os.path.dirname(os.path.abspath(__file__))
        if parent_dir not in sys.path:
            sys.path.insert(0, parent_dir)
        from mcp_client.services.sage_intacct_sync import SageIntacctService
        from datetime import datetime, timedelta
        from dateutil.relativedelta import relativedelta
        import calendar
        
        # Initialize Sage Intacct
        sage_config = {
            'company_id': os.getenv('SAGE_COMPANY_ID'),
            'user_id': os.getenv('SAGE_USER_ID'),
            'user_password': os.getenv('SAGE_USER_PASSWORD'),
            'sender_id': os.getenv('SAGE_SENDER_ID'),
            'sender_password': os.getenv('SAGE_SENDER_PASSWORD')
        }
        
        # Check if Sage is configured
        sage_configured = all([
            sage_config.get('company_id'),
            sage_config.get('user_id'),
            sage_config.get('user_password'),
            sage_config.get('sender_id'),
            sage_config.get('sender_password')
        ])
        
        if not sage_configured:
            # Return demo/empty data if Sage not configured
            return {
                "success": True,
                "demo_mode": True,
                "message": "Sage Intacct not configured - showing empty data",
                "summary": {
                    "current_cash": 0,
                    "accounts_receivable": 0,
                    "accounts_payable": 0,
                    "net_cash_position": 0,
                    "avg_monthly_expenses": 0,
                    "runway_months": 0,
                    "forecasted_revenue_6mo": 0
                },
                "monthly_breakdown": [],
                "data_sources": {
                    "payments_count": 0,
                    "invoices_count": 0,
                    "expenses_count": 0,
                    "gl_accounts_count": 0,
                    "sf_opportunities_count": 0
                }
            }
        
        sage = SageIntacctService(sage_config)
        
        # Get Salesforce data
        sf = get_salesforce()
        
        # Try to fetch data from Sage Intacct with fallback
        payments = []
        invoices = []
        expenses = []
        gl_accounts = []
        sage_error = None
        
        try:
            # 1. Get payments (actual revenue received)
            payments_xml = """
            <function controlid="get-payments">
                <readByQuery>
                    <object>ARPAYMENT</object>
                    <query></query>
                    <fields>*</fields>
                    <pagesize>1000</pagesize>
                </readByQuery>
            </function>"""
            payments_result = sage._make_api_request(payments_xml)
            payments_data = payments_result.get('data', {})
            payments = payments_data.get('arpayment', [])
            if not isinstance(payments, list):
                payments = [payments] if payments else []
        except Exception as e:
            sage_error = str(e)
            print(f"Warning: Failed to fetch Sage payments: {e}")
        
        try:
            # 2. Get invoices (revenue billed but not yet received)
            invoices_xml = """
            <function controlid="get-invoices">
                <readByQuery>
                    <object>ARINVOICE</object>
                    <query></query>
                    <fields>*</fields>
                    <pagesize>1000</pagesize>
                </readByQuery>
            </function>"""
            invoices_result = sage._make_api_request(invoices_xml)
            invoices_data = invoices_result.get('data', {})
            invoices = invoices_data.get('arinvoice', [])
            if not isinstance(invoices, list):
                invoices = [invoices] if invoices else []
        except Exception as e:
            print(f"Warning: Failed to fetch Sage invoices: {e}")
        
        try:
            # 3. Get expenses from GLDETAIL (actual expense transactions)
            # Expense accounts are typically 5000-8999 range
            # Get last 12 months of expense data
            # Query for recent expenses (last 4 months to ensure we get full 3 months for burn rate)
            # Sage limits to 1000 records, so we query a shorter period to get complete data
            # Calculate date 4 months ago
            from datetime import datetime
            from dateutil.relativedelta import relativedelta
            four_months_ago = datetime.now() - relativedelta(months=4)
            query_start_date = four_months_ago.strftime('%m/%d/%Y')
            
            expenses_xml = f"""
            <function controlid="get-gl-expenses">
                <readByQuery>
                    <object>GLDETAIL</object>
                    <query>ACCOUNTNO &gt;= '5000' AND ACCOUNTNO &lt; '9000' AND BATCH_DATE &gt;= '{query_start_date}'</query>
                    <fields>RECORDNO,ACCOUNTNO,ACCOUNTTITLE,BATCH_DATE,AMOUNT,TRX_AMOUNT</fields>
                    <pagesize>2000</pagesize>
                </readByQuery>
            </function>"""
            print(f"📊 DEBUG: Querying expenses from {query_start_date} onwards")
            
            expenses_result = sage._make_api_request(expenses_xml)
            expenses_data = expenses_result.get('data', {})
            gl_expenses = expenses_data.get('gldetail', [])
            
            if not isinstance(gl_expenses, list):
                gl_expenses = [gl_expenses] if gl_expenses else []
            
            print(f"📊 DEBUG: Found {len(gl_expenses)} GL expense entries")
            
            # Convert GL entries to expense format for processing
            expenses = []
            for i, entry in enumerate(gl_expenses):
                batch_date = entry.get('BATCH_DATE', '')
                if batch_date:
                    amount = abs(float(entry.get('AMOUNT', 0) or 0))
                    expenses.append({
                        'WHENPOSTED': batch_date,
                        'WHENCREATED': batch_date,
                        'TOTALENTERED': amount,
                        'TOTALDUE': 0,  # GL entries are posted, not "due"
                        'STATE': 'Posted',
                        'ACCOUNTTITLE': entry.get('ACCOUNTTITLE', 'Expense')
                    })
                    # Log first few for debugging
                    if i < 3:
                        print(f"   Sample expense #{i+1}: {batch_date} - {entry.get('ACCOUNTTITLE')} = ${amount:,.2f}")
        except Exception as e:
            print(f"Warning: Failed to fetch Sage GL expenses: {e}")
            expenses = []
        
        try:
            # 4. Get bank/checking accounts for cash on hand
            # CHECKINGACCOUNT has LASTRECONCILEDBALANCE which is the actual bank balance
            bank_xml = """
            <function controlid="get-bank-balances">
                <readByQuery>
                    <object>CHECKINGACCOUNT</object>
                    <query></query>
                    <fields>BANKACCOUNTID,GLACCOUNTNO,GLACCOUNTTITLE,LASTRECONCILEDBALANCE,LASTRECONCILEDDATE,STATUS</fields>
                    <pagesize>100</pagesize>
                </readByQuery>
            </function>"""
            bank_result = sage._make_api_request(bank_xml)
            bank_data = bank_result.get('data', {})
            gl_accounts = bank_data.get('checkingaccount', [])
            if not isinstance(gl_accounts, list):
                gl_accounts = [gl_accounts] if gl_accounts else []
            print(f"📊 DEBUG: Found {len(gl_accounts)} bank accounts")
            if gl_accounts:
                print(f"📊 DEBUG: First account: {gl_accounts[0]}")
        except Exception as e:
            print(f"Warning: Failed to fetch Sage bank account balances: {e}")
            import traceback
            traceback.print_exc()
        
        # 5. Get Salesforce pipeline for forecast
        sf_query = """
        SELECT Id, Name, Amount, Probability, CloseDate, StageName, 
               PaymentDate__c, Earliest_Scheduled_Payment__c,
               npe01__Number_of_Payments__c
        FROM Opportunity
        WHERE IsClosed = false AND Amount > 0
        ORDER BY CloseDate ASC
        """
        sf_opps_result = sf.query_all(sf_query)
        sf_opportunities = sf_opps_result.get('records', [])
        
        # Calculate monthly breakdown (last 6 months + next 6 months)
        today = datetime.now()
        months = []
        for i in range(-6, 7):  # -6 to +6 months
            month_date = today + relativedelta(months=i)
            month_start = month_date.replace(day=1)
            month_end = month_date.replace(day=calendar.monthrange(month_date.year, month_date.month)[1])
            
            months.append({
                'month': month_start.strftime('%Y-%m'),
                'month_name': month_start.strftime('%B %Y'),
                'start_date': month_start.isoformat(),
                'end_date': month_end.isoformat(),
                'is_past': i < 0,
                'is_current': i == 0,
                'is_future': i > 0
            })
        
        # Process monthly data
        monthly_data = []
        for month in months:
            month_start = datetime.fromisoformat(month['start_date'])
            month_end = datetime.fromisoformat(month['end_date'])
            
            # Calculate revenue for this month (from payments)
            month_revenue = 0
            for payment in payments:
                payment_date_str = payment.get('WHENPOSTED') or payment.get('WHENPAID') or payment.get('WHENCREATED')
                if payment_date_str:
                    try:
                        payment_date = datetime.fromisoformat(payment_date_str.replace('Z', '+00:00'))
                        if month_start <= payment_date <= month_end:
                            amount = float(payment.get('TOTALPAID', 0) or payment.get('TOTALENTERED', 0) or 0)
                            month_revenue += amount
                    except:
                        pass
            
            # Calculate expenses for this month
            month_expenses = 0
            expense_count = 0
            for expense in expenses:
                expense_date_str = expense.get('WHENPOSTED') or expense.get('WHENCREATED')
                if expense_date_str:
                    try:
                        # Handle both ISO format and Sage MM/DD/YYYY format
                        if '/' in expense_date_str:
                            # MM/DD/YYYY format from Sage
                            parts = expense_date_str.split('/')
                            if len(parts) == 3:
                                expense_date = datetime(int(parts[2]), int(parts[0]), int(parts[1]))
                            else:
                                continue
                        else:
                            # ISO format
                            expense_date = datetime.fromisoformat(expense_date_str.replace('Z', '+00:00'))
                        
                        if month_start <= expense_date <= month_end:
                            amount = float(expense.get('TOTALENTERED', 0) or expense.get('TOTALDUE', 0) or 0)
                            month_expenses += amount
                            expense_count += 1
                            if expense_count == 1 and month['is_past']:  # Log first expense for debugging
                                print(f"   📊 Sample expense in {month['month_name']}: {expense_date_str} = ${amount}")
                    except Exception as e:
                        if month['is_past'] and expense_count < 2:
                            print(f"   ⚠️ Failed to parse expense date: {expense_date_str} - {e}")
            
            # Calculate forecast for future months (from SF pipeline)
            month_forecast = 0
            if month['is_future'] or month['is_current']:
                for opp in sf_opportunities:
                    # Use payment date if available, otherwise close date
                    payment_date_str = opp.get('PaymentDate__c') or opp.get('Earliest_Scheduled_Payment__c') or opp.get('CloseDate')
                    if payment_date_str:
                        try:
                            payment_date = datetime.fromisoformat(payment_date_str.replace('Z', '+00:00'))
                            if month_start <= payment_date <= month_end:
                                amount = float(opp.get('Amount') or 0)
                                probability = float(opp.get('Probability') or 0) / 100
                                weighted_amount = amount * probability
                                month_forecast += weighted_amount
                        except:
                            pass
            
            monthly_data.append({
                'month': month['month'],
                'month_name': month['month_name'],
                'revenue': month_revenue,
                'expenses': month_expenses,
                'net': month_revenue - month_expenses,
                'forecast': month_forecast,
                'is_past': month['is_past'],
                'is_current': month['is_current'],
                'is_future': month['is_future']
            })
        
        # Calculate summary metrics
        # Sum up all active bank account balances (from CHECKINGACCOUNT.LASTRECONCILEDBALANCE)
        current_cash = sum(
            float(acc.get('LASTRECONCILEDBALANCE') or 0) 
            for acc in gl_accounts
            if acc.get('STATUS') == 'active'
        )
        print(f"💰 DEBUG: Total cash from {len([a for a in gl_accounts if a.get('STATUS') == 'active'])} active accounts: ${current_cash:,.2f}")
        
        # Calculate run rate (avg monthly expenses from last 3 months)
        past_months = [m for m in monthly_data if m['is_past']][-3:]
        
        # Method 1: From actual expense records
        expense_based_burn = sum(m['expenses'] for m in past_months) / len(past_months) if past_months else 0
        
        # Method 2: Implied burn from cash decrease (if no expense records)
        # Calculate from bank balance changes over time
        implied_burn = 0
        if expense_based_burn == 0 and len(gl_accounts) > 0:
            # Get oldest and newest reconciled dates to calculate cash burn
            dated_accounts = []
            for acc in gl_accounts:
                if acc.get('LASTRECONCILEDDATE') and acc.get('LASTRECONCILEDBALANCE'):
                    try:
                        # Parse date in MM/DD/YYYY format
                        date_parts = acc['LASTRECONCILEDDATE'].split('/')
                        if len(date_parts) == 3:
                            recon_date = datetime(int(date_parts[2]), int(date_parts[0]), int(date_parts[1]))
                            balance = float(acc.get('LASTRECONCILEDBALANCE', 0))
                            dated_accounts.append({'date': recon_date, 'balance': balance, 'account': acc['BANKACCOUNTID']})
                    except:
                        pass
            
            if len(dated_accounts) >= 2:
                # Sort by date
                dated_accounts.sort(key=lambda x: x['date'])
                
                # Calculate total change over time period
                # Assume accounts at same date represent point-in-time snapshot
                # Group by date and sum balances
                date_snapshots = {}
                for acc in dated_accounts:
                    date_key = acc['date'].strftime('%Y-%m')
                    if date_key not in date_snapshots:
                        date_snapshots[date_key] = 0
                    date_snapshots[date_key] += acc['balance']
                
                if len(date_snapshots) >= 2:
                    # Get oldest and most recent
                    dates = sorted(date_snapshots.keys())
                    oldest_balance = date_snapshots[dates[0]]
                    newest_balance = date_snapshots[dates[-1]]
                    
                    # Calculate months between
                    oldest_date = datetime.strptime(dates[0], '%Y-%m')
                    newest_date = datetime.strptime(dates[-1], '%Y-%m')
                    months_diff = (newest_date.year - oldest_date.year) * 12 + (newest_date.month - oldest_date.month)
                    
                    if months_diff > 0 and newest_balance < oldest_balance:
                        # Cash decreased - calculate average burn per month
                        cash_decrease = oldest_balance - newest_balance
                        implied_burn = cash_decrease / months_diff
                        print(f"💡 Implied burn rate: ${implied_burn:,.2f}/month (from {dates[0]} to {dates[-1]})")
        
        # Use implied burn if no expense records, otherwise use actual expenses
        avg_monthly_expenses = expense_based_burn if expense_based_burn > 0 else implied_burn
        
        # Total AR (outstanding invoices)
        total_ar = sum(float(inv.get('TOTALDUE', 0) or 0) for inv in invoices if inv.get('STATE') != 'Paid')
        
        # Total AP (outstanding expenses)
        total_ap = sum(float(exp.get('TOTALDUE', 0) or 0) for exp in expenses if exp.get('STATE') != 'Paid')
        
        # Calculate runway (months of cash remaining)
        runway_months = current_cash / avg_monthly_expenses if avg_monthly_expenses > 0 else 999
        
        # Next 6 months forecast
        future_months = [m for m in monthly_data if m['is_future']][:6]
        forecasted_revenue = sum(m['forecast'] for m in future_months)
        
        response = {
            "success": True,
            "timestamp": datetime.now().isoformat(),
            "summary": {
                "current_cash": current_cash,
                "accounts_receivable": total_ar,
                "accounts_payable": total_ap,
                "net_cash_position": current_cash + total_ar - total_ap,
                "avg_monthly_expenses": avg_monthly_expenses,
                "runway_months": round(runway_months, 1),
                "forecasted_revenue_6mo": forecasted_revenue
            },
            "monthly_breakdown": monthly_data,
            "data_sources": {
                "payments_count": len(payments),
                "invoices_count": len(invoices),
                "expenses_count": len(expenses),
                "bank_accounts_count": len(gl_accounts),
                "sf_opportunities_count": len(sf_opportunities)
            }
        }
        
        # Add warning if Sage failed
        if sage_error:
            response["sage_warning"] = f"Sage Intacct data unavailable: {sage_error}. Showing Salesforce pipeline forecast only."
        
        return response
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(
            status_code=500,
            detail={
                "error": str(e),
                "traceback": traceback.format_exc()
            }
        )


# ============================================================================
# OPPORTUNITY STAGE VALIDATION
# ============================================================================

@app.post("/api/opportunities/validate-stage-change")
async def validate_stage_change(request: dict):
    """Validate that opportunity can move to 'Collecting / In Effect'.
    
    Requirements:
    - Must have payment schedule (at least 1 payment)
    - Payment total must equal opportunity amount
    """
    try:
        sf = get_salesforce()
        opp_id = request.get('opportunity_id')
        new_stage = request.get('new_stage')
        
        if new_stage != 'Collecting / In Effect':
            return {"success": True, "can_proceed": True}
        
        # Get opportunity
        opp_query = f"""
        SELECT Id, Name, Amount
        FROM Opportunity
        WHERE Id = '{opp_id}'
        """
        opp_result = sf.query(opp_query)
        
        if not opp_result.get('records'):
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        opp = opp_result['records'][0]
        opp_amount = float(opp.get('Amount', 0))
        
        # Check for payment schedule
        payment_query = f"""
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c
        FROM npe01__OppPayment__c
        WHERE npe01__Opportunity__c = '{opp_id}'
        ORDER BY npe01__Scheduled_Date__c ASC
        """
        payment_result = sf.query(payment_query)
        payments = payment_result.get('records', [])
        
        if not payments:
            return {
                "success": False,
                "can_proceed": False,
                "error": "Payment schedule required",
                "message": f"Cannot move to 'Collecting / In Effect' without a payment schedule.\n\nPlease create a payment schedule for this ${opp_amount:,.0f} opportunity first.\n\nGo to Salesforce → Opportunity → Related → Payments → New",
                "action_required": "create_payment_schedule"
            }
        
        # Validate payment total matches opportunity amount
        payment_total = sum(float(p.get('npe01__Payment_Amount__c', 0)) for p in payments)
        
        if abs(payment_total - opp_amount) > 0.01:
            return {
                "success": False,
                "can_proceed": False,
                "error": "Payment schedule total doesn't match opportunity amount",
                "message": f"Payment schedule total (${payment_total:,.0f}) doesn't match opportunity amount (${opp_amount:,.0f}).\n\nPlease adjust the payment schedule in Salesforce.",
                "opportunity_amount": opp_amount,
                "payment_total": payment_total,
                "difference": payment_total - opp_amount,
                "action_required": "fix_payment_schedule"
            }
        
        return {
            "success": True,
            "can_proceed": True,
            "message": f"✅ Payment schedule validated: {len(payments)} payment(s) totaling ${payment_total:,.0f}",
            "payment_count": len(payments),
            "payment_total": payment_total
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.get("/api/opportunities/{opportunity_id}/payment-schedule")
async def get_payment_schedule(opportunity_id: str):
    """Get payment schedule for an opportunity."""
    try:
        sf = get_salesforce()
        
        # Get opportunity details
        opp_query = f"""
        SELECT Id, Name, Amount, StageName
        FROM Opportunity
        WHERE Id = '{opportunity_id}'
        """
        opp_result = sf.query(opp_query)
        
        if not opp_result.get('records'):
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        opportunity = opp_result['records'][0]
        
        # Get existing payment schedule
        payment_query = f"""
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c, 
               npe01__Paid__c, npe01__Payment_Date__c
        FROM npe01__OppPayment__c
        WHERE npe01__Opportunity__c = '{opportunity_id}'
        ORDER BY npe01__Scheduled_Date__c ASC
        """
        payment_result = sf.query(payment_query)
        payments = payment_result.get('records', [])
        
        return {
            "success": True,
            "opportunity": {
                "Id": opportunity['Id'],
                "Name": opportunity['Name'],
                "Amount": opportunity.get('Amount', 0),
                "StageName": opportunity.get('StageName')
            },
            "payments": [{
                "Id": p['Id'],
                "Amount": p.get('npe01__Payment_Amount__c', 0),
                "ScheduledDate": p.get('npe01__Scheduled_Date__c'),
                "Paid": p.get('npe01__Paid__c', False),
                "PaymentDate": p.get('npe01__Payment_Date__c')
            } for p in payments]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


class PaymentScheduleItem(BaseModel):
    amount: float
    scheduled_date: str  # YYYY-MM-DD format


class CreatePaymentScheduleRequest(BaseModel):
    opportunity_id: str
    payments: List[PaymentScheduleItem]
    delete_existing: bool = True  # Whether to delete existing payments first


@app.post("/api/opportunities/create-payment-schedule")
async def create_payment_schedule(request: CreatePaymentScheduleRequest):
    """Create payment schedule for an opportunity.
    
    Validates that payment total matches opportunity amount.
    Optionally deletes existing payments first.
    """
    try:
        sf = get_salesforce()
        opp_id = request.opportunity_id
        
        # Get opportunity
        opp_query = f"""
        SELECT Id, Name, Amount
        FROM Opportunity
        WHERE Id = '{opp_id}'
        """
        opp_result = sf.query(opp_query)
        
        if not opp_result.get('records'):
            raise HTTPException(status_code=404, detail="Opportunity not found")
        
        opp = opp_result['records'][0]
        opp_amount = float(opp.get('Amount', 0))
        
        # Validate payment total
        payment_total = sum(p.amount for p in request.payments)
        
        if abs(payment_total - opp_amount) > 0.01:
            raise HTTPException(
                status_code=400,
                detail={
                    "error": "Payment total doesn't match opportunity amount",
                    "opportunity_amount": opp_amount,
                    "payment_total": payment_total,
                    "difference": payment_total - opp_amount,
                    "message": f"Payment total (${payment_total:,.2f}) must equal opportunity amount (${opp_amount:,.2f})"
                }
            )
        
        # Delete existing payments if requested
        if request.delete_existing:
            existing_query = f"""
            SELECT Id
            FROM npe01__OppPayment__c
            WHERE npe01__Opportunity__c = '{opp_id}'
            """
            existing_result = sf.query(existing_query)
            existing_payments = existing_result.get('records', [])
            
            for payment in existing_payments:
                sf.npe01__OppPayment__c.delete(payment['Id'])
        
        # Create new payments
        created_payments = []
        for i, payment in enumerate(request.payments):
            payment_record = {
                'npe01__Opportunity__c': opp_id,
                'npe01__Payment_Amount__c': payment.amount,
                'npe01__Scheduled_Date__c': payment.scheduled_date,
                'npe01__Paid__c': False
            }
            
            result = sf.npe01__OppPayment__c.create(payment_record)
            created_payments.append({
                "Id": result['id'],
                "Amount": payment.amount,
                "ScheduledDate": payment.scheduled_date,
                "Number": i + 1
            })
        
        return {
            "success": True,
            "message": f"Created {len(created_payments)} payment(s) totaling ${payment_total:,.2f}",
            "payments": created_payments,
            "opportunity_name": opp.get('Name')
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


@app.post("/api/opportunities/update-stage")
async def update_opportunity_stage(request: dict):
    """Update opportunity stage with validation.
    
    For 'Collecting / In Effect' stage, requires payment schedule.
    """
    try:
        sf = get_salesforce()
        opp_id = request.get('opportunity_id')
        new_stage = request.get('new_stage')
        
        # Validate stage change
        validation_result = await validate_stage_change({
            'opportunity_id': opp_id,
            'new_stage': new_stage
        })
        
        if not validation_result.get('can_proceed'):
            raise HTTPException(status_code=400, detail=validation_result)
        
        # Update stage
        sf.Opportunity.update(opp_id, {
            'StageName': new_stage
        })
        
        return {
            "success": True,
            "message": f"Opportunity stage updated to '{new_stage}'",
            "stage": new_stage,
            "validation": validation_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={
            "error": str(e),
            "traceback": traceback.format_exc()
        })


# ============================================================================
# BACKGROUND SCHEDULER FOR AUTOMATIC SYNC
# ============================================================================

# Initialize scheduler
scheduler = BackgroundScheduler()

@app.on_event("startup")
async def start_scheduler():
    """Start the background scheduler when the app starts."""
    try:
        # Run sync every 5 minutes
        scheduler.add_job(
            func=sync_invoice_payments_from_sage,
            trigger=IntervalTrigger(minutes=5),
            id='sync_sage_payments',
            name='Sync payments from Sage Intacct to Salesforce',
            replace_existing=True
        )
        
        scheduler.start()
        logger.info("⏰ Background scheduler started - syncing payments every 5 minutes")
        
        # Run initial sync on startup
        logger.info("🔄 Running initial payment sync...")
        sync_invoice_payments_from_sage()
        
    except Exception as e:
        logger.error(f"❌ Failed to start scheduler: {str(e)}")


@app.on_event("shutdown")
async def shutdown_scheduler():
    """Shutdown the scheduler gracefully."""
    try:
        scheduler.shutdown()
        logger.info("⏹️  Background scheduler stopped")
    except Exception as e:
        logger.error(f"❌ Error shutting down scheduler: {str(e)}")


if __name__ == "__main__":
    print("🚀 Starting Financial Forecasting API...")
    print("📊 Connected to Salesforce:", SALESFORCE_CONFIG['USERNAME'])
    print("🌐 API available at: http://localhost:8000")
    print("📖 API docs at: http://localhost:8000/docs")
    print("⏰ Automatic payment sync: Every 5 minutes")
    
    uvicorn.run(
        "simple_server:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
