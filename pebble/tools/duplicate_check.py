"""Duplicate detection for CRM write operations.

Checks for existing records before creating new ones. Supports
fiscal-year-aware matching for opportunities (different FY = renewal,
not duplicate).
"""

from __future__ import annotations

import re
import logging
from typing import Optional

logger = logging.getLogger("pebble.tools.duplicate_check")


def extract_fiscal_year(name: str) -> str | None:
    """Extract a 4-digit fiscal year from an opportunity name.

    Returns a 4-digit year string or None.

    Examples:
        "FY25 - Robin Hood"   → "2025"
        "FY2026 Grant"        → "2026"
        "2025 Robin Hood"     → "2025"
        "Robin Hood - $150k"  → None
    """
    if not name:
        return None

    # FY with 4 digits first: FY2026 → "2026"
    match = re.search(r'\bFY(\d{4})\b', name, re.IGNORECASE)
    if match:
        return match.group(1)

    # FY with 2 digits: FY25 → "2025"
    match = re.search(r'\bFY(\d{2})\b', name, re.IGNORECASE)
    if match:
        return f"20{match.group(1)}"

    # Bare 4-digit year: 2025, 2026
    match = re.search(r'\b(20\d{2})\b', name)
    if match:
        return match.group(1)

    return None


def normalize_opportunity_name(name: str) -> str:
    """Strip fiscal years, dollar amounts, and separators for comparison.

    Returns a lowercase, whitespace-collapsed string suitable for
    duplicate comparison.

    Examples:
        "FY25 - Robin Hood - $150k"                   → "robin hood"
        "Robin Hood Foundation"                        → "robin hood foundation"
        "FY2026 - Robin Hood Foundation - $1,000,000"  → "robin hood foundation"
    """
    result = name
    # Remove FY patterns (FY25, FY2026, fy25)
    result = re.sub(r'\bFY\d{2,4}\b', '', result, flags=re.IGNORECASE)
    # Remove bare year patterns (20xx only)
    result = re.sub(r'\b20\d{2}\b', '', result)
    # Remove dollar amounts: $150k, $1,000,000, $1.5M, etc.
    result = re.sub(r'\$[\d,.]+[kKmMbB]?', '', result)
    # Collapse dashes/en-dashes/em-dashes into spaces
    result = re.sub(r'\s*[-\u2013\u2014]\s*', ' ', result)
    # Collapse whitespace, strip, lowercase
    result = re.sub(r'\s+', ' ', result).strip().lower()
    return result


def _build_opportunity_search_query(name: str) -> str:
    """Build a search query from an opportunity name for CRM lookup.

    Strips FY indicators and dollar amounts but preserves original casing
    for Salesforce LIKE search. Falls back to the full name if stripping
    produces an empty string.
    """
    query = name
    query = re.sub(r'\bFY\d{2,4}\b', '', query, flags=re.IGNORECASE)
    query = re.sub(r'\b20\d{2}\b', '', query)
    query = re.sub(r'\$[\d,.]+[kKmMbB]?', '', query)
    query = re.sub(r'\s*[-\u2013\u2014]\s*', ' ', query)
    query = re.sub(r'\s+', ' ', query).strip()
    # Fall back to original name if stripping removed everything
    return query if query else name


async def check_for_duplicates(
    entity_type: str,
    proposed: dict,
    crm_bridge,
) -> list[dict] | None:
    """Check for existing CRM records that may duplicate the proposed create.

    Args:
        entity_type: "account", "contact", or "opportunity".
        proposed: The tool_input dict from the create tool call.
        crm_bridge: CRM bridge module with async search methods.

    Returns:
        A list of matching records (potential duplicates), or None if no
        matches found or the search failed (fail-open).
    """
    try:
        if entity_type == "account":
            return await _check_account(proposed, crm_bridge)
        if entity_type == "contact":
            return await _check_contact(proposed, crm_bridge)
        if entity_type == "opportunity":
            return await _check_opportunity(proposed, crm_bridge)
    except Exception as e:
        logger.error("Duplicate check failed for %s: %s", entity_type, e)

    return None  # Fail open


async def _check_account(proposed: dict, crm_bridge) -> list[dict] | None:
    """Search for existing accounts by name."""
    name = proposed.get("name", "")
    if not name:
        return None
    matches = await crm_bridge.search_accounts(name)
    return matches if matches else None


async def _check_contact(proposed: dict, crm_bridge) -> list[dict] | None:
    """Search for existing contacts by full name."""
    first = proposed.get("first_name", "")
    last = proposed.get("last_name", "")
    if not first and not last:
        return None
    query = f"{first} {last}".strip()
    matches = await crm_bridge.search_contacts(query)
    return matches if matches else None


async def _check_opportunity(proposed: dict, crm_bridge) -> Optional[list[dict]]:
    """Search for existing opportunities with fiscal-year-aware matching.

    Different fiscal years on the same base name = renewal, not duplicate.
    """
    name = proposed.get("name", "")
    if not name:
        return None

    search_query = _build_opportunity_search_query(name)
    account_id = proposed.get("account_id") or None
    matches = await crm_bridge.search_opportunities(
        search_query, account_id=account_id,
    )
    if not matches:
        return None

    proposed_normalized = normalize_opportunity_name(name)
    proposed_fy = extract_fiscal_year(name)

    duplicates = []
    for record in matches:
        record_name = record.get("Name", "")
        record_normalized = normalize_opportunity_name(record_name)

        # Only consider records with the same base name
        if proposed_normalized != record_normalized:
            continue

        # If both have explicit fiscal years and they differ → renewal
        record_fy = extract_fiscal_year(record_name)
        if proposed_fy and record_fy and proposed_fy != record_fy:
            continue

        # Same base name + same/missing fiscal year → potential duplicate
        duplicates.append(record)

    return duplicates if duplicates else None
