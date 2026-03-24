"""FINRA BrokerCheck API. No auth required. Undocumented but working.

Caches all results in api_cache (7-day TTL).
"""

import logging

import httpx

from ..storage.cache import get_cached, set_cached

logger = logging.getLogger("pebble.data_sources.finra")

BASE = "https://api.brokercheck.finra.org"
_CACHE_TTL = 604_800  # 7 days in seconds


def _get(endpoint: str, params: dict | None = None) -> dict | None:
    """GET with error handling. Returns parsed JSON or None."""
    try:
        r = httpx.get(f"{BASE}/{endpoint}", params=params, timeout=15.0)
        r.raise_for_status()
        return r.json()
    except httpx.HTTPError as e:
        logger.warning("FINRA API error for %s: %s", endpoint, e)
        return None


def search_individual(name: str, limit: int = 5) -> list[dict]:
    """Search individuals by name. Returns list of broker/advisor records.

    Each result (in hits.hits[]._source) has:
    ind_source_id, ind_firstname, ind_middlename, ind_lastname,
    ind_other_names[], ind_bc_scope (Active/Inactive),
    ind_ia_scope (Active/Inactive), ind_bc_disclosure_fl (Y/N),
    ind_current_employments[] (firm_name, branch_city, branch_state,
    firm_bd_sec_number, firm_ia_sec_number), ind_industry_cal_date
    """
    if not name:
        return []

    cache_key = name.lower()
    cached = get_cached("finra_individual", cache_key)
    if cached is not None:
        logger.debug("FINRA individual cache hit: %s", name)
        return cached.get("results", [])

    data = _get("search/individual", {"query": name, "start": 0, "rows": min(limit, 10)})
    if not data:
        return []

    hits = data.get("hits", {}).get("hits", [])
    results = [h.get("_source", {}) for h in hits]
    set_cached("finra_individual", cache_key, {"results": results}, ttl_seconds=_CACHE_TTL)
    logger.info("FINRA individual: %d results for '%s'", len(results), name)
    return results


def search_firm(name: str, limit: int = 5) -> list[dict]:
    """Search firms by name. Returns list of firm records."""
    if not name:
        return []

    cache_key = name.lower()
    cached = get_cached("finra_firm", cache_key)
    if cached is not None:
        logger.debug("FINRA firm cache hit: %s", name)
        return cached.get("results", [])

    data = _get("search/firm", {"query": name, "start": 0, "rows": min(limit, 10)})
    if not data:
        return []

    hits = data.get("hits", {}).get("hits", [])
    results = [h.get("_source", {}) for h in hits]
    set_cached("finra_firm", cache_key, {"results": results}, ttl_seconds=_CACHE_TTL)
    return results


def get_broker_detail(source_id: str) -> dict | None:
    """Fetch detailed broker record by FINRA source_id (CRD number).

    Returns the full detail dict or None on failure. Cached for 7 days.
    """
    if not source_id:
        return None

    cached = get_cached("finra_detail", source_id)
    if cached is not None:
        logger.debug("FINRA detail cache hit: %s", source_id)
        return cached

    data = _get(f"individual/{source_id}")
    if not data:
        return None

    set_cached("finra_detail", source_id, data, ttl_seconds=_CACHE_TTL)
    logger.info("FINRA detail fetched: source_id=%s", source_id)
    return data
