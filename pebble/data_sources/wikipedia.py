"""Wikipedia search + summary. No auth."""

import logging
import urllib.parse

import httpx

from ._circuit import CircuitBreaker

logger = logging.getLogger("pebble.data_sources.wikipedia")

SEARCH_URL = "https://en.wikipedia.org/w/api.php"
SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary"

_breaker = CircuitBreaker("wikipedia")


def _get(url: str, params: dict | None = None, headers: dict | None = None) -> httpx.Response | None:
    if _breaker.is_open():
        logger.info("Circuit open for wikipedia — skipping")
        return None
    try:
        r = httpx.get(url, params=params, headers=headers, timeout=15.0)
        r.raise_for_status()
        _breaker.record_success()
        return r
    except httpx.HTTPError:
        _breaker.record_failure()
        return None


def fetch_summary(name: str) -> dict | None:
    """Search Wikipedia and return summary for the best match. Returns None if no match."""
    # Step 1: search
    r = _get(SEARCH_URL, params={
        "action": "query",
        "list": "search",
        "srsearch": name,
        "srlimit": "3",
        "format": "json",
    })
    if not r:
        return None
    try:
        search_results = r.json().get("query", {}).get("search", [])
        if not search_results:
            return None
        title = search_results[0].get("title", "")
    except (ValueError, KeyError):
        return None

    # Step 2: get summary
    encoded_title = urllib.parse.quote(title.replace(" ", "_"), safe="")
    r2 = _get(
        f"{SUMMARY_URL}/{encoded_title}",
        headers={"Accept": "application/json"},
    )
    if not r2:
        return None
    try:
        data = r2.json()
        return {
            "title": data.get("title", ""),
            "extract": data.get("extract", ""),
            "description": data.get("description", ""),
            "content_urls": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
        }
    except (ValueError, KeyError):
        return None
