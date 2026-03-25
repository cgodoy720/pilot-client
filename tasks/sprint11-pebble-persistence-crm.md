# Sprint 11: Pebble Persistence + CRM Bridge (Track A — Database Infrastructure)

## Context

Sprint 10 creates the tables and migrates the storage layer. This sprint wires the two new tables (conflict_log, scratchpad) into the research pipeline and adds PATCH/PUT to the CRM bridge so Pebble can update existing Salesforce records.

## Prerequisites

- Sprint 10 complete (Pebble on PostgreSQL, async storage layer)
- For CRM bridge PATCH: senior devs must define target SF fields (Contact/Account)

## Scope

### 1. Wire conflict log persistence

**Currently:** `pebble/clusters/conflict_detector.py` returns conflict dicts ephemerally. They're passed to the T3 synthesizer and discarded.

**Change:** After `detect_conflicts()` runs, save results to `bedrock.pebble_conflict_log`.

Files to modify:
- `pebble/storage/db.py` -- add `save_conflicts(session_id, contact_id, conflicts)` and `get_conflicts(session_id)` async functions
- `pebble/orchestrator.py` -- call `save_conflicts()` after conflict detection in the T3 flow
- `pebble/main.py` -- optionally add `GET /api/v1/research/conflicts/{session_id}` endpoint

### 2. Wire scratchpad persistence

**Currently:** `ResearchScratchpad` (in `pebble/clusters/budget.py`) and `ProspectResearchContext` (in `pebble/research_context.py`) are in-memory, discarded after request.

**Change:** Save scratchpad state to `bedrock.pebble_scratchpad` at key checkpoints:
- On research start (status = 'active')
- After each tier completes (update scratchpad_json)
- On completion (status = 'completed')
- On failure/timeout (status = 'failed'/'timeout')

Files to modify:
- `pebble/storage/db.py` -- add `save_scratchpad()`, `update_scratchpad()`, `get_scratchpad()` async functions
- `pebble/orchestrator.py` -- call `save_scratchpad()` at tier boundaries in `run_research()`
- `pebble/research_context.py` -- add `to_json()` serialization method to `ProspectResearchContext`
- `pebble/clusters/budget.py` -- add `to_json()` serialization to `ResearchScratchpad`

### 3. CRM bridge: add PATCH/PUT for existing SF records

**Currently:** `pebble/crm_bridge.py` has `create_account()`, `create_contact()`, `create_opportunity()` (POST only). No update methods.

**Change:** Add `update_contact(contact_id, fields)` and `update_account(account_id, fields)` async methods.

**Blocked on:** Senior devs defining which SF fields Pebble should write to. Likely candidates:
- Contact: Title, MailingAddress, custom fields (Last_Research_Date__c, Giving_Capacity_Estimate__c)
- Account: Industry, custom fields

Files to modify:
- `pebble/crm_bridge.py` -- add `update_contact()`, `update_account()` async methods
- `pebble/handlers/crm_agent.py` -- add update tools to the CRM agent's tool belt
- `pebble/tools/crm_tools.py` -- add update tool definitions

User confirmation flow already exists for creates; extend to updates.

## Verification

```bash
# Run T3 research -- verify conflicts appear in pebble_conflict_log
psql ... -c "SELECT * FROM bedrock.pebble_conflict_log LIMIT 5;"

# Run research -- verify scratchpad rows created
psql ... -c "SELECT id, status, created_at FROM bedrock.pebble_scratchpad ORDER BY created_at DESC LIMIT 5;"

# Test CRM bridge update (requires SF fields to exist)
# Ask Pebble: "update John Smith's title to CEO" -> verify SF Contact.Title updated
```

## Estimated effort

Medium -- 1-2 sessions. Conflict log + scratchpad wiring is straightforward. CRM bridge updates depend on SF admin work.
