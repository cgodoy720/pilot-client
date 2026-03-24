# Pebble Evolution Plan: 4-Stage Roadmap

## Context

Tested Pebble on "Jukay Hsu" — it missed that he's no longer CEO of Pursuit, his board seats on Partnership for NYC and the NYC Water Board. Root causes: Wikipedia only fetches summary extract (not full article/infobox), OpenCorporates is disabled (no API key), no 990 board parsing, LLM prompts don't enforce current-vs-past role distinction. Beyond fixing these, the user wants a phased roadmap from "solid individual research" to "live assistant across the whole system." Each stage delivers full user capability — no stubs, no dev modes.

**Re: Correct/Incorrect buttons** — they store feedback to SQLite (`feedback` table: claim_id + bool) but the feedback is never queried, never displayed, and never consumed for learning. Stage 1 fixes this.

> **Self-Service Rollout Pre-Requisite (2026-03-23):** Before opening Pebble to team self-service, add Pebble-specific permissions to the Settings page (`use_pebble_research`, `pebble_daily_limit`). The existing $0.50/prospect budget cap protects per-query costs, but no per-user limits exist. A new user could run dozens of research queries before anyone notices. Gate the `/pebble` nav item and API endpoints behind the new permission. Target: implement before Sprint 3 of the team rollout (Week 5-6). See also `product/crm-architecture/feature-register.md` F18.

## Related Plans
- **Ask Pebble Design Spec:** `product/crm-prds/ask-pebble-spec.md` — Conversational chat interface with tiered query routing (L0/L1 + T1-T4). The interaction layer that sits on top of this evolution roadmap. Design approved 2026-03-23.
- **Onboarding PRD:** `product/ONBOARDINGPRD.md` — Team-facing description of Pebble capabilities and rollout plan.
- **Onboarding Addendum:** `product/ONBOARDING-ADDENDUM.md` — Vision, 4-stage roadmap, bounded autonomy, sprint plan.

---

## STAGE 1: Research Quality + UX Foundation

**Deliverable**: A research tool fundraisers want to use daily — accurate profiles with board memberships, temporal clarity, downloadable output, session history, and real feedback.

### 1A. Wikipedia Full Article + Infobox Parsing

**Problem**: `wikipedia.py` calls `/page/summary` — returns only first paragraph. Board memberships, career history, current roles are in the full article body and infobox.

**Changes**:
- `pebble/data_sources/wikipedia.py` — add `fetch_full_profile(name)` that chains: search → summary → MediaWiki `action=parse` → infobox extraction. Returns `{extract, full_text, infobox: dict, categories}`
- New file `pebble/data_sources/wikipedia_parser.py` — `parse_infobox(wikitext)`, `extract_board_memberships(wikitext)`, `extract_career_history(wikitext)` using regex for MediaWiki templates
- `pebble/main.py` — swap `fetch_summary` for `fetch_full_profile` in phase 1 gather
- `pebble/orchestrator.py` — pass full wiki text (3000 chars) to philanthropy agent; add `claims_from_wikipedia_infobox()` template function for high-confidence structured claims from infobox fields
- `pebble/claim_templates.py` — add `claims_from_wikipedia_infobox(wiki_data)` producing claims for board seats, current role, education

### 1B. Temporal Accuracy in Prompts

**Problem**: LLM says "serves as" for expired positions. No distinction between current and past.

**Changes**:
- `pebble/harness.py` — modify extractor, philanthropy, and wealth prompt templates to add: "Distinguish current vs past roles. If a date range indicates a position ended, mark as 'former'. Use present tense only for clearly active positions."
- `pebble/orchestrator.py` — synthesis prompt: "Never state someone 'serves as' a role unless evidence shows the position is active."
- `pebble/schemas/profile.py` — add `temporal_status: str = "unknown"` (current|former|unknown) to Claim model

### 1C. Enable OpenCorporates

