# Server Migration: simple_server.py to main.py

## Why We Migrated

`simple_server.py` grew to ~6,600 lines — a monolithic FastAPI file containing every endpoint, all business logic, credential management, and integration code in a single module. This created several problems:

| Problem | Impact |
|---------|--------|
| **Monolithic structure** | Every change risked breaking unrelated endpoints |
| **Synchronous Salesforce calls** | `simple_salesforce` blocked the event loop on every SOQL query |
| **No auth on most endpoints** | Endpoints were unprotected; auth was added ad-hoc |
| **No service isolation** | If Slack SDK failed to initialize, the entire server crashed |
| **Hardcoded credentials** | `config.py` imported credentials at module level; no `.env` support |
| **Untestable** | Global state and tightly coupled logic made unit testing impractical |

## What Changed

### Architecture: Before and After

**Before (simple_server.py)**
```
simple_server.py (6,600 lines)
├── get_salesforce()          # Global sync SF client
├── TTLCache + threading.Lock # In-memory cache
├── 50+ endpoint handlers     # All inline
├── config.py                 # Hardcoded credentials
└── No auth middleware
```

**After (main.py + routes/)**
```
main.py (~1,260 lines)
├── FastAPI app setup (CORS, sessions, rate limiting)
├── UnifiedMCPClient startup (7 services, graceful degradation)
├── Core endpoints (opportunities, accounts, contacts, forecasting)
└── Router registration (12 route files)

routes/                        # Modular by domain
├── auth.py                    # Google OAuth, Salesforce OAuth, JWT sessions
├── permissions.py             # Permission profiles, user management, locks
├── projects.py                # Project CRUD + SF task bridge
├── sf_dependencies.py         # Task dependency CRUD
├── opportunities_extra.py     # Bulk ops, stage management
├── payment_schedules.py       # Payment schedule CRUD
├── finance.py                 # Invoicing, payment sync, cashflow
├── sage.py                    # Sage Intacct master data
├── prospects.py               # Prospect import pipeline
├── activity_intelligence.py   # Activity feeds, integration health
├── slack_routes.py            # Slack channel messages, pipeline updates
└── ai.py                      # AI pipeline analysis, automation review

dependencies.py                # get_mcp_client() — shared FastAPI dependency
services/cache.py              # Thread-safe TTL cache singleton
services/crm_parser.py         # CRM message parsing

mcp_client/
├── unified_client.py          # Service registry (7 connect_* methods)
└── services/                  # Direct API wrappers
    ├── salesforce.py           # simple_salesforce (async wrapper)
    ├── sage_intacct.py         # Sage Intacct XML API
    ├── slack.py                # slack_sdk
    ├── google_drive.py         # Google Drive API
    ├── google_calendar.py      # Google Calendar API
    ├── gmail.py                # Gmail API
    └── fireflies.py            # Fireflies GraphQL API
```

### Key Design Patterns

**1. Dependency Injection**

Routes get the service client via FastAPI's `Depends()`:

```python
from dependencies import get_mcp_client

@router.get("/api/finance/awaiting-invoices")
async def get_awaiting_invoices(
    client: UnifiedMCPClient = Depends(get_mcp_client),
    user=Depends(check_permission("view_sage_invoices_payments")),
):
    salesforce = client.salesforce
    result = await salesforce.query_all(soql)
```

This eliminates circular imports (routes import from `dependencies.py`, not `main.py`) and makes testing straightforward (inject mock clients).

**2. Async Service Wrappers**

`simple_server.py` called `sf.query()` synchronously, blocking the FastAPI event loop. The new services run sync SDK calls in a thread pool executor:

```python
# mcp_client/services/salesforce.py
async def query(self, soql: str) -> dict:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, self.sf.query, soql)
```

**3. Graceful Degradation**

Each service connects independently at startup. If Slack or Fireflies credentials are missing, those services log a warning and the app continues running:

```python
# main.py startup_event()
try:
    await client.connect_slack(None)
except Exception as e:
    logger.warning(f"Slack connection failed: {e}")
    # App continues — Slack endpoints return 503
```

**4. Auth on All Endpoints**

Every ported endpoint uses either `require_auth` (authentication only) or `check_permission("permission_name")` (authentication + authorization via permission profiles).

## Migration Phases

| Phase | PR | What Happened |
|-------|-----|---------------|
| **Phase 1** | #42 | Removed mock MCP transport. `main.py` connects to Salesforce directly via `SalesforceLogin` 3-step fallback. Added `load_dotenv()`, `query_all()` pagination, fixed SOQL field mappings for Pursuit's NPSP org. |
| **Phase 2** | #43 | Extracted 50 endpoints from `simple_server.py` into 8 new route files. Created `dependencies.py` and `services/cache.py`. Reduced `main.py` from ~1,930 to ~1,260 lines. |
| **Phase 3** | — | Documentation (this file, MCP vision doc, DEV_SETUP_GUIDE update). |
| **Phase 4** | — | Deprecate `simple_server.py`, update Dockerfile. |
| **Phase 5** | — | Hardening: adversarial tests, frontend parity verification. |

## Key Architecture Notes

- **UnifiedMCPClient** is a service registry, not an MCP protocol client. The "MCP" naming is historical. See [mcp-architecture-vision.md](mcp-architecture-vision.md) for details.
- **Credentials** are read from `.env` via `os.getenv()`. The `config.py` module is legacy and being phased out.
- **SalesforceLogin fallback**: OAuth `client_credentials` is attempted first, then `SalesforceLogin` with security token, then `SalesforceLogin` without. The third option is what works for Pursuit's org.
- **simple_server.py** remains in the repo but is no longer the production entry point. It will receive a deprecation notice in Phase 4.

## Decision Log

| Date | Decision | Status |
|------|----------|--------|
| 2026-03-19 | Phase 1: Direct API connections, remove MCP StdioTransport | Merged (PR #42) |
| 2026-03-20 | Phase 2: Port 50 endpoints into 8 modular route files | Merged (PR #43) |
| 2026-03-21 | Phase 3: Documentation | In progress |
