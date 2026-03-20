#!/usr/bin/env python3
"""
Simplified FastAPI server for Financial Forecasting POC.
Uses direct Salesforce connection without MCP layer for simplicity.
"""

from fastapi import FastAPI, HTTPException, Depends, Response, Request, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import RedirectResponse
from starlette.middleware.sessions import SessionMiddleware
from pydantic import BaseModel
from typing import Any, Dict, List, Optional
from datetime import datetime, date, timedelta, timezone
from decimal import Decimal
import uvicorn
import os
import secrets
from jose import jwt, JWTError

from simple_salesforce import Salesforce, SalesforceLogin
from security import validate_salesforce_id, escape_soql_string
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError
import requests
import httpx
from urllib.parse import urlencode, parse_qs, quote
from authlib.integrations.starlette_client import OAuth
from apscheduler.schedulers.background import BackgroundScheduler
from apscheduler.triggers.interval import IntervalTrigger
from cryptography.fernet import Fernet
import logging
import json
import time
import threading
import base64
import hashlib
import asyncio
import uuid as _uuid
import re as _re
import difflib as _difflib
import calendar as _calendar

# Load environment variables from .env file
from dotenv import load_dotenv
load_dotenv(override=False)

# JWT secret — must be defined before get_fernet() and any auth code; shared by JWT and Fernet
JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', secrets.token_urlsafe(32))

# Import config
from config import SALESFORCE_CONFIG
from models import OpportunityStage, OPEN_STAGES, CLOSED_STAGES, COLLECTING_STAGES
from routes.projects import router as projects_router
from db import init_db, close_db

VALID_STAGES = {s.value for s in OpportunityStage}

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# ============================================================================
# SERVER-SIDE CACHE - avoids re-querying Salesforce/Sage on every request
# ============================================================================
class TTLCache:
    """Thread-safe in-memory cache with per-key TTL."""
    def __init__(self):
        self._store: Dict[str, Any] = {}
        self._expiry: Dict[str, float] = {}
        self._lock = threading.Lock()

    def get(self, key: str) -> Any:
        with self._lock:
            if key in self._store and time.time() < self._expiry.get(key, 0):
                return self._store[key]
            # Expired or missing
            self._store.pop(key, None)
            self._expiry.pop(key, None)
            return None

    def set(self, key: str, value: Any, ttl_seconds: int = 300):
        with self._lock:
            self._store[key] = value
            self._expiry[key] = time.time() + ttl_seconds

    def invalidate(self, key: str):
        with self._lock:
            self._store.pop(key, None)
            self._expiry.pop(key, None)

    def invalidate_prefix(self, prefix: str):
        with self._lock:
            keys_to_remove = [k for k in self._store if k.startswith(prefix)]
            for k in keys_to_remove:
                self._store.pop(k, None)
                self._expiry.pop(k, None)

    def clear(self):
        with self._lock:
            self._store.clear()
            self._expiry.clear()

cache = TTLCache()

# Cache TTLs (seconds)
CACHE_TTL_OPPORTUNITIES = 300   # 5 minutes
CACHE_TTL_STAGE_HISTORY = 300  # 5 minutes
CACHE_TTL_ACCOUNTS = 600        # 10 minutes
CACHE_TTL_USERS = 900           # 15 minutes
CACHE_TTL_CASHFLOW = 600        # 10 minutes

# ============================================================================
# USER MAPPING - Google OAuth email → Salesforce User ID
# ============================================================================
_sf_user_map: Dict[str, Dict] = {}  # email -> {Id, Name}
_sf_user_map_loaded = False

def get_sf_user_by_email(email: str) -> Optional[Dict]:
    """Look up a Salesforce user by email address."""
    global _sf_user_map, _sf_user_map_loaded
    
    if not _sf_user_map_loaded:
        try:
            sf = get_salesforce()
            result = sf.query_all("SELECT Id, Name, Email FROM User WHERE IsActive = true AND Email != null")
            for u in result.get('records', []):
                if u.get('Email'):
                    _sf_user_map[u['Email'].lower()] = {'Id': u['Id'], 'Name': u['Name']}
            _sf_user_map_loaded = True
            logger.info(f"Loaded {len(_sf_user_map)} Salesforce users for email mapping")
        except Exception as e:
            logger.error(f"Failed to load SF user map: {e}")
            return None
    
    return _sf_user_map.get(email.lower()) if email else None

def get_sf_user_id_from_request(request: Request) -> Optional[str]:
    """Get the Salesforce User ID for the currently logged-in Google user."""
    token = request.cookies.get("access_token")
    if not token:
        return None
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=["HS256"])
        email = payload.get("email")
        if email:
            sf_user = get_sf_user_by_email(email)
            return sf_user['Id'] if sf_user else None
    except Exception:
        return None

# ============================================================================
# PER-USER SALESFORCE OAUTH - encrypted token storage
# ============================================================================
# Derive a stable Fernet key from the JWT secret
def _derive_fernet_key(secret: str) -> bytes:
    """Derive a Fernet-compatible key from an arbitrary secret string."""
    key_bytes = hashlib.sha256(secret.encode()).digest()
    return base64.urlsafe_b64encode(key_bytes)

# Will be initialized after JWT_SECRET_KEY is set (see below)
_fernet: Optional[Fernet] = None

def get_fernet() -> Fernet:
    global _fernet
    if _fernet is None:
        _fernet = Fernet(_derive_fernet_key(JWT_SECRET_KEY))
    return _fernet

def encrypt_sf_tokens(data: dict) -> str:
    """Encrypt Salesforce tokens for cookie storage."""
    return get_fernet().encrypt(json.dumps(data).encode()).decode()

def decrypt_sf_tokens(encrypted: str) -> Optional[dict]:
    """Decrypt Salesforce tokens from cookie."""
    try:
        return json.loads(get_fernet().decrypt(encrypted.encode()).decode())
    except Exception:
        return None

# Per-user Salesforce connection cache (in-memory, keyed by SF user_id)
_user_sf_clients: Dict[str, Salesforce] = {}

def get_user_salesforce(request: Request) -> Optional[Salesforce]:
    """Get a Salesforce connection for the currently logged-in user.
    Uses their personal OAuth tokens. Returns None if not connected."""
    sf_cookie = request.cookies.get("sf_tokens")
    if not sf_cookie:
        return None
    
    tokens = decrypt_sf_tokens(sf_cookie)
    if not tokens:
        return None
    
    access_token = tokens.get("access_token")
    instance_url = tokens.get("instance_url")
    sf_user_id = tokens.get("user_id", "unknown")
    
    if not access_token or not instance_url:
        return None
    
    # Validate sf_user_id to prevent SOQL injection (Salesforce IDs are 15 or 18 alphanumeric chars)
    if not _re.match(r'^[a-zA-Z0-9]{15}([a-zA-Z0-9]{3})?$', sf_user_id):
        logger.warning(f"Invalid Salesforce user_id format: {sf_user_id[:20]}...")
        return None

    # Check if we already have a live client for this user
    if sf_user_id in _user_sf_clients:
        client = _user_sf_clients[sf_user_id]
        # Verify it's still valid with a lightweight call
        try:
            client.query("SELECT Id FROM User WHERE Id = '{}' LIMIT 1".format(sf_user_id))
            return client
        except Exception:
            # Token expired, remove stale client
            _user_sf_clients.pop(sf_user_id, None)
    
    # Create a new Salesforce client from the user's OAuth token
    try:
        # Extract instance from URL (e.g. "https://yourorg.my.salesforce.com" -> "yourorg.my.salesforce.com")
        instance = instance_url.replace("https://", "").replace("http://", "")
        client = Salesforce(instance=instance, session_id=access_token)
        _user_sf_clients[sf_user_id] = client
        return client
    except Exception as e:
        logger.error(f"Failed to create per-user SF client: {e}")
        return None

async def refresh_sf_token(refresh_token: str) -> Optional[dict]:
    """Refresh an expired Salesforce access token."""
    try:
        sf_domain = SALESFORCE_CONFIG.get('DOMAIN', 'login')
        token_url = f"https://{sf_domain}.salesforce.com/services/oauth2/token"
        
        async with httpx.AsyncClient() as client:
            resp = await client.post(token_url, data={
                "grant_type": "refresh_token",
                "client_id": SALESFORCE_CONFIG['CLIENT_ID'],
                "client_secret": SALESFORCE_CONFIG['CLIENT_SECRET'],
                "refresh_token": refresh_token,
            })
        
        if resp.status_code == 200:
            data = resp.json()
            return {
                "access_token": data["access_token"],
                "instance_url": data["instance_url"],
                "refresh_token": refresh_token,  # Refresh token doesn't change
                "user_id": data.get("id", "").split("/")[-1] if data.get("id") else None,
            }
        else:
            logger.error(f"SF token refresh failed: {resp.status_code} {resp.text}")
            return None
    except Exception as e:
        logger.error(f"SF token refresh error: {e}")
        return None

def get_salesforce_for_request(request: Request) -> Salesforce:
    """Get the best Salesforce connection for this request.
    Uses per-user token if available, falls back to service account."""
    user_sf = get_user_salesforce(request)
    if user_sf:
        return user_sf
    # Fallback to service account
    return get_salesforce()

app = FastAPI(
    title="Financial Forecasting API",
    description="Simplified API for Pursuit financial forecasting POC",
    version="1.0.0"
)

# Mount Projects router (PostgreSQL-backed CRUD)
app.include_router(projects_router)

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

# Production detection and secret validation
IS_PRODUCTION = os.getenv('FRONTEND_URL', '').startswith('https')
if IS_PRODUCTION:
    if not JWT_SECRET_KEY or len(JWT_SECRET_KEY) < 32:
        raise RuntimeError(
            "Production requires JWT_SECRET_KEY (min 32 chars). "
            "Generate with: openssl rand -hex 32"
        )

# Session middleware (required for OAuth)
SESSION_SECRET_KEY = JWT_SECRET_KEY
app.add_middleware(
    SessionMiddleware,
    secret_key=SESSION_SECRET_KEY,
    session_cookie="session",
    max_age=3600 * 24,  # 24 hours
    same_site="none" if IS_PRODUCTION else "lax",
    https_only=IS_PRODUCTION  # Only require HTTPS in production
)

# Global connections
sf_client: Optional[Salesforce] = None
slack_client: Optional[WebClient] = None

# PBD Shared Calendar (the only calendar we expose — no personal calendars)
PBD_CALENDAR_ID = os.getenv(
    'PBD_CALENDAR_ID',
    'c_f06065f4e4551cee88f8d465a6a77a24c8333c66a0077770a3e60b8d26251e98@group.calendar.google.com'
)

# Slack channel for pipeline updates (used by automation review poller)
SLACK_PIPELINE_CHANNEL = os.getenv('SLACK_PIPELINE_CHANNEL', 'pipeline-updates')

# Fireflies API configuration
# Loaded from .env file
FIREFLIES_API_KEY = os.getenv('FIREFLIES_API_KEY')
FIREFLIES_API_URL = "https://api.fireflies.ai/graphql"
ANTHROPIC_API_KEY = os.getenv('ANTHROPIC_API_KEY')

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
        # Try Connected App (OAuth) method first - doesn't need security token
        try:
            sf_client = Salesforce(
                username=SALESFORCE_CONFIG['USERNAME'],
                password=SALESFORCE_CONFIG['PASSWORD'],
                consumer_key=SALESFORCE_CONFIG.get('CLIENT_ID', ''),
                consumer_secret=SALESFORCE_CONFIG.get('CLIENT_SECRET', ''),
                domain=SALESFORCE_CONFIG['DOMAIN']
            )
        except Exception as oauth_err:
            print(f"OAuth login failed, trying security token method: {oauth_err}")
            # Fallback to security token method
            security_token = SALESFORCE_CONFIG.get('SECURITY_TOKEN', '')
            if security_token and security_token != 'YOUR_SECURITY_TOKEN_HERE':
                sf_client = Salesforce(
                    username=SALESFORCE_CONFIG['USERNAME'],
                    password=SALESFORCE_CONFIG['PASSWORD'],
                    security_token=security_token,
                    domain=SALESFORCE_CONFIG['DOMAIN']
                )
            else:
                # Last resort: SalesforceLogin without token
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


def _get_slack_workspace_info() -> Optional[Dict[str, str]]:
    """Get cached Slack workspace info. Populates on first call."""
    global _slack_workspace_info
    if _slack_workspace_info is not None:
        return _slack_workspace_info
    try:
        slack_token = os.getenv('SLACK_BOT_TOKEN')
        if not slack_token:
            return None
        slack = get_slack()
        response = slack.auth_test()
        if response["ok"]:
            _slack_workspace_info = {
                "team": response.get("team", ""),
                "user": response.get("user", ""),
            }
            return _slack_workspace_info
    except Exception as e:
        logger.warning(f"Slack auth_test failed: {e}")
    return None


# ── Automation queue helpers (ported from main.py) ──────────────────────────

def _get_opp_cache() -> List[Dict[str, Any]]:
    """Return cached opportunity list for entity resolution.

    If the cache hasn't been populated yet, attempt a one-time lazy load
    from Salesforce so that the first call to ingest_pipeline_updates()
    has data for fuzzy matching.
    """
    global _opp_cache, _opp_cache_loaded
    if _opp_cache_loaded:
        return _opp_cache

    try:
        sf = get_salesforce()
        if sf:
            result = sf.query(
                "SELECT Id, Name, StageName, Amount, CloseDate, OwnerId "
                "FROM Opportunity WHERE IsClosed = false LIMIT 500"
            )
            records = result.get("records", [])
            _refresh_opp_cache(records)
            logger.info(f"Lazy-loaded {len(records)} opportunities into entity resolution cache")
            return _opp_cache
    except Exception as e:
        logger.warning(f"Failed to lazy-load opp cache: {e}")

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
    Extracts: opportunity reference, action type, details, amount, close date.
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


# Google OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv('GOOGLE_CLIENT_ID')
GOOGLE_CLIENT_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')
GOOGLE_REDIRECT_URI = os.getenv('GOOGLE_REDIRECT_URI', 'http://localhost:8000/auth/google/callback')
# FRONTEND_URL already defined above (line 48) - don't redefine it here
if not FRONTEND_URL:  # If not set for CORS, set default for OAuth
    FRONTEND_URL = 'http://localhost:3000'
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_HOURS = 24 * 30  # 30 days