**Changes**:
- `pebble/.env.example` — add `OPENCORPORATES_API_KEY=`
- Already handled in `pebble/data_sources/opencorporates.py` — just needs key configured
- New file `pebble/storage/cache.py` — TTL cache for API responses (SQLite table `api_cache`) to stay within free-tier limits and avoid duplicate calls on re-research

### 1D. Download as Markdown/PDF

**Changes**:
- New file `pebble/export.py` — `render_profile_markdown(profile, prospect)` and `render_profile_pdf(markdown)` (using `weasyprint` or `reportlab`)
- `pebble/main.py` — add `GET /api/v1/research/profiles/{contact_id}/export?format=md|pdf`
- `pebble/requirements.txt` — add PDF library
- `Pebble.tsx` — download buttons (Markdown, PDF) on the profile card
- `pebbleApi.ts` — add `exportProfile(contactId, format)`

### 1E. Session History (Last 100, Sidebar Panel)

**Problem**: Profiles table uses `INSERT OR REPLACE` — no history. Re-running research overwrites previous results.

**Changes**:
- `pebble/storage/db.py` — new table `research_sessions` (id, contact_id, profile_json, cost_usd, prospect_name, prospect_org, status, created_at). Keep `profiles` as current-state cache. Add `get_recent_sessions(limit=100)`, `get_sessions_for_contact(contact_id)`
- `pebble/main.py` — add `GET /api/v1/research/history?limit=100` and `GET /api/v1/research/history/{contact_id}`. Modify `research_request` to also insert into `research_sessions`
- `Pebble.tsx` — right-side panel showing last 100 researched prospects (name, org, date, confidence). Click to reload that profile. Badge showing "Researched 3x"
- `pebbleApi.ts` — add `getHistory(limit)`, `getContactHistory(contactId)`

### 1F. Text Feedback + Display on Reopen

**Changes**:
- `pebble/storage/db.py` — alter `feedback` table: add `text TEXT`, `contact_id TEXT`, `user_id TEXT`. Add `get_feedback_for_contact(contact_id)`, `get_feedback_trends(days=30)` (aggregate: total, correct%, by source)
- `pebble/schemas/profile.py` — extend ResearchFeedback: add `text: str | None`, `contact_id: str | None`
- `pebble/main.py` — modify feedback endpoint to accept text/contact_id. Add `GET /api/v1/research/feedback/{contact_id}`, `GET /api/v1/research/feedback/trends`
- `Pebble.tsx` — text input next to Correct/Incorrect buttons. When displaying a profile, fetch and show previous feedback inline. Banner: "Previously researched Mar 15 — 4 correct, 1 incorrect"
- `pebbleApi.ts` — update `submitFeedback` to accept text; add `getContactFeedback`, `getFeedbackTrends`

### Stage 1 Verification
1. Research "Jukay Hsu" → profile shows board memberships from Wikipedia infobox, distinguishes current vs former roles
2. Download completed profile as markdown → all claims + sources render
3. Research same contact twice → shows "Previously researched" with prior feedback
4. History sidebar shows last 100 researches, clickable
5. Submit text feedback → visible when reopening that research

---

## STAGE 2: Internal Data Integration

**Deliverable**: Pebble sees Salesforce and LinkedIn data alongside public research. Won't re-research people already in the system.

### 2A. Pebble-to-Bedrock Bridge API

**Design**: Pebble calls Bedrock's existing Salesforce endpoints via HTTP (preserves separation, reuses cached queries).

**Changes**:
- New file `pebble/data_sources/bedrock_client.py` — `BedrockClient` with `find_contact(first, last, email)`, `get_contact_opportunities(id)`, `get_contact_giving_history(id)`, `get_account_by_name(name)`
- `simple_server.py` (Bedrock) — add `GET /api/salesforce/contacts/lookup?first_name=&last_name=&email=` and `GET /api/salesforce/contacts/{id}/giving-history`

