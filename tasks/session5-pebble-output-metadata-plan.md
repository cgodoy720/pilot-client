# Track C Session 5: Pebble Output Metadata — Implementation Plan

> Status: APPROVED — Ready for implementation
> Created: 2026-03-26
> Continuation prompt at bottom of file

---

## Context

**What:** Add structured agent-level telemetry to every Pebble research output. Persist all tier runs (T1/T2/T3). Build hierarchical batch-first history view.

**Why:** Pebble needs to learn from itself. Every research run should capture which agents ran, what happened, what failed, and why — so patterns can be analyzed, costs tracked, and debugging is possible. The current system writes harness logs for T3 only, doesn't persist T1/T2 sessions, and has a flat history list that doesn't reflect the batch-based research funnel workflow.

**Spec (from `tasks/bedrock-ui-improvements.md`):** "Add to every Pebble research output: cost, number of agents that ran, quick log of work done. Make scratchpad viewable via click-through on the detailed log."

**Design decisions made with JP:**
1. **Learning log**: Structured metadata (~10-20KB/session) — agent outcomes, source record counts, cluster budgets, quorum decisions. NOT raw API payloads (those have 24h cache TTL in `api_cache` table and can be re-fetched from source APIs, but data may change).
2. **Persistence**: All tiers saved to `research_sessions`.
3. **History**: Forward-only (old sessions show as-is, no backfill). Batch-first hierarchical grouping.
4. **UI**: Expandable inline section. Chip shows `T2 · 4.2s · $0.012 · 6 agents`. Click expands agent table.
5. **CRM promotion flow**: Separate PRD — out of scope for this session.

---

## Architecture Overview

```
Tier Handler (T1/T2/T3)
  └─ builds agents_log: list[dict] during execution
      └─ returns in HandlerResponse.agents_log

main.py tiered endpoint
  ├─ generates batch_id (implicit for single-prospect)
  ├─ saves session with tier + agents_log + batch_id
  └─ returns agents_log + batch_id in API response

Frontend
  ├─ Chip: "T2 · 4.2s · $0.012 · 6 agents"
  ├─ Expandable AgentLogSection below each tier card
  ├─ Failed agents Alert on T3 profiles
  └─ Hierarchical history sidebar (batch → prospect → tier)
```

---

## Data Structures

### AgentLogEntry (dict schema, used everywhere)

```python
{
    "name": str,            # "web_search", "wikipedia", "financial_cluster", "haiku_identity", "quorum_verify", "profile_synthesizer"
    "outcome": str,         # "success" | "no_data" | "error" | "timeout" | "skipped" | "done" (clusters)
    "elapsed_seconds": float,
    "cost_usd": float,      # 0.0 for non-LLM agents
    "tokens_input": int,    # 0 for data fetches
    "tokens_output": int,
    "attempts": int,        # retry count or api_calls_used for clusters
    "error": str | None,    # truncated to 200 chars
    "records_found": int | None,  # for data sources: how many records returned
}
```

~180 bytes per entry. T1: ~5 entries. T2: ~10-15. T3: ~15-25. Well within budget.

---

## Implementation Steps (10 steps, ordered by dependency)

### Step 1: Schema migration — `pebble/storage/db.py`

**Add 3 columns to `research_sessions`** in `init_db()` (after line 146, following the existing ALTER TABLE pattern):

```python
# After the existing feedback migrations (line 145)
try:
    conn.execute("ALTER TABLE research_sessions ADD COLUMN tier TEXT")
except Exception:
    pass
try:
    conn.execute("ALTER TABLE research_sessions ADD COLUMN agents_log_json TEXT")
except Exception:
    pass
try:
    conn.execute("ALTER TABLE research_sessions ADD COLUMN batch_id TEXT")
except Exception:
    pass
```

**Extend `save_session()` (line 305)** with new parameters:

```python
def save_session(
    session_id: str,
    contact_id: str,
    profile: dict,
    prospect_name: str,
    prospect_org: str,
    cost_usd: float | None = None,
    status: str = "completed",
    tier: str | None = None,                    # NEW
    agents_log: list[dict] | None = None,       # NEW
    batch_id: str | None = None,                # NEW
) -> None:
```

