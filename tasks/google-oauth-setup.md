# Google OAuth Setup — What the Dev Needs to Provide

**Date:** 2026-03-19
**Status:** Blocked — waiting on Google Cloud credentials

## What's Needed

Two values from the Google Cloud project:

1. **`GOOGLE_CLIENT_ID`** — looks like `123456789-xxxx.apps.googleusercontent.com`
2. **`GOOGLE_CLIENT_SECRET`** — looks like `GOCSPX-xxxxxxxxxxxx`

## Where to Get Them

1. Go to [Google Cloud Console → Credentials](https://console.cloud.google.com/apis/credentials)
2. Find the existing OAuth 2.0 Client ID (or create one of type "Web application")
3. Copy the Client ID and Client Secret

## Required Redirect URI

The OAuth client **must** have this redirect URI in "Authorized redirect URIs":

```
http://localhost:8000/auth/google/callback
```

If deploying to production later, also add:
```
https://financial-forecasting-api-XXXXXX.run.app/auth/google/callback
```

## Where to Put Them

Add to `/financial_forecasting/.env`:

```env
GOOGLE_CLIENT_ID=your-client-id-here
GOOGLE_CLIENT_SECRET=your-client-secret-here
```

The `.env` file already has `JWT_SECRET_KEY` — just append the two Google lines.

## What Happens After

1. Restart the backend: `cd financial_forecasting && source venv/bin/activate && python simple_server.py`
2. Open http://localhost:3000 → redirects to `/login`
3. Click "Sign in with Google" → Google consent screen → redirects back to Bedrock
4. JP is logged in with their Google account, full dashboard access

## Optional: Restrict Access

To limit who can log in, add to `.env`:

```env
ALLOWED_EMAILS=jp@pursuit.org,nick.simmons@pursuit.org
```

## Current System State

- Backend: running on http://localhost:8000 ✅
- Frontend: running on http://localhost:3000 ✅
- PostgreSQL: running on localhost:5432 (bedrock DB with seed data) ✅
- Pebble: running on http://localhost:8001 ✅
- Login page: renders, button wired to OAuth ✅
- Only missing piece: Google OAuth credentials
