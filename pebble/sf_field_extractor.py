"""SF Field Extractor — maps research context to Salesforce-typed field dicts.

Pure-Python, deterministic, no LLM calls. Pulls from structured source data
in ctx.raw_data and route entities. Called by tier handlers during batch
processing to populate prospect_sf_* tables progressively.

Each tier extracts what it can:
- T1: Identity (name, title, org, prospect type)
- T2: Enrichment (industry, revenue, giving history, wealth indicators)
- T3: Finalization (philanthropic flags, funding focus, giving capacity)

All field access uses .get() so missing data produces None, not KeyError.
The UPSERT functions use COALESCE — later tiers supersede earlier ones for
scalar fields, notes append, sources deduplicate.
"""

from __future__ import annotations

import logging
from datetime import date

logger = logging.getLogger("pebble.sf_field_extractor")

# ProspectType enum value → Salesforce Account.Type picklist value
_PROSPECT_TYPE_TO_ACCOUNT_TYPE = {
    "corporate": "Corporate",
    "government": "Government",
    "foundation": "Foundation",
    "nonprofit": "Nonprofit",
    "academic": "Academic",
    "daf": "DAF",
    "individual": "Household",
    "unknown": None,
}

# NTEE major code → readable funding focus
_NTEE_CODES = {
    "A": "Arts, Culture & Humanities",
    "B": "Education",
    "C": "Environment",
    "D": "Animal-Related",
    "E": "Health Care",
    "F": "Mental Health & Crisis Intervention",
    "G": "Diseases & Disorders",
    "H": "Medical Research",
    "I": "Crime & Legal-Related",
    "J": "Employment",
    "K": "Food, Agriculture & Nutrition",
    "L": "Housing & Shelter",
    "M": "Public Safety & Disaster Preparedness",
    "N": "Recreation & Sports",
    "O": "Youth Development",
    "P": "Human Services",
    "Q": "International Affairs",
    "R": "Civil Rights & Social Action",
    "S": "Community Improvement",
    "T": "Philanthropy & Voluntarism",
    "U": "Science & Technology",
    "V": "Social Science Research",
    "W": "Public Affairs",
    "X": "Religion-Related",
    "Y": "Mutual & Membership Benefit",
    "Z": "Unknown / Unclassified",
}