> This bridge is also the foundation for Ask Pebble's CRM queries. L0 (CRM Lookup) and L1 (CRM Analysis) use the bridge for instant Salesforce lookups from the Pebble chat interface. The bridge uses an internal API key (`BEDROCK_INTERNAL_API_KEY`) for service-to-service auth and SOSL for cross-entity search. See `product/crm-prds/ask-pebble-spec.md`.

### 2B. Pre-Check: Don't Re-Research Existing Contacts

**Changes**:
- `pebble/main.py` — before pipeline loop, call `bedrock_client.find_contact()`. If found in Salesforce, attach `salesforce_contact_id`. If found in `research_sessions` (last N days), return cached profile with `cached: true`
- `pebble/schemas/profile.py` — add `salesforce_contact_id`, `existing_in_crm`, `cached`, `cached_date` to Profile
- `Pebble.tsx` — "Already in Salesforce" badge; "Cached from [date]" with "Re-research" button

### 2C. Enrich Profiles with Internal Data

**Changes**:
- `pebble/main.py` — after synthesis, call `bedrock_client.get_contact_giving_history()` if Salesforce contact found. Merge into profile
- `pebble/schemas/profile.py` — add `InternalData` model (last_gift_date, last_gift_amount, total_giving, opportunity_stage, opportunity_owner, account_name)
- `Pebble.tsx` — "Internal Data" section in profile card with giving history, color-coded (green active, orange lapsed, gray none)

### 2D. LinkedIn Integration (Server-Side)

**Problem**: LinkedIn contacts in browser localStorage — lost on browser switch, inaccessible to Pebble.

**Changes**:
- `pebble/storage/db.py` — new table `linkedin_contacts` (first_name, last_name, email, organization, title, connection_date). Functions: `save_linkedin_contacts()`, `find_linkedin_connections(name)`
- `pebble/main.py` — add `POST /api/v1/linkedin/import`, `GET /api/v1/linkedin/contacts`, `GET /api/v1/linkedin/connections/{contact_id}`
- `useLinkedInContacts.ts` — migration: on mount, POST localStorage contacts to Pebble API, then clear
- `Pebble.tsx` — LinkedIn import posts to Pebble API instead of localStorage

> **T1 Enhancement (contingent on this stage):** Once LinkedIn data is server-side, T1 (ID & Triage) adds a lightweight "in-network check" — a query against `linkedin_contacts` returning team member connection count and names for the prospect. This enriches the T1 identity card without running full T4 network mapping. See `product/crm-prds/ask-pebble-spec.md` and `product/crm-prds/pebble-network-intro.md`.

### Stage 2 Verification
1. Research a known Salesforce contact → "Already in Salesforce" badge + giving history
2. Re-research recently researched contact → shows cached results with "Re-research" option
3. Upload LinkedIn CSV → contacts persist across browsers (server-side)
4. Profile for a LinkedIn connection shows connection metadata

---

## STAGE 3: Intelligent Bulk Research + Categorization

**Deliverable**: Upload 100 names → auto-categorize into renewals, warm intros, insufficient capacity, cold prospects. Salesforce Tasks created for renewals. Network paths recommended for warm intros.

### 3A. Async Bulk Research Pipeline

**Problem**: Current endpoint processes sequentially in one blocking HTTP request. 100 prospects = 50 min.

**Changes**:
- New file `pebble/bulk_runner.py` — `BulkResearchRunner.run_batch(prospects, job_id, concurrency=5)` using `asyncio.Semaphore` for bounded parallelism
- New file `pebble/jobs.py` — in-memory `JobStore` (create_job, update_progress, get_job)
- `pebble/main.py` — add `POST /api/v1/research/bulk` (returns job_id immediately), `GET /api/v1/research/jobs/{job_id}` (status), `GET /api/v1/research/jobs/{job_id}/stream` (SSE for real-time progress)
- `Pebble.tsx` — bulk research UI: CSV upload → preview → start → progress bar with per-prospect status chips → categorized results table
- `pebbleApi.ts` — add `startBulkResearch`, `getJobStatus`, `streamJobProgress` (EventSource)

