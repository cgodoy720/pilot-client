"""Google Custom Search API — web search for prospect research.

Uses Google's Programmable Search Engine (CSE) to find biographical info,
board positions, news articles, and organizational affiliations that
other data sources miss.

Setup: Set GOOGLE_CSE_API_KEY and GOOGLE_CSE_CX in pebble/.env.
Free tier: 100 queries/day. $5/1,000 queries after.
"""

import logging
import os
from typing import Optional

import requests

logger = logging.getLogger("pebble.data_sources.web_search")

_API_KEY = os.getenv("GOOGLE_CSE_API_KEY", "")
_CX = os.getenv("GOOGLE_CSE_CX", "")
_ENDPOINT = "https://www.googleapis.com/customsearch/v1"


def search_web(query: str, num_results: int = 10) -> list[dict]:
    """Execute a Google Custom Search query.

    Returns a list of results, each with: title, link, snippet.
    Returns empty list on failure (never raises).
    """
    if not _API_KEY or not _CX:
        logger.warning("Google CSE not configured (GOOGLE_CSE_API_KEY / GOOGLE_CSE_CX missing)")
        return []

    try:
        resp = requests.get(
            _ENDPOINT,
            params={
                "key": _API_KEY,
                "cx": _CX,
                "q": query,
                "num": min(num_results, 10),  # CSE max is 10 per request
            },
            timeout=10,
        )
        resp.raise_for_status()
        data = resp.json()

        results = []
        for item in data.get("items", []):
            results.append({
                "title": item.get("title", ""),
                "link": item.get("link", ""),
                "snippet": item.get("snippet", ""),
                "display_link": item.get("displayLink", ""),
            })
        return results

    except requests.Timeout:
        logger.warning("Google CSE timeout for query: %s", query[:50])
        return []
    except requests.HTTPError as e:
        logger.warning("Google CSE HTTP error %s for query: %s", e.response.status_code, query[:50])
        return []
    except Exception as e:
        logger.error("Google CSE error for query %s: %s", query[:50], e)
        return []


def search_person(
    person_name: str,
    org_name: str = "",
    focus: str = "general",
) -> list[dict]:
    """Search for a person with smart query construction.

    Args:
        person_name: The prospect's name (e.g., "Jukay Hsu")
        org_name: Their organization (e.g., "Pursuit")
        focus: Query focus — "general", "boards", "giving", "career"

    Returns list of {title, link, snippet, display_link}.
    """
    if not person_name:
        return []

    # Build a focused query
    quoted_name = f'"{person_name}"'

    if focus == "boards":
        query = f'{quoted_name} board OR director OR trustee OR advisory'
        if org_name:
            query += f' OR "{org_name}"'
    elif focus == "giving":
        query = f'{quoted_name} philanthropy OR donation OR grant OR foundation OR giving'
    elif focus == "career":
        query = f'{quoted_name} CEO OR founder OR president OR executive'
        if org_name:
            query += f' "{org_name}"'
    else:
        # General — include org for relevance
        if org_name:
            query = f'{quoted_name} {org_name}'
        else:
            query = quoted_name

    return search_web(query)
