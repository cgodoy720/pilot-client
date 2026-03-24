"""Lobbying Disclosure Act API (lda.senate.gov). Free, no auth. 15 req/min.

Caches all results in api_cache (7-day TTL). Supports DRF pagination
via ``next`` URLs up to ``max_pages`` per search.
"""

import logging
import httpx

from ..storage.cache import get_cached, set_cached

logger = logging.getLogger("pebble.data_sources.lda")

BASE = "https://lda.senate.gov/api/v1"
_CACHE_TTL = 604_800  # 7 days in seconds


def _get(endpoint: str, params: dict | None = None) -> dict | None:
    """GET a relative endpoint with error handling. Returns parsed JSON or None."""
    try:
        r = httpx.get(f"{BASE}/{endpoint}/", params=params, timeout=15.0,
                       headers={"Accept": "application/json"})
        r.raise_for_status()
        return r.json()
    except httpx.HTTPError as e:
        logger.warning("LDA API error for %s: %s", endpoint, e)
        return None


def _get_url(url: str) -> dict | None:
    """GET an absolute URL with error handling. For DRF pagination ``next`` links."""
    try:
        r = httpx.get(url, timeout=15.0, headers={"Accept": "application/json"})
        r.raise_for_status()
        return r.json()
    except httpx.HTTPError as e:
        logger.warning("LDA pagination error for %s: %s", url, e)
        return None


def _paginate(first_page: dict, max_pages: int) -> list[dict]:
    """Follow DRF ``next`` URLs, collecting results across pages.

    ``first_page`` is the already-fetched first page response.
    Returns the combined results list (first page + subsequent pages).
    """
    results = list(first_page.get("results", []))
    next_url = first_page.get("next")
    pages_fetched = 1

    while next_url and pages_fetched < max_pages:
        data = _get_url(next_url)
        if not data:
            break
        results.extend(data.get("results", []))
        next_url = data.get("next")
        pages_fetched += 1

    return results


def search_lobbyists(name: str, limit: int = 10, max_pages: int = 2) -> list[dict]:
    """Search lobbyists by name. Returns list of lobbyist records.

    Note: search= does broad text match across the corpus, not strict name filter.
    Results should be post-filtered by caller if exact match needed.

    Each result has: id, first_name, last_name, prefix, suffix,
    registrant (nested: name, description, address, contact_name)
    """
    if not name:
        return []

    cache_key = f"lobbyists:{name.lower()}"
    cached = get_cached("lda", cache_key)
    if cached is not None:
        logger.debug("LDA lobbyists cache hit: %s", name)
        return cached.get("results", [])

    data = _get("lobbyists", {"search": name, "page_size": min(limit, 25)})
    if not data:
        return []

    results = _paginate(data, max_pages)
    set_cached("lda", cache_key, {"results": results}, ttl_seconds=_CACHE_TTL)
    logger.info("LDA lobbyists: %d results for '%s'", len(results), name)
    return results


def search_filings(
    client_name: str | None = None,
    registrant_name: str | None = None,
    filing_year: int | None = None,
    limit: int = 10,
    max_pages: int = 2,
) -> list[dict]:
    """Search lobbying filings (LD-1/LD-2).

    Each result has: filing_uuid, filing_type, filing_year, income, expenses,
    registrant (nested), client (nested: name, general_description),
    lobbying_activities[] (with general_issue_code_display, description,
    lobbyists[] with covered_position, government_entities[])
    """
    cache_key = f"filings:{client_name or ''}:{registrant_name or ''}:{filing_year or ''}"
    cached = get_cached("lda", cache_key)
    if cached is not None:
        logger.debug("LDA filings cache hit: %s", cache_key)
        return cached.get("results", [])

    params = {"page_size": min(limit, 25)}
    if client_name:
        params["client_name"] = client_name
    if registrant_name:
        params["registrant_name"] = registrant_name
    if filing_year:
        params["filing_year"] = filing_year
    data = _get("filings", params)
    if not data:
        return []

    results = _paginate(data, max_pages)
    set_cached("lda", cache_key, {"results": results}, ttl_seconds=_CACHE_TTL)
    logger.info("LDA filings: %d results for '%s'", len(results), cache_key)
    return results


def search_contributions(lobbyist_name: str | None = None, limit: int = 10) -> list[dict]:
    """Search LD-203 contribution reports."""
    cache_key = f"contributions:{(lobbyist_name or '').lower()}"
    cached = get_cached("lda", cache_key)
    if cached is not None:
        logger.debug("LDA contributions cache hit: %s", lobbyist_name)
        return cached.get("results", [])

    params = {"page_size": min(limit, 25)}
    if lobbyist_name:
        params["search"] = lobbyist_name
    data = _get("contributions", params)
    if not data:
        return []

    results = data.get("results", [])
    set_cached("lda", cache_key, {"results": results}, ttl_seconds=_CACHE_TTL)
    return results