INSERT becomes:
```sql
INSERT INTO research_sessions
    (id, contact_id, profile_json, cost_usd, prospect_name, prospect_org, status, tier, agents_log_json, batch_id)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
```

With `json.dumps(agents_log) if agents_log else None` for agents_log_json.

**Add `update_session_metadata()` function** (for T3 Path B — pipeline saves session without new fields, then handler updates):

```python
def update_session_metadata(
    contact_id: str,
    tier: str | None = None,
    agents_log: list[dict] | None = None,
    batch_id: str | None = None,
) -> None:
    """Update the most recent session for a contact with metadata fields."""
    conn = get_db()
    try:
        conn.execute(
            """UPDATE research_sessions
               SET tier = COALESCE(?, tier),
                   agents_log_json = COALESCE(?, agents_log_json),
                   batch_id = COALESCE(?, batch_id)
               WHERE id = (
                   SELECT id FROM research_sessions
                   WHERE contact_id = ?
                   ORDER BY created_at DESC LIMIT 1
               )""",
            (tier, json.dumps(agents_log) if agents_log else None, batch_id, contact_id),
        )
        conn.commit()
    finally:
        conn.close()
```

**Update `get_recent_sessions()` (line 328)** — add `tier`, `batch_id`, `cost_usd` to SELECT and result dicts.

**Update `get_session()` (line 362)** — add `agents_log_json`, `tier`, `batch_id` to SELECT. Parse agents_log:
```python
result["agents_log"] = json.loads(result.pop("agents_log_json")) if result.get("agents_log_json") else None
result["tier"] = result.get("tier")
result["batch_id"] = result.get("batch_id")
```

**Add `get_sessions_grouped()` function:**

```python
def get_sessions_grouped(limit: int = 100) -> list[dict]:
    """Return sessions grouped: batch -> prospect -> tier runs."""
    conn = get_db()
    try:
        rows = conn.execute(
            """SELECT id, contact_id, prospect_name, prospect_org, status,
                      profile_json, tier, batch_id, cost_usd, created_at
               FROM research_sessions
               ORDER BY created_at DESC LIMIT ?""",
            (limit,),
        ).fetchall()

        from collections import OrderedDict
        batches: OrderedDict[str, dict] = OrderedDict()

        for r in rows:
            profile = json.loads(r["profile_json"])
            session = {
                "id": r["id"],
                "contact_id": r["contact_id"],
                "prospect_name": r["prospect_name"],
                "prospect_org": r["prospect_org"],
                "status": r["status"],
                "tier": r["tier"],
                "cost_usd": r["cost_usd"],
                "claims_count": len(profile.get("claims", [])),
                "confidence_score": profile.get("confidence_score", "unknown"),
                "created_at": r["created_at"],
            }

            batch_key = r["batch_id"] or f"_implicit_{r['id']}"
            if batch_key not in batches:
                batches[batch_key] = {
                    "batch_id": r["batch_id"],
                    "created_at": r["created_at"],
                    "prospects": OrderedDict(),
                }

            prospect_key = r["contact_id"]
            if prospect_key not in batches[batch_key]["prospects"]:
                batches[batch_key]["prospects"][prospect_key] = {
                    "prospect_name": r["prospect_name"],
                    "prospect_org": r["prospect_org"],
                    "contact_id": r["contact_id"],
                    "runs": [],
                }
            batches[batch_key]["prospects"][prospect_key]["runs"].append(session)

        result = []
        for batch in batches.values():
            batch["prospects"] = list(batch["prospects"].values())
            result.append(batch)
        return result
    finally:
        conn.close()
```

---

### Step 2: HandlerResponse extension — `pebble/handlers/__init__.py`

Add one field to the dataclass (after line 30):

```python
agents_log: list[dict] = field(default_factory=list)
```

No other changes to this file. The `dispatch_handler` function passes through whatever the handler returns.

---

### Step 3: TieredResearchRequest schema — `pebble/schemas/profile.py`

Add `batch_id` field to `TieredResearchRequest` (line 56-63):

```python
class TieredResearchRequest(BaseModel):
    first_name: str = ""
    last_name: str = ""
    organization: str = ""
    contact_id: str | None = None
    tier: int = Field(1, ge=1, le=3)
    batch_id: str | None = None  # NEW: for batch grouping
```

---

