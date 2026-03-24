# CRM Duplicate Detection + Opportunity Creation

## How to use this file
Paste the contents of this file into a new Claude Code terminal as the first message.

---

You are building a CRM duplicate detection feature for Ask Pebble. Enter plan mode, read the files below, then build.

## Feature: Smart Duplicate Detection Before CRM Writes

### Context
The CRM write agent (Pebble's Haiku tool-use agent) currently supports `crm_create_account` and `crm_create_contact` but has no enforced duplicate detection. If Haiku skips the optional "search first" step, duplicate records get created in Salesforce. Additionally, there's no `crm_create_opportunity` tool despite Opportunities being a core CRM object.

### What to build

#### 1. Duplicate detection module (NEW `pebble/tools/duplicate_check.py`)
- `check_for_duplicates(entity_type, proposed, crm_bridge) -> list[dict] | None`
- Per-entity search: Account by name, Contact by name, Opportunity by name+account with fiscal year awareness
- Smart matching for Opportunities:
  - Extract fiscal year from name (FY25, FY2026, 2025, etc.)
  - "FY25 - Robin Hood" vs "FY26 - Robin Hood" → NOT duplicate (different fiscal years = renewal)
  - "Robin Hood - $150k" vs "Robin Hood - $150k" → DUPLICATE (same name, no year differentiator)
  - Normalize names: strip FY indicators, amounts, whitespace for comparison
- Return matches with context (Name, Id, Amount, Stage, etc.) or None if no matches

#### 2. Wire into execute_tool (`pebble/tools/crm_tools.py` MODIFY)
- Before any `crm_create_*` dispatch, call `check_for_duplicates()`
- If matches found AND `_confirmed` flag is not set → return `{"duplicate_warning": true, "existing_records": [...], "message": "..."}`
- If `_confirmed: true` in tool_input (user already confirmed) → skip check, proceed
- Add `_confirmed` boolean to all write tool input_schemas
- Add payment object block: `crm_create_payment` → reject with error (admin-only, Sage-driven)

#### 3. Add crm_create_opportunity (NEW tool + bridge method)
- Tool schema in CRM_WRITE_TOOLS: name (required), account_id, amount, stage, close_date, _confirmed
- Dispatch in `_dispatch()` → `crm_bridge.create_opportunity(...)`
- Bridge method in `pebble/crm_bridge.py`: POST to `/api/salesforce/opportunities`
- Same error handling pattern as create_account/create_contact

#### 4. Update system prompt (`pebble/handlers/crm_agent.py` MODIFY)
- Replace `_CRM_AGENT_WRITE_GUIDELINES` with stronger instructions:
  - System automatically checks for duplicates on create (explain the flow)
  - If duplicate_warning returned, present matches and ask user
  - If user confirms, re-call with `_confirmed: true`
  - Fiscal year awareness: different FY = renewal, not duplicate
  - NEVER create Payment records (admin-only, Sage sync)

#### 5. Payment lockout
- In execute_tool: reject any `crm_create_payment` with error message
- Add to system prompt: Payment creation is blocked

#### 6. Tests (NEW `pebble/tests/test_duplicate_check.py`)
- Fiscal year extraction: "FY25" → "2025", "FY2026" → "2026", "2025 Grant" → "2025", None for no year
- Smart matching: same name = duplicate; different FY = not duplicate; renewal recognized
- Integration: mock bridge searches, verify warning returned or creation proceeds
- _confirmed bypass: create with _confirmed=True skips duplicate check
- Payment block: crm_create_payment rejected
- Modify existing test_crm_bridge.py: add create_opportunity test

### Files to read first
- CRM agent: `pebble/handlers/crm_agent.py` (tool-use loop, system prompts, write guidelines)
- CRM tools: `pebble/tools/crm_tools.py` (tool schemas, execute_tool, _dispatch)
- CRM bridge: `pebble/crm_bridge.py` (HTTP methods, create_account/contact patterns)
- Existing tests: `pebble/tests/test_crm_bridge.py`, `pebble/tests/test_crm_agent.py`

### Key constraints
- All CRM bridge calls must be mocked in tests
- Follow existing patterns: httpx async client, graceful None-on-failure
- Duplicate check must NOT block renewals (different fiscal years)
- _confirmed flag is the LLM-to-tool bypass — only set after user explicitly confirms
- Payment writes blocked for all non-admin paths
- Existing 173 tests must still pass

### Verification
1. `pytest pebble/tests/ -v` — all tests pass
2. create_account("Robin Hood Foundation") when existing → duplicate_warning
3. create_opportunity("FY26 - Robin Hood - $150k") when "FY25" exists → NO warning (renewal)
4. create_opportunity("Robin Hood - $150k") when identical exists → warning
5. _confirmed=True bypasses check → creation proceeds
6. crm_create_payment → blocked