oauth = OAuth()
oauth.register(
    name='google',
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET,
    server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
    client_kwargs={
        'scope': 'openid email profile https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/drive.readonly',
        'access_type': 'offline',
        'prompt': 'consent',
    }
)

# In-memory Google token store: email -> { access_token, refresh_token, expires_at }
_google_tokens: Dict[str, Dict] = {}

# Cached Slack workspace info (populated once at first /auth/me call)
_slack_workspace_info: Optional[Dict[str, str]] = None  # {team, user, ok}

# Automation Review — human-in-the-loop CRM update queue (ported from main.py)
_automation_queue: Dict[str, Dict[str, Any]] = {}

# Module-level opportunity cache for entity resolution
_opp_cache: List[Dict[str, Any]] = []
_opp_cache_loaded: bool = False

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
async def debug_config(request: Request):
    """Debug endpoint — requires auth in production; disabled when FRONTEND_URL indicates prod."""
    if IS_PRODUCTION:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")
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
    return await oauth.google.authorize_redirect(
        request, redirect_uri,
        access_type='offline',
        prompt='consent',
    )

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
        
        email = user_info['email']
        
        # Access allowlist: if ALLOWED_EMAILS is set, reject users not in the list
        allowed_emails_raw = os.getenv('ALLOWED_EMAILS', '').strip()
        if allowed_emails_raw:
            allowed = {e.strip().lower() for e in allowed_emails_raw.split(',') if e.strip()}
            if allowed and email.lower() not in allowed:
                logger.warning(f"Rejected login: {email} not in ALLOWED_EMAILS")
                return RedirectResponse(url=f"{FRONTEND_URL}/login?error=access_denied")
        
        # Store Google tokens for Gmail/Calendar/Drive API access
        google_token_data = {
            'access_token': token.get('access_token'),
            'refresh_token': token.get('refresh_token'),
            'expires_at': token.get('expires_at'),
            'token_type': token.get('token_type', 'Bearer'),
        }
        _google_tokens[email] = google_token_data
        logger.info(f"Stored Google tokens for {email} (has refresh: {bool(token.get('refresh_token'))}, token keys: {list(token.keys())})")
        
        # Create JWT token with user data
        access_token = create_access_token({
            "email": user_info['email'],
            "name": user_info.get('name', ''),
            "picture": user_info.get('picture', ''),
            "sub": user_info['sub']
        })
        
        # Set cookies: JWT for auth + encrypted Google tokens for persistence
        response = RedirectResponse(url=f"{FRONTEND_URL}/overview")
        response.set_cookie(
            key="access_token",
            value=access_token,
            httponly=True,
            max_age=3600 * 24 * 30,  # 30 days
            samesite="none" if IS_PRODUCTION else "lax",
            secure=IS_PRODUCTION
        )
        # Persist Google API tokens in encrypted cookie (survives server restarts)
        encrypted_google = encrypt_sf_tokens(google_token_data)
        response.set_cookie(
            key="google_tokens",
            value=encrypted_google,
            httponly=True,
            max_age=3600 * 24 * 30,  # 30 days (refresh token handles expiry)
            samesite="none" if IS_PRODUCTION else "lax",
            secure=IS_PRODUCTION
        )
        
        return response
        
    except Exception as e:
        print(f"OAuth callback error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=auth_failed")

# ============================================================================
# SALESFORCE OAUTH - Per-user authentication
# ============================================================================
def _get_sf_callback_uri(request: Request = None) -> str:
    """Build SF OAuth callback URI pointing to the BACKEND /callback endpoint.
    Salesforce Connected App must have ALL these as Callback URLs:
      - http://localhost:8000/callback  (local dev)
      - https://financial-forecasting-api-es4rf2cguq-uc.a.run.app/callback (production)
    """
    if IS_PRODUCTION:
        return os.getenv('GOOGLE_REDIRECT_URI', '').replace('/auth/google/callback', '/callback')
    return 'http://localhost:8000/callback'

@app.get("/auth/salesforce")
async def auth_salesforce(request: Request):
    """Initiate Salesforce OAuth flow. User must already be logged in via Google."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Login with Google first")
    
    sf_domain = SALESFORCE_CONFIG.get('DOMAIN', 'login')
    client_id = SALESFORCE_CONFIG['CLIENT_ID']
    redirect_uri = _get_sf_callback_uri(request)
    
    auth_url = (
        f"https://{sf_domain}.salesforce.com/services/oauth2/authorize?"
        f"response_type=code&"
        f"client_id={client_id}&"
        f"redirect_uri={quote(redirect_uri, safe='')}"
    )
    logger.info(f"SF OAuth redirect to: {auth_url}")
    logger.info(f"SF OAuth redirect_uri param: {redirect_uri}")
    
    return RedirectResponse(url=auth_url)

@app.get("/callback")
async def auth_salesforce_callback(request: Request, code: str = None, error: str = None):
    """Handle Salesforce OAuth callback — exchange code for tokens."""
    if error:
        return RedirectResponse(url=f"{FRONTEND_URL}/settings?sf_error={error}")
    
    if not code:
        return RedirectResponse(url=f"{FRONTEND_URL}/settings?sf_error=no_code")
    
    # Verify user is logged in
    user = await get_current_user(request)
    if not user:
        return RedirectResponse(url=f"{FRONTEND_URL}/login?error=not_authenticated")
    
    sf_domain = SALESFORCE_CONFIG.get('DOMAIN', 'login')
    token_url = f"https://{sf_domain}.salesforce.com/services/oauth2/token"
    redirect_uri = _get_sf_callback_uri(request)
    
    try:
        # Exchange authorization code for tokens
        async with httpx.AsyncClient() as client:
            resp = await client.post(token_url, data={
                "grant_type": "authorization_code",
                "code": code,
                "client_id": SALESFORCE_CONFIG['CLIENT_ID'],
                "client_secret": SALESFORCE_CONFIG['CLIENT_SECRET'],
                "redirect_uri": redirect_uri,
            })
        
        if resp.status_code != 200:
            logger.error(f"SF token exchange failed: {resp.status_code} {resp.text}")
            return RedirectResponse(url=f"{FRONTEND_URL}/settings?sf_error=token_exchange_failed")
        
        token_data = resp.json()
        
        # Extract user ID from the identity URL
        # e.g. "https://login.salesforce.com/id/00D.../005..."
        identity_url = token_data.get("id", "")
        sf_user_id = identity_url.split("/")[-1] if identity_url else None
        
        # Get the user's name from Salesforce
        sf_user_name = None
        if sf_user_id:
            validate_salesforce_id(sf_user_id, "sf_user_id")
            try:
                instance = token_data["instance_url"].replace("https://", "")
                temp_sf = Salesforce(instance=instance, session_id=token_data["access_token"])
                sf_user_info = temp_sf.query(f"SELECT Name, Email FROM User WHERE Id = '{sf_user_id}'")
                if sf_user_info.get("records"):
                    sf_user_name = sf_user_info["records"][0].get("Name")
            except Exception as e:
                logger.warning(f"Could not fetch SF user name: {e}")
        
        # Encrypt tokens for secure cookie storage
        sf_tokens = {
            "access_token": token_data["access_token"],
            "refresh_token": token_data.get("refresh_token"),
            "instance_url": token_data["instance_url"],
            "user_id": sf_user_id,
            "user_name": sf_user_name,
            "issued_at": token_data.get("issued_at"),
        }
        encrypted_tokens = encrypt_sf_tokens(sf_tokens)
        
        # Redirect back to settings with success
        response = RedirectResponse(url=f"{FRONTEND_URL}/settings?sf_connected=true")
        response.set_cookie(
            key="sf_tokens",
            value=encrypted_tokens,
            httponly=True,
            max_age=3600 * 24 * 30,  # 30 days (refresh token handles expiry)
            samesite="none" if IS_PRODUCTION else "lax",
            secure=IS_PRODUCTION
        )
        
        logger.info(f"Salesforce connected for user {user.get('email')} -> SF:{sf_user_name} ({sf_user_id})")
        return response
        
    except Exception as e:
        logger.error(f"Salesforce OAuth error: {e}")
        return RedirectResponse(url=f"{FRONTEND_URL}/settings?sf_error=exception")

@app.get("/auth/salesforce/status")
async def salesforce_status(request: Request):
    """Check the current user's Salesforce connection status."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    sf_cookie = request.cookies.get("sf_tokens")
    if not sf_cookie:
        return {
            "connected": False,
            "message": "Salesforce not connected"
        }
    
    tokens = decrypt_sf_tokens(sf_cookie)
    if not tokens:
        return {
            "connected": False,
            "message": "Invalid token data"
        }
    
    # Verify the connection actually works
    try:
        instance = tokens["instance_url"].replace("https://", "").replace("http://", "")
        test_sf = Salesforce(instance=instance, session_id=tokens["access_token"])
        test_sf.query("SELECT Id FROM User LIMIT 1")
        
        return {
            "connected": True,
            "user_id": tokens.get("user_id"),
            "user_name": tokens.get("user_name"),
            "instance_url": tokens.get("instance_url"),
        }
    except Exception as e:
        # Try to refresh the token
        refresh_token = tokens.get("refresh_token")
        if refresh_token:
            new_tokens = await refresh_sf_token(refresh_token)
            if new_tokens:
                new_tokens["user_name"] = tokens.get("user_name")
                return {
                    "connected": True,
                    "user_id": new_tokens.get("user_id"),
                    "user_name": new_tokens.get("user_name"),
                    "instance_url": new_tokens.get("instance_url"),
                    "refreshed": True,
                }
        
        return {
            "connected": False,
            "message": f"Connection expired: {str(e)}",
            "needs_reconnect": True,
        }

