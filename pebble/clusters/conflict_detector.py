"""Claim conflict detector — heuristic pattern matching for contradictions.

Detects three types of conflicts across research claims:
- Role: different current titles at the same organization
- Financial: significantly different amounts for the same metric
- Temporal: one source says "current" while another says "former"
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from typing import Optional

# ---------------------------------------------------------------------------
# Org name normalization
# ---------------------------------------------------------------------------

_ORG_SUFFIXES = re.compile(
    r"\b(inc|corp|corporation|llc|ltd|co|company|foundation|fund|group|holdings|lp)\b\.?",
    re.I,
)


def _normalize_org(org: str) -> str:
    """Lowercase, strip common suffixes and punctuation for fuzzy matching."""
    org = _ORG_SUFFIXES.sub("", org).strip()
    return re.sub(r"[^\w\s]", "", org).lower().strip()


# ---------------------------------------------------------------------------
# Role extraction from claim text
# ---------------------------------------------------------------------------

@dataclass
class _RoleAssertion:
    person: str
    title: str
    org: str
    temporal: str  # "current" | "former" | "unknown"
    claim_text: str


# Stop pattern after org name — handles all known claim template formats:
# " (" — Wikipedia, OpenCorporates, org_officers, FINRA
# " in the " — propublica_officers with year
# " with " — propublica_officers with compensation
# ", " — org_officers with compensation
# "$" — end of string (Wikipedia former positions)
_ORG_STOP = r"(?:\s*\(|\s+in\s+the\s|\s+with\s|,\s|$)"

_ROLE_PATTERNS: list[tuple[re.Pattern, str, bool]] = [
    # (pattern, temporal, has_org)
    # Patterns with org (3 capture groups: person, title, org)
    (re.compile(rf"(.+?)\s+serves as\s+(.+?)\s+at\s+(.+?){_ORG_STOP}"), "current", True),
    (re.compile(rf"(.+?)\s+is recorded as\s+(.+?)\s+at\s+(.+?){_ORG_STOP}"), "unknown", True),
    (re.compile(rf"(.+?)\s+was listed as\s+(.+?)\s+at\s+(.+?){_ORG_STOP}"), "former", True),
    (re.compile(rf"(.+?)\s+served as\s+(.+?)\s+at\s+(.+?){_ORG_STOP}"), "former", True),
    (re.compile(rf"(.+?)\s+has served as\s+(.+?)\s+at\s+(.+?){_ORG_STOP}"), "unknown", True),
    (re.compile(rf"(.+?)\s+is\s+(\S.+?)\s+at\s+(.+?){_ORG_STOP}"), "current", True),
    # Patterns without org (2 capture groups: person, title/org)
    (re.compile(rf"(.+?)\s+serves as treasurer of\s+(.+?){_ORG_STOP}"), "current", False),
    (re.compile(rf"(.+?)\s+serves on the board of\s+(.+?){_ORG_STOP}"), "current", False),
    (re.compile(rf"(.+?)\s+served on the board of\s+(.+?){_ORG_STOP}"), "former", False),
    (re.compile(rf"(.+?)\s+has served on the board of\s+(.+?){_ORG_STOP}"), "unknown", False),
    (re.compile(rf"(.+?)\s+holds the position of\s+(.+?){_ORG_STOP}"), "current", False),
]


def _extract_role_assertion(claim: dict) -> Optional[_RoleAssertion]:
    """Extract a structured role assertion from a claim's text."""
    text = claim.get("text", "")
    if not text:
        return None

    # Use explicit temporal_status field if present
    explicit_temporal = claim.get("temporal_status")

    for pattern, default_temporal, has_org in _ROLE_PATTERNS:
        m = pattern.match(text)
        if not m:
            continue
        groups = m.groups()
        person = groups[0].strip()
        if has_org:
            title = groups[1].strip()
            org = groups[2].strip()
        else:
            title = "board member" if "board" in text.lower() else groups[1].strip()
            org = groups[1].strip()  # for treasurer/board patterns, the "org" is the committee/org

        temporal = explicit_temporal if explicit_temporal in ("current", "former") else default_temporal
        return _RoleAssertion(
            person=person, title=title, org=org,
            temporal=temporal, claim_text=text,
        )

    return None


# ---------------------------------------------------------------------------
# Financial metric extraction
# ---------------------------------------------------------------------------

_FINANCIAL_METRICS: list[tuple[re.Pattern, str]] = [
    (re.compile(r"reported \$([\d,.]+) in revenue"), "revenue"),
    (re.compile(r"\$([\d,.]+) in total assets"), "total_assets"),
    (re.compile(r"received \$([\d,.]+) in contributions"), "contributions"),
    (re.compile(r"paid \$([\d,.]+) in total officer compensation"), "officer_comp"),
    (re.compile(r"contributed \$([\d,.]+)"), "personal_contributions"),
]


