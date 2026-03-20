# Pebble MVP — 1-Week Sprint Plan

**Version:** 1.1
**Date:** March 18, 2026
**Status:** MVP complete; Stage 1 enhancements shipped 2026-03-20
**Scaffolding:** MVP → v2 path defined

> **Note (2026-03-20):** This is the original Pebble MVP sprint spec. It documents the design decisions and constraints that shaped the current system. Stage 1 enhancements (Wikipedia full article parsing, temporal accuracy, session history, feedback, export, stop button) are now complete. For the full 4-stage evolution plan (Stages 2-4 are future work), see `tasks/pebble-evolution-roadmap.md`.

---

## 1. Verified Assumptions (Triple-Checked)

### API Pricing (Anthropic — Official Source)

| Model | Input | Output | Source |
|-------|--------|--------|--------|
| Claude Haiku 4.5 | $1/MTok | $5/MTok | [docs.anthropic.com/pricing](https://docs.anthropic.com/en/about-claude/pricing) |
| Claude Sonnet 4.6 | $3/MTok | $15/MTok | Verified 2026-03-18 |
| Claude Opus 4.6 | $5/MTok | $25/MTok | Verified 2026-03-18 |

**Model IDs (Claude API):** `claude-haiku-4-5-20251001`, `claude-sonnet-4-6`, `claude-opus-4-6` ([models overview](https://docs.anthropic.com/en/docs/about-claude/models/overview))

**Batch API:** 50% discount on both input and output. **Prompt caching:** 90% off cached tokens. Defer both to v2.

### Data Sources (Verified)

| Source | Endpoint | Auth | Rate Limit | Notes |
|--------|----------|------|------------|-------|
| ProPublica 990 | `https://projects.propublica.org/nonprofits/api/v2` | None | Not documented | GET /search.json, GET /organizations/:ein.json. Free. |
| SEC EDGAR | `https://data.sec.gov/` | User-Agent header required | 10 req/sec | CIK lookup, submissions, company facts. Free. |
| FEC OpenFEC | `https://api.open.fec.gov/` | API key (DEMO_KEY for testing) | 1000/hr with key | Individual contributions by name. Sign up at fec.gov. |

**ProPublica caveat:** API is "work in progress and subject to change." Monitor [projects.propublica.org/nonprofits/api](https://projects.propublica.org/nonprofits/api) for updates.

### Integration Contract (Integration #9)

From `product/crm-architecture/integration-register.md`:

- `POST /api/v1/research/request` — Bedrock sends contact IDs
- `GET /api/v1/research/profiles/{contact_id}` — Profile JSON with claims, sources, confidence
- `POST /api/v1/research/feedback` — claim_id, correct: bool

**Env vars:** `PEBBLE_API_URL`, `PEBBLE_API_KEY` (Bedrock client).

---

## 2. Reliability & Performance Constraints

### Non-Negotiables

1. **Every claim has source_url** — Schema validator rejects claims without `source_url`. CLAUDE.md Rule 9.
2. **Per-prospect cost cap $0.50** — Pipeline sums costs; aborts remaining agents if cap exceeded.
3. **Partial profiles on failure** — Return `{ profile, confidence, failed_agents, partial: true }` when agents fail; never silent drop.
4. **harness_log** — SQLite table for agent outcomes (agent_name, outcome, cost, timestamp) from Day 1 for debugging.

### WorkerHarness Gates (from model-tiers v2)

```
DISPATCH → COST CHECK → EXECUTE → VALIDATE → ACCEPT
              ↓             ↓           ↓
         Over budget?   Timeout?   Schema fail?
         KILL           KILL       RETRY / ESCALATE / KILL
```

### Context Compression

- Profile Synthesizer input: max 5K tokens. Pre-compress or truncate if exceeded.
- Workers extract JSON; foragers compress to draft; queen reads compressed summaries.

---

## 3. Architecture: Bee Hierarchy (Unchanged)

| Tier | MVP Implementation | v2 (Full) |
|------|--------------------|-----------|
| Worker | Haiku (no Ollama) | Local Ollama on Mac Mini |
| Drone | Haiku | Haiku |
| Forager | Sonnet | Sonnet |
| Queen | Opus | Opus |

**MVP:** Worker tier routes to Haiku. No Mac Mini. Cost ~$0.25/prospect at full pipeline.

---

## 4. Sprint Scope (5 Days)

### Day 1: Foundation

- Pebble FastAPI scaffold: `POST /api/v1/research/request`, `GET /api/v1/research/profiles/{id}` (stub)
- ModelClient: Anthropic-only; Worker tier → Haiku
- WorkerHarness: timeout 120s, retries 3, schema validation, cost_cap $0.50/call
- **ProspectBudgetTracker:** Sum costs per prospect; abort at $0.50
- **harness_log:** SQLite table
- Env: `ANTHROPIC_API_KEY`

### Day 2: Stage 1 (Enrich)

- CSV parse + prospect schema
- ProPublica client: GET /organizations/:ein.json (EIN from prospect or search)
- SEC client: User-Agent required; CIK lookup
- FEC client: API key from env; contributor search
- Extraction: Haiku per document type; schema validator rejects claims without source_url
- Batch summary: Haiku per ~50 contacts (MVP batch size)

### Day 3: Stage 2 + Stage 3 (Reduced)

- Stage 2: NetworkX graph, quick-score formula, optional Haiku explanation
- Stage 3 MVP agents: (1) 990/Filing, (2) SEC/FEC, (3) News relevance (Haiku), (4) **Fact-Check** (Opus — minimal: verify claims vs sources), (5) Profile Synthesizer (Opus)
- Profile schema: `{ claims: [{ text, source_url, confidence }], summary, confidence_score }`

### Day 4: Bedrock Integration

- Bedrock: PEBBLE_API_URL, PEBBLE_API_KEY; call Pebble from Contact/Lead
- Profile display: claims with sources, confidence
- `POST /research/feedback`: log to SQLite

### Day 5: Polish + Verification

- Error handling: timeouts, rate limits, partial failures
- Run 5–10 contacts; confirm profiles, costs, harness_log

---

## 5. MVP → v2 Scaffolding

### Design for Upgrade

| Component | MVP | v2 Upgrade Path |
|-----------|-----|-----------------|
| **Worker tier** | Haiku | Add Ollama client; route Worker agents to local; keep Haiku fallback |
| **Storage** | SQLite | PostgreSQL; same schema, migrate with script |
| **Agents** | 5 (Filing, SEC/FEC, News, Fact-Check, Synthesizer) | Add: Philanthropy, Wealth Indicator, Entity Resolution, Real Estate |
| **Batch API** | Sync only | Add async queue; Batch API for bulk runs |
| **Prompt caching** | None | Add cache_control to system prompts |
| **harness_log** | SQLite | PostgreSQL; add Feedback Loop 2 dashboard |
| **Profile review UI** | None | Bedrock: ✓/✗ per claim |

### v2 Triggers

- **Mac Mini / Ollama:** When prospect volume > 50/week or PII sensitivity requires local extraction
- **PostgreSQL:** When Bedrock merges to learning platform or multi-user
- **Full 10 agents:** When MVP profiles show gaps (philanthropy patterns, entity disambiguation)
- **Batch API:** When bulk runs (e.g. 75 prospects) exceed 5 min sync timeout

### No-Rewrite Principles

1. **ModelClient** — Add `_call_ollama` branch; TIER_CONFIGS already has Worker config
2. **AGENT_TIERS** — Add new agents to dict; routing table is extensible
3. **Profile schema** — Stable; v2 adds fields (e.g. philanthropy_score) without breaking
4. **API contract** — Integration #9 is fixed; no changes to request/response shape

---

## 6. File Structure

```
pebble/
├── README.md
├── requirements.txt       # fastapi, uvicorn, anthropic, httpx
├── .env.example          # ANTHROPIC_API_KEY, FEC_API_KEY, PEBBLE_API_KEY
├── main.py               # FastAPI app, routes
├── orchestrator.py       # Pipeline stages, ProspectBudgetTracker
├── model_client.py       # ModelClient, TIER_CONFIGS, AGENT_TIERS
├── harness.py            # WorkerHarness, schema validator
├── data_sources/         # propublica.py, sec.py, fec.py
├── storage/              # SQLite + harness_log
└── schemas/              # Profile, Claim, etc.
```

---

## 7. Success Criteria

- [ ] Pebble API runs; Bedrock calls succeed
- [ ] 5+ contacts produce profile with claims + source_url
- [ ] Cost per prospect < $0.50
- [ ] harness_log records all agent outcomes
- [ ] Feedback endpoint stores claim_id, correct
- [ ] No secrets in git

---

## 8. References

- [pebble-agent-model-tiers-v2.md](/Users/jp/Downloads/pebble-agent-model-tiers-v2.md)
- [pebble-agent-review-flags-v2.md](/Users/jp/Downloads/pebble-agent-review-flags-v2.md)
- [integration-register.md](../crm-architecture/integration-register.md) §9
- [Anthropic Pricing](https://docs.anthropic.com/en/about-claude/pricing)
- [ProPublica API](https://projects.propublica.org/nonprofits/api)