### Step 4: T1 agent logging — `pebble/handlers/tier1.py`

The current code (lines 58-72) runs 4 data fetches in parallel via `asyncio.gather(return_exceptions=True)`, then checks each result individually.

**Replace the gather block (lines 58-72) with timed wrappers:**

```python
    agents_log: list[dict] = []

    async def _timed_fetch(fetch_name: str, coro) -> any:
        """Run a fetch coroutine, record timing and outcome to agents_log."""
        t0 = time.time()
        try:
            result = await coro
            records = None
            if isinstance(result, list):
                records = len(result)
            elif isinstance(result, dict):
                records = 1
            agents_log.append({
                "name": fetch_name,
                "outcome": "success" if result is not None else "no_data",
                "elapsed_seconds": round(time.time() - t0, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": None,
                "records_found": records if result is not None else 0,
            })
            return result
        except Exception as e:
            agents_log.append({
                "name": fetch_name,
                "outcome": "error",
                "elapsed_seconds": round(time.time() - t0, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": str(e)[:200],
                "records_found": None,
            })
            return None

    web_results, wiki_data, oc_data, fec_data = await asyncio.gather(
        _timed_fetch("web_search", asyncio.to_thread(search_person, name, org_name) if name else _noop()),
        _timed_fetch("wikipedia", asyncio.to_thread(fetch_full_profile, name) if name else _noop()),
        _timed_fetch("opencorporates", asyncio.to_thread(search_officers, name) if name else _noop()),
        _timed_fetch("fec", asyncio.to_thread(search_contributions, name, 3) if name else _noop()),
    )
```

**Wikipedia org fallback (lines 74-82):** If wiki_data is None and org fallback succeeds, append another agents_log entry for `"wikipedia_org_fallback"`.

**Haiku identity call (lines 118-143):** Wrap with timing:

```python
    if client and claims:
        t0_haiku = time.time()
        try:
            # ... existing client.complete() call (lines 124-131) ...
            usage = result.get("usage", {})
            haiku_cost = (usage.get("input_tokens", 0) * 1.0 + usage.get("output_tokens", 0) * 5.0) / 1_000_000
            cost += haiku_cost
            agents_log.append({
                "name": "haiku_identity",
                "outcome": "success",
                "elapsed_seconds": round(time.time() - t0_haiku, 3),
                "cost_usd": round(haiku_cost, 6),
                "tokens_input": usage.get("input_tokens", 0),
                "tokens_output": usage.get("output_tokens", 0),
                "attempts": 1,
                "error": None,
                "records_found": None,
            })
            # ... existing parsing (lines 136-141) ...
        except Exception as e:
            agents_log.append({
                "name": "haiku_identity",
                "outcome": "error",
                "elapsed_seconds": round(time.time() - t0_haiku, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": str(e)[:200],
                "records_found": None,
            })
            logger.warning("T1 identity assessment failed: %s", e)
```

**Return statement (line 159):** Add `agents_log=agents_log`.

---

### Step 5: T2 agent logging — `pebble/handlers/tier2.py`

After `run_cluster_research()` returns (line 88-90), build agents_log from scratchpad:

```python
    agents_log: list[dict] = []

    # Cluster-level entries
    for cluster_name in ["financial", "affiliation", "public_profile"]:
        budget_map = {
            "financial": scratchpad.financial_budget,
            "affiliation": scratchpad.affiliation_budget,
            "public_profile": scratchpad.profile_budget,
        }
        cluster_budget = budget_map[cluster_name]
        agents_log.append({
            "name": f"{cluster_name}_cluster",
            "outcome": scratchpad.cluster_status.get(cluster_name, "unknown"),
            "elapsed_seconds": round(cluster_budget.elapsed(), 3),
            "cost_usd": 0.0,
            "tokens_input": 0, "tokens_output": 0,
            "attempts": cluster_budget.api_calls_used,
            "error": ", ".join(cluster_budget.failed_sources) if cluster_budget.failed_sources else None,
            "records_found": None,
        })

    # Per-source outcome entries (from scratchpad.source_outcomes)
    for source_name, outcome in scratchpad.source_outcomes.items():
        agents_log.append({
            "name": source_name,
            "outcome": outcome,
            "elapsed_seconds": 0.0,  # per-source timing not tracked in clusters
            "cost_usd": 0.0,
            "tokens_input": 0, "tokens_output": 0,
            "attempts": 1,
            "error": None if outcome == "ok" else outcome,
            "records_found": None,
        })

    # Skipped sources
    for skipped in scratchpad.skipped_sources:
        if not any(a["name"] == skipped for a in agents_log):
            agents_log.append({
                "name": skipped,
                "outcome": "skipped",
                "elapsed_seconds": 0.0,
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 0,
                "error": "skipped",
                "records_found": None,
            })
```

