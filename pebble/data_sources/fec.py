"""FEC OpenFEC API. API key required (DEMO_KEY for testing)."""

import os
import httpx

BASE = "https://api.open.fec.gov/v1"


def _api_key() -> str:
    return os.getenv("FEC_API_KEY", "DEMO_KEY")


def search_contributions(name: str, limit: int = 20) -> list[dict]:
    """Search individual contributions by contributor name."""
    params = {
        "api_key": _api_key(),
        "contributor_name": name,
        "per_page": min(limit, 100),
    }
    try:
        r = httpx.get(f"{BASE}/schedules/schedule_a/", params=params, timeout=30.0)
        r.raise_for_status()
        data = r.json()
        return data.get("results", [])
    except (httpx.HTTPError, httpx.HTTPStatusError):
        return []
