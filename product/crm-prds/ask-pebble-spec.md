# Ask Pebble — Tiered Query Router & Chat Interface

> Version: 0.1 | Status: Design Approved | Date: 2026-03-23
> Author: JP
> Dependencies: Pebble Stage 2 CRM bridge (partial); standalone for chat + L0/L1
> Covers PRD scope: #11 (Prospect Intelligence) — chat, disambiguation, tiered research, batch workflow

---

## Purpose

Pebble currently treats every query the same — full research pipeline (~$0.20-0.50/prospect, 60-120s). Most questions ("What's Jane's title?") need a CRM lookup, not a research pipeline. Ask Pebble adds a progressive complexity router so the right amount of machinery runs for each query.

**Key principle:** Pebble handles prospect research, CRM intelligence, and fundraising data. It is NOT a general-purpose assistant. When a query is outside Pebble's domain, it suggests CoWork or a simpler Bedrock feature instead.

---

## The Progressive Deepening Model

The core user journey is: **quick question → dig deeper → full research**. Each step builds on the last, connected by the chat thread.

### A. Chat Queries (instant → seconds)

Quick questions answered directly in the chat. No research pipeline involved.

| Level | Name | Cost | Speed | Examples |
|-------|------|------|-------|---------|
| **Redirect** | Not Pebble's job | Free | Instant | "Draft an email" → CoWork. "Create an opportunity" → Bedrock Pipeline. |
| **L0** | CRM Lookup | Free | <1s | "What's Jane's title?", "Show open opportunities", "Pipeline value?" |
| **L1** | CRM Analysis | ~$0.003 | 2-5s | "Summarize our relationship with Acme", "Which deals are stale?" |

These use the CRM bridge (Salesforce data) + optional Haiku synthesis. No external data sources.

### B. Research Tiers (seconds → minutes, with human review gates)

Multi-stage prospect research with human validation between each tier.

| Tier | Name | Cost/Prospect | Speed | What It Produces |
|------|------|--------------|-------|-----------------|
| **T1** | ID & Triage | ~$0.005 | 5-10s | Identity confirmation + quick profile card |
| **T2** | Structured Intelligence | ~$0.05 | 15-30s | Balanced findings across 5 dimensions |
| **T3** | Full Research Brief | ~$0.20-0.50 | 60-120s | Comprehensive verified profile (Opus synthesis) |
| **T4** | Network Intelligence | ~$0.01 | 10-30s | LinkedIn connections, warm intro paths (Future — Stage 2+) |