**Forager activation (lines 112-131):** Wrap with timing:

```python
    t0_foragers = time.time()
    forager_claims = []
    if client:
        try:
            forager_claims = await activate_foragers(...)
            agents_log.append({
                "name": "foragers",
                "outcome": "success",
                "elapsed_seconds": round(time.time() - t0_foragers, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": None,
                "records_found": len(forager_claims),
            })
        except Exception as e:
            agents_log.append({
                "name": "foragers",
                "outcome": "error",
                "elapsed_seconds": round(time.time() - t0_foragers, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": str(e)[:200],
                "records_found": None,
            })
            logger.warning("T2 forager activation failed: %s", e)
```

**Return statement (line 178):** Add `agents_log=agents_log`.

---

### Step 6: T3 agent logging — `pebble/handlers/tier3.py`

T3 has two paths.

**Path A (T2 context exists, lines 58-153):**

Build agents_log by wrapping each major operation:

```python
    agents_log: list[dict] = []

    # investigate_connected_orgs (line 79)
    t0 = time.time()
    try:
        recommendations = await investigate_connected_orgs(...)
        agents_log.append({"name": "org_intelligence", "outcome": "success", "elapsed_seconds": round(time.time() - t0, 3), ...})
    except Exception as e:
        agents_log.append({"name": "org_intelligence", "outcome": "error", ...})

    # verify_urls (line 92)
    t0 = time.time()
    verified_claims = verify_urls(all_claims)
    agents_log.append({"name": "url_verification", "outcome": "success", ...})

    # quorum_verify_claims (line 115)
    t0 = time.time()
    verified_claims = await quorum_verify_claims(...)
    agents_log.append({"name": "quorum_verify", "outcome": "success", ...})

    # synthesize_profile (line 118)
    t0 = time.time()
    profile_data = synthesize_profile(...)
    agents_log.append({"name": "profile_synthesizer", "outcome": "success", ...})
```

**Update save_session call (line 145-153):** Add new params:

```python
    save_session(
        session_id=str(uuid.uuid4()),
        contact_id=contact_id,
        profile=profile,
        prospect_name=name,
        prospect_org=org_name,
        cost_usd=budget.total_cost_usd,
        status="completed",
        tier="T3",                    # NEW
        agents_log=agents_log,        # NEW
        batch_id=route.entities.get("batch_id"),  # NEW
    )
```

**Path B (full pipeline, lines 156-172):**

After `research_single_prospect()` returns (line 160-165), read harness_log entries:

```python
    else:
        # ... existing pipeline call ...

        # Reconstruct agents_log from harness_log (pipeline writes these)
        from ..storage.db import get_db
        start_ts = time.time() - 300  # generous 5-min window
        conn = get_db()
        try:
            rows = conn.execute(
                """SELECT agent_name, outcome, cost_usd, tokens_input, tokens_output,
                          attempts, elapsed_seconds, error
                   FROM harness_log WHERE prospect_id = ? AND created_at >= datetime(?, 'unixepoch')
                   ORDER BY created_at ASC""",
                (contact_id, start_ts),
            ).fetchall()
            agents_log = [
                {
                    "name": r["agent_name"],
                    "outcome": r["outcome"],
                    "elapsed_seconds": r["elapsed_seconds"] or 0.0,
                    "cost_usd": r["cost_usd"] or 0.0,
                    "tokens_input": r["tokens_input"] or 0,
                    "tokens_output": r["tokens_output"] or 0,
                    "attempts": r["attempts"] or 1,
                    "error": r["error"],
                    "records_found": None,
                }
                for r in rows
            ]
        finally:
            conn.close()

        # Update the session that research_single_prospect already saved
        from ..storage.db import update_session_metadata
        update_session_metadata(
            contact_id=contact_id,
            tier="T3",
            agents_log=agents_log,
            batch_id=route.entities.get("batch_id"),
        )
```

