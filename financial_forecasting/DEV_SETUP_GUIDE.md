# Financial Forecasting — Developer Setup Guide

## Overview

This app bridges Salesforce (grant pipeline) and Sage Intacct (accounting) to provide forecasting, cash flow projections, and data sync. The backend is FastAPI (Python), the frontend is React + TypeScript + Material-UI.

> **Fiscal Year Convention:** Pursuit's fiscal year follows the calendar year (January 1 – December 31). This is reflected in `GoalTracker.tsx`'s `getFYBounds()` and the `DateRangeSelector`'s "Current FY" preset.

## Architecture: How Auth Works

There are **two auth layers** — this is important to understand before you start:

| Layer | Purpose | How it works |
|-------|---------|--------------|
| **Google OAuth (frontend)** | User login to the dashboard | Users sign in with Google, get a JWT session token |
| **Salesforce OAuth (per-user)** | Connect a user's SF account | User clicks "Connect Salesforce" in Settings, does OAuth flow |
| **Salesforce service account (backend)** | Backend API calls (SOQL queries, sync, forecasting) | Uses username + password + security token via `simple-salesforce` |

The backend service account is the problem — it's tied to a personal account and requires a security token that resets frequently. **We recommend migrating this to JWT Bearer flow** (see "Recommended: JWT Bearer Migration" below).

---

## Quick Start (Current Setup)

### 1. Clone and install

```bash
# Backend
cd financial_forecasting
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

### 2. Create your `.env` file

Copy `env.production.template` to `financial_forecasting/.env` and fill in values. Use these env var names (they match `config.py`):

```env
# --- Google OAuth (dashboard login) ---
GOOGLE_CLIENT_ID=<ask team>
GOOGLE_CLIENT_SECRET=<ask team>
GOOGLE_REDIRECT_URI=http://localhost:8000/auth/google/callback

# --- JWT Session (required) ---
# Generate with: openssl rand -hex 32
JWT_SECRET_KEY=<paste output of openssl rand -hex 32>

# --- Salesforce (backend service account) ---
SALESFORCE_USERNAME=<salesforce username>
SALESFORCE_PASSWORD=<salesforce password>
SALESFORCE_SECURITY_TOKEN=<salesforce security token>
SALESFORCE_CLIENT_ID=<connected app consumer key>
SALESFORCE_CLIENT_SECRET=<connected app consumer secret>
SALESFORCE_DOMAIN=login

# --- Sage Intacct ---
SAGE_COMPANY_ID=pursuit
SAGE_USER_ID=pursuit-dev
SAGE_USER_PASSWORD=<ask team>
SAGE_SENDER_ID=pursuit
SAGE_SENDER_PASSWORD=<ask team>

# --- Optional integrations ---
ANTHROPIC_API_KEY=<ask team>
FIREFLIES_API_KEY=<ask team>
SLACK_BOT_TOKEN=<ask team>
```

### 3. Run

```bash
# Terminal 1 - Backend
cd financial_forecasting
python simple_server.py
# Or: ./start_server.sh
# Runs on http://localhost:8000

# Terminal 2 - Frontend
cd financial_forecasting/frontend && npm start
# Runs on http://localhost:3000
```

### 4. Get a Salesforce Security Token (if using current auth)

1. Log into Salesforce
2. Click your avatar > **Settings**
3. Search "Reset My Security Token" in the sidebar
4. Click **Reset Security Token** — it gets emailed to you
5. Add it to your `.env` as `SALESFORCE_SECURITY_TOKEN`

Note: This token resets every time your password changes or you log in from a new IP.

---

## Production Checklist

Before deploying to production:

- [ ] **JWT_SECRET_KEY**: Set and at least 32 chars. Generate with `openssl rand -hex 32`. The app fails to start if missing in production.
- [ ] **ALLOWED_EMAILS**: Recommended. Comma-separated list of allowed login emails.
- [ ] **FRONTEND_URL**: Must start with `https` for production. Used for OAuth redirect.
- [ ] **GOOGLE_REDIRECT_URI**: Must match your production backend URL + `/auth/google/callback`. See [OAUTH_SETUP.md](OAUTH_SETUP.md) for Cloud Console steps.
- [ ] **Dev bypass**: Never set `REACT_APP_DEV_BYPASS=true` in production builds.

---

## Security Notes

- **Dev bypass**: `REACT_APP_DEV_BYPASS=true` skips auth on localhost only. It is disabled in production builds (`NODE_ENV=production`).
- **Debug endpoint**: `/debug/config` requires authentication in production.
- **Calendar**: Only the PBD shared calendar is accessible. Personal calendars are blocked.

---

## Recommended: Migrate to JWT Bearer Flow

The current backend auth uses a personal username + password + security token. This is fragile. JWT Bearer flow eliminates passwords entirely — the backend authenticates with a certificate.

See the full migration steps in the original DEV_SETUP_GUIDE (JWT Bearer section). Summary: generate a certificate, configure Salesforce Connected App for "Use digital signatures", pre-authorize the integration user, update `.env` to use `SF_PRIVATE_KEY_PATH` instead of password/token.

---

## PBD Calendar

**PBD_CALENDAR_ID** must be set in `.env` for the Priorities page calendar to show events. If unset, the backend uses a hardcoded default. The frontend fallback in `MyDashboard.tsx` must match the backend default. Override only when using a different shared calendar.

---

## Common Issues

| Issue | Fix |
|-------|-----|
| `SalesforceAuthenticationFailed` | Security token is wrong or expired. Reset it in Salesforce Settings. |
| `INVALID_SESSION_ID` | Token expired mid-session. Restart the backend. |
| Frontend can't reach backend | Check `REACT_APP_API_URL` is set to `http://localhost:8000` |
| Google OAuth redirect fails | Ensure `GOOGLE_REDIRECT_URI` matches Google Cloud Console |
| Calendar empty / "needs re-auth" | Log out and sign in again to refresh Google tokens |
| Sage Intacct connection fails | Verify `SAGE_SENDER_PASSWORD` is correct |

---

## Project Structure (Key Files)

```
financial_forecasting/
├── simple_server.py          # FastAPI backend (port 8000) - all API routes
├── config.py                 # Credential configuration (reads SALESFORCE_*, SAGE_*)
├── .env                      # Environment variables (DO NOT COMMIT)
├── frontend/
│   ├── src/
│   │   ├── App.tsx
│   │   ├── contexts/AuthContext.tsx
│   │   ├── services/api.ts
│   │   └── pages/             # Priorities, Dashboard, Pipeline, Settings, etc.
│   └── package.json
├── start_server.sh           # Start backend with Slack check
└── Dockerfile                # Container build (uses simple_server:app)
```
