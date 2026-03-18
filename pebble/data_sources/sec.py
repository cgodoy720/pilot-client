"""SEC EDGAR API. User-Agent required. 10 req/sec."""

import httpx

BASE = "https://data.sec.gov"
USER_AGENT = "Pebble/1.0 (prospect research; contact@example.com)"


def _headers() -> dict:
    return {"User-Agent": USER_AGENT}


def fetch_company(cik: str) -> dict | None:
    """Fetch company submissions by CIK. CIK must be zero-padded to 10 digits."""
    cik_padded = str(cik).zfill(10)
    url = f"{BASE}/submissions/CIK{cik_padded}.json"
    try:
        r = httpx.get(url, headers=_headers(), timeout=30.0)
        r.raise_for_status()
        return r.json()
    except (httpx.HTTPError, httpx.HTTPStatusError):
        return None


def search_cik(company_name: str) -> str | None:
    """Look up CIK by company name. Uses company_tickers (approximate match)."""
    url = "https://www.sec.gov/files/company_tickers.json"
    try:
        r = httpx.get(url, headers=_headers(), timeout=30.0)
        r.raise_for_status()
        tickers = r.json()
        name_lower = company_name.lower()
        for v in tickers.values():
            title = (v.get("title") or v.get("name") or "").lower()
            if name_lower in title or any(w in title for w in name_lower.split() if len(w) > 2):
                return str(v.get("cik_str", v.get("cik", ""))).zfill(10)
        return None
    except (httpx.HTTPError, httpx.HTTPStatusError):
        return None