**Return statement (line 193):** Add `agents_log=agents_log`.

---

### Step 7: Tiered endpoint changes — `pebble/main.py`

**`tiered_research()` endpoint (line 268-319):**

After parsing the request (line 282) and before calling the handler:

```python
    # Generate batch_id for session grouping
    batch_id = req.batch_id or str(_uuid.uuid4())

    # Pass batch_id to handler via route entities
    route.entities["batch_id"] = batch_id
```

After calling the handler (line 308) and before the return:

```python
    # Save session for T1/T2 (T3 saves in its handler)
    if req.tier in (1, 2):
        from .storage.db import save_session
        session_profile = {
            "claims": [],
            "summary": response.text[:500] if response.text else "",
            "confidence_score": (response.data or {}).get("identity_card", {}).get("confidence", "unknown")
                if req.tier == 1 else "unknown",
            "partial": False,
            "failed_agents": [a["name"] for a in response.agents_log if a["outcome"] in ("error", "timeout")],
        }
        save_session(
            session_id=str(_uuid.uuid4()),
            contact_id=contact_id,
            profile=session_profile,
            prospect_name=name,
            prospect_org=req.organization or "",
            cost_usd=response.cost_usd,
            status="completed",
            tier=tier_label,
            agents_log=response.agents_log,
            batch_id=batch_id,
        )
```

**Update return value (line 311-319):**

```python
    return {
        "tier": tier_label,
        "text": response.text,
        "data": response.data,
        "cost_usd": response.cost_usd,
        "elapsed_seconds": elapsed,
        "sources": response.sources,
        "contact_id": contact_id,
        "agents_log": response.agents_log,   # NEW
        "batch_id": batch_id,                 # NEW
    }
```

**Update history endpoint (line 568-572):**

```python
@app.get("/api/v1/research/history", dependencies=[Depends(verify_api_key)])
async def research_history(limit: int = 100, grouped: bool = False):
    """Return research sessions, optionally grouped by batch."""
    if grouped:
        from .storage.db import get_sessions_grouped
        return {"batches": get_sessions_grouped(limit)}
    sessions = get_recent_sessions(limit)
    return {"sessions": sessions}
```

---

### Step 8: Frontend types — `pebbleApi.ts`

**Add AgentLogEntry interface (new):**

```typescript
export interface AgentLogEntry {
  name: string;
  outcome: string;
  elapsed_seconds: number;
  cost_usd: number;
  tokens_input: number;
  tokens_output: number;
  attempts: number;
  error: string | null;
  records_found: number | null;
}
```

**Update TieredResearchResponse (line 153-161) — add:**
```typescript
  agents_log: AgentLogEntry[];
  batch_id: string;
```

**Update ResearchSession (line 112-121) — add:**
```typescript
  tier: string | null;
  batch_id: string | null;
  cost_usd: number | null;
```

**Update ResearchSessionDetail (line 163-172) — add:**
```typescript
  agents_log: AgentLogEntry[] | null;
  tier: string | null;
  batch_id: string | null;
```

**Add batch history types (new):**

```typescript
export interface HistoryBatch {
  batch_id: string | null;
  created_at: string;
  prospects: HistoryProspect[];
}

export interface HistoryProspect {
  prospect_name: string;
  prospect_org: string;
  contact_id: string;
  runs: ResearchSession[];
}
```

**Update `tieredResearch` method** — add `batch_id?: string` to body type.

**Update `getHistory` method** — add `grouped` param:
```typescript
getHistory: (limit: number = 100, grouped: boolean = false) =>
    pebbleApi.get<{ sessions?: ResearchSession[]; batches?: HistoryBatch[] }>(
        '/api/v1/research/history', { params: { limit, grouped } }),
```

---

### Step 9: AgentLogSection component — NEW FILE

**File:** `financial_forecasting/frontend/src/components/pebble/AgentLogSection.tsx`

Reusable expandable section. Uses MUI `Accordion`, `Table`, `Chip`.

**Props:**
```typescript
interface AgentLogSectionProps {
  agents: AgentLogEntry[];
  defaultExpanded?: boolean;
}
```