@app.post("/auth/salesforce/disconnect")
async def disconnect_salesforce(request: Request, response: Response):
    """Disconnect Salesforce for the current user."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Remove token cookie
    response.delete_cookie(
        "sf_tokens",
        samesite="none" if IS_PRODUCTION else "lax",
        secure=IS_PRODUCTION
    )
    
    # Remove cached client
    sf_cookie = request.cookies.get("sf_tokens")
    if sf_cookie:
        tokens = decrypt_sf_tokens(sf_cookie)
        if tokens and tokens.get("user_id"):
            _user_sf_clients.pop(tokens["user_id"], None)
    
    return {"message": "Salesforce disconnected"}

# ============================================================================
# COMMON AUTH ENDPOINTS
# ============================================================================

@app.get("/auth/me")
async def get_me(request: Request):
    """Get current authenticated user, including their Salesforce connection status."""
    user = await get_current_user(request)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if user has a per-user Salesforce connection
    sf_cookie = request.cookies.get("sf_tokens")
    if sf_cookie:
        tokens = decrypt_sf_tokens(sf_cookie)
        if tokens:
            user["salesforce_connected"] = True
            user["salesforce_user_id"] = tokens.get("user_id")
            user["salesforce_user_name"] = tokens.get("user_name")
        else:
            user["salesforce_connected"] = False
            user["salesforce_user_id"] = None
            user["salesforce_user_name"] = None
    else:
        user["salesforce_connected"] = False
        # Fallback: check email mapping against service account
        email = user.get("email")
        if email:
            sf_user = get_sf_user_by_email(email)
            user["salesforce_user_id"] = sf_user['Id'] if sf_user else None
            user["salesforce_user_name"] = sf_user['Name'] if sf_user else None
        else:
            user["salesforce_user_id"] = None
            user["salesforce_user_name"] = None

    # Google Calendar — connected if user has valid google_tokens
    email = user.get("email")
    google_tokens = _google_tokens.get(email) if email else None
    google_cookie = request.cookies.get("google_tokens") if not google_tokens else None
    user["google_connected"] = bool(
        (google_tokens and google_tokens.get("access_token"))
        or (google_cookie and decrypt_sf_tokens(google_cookie))
    )
    user["google_email"] = email

    # Slack — bot-level, not per-user
    ws_info = _get_slack_workspace_info()
    user["slack_configured"] = ws_info is not None
    user["slack_workspace"] = ws_info.get("team") if ws_info else None

    # PBD calendar ID
    user["calendar_pbd_id"] = PBD_CALENDAR_ID

    return user

@app.post("/api/cache/clear")
async def clear_cache():
    """Clear all server-side caches. Useful after bulk imports or manual changes."""
    cache.clear()
    global _sf_user_map_loaded
    _sf_user_map_loaded = False
    return {"message": "All caches cleared"}

@app.post("/auth/logout")
async def logout(response: Response):
    """Logout user by clearing all auth cookies."""
    response.delete_cookie(
        "access_token",
        samesite="none" if IS_PRODUCTION else "lax",
        secure=IS_PRODUCTION
    )
    response.delete_cookie(
        "sf_tokens",
        samesite="none" if IS_PRODUCTION else "lax",
        secure=IS_PRODUCTION
    )
    response.delete_cookie(
        "google_tokens",
        samesite="none" if IS_PRODUCTION else "lax",
        secure=IS_PRODUCTION
    )
    return {"message": "Logged out successfully"}

@app.get("/health/services")
async def services_health():
    results = {}
    
    # Check Salesforce
    try:
        sf = get_salesforce()
        sf.query("SELECT Id FROM Account LIMIT 1")
        results["salesforce"] = {
            "status": "healthy",
            "authenticated": True,
            "instance": sf.sf_instance
        }
    except Exception as e:
        results["salesforce"] = {
            "status": "error",
            "authenticated": False,
            "error": str(e)
        }
    
    # Check Sage Intacct
    try:
        import sys
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
        
        if not all(sage_config.values()):
            results["intacct"] = {
                "status": "error",
                "authenticated": False,
                "error": "Sage Intacct credentials not configured"
            }
        else:
            sage = SageIntacctService(sage_config)
            test_xml = '''<function controlid="health-check">
                <readByQuery>
                    <object>GLACCOUNT</object>
                    <query></query>
                    <fields>ACCOUNTNO</fields>
                    <pagesize>1</pagesize>
                </readByQuery>
            </function>'''
            response = sage._make_api_request(test_xml)
            if response.get('success'):
                results["intacct"] = {
                    "status": "healthy",
                    "authenticated": True
                }
            else:
                results["intacct"] = {
                    "status": "error",
                    "authenticated": False,
                    "error": "API request failed"
                }
    except Exception as e:
        results["intacct"] = {
            "status": "error",
            "authenticated": False,
            "error": str(e)
        }
    
    return results

# Salesforce - Opportunities
@app.get("/api/salesforce/opportunities")
async def get_opportunities(
    stage: Optional[str] = None,
    record_type: Optional[str] = Query(None, description="Filter by Record Type (e.g., 'Philanthropy')"),
    opp_type: Optional[str] = Query(None, description="Filter by Opportunity Type (e.g., 'PBC')"),
    active_only: Optional[bool] = Query(None, description="Filter by Active_Opportunity__c")
):
    """Get ALL Salesforce opportunities with optional filters. Cached for 5 min."""
    try:
        # Build cache key from filters
        cache_key = f"opps:{stage}:{record_type}:{opp_type}:{active_only}"
        cached = cache.get(cache_key)
        if cached is not None:
            logger.info(f"Cache HIT for {cache_key} ({len(cached)} records)")
            return cached
        
        sf = get_salesforce()
        
        # Salesforce has a 2000 record limit per query, so we use query_all to get everything
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
        
        # Build WHERE clause with filters
        where_clauses = []
        
        if stage:
            where_clauses.append(f"StageName = '{escape_soql_string(stage)}'")

        if record_type:
            where_clauses.append(f"RecordType.Name = '{escape_soql_string(record_type)}'")

        if opp_type:
            where_clauses.append(f"Type = '{escape_soql_string(opp_type)}'")

        
        if active_only is not None:
            where_clauses.append(f"Active_Opportunity__c = {str(active_only).lower()}")
        
        if where_clauses:
            query += " WHERE " + " AND ".join(where_clauses)
        
        query += " ORDER BY CloseDate DESC"
        
        # Use query_all to automatically handle pagination and get ALL records
        result = sf.query_all(query)
        records = result.get("records", [])
        
        # Cache the result
        cache.set(cache_key, records, CACHE_TTL_OPPORTUNITIES)
        logger.info(f"Cache MISS for {cache_key} - fetched {len(records)} records")
        
        return records
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/salesforce/opportunities/stage-history")
async def get_stage_history(days: int = Query(30, ge=1, le=365)):
    """Get StageName changes from OpportunityFieldHistory within the given window."""
    cache_key = f"stage_history:{days}"
    try:
        cached = cache.get(cache_key)
        if cached is not None:
            return cached

        sf = get_salesforce()
        query = f"""
        SELECT OpportunityId, Opportunity.Name, Opportunity.Amount,
               Opportunity.StageName, OldValue, NewValue, CreatedDate
        FROM OpportunityFieldHistory
        WHERE Field = 'StageName'
          AND CreatedDate = LAST_N_DAYS:{days}
        ORDER BY CreatedDate DESC
        """
        result = sf.query_all(query)
        records = result.get("records", [])

        formatted = []
        for r in records:
            opp = r.get("Opportunity") or {}
            formatted.append({
                "OpportunityId": r.get("OpportunityId"),
                "OpportunityName": opp.get("Name"),
                "Amount": opp.get("Amount") or 0,
                "CurrentStage": opp.get("StageName"),
                "OldValue": r.get("OldValue"),
                "NewValue": r.get("NewValue"),
                "CreatedDate": r.get("CreatedDate"),
            })

        cache.set(cache_key, formatted, CACHE_TTL_STAGE_HISTORY)
        return formatted
    except Exception as e:
        logger.warning(f"OpportunityFieldHistory query failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/pipeline-analysis")
async def ai_pipeline_analysis(payload: Dict[str, Any] = Body(...)):
    """On-demand AI analysis of pipeline stage changes and funnel health."""
    if not ANTHROPIC_API_KEY:
        raise HTTPException(status_code=503, detail="AI analysis not configured (missing ANTHROPIC_API_KEY)")

    days = payload.get("days", 30)
    if not isinstance(days, int) or days < 1 or days > 365:
        raise HTTPException(status_code=400, detail="days must be an integer between 1 and 365")

    try:
        import anthropic
        sf = get_salesforce()

        history_query = f"""
        SELECT OpportunityId, Opportunity.Name, Opportunity.Amount,
               Opportunity.StageName, OldValue, NewValue, CreatedDate
        FROM OpportunityFieldHistory
        WHERE Field = 'StageName'
          AND CreatedDate = LAST_N_DAYS:{days}
        ORDER BY CreatedDate DESC
        """
        history_result = sf.query_all(history_query)
        changes = history_result.get("records", [])

        snapshot_query = """
        SELECT StageName, COUNT(Id) cnt, SUM(Amount) total
        FROM Opportunity
        WHERE IsClosed = false
        GROUP BY StageName
        ORDER BY StageName
        """
        snapshot_result = sf.query_all(snapshot_query)
        stage_snapshot = [
            {"stage": r["StageName"], "count": r["cnt"], "totalAmount": r.get("total") or 0}
            for r in snapshot_result.get("records", [])
        ]

        formatted_changes = []
        for r in changes:
            opp = r.get("Opportunity") or {}
            formatted_changes.append({
                "opportunity": opp.get("Name"),
                "amount": opp.get("Amount") or 0,
                "from": r.get("OldValue"),
                "to": r.get("NewValue"),
                "date": r.get("CreatedDate"),
            })

        prompt = f"""You are a pipeline analyst for a nonprofit fundraising team managing grant opportunities.

CURRENT PIPELINE SNAPSHOT (open opportunities by stage):
{json.dumps(stage_snapshot, indent=1)}

STAGE CHANGES IN THE LAST {days} DAYS ({len(formatted_changes)} total):
{json.dumps(formatted_changes[:50], default=str, indent=1)}

Analyze the pipeline health in 3-5 concise bullet points covering:
- Pipeline velocity: Are opportunities moving forward through stages?
- Stagnation risk: Any stages with many opps but little movement?
- Stage conversion: Which transitions are happening most/least?
- Actionable recommendations: What should the team focus on?

Be specific — reference actual stage names, counts, and dollar amounts. Keep each bullet to 1-2 sentences. Use plain text, no markdown formatting."""

        client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=1000,
            messages=[{"role": "user", "content": prompt}],
        )
        analysis_text = response.content[0].text.strip()

        return {
            "analysis": analysis_text,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "changes_count": len(formatted_changes),
            "days": days,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"AI pipeline analysis failed: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Salesforce - Create Opportunity
@app.post("/api/salesforce/opportunities")
async def create_opportunity(opportunity_data: Dict[str, Any], request: Request = None):
    """Create a new Salesforce opportunity. Uses per-user SF connection when available."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        
        # Create the opportunity
        result = sf.Opportunity.create(opportunity_data)
        
        if result.get('success'):
            cache.invalidate_prefix("opps:")  # Clear opps cache
            cache.invalidate_prefix("stage_history")  # Stage history may change
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

