"""ProPublica Nonprofit Explorer API v2. GET /organizations/:ein.json"""

import time

import httpx

BASE = "https://projects.propublica.org/nonprofits/api/v2"


def _get_with_retry(url: str, params: dict | None = None, max_retries: int = 2) -> httpx.Response | None:
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


def fetch_organization(ein: str) -> dict | None:
    """Fetch org data by EIN. Returns None on 404 or error."""
    url = f"{BASE}/organizations/{ein}.json"
    r = _get_with_retry(url)
    return r.json() if r else None


def search_organizations(query: str, state: str | None = None) -> list[dict]:
    """Search organizations by name. Returns list of orgs."""
    params = {"q": query}
    if state:
        params["state[id]"] = state
    r = _get_with_retry(f"{BASE}/search.json", params=params)
    if not r:
        return []
    data = r.json()
    return data.get("organizations", [])
