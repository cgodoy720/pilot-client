# Lessons Learned

> Updated after every correction or mistake. Patterns to avoid repeating.
> Review at session start.

## 2026-03-18 — Production-Grade Security MVP

- **JWT and Fernet**: Both must derive from the same `JWT_SECRET_KEY`. Define it once early (after load_dotenv), use everywhere.
- **Production secret**: When `FRONTEND_URL` starts with `https`, fail fast if `JWT_SECRET_KEY` is missing or < 32 chars.
- **Dev bypass**: Never apply in production builds. Require `REACT_APP_DEV_BYPASS=true` AND localhost AND `NODE_ENV !== 'production'`.
- **Calendar**: Restrict to PBD server-side; reject `primary` and arbitrary calendar IDs. Surface re-auth UX when tokens expire.

## 2026-03-17 — Session Start

- No lessons recorded yet for this sprint. Will update as work progresses.
