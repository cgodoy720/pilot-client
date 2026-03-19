"""OpenCorporates officer search. API key required (free tier: 500 req/month)."""

import logging
import os
import time

import httpx

from ._circuit import CircuitBreaker

logger = logging.getLogger("pebble.data_sources.opencorporates")

OFFICERS_URL = "https://api.opencorporates.com/v0.4/officers/search"

_breaker = CircuitBreaker("opencorporates")


def _get_with_retry(url: str, params: dict, max_retries: int = 2) -> httpx.Response | None:
    if _breaker.is_open():
        logger.info("Circuit open for opencorporates — skipping")
        return None
    for attempt in range(max_retries + 1):
        try:
            r = httpx.get(url, params=params, timeout=30.0)
            if r.status_code in (401, 429, 403) and attempt < max_retries:
                time.sleep(2 ** attempt)
                continue
            if r.status_code in (401, 429, 403):
                _breaker.record_failure()
                return None
            r.raise_for_status()
            _breaker.record_success()
            return r
        except httpx.HTTPStatusError as e:
            if e.response.status_code in (401, 429, 403) and attempt < max_retries:
                time.sleep(2 ** attempt)
                continue
            _breaker.record_failure()
            return None
        except httpx.HTTPError:
            _breaker.record_failure()
            return None
    return None


def search_officers(name: str, limit: int = 10) -> list[dict]:
    """Search OpenCorporates for officers by name."""
    params: dict = {"q": name, "per_page": min(limit, 30)}
    api_key = os.getenv("OPENCORPORATES_API_KEY")
    if api_key:
        params["api_token"] = api_key

    r = _get_with_retry(OFFICERS_URL, params=params)
    if not r:
        return []
    try:
        data = r.json()
        officers_raw = data.get("results", {}).get("officers", [])[:limit]
        results = []
        for entry in officers_raw:
            officer = entry.get("officer", {})
            company = officer.get("company", {})
            results.append({
                "name": officer.get("name", ""),
                "position": officer.get("position", ""),
                "company_name": company.get("name", ""),
                "company_number": company.get("company_number", ""),
                "jurisdiction_code": company.get("jurisdiction_code", ""),
                "opencorporates_url": officer.get("opencorporates_url", ""),
            })
        return results
    except (ValueError, KeyError) as e:
        logger.warning("OpenCorporates parse error: %s", e)
        return []
