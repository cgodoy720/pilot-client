"""USAspending Awards API. No auth, generous rate limits."""

import logging
import time

import httpx

from ._circuit import CircuitBreaker

logger = logging.getLogger("pebble.data_sources.usaspending")

AWARDS_URL = "https://api.usaspending.gov/api/v2/search/spending_by_award/"

_breaker = CircuitBreaker("usaspending")


def _post_with_retry(url: str, json_body: dict, max_retries: int = 2) -> httpx.Response | None:
    if _breaker.is_open():
        logger.info("Circuit open for usaspending — skipping")
        return None
    for attempt in range(max_retries + 1):
        try:
            r = httpx.post(url, json=json_body, timeout=30.0)
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


def search_awards(name: str, limit: int = 10) -> list[dict]:
    """Search USAspending awards by recipient name."""
    body = {
        "filters": {
            "recipient_search_text": [name],
            "award_type_codes": ["A", "B", "C", "D", "02", "03", "04", "05", "06", "10"],
            "time_period": [{"start_date": "2020-01-01", "end_date": "2026-12-31"}],
        },
        "fields": [
            "Award ID",
            "Recipient Name",
            "Award Amount",
            "Awarding Agency",
            "Award Type",
            "generated_internal_id",
            "Start Date",
        ],
        "limit": min(limit, 100),
        "page": 1,
        "sort": "Award Amount",
        "order": "desc",
    }
    r = _post_with_retry(AWARDS_URL, body)
    if not r:
        return []
    try:
        data = r.json()
        results = []
        for row in data.get("results", [])[:limit]:
            internal_id = row.get("generated_internal_id", "")
            results.append({
                "recipient_name": row.get("Recipient Name", ""),
                "award_amount": row.get("Award Amount", 0),
                "awarding_agency_name": row.get("Awarding Agency", ""),
                "award_type": row.get("Award Type", ""),
                "generated_internal_id": internal_id,
                "period_of_performance_start_date": row.get("Start Date", ""),
                "source_url": f"https://www.usaspending.gov/award/{internal_id}" if internal_id else "",
            })
        return results
    except (ValueError, KeyError) as e:
        logger.warning("USAspending parse error: %s", e)
        return []
