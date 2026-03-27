# Sprint: Serper.dev Unrestricted Web Search

## How to use this file
Paste the contents of this file into a new Claude Code terminal as the first message.

---

You are adding Serper.dev as a second web search backend for Pebble. Enter plan mode, read the files below, then build.

## Context
Pebble's web search uses Google Custom Search Engine (CSE) restricted to 50 curated domains. This gives high-quality results from philanthropy, government, and news sites — but misses the long tail: company about pages, donor wall mentions, event speaker bios, university press releases, and personal foundation sites that no curated domain list covers.

Serper.dev returns unrestricted Google-quality results via API. Google CSE keeps its curated domain focus. Results merge and deduplicate before flowing into the existing claim extraction pipeline. No downstream changes needed — the output format stays identical.

## Architecture
```
search_person("Jane Smith", "Goldman Sachs", "boards")
    ↓
search_web(query)
    ├── Google CSE (curated 50 domains) → [{title, link, snippet, display_link}, ...]
    ├── Serper.dev (unrestricted)       → [{title, link, snippet, display_link}, ...]
    └── merge + deduplicate by link     → [{title, link, snippet, display_link}, ...]
    ↓
claims_from_web_search(results, name, client)  ← NO CHANGES
    ↓
structured claims
```

## What to build

### 1. NEW: `pebble/data_sources/serper_search.py`

Standalone module following the existing data source pattern (httpx, return empty list on failure, never raise).

- Env var: `SERPER_API_KEY` (loaded via `os.getenv` at module level, same as web_search.py)
- Endpoint: `POST https://google.serper.dev/search`
- Headers: `X-API-KEY: <key>`, `Content-Type: application/json`
- Body: `{"q": query, "num": min(num_results, 10)}`
- Response: `{"organic": [{"title": "...", "link": "...", "snippet": "...", "position": N}, ...]}`
- Maps `organic[]` items to `{title, link, snippet, display_link}` — same format as Google CSE
- `display_link` derived from URL: `urllib.parse.urlparse(link).netloc`
- Uses `httpx.post()` (consistent with newer data sources: finra, lda, opencorporates)
- Timeout: 10 seconds (matching Google CSE)
- Returns `[]` on missing API key, timeout, HTTP error, or any exception

### 2. MODIFY: `pebble/data_sources/web_search.py`

Add Serper as a second backend in `search_web()`. Merge and deduplicate results.

- Import `search_serper` from `.serper_search`
- In `search_web()`: call Google CSE (existing code), call `search_serper()`, merge results
- New helper: `_merge_results(cse_results, serper_results) -> list[dict]`
  - Deduplicate by `link` (normalize: strip trailing slash)
  - CSE results come first (curated domains = higher signal), Serper fills gaps
  - Cap total at `num_results`
- If one backend fails (returns []), the other's results are still returned
- `search_person()` is UNCHANGED — it calls `search_web()` which now returns merged results
- The function signature and return type of both `search_web()` and `search_person()` stay identical

### 3. MODIFY: `pebble/.env.example`

Add after the OPENCORPORATES_API_KEY entry:
```
# Serper.dev — unrestricted web search (free tier: 2,500 queries)
# Complements Google CSE with full web coverage
SERPER_API_KEY=
```

### 4. NEW: `pebble/tests/test_web_search.py`

Tests for both backends and the merge logic:

**search_serper():**
- Mock httpx.post → successful response → returns formatted results
- Mock httpx.post → timeout → returns []
- Mock httpx.post → HTTP error → returns []
- Missing API key → returns [] with warning log

**_merge_results():**
- CSE + Serper results → merged, deduplicated by link
- Duplicate links (trailing slash variant) → deduplicated
- CSE empty + Serper has results → Serper results returned
- Both empty → returns []

**search_web() integration (both mocked):**
- Both backends succeed → merged results
- CSE fails, Serper succeeds → Serper results only
- Serper fails, CSE succeeds → CSE results only
- Both fail → empty list

**search_person():**
- Mock search_web → verify query construction unchanged
- Focus parameter still works

## Files to read first
- Web search module: `pebble/data_sources/web_search.py` (current Google CSE implementation)
- Claim extraction: `pebble/claim_templates.py` lines 254-313 (claims_from_web_search — NO changes needed, just understand the input format)
- Call site 1: `pebble/handlers/tier1.py` lines 19-72 (how search_person is called — NO changes needed)
- Call site 2: `pebble/clusters/public_profile.py` lines 26-108 (how search_person is called — NO changes needed)
- Source router: `pebble/clusters/source_router.py` (web_search: bool = True for all types — NO changes needed)
- Existing data source pattern: `pebble/data_sources/finra.py` (httpx pattern reference)
- Env example: `pebble/.env.example`

## Key constraints
- Return format MUST stay `list[dict]` with keys: `title`, `link`, `snippet`, `display_link`
- `search_person()` signature and behavior MUST NOT change — call sites are untouched
- Serper unavailable (no key, API down) MUST NOT break existing Google CSE flow
- Google CSE unavailable MUST NOT break Serper flow
- Both unavailable → empty list (existing behavior preserved)
- All data source calls mocked in tests — no real API calls
- Existing 220 tests must still pass

## Verification
1. `pytest pebble/tests/test_web_search.py -v` — all new tests pass
2. `pytest pebble/tests/ -v` — all 220+ existing tests still pass
3. With SERPER_API_KEY set: `search_person("Jane Smith", "Goldman Sachs")` returns results from both CSE and Serper
4. With SERPER_API_KEY empty: search still works (CSE only)
5. With GOOGLE_CSE_API_KEY empty but SERPER_API_KEY set: search still works (Serper only)