# IMPORTANT: Bulk update must come BEFORE the {opportunity_id} route
@app.put("/api/salesforce/opportunities/bulk-update")
async def bulk_update_opportunities(body: dict, request: Request = None):
    """Bulk update multiple Salesforce opportunities at once. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        
        opp_ids = body.get('opportunity_ids', [])
        updates = body.get('updates', {})
        
        if not opp_ids or not updates:
            raise HTTPException(status_code=400, detail="Missing opportunity_ids or updates")
        
        # Update all opportunities
        success_count = 0
        failed_ids = []
        
        for opp_id in opp_ids:
            try:
                result = sf.Opportunity.update(opp_id, updates)
                if result == 204:  # Success
                    success_count += 1
                else:
                    failed_ids.append(opp_id)
            except Exception as e:
                print(f"Failed to update opportunity {opp_id}: {e}")
                failed_ids.append(opp_id)
        
        cache.invalidate_prefix("opps:")  # Clear opps cache
        cache.invalidate_prefix("stage_history")  # Stage history may change

        return {
            "success": True,
            "total": len(opp_ids),
            "success_count": success_count,
            "failed_count": len(failed_ids),
            "failed_ids": failed_ids
        }
            
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/salesforce/opportunities/{opportunity_id}")
async def update_opportunity(opportunity_id: str, update_request: OpportunityUpdate, request: Request = None):
    """Update a Salesforce opportunity. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        
        # Only send the updates to Salesforce (user_id and reason are just for logging)
        # Don't send them to Salesforce as they're not real fields
        updates_to_send = update_request.updates
        
        # Update the opportunity
        sobject = sf.Opportunity
        result = sobject.update(opportunity_id, updates_to_send)
        
        if result == 204:  # Success code
            cache.invalidate_prefix("opps:")  # Clear opps cache
            cache.invalidate_prefix("stage_history")  # Stage history may change
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
    """Get ALL Salesforce accounts. Cached for 10 min."""
    try:
        cached = cache.get("accounts")
        if cached is not None:
            logger.info(f"Cache HIT for accounts ({cached['count']} records)")
            return cached
        
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
        
        response_data = {
            "success": True,
            "count": len(formatted_accounts),
            "accounts": formatted_accounts
        }
        cache.set("accounts", response_data, CACHE_TTL_ACCOUNTS)
        logger.info(f"Cache MISS for accounts - fetched {len(formatted_accounts)} records")
        return response_data
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Salesforce - Tasks (linked to Opportunities)
@app.get("/api/salesforce/opportunities/{opportunity_id}/tasks")
async def get_opportunity_tasks(opportunity_id: str):
    """Get all tasks for a specific opportunity."""
    try:
        sf = get_salesforce()
        
        query = f"""
        SELECT Id, Subject, Status, Priority, ActivityDate, Description,
               OwnerId, Owner.Name, CreatedDate, LastModifiedDate, Type, TaskSubtype
        FROM Task
        WHERE WhatId = '{opportunity_id}'
        ORDER BY ActivityDate DESC NULLS LAST, CreatedDate DESC
        """
        
        result = sf.query_all(query)
        tasks = result.get("records", [])
        
        formatted_tasks = []
        for task in tasks:
            formatted_tasks.append({
                "Id": task.get("Id"),
                "Subject": task.get("Subject"),
                "Status": task.get("Status"),
                "Priority": task.get("Priority"),
                "ActivityDate": task.get("ActivityDate"),
                "Description": task.get("Description"),
                "OwnerId": task.get("OwnerId"),
                "OwnerName": task.get("Owner", {}).get("Name") if task.get("Owner") else None,
                "CreatedDate": task.get("CreatedDate"),
                "LastModifiedDate": task.get("LastModifiedDate"),
                "Type": task.get("Type"),
                "TaskSubtype": task.get("TaskSubtype"),
            })
        
        return {
            "success": True,
            "count": len(formatted_tasks),
            "tasks": formatted_tasks
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/salesforce/opportunities/{opportunity_id}/tasks")
async def create_opportunity_task(opportunity_id: str, task_data: dict, request: Request = None):
    """Create a new task linked to an opportunity. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        
        # Build task record
        task_record = {
            "WhatId": opportunity_id,
            "Subject": task_data.get("Subject", "New Task"),
            "Status": task_data.get("Status", "Not Started"),
            "Priority": task_data.get("Priority", "Normal"),
        }
        
        if task_data.get("ActivityDate"):
            task_record["ActivityDate"] = task_data["ActivityDate"]
        if task_data.get("Description"):
            task_record["Description"] = task_data["Description"]
        if task_data.get("OwnerId"):
            task_record["OwnerId"] = task_data["OwnerId"]
        elif request:
            # Default task owner to logged-in user's Salesforce identity
            sf_user_id = get_sf_user_id_from_request(request)
            if sf_user_id:
                task_record["OwnerId"] = sf_user_id
        
        result = sf.Task.create(task_record)
        
        if result.get("success"):
            return {
                "success": True,
                "id": result["id"],
                "message": "Task created successfully"
            }
        else:
            raise HTTPException(status_code=400, detail="Failed to create task")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.put("/api/salesforce/tasks/{task_id}")
async def update_task(task_id: str, task_data: dict, request: Request = None):
    """Update an existing task. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        
        updates = {}
        allowed_fields = ["Subject", "Status", "Priority", "ActivityDate", "Description", "OwnerId"]
        for field in allowed_fields:
            if field in task_data:
                updates[field] = task_data[field]
        
        if not updates:
            raise HTTPException(status_code=400, detail="No valid fields to update")
        
        result = sf.Task.update(task_id, updates)
        
        if result == 204:
            return {"success": True, "message": "Task updated successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to update task")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.delete("/api/salesforce/tasks/{task_id}")
async def delete_task(task_id: str, request: Request = None):
    """Delete a task. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        result = sf.Task.delete(task_id)
        
        if result == 204:
            return {"success": True, "message": "Task deleted successfully"}
        else:
            raise HTTPException(status_code=400, detail="Failed to delete task")
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/salesforce/my-tasks")
async def get_my_tasks(
    start: Optional[str] = Query(None, description="Start date (YYYY-MM-DD)"),
    end: Optional[str] = Query(None, description="End date (YYYY-MM-DD)"),
    limit: int = Query(200, le=500),
):
    """Get Salesforce Tasks linked to Opportunities, in date range. Used by Priorities page."""
    try:
        if start and not _re.match(r"^\d{4}-\d{2}-\d{2}$", start):
            raise HTTPException(status_code=400, detail="start must be YYYY-MM-DD")
        if end and not _re.match(r"^\d{4}-\d{2}-\d{2}$", end):
            raise HTTPException(status_code=400, detail="end must be YYYY-MM-DD")
        # Default range when omitted: 90 days back, 180 days forward
        today = date.today()
        if not start:
            start = str(today - timedelta(days=90))
        if not end:
            end = str(today + timedelta(days=180))
        if start > end:
            raise HTTPException(status_code=400, detail="start must be before or equal to end")
        sf = get_salesforce()
        where_clauses = ["IsClosed = false", "WhatId != null"]
        where_clauses.append(f"ActivityDate >= {start}")
        where_clauses.append(f"ActivityDate <= {end}")
        where_sql = " AND ".join(where_clauses)
        query = f"""
        SELECT Id, Subject, Status, Priority, ActivityDate, Description, WhatId,
               OwnerId, Owner.Name, CreatedDate, LastModifiedDate
        FROM Task
        WHERE {where_sql}
        ORDER BY ActivityDate ASC NULLS LAST, CreatedDate DESC
        LIMIT {limit}
        """
        result = sf.query_all(query)
        records = result.get("records", [])
        formatted = []
        for task in records:
            formatted.append({
                "Id": task.get("Id"),
                "Subject": task.get("Subject"),
                "Status": task.get("Status"),
                "Priority": task.get("Priority"),
                "ActivityDate": task.get("ActivityDate"),
                "Description": task.get("Description"),
                "WhatId": task.get("WhatId"),
                "OwnerId": task.get("OwnerId"),
                "Owner": {"Name": task.get("Owner", {}).get("Name")} if task.get("Owner") else None,
                "OwnerName": task.get("Owner", {}).get("Name") if task.get("Owner") else None,
                "CreatedDate": task.get("CreatedDate"),
                "LastModifiedDate": task.get("LastModifiedDate"),
            })
        return {"data": formatted, "meta": {"count": len(formatted)}}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching my-tasks: {e}")
        raise HTTPException(status_code=500, detail=str(e))


# Salesforce - Users
@app.get("/api/salesforce/users")
async def get_users(limit: int = 1000):
    """Get Salesforce users for autocomplete. Cached for 15 min."""
    try:
        cache_key = f"users:{limit}"
        cached = cache.get(cache_key)
        if cached is not None:
            logger.info(f"Cache HIT for {cache_key}")
            return cached
        
        sf = get_salesforce()
        
        query = f"""
        SELECT Id, Name, Email, Username, IsActive
        FROM User
        WHERE IsActive = true
        ORDER BY Name ASC
        LIMIT {limit}
        """
        
        result = sf.query(query)
        records = result.get("records", [])
        cache.set(cache_key, records, CACHE_TTL_USERS)
        logger.info(f"Cache MISS for {cache_key} - fetched {len(records)} records")
        return records
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# Salesforce - Contacts
@app.get("/api/salesforce/contacts")
async def get_contacts(account_id: Optional[str] = None):
    """Get ALL Salesforce contacts, optionally filtered by account. Cached for 10 min."""
    try:
        cache_key = f"contacts:{account_id}"
        cached = cache.get(cache_key)
        if cached is not None:
            logger.info(f"Cache HIT for {cache_key}")
            return cached
        
        sf = get_salesforce()
        
        # Query with Primary Affiliation (the organization/company where they work)
        query = """
        SELECT Id, FirstName, LastName, Name, AccountId, Account.Name, Title, Email, Phone,
               npsp__Primary_Affiliation__c, npsp__Primary_Affiliation__r.Name,
               CreatedDate, LastModifiedDate
        FROM Contact
        """
        if account_id:
            validate_salesforce_id(account_id, "account_id")
            # Include contacts where account is either household OR primary affiliation
            query += f" WHERE (AccountId = '{account_id}' OR npsp__Primary_Affiliation__c = '{account_id}')"
        query += " ORDER BY LastName ASC"
        
        # Use query_all to get ALL records (handles Salesforce's 2000 record pagination automatically)
        result = sf.query_all(query)
        records = result.get("records", [])
        cache.set(cache_key, records, CACHE_TTL_ACCOUNTS)  # 10 min
        logger.info(f"Cache MISS for {cache_key} - fetched {len(records)} records")
        return records
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
async def create_account(account_data: Dict[str, Any], request: Request = None):
    """Create a new Salesforce account. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        result = sf.Account.create(account_data)
        if result.get('success'):
            cache.invalidate("accounts")  # Clear accounts cache
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
async def create_contact(contact_data: Dict[str, Any], request: Request = None):
    """Create a new Salesforce contact. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        result = sf.Contact.create(contact_data)
        if result.get('success'):
            cache.invalidate_prefix("contacts:")  # Clear contacts cache
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
        
        _closed_values = {s.value for s in CLOSED_STAGES}
        open_opps = [opp for opp in opportunities
                     if opp.get('StageName', '') not in _closed_values]
        
        weighted_pipeline = sum(
            float(opp.get('Amount') or 0) * (float(opp.get('Probability') or 0) / 100)
            for opp in open_opps
        )
        
        closed_won = [opp for opp in opportunities
                      if opp.get('StageName', '') in (
                          OpportunityStage.CLOSED_COMPLETED.value,
                          OpportunityStage.COLLECTING.value)]
        
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


@app.get("/api/slack/channel-messages/{channel_name}")
async def get_slack_channel_messages(channel_name: str, limit: int = 50):
    """Fetch recent messages from a named Slack channel."""
    try:
        slack = get_slack()

        # Find the channel by name
        channels_response = slack.conversations_list(
            types="public_channel", exclude_archived=True, limit=200
        )
        if not channels_response["ok"]:
            raise HTTPException(status_code=500, detail="Failed to list channels")

        target_channel = None
        # Strip leading # if present
        clean_name = channel_name.lstrip("#")
        for ch in channels_response.get("channels", []):
            if ch["name"] == clean_name:
                target_channel = ch
                break

        if not target_channel:
            raise HTTPException(
                status_code=404,
                detail=f"Channel #{clean_name} not found or bot is not a member",
            )

        channel_id = target_channel["id"]

        # Fetch message history
        history = slack.conversations_history(channel=channel_id, limit=limit)
        if not history["ok"]:
            raise HTTPException(status_code=500, detail="Failed to fetch channel history")

        # Build a user cache for name resolution
        user_cache: Dict[str, str] = {}
        try:
            users_resp = slack.users_list(limit=200)
            if users_resp["ok"]:
                for u in users_resp.get("members", []):
                    user_cache[u["id"]] = u.get("real_name") or u.get("name", u["id"])
        except Exception:
            pass

        messages = []
        for msg in history.get("messages", []):
            uid = msg.get("user", "")
            ts = msg.get("ts", "")
            messages.append(
                {
                    "text": msg.get("text", ""),
                    "user_name": user_cache.get(uid, uid),
                    "user_id": uid,
                    "timestamp": ts,
                    "permalink": f"https://slack.com/archives/{channel_id}/p{ts.replace('.', '')}"
                    if ts
                    else "",
                    "thread_ts": msg.get("thread_ts"),
                }
            )

        return {"channel": clean_name, "messages": messages, "total": len(messages)}

    except HTTPException:
        raise
    except SlackApiError as e:
        if e.response["error"] == "ratelimited":
            raise HTTPException(
                status_code=429, detail="Slack rate limit exceeded. Try again later."
            )
        raise HTTPException(
            status_code=500, detail=f"Slack API error: {e.response['error']}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/slack/pipeline-updates")
async def get_slack_pipeline_updates(limit: int = 50):
    """Dedicated endpoint for #pipeline-updates channel messages (cached 60s)."""
    cache_key = f"slack:pipeline-updates:{limit}"
    cached = cache.get(cache_key)
    if cached is not None:
        return cached

    try:
        slack = get_slack()

        # Find the pipeline-updates channel
        channels_response = slack.conversations_list(
            types="public_channel", exclude_archived=True, limit=200
        )
        if not channels_response["ok"]:
            raise HTTPException(status_code=500, detail="Failed to list channels")

        target_channel = None
        for ch in channels_response.get("channels", []):
            if ch["name"] == SLACK_PIPELINE_CHANNEL:
                target_channel = ch
                break

        if not target_channel:
            return {
                "channel": SLACK_PIPELINE_CHANNEL,
                "messages": [],
                "total": 0,
                "error": f"Channel #{SLACK_PIPELINE_CHANNEL} not found",
            }

        channel_id = target_channel["id"]
        history = slack.conversations_history(channel=channel_id, limit=limit)
        if not history["ok"]:
            raise HTTPException(status_code=500, detail="Failed to fetch channel history")

        # Resolve user names
        user_cache: Dict[str, str] = {}
        try:
            users_resp = slack.users_list(limit=200)
            if users_resp["ok"]:
                for u in users_resp.get("members", []):
                    user_cache[u["id"]] = u.get("real_name") or u.get("name", u["id"])
        except Exception:
            pass

        messages = []
        for msg in history.get("messages", []):
            uid = msg.get("user", "")
            ts = msg.get("ts", "")
            messages.append(
                {
                    "text": msg.get("text", ""),
                    "user_name": user_cache.get(uid, uid),
                    "user_id": uid,
                    "timestamp": ts,
                    "permalink": f"https://slack.com/archives/{channel_id}/p{ts.replace('.', '')}"
                    if ts
                    else "",
                    "thread_ts": msg.get("thread_ts"),
                }
            )

        result = {
            "channel": SLACK_PIPELINE_CHANNEL,
            "messages": messages,
            "total": len(messages),
        }
        cache.set(cache_key, result, ttl_seconds=60)
        return result

    except HTTPException:
        raise
    except SlackApiError as e:
        if e.response["error"] == "ratelimited":
            raise HTTPException(
                status_code=429, detail="Slack rate limit exceeded. Try again later."
            )
        raise HTTPException(
            status_code=500, detail=f"Slack API error: {e.response['error']}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ============================================================================
# Automation Review — Slack webhook + human-in-the-loop CRM queue
# ============================================================================

class SlackWebhookPayload(BaseModel):
    text: str
    channel: Optional[str] = "manual"
    user_name: Optional[str] = "Bedrock User"


@app.post("/api/slack/webhook")
async def slack_webhook(payload: SlackWebhookPayload):
    """Receive a CRM update message (from Slack or manual entry),
    parse it, and queue it for human review."""
    parsed = _parse_crm_message(payload.text)
    item_id = str(_uuid.uuid4())
    _automation_queue[item_id] = {
        "id": item_id,
        "source": payload.channel,
        "user_name": payload.user_name,
        "raw_text": payload.text,
        "parsed": parsed,
        "status": "pending",
        "created_at": datetime.utcnow().isoformat(),
        "reviewed_by": None,
        "reviewed_at": None,
    }
    return {"id": item_id, "parsed": parsed, "status": "pending"}


@app.get("/api/automation-review/pending")
async def get_pending_reviews():
    """Return all pending automation review items."""
    pending = [
        item for item in _automation_queue.values() if item["status"] == "pending"
    ]
    pending.sort(key=lambda x: x["created_at"], reverse=True)
    return {"items": pending, "total": len(pending)}


@app.get("/api/automation-review/all")
async def get_all_reviews():
    """Return all automation review items (pending + reviewed)."""
    items = list(_automation_queue.values())
    items.sort(key=lambda x: x["created_at"], reverse=True)
    return {"items": items, "total": len(items)}


@app.post("/api/automation-review/{item_id}/approve")
async def approve_review(item_id: str, edits: Dict[str, Any] = {}):
    """Approve an automation review item and apply the CRM change."""
    if item_id not in _automation_queue:
        raise HTTPException(status_code=404, detail="Review item not found")

    item = _automation_queue[item_id]
    if item["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Item already {item['status']}")

    # Merge any user edits into the parsed data
    if edits:
        item["parsed"].update(edits)

    item["status"] = "approved"
    item["reviewed_at"] = datetime.utcnow().isoformat()

    # TODO: Apply the actual CRM change (stage update, task creation, etc.)
    # For now, just mark as approved — the UI will show the result.

    return {"id": item_id, "status": "approved", "parsed": item["parsed"]}


@app.post("/api/automation-review/{item_id}/reject")
async def reject_review(item_id: str, body: Dict[str, Any] = {}):
    """Reject an automation review item."""
    if item_id not in _automation_queue:
        raise HTTPException(status_code=404, detail="Review item not found")

    item = _automation_queue[item_id]
    if item["status"] != "pending":
        raise HTTPException(status_code=400, detail=f"Item already {item['status']}")

    item["status"] = "rejected"
    item["reviewed_at"] = datetime.utcnow().isoformat()
    item["reject_reason"] = body.get("reason", "")

    return {"id": item_id, "status": "rejected"}


# Track which Slack message timestamps we've already ingested
_ingested_slack_ts: set = set()


@app.post("/api/automation-review/ingest-pipeline")
async def ingest_pipeline_updates(limit: int = 20):
    """Fetch new messages from #pipeline-updates and feed them through
    _parse_crm_message → _automation_queue. Deduplicates by Slack timestamp."""
    try:
        slack = get_slack()

        # Find the channel
        channels_response = slack.conversations_list(
            types="public_channel", exclude_archived=True, limit=200
        )
        if not channels_response["ok"]:
            raise HTTPException(status_code=500, detail="Failed to list channels")

        target_channel = None
        for ch in channels_response.get("channels", []):
            if ch["name"] == SLACK_PIPELINE_CHANNEL:
                target_channel = ch
                break

        if not target_channel:
            return {"ingested": 0, "error": f"Channel #{SLACK_PIPELINE_CHANNEL} not found"}

        channel_id = target_channel["id"]
        history = slack.conversations_history(channel=channel_id, limit=limit)
        if not history["ok"]:
            return {"ingested": 0, "error": "Failed to fetch channel history"}

        # Resolve user names
        user_cache_local: Dict[str, str] = {}
        try:
            users_resp = slack.users_list(limit=200)
            if users_resp["ok"]:
                for u in users_resp.get("members", []):
                    user_cache_local[u["id"]] = u.get("real_name") or u.get("name", u["id"])
        except Exception:
            pass

        ingested = 0
        for msg in history.get("messages", []):
            ts = msg.get("ts", "")
            if not ts or ts in _ingested_slack_ts:
                continue

            text = msg.get("text", "").strip()
            if not text:
                continue

            _ingested_slack_ts.add(ts)

            uid = msg.get("user", "")
            user_name = user_cache_local.get(uid, uid)
            parsed = _parse_crm_message(text)

            item_id = str(_uuid.uuid4())
            _automation_queue[item_id] = {
                "id": item_id,
                "source": f"slack:#{SLACK_PIPELINE_CHANNEL}",
                "user_name": user_name,
                "raw_text": text,
                "parsed": parsed,
                "status": "pending",
                "created_at": datetime.utcnow().isoformat(),
                "slack_ts": ts,
                "reviewed_by": None,
                "reviewed_at": None,
            }
            ingested += 1

        return {"ingested": ingested, "total_queued": len(_automation_queue)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Pipeline ingest error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


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
        escaped_account_name = escape_soql_string(account_name)
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
                "total_cached_meetings": len(fireflies_cache.get('transcripts') or []),
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
        escaped_account_name = escape_soql_string(account_name)
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
# Gmail Integration
# ============================================================================

def _get_google_credentials(email: str, request: Request = None):
    """Build google.oauth2.credentials.Credentials for a user.
    Checks in-memory cache first, then falls back to encrypted cookie.
    Proactively refreshes expired tokens if a refresh_token is available."""
    from google.oauth2.credentials import Credentials
    import google.auth.transport.requests

    tokens = _google_tokens.get(email)

    # If not in memory, try to restore from encrypted cookie
    if (not tokens or not tokens.get('access_token')) and request:
        cookie = request.cookies.get("google_tokens")
        if cookie:
            try:
                restored = decrypt_sf_tokens(cookie)  # reuse same Fernet encryption
                if restored and restored.get('access_token'):
                    tokens = restored
                    _google_tokens[email] = tokens
                    has_refresh = bool(restored.get('refresh_token'))
                    logger.info(f"Restored Google tokens from cookie for {email} (has refresh_token: {has_refresh})")
                else:
                    logger.warning(f"Google cookie decrypted but missing access_token for {email}")
            except Exception as e:
                logger.warning(f"Failed to decrypt Google tokens cookie for {email}: {e}")
        else:
            logger.info(f"No google_tokens cookie found for {email} — user needs to re-login via Google")

    if not tokens or not tokens.get('access_token'):
        logger.warning(f"No Google tokens available for {email}")
        return None

    refresh_token = tokens.get('refresh_token')
    if not refresh_token:
        logger.warning(f"No refresh_token for {email} - Google APIs will fail if access token is expired. User needs to re-login.")

    creds = Credentials(
        token=tokens['access_token'],
        refresh_token=refresh_token,
        token_uri='https://oauth2.googleapis.com/token',
        client_id=GOOGLE_CLIENT_ID,
        client_secret=GOOGLE_CLIENT_SECRET,
    )

    # Proactively refresh if the token is expired and we have a refresh token
    if creds.expired and refresh_token:
        try:
            creds.refresh(google.auth.transport.requests.Request())
            # Update stored tokens with the new access token
            tokens['access_token'] = creds.token
            _google_tokens[email] = tokens
            logger.info(f"Proactively refreshed Google access token for {email}")
        except Exception as e:
            logger.warning(f"Failed to refresh Google token for {email}: {e}")

    return creds

@app.get("/api/gmail/account-activity/{account_name}")
async def get_account_gmail_activity(account_name: str, request: Request, limit: int = 20):
    """Search Gmail for recent emails mentioning an account."""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        email = user.get('email')
        creds = _get_google_credentials(email, request)
        if not creds:
            return {
                'account_name': account_name,
                'emails': [],
                'total': 0,
                'error': 'Google tokens not available. Please re-login to grant Gmail access.',
                'needs_reauth': True,
            }

        from googleapiclient.discovery import build
        service = build('gmail', 'v1', credentials=creds)

        # Also look up account contacts from Salesforce for email-domain matching
        contact_domains = set()
        try:
            sf = get_salesforce()
            escaped = escape_soql_string(account_name)
            result = sf.query(f"SELECT Id, Website, (SELECT Email FROM Contacts) FROM Account WHERE Name = '{escaped}' LIMIT 1")
            if result['totalSize'] > 0:
                acct = result['records'][0]
                website = acct.get('Website', '') or ''
                if website:
                    domain = website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]
                    if domain:
                        contact_domains.add(domain)
                if acct.get('Contacts'):
                    for c in acct['Contacts']['records']:
                        if c.get('Email') and '@' in c['Email']:
                            contact_domains.add(c['Email'].split('@')[1].lower())
        except Exception:
            pass

        # Build Gmail search query
        search_parts = [f'"{account_name}"']
        for d in list(contact_domains)[:5]:
            search_parts.append(f'from:{d}')
            search_parts.append(f'to:{d}')
        query_str = ' OR '.join(search_parts)

        results = service.users().messages().list(
            userId='me', q=query_str, maxResults=limit
        ).execute()

        messages = results.get('messages', [])
        emails = []
        for msg_meta in messages[:limit]:
            msg = service.users().messages().get(
                userId='me', id=msg_meta['id'], format='metadata',
                metadataHeaders=['Subject', 'From', 'To', 'Date']
            ).execute()

            headers = {h['name']: h['value'] for h in msg.get('payload', {}).get('headers', [])}
            snippet = msg.get('snippet', '')

            emails.append({
                'id': msg_meta['id'],
                'threadId': msg.get('threadId'),
                'subject': headers.get('Subject', '(no subject)'),
                'from': headers.get('From', ''),
                'to': headers.get('To', ''),
                'date': headers.get('Date', ''),
                'snippet': snippet,
                'labels': msg.get('labelIds', []),
            })

        return {
            'account_name': account_name,
            'emails': emails,
            'total': len(emails),
            'query_used': query_str,
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Gmail activity error: {e}")
        if 'invalid_grant' in str(e).lower() or 'token' in str(e).lower():
            return {
                'account_name': account_name,
                'emails': [],
                'total': 0,
                'error': 'Gmail token expired. Please re-login.',
                'needs_reauth': True,
            }
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/gmail/health")
async def gmail_health_check(request: Request):
    """Check Gmail integration status for the current user."""
    user = await get_current_user(request)
    if not user:
        return {"configured": False, "message": "Not authenticated"}
    email = user.get('email')
    tokens = _google_tokens.get(email)
    return {
        "configured": bool(tokens and tokens.get('access_token')),
        "has_refresh_token": bool(tokens and tokens.get('refresh_token')),
        "user_email": email,
    }

# ============================================================================
# Google Calendar Integration
# ============================================================================

@app.get("/api/calendar/account-activity/{account_name}")
async def get_account_calendar_activity(account_name: str, request: Request, limit: int = 20):
    """Search Google Calendar for events related to an account."""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        email = user.get('email')
        creds = _get_google_credentials(email, request)
        if not creds:
            return {
                'account_name': account_name,
                'events': [],
                'total': 0,
                'error': 'Google tokens not available. Please re-login to grant Calendar access.',
                'needs_reauth': True,
            }

        from googleapiclient.discovery import build
        service = build('calendar', 'v3', credentials=creds)

        # Look up contact domains for attendee matching
        contact_emails_set = set()
        contact_domains = set()
        try:
            sf = get_salesforce()
            escaped = escape_soql_string(account_name)
            result = sf.query(f"SELECT Id, Website, (SELECT Email FROM Contacts) FROM Account WHERE Name = '{escaped}' LIMIT 1")
            if result['totalSize'] > 0:
                acct = result['records'][0]
                website = acct.get('Website', '') or ''
                if website:
                    domain = website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]
                    if domain:
                        contact_domains.add(domain.lower())
                if acct.get('Contacts'):
                    for c in acct['Contacts']['records']:
                        if c.get('Email'):
                            contact_emails_set.add(c['Email'].lower())
                            if '@' in c['Email']:
                                contact_domains.add(c['Email'].split('@')[1].lower())
        except Exception:
            pass

        # Search for events containing the account name
        account_name_lower = account_name.lower()
        account_terms = [t.lower() for t in account_name.split() if len(t) > 3]

        # Calendar API uses free-text q parameter
        now = datetime.utcnow()
        time_min = (now - timedelta(days=180)).isoformat() + 'Z'
        time_max = (now + timedelta(days=90)).isoformat() + 'Z'

        events_result = service.events().list(
            calendarId=PBD_CALENDAR_ID,
            q=account_name,
            timeMin=time_min,
            timeMax=time_max,
            maxResults=100,
            singleEvents=True,
            orderBy='startTime',
        ).execute()

        raw_events = events_result.get('items', [])
        matched_events = []

        for event in raw_events:
            match_score = 0
            match_reasons = []
            summary = (event.get('summary') or '').lower()
            description = (event.get('description') or '').lower()

            # Title match
            if account_name_lower in summary:
                match_score += 15
                match_reasons.append('title')
            elif any(t in summary for t in account_terms):
                match_score += 8
                match_reasons.append('title_partial')

            # Description match
            if account_name_lower in description:
                match_score += 10
                match_reasons.append('description')

            # Attendee match
            attendees = event.get('attendees', [])
            for att in attendees:
                att_email = (att.get('email') or '').lower()
                if att_email in contact_emails_set:
                    match_score += 20
                    match_reasons.append('contact_attendee')
                    break
                if any(att_email.endswith(d) for d in contact_domains):
                    match_score += 15
                    match_reasons.append('domain_attendee')
                    break

            if match_score >= 8:
                start = event.get('start', {})
                end = event.get('end', {})
                matched_events.append({
                    'id': event.get('id'),
                    'summary': event.get('summary', '(No title)'),
                    'description': (event.get('description') or '')[:300],
                    'start': start.get('dateTime') or start.get('date'),
                    'end': end.get('dateTime') or end.get('date'),
                    'attendees': [
                        {'email': a.get('email'), 'name': a.get('displayName'), 'status': a.get('responseStatus')}
                        for a in attendees
                    ],
                    'location': event.get('location'),
                    'htmlLink': event.get('htmlLink'),
                    'status': event.get('status'),
                    'match_score': match_score,
                    'match_reasons': match_reasons,
                    'is_past': (start.get('dateTime') or start.get('date', '')) < now.isoformat(),
                })

        matched_events.sort(key=lambda x: x.get('start') or '', reverse=True)
        matched_events = matched_events[:limit]

        return {
            'account_name': account_name,
            'events': matched_events,
            'total': len(matched_events),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Calendar activity error: {e}")
        if 'invalid_grant' in str(e).lower() or 'token' in str(e).lower():
            return {
                'account_name': account_name,
                'events': [],
                'total': 0,
                'error': 'Calendar token expired. Please re-login.',
                'needs_reauth': True,
            }
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/calendar/config")
async def get_calendar_config():
    """Return calendar configuration (PBD calendar ID and available calendars)."""
    return {
        "pbd_calendar_id": PBD_CALENDAR_ID,
        "available_calendars": [],  # Placeholder for future user calendar selection
    }


@app.get("/api/calendar/my-events")
async def get_my_calendar_events(
    request: Request,
    start: str = None,
    end: str = None,
    limit: int = 100,
    calendar_id: str = None,
):
    """Get calendar events for the current user from the PBD shared calendar only."""
    # Restrict to PBD calendar only — block personal and arbitrary calendar IDs
    if not calendar_id or calendar_id == "primary" or calendar_id != PBD_CALENDAR_ID:
        return {
            "data": [],
            "total": 0,
            "message": "Only the PBD shared calendar is supported. Use the PBD calendar ID.",
        }

    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        email = user.get("email")
        creds = _get_google_credentials(email, request)
        if not creds:
            return {
                "data": [],
                "total": 0,
                "error": "Google tokens not available. Please re-login to grant Calendar access.",
                "needs_reauth": True,
            }

        from googleapiclient.discovery import build

        loop = asyncio.get_event_loop()

        def _fetch_events():
            service = build("calendar", "v3", credentials=creds)
            params = {
                "calendarId": calendar_id,
                "maxResults": limit,
                "singleEvents": True,
                "orderBy": "startTime",
            }
            if start:
                params["timeMin"] = start if "T" in start else f"{start}T00:00:00Z"
            if end:
                params["timeMax"] = end if "T" in end else f"{end}T23:59:59Z"

            result = service.events().list(**params).execute()
            return result.get("items", [])

        raw_events = await loop.run_in_executor(None, _fetch_events)

        events = []
        for ev in raw_events:
            s = ev.get("start", {})
            e = ev.get("end", {})
            events.append(
                {
                    "id": ev.get("id"),
                    "summary": ev.get("summary", "(No title)"),
                    "start": s.get("dateTime") or s.get("date"),
                    "end": e.get("dateTime") or e.get("date"),
                    "attendees": [
                        {
                            "email": a.get("email"),
                            "name": a.get("displayName"),
                            "status": a.get("responseStatus"),
                        }
                        for a in ev.get("attendees", [])
                    ],
                    "location": ev.get("location"),
                    "description": (ev.get("description") or "")[:300],
                    "status": ev.get("status"),
                }
            )

        return {"data": events, "total": len(events)}

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Calendar my-events error: {e}")
        if "invalid_grant" in str(e).lower() or "token" in str(e).lower():
            return {
                "data": [],
                "total": 0,
                "error": "Calendar token expired. Please re-login.",
                "needs_reauth": True,
            }
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/api/calendar/health")
async def calendar_health_check(request: Request):
    """Check Calendar integration status."""
    user = await get_current_user(request)
    if not user:
        return {"configured": False, "message": "Not authenticated"}
    email = user.get('email')
    tokens = _google_tokens.get(email)
    return {
        "configured": bool(tokens and tokens.get('access_token')),
        "has_refresh_token": bool(tokens and tokens.get('refresh_token')),
        "user_email": email,
    }

# ============================================================================
# Google Drive Integration
# ============================================================================

@app.get("/api/drive/account-activity/{account_name}")
async def get_account_drive_activity(account_name: str, request: Request, limit: int = 20, opportunity_name: str = None):
    """Search Google Drive for files related to an account."""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        email = user.get('email')
        creds = _get_google_credentials(email, request)
        if not creds:
            return {
                'account_name': account_name,
                'files': [],
                'total': 0,
                'error': 'Google tokens not available. Please re-login to grant Drive access.',
                'needs_reauth': True,
            }

        from googleapiclient.discovery import build
        service = build('drive', 'v3', credentials=creds)

        # Escape single quotes for Drive API query
        def escape_drive(s: str) -> str:
            return s.replace("\\", "\\\\").replace("'", "\\'")

        # Search strategy: find files whose NAME contains the account name
        # or the opportunity name. This is far more targeted than fullText.
        search_terms = [account_name]
        if opportunity_name and opportunity_name != account_name:
            search_terms.append(opportunity_name)

        # Also add shortened account name variants (e.g., "Ford Foundation" -> just search for that)
        # Skip very short/generic terms
        account_terms = [t for t in account_name.split() if len(t) > 3
                         and t.lower() not in ('the', 'inc', 'llc', 'corp', 'foundation', 'fund', 'group', 'household')]

        all_files = {}  # dedupe by id

        for term in search_terms:
            escaped = escape_drive(term)
            # Search file names for the full term
            q = f"name contains '{escaped}' and trashed = false"
            try:
                results = service.files().list(
                    q=q,
                    pageSize=50,
                    fields="files(id, name, mimeType, modifiedTime, createdTime, webViewLink, iconLink, owners, lastModifyingUser, size, shared)",
                    orderBy="modifiedTime desc",
                ).execute()
                for f in results.get('files', []):
                    if f['id'] not in all_files:
                        all_files[f['id']] = {**f, '_match': 'name_exact', '_term': term}
            except Exception as e:
                logger.warning(f"Drive name search failed for '{term}': {e}")

        # If we found fewer than 5 results from name search, also try fullText
        # but only with the full account name (not individual words)
        if len(all_files) < 5:
            escaped = escape_drive(account_name)
            q = f"fullText contains '\"{escaped}\"' and trashed = false"
            try:
                results = service.files().list(
                    q=q,
                    pageSize=20,
                    fields="files(id, name, mimeType, modifiedTime, createdTime, webViewLink, iconLink, owners, lastModifyingUser, size, shared)",
                    orderBy="modifiedTime desc",
                ).execute()
                for f in results.get('files', []):
                    if f['id'] not in all_files:
                        all_files[f['id']] = {**f, '_match': 'content', '_term': account_name}
            except Exception as e:
                logger.warning(f"Drive fullText search failed: {e}")

        # Format and score results
        formatted_files = []
        account_name_lower = account_name.lower()
        opp_name_lower = (opportunity_name or '').lower()

        for f in all_files.values():
            mime = f.get('mimeType', '')
            file_type = 'file'
            if 'spreadsheet' in mime:
                file_type = 'spreadsheet'
            elif 'document' in mime:
                file_type = 'document'
            elif 'presentation' in mime:
                file_type = 'presentation'
            elif 'folder' in mime:
                file_type = 'folder'
            elif 'pdf' in mime:
                file_type = 'pdf'
            elif 'image' in mime:
                file_type = 'image'

            owners = f.get('owners', [])
            last_modifier = f.get('lastModifyingUser', {})
            name_lower = f.get('name', '').lower()

            # Relevance scoring
            score = 0
            if account_name_lower in name_lower:
                score += 20
            elif any(t.lower() in name_lower for t in account_terms):
                score += 10
            if opp_name_lower and opp_name_lower in name_lower:
                score += 15
            if f.get('_match') == 'name_exact':
                score += 5
            if f.get('shared'):
                score += 3

            formatted_files.append({
                'id': f.get('id'),
                'name': f.get('name'),
                'mimeType': mime,
                'fileType': file_type,
                'modifiedTime': f.get('modifiedTime'),
                'createdTime': f.get('createdTime'),
                'webViewLink': f.get('webViewLink'),
                'iconLink': f.get('iconLink'),
                'ownerName': owners[0].get('displayName') if owners else None,
                'lastModifiedBy': last_modifier.get('displayName'),
                'size': f.get('size'),
                'shared': f.get('shared', False),
                'matchType': f.get('_match', 'unknown'),
                'relevanceScore': score,
            })

        # Sort by relevance then recency
        formatted_files.sort(key=lambda x: (x['relevanceScore'], x.get('modifiedTime') or ''), reverse=True)
        formatted_files = formatted_files[:limit]

        return {
            'account_name': account_name,
            'files': formatted_files,
            'total': len(formatted_files),
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Drive activity error: {e}")
        if 'invalid_grant' in str(e).lower() or 'token' in str(e).lower():
            return {
                'account_name': account_name,
                'files': [],
                'total': 0,
                'error': 'Drive token expired. Please re-login.',
                'needs_reauth': True,
            }
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/drive/health")
async def drive_health_check(request: Request):
    """Check Drive integration status."""
    user = await get_current_user(request)
    if not user:
        return {"configured": False, "message": "Not authenticated"}
    email = user.get('email')
    tokens = _google_tokens.get(email)
    return {
        "configured": bool(tokens and tokens.get('access_token')),
        "has_refresh_token": bool(tokens and tokens.get('refresh_token')),
        "user_email": email,
    }

# ============================================================================
# AI-Powered Activity Intelligence (unified endpoint)
# ============================================================================

def _gather_salesforce_context(account_name: str) -> dict:
    """Pull account, contacts, and related context from Salesforce."""
    sf = get_salesforce()
    escaped = escape_soql_string(account_name)

    ctx = {
        'account_name': account_name,
        'account_id': None,
        'website': None,
        'domain': None,
        'contacts': [],
        'contact_emails': [],
        'contact_domains': set(),
    }

    try:
        result = sf.query(f"""
            SELECT Id, Name, Website, Phone, Description,
                   (SELECT Id, FirstName, LastName, Name, Email, Title FROM Contacts LIMIT 50)
            FROM Account
            WHERE Name = '{escaped}'
            LIMIT 1
        """)
        if result['totalSize'] > 0:
            acct = result['records'][0]
            ctx['account_id'] = acct.get('Id')
            ctx['website'] = acct.get('Website')
            ctx['description'] = acct.get('Description', '')

            website = acct.get('Website') or ''
            if website:
                domain = website.replace('http://', '').replace('https://', '').replace('www.', '').split('/')[0]
                if domain:
                    ctx['domain'] = domain
                    ctx['contact_domains'].add(domain.lower())

            if acct.get('Contacts'):
                for c in acct['Contacts']['records']:
                    contact = {
                        'name': c.get('Name', ''),
                        'email': c.get('Email', ''),
                        'title': c.get('Title', ''),
                    }
                    ctx['contacts'].append(contact)
                    if c.get('Email'):
                        ctx['contact_emails'].append(c['Email'].lower())
                        if '@' in c['Email']:
                            ctx['contact_domains'].add(c['Email'].split('@')[1].lower())
    except Exception as e:
        logger.warning(f"Failed to gather SF context for {account_name}: {e}")

    ctx['contact_domains'] = list(ctx['contact_domains'])
    return ctx


async def _search_gmail_broad(creds, contact_emails: list, contact_domains: list, account_name: str) -> list:
    """Search Gmail using contact emails and domains. Includes email body text."""
    try:
        from googleapiclient.discovery import build
        import base64
        service = build('gmail', 'v1', credentials=creds)

        parts = []
        for email in contact_emails[:10]:
            parts.append(f'from:{email}')
            parts.append(f'to:{email}')
        for domain in contact_domains[:5]:
            if domain not in ('gmail.com', 'outlook.com', 'yahoo.com', 'hotmail.com'):
                parts.append(f'from:{domain}')
                parts.append(f'to:{domain}')
        parts.append(f'"{account_name}"')
        query_str = ' OR '.join(parts) if parts else f'"{account_name}"'

        results = service.users().messages().list(userId='me', q=query_str, maxResults=20).execute()
        messages = results.get('messages', [])

        emails = []
        for msg_meta in messages[:20]:
            msg = service.users().messages().get(
                userId='me', id=msg_meta['id'], format='full',
            ).execute()
            headers = {h['name']: h['value'] for h in msg.get('payload', {}).get('headers', [])}

            # Extract plain text body
            body_text = ''
            payload = msg.get('payload', {})

            def extract_text(part):
                """Recursively extract text/plain content from message parts."""
                if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                    return base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                for sub_part in part.get('parts', []):
                    result = extract_text(sub_part)
                    if result:
                        return result
                return ''

            body_text = extract_text(payload)
            if not body_text and payload.get('body', {}).get('data'):
                body_text = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')

            # Truncate but keep enough for AI analysis
            body_text = body_text[:3000] if body_text else msg.get('snippet', '')

            emails.append({
                'source': 'gmail',
                'id': msg_meta['id'],
                'subject': headers.get('Subject', '(no subject)'),
                'from': headers.get('From', ''),
                'to': headers.get('To', ''),
                'date': headers.get('Date', ''),
                'snippet': msg.get('snippet', ''),
                'body': body_text,
            })
        return emails
    except Exception as e:
        logger.warning(f"Gmail broad search failed: {e}")
        return []


async def _search_calendar_broad(creds, contact_emails: list, contact_domains: list, account_name: str) -> list:
    """Search Calendar across ALL visible org calendars, not just the user's primary."""
    try:
        from googleapiclient.discovery import build
        service = build('calendar', 'v3', credentials=creds)

        now = datetime.utcnow()
        time_min = (now - timedelta(days=180)).isoformat() + 'Z'
        time_max = (now + timedelta(days=90)).isoformat() + 'Z'

        # Step 1: List all calendars visible to this user (own + shared/org calendars)
        calendar_list = service.calendarList().list(
            showHidden=False, showDeleted=False,
        ).execute()
        calendars = calendar_list.get('items', [])
        # Include primary + all other calendars the user can see (coworkers, shared, resources)
        calendar_ids = []
        for cal in calendars:
            cal_id = cal.get('id', '')
            # Skip birthday/holiday calendars
            if 'holiday' in cal_id or 'birthday' in cal_id or '#contacts' in cal_id:
                continue
            calendar_ids.append(cal_id)

        logger.info(f"Calendar search: scanning {len(calendar_ids)} calendars for '{account_name}'")

        name_events = {}  # dedup by event id
        contact_emails_set = set(contact_emails)
        contact_domains_set = set(d for d in contact_domains if d not in ('gmail.com', 'outlook.com', 'yahoo.com'))

        for cal_id in calendar_ids:
            try:
                # Search by account name text match
                events_result = service.events().list(
                    calendarId=cal_id, q=account_name,
                    timeMin=time_min, timeMax=time_max,
                    maxResults=50, singleEvents=True, orderBy='startTime',
                ).execute()
                for e in events_result.get('items', []):
                    if e['id'] not in name_events:
                        name_events[e['id']] = {**e, '_cal': cal_id}

                # Also scan events by attendee email/domain overlap
                all_events_result = service.events().list(
                    calendarId=cal_id,
                    timeMin=time_min, timeMax=time_max,
                    maxResults=200, singleEvents=True, orderBy='startTime',
                ).execute()

                for event in all_events_result.get('items', []):
                    if event['id'] in name_events:
                        continue
                    attendees = event.get('attendees', [])
                    for att in attendees:
                        att_email = (att.get('email') or '').lower()
                        if att_email in contact_emails_set:
                            name_events[event['id']] = {**event, '_cal': cal_id}
                            break
                        if any(att_email.endswith('@' + d) for d in contact_domains_set):
                            name_events[event['id']] = {**event, '_cal': cal_id}
                            break
            except Exception as e:
                # Some shared calendars may not be queryable -- skip silently
                logger.debug(f"Skipping calendar {cal_id}: {e}")
                continue

        # Find the calendar name for display
        cal_name_map = {c.get('id', ''): c.get('summary', '') for c in calendars}

        results = []
        for event in name_events.values():
            start = event.get('start', {})
            end = event.get('end', {})
            cal_id = event.get('_cal', 'primary')
            cal_name = cal_name_map.get(cal_id, '')
            results.append({
                'source': 'calendar',
                'id': event.get('id'),
                'summary': event.get('summary', '(No title)'),
                'description': (event.get('description') or '')[:500],
                'start': start.get('dateTime') or start.get('date'),
                'end': end.get('dateTime') or end.get('date'),
                'attendees': [
                    {'email': a.get('email'), 'name': a.get('displayName'), 'status': a.get('responseStatus')}
                    for a in event.get('attendees', [])
                ],
                'location': event.get('location'),
                'htmlLink': event.get('htmlLink'),
                'calendarName': cal_name if cal_name and cal_id != 'primary' else None,
            })
        return results
    except Exception as e:
        logger.warning(f"Calendar broad search failed: {e}")
        return []


async def _search_drive_broad(creds, contact_emails: list, contact_domains: list, account_name: str) -> list:
    """Search Drive by file name, content, and shared-with contacts. Fetches actual doc content."""
    try:
        from googleapiclient.discovery import build
        service = build('drive', 'v3', credentials=creds)

        def escape_drive(s):
            return s.replace("\\", "\\\\").replace("'", "\\'")

        all_files = {}
        drive_fields = "files(id, name, mimeType, modifiedTime, webViewLink, owners, lastModifyingUser, shared)"

        # Extract key words for full-text search (Drive fullText does proper word matching)
        short_terms = []
        for word in account_name.split():
            if len(word) >= 3 and word.lower() not in ('the', 'and', 'for', 'inc', 'llc', 'corp', 'ltd', 'group', 'foundation', 'financial', 'bank'):
                short_terms.append(word)

        # 1. File NAME search — ONLY use the full account name (Drive name contains is substring match)
        try:
            q = f"name contains '{escape_drive(account_name)}' and trashed = false"
            res = service.files().list(
                q=q, pageSize=25,
                fields=drive_fields,
                orderBy="modifiedTime desc",
            ).execute()
            for f in res.get('files', []):
                all_files[f['id']] = {**f, '_match': 'name'}
        except Exception:
            pass

        # 2. Full-text content search — use both full name and key words
        #    (Drive fullText does word-level matching, so "PNC" won't match "PFNYC")
        fulltext_terms = [account_name] + short_terms
        for term in fulltext_terms[:3]:
            try:
                q = f"fullText contains '\"{escape_drive(term)}\"' and trashed = false"
                res = service.files().list(
                    q=q, pageSize=20,
                    fields=drive_fields,
                    orderBy="modifiedTime desc",
                ).execute()
                for f in res.get('files', []):
                    if f['id'] not in all_files:
                        all_files[f['id']] = {**f, '_match': 'content'}
            except Exception:
                pass

        # 3. Search for files by contact names/emails in name
        for contact_email in contact_emails[:5]:
            local_part = contact_email.split('@')[0]
            if len(local_part) < 4:
                continue
            try:
                q = f"name contains '{escape_drive(local_part)}' and trashed = false"
                res = service.files().list(
                    q=q, pageSize=10,
                    fields=drive_fields,
                    orderBy="modifiedTime desc",
                ).execute()
                for f in res.get('files', []):
                    if f['id'] not in all_files:
                        all_files[f['id']] = {**f, '_match': 'contact_name'}
            except Exception:
                pass

        file_names = [f.get('name', '?') for f in all_files.values()]
        logger.info(f"Drive search for '{account_name}': {len(all_files)} files found (name: '{account_name}', fulltext: {fulltext_terms[:3]})")
        logger.info(f"Drive files: {file_names[:15]}")

        # Now fetch actual content for the top files (limit to 10 for performance)
        # Sort by match quality: name > content > contact_name
        match_priority = {'name': 0, 'content': 1, 'contact_name': 2}
        sorted_files = sorted(all_files.values(), key=lambda x: match_priority.get(x.get('_match', ''), 3))

        results = []
        content_fetch_count = 0
        MAX_CONTENT_FETCHES = 10

        for f in sorted_files[:25]:
            mime = f.get('mimeType', '')
            file_type = 'file'
            for key, ftype in [('spreadsheet', 'spreadsheet'), ('document', 'document'),
                               ('presentation', 'presentation'), ('folder', 'folder'),
                               ('pdf', 'pdf'), ('image', 'image')]:
                if key in mime:
                    file_type = ftype
                    break

            owners = f.get('owners', [])

            # Fetch actual text content using Drive export API (only works for native Google Docs/Sheets/Slides)
            content_snippet = ''
            google_native_types = (
                'application/vnd.google-apps.document',
                'application/vnd.google-apps.spreadsheet',
                'application/vnd.google-apps.presentation',
            )
            is_google_type = mime in google_native_types
            if is_google_type and content_fetch_count < MAX_CONTENT_FETCHES:
                try:
                    if 'spreadsheet' in mime:
                        export_mime = 'text/csv'
                    else:
                        export_mime = 'text/plain'

                    text_content = service.files().export(
                        fileId=f['id'], mimeType=export_mime
                    ).execute()
                    if isinstance(text_content, bytes):
                        text_content = text_content.decode('utf-8', errors='ignore')

                    content_fetch_count += 1

                    # Extract section around account name mention for context
                    acct_lower = account_name.lower()
                    text_lower = text_content.lower() if text_content else ''
                    idx = text_lower.find(acct_lower)
                    if idx >= 0:
                        start = max(0, idx - 500)
                        end = min(len(text_content), idx + len(account_name) + 1500)
                        content_snippet = text_content[start:end]
                    else:
                        content_snippet = text_content[:2000] if text_content else ''

                    logger.info(f"Drive content: '{f.get('name')}' -> {len(content_snippet)} chars extracted")
                except Exception as e:
                    logger.warning(f"Drive content FAILED for '{f.get('name')}': {e}")

            results.append({
                'source': 'drive',
                'id': f.get('id'),
                'name': f.get('name'),
                'fileType': file_type,
                'modifiedTime': f.get('modifiedTime'),
                'webViewLink': f.get('webViewLink'),
                'ownerName': owners[0].get('displayName') if owners else None,
                'lastModifiedBy': (f.get('lastModifyingUser') or {}).get('displayName'),
                'shared': f.get('shared', False),
                'matchType': f.get('_match'),
                'content': content_snippet,
            })
        return results
    except Exception as e:
        logger.warning(f"Drive broad search failed: {e}")
        return []


def _search_slack_broad(account_name: str, contact_names: list) -> list:
    """Search Slack for account mentions."""
    try:
        slack = get_slack()
        channels_response = slack.conversations_list(types="public_channel", exclude_archived=True, limit=200)
        if not channels_response["ok"]:
            return []

        account_name_lower = account_name.lower()
        account_terms = [t.lower() for t in account_name.split() if len(t) > 3]
        all_messages = []

        for channel in channels_response.get("channels", []):
            if not channel.get("is_member", False):
                continue

            channel_name_lower = channel["name"].lower().replace('-', ' ').replace('_', ' ')
            channel_matches = any(t in channel_name_lower for t in account_terms)

            try:
                history = slack.conversations_history(channel=channel["id"], limit=100)
                if not history["ok"]:
                    continue

                for message in history.get("messages", []):
                    text = message.get("text", "")
                    text_matches = account_name_lower in text.lower()
                    # Also check for contact name mentions
                    contact_match = any(cn.lower() in text.lower() for cn in contact_names if len(cn) > 3)

                    if text_matches or channel_matches or contact_match:
                        ts = message.get("ts", "")
                        all_messages.append({
                            'source': 'slack',
                            'text': text[:500],
                            'user': message.get("user", "Unknown"),
                            'channel': channel["name"],
                            'timestamp': ts,
                            'date': datetime.fromtimestamp(float(ts)).isoformat() if ts else None,
                            'permalink': f"https://slack.com/archives/{channel['id']}/p{ts.replace('.', '')}" if ts else "",
                        })
            except SlackApiError:
                continue

        all_messages.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        return all_messages[:30]
    except Exception as e:
        logger.warning(f"Slack broad search failed: {e}")
        return []


def _search_fireflies_broad(account_name: str, contact_emails: list, contact_domains: list) -> list:
    """Search Fireflies transcripts by attendee emails/domains."""
    try:
        if not FIREFLIES_API_KEY:
            return []

        global fireflies_cache
        now = datetime.now()

        if (fireflies_cache.get('transcripts') is not None and
                fireflies_cache.get('expires_at') is not None and
                now < fireflies_cache['expires_at']):
            transcripts = fireflies_cache['transcripts']
        else:
            all_transcripts = []
            skip = 0
            for _ in range(20):
                query = f"""
                query {{
                  transcripts(limit: 50, skip: {skip}) {{
                    id
                    title
                    date
                    duration
                    meeting_attendees {{ displayName email }}
                    sentences {{ text }}
                    summary {{ keywords action_items overview }}
                  }}
                }}
                """
                result = query_fireflies(query)
                batch = result.get("data", {}).get("transcripts", [])
                if not batch:
                    break
                all_transcripts.extend(batch)
                if len(batch) < 50:
                    break
                skip += 50
            transcripts = all_transcripts
            fireflies_cache['transcripts'] = transcripts
            fireflies_cache['fetched_at'] = now
            fireflies_cache['expires_at'] = now + timedelta(hours=CACHE_DURATION_HOURS)
            save_fireflies_cache()

        # Match by attendee email/domain
        contact_emails_set = set(e.lower() for e in contact_emails)
        contact_domains_set = set(d.lower() for d in contact_domains if d not in ('gmail.com', 'outlook.com', 'yahoo.com'))
        account_name_lower = account_name.lower()

        matched = []
        for t in transcripts:
            if not t:
                continue
            attendees = t.get('meeting_attendees', []) or []
            title = (t.get('title') or '').lower()
            hit = False

            if account_name_lower in title:
                hit = True

            for att in attendees:
                if not att:
                    continue
                email = (att.get('email') or '').lower()
                if email in contact_emails_set:
                    hit = True
                    break
                if '@' in email:
                    domain = email.split('@')[1]
                    if domain in contact_domains_set:
                        hit = True
                        break

            if not hit:
                sentences = (t.get('sentences') or [])[:30]
                text = ' '.join(s.get('text', '') for s in sentences if s).lower()
                if account_name_lower in text:
                    hit = True

            if hit:
                summary = t.get('summary') or {}
                preview_sentences = (t.get('sentences') or [])[:5]
                preview = ' '.join(s.get('text', '') for s in preview_sentences if s)[:400]

                matched.append({
                    'source': 'fireflies',
                    'id': t.get('id'),
                    'title': t.get('title'),
                    'date': t.get('date'),
                    'duration': t.get('duration'),
                    'attendees': [
                        {'name': a.get('displayName'), 'email': a.get('email')}
                        for a in attendees if a and (a.get('displayName') or a.get('email'))
                    ],
                    'preview': preview,
                    'overview': summary.get('overview'),
                    'action_items': summary.get('action_items', []) or [],
                    'keywords': summary.get('keywords', []) or [],
                    'fireflies_url': f"https://app.fireflies.ai/view/{t.get('id')}" if t.get('id') else None,
                })

        matched.sort(key=lambda x: x.get('date') or '', reverse=True)
        return matched[:20]
    except Exception as e:
        logger.warning(f"Fireflies broad search failed: {e}")
        return []


async def _ai_analyze_activity(sf_context: dict, raw_results: dict, previous_analysis: dict = None) -> dict:
    """Send gathered data to Claude for concise, practical intelligence.
    If previous_analysis is provided, sends it as context for a token-efficient refresh."""
    import anthropic

    client = anthropic.Anthropic(api_key=ANTHROPIC_API_KEY)

    # Only send items with substance — prioritize recent items
    raw_summary = {}
    for source, items in raw_results.items():
        if items:
            raw_summary[source] = items[:15]

    opp_context = sf_context.get('opportunity', {})
    opp_line = ''
    if opp_context:
        opp_line = f"\nOPPORTUNITY: {opp_context.get('name', 'N/A')} | Stage: {opp_context.get('stage', 'N/A')} | Amount: ${opp_context.get('amount', 0):,.0f} | Close: {opp_context.get('close_date', 'N/A')} | Type: {opp_context.get('type', 'N/A')}"
        if opp_context.get('description'):
            opp_line += f"\nOpp Description: {opp_context['description']}"

    context_block = f"""ACCOUNT: {sf_context['account_name']}
Domain: {sf_context.get('domain', 'N/A')}
Contacts: {', '.join(c['name'] + (' (' + c['title'] + ')' if c.get('title') else '') for c in sf_context['contacts'][:8])}
Emails: {', '.join(sf_context['contact_emails'][:8])}{opp_line}"""

    if previous_analysis:
        prompt = f"""{context_block}

PREVIOUS ANALYSIS ({previous_analysis.get('generated_at', 'recently')}):
{previous_analysis.get('summary', '')}
Momentum: {previous_analysis.get('momentum', 'unknown')}
Next steps: {json.dumps(previous_analysis.get('action_items', []))}

LATEST DATA:
{json.dumps(raw_summary, default=str, indent=1)}

Update the analysis. Focus on what's new or changed. Read all document content carefully — quote specific details, don't just note that a document exists.

Respond ONLY with valid JSON:
{{"summary": "...", "momentum": "hot|warm|cold|new", "key_findings": ["..."], "action_items": ["..."], "scored_items": [{{"source": "...", "id": "...", "relevance_score": 0-100, "reason": "..."}}]}}"""
    else:
        prompt = f"""You're a concise relationship analyst. Read all the data below and answer three questions about this account:

{context_block}

DATA FROM INTEGRATIONS (documents, emails, Slack, meetings, calendar):
{json.dumps(raw_summary, default=str, indent=1)}

{"IMPORTANT: Focus ONLY on the specific OPPORTUNITY listed above. This account may have multiple opportunities — only report on activity relevant to THIS one. Ignore data about other opportunities for the same account." if opp_context else ""}

Answer these three questions concisely:
1. **Status**: What is the current state of THIS opportunity? (1-2 sentences max)
2. **Recent activity**: What has actually happened recently that's relevant to THIS opportunity? Quote specifics — names, dates, decisions, content. Ignore documents/activity about unrelated opportunities for the same account.
3. **Next steps**: What specific actions are needed? Only include if the data directly supports them. Leave empty if nothing actionable.

Score each source item's relevance to THIS SPECIFIC OPPORTUNITY (0-100). Items about a different opportunity for the same account should score 0-10. Recent items with content directly about this opportunity score highest.

Respond ONLY with valid JSON:
{{
  "summary": "Status in 1-2 sentences. Then recent activity in 1-2 sentences. Brief and specific.",
  "momentum": "hot|warm|cold|new",
  "key_findings": [
    "Specific fact from the data relevant to this opportunity",
    "Another specific fact..."
  ],
  "action_items": [
    "Specific next step grounded in the data (ONLY if data supports it)"
  ],
  "scored_items": [
    {{"source": "gmail|calendar|drive|slack|fireflies", "id": "item id", "relevance_score": 0-100, "reason": "brief reason"}}
  ]
}}

Rules:
- Less is more. 2-3 key findings max. 1-2 action items max (or empty).
- Never invent actions not supported by the data.
- The summary should be 2-4 sentences total.
- Prioritize recent activity. Ignore items unrelated to this opportunity."""

    try:
        response = client.messages.create(
            model="claude-opus-4-6",
            max_tokens=2000,
            messages=[{"role": "user", "content": prompt}],
        )
        text = response.content[0].text.strip()
        if text.startswith('```'):
            text = text.split('\n', 1)[1].rsplit('```', 1)[0].strip()
        return json.loads(text)
    except Exception as e:
        logger.error(f"AI analysis failed: {e}")
        import traceback
        traceback.print_exc()
        return {
            "summary": "Unable to generate AI analysis at this time.",
            "momentum": "unknown",
            "key_findings": [],
            "action_items": [],
            "scored_items": [],
        }


# Server-side intelligence cache: { account_name: { result: {...}, generated_at: datetime } }
_intelligence_cache: Dict[str, Dict] = {}
INTELLIGENCE_CACHE_HOURS = 24


@app.get("/api/activity-intelligence/{account_name}")
async def get_activity_intelligence(
    account_name: str, request: Request,
    force_refresh: bool = False, opportunity_name: str = None,
):
    """AI-powered activity intelligence with 24h server-side cache.
    Pass ?force_refresh=true to regenerate. Pass ?opportunity_name=X to scope to a specific opp."""
    try:
        user = await get_current_user(request)
        if not user:
            raise HTTPException(status_code=401, detail="Not authenticated")

        if not ANTHROPIC_API_KEY:
            raise HTTPException(status_code=503, detail="Anthropic API key not configured")

        # Cache key includes opportunity name so different opps for same account get separate results
        cache_key = f"{account_name}|{opportunity_name or ''}"

        # Check server-side cache
        cached = _intelligence_cache.get(cache_key)
        now = datetime.now()
        if cached and not force_refresh:
            cache_age = now - cached['generated_at']
            if cache_age.total_seconds() < INTELLIGENCE_CACHE_HOURS * 3600:
                logger.info(f"Returning cached intelligence for '{cache_key}' (age: {cache_age})")
                result = cached['result']
                result['cached'] = True
                result['generated_at'] = cached['generated_at'].isoformat()
                return result

        email = user.get('email')
        creds = _get_google_credentials(email, request)

        # Gather Salesforce context (sync — run in executor to avoid blocking event loop)
        loop = asyncio.get_running_loop()
        sf_context = await loop.run_in_executor(None, _gather_salesforce_context, account_name)
        # Add opportunity context
        if opportunity_name:
            sf_context['opportunity_name'] = opportunity_name
            # Also look up the specific opportunity from Salesforce for stage/amount/close date
            try:
                sf = get_salesforce()
                opp_escaped = opportunity_name.replace("'", "\\'")
                opp_result = sf.query(f"""
                    SELECT Id, Name, StageName, Amount, CloseDate, Probability, Description, Type
                    FROM Opportunity WHERE Name = '{opp_escaped}' LIMIT 1
                """)
                if opp_result['totalSize'] > 0:
                    opp = opp_result['records'][0]
                    sf_context['opportunity'] = {
                        'name': opp.get('Name'),
                        'stage': opp.get('StageName'),
                        'amount': opp.get('Amount'),
                        'close_date': opp.get('CloseDate'),
                        'probability': opp.get('Probability'),
                        'type': opp.get('Type'),
                        'description': (opp.get('Description') or '')[:500],
                    }
            except Exception as e:
                logger.warning(f"Could not fetch opportunity details: {e}")

        contact_names = [c['name'] for c in sf_context['contacts'] if c.get('name')]
        contact_emails = sf_context['contact_emails']
        contact_domains = sf_context.get('contact_domains', [])

        logger.info(f"Activity intelligence for '{account_name}': {len(contact_emails)} emails, {len(contact_domains)} domains")

        # Search all integrations concurrently — sync functions run in executor to avoid blocking
        async def _noop() -> list:
            return []

        slack_task = loop.run_in_executor(None, _search_slack_broad, account_name, contact_names)
        fireflies_task = loop.run_in_executor(None, _search_fireflies_broad, account_name, contact_emails, contact_domains)
        gmail_task = _search_gmail_broad(creds, contact_emails, contact_domains, account_name) if creds else _noop()
        calendar_task = _search_calendar_broad(creds, contact_emails, contact_domains, account_name) if creds else _noop()
        drive_task = _search_drive_broad(creds, contact_emails, contact_domains, account_name) if creds else _noop()

        if not creds:
            logger.warning(f"No Google credentials available for '{account_name}' - skipping Gmail/Calendar/Drive")

        search_results = await asyncio.gather(
            slack_task, fireflies_task, gmail_task, calendar_task, drive_task,
            return_exceptions=True,
        )

        source_names = ['slack', 'fireflies', 'gmail', 'calendar', 'drive']
        raw_results = {}
        for name, result in zip(source_names, search_results):
            if isinstance(result, Exception):
                logger.error(f"{name} search failed for '{account_name}': {result}")
                raw_results[name] = []
            else:
                raw_results[name] = result

        total_raw = sum(len(v) for v in raw_results.values())
        source_breakdown = {k: len(v) for k, v in raw_results.items()}
        logger.info(f"Gathered {total_raw} raw items for '{account_name}': {source_breakdown}")
        # Log content availability for Drive items
        drive_with_content = sum(1 for d in raw_results.get('drive', []) if d.get('content'))
        if raw_results.get('drive'):
            logger.info(f"Drive: {len(raw_results['drive'])} files found, {drive_with_content} with extracted content")

        # If refreshing and we have a previous analysis, pass it for token-efficient update
        previous_analysis = None
        if cached and force_refresh:
            previous_analysis = {
                'summary': cached['result'].get('summary', ''),
                'momentum': cached['result'].get('momentum', ''),
                'key_findings': cached['result'].get('key_findings', []),
                'action_items': cached['result'].get('action_items', []),
                'generated_at': cached['generated_at'].isoformat(),
            }
            logger.info(f"Refreshing with previous analysis context for '{account_name}'")

        # AI analysis
        ai_result = await _ai_analyze_activity(sf_context, raw_results, previous_analysis)

        # Merge AI scores back into raw items
        score_map = {}
        for scored in ai_result.get('scored_items', []):
            key = (scored.get('source'), str(scored.get('id')))
            score_map[key] = {
                'relevance_score': scored.get('relevance_score', 0),
                'reason': scored.get('reason', ''),
            }

        def _recency_score(item: dict) -> float:
            """Calculate a recency bonus (0-30) based on how recent an item is."""
            date_str = item.get('modifiedTime') or item.get('date') or item.get('start') or ''
            if not date_str:
                return 0
            try:
                if isinstance(date_str, (int, float)):
                    item_date = datetime.fromtimestamp(date_str / 1000 if date_str > 1e10 else date_str)
                else:
                    item_date = datetime.fromisoformat(date_str.replace('Z', '+00:00').replace('+00:00', ''))
                days_ago = (now - item_date).days
                if days_ago < 0:
                    return 25  # future events get high recency
                if days_ago <= 7:
                    return 30
                if days_ago <= 30:
                    return 20
                if days_ago <= 90:
                    return 10
                return 0
            except Exception:
                return 0

        scored_results = {}
        for source, items in raw_results.items():
            scored_items = []
            for item in items:
                key = (source, str(item.get('id', '')))
                ai_score = score_map.get(key, {})
                relevance = ai_score.get('relevance_score', 40)
                recency = _recency_score(item)
                # Composite: 70% relevance + 30% recency boost (scaled to 100)
                composite = min(100, int(relevance * 0.7 + recency * 1.0))
                scored_items.append({
                    **item,
                    'relevance_score': composite,
                    'ai_reason': ai_score.get('reason', ''),
                })
            # Sort by composite score (recency + relevance)
            scored_items.sort(key=lambda x: x.get('relevance_score', 0), reverse=True)
            # Lower threshold: show more items, let recency surface recent ones
            scored_items = [i for i in scored_items if i.get('relevance_score', 0) >= 15]
            scored_results[source] = scored_items

        result = {
            'account_name': account_name,
            'summary': ai_result.get('summary', ''),
            'momentum': ai_result.get('momentum', 'unknown'),
            'key_findings': ai_result.get('key_findings', []),
            'action_items': ai_result.get('action_items', []),
            'sources': scored_results,
            'source_counts': {k: len(v) for k, v in scored_results.items()},
            'sf_context': {
                'contacts': sf_context['contacts'][:5],
                'domain': sf_context.get('domain'),
            },
            'google_connected': creds is not None,
            'cached': False,
            'generated_at': now.isoformat(),
        }

        # Cache the result
        _intelligence_cache[cache_key] = {
            'result': result,
            'generated_at': now,
        }

        return result

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Activity intelligence error: {e}")
        import traceback
        traceback.print_exc()
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
            _collecting_values = {s.value for s in COLLECTING_STAGES}
            _closed_values = {s.value for s in CLOSED_STAGES}
            _open_values = {s.value for s in OPEN_STAGES}
            if stage in _collecting_values:
                score += 30  # Maximum bonus for active collection
                explanation['stage_bonus'] = '🟢 Active collection'
            elif stage == OpportunityStage.CLOSED_COMPLETED.value:
                score += 25
                explanation['stage_bonus'] = '✓ Completed'
            elif stage in (OpportunityStage.CLOSED_LOST.value,
                           OpportunityStage.CLOSED_DID_NOT_FULFILL.value,
                           OpportunityStage.WITHDRAWN.value):
                score -= 20  # Penalty for closed/lost
                explanation['stage_bonus'] = '❌ Closed/Lost'
            elif stage in _open_values:
                # Open pipeline stages - show but don't recommend
                score -= 10  # Slight penalty
                explanation['stage_bonus'] = '⚠️ Open pipeline (not yet won)'
            else:
                score -= 10
                explanation['stage_bonus'] = '⚠️ Unknown stage'
            
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
        query = f"""
        SELECT Id, npe01__Payment_Amount__c, npe01__Scheduled_Date__c, npe01__Paid__c,
               npe01__Opportunity__c, npe01__Opportunity__r.Name,
               npe01__Opportunity__r.Account.Name, npe01__Opportunity__r.CloseDate,
               npe01__Opportunity__r.Owner.Name, npe01__Opportunity__r.StageName,
               Invoice__c
        FROM npe01__OppPayment__c
        WHERE npe01__Opportunity__r.StageName = '{OpportunityStage.COLLECTING.value}'
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
                    'StageName': OpportunityStage.CLOSED_COMPLETED.value
                })
                cache.invalidate_prefix("opps:")
                cache.invalidate_prefix("stage_history")
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


@app.get("/api/sage/unpaid-bills")
async def get_sage_unpaid_bills(limit: int = 500):
    """Get AP bills from Sage Intacct that haven't been fully paid yet."""
    try:
        import sys
        import os as _os
        parent_dir = _os.path.dirname(_os.path.abspath(__file__))
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
        <function controlid="get-unpaid-bills">
            <readByQuery>
                <object>APBILL</object>
                <query>TOTALDUE &gt; 0</query>
                <fields>RECORDNO,RECORDID,VENDORID,VENDORNAME,DESCRIPTION,WHENCREATED,WHENDUE,WHENPAID,TOTALENTERED,TOTALDUE,TOTALPAID,STATE,RAWSTATE,PAYMENTPRIORITY,ONHOLD,DOCNUMBER</fields>
                <pagesize>{limit}</pagesize>
            </readByQuery>
        </function>"""

        response = sage._make_api_request(function_xml)

        if not response.get('success'):
            raise HTTPException(status_code=500, detail="Failed to fetch unpaid bills")

        data = response.get('data', {})
        bills_data = data.get('apbill', [])

        if not isinstance(bills_data, list):
            bills_data = [bills_data] if bills_data else []

        return {
            "success": True,
            "count": len(bills_data),
            "bills": bills_data
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        logger.error(f"Error fetching unpaid bills: {e}")
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
    Cached for 10 minutes.
    """
    try:
        cached = cache.get("cashflow_summary")
        if cached is not None:
            logger.info("Cache HIT for cashflow_summary")
            return cached
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
        
        # Cache the response
        cache.set("cashflow_summary", response, CACHE_TTL_CASHFLOW)
        logger.info("Cache MISS for cashflow_summary - computed fresh")
        
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
async def validate_stage_change(request: dict, http_request: Request = None):
    """Validate that opportunity can move to 'Collecting / In Effect'."""
    try:
        sf = get_salesforce_for_request(http_request) if http_request else get_salesforce()
        opp_id = request.get('opportunity_id')
        new_stage = request.get('new_stage')
        
        if new_stage != OpportunityStage.COLLECTING.value:
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
                "message": f"Cannot move to '{OpportunityStage.COLLECTING.value}' without a payment schedule.\n\nPlease create a payment schedule for this ${opp_amount:,.0f} opportunity first.\n\nGo to Salesforce \u2192 Opportunity \u2192 Related \u2192 Payments \u2192 New",
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
async def create_payment_schedule(request: CreatePaymentScheduleRequest, http_request: Request = None):
    """Create payment schedule for an opportunity. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(http_request) if http_request else get_salesforce()
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
async def update_opportunity_stage(request: dict, http_request: Request = None):
    """Update opportunity stage with validation. Uses per-user SF connection."""
    try:
        sf = get_salesforce_for_request(http_request) if http_request else get_salesforce()
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
        cache.invalidate_prefix("opps:")
        cache.invalidate_prefix("stage_history")

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
# PROSPECT IMPORT API (prospect_import pipeline)
# ============================================================================

import sys
from pathlib import Path as _Path
_reporoot = _Path(__file__).resolve().parent.parent
if str(_reporoot) not in sys.path:
    sys.path.insert(0, str(_reporoot))

class ProspectImportPreviewRequest(BaseModel):
    csv_text: str

class ProspectImportColumnMapping(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    name: Optional[str] = None  # If set, split into first/last
    email: Optional[str] = None
    organizations: Optional[List[str]] = None  # List of column names for orgs

class ProspectImportParseRequest(BaseModel):
    csv_text: str
    column_mapping: ProspectImportColumnMapping
    filename: str = "import.csv"

@app.post("/api/prospect-import/preview")
async def prospect_import_preview(req: ProspectImportPreviewRequest):
    """Parse CSV and return headers + first 20 rows for column mapping."""
    try:
        from prospect_import.parser import preview_csv
        result = preview_csv(req.csv_text, max_rows=20)
        return {"success": True, **result}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/api/prospect-import/parse")
async def prospect_import_parse(req: ProspectImportParseRequest):
    """Parse CSV with column mapping, normalize, and save to SQLite."""
    try:
        from prospect_import.db import init_db, create_import_session, save_raw_rows, normalize_and_save
        from prospect_import.parser import parse_csv_with_mapping

        init_db()
        cm = req.column_mapping.model_dump(exclude_none=True)
        mapping = {
            "first_name": cm.get("first_name"),
            "last_name": cm.get("last_name"),
            "email": cm.get("email"),
            "organizations": cm.get("organizations") or [],
        }
        split_name_col = None
        if cm.get("name"):
            mapping["name"] = cm["name"]
            split_name_col = cm["name"]
        parsed = parse_csv_with_mapping(req.csv_text, mapping, split_name_column=split_name_col)

        session_id = create_import_session(req.filename, mapping, "")
        save_raw_rows(session_id, parsed)
        counts = normalize_and_save(session_id, parsed)
        return {"success": True, "session_id": session_id, **counts}
    except Exception as e:
        import traceback
        raise HTTPException(status_code=400, detail={"error": str(e), "traceback": traceback.format_exc()})

@app.get("/api/prospect-import/persons")
async def prospect_import_get_persons(session_id: Optional[str] = None):
    """Get normalized persons with affiliations."""
    try:
        from prospect_import.db import get_persons_with_affiliations
        persons = get_persons_with_affiliations(session_id)
        return {"success": True, "persons": persons}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

class ProspectImportWriteToCrmRequest(BaseModel):
    session_id: Optional[str] = None

@app.post("/api/prospect-import/write-to-crm")
async def prospect_import_write_to_crm(req: ProspectImportWriteToCrmRequest, request: Request = None):
    """Write normalized persons and organizations to Salesforce (Contact, Account)."""
    try:
        from prospect_import.db import get_persons_with_affiliations
        sf = get_salesforce_for_request(request) if request else get_salesforce()
        persons = get_persons_with_affiliations(req.session_id)
        accounts_by_name: Dict[str, str] = {}
        created_accounts = 0
        created_contacts = 0

        for p in persons:
            affs = p.get("affiliations") or []
            primary_account_id = None
            if affs:
                first_org = affs[0]
                org_name = first_org.get("org_name") or ""
                if org_name and org_name not in accounts_by_name:
                    safe_name = org_name.replace("'", "''")
                    existing = sf.query(f"SELECT Id FROM Account WHERE Name = '{safe_name}' AND IsDeleted = false LIMIT 1")
                    if existing.get("totalSize", 0) > 0:
                        accounts_by_name[org_name] = existing["records"][0]["Id"]
                    else:
                        acc_result = sf.Account.create({"Name": org_name, "Type": first_org.get("org_type", "Other") or "Other"})
                        if acc_result.get("success"):
                            accounts_by_name[org_name] = acc_result["id"]
                            created_accounts += 1
                primary_account_id = accounts_by_name.get(org_name)

            contact_data = {
                "FirstName": p.get("first_name") or "Unknown",
                "LastName": p.get("last_name") or "Unknown",
            }
            if p.get("email"):
                contact_data["Email"] = p["email"]
            if primary_account_id:
                contact_data["AccountId"] = primary_account_id
            result = sf.Contact.create(contact_data)
            if result.get("success"):
                created_contacts += 1

        cache.invalidate("accounts")
        cache.invalidate_prefix("contacts:")
        return {"success": True, "created_accounts": created_accounts, "created_contacts": created_contacts}
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail={"error": str(e), "traceback": traceback.format_exc()})


# ============================================================================
# BACKGROUND SCHEDULER FOR AUTOMATIC SYNC
# ============================================================================

# Initialize scheduler
scheduler = BackgroundScheduler()

@app.on_event("startup")
async def start_db_pool():
    """Initialize PostgreSQL connection pool."""
    await init_db()


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
async def shutdown_db_pool():
    """Close PostgreSQL connection pool."""
    await close_db()


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