**Render:**
- Accordion summary: `"6 agents | 4.2s total | $0.012"`
- Expanded content: compact MUI Table
  - Columns: Agent, Outcome (colored Chip), Time, Cost, Tokens, Records, Error
  - Outcome chips: success/done = green, error = red, timeout = orange, no_data/skipped = grey
  - Error column shows truncated error text on hover (Tooltip)
- After table: "Skipped: ..." line if any agents have outcome "skipped"

Follow patterns from `ProspectTierTable.tsx` (same directory) — MUI Table with Chip status indicators, compact sizing.

---

### Step 10: Pebble.tsx integration

**10a. Import AgentLogSection** at top.

**10b. Add batch tracking state** (near line 79):
```typescript
const [currentBatchId, setCurrentBatchId] = useState<string | null>(null);
```

**10c. Update `handleRequestResearch` (line 165-218):**
- Pass `batch_id: currentBatchId || undefined` in tieredResearch call
- On response, store `setCurrentBatchId(res.data.batch_id)`
- When clearing results or switching prospect, reset batch_id

**10d. Update tier result chip (line 407-412):**
```
`${tr.tier} · ${tr.result.elapsed_seconds.toFixed(1)}s · $${tr.result.cost_usd.toFixed(3)} · ${tr.result.agents_log?.length || '?'} agents`
```

**10e. Add AgentLogSection below each tier result card** (after line 460):
```tsx
{tr.result.agents_log && tr.result.agents_log.length > 0 && (
    <AgentLogSection agents={tr.result.agents_log} />
)}
```

**10f. Add failed_agents Alert in profile section** (after line 492, after the confidence chip):
```tsx
{profile.failed_agents && profile.failed_agents.length > 0 && (
    <Alert severity="warning" sx={{ mb: 2 }}>
        {profile.failed_agents.length} agent(s) failed:
        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5, flexWrap: 'wrap' }}>
            {profile.failed_agents.map((a, i) => (
                <Chip key={i} label={a} size="small" color="error" variant="outlined" />
            ))}
        </Box>
    </Alert>
)}
```

**10g. Replace history state and fetch** (lines 114-127):
- `historySessions` state → `historyBatches: HistoryBatch[]`
- `fetchHistory` calls `getHistory(100, true)` → sets `historyBatches`

**10h. Replace history sidebar rendering** (lines 971-1013):

Hierarchical tree:
```tsx
{historyBatches.map((batch, bi) => (
    <Box key={bi} sx={{ mb: 1 }}>
        {/* Multi-prospect batch header */}
        {batch.prospects.length > 1 && (
            <Typography variant="caption" color="text.secondary" sx={{ px: 1 }}>
                Batch · {batch.prospects.length} prospects
            </Typography>
        )}
        {batch.prospects.map((prospect) => (
            <Box key={prospect.contact_id} sx={{ pl: batch.prospects.length > 1 ? 1 : 0 }}>
                <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5, px: 1 }} noWrap>
                    {prospect.prospect_name || prospect.contact_id}
                </Typography>
                {prospect.prospect_org && (
                    <Typography variant="caption" color="text.secondary" sx={{ px: 1 }} noWrap>
                        {prospect.prospect_org}
                    </Typography>
                )}
                {prospect.runs.map((run) => (
                    <ListItemButton key={run.id} onClick={() => handleLoadSession(run)} dense sx={{ py: 0.25, pl: 2 }}>
                        <Chip label={run.tier || 'T3'} size="small" sx={{ mr: 1 }} />
                        <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>
                            {run.cost_usd != null ? `$${run.cost_usd.toFixed(3)}` : ''}
                        </Typography>
                        {run.confidence_score && run.confidence_score !== 'unknown' && (
                            <Chip label={run.confidence_score} size="small"
                                color={run.confidence_score === 'high' ? 'success' : run.confidence_score === 'medium' ? 'warning' : 'default'} />
                        )}
                    </ListItemButton>
                ))}
            </Box>
        ))}
        {bi < historyBatches.length - 1 && <Divider sx={{ my: 0.5 }} />}
    </Box>
))}
```

**10i. Update `handleLoadSession` (line 133):**

When loading a historical session, also request the agent log:
- `getSession()` already returns `agents_log` (from Step 1 db changes)
- Store it in state and display via AgentLogSection in the profile view

