"""Wikipedia search + summary + full article parsing. No auth."""

import logging
import urllib.parse

import httpx

from ._circuit import CircuitBreaker
from .wikipedia_parser import parse_infobox, extract_board_memberships, extract_career_history

logger = logging.getLogger("pebble.data_sources.wikipedia")

SEARCH_URL = "https://en.wikipedia.org/w/api.php"
SUMMARY_URL = "https://en.wikipedia.org/api/rest_v1/page/summary"
PARSE_URL = "https://en.wikipedia.org/w/api.php"

_breaker = CircuitBreaker("wikipedia")
_USER_AGENT = "PebbleResearch/0.2 (pursuit.org; prospect research pipeline)"


def _get(url: str, params: dict | None = None, headers: dict | None = None) -> httpx.Response | None:
    if _breaker.is_open():
        logger.info("Circuit open for wikipedia — skipping")
        return None
    merged_headers = {"User-Agent": _USER_AGENT}
    if headers:
        merged_headers.update(headers)
    try:
        r = httpx.get(url, params=params, headers=merged_headers, timeout=15.0)
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


def _strip_wikitext_to_plain(wikitext: str) -> str:
    """Convert raw wikitext to rough plain text for NLP extraction."""
    import re
    text = wikitext
    # Remove refs
    text = re.sub(r"<ref[^>]*(?:>.*?</ref>|/>)", "", text, flags=re.DOTALL)
    # Remove HTML tags
    text = re.sub(r"<[^>]+>", "", text)
    # Convert [[link|display]] -> display, [[link]] -> link
    text = re.sub(r"\[\[(?:[^|\]]*\|)?([^\]]+)\]\]", r"\1", text)
    # Remove templates (simple non-nested)
    text = re.sub(r"\{\{[^{}]*\}\}", "", text)
    # Remove remaining markup
    text = re.sub(r"'{2,}", "", text)
    # Clean whitespace
    text = re.sub(r"\n{3,}", "\n\n", text)
    return text.strip()


def fetch_full_profile(name: str) -> dict | None:
    """Search Wikipedia, fetch summary + full wikitext, parse infobox and extract structured data.

    Returns enriched dict with: title, extract, description, content_urls,
    full_text, infobox, categories, board_memberships, career_history.
    Returns None if no match found.
    """
    # Step 1: search for the person
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

    # Step 2: get summary via REST API
    encoded_title = urllib.parse.quote(title.replace(" ", "_"), safe="")
    r_summary = _get(
        f"{SUMMARY_URL}/{encoded_title}",
        headers={"Accept": "application/json"},
    )
    summary_data = {}
    if r_summary:
        try:
            data = r_summary.json()
            summary_data = {
                "title": data.get("title", ""),
                "extract": data.get("extract", ""),
                "description": data.get("description", ""),
                "content_urls": data.get("content_urls", {}).get("desktop", {}).get("page", ""),
            }
        except (ValueError, KeyError):
            summary_data = {"title": title, "extract": "", "description": "", "content_urls": ""}

    # Step 3: get full wikitext + categories via action=parse
    r_parse = _get(PARSE_URL, params={
        "action": "parse",
        "page": title,
        "prop": "wikitext|categories",
        "format": "json",
    })

    full_text = ""
    infobox = {}
    categories = []
    board_memberships = []
    career_history = []

    if r_parse:
        try:
            parse_data = r_parse.json().get("parse", {})
            wikitext = parse_data.get("wikitext", {}).get("*", "")

            if wikitext:
                infobox = parse_infobox(wikitext)
                full_text = _strip_wikitext_to_plain(wikitext)
                board_memberships = extract_board_memberships(full_text)
                career_history = extract_career_history(full_text)

            raw_cats = parse_data.get("categories", [])
            categories = [c.get("*", "") for c in raw_cats if isinstance(c, dict) and not c.get("hidden")]
        except (ValueError, KeyError):
            logger.warning("Failed to parse wikitext for %s", title)

    return {
        "title": summary_data.get("title", title),
        "extract": summary_data.get("extract", ""),
        "description": summary_data.get("description", ""),
        "content_urls": summary_data.get("content_urls", ""),
        "full_text": full_text,
        "infobox": infobox,
        "categories": categories,
        "board_memberships": board_memberships,
        "career_history": career_history,
    }
