# Fix Pheromone System + Separate Richness from Reliability

**Status:** Planned (next session)
**Depends on:** PR from `fix/pebble-live-testing-readiness` (synthesizer + guardrails)

## Context

The swarm learning foundation (Parts 1-3 already implemented) has two design flaws discovered during review:

1. **Pheromone reading is a permanent no-op.** `get_source_reliability("propublica")` queries `harness_log WHERE agent_name = 'propublica'`, but `harness_log` only contains agent names like `"philanthropy_agent"`. Source names never appear. Every source returns 1.0. The pheromone system has never dampened anything and never will with the current wiring.

2. **`save_source_scores()` stores mixed signals.** `score_source_richness()` multiplies raw richness by reliability before returning. Level 3 (threshold self-tuning) needs pure richness to analyze "at what data richness do foragers produce useful claims?" Baking reliability into saved scores makes that analysis impossible.

**Key insight from research:** Circuit breakers already exist in 4 of 7 data sources (`_circuit.py`) and track exactly the right signal — **fetch reliability** ("is this API working?"), not agent reliability ("did the LLM produce valid JSON?"). The fix is to wire circuit breakers as the pheromone signal instead of the broken `harness_log` query.

---

## Design Decisions

### Why circuit breakers, not harness_log persistence?

| | Circuit Breakers | harness_log Logging |
|---|---|---|
| **Tracks the right signal** | Fetch failures (401, timeout) | Agent failures (bad JSON) |
| **Already exists** | 4 of 7 sources | Would need new logging code |
| **Restart behavior** | Resets (correct — re-probes sources) | Persists (could pre-dampen a fixed source) |
| **Performance** | In-memory check | SQLite read per source per prospect |
| **Granularity** | Binary (open/closed) | Continuous (0.0-1.0 success rate) |

Binary is the right granularity for now: either the API works (trust the richness score) or it's broken (zero it out). Level 3 analysis needs raw richness scores, not reliability-adjusted ones — so the scores stored in `source_scores` should be pure.

### Why 0.0 dampening when circuit is open?

When a circuit breaker is open, the API has failed 3 consecutive times. There's no point running foragers on data from a broken source. The breaker auto-resets after 300s and re-probes. If the source comes back, scores return to raw richness on the next run.

### Why delete `get_source_reliability()`?

It queries the wrong table with the wrong keys. Even if fixed, harness_log tracks LLM agent outcomes, not API availability. The function is a semantic mismatch. Circuit breakers are the right abstraction.

---

## Implementation

### Step 1: Add auto-registry to `_circuit.py`

Add `_registry` dict to `CircuitBreaker.__init__` + `get_breaker()` query function.

### Step 2: Add circuit breakers to propublica, sec, fec

3 files. Each needs: import `CircuitBreaker`, add `_breaker = CircuitBreaker("<name>")`, add `is_open()` check + `record_failure()`/`record_success()` in `_get_with_retry`. Pattern is identical to `opencorporates.py`.

**Canonical breaker names** (must match `score_source_richness()` keys):
- `propublica.py` → `CircuitBreaker("propublica")`
- `sec.py` → `CircuitBreaker("sec")`
- `fec.py` → `CircuitBreaker("fec")`

### Step 3: Fix edgar_search breaker name

`edgar_search.py`: `CircuitBreaker("edgar_search")` → `CircuitBreaker("edgar")`. Update log message.

### Step 4: Separate richness from reliability in `orchestrator.py`

- **Remove** the `get_source_reliability` import and the pheromone adjustment loop from `score_source_richness()`.
- **Add** `apply_circuit_dampening(scores)` that zeroes out sources with open circuits.

### Step 5: Update pipeline flow in `main.py`

Save raw scores to DB, then apply circuit dampening for forager activation thresholds.

### Step 6: Delete `get_source_reliability()` from `storage/db.py`

Remove the dead function. `harness_log` table stays.

---

## Files Modified

| File | Changes | Lines |
|------|---------|-------|
| `pebble/data_sources/_circuit.py` | Add `_registry` dict, auto-register in `__init__`, add `get_breaker()` | +5 |
| `pebble/data_sources/propublica.py` | Add circuit breaker to `_get_with_retry` | +8 |
| `pebble/data_sources/sec.py` | Add circuit breaker to `_get_with_retry` | +8 |
| `pebble/data_sources/fec.py` | Add circuit breaker to `_get_with_retry` | +8 |
| `pebble/data_sources/edgar_search.py` | Rename breaker `"edgar_search"` → `"edgar"` | ~2 |
| `pebble/orchestrator.py` | Remove reliability loop, add `apply_circuit_dampening()` | +10 / -5 |
| `pebble/main.py` | Save raw scores, dampen separately | +3 / -2 |
| `pebble/storage/db.py` | Delete `get_source_reliability()` | -15 |

## Verification

1. Import check — all modules import cleanly
2. Circuit breaker registry — all 7 sources register
3. Raw scores saved — DB gets pure richness, not reliability-adjusted
4. Dampening works — open circuits zero out scores
5. Forager thresholds unchanged — normal case passes through
6. No regression — synthesizer still produces quality summaries
