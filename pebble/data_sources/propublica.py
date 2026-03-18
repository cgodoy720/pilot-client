"""ProPublica Nonprofit Explorer API v2. GET /organizations/:ein.json"""

import httpx

BASE = "https://projects.propublica.org/nonprofits/api/v2"


def fetch_organization(ein: str) -> dict | None:
    """Fetch org data by EIN. Returns None on 404 or error."""
    url = f"{BASE}/organizations/{ein}.json"
    try:
        r = httpx.get(url, timeout=30.0)
        r.raise_for_status()
        return r.json()
    except (httpx.HTTPError, httpx.HTTPStatusError):
        return None


def search_organizations(query: str, state: str | None = None) -> list[dict]:
    """Search organizations by name. Returns list of orgs."""
    params = {"q": query}
    if state:
        params["state[id]"] = state
    try:
        r = httpx.get(f"{BASE}/search.json", params=params, timeout=30.0)
        r.raise_for_status()
        data = r.json()
        return data.get("organizations", [])
    except (httpx.HTTPError, httpx.HTTPStatusError):
        return []