def extract_sf_fields(
    ctx,
    route,
    tier: str,
) -> tuple[dict, dict, dict]:
    """Extract SF-compatible field dicts from research context.

    Args:
        ctx: ProspectResearchContext with raw_data, prospect_type, etc.
        route: RouteResult with entities (person_name, org_name, crm_match, batch_prospect_id).
        tier: "T1", "T2", or "T3".

    Returns:
        (contact_data, account_data, opportunity_data) dicts suitable for
        save_prospect_sf_contact/account/opportunity.
    """
    contact: dict = {}
    account: dict = {}
    opportunity: dict = {}
    sources: list[str] = []
    today = date.today().isoformat()

    person_name = route.entities.get("person_name", "")
    org_name = route.entities.get("org_name", "")

    # --- Always available: route entities ---
    if person_name:
        parts = person_name.split()
        contact["first_name"] = parts[0] if parts else None
        contact["last_name"] = " ".join(parts[1:]) if len(parts) > 1 else (parts[0] if parts else None)

    if org_name:
        account["name"] = org_name

    contact["lead_source"] = "Pebble Research"

    # --- Prospect type → account type ---
    if ctx.prospect_type:
        acct_type = _PROSPECT_TYPE_TO_ACCOUNT_TYPE.get(ctx.prospect_type)
        if acct_type:
            account["account_type"] = acct_type

    # --- CRM match (only in chat flow, not batch — but handle if present) ---
    crm_match = route.entities.get("crm_match")
    if crm_match and isinstance(crm_match, dict):
        contact["email"] = crm_match.get("Email") or None
        contact["phone"] = crm_match.get("Phone") or None
        if crm_match.get("Title"):
            contact["title"] = crm_match["Title"]
        sources.append("crm")

    # --- OpenCorporates → title ---
    oc_data = ctx.raw_data.get("oc_data")
    if oc_data and isinstance(oc_data, list):
        title = _best_oc_title(oc_data, person_name)
        if title:
            contact["title"] = title
            sources.append("opencorporates")

    # --- FEC → mailing address ---
    fec_data = ctx.raw_data.get("fec_data")
    if fec_data and isinstance(fec_data, list) and len(fec_data) > 0:
        first_record = fec_data[0]
        if first_record.get("city"):
            contact["mailing_city"] = first_record["city"]
        if first_record.get("state"):
            contact["mailing_state"] = first_record["state"]
        if first_record.get("zip_code"):
            contact["mailing_postal_code"] = str(first_record["zip_code"])[:10]
        sources.append("fec")

    # --- Wikipedia → industry, website ---
    wiki_data = ctx.raw_data.get("wiki_data")
    if wiki_data and isinstance(wiki_data, dict):
        infobox = wiki_data.get("infobox", {})
        if infobox.get("industry"):
            account["industry"] = infobox["industry"]
        website = infobox.get("website") or infobox.get("homepage")
        if website:
            account["website"] = website
        if "wikipedia" not in sources:
            sources.append("wikipedia")

    # --- LinkedIn URL from web search ---
    linkedin_url = _find_linkedin_url(ctx)
    if linkedin_url:
        contact["linkedin_url"] = linkedin_url

    # === T2+ fields (cluster data) ===
    if tier in ("T2", "T3"):
        _extract_t2_fields(ctx, contact, account, opportunity, sources, org_name)

    # === T3 fields (synthesis data) ===
    if tier == "T3":
        _extract_t3_fields(ctx, contact, account, opportunity, sources)

    # === Opportunity suggested name (T2+) ===
    if tier in ("T2", "T3") and org_name:
        acct_type = account.get("account_type", "Prospect")
        opportunity["suggested_name"] = f"{org_name} — {acct_type}"
        opportunity["suggested_stage"] = "Lead Gen"

    # --- Metadata ---
    claims_count = len(ctx.claims) + len(ctx.forager_claims)
    note = f"[{tier} {today}] {claims_count} claims from {len(sources)} sources: {', '.join(sources[:6])}"
    contact["notes"] = note
    account["notes"] = note
    opportunity["notes"] = note

    contact["last_enriched_tier"] = tier
    account["last_enriched_tier"] = tier
    opportunity["last_enriched_tier"] = tier

    source_list = sorted(set(sources)) if sources else None
    contact["sources"] = source_list
    account["sources"] = source_list
    opportunity["sources"] = source_list

    return contact, account, opportunity


def _extract_t2_fields(
    ctx, contact: dict, account: dict, opportunity: dict,
    sources: list[str], org_name: str,
) -> None:
    """Extract T2 enrichment fields from cluster research data."""
    # ProPublica 990 → revenue, grantmaker, philanthropy
    org_financials = ctx.raw_data.get("org_financials")
    propublica_data = ctx.raw_data.get("propublica_data")

    if org_financials and isinstance(org_financials, dict):
        # Use the extracted financials (cleaner than raw API response)
        if org_financials.get("revenue") is not None:
            account["annual_revenue"] = org_financials["revenue"]
        form_type = org_financials.get("form_type", "")
        contribs = org_financials.get("contributions_and_grants")
        if form_type == "990-PF" or (contribs and contribs > 0):
            account["grantmaker"] = True
        if org_financials.get("program_service_revenue") and org_financials["program_service_revenue"] > 0:
            account["fee_for_service"] = True
        sources.append("propublica")
    elif propublica_data and isinstance(propublica_data, dict):
        # Fall back to raw API response
        filings = propublica_data.get("filings_with_data", [])
        if filings:
            latest = filings[0]
            if latest.get("totrevenue") is not None:
                account["annual_revenue"] = latest["totrevenue"]
            if latest.get("totcntrbgfts") and latest["totcntrbgfts"] > 0:
                account["grantmaker"] = True
            if latest.get("totprgmrevnue") and latest["totprgmrevnue"] > 0:
                account["fee_for_service"] = True
        sources.append("propublica")

    if propublica_data:
        contact["philanthropy"] = True
        account["philanthropy"] = True

    # FEC → past giving history summary
    fec_data = ctx.raw_data.get("fec_data")
    if fec_data and isinstance(fec_data, list) and len(fec_data) > 0:
        total = 0.0
        count = 0
        for r in fec_data:
            amt = r.get("contribution_receipt_amount")
            if isinstance(amt, (int, float)):
                total += float(amt)
                count += 1
        if total > 0:
            opportunity["past_giving_history"] = (
                f"${total:,.0f} across {count} FEC-reported contributions"
            )

    # Wealth indicators from multiple sources
    indicators = []
    if ctx.raw_data.get("sec_data"):
        indicators.append("SEC filings")
        sources.append("sec")
    if ctx.raw_data.get("finra_data"):
        indicators.append("FINRA broker/advisor")
        sources.append("finra")
    if ctx.raw_data.get("insider_data"):
        indicators.append("Insider transactions")
    if ctx.raw_data.get("usa_data"):
        indicators.append("Federal contracts/grants")
        sources.append("usaspending")
    if indicators:
        opportunity["wealth_indicators"] = ", ".join(indicators)