def _extract_financial_metric(text: str) -> Optional[tuple[str, float]]:
    """Extract (metric_name, dollar_amount) from claim text."""
    for pattern, metric_name in _FINANCIAL_METRICS:
        m = pattern.search(text)
        if m:
            raw = m.group(1).replace(",", "")
            try:
                return metric_name, float(raw)
            except ValueError:
                continue
    return None


# ---------------------------------------------------------------------------
# Temporal inference
# ---------------------------------------------------------------------------

_CURRENT_VERBS = re.compile(r"\b(serves as|is a |is recorded as|serves on|holds the position)\b", re.I)
_FORMER_VERBS = re.compile(r"\b(served as|was listed as|held the office|formerly)\b", re.I)


def _infer_temporal(claim: dict) -> str:
    """Infer temporal status from claim dict, falling back to text patterns."""
    explicit = claim.get("temporal_status")
    if explicit and explicit in ("current", "former"):
        return explicit
    text = claim.get("text", "")
    if _CURRENT_VERBS.search(text):
        return "current"
    if _FORMER_VERBS.search(text):
        return "former"
    return "unknown"


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------

def detect_conflicts(claims: list[dict], person_name: str) -> list[dict]:
    """Detect contradictions across claims for a single person.

    Returns list of conflict dicts:
    [{"type": "role"|"financial"|"temporal",
      "claim_a": str, "claim_b": str, "description": str}]
    """
    conflicts: list[dict] = []

    # --- Role conflicts ---
    role_assertions: list[_RoleAssertion] = []
    for claim in claims:
        assertion = _extract_role_assertion(claim)
        if assertion:
            role_assertions.append(assertion)

    # Group by normalized org → detect different current titles
    org_groups: dict[str, list[_RoleAssertion]] = {}
    for ra in role_assertions:
        key = _normalize_org(ra.org)
        if key:
            org_groups.setdefault(key, []).append(ra)

    for org_key, assertions in org_groups.items():
        current_titles: dict[str, _RoleAssertion] = {}
        for ra in assertions:
            if ra.temporal != "current":
                continue
            title_key = ra.title.lower().strip()
            if title_key in current_titles:
                continue  # same title — no conflict
            # Check if there's already a DIFFERENT current title at this org
            for existing_key, existing_ra in current_titles.items():
                if existing_key != title_key:
                    conflicts.append({
                        "type": "role",
                        "claim_a": existing_ra.claim_text,
                        "claim_b": ra.claim_text,
                        "description": (
                            f"Conflicting current roles at {ra.org}: "
                            f"'{existing_ra.title}' vs '{ra.title}'"
                        ),
                    })
            current_titles[title_key] = ra

    # --- Financial conflicts ---
    fin_by_metric: dict[tuple[str, str], list[tuple[float, dict]]] = {}
    for claim in claims:
        text = claim.get("text", "")
        result = _extract_financial_metric(text)
        if not result:
            continue
        metric_name, amount = result
        # Extract org name heuristically (first word sequence before "reported"/"received"/"paid")
        org_match = re.match(r"^(.+?)\s+(?:reported|received|paid|contributed)", text)
        org = org_match.group(1).strip() if org_match else person_name
        org_key = _normalize_org(org)
        year = (claim.get("data_as_of") or "")[:4]
        key = (org_key, metric_name)
        fin_by_metric.setdefault(key, []).append((amount, claim, year))

    for (org_key, metric), entries in fin_by_metric.items():
        for i in range(len(entries)):
            for j in range(i + 1, len(entries)):
                amt_a, claim_a, year_a = entries[i]
                amt_b, claim_b, year_b = entries[j]
                # Only compare same year (different years = temporal evolution)
                if year_a and year_b and year_a != year_b:
                    continue
                if amt_a == 0 and amt_b == 0:
                    continue
                denom = max(amt_a, amt_b)
                if denom > 0 and abs(amt_a - amt_b) / denom > 0.20:
                    conflicts.append({
                        "type": "financial",
                        "claim_a": claim_a.get("text", ""),
                        "claim_b": claim_b.get("text", ""),
                        "description": (
                            f"Conflicting {metric} figures: "
                            f"${amt_a:,.0f} vs ${amt_b:,.0f}"
                        ),
                    })

    # --- Temporal conflicts ---
    # Group by (org, title) → check current vs former
    temporal_groups: dict[tuple[str, str], list[tuple[str, dict]]] = {}
    for ra in role_assertions:
        if ra.temporal == "unknown":
            continue
        key = (_normalize_org(ra.org), ra.title.lower().strip())
        temporal_groups.setdefault(key, []).append((ra.temporal, ra))

    for (org_key, title_key), entries in temporal_groups.items():
        has_current = [ra for t, ra in entries if t == "current"]
        has_former = [ra for t, ra in entries if t == "former"]
        if has_current and has_former:
            conflicts.append({
                "type": "temporal",
                "claim_a": has_current[0].claim_text,
                "claim_b": has_former[0].claim_text,
                "description": (
                    f"Temporal conflict: one source says current, another says former "
                    f"for '{has_current[0].title}' at {has_current[0].org}"
                ),
            })

    return conflicts
