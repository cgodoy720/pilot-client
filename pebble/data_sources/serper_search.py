"""Serper.dev — unrestricted Google web search via API.

Complements Google CSE (curated 50 domains) with full web coverage.
Returns results in the same format as web_search.py for seamless merging.

Setup: Set SERPER_API_KEY in pebble/.env.
Free tier: 2,500 queries/month.
"""

import logging
import os
from urllib.parse import urlparse

import httpx

logger = logging.getLogger("pebble.data_sources.serper_search")

_API_KEY = os.getenv("SERPER_API_KEY", "")
_ENDPOINT = "https://google.serper.dev/search"


def search_serper(query: str, num_results: int = 10) -> list[dict]:
    """Execute a Serper.dev web search query.

    Returns a list of results, each with: title, link, snippet, display_link.
    Returns empty list on failure (never raises).
    """
    if not _API_KEY:
        logger.warning("Serper not configured (SERPER_API_KEY missing)")
        return []

    try:
        resp = httpx.post(
            _ENDPOINT,
            headers={
                "X-API-KEY": _API_KEY,
                "Content-Type": "application/json",
            },
            json={"q": query, "num": min(num_results, 10)},
            timeout=10.0,
        )
        resp.raise_for_status()
        data = resp.json()

        results = []
        for item in data.get("organic") or []:
            link = item.get("link", "")
            results.append({
                "title": item.get("title", ""),
                "link": link,
                "snippet": item.get("snippet", ""),
                "display_link": urlparse(link).netloc if link else "",
            })
        return results

    except httpx.TimeoutException:
        logger.warning("Serper timeout for query: %s", query[:50])
        return []
    except httpx.HTTPStatusError as e:
        logger.warning("Serper HTTP error %s for query: %s", e.response.status_code, query[:50])
        return []
    except Exception as e:
        logger.error("Serper error for query %s: %s", query[:50], e)
        return []