def _extract_t3_fields(
    ctx, contact: dict, account: dict, opportunity: dict,
    sources: list[str],
) -> None:
    """Extract T3 finalization fields from synthesis and forager data."""
    # Philanthropic flags from forager claims
    for claim in ctx.forager_claims:
        text = claim.get("text", "").lower()
        if "philanthrop" in text or "donor" in text or "charitable" in text:
            contact["philanthropic_contact"] = True
            contact["philanthropy"] = True
            break

    # Funding focus from NTEE code
    propublica_data = ctx.raw_data.get("propublica_data")
    if propublica_data and isinstance(propublica_data, dict):
        org = propublica_data.get("organization", {})
        ntee = org.get("ntee_code") or ""
        if ntee:
            major = ntee[0].upper() if ntee else ""
            focus = _NTEE_CODES.get(major)
            if focus:
                account["funding_focus"] = f"{focus} ({ntee})"

    # Giving capacity from financial data
    org_financials = ctx.raw_data.get("org_financials")
    if org_financials and isinstance(org_financials, dict):
        total_assets = org_financials.get("total_assets")
        if total_assets and total_assets > 0:
            opportunity["giving_capacity_estimate"] = total_assets

    # Conclusions (from ctx.condense()) — additional financial summary
    if ctx.conclusions:
        fin = ctx.conclusions.get("financial_summary", {})
        if fin.get("contributions") and not opportunity.get("past_giving_history"):
            opportunity["past_giving_history"] = f"${fin['contributions']:,.0f} in total contributions"
        if fin.get("total_assets") and not opportunity.get("giving_capacity_estimate"):
            opportunity["giving_capacity_estimate"] = fin["total_assets"]


def _best_oc_title(oc_data: list[dict], person_name: str) -> str | None:
    """Pick the best matching officer title from OpenCorporates data.

    Prefers records where the officer name closely matches person_name.
    Returns the position string or None.
    """
    if not oc_data or not person_name:
        return None

    person_lower = person_name.lower()
    person_parts = set(person_lower.split())

    best_position = None
    best_score = 0

    for officer in oc_data:
        name = (officer.get("name") or "").lower()
        position = officer.get("position") or ""
        if not name or not position:
            continue
        # Score by word overlap
        name_parts = set(name.split())
        overlap = len(person_parts & name_parts)
        if overlap > best_score:
            best_score = overlap
            best_position = position

    # Require at least 2 matching words (first + last) or exact match
    if best_score >= 2 or (best_score == 1 and len(person_parts) == 1):
        return best_position
    return None


def _find_linkedin_url(ctx) -> str | None:
    """Scan web search results for a LinkedIn profile URL."""
    for key in ("web_search_data", "web_search_boards", "web_search_giving"):
        results = ctx.raw_data.get(key)
        if not results or not isinstance(results, list):
            continue
        for r in results:
            link = r.get("link", "")
            if "linkedin.com/in/" in link:
                return link
    return None