> The bulk pipeline uses a tiered approach: T1 (identity check, ~$0.005/prospect) → T2 (structured intelligence, ~$0.05/prospect) → T3 (full brief, ~$0.20-0.50/prospect), with human review gates between each tier. The user selects which prospects advance at each gate. "Run Pebble Research" button is replaced with "Start Tiered Research". Results render in a ProspectTierTable component with checkboxes, sort/filter, and "Advance Selected" buttons. See `product/crm-prds/ask-pebble-spec.md`.

### 3B. Fit Quorum (Is This Prospect Right for Pursuit?)

**Separate from verification quorum** — evaluates mission alignment, not claim accuracy.

**Changes**:
- New file `pebble/fit_evaluator.py` — `FitEvaluator.evaluate(profile, claims)` returns `{fit_score: 0-100, fit_category, signals}`. Rule-based scoring (tech interest, NYC connection, education philanthropy, diversity equity) plus LLM nuance evaluation
- `pebble/orchestrator.py` — add `evaluate_pursuit_fit()` after synthesis
- `pebble/harness.py` — register `fit_evaluator` agent at FORAGER tier

### 3C. Auto-Categorization Engine

**Changes**:
- New file `pebble/categorizer.py` — `ProspectCategorizer.categorize(profile, internal_data, linkedin_connections)`:
  - **RENEWAL**: existing donor → create renewal Task, assign to last Opportunity Owner
  - **INSUFFICIENT**: no giving capacity signals → remove, log to prevent re-research
  - **WARM_INTRO**: LinkedIn/network path exists → recommend connector
  - **ALREADY_ENGAGED**: active Opportunity in pipeline → skip
  - **COLD_PROSPECT**: new, no warm path → queue for manual review
- `pebble/storage/db.py` — add `category`, `fit_score`, `recommended_action` columns to `research_sessions`

### 3D. Salesforce Task Creation for Renewals

**Changes**:
- `pebble/data_sources/bedrock_client.py` — add `create_renewal_task(contact_id, opportunity_id, owner_id, notes)`
- `pebble/bulk_runner.py` — for RENEWAL category: auto-create Task via Bedrock. Subject: "Pebble: Renewal outreach for [Name]", Description: Pebble research summary
- `Pebble.tsx` — bulk results show category badges. "Create Tasks" button for selected renewals with confirmation dialog

### 3E. Network Mapping (Warm Intro Paths)

**Changes**:
- `pebble/storage/db.py` — new table `network_edges` (source_id, target_id, relationship_type: linkedin|board|employer|donor, strength)
- New file `pebble/network.py` — `NetworkMapper.build_graph()` from LinkedIn + Salesforce + research profiles. `find_connectors(prospect)` returns ranked list of internal people who can introduce
- `pebble/main.py` — add `GET /api/v1/network/connectors/{prospect_id}`
- `Pebble.tsx` — warm intro results show connector name + relationship path

### Stage 3 Verification
1. Upload 100-name CSV → all process with bounded concurrency, SSE progress updates
2. Results auto-categorize: renewals get Tasks created in Salesforce
3. Insufficient-capacity contacts flagged to prevent re-research
4. Warm-intro contacts show connector recommendation with network path

---

## STAGE 4: Live Assistant

**Deliverable**: Pebble runs proactively — auto-enriches new contacts, surfaces recommendations, monitors pipeline health.

### 4A. Real-Time Enrichment
- `simple_server.py` — after `create_contact` / `create_opportunity`, fire webhook to Pebble
- `pebble/main.py` — `POST /api/v1/webhooks/new-contact`, `POST /api/v1/webhooks/new-opportunity`
- New file `pebble/scheduler.py` — `on_new_contact()`, `periodic_re_research(stale_days=90)`, `monitor_opportunity_changes()`

### 4B. Proactive Recommendations
- New file `pebble/recommendations.py` — `suggest_prospects_to_research()`, `suggest_re_research()`, `suggest_warm_intros()`, `flag_news_events()`
- `pebble/main.py` — `GET /api/v1/recommendations`
- `Layout.tsx` — notification badge when recommendations exist

