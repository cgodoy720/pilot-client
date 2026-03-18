"""FEC OpenFEC API. API key required (DEMO_KEY for testing)."""

import os
import time

import httpx

BASE = "https://api.open.fec.gov/v1"


def _api_key() -> str:
    return os.getenv("FEC_API_KEY", "DEMO_KEY")


def _get_with_retry(url: str, params: dict, max_retries: int = 2) -> httpx.Response | None:
    """GET with retry on 429 (rate limit). Returns None on error."""
    for attempt in range(max_retries + 1):
        try:
            r = httpx.get(url, params=params, timeout=30.0)
            if r.status_code == 429 and attempt < max_retries:
                time.sleep(2 ** attempt)
                continue
            r.raise_for_status()
            return r
        except httpx.HTTPStatusError as e:
            if e.response.status_code == 429 and attempt < max_retries:
                time.sleep(2 ** attempt)
                continue
            return None
        except httpx.HTTPError:
            return None
    return None


def search_contributions(name: str, limit: int = 20) -> list[dict]:
    """Search individual contributions by contributor name."""
    params = {
        "api_key": _api_key(),
        "contributor_name": name,
        "per_page": min(limit, 100),
    }
    r = _get_with_retry(f"{BASE}/schedules/schedule_a/", params=params)
    if not r:
        return []
    data = r.json()
    return data.get("results", [])