**The 5 research dimensions (T2/T3):**
1. Giving capacity (donations, grants, political contributions)
2. Organizational affiliations (current titles, employer, sector)
3. Board positions & leadership (nonprofit boards, corporate boards, advisory roles)
4. Wealth sources & financial footprint (SEC filings, federal awards, 990 grant-making)
5. Comparable giving to similar organizations (orgs like Pursuit's mission/size)

### Where Each Interaction Lives

| Interaction | In Chat | On Pebble Page |
|------------|---------|----------------|
| L0/L1 queries | Answer directly | — |
| T1 for 1-3 prospects | Profile cards in chat | — |
| T1 for 4+ (batch) | "T1 complete, see table" | ProspectTierTable with checkboxes |
| T2 results | Summary + "View details" link | Full findings on Pebble page |
| T3 full brief | Summary + "View Full Profile →" | Full profile in Research tab |

**Rule:** Simple answers stay in the chat. Structured batch results and full profiles live on the Pebble page.

---

## Bulk Import Integration

"Run Pebble Research" → renamed **"Start Tiered Research"**

The existing Bulk Import tab's one-click research button runs the full pipeline on EVERY prospect. The new design replaces this with progressive tiered research:

1. Paste CSV → Parse → Preview (unchanged)
2. Map columns → Preview rows (unchanged)
3. Click "Start Tiered Research" → T1 runs on all prospects
4. T1 completes → ProspectTierTable with identity results + checkboxes
5. User reviews, selects → "Advance Selected → T2"
6. T2 completes → table updates with structured findings
7. User reviews, selects → "Advance Selected → T3"
8. T3 completes → "View Full Profile" links to Research tab

**Cost comparison (20 prospects):**
- Old: 20 x $0.30 = **$6.00** (full pipeline on everyone)
- New: 20 x $0.005 (T1) + 10 x $0.05 (T2) + 5 x $0.30 (T3) = **$2.10** (progressive)

Max 500 prospects per batch. Rate-limited: 2 batch requests per minute.

---

## Router Architecture

### Hybrid: Regex → Haiku LLM Fallback

```
Query arrives → Regex classifier (free, instant)
  ├─ Match (confidence >= 0.8) → Route directly
  ├─ No match → Haiku LLM classifier (~$0.001, <1s)
  │    └─ If confidence < 0.7 → default to L1
  └─ Out of scope → Redirect with suggestion
```

The regex layer catches obvious patterns ("what's [name]'s title?" → L0, "research [name]" → T1). The Haiku fallback handles ambiguous queries and returns structured JSON with level, intent, entities, and confidence.

**Auto mode** is the default — the router decides. Users can also manually select a mode (Quick Answer, ID & Triage, Structured Intel, Full Research) via a dropdown.

---

## Multi-Layer Disambiguation

Before any handler executes, a readiness gate checks whether Pebble has enough information to proceed. Three layers, entity-agnostic:

**Layer 1 — CRM Multi-Match:** Search Salesforce objects relevant to the query intent. If 2+ matches → present options. If 0 → "new entity" flow. If 1 → proceed. Uses SOSL for cross-entity search (one API call, not 3 separate SOQL queries).

**Layer 2 — Cross-Entity Ambiguity:** When a query matches across object types (e.g., "MetLife" matches an Account, a Contact, and 3 Opportunities), present entity-type selection options.

**Layer 3 — Public Data Identity Risk (T2/T3 only):** Even with a confirmed CRM record, assess whether the name is distinct enough for public data sources. Common name + no org = warn before expensive research.

Disambiguation options render as clickable buttons in the chat. User can click or type a freeform response.

---

## Research Readiness Guardrail

| Situation | What Pebble Does |
|-----------|-----------------|
| CRM match with name + org | Proceed |
| New prospect with full name + org | Proceed |
| New prospect, name only, no org | Warn: "FEC/SEC results may include multiple people. Add an org?" |
| Common name + no org + user insists | Proceed at T2 only (not T3). Flag claims as `low_confidence_identity`. |
| CRM returns zero matches | Offer: quick check, full research, or skip |

---

## Orchestrator-Worker Redesign Direction

The current pipeline is sequential: parallel data fetches → template claims → foragers → quorum → synthesis. The target architecture uses **specialized worker clusters** with bounded autonomy:

- **Financial Cluster:** FEC + ProPublica 990 + USAspending + SEC/EDGAR — cross-references within cluster
- **Affiliation Cluster:** OpenCorporates + Wikipedia + EDGAR full-text — resolves current vs. former roles
- **Public Profile Worker:** Wikipedia full article + infobox → bio, career, activities
- **Network Worker (Stage 2+):** LinkedIn data → connections, shared contacts, intro paths

Each cluster has a tool call budget (10 API calls), time budget (60s), and a structured output contract. The orchestrator merges outputs, resolves conflicts, and maintains a scratchpad tracking progress, budget, and findings.

### Staged Build Path

| Stage | What Changes | When |
|-------|-------------|------|
| **A (First build)** | Chat + tiered workflow using EXISTING pipeline for T3. New T1/T2 handlers. | Next |
| **B** | Extract data fetches into worker cluster functions. Add bounded budgets + scratchpad. | After chat proven |
| **C** | Add intra-cluster cross-referencing. Improve synthesis for balanced output. | After B stable |
| **D** | Add network worker (LinkedIn). Full session-2 pattern. | When LinkedIn server-side |

---

## CRM Bridge Architecture

Pebble (port 8001) queries Bedrock (port 8000) for Salesforce data via HTTP.

**Primary endpoint:** `GET /api/salesforce/search?q=MetLife&limit=10` — SOSL cross-entity search returning Contacts, Accounts, and Opportunities in one API call. Already supported by `simple-salesforce` (`salesforce.py:339-362`).

**Secondary endpoints:** Type-specific SOQL searches for filtered queries (`/api/salesforce/contacts/search`, `/api/salesforce/accounts/search`, `/api/salesforce/opportunities/search`).

**Auth:** Internal API key (`BEDROCK_INTERNAL_API_KEY` env var, `X-Internal-Key` header) with `hmac.compare_digest`. Falls back to user JWT auth if key is empty (dev mode). Applied only to CRM bridge endpoints.

---

## Scope Awareness: "Not My Job"

| Query Intent | Redirect Target | Pebble's Response |
|-------------|----------------|-------------------|
| Email/outreach drafting | Claude CoWork | "Drafting is a CoWork task. I can pull prospect data for you to bring there." |
| CRM write operations | Bedrock page | "To create/edit, use the Pipeline page. I'm read-only for CRM data." |
| General AI tasks | Claude CoWork | "That's a great question for CoWork. I focus on prospect research." |
| Calendar/scheduling | Bedrock Priorities | "Check the Priorities page for calendar and tasks." |

The redirect handler offers a **helpful handoff** — pulling relevant Pebble data the user can bring to CoWork.

**Future:** Drive MCP integration to enrich L1 responses with Google Drive docs (proposals, meeting notes).

---

## Frontend Design

**Third tab** ("Ask Pebble") on the Pebble page, gated by `user?.email === 'jp@pursuit.org'`.

- **Chat area:** Scrollable messages (max-h ~500px). Each Pebble response includes a routing badge (e.g., "L0 - instant" or "T2 - 20s - $0.05"), text content, action links, and source chips.
- **Input:** Text field with mode dropdown (Quick Answer, ID & Triage, Structured Intel, Full Research, Auto). Cost/speed hint below input.
- **Disambiguation:** Clickable option buttons when `requires_clarification=true`. User can click or type freeform.
- **ProspectTierTable:** MUI DataGrid/Table for batch results with checkboxes, sort/filter, "Advance Selected" buttons. Renders below chat when batch research is active.
- **Loading:** L0 has no spinner (<1s). L1 shows "thinking..." text. T1-T3 show progress indicator + Stop button.

**Portable design:** `PebbleChat` component accepts `mode` ('embedded' | 'floating') and optional page `context`. Future: extract into floating pill on every Bedrock page.

---

## Security

| Countermeasure | What It Addresses |
|---------------|-------------------|
| **S1: Internal API key** | Service-to-service auth for CRM bridge (Pebble → Bedrock) |
| **S2: SOQL escape** | Injection prevention on search endpoints (`escape_soql_string()` from `security.py`) |
| **S3: Input validation** | Query capped at 500 chars; mode restricted to valid values; IDs length-limited |
| **S4: Tiered rate limiting** | L0: 30/min, L1: 15/min, T1: 15/min, T2: 10/min, T3: 5/min |
| **S5: JP-only gate** | Backend validates `PEBBLE_CHAT_ALLOWED_EMAILS` env var (defaults to `jp@pursuit.org`) |
| **S6: Prompt injection defense** | Haiku classifier uses `<user_query>` XML tags to separate user input from system instructions |

---

## Governance & Operations

Addresses the Pebble API governance gap identified in `product/DOCUMENTATION-REVIEW-2026-03-15.md` finding #14. Target: implemented before Sprint 3 self-service (Week 5-6 of team rollout).

### API Key Management
- **Internal key** (`BEDROCK_INTERNAL_API_KEY`): Rotate quarterly or on personnel change. Single env var, set identically on both Pebble and Bedrock services.
- **Anthropic keys**: Per-environment (dev/staging/prod), never shared. Stored in `.env`, not in code.

### Per-User Budget Caps
- **Daily research limit** per user role: `pebble_daily_limit` permission (e.g., IC: 20 research runs/day, Executive: 5/day)
- **Monthly aggregate cap** per user role: `pebble_monthly_cap` permission (e.g., IC: $50/month, Executive: $10/month)
- **Per-prospect cap**: Existing $0.50/prospect budget cap remains for T3 research

### Cost Monitoring
- Aggregate costs per user, per tier, per day in Pebble's SQLite `research_sessions` table
- Future: monitoring dashboard tab on Pebble page (Stage 4C in evolution roadmap)

### Alert Thresholds
- **Warn** at 80% of daily cap (in-app notification)
- **Hard-stop** at 100% of daily cap (request rejected with clear message)
- **Admin alert** on unusual patterns (e.g., 3x normal daily spend for a user)

### Audit Logging
- All chat queries logged: user email, tier routed to, cost, timestamp, conversation_id
- All research runs logged per existing `research_sessions` table with cost_usd
- Feedback logged per existing `feedback` table

---

## T1 LinkedIn Enhancement (Contingent on Stage 2D)

Once LinkedIn data is server-side (Stage 2D of evolution roadmap), T1 (ID & Triage) adds a lightweight **in-network check**:

- Query `linkedin_contacts` table for team member connections to the prospect
- Return count + names on the identity card (e.g., "Connected to: Nick Simmons, Sarah Lee")
- This is NOT T4's full network mapping — it's a boolean enrichment to the identity card
- T4 remains the tier for ranked intro paths, shared contacts, and connection strength analysis

See `product/crm-prds/pebble-network-intro.md` for the full T4 (Network Intelligence) spec.

---

## Build Order

### Phase 1: Foundation (backend plumbing)
1a. Security: internal API key middleware, SOQL escape fixes
1b. Search endpoints: contacts, accounts, opportunities (SOSL + SOQL)
1c. CRM bridge (`crm_bridge.py`)
1d. Readiness module (`readiness.py`) — multi-layer disambiguation

### Phase 2: Chat Core (conversational interface)
2a. Router + schemas (`router.py`, `chat.py`)
2b. L0 + Redirect handlers
2c. Chat UI (`PebbleChat` + `ChatMessage`) + JP gate
2d. Chat persistence (SQLite)
2e. L1 handler

### Phase 3: Research Tiers
3a. T1 handler: ID & Triage
3b. ProspectTierTable component
3c. T2 handler: Structured Intelligence
3d. Orchestrator refactor: extract `research_single_prospect()`
3e. T3 handler: Full Research Brief

### Phase 4: Batch Workflow
4a. Batch research endpoint (T1 on list, max 500)
4b. Advance Selected workflow (T1 → T2 → T3 with review gates)
4c. Batch state persistence (SQLite)

### Future Phases
- **Phase 5:** Orchestrator redesign Stage B (worker clusters, bounded autonomy, scratchpad)
- **Phase 6:** T4 Network Intelligence (when LinkedIn data is server-side)
- **Phase 7:** Floating pill extraction (PebbleChat as Layout-level component)

---

## Related Documentation

- `tasks/pebble-evolution-roadmap.md` — 4-stage technical roadmap (Stages 1-4). This spec is the interaction layer on top.
- `product/crm-prds/pebble-network-intro.md` — T4 (Network Intelligence) full spec. Blocked on learning platform integration.
- `product/crm-architecture/integration-register.md` — Integration #9 (Pebble). CRM bridge makes it bidirectional.
- `product/crm-architecture/feature-register.md` — F18 (AI prospect intelligence). Ask Pebble is the delivery mechanism.
- `product/ONBOARDING-ADDENDUM.md` — Team-facing description of Pebble evolution and Ask Pebble interaction model.