### 4C. Pipeline Monitoring Dashboard
- `Pebble.tsx` — "Monitor" tab: active jobs, cost tracking, source reliability, feedback accuracy trends, agent performance
- `pebble/main.py` — `GET /api/v1/metrics`, `GET /api/v1/metrics/costs`, `GET /api/v1/metrics/sources`

### Stage 4 Verification
1. Create new Salesforce contact → Pebble auto-researches within 5 min
2. Recommendations endpoint returns actionable items
3. Pipeline monitor shows live cost tracking and agent performance
4. Stale profile detector identifies contacts needing re-research

---

## New API Endpoints Summary

| Stage | Endpoint | Method |
|-------|----------|--------|
| 1 | `/api/v1/research/history` | GET |
| 1 | `/api/v1/research/history/{contact_id}` | GET |
| 1 | `/api/v1/research/profiles/{id}/export` | GET |
| 1 | `/api/v1/research/feedback/{contact_id}` | GET |
| 1 | `/api/v1/research/feedback/trends` | GET |
| 2 | `/api/salesforce/contacts/lookup` (Bedrock) | GET |
| 2 | `/api/salesforce/contacts/{id}/giving-history` (Bedrock) | GET |
| 2 | `/api/v1/linkedin/import` | POST |
| 2 | `/api/v1/linkedin/contacts` | GET |
| 2 | `/api/v1/linkedin/connections/{id}` | GET |
| 3 | `/api/v1/research/bulk` | POST |
| 3 | `/api/v1/research/jobs/{job_id}` | GET |
| 3 | `/api/v1/research/jobs/{job_id}/stream` | GET (SSE) |
| 3 | `/api/v1/network/connectors/{id}` | GET |
| 4 | `/api/v1/webhooks/new-contact` | POST |
| 4 | `/api/v1/webhooks/new-opportunity` | POST |
| 4 | `/api/v1/recommendations` | GET |
| 4 | `/api/v1/metrics` | GET |

## Data Model Changes Per Stage

**Stage 1**: new `research_sessions` table, new `api_cache` table, alter `feedback` (+text, contact_id, user_id), Claim gains `temporal_status`
**Stage 2**: new `linkedin_contacts` table, Profile gains `salesforce_contact_id`, `internal_data`
**Stage 3**: new `network_edges` table, new `bulk_jobs` table, `research_sessions` gains `category`, `fit_score`
**Stage 4**: new `webhook_events`, `recommendations`, `daily_metrics` tables

## Dependencies
- Stage 1 items are independent of each other (can parallelize)
- Stage 2 depends on Stage 1 (session history needed for pre-check)
- Stage 3 depends on Stage 2 (categorization needs internal data)
- Stage 4 depends on Stages 2+3 being stable

## Related Documentation

- `product/crm-architecture/integration-register.md` — Integration #9 = Pebble. Update as new capabilities land.
- `product/fundraising-team/phases/pebble-mvp-1-week-sprint.md` — Original Pebble MVP sprint spec. Captures design decisions and constraints that shaped the current system. Superseded by this roadmap for future stages.
- `product/archive/research-plan.md` — Archived Research page plan. Partially superseded by Pebble's evolution — the Research page may evolve into a Pebble-powered view.
- `product/crm-prds/README.md` — PRD #11 (Prospect Intelligence) is not yet written and should incorporate Pebble Stages 2-4 when drafted.
- `tasks/pebble-stage1-issues.md` — Known issues and deferred items from Stage 1 testing.
- `tasks/projects-salesforce-roadmap.md` — Pebble Stage 3 and Projects-Salesforce both create Salesforce Tasks; should share the Bedrock client API.
- `product/crm-prds/ask-pebble-spec.md` — Ask Pebble design spec (chat interface, tiered routing, CRM bridge, orchestrator redesign, governance). Design approved 2026-03-23.
