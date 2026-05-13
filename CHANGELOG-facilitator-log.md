# Facilitator Log — Changes & Review
**Branch:** `afiya/dev`
**Date:** 2026-05-13
**Author:** Afiya Augustine

---

## Overview

This document captures all changes made to the Facilitator Log feature within the **Cohort Hub** per-cohort facilitator workspace. The work spans both the `pilot-client` (frontend) and `test-pilot-server` (backend), and includes environment setup, authentication fixes, dependency resolution, and the full build-out of the two-tab Facilitator Log modal.

---

## Environment Setup

### Repositories Cloned & Branched
- Forked and cloned `cgodoy720/test-pilot-server` → `AAPursuit14/test-pilot-server`
- Forked and cloned `cgodoy720/pilot-client` → `AAPursuit14/pilot-client`
- Created branch `afiya/dev` on both repos

### `.env` Files Created
**`test-pilot-server/.env`**
```
PORT=7001
PG_PORT=5432
PG_HOST=<render-postgres-host>
PG_USER=ai_dev_env_db_user
PG_DATABASE=ai_dev_env_db
PG_PASSWORD=<redacted>
PG_SSL=true
OPENAI_API_KEY=sk-placeholder
SECRET=dev_secret_key_local
```
**`pilot-client/.env`**
```
VITE_API_URL=http://localhost:7001
```

---

## Bug Fixes & Setup Issues Resolved

### Frontend (`pilot-client`)
| Issue | Fix |
|-------|-----|
| `@tanstack/react-query` not installed | `npm install @tanstack/react-query` |
| `tailwindcss` PostCSS plugin missing | `npm install tailwindcss postcss autoprefixer` |
| Vite dev server needed restart to pick up new packages | Killed and restarted Vite |

### Backend (`test-pilot-server`)
| Issue | Fix |
|-------|-----|
| `OpenAI` client crashing on startup (no key) | Made instantiation conditional on `OPENAI_API_KEY` presence in `db/embeddings.js`; added `OPENAI_API_KEY=sk-placeholder` to `.env` |
| `@anthropic-ai/sdk` module not found | `npm install @anthropic-ai/sdk` |
| `SECRET` env variable missing (JWT signing) | Added `SECRET=dev_secret_key_local` to `.env` |
| PostgreSQL SSL error (`SSL/TLS required`) | Enabled `ssl: { rejectUnauthorized: false }` in `db/dbConfig.js` |

---

## Authentication Fix

### Problem
`afiya@pursuit.org` exists in **both** the `users` table (role: `staff`) and the `applicant` table. The original `unifiedAuthController.js` checked the `applicant` table first, causing staff users with dual records to always land on the applicant dashboard (`/apply`) instead of the staff dashboard (`/dashboard`).

### Fix (`controllers/unifiedAuthController.js`)
- **Reversed lookup priority:** `users` table is now checked first
- Staff/admin/builder accounts always take precedence regardless of any applicant record for the same email
- Applicant table is only reached if no `users` record exists (or the role is `applicant`)
- Removed incorrect redirect override — staff users now correctly redirect to `/dashboard`

---

## Database Migrations

### `builder_log` Tables (existing migration, applied to dev DB)
Ran `/migrations/create_builder_log_tables.sql`:
- `builder_log` — unified interaction log (behavioral, conversation, interview)
- `builder_log_builders` — junction table for additional involved builders
- `builder_log_support` — linked support tickets
- `builder_log_support_history` — audit trail for ticket status changes

### `cohort_log` Table (new)
Created to support the new Cohort tab in the Facilitator Log modal:

```sql
CREATE TABLE cohort_log (
    log_id                    SERIAL PRIMARY KEY,
    cohort_id                 UUID NOT NULL REFERENCES cohort(cohort_id),
    log_category              VARCHAR(30) NOT NULL,  -- 'facilitator_feedback' | 'cohort_feedback'
    created_by                INTEGER NOT NULL REFERENCES users(user_id),
    curriculum_status         VARCHAR(20),           -- 'thumbs_up' | 'thumbs_sideways' | 'thumbs_down'
    curriculum_status_notes   TEXT,
    curriculum_changes_today  TEXT,
    curriculum_changes_next   TEXT,
    flags                     TEXT,
    next_steps                TEXT,
    next_steps_action_required BOOLEAN DEFAULT false,
    created_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at                TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## Backend API Changes (`test-pilot-server`)

### New Endpoints (`routes/adminDashboard.js`)

#### `POST /api/admin/dashboard/cohort-logs`
Creates a new cohort-level facilitator log.

**Required:** `cohort_id`, `log_category`
**Optional:** `curriculum_status`, `curriculum_status_notes`, `curriculum_changes_today`, `curriculum_changes_next`, `flags`, `next_steps`, `next_steps_action_required`

#### `GET /api/admin/dashboard/cohort-logs?cohortId=<id>`
Fetches all cohort logs for a given cohort, joined with creator name and cohort name, ordered by most recent.

---

## Frontend Changes (`pilot-client`)

### `BuilderLogModal.jsx` — Full Redesign

The existing single-form modal was refactored into a **two-tab modal**:

#### Tab Bar
- Underline-style tab switcher at the top of the modal
- **Builder** tab (Users icon) — existing log form, unchanged
- **Cohort** tab (BookOpen icon) — new cohort-level log form

---

#### Builder Tab (unchanged functionality)
- Builder search (auto or pre-selected)
- Log type: Behavioral / Conversation / Interview
- Builders Involved multi-search
- Notes (required)
- Bond Blocks (behavioral/conversation only)
- Community Rating 1–5 (behavioral/conversation only)
- Code of Conduct toggle (behavioral/conversation only)
- Next Steps
- Support Case (optional, expandable)

---

#### Cohort Tab (new)

| Section | Details |
|---------|---------|
| **Cohort Search** | Auto-populates with the currently selected cohort; searchable dropdown |
| **Category Pills** | `Facilitator Feedback` (violet) \| `Cohort Feedback` (teal) |
| **Curriculum Status** | Three-button selector: 👍 Thumbs Up · — Neutral · 👎 Thumbs Down |
| **Curriculum Status Notes** | Free-text area beneath the status selector |
| **Changes/Updates to Day's Curriculum** | Toggle row — expands to a notes textarea when enabled |
| **Changes/Updates for Next Day's Curriculum** | Toggle row — expands to a notes textarea when enabled |
| **Flags** | Toggle row — expands to a textarea when enabled (no pill indicator) |
| **Next Steps** | Always-visible textarea with an **ACTION REQUIRED** checkbox; when checked, an ⚑ Action Required amber pill appears inline next to the section label |

---

### `LogsTab.jsx`
- Passed `cohorts` prop through to `BuilderLogModal` so the Cohort tab can auto-populate and search cohorts

---

## Files Changed

### `pilot-client`
```
src/pages/AdminDashboard/components/BuilderLogModal.jsx   ← full redesign
src/pages/AdminDashboard/tabs/LogsTab.jsx                 ← pass cohorts prop
package.json                                              ← added dependencies
package-lock.json                                         ← lockfile update
```

### `test-pilot-server`
```
controllers/unifiedAuthController.js   ← auth priority fix (users table first)
db/dbConfig.js                         ← SSL enabled
db/embeddings.js                       ← conditional OpenAI init
routes/adminDashboard.js               ← new cohort-logs POST + GET endpoints
```
