"""Prospect type classification from Salesforce Account.Type.

Maps Pursuit's Salesforce Account.Type picklist to a ProspectType enum
and provides a 6-level classification hierarchy:
    1. Account RecordType = "Household" → INDIVIDUAL
    2. Account.Type from CRM match → direct mapping
    3. Wikipedia categories/infobox → infer type
    4. Organization name heuristics → pattern matching
    5. Haiku LLM fallback → single-shot classification
    6. Default → UNKNOWN
"""

from __future__ import annotations

import logging
import re
from enum import Enum
from typing import Optional

logger = logging.getLogger("pebble.prospect_type")


class ProspectType(str, Enum):
    """Prospect types matching Salesforce Account.Type picklist."""
    CORPORATE = "corporate"
    GOVERNMENT = "government"
    FOUNDATION = "foundation"
    NONPROFIT = "nonprofit"
    ACADEMIC = "academic"
    DAF = "daf"
    INDIVIDUAL = "individual"
    UNKNOWN = "unknown"


# Salesforce Account.Type → ProspectType mapping
_SF_ACCOUNT_TYPE_MAP: dict[str, ProspectType] = {
    "Corporate": ProspectType.CORPORATE,
    "Government": ProspectType.GOVERNMENT,
    "Foundation": ProspectType.FOUNDATION,
    "Nonprofit": ProspectType.NONPROFIT,
    "Nonprofit Organization": ProspectType.NONPROFIT,
    "Nonprofit / Nonprofit Organization": ProspectType.NONPROFIT,
    "Academic Institution": ProspectType.ACADEMIC,
    "Donor Advised Fund": ProspectType.DAF,
}


# Organization name patterns → (ProspectType, confidence)
_NAME_PATTERNS: list[tuple[re.Pattern, ProspectType, float]] = [
    (re.compile(r"\b(foundation|trust|endowment)\b", re.I), ProspectType.FOUNDATION, 0.70),
    (re.compile(r"\b(inc|corp|llc|ltd|group|holdings|partners)\b\.?", re.I), ProspectType.CORPORATE, 0.70),
    (re.compile(r"\b(department of|office of|bureau of|agency)\b", re.I), ProspectType.GOVERNMENT, 0.70),
    (re.compile(r"\b(university|college|school of|institute of technology)\b", re.I), ProspectType.ACADEMIC, 0.70),
    (re.compile(r"\b(fidelity charitable|schwab charitable|donor advised|daf)\b", re.I), ProspectType.DAF, 0.65),
    (re.compile(r"\b(association|society|council|alliance|federation)\b", re.I), ProspectType.NONPROFIT, 0.60),
]


# Wikipedia infobox/category patterns for type inference
_WIKI_TYPE_SIGNALS: list[tuple[str, ProspectType]] = [
    ("company", ProspectType.CORPORATE),
    ("corporation", ProspectType.CORPORATE),
    ("conglomerate", ProspectType.CORPORATE),
    ("government agency", ProspectType.GOVERNMENT),
    ("federal agency", ProspectType.GOVERNMENT),
    ("government department", ProspectType.GOVERNMENT),
    ("foundation", ProspectType.FOUNDATION),
    ("charitable", ProspectType.FOUNDATION),
    ("nonprofit", ProspectType.NONPROFIT),
    ("non-profit", ProspectType.NONPROFIT),
    ("university", ProspectType.ACADEMIC),
    ("college", ProspectType.ACADEMIC),
    ("educational institution", ProspectType.ACADEMIC),
]


def classify_prospect(
    crm_match: Optional[dict] = None,
    org_name: str = "",
    wiki_data: Optional[dict] = None,
    client=None,
) -> tuple[ProspectType, float, str]:
    """Classify a prospect into one of 8 types.

    Returns:
        (prospect_type, confidence, method)
        method is one of: "crm_record_type", "crm_account_type",
        "wikipedia", "heuristic", "llm", "default"
    """
    # Level 1: Account RecordType = "Household" → INDIVIDUAL
    if crm_match:
        record_type = crm_match.get("account_record_type", "")
        if record_type.lower() == "household":
            logger.info("Classified as INDIVIDUAL via RecordType=Household")
            return ProspectType.INDIVIDUAL, 0.95, "crm_record_type"

    # Level 2: Account.Type from CRM match → direct mapping
    if crm_match:
        account_type = crm_match.get("account_type", "")
        if account_type and account_type != "--None--":
            pt = _SF_ACCOUNT_TYPE_MAP.get(account_type)
            if pt:
                logger.info("Classified as %s via Account.Type=%s", pt.value, account_type)
                return pt, 0.95, "crm_account_type"

    # Level 3: Wikipedia inference
    if wiki_data and isinstance(wiki_data, dict):
        pt, conf = _classify_from_wikipedia(wiki_data)
        if pt != ProspectType.UNKNOWN:
            logger.info("Classified as %s via Wikipedia (conf=%.2f)", pt.value, conf)
            return pt, conf, "wikipedia"

    # Level 4: Organization name heuristics
    if org_name:
        for pattern, pt, conf in _NAME_PATTERNS:
            if pattern.search(org_name):
                logger.info("Classified as %s via name heuristic (pattern=%s)", pt.value, pattern.pattern)
                return pt, conf, "heuristic"

    # Level 5: Haiku LLM fallback
    if client and org_name:
        pt, conf = _classify_via_llm(org_name, client)
        if pt != ProspectType.UNKNOWN:
            logger.info("Classified as %s via LLM (conf=%.2f)", pt.value, conf)
            return pt, conf, "llm"

    # Level 6: Default
    logger.info("Classification defaulted to UNKNOWN for org=%s", org_name)
    return ProspectType.UNKNOWN, 0.50, "default"


def _classify_from_wikipedia(wiki_data: dict) -> tuple[ProspectType, float]:
    """Infer prospect type from Wikipedia infobox and categories."""
    # Check infobox type field
    infobox = wiki_data.get("infobox", {})
    infobox_type = (infobox.get("type", "") or "").lower()

    # Check categories
    categories = wiki_data.get("categories", [])
    cats_lower = " ".join(c.lower() if isinstance(c, str) else "" for c in categories)

    # Combine infobox type + categories for matching
    combined = f"{infobox_type} {cats_lower}"

    for signal, pt in _WIKI_TYPE_SIGNALS:
        if signal in combined:
            return pt, 0.80

    return ProspectType.UNKNOWN, 0.0


def _classify_via_llm(org_name: str, client) -> tuple[ProspectType, float]:
    """Single-shot Haiku classification as last resort."""
    try:
        valid_types = ", ".join(pt.value for pt in ProspectType if pt != ProspectType.UNKNOWN)
        result = client.complete(
            "prospect_classifier",
            f"Organization name: {org_name}",
            (
                f"Classify this organization into exactly one type: {valid_types}. "
                "Output JSON only: {\"type\": \"...\", \"confidence\": 0.0-1.0}. "
                "If unsure, return {\"type\": \"unknown\", \"confidence\": 0.5}."
            ),
        )
        text = result.get("text", "")
        import json
        match = re.search(r"\{[^}]+\}", text, re.DOTALL)
        if match:
            parsed = json.loads(match.group())
            type_str = parsed.get("type", "unknown").lower()
            conf = min(1.0, max(0.0, float(parsed.get("confidence", 0.5))))
            try:
                pt = ProspectType(type_str)
                return pt, conf
            except ValueError:
                pass
    except Exception as e:
        logger.warning("LLM classification failed for %s: %s", org_name, e)
    return ProspectType.UNKNOWN, 0.50