---

## Edge Cases

| Scenario | Handling |
|---|---|
| T1 runs but T2 never runs | T1 session saved independently. Single-run batch in history. |
| Batch cancelled mid-way | Completed prospect sessions are saved. Incomplete ones have no session. |
| T3 Path B agent log reconstruction | Query harness_log with prospect_id + `created_at >= (now - 5min)` to scope correctly. |
| Legacy sessions (no tier/batch_id) | Nullable columns. Frontend renders null tier as "T3" (only T3 saved sessions before). Grouped API treats null batch_id as implicit single-entry batch. |
| Same prospect researched on different days | Different batch_ids → appear as separate groups in history. |
| T1→T2→T3 same sitting | Frontend passes batch_id from T1 response to T2/T3 calls → all grouped. |
| Handler error before agents_log populated | Partial agents_log saved. AgentLogSection renders whatever is available. |

---

## Files Modified (Summary)

| File | Change Type |
|---|---|
| `pebble/storage/db.py` | Extend: schema migration, save_session params, new functions |
| `pebble/handlers/__init__.py` | Extend: add agents_log field |
| `pebble/schemas/profile.py` | Extend: add batch_id to TieredResearchRequest |
| `pebble/handlers/tier1.py` | Modify: wrap data fetches + Haiku with timing/logging |
| `pebble/handlers/tier2.py` | Modify: build agents_log from scratchpad + forager timing |
| `pebble/handlers/tier3.py` | Modify: wrap operations with timing, update save calls |
| `pebble/main.py` | Extend: session saving for T1/T2, batch_id, grouped history |
| `frontend/src/services/pebbleApi.ts` | Extend: new types, updated method signatures |
| `frontend/src/components/pebble/AgentLogSection.tsx` | **NEW FILE** |
| `frontend/src/pages/Pebble.tsx` | Modify: agent log rendering, failed_agents, batch tracking, hierarchical history |

---

## Verification

1. **Backend smoke test:** `curl -X POST http://localhost:8001/api/v1/research/tiered -H "X-API-Key: $KEY" -d '{"first_name":"John","last_name":"Smith","organization":"Acme","tier":1}'` — response should include `agents_log` array with 5+ entries and `batch_id`.

2. **Session persistence:** After T1 call, `curl http://localhost:8001/api/v1/research/history?grouped=true` should show the session grouped under a batch with tier="T1".

3. **T1→T2 grouping:** Run T1, note batch_id. Run T2 with same batch_id. History shows both under same batch/prospect.

4. **Frontend:** Run T1 on any prospect. Chip should show "T1 · Xs · $X.XXX · 5 agents". Click to expand agent table. Verify all agents shown with correct outcomes.

5. **Failed agents:** Run T3 on a prospect with missing API keys. Profile section should show warning alert with failed agent chips.

6. **History sidebar:** Should render hierarchically. Single prospects show flat. Bulk uploads show nested.

7. **Legacy sessions:** Old sessions (pre-migration) should appear in history with tier shown as "T3" and no agent log section.

---

## Documentation Note

**API cache limitation:** Raw API response payloads are cached in `pebble_api_cache` with a 24-hour TTL (`cache.py:46`). Expired entries are deleted on next read. The external APIs (ProPublica, SEC EDGAR, FEC, Wikipedia, etc.) can be re-queried at any time, but data may differ from the original research (new filings, updated records). The structured learning log (agents_log) captures WHAT data was found (record counts, outcomes) without storing the raw payloads. For exact data reproduction, re-run the research within the 24h cache window.

---

## Out of Scope (Flagged for Future)

- **CRM promotion flow** (Prospect → Lead Gen Opportunity): Needs its own PRD. The batch-first grouping and per-prospect tier tracking built here are forward-compatible with whatever promotion workflow is designed.
- **Ask Pebble chat agent logs**: Chat messages already show cost/timing. Agent-level logging for chat can be added later using the same AgentLogEntry pattern.
- **Batch research agent logs**: The `/research/batch` endpoint can adopt agents_log when batch research is enhanced.
- **Per-source timing in T2 clusters**: Currently only cluster-level elapsed time is tracked. Individual data source timing within clusters would require changes to `clusters/__init__.py`.
