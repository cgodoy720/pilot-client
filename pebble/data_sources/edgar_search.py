"""EDGAR Full-Text Search (EFTS). No auth, 10 req/s rate limit."""

import logging
import time

import httpx

from ._circuit import CircuitBreaker

logger = logging.getLogger("pebble.data_sources.edgar_search")

EFTS_BASE = "https://efts.sec.gov/LATEST/search-index"
USER_AGENT = "Pebble/1.0 (prospect research; contact@example.com)"

_breaker = CircuitBreaker("edgar_search")


def _get_with_retry(url: str, params: dict | None = None, max_retries: int = 2) -> httpx.Response | None:
    if _breaker.is_open():
        logger.info("Circuit open for edgar_search — skipping")
        return None
    for attempt in range(max_retries + 1):
        try:
            r = httpx.get(url, params=params, headers={"User-Agent": USER_AGENT}, timeout=30.0)
            if r.status_code == 429 and attempt < max_retries:
                time.sleep(2 ** attempt)
                continue
            r.raise_for_status()
            _breaker.record_success()
            return r
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < max_retries:
                time.sleep(2 ** attempt)
                continue
            _breaker.record_failure()
            return None
        except httpx.HTTPError:
            _breaker.record_failure()
            return None
    return None


def search_filings(query: str, limit: int = 10) -> list[dict]:
    """Search EDGAR full-text index by name/keyword. Returns filing metadata."""
    r = _get_with_retry(EFTS_BASE, params={"q": query})
    if not r:
        return []
    try:
        data = r.json()
        hits = data.get("hits", {}).get("hits", [])[:limit]
        results = []
        for hit in hits:
            src = hit.get("_source", {})
            entity_name = (src.get("display_names") or [""])[0]
            file_type = src.get("root_form", "")
            file_date = src.get("file_date", "")
            file_num = src.get("file_num", "")
            ciks = src.get("ciks", [])
            adsh = src.get("adsh", "")
            # Build URL from CIK + accession number
            cik = str(ciks[0]) if ciks else ""
            adsh_dashed = adsh.replace("-", "") if adsh else ""
            file_url = f"https://www.sec.gov/Archives/edgar/data/{cik}/{adsh_dashed}/" if cik and adsh else ""
            results.append({
                "file_type": file_type,
                "entity_name": entity_name,
                "file_date": file_date,
                "file_url": file_url,
                "file_num": file_num,
            })
        return results
    except (ValueError, KeyError) as e:
        logger.warning("EDGAR search parse error: %s", e)
        return []
