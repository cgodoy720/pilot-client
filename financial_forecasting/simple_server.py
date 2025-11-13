#!/usr/bin/env python3
"""
Simplified FastAPI server for Financial Forecasting POC.
Uses direct Salesforce connection without MCP layer for simplicity.
"""

from fastapi import FastAPI, HTTPException, Depends, Response, Request
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

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv()

# Import config
from config import SALESFORCE_CONFIG

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
        response = RedirectResponse(url=f"{FRONTEND_URL}/dashboard")
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
async def search_opportunities(q: str = "", limit: int = 20):
    """Search Salesforce opportunities by name or account."""
    try:
        sf = get_salesforce()
        
        # Build search query
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
        
        opportunities = []
        for record in result.get('records', []):
            opportunities.append({
                'Id': record.get('Id'),
                'Name': record.get('Name'),
                'AccountName': record.get('Account', {}).get('Name') if record.get('Account') else '',
                'Amount': record.get('Amount'),
                'StageName': record.get('StageName'),
                'CloseDate': record.get('CloseDate'),
                'Description': record.get('Description'),
                'Type': record.get('Type')
            })
        
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
