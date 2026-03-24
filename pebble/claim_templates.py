"""Claim templates: structured data → claims without LLM. Each returns list of {text, source_url, confidence}."""

import urllib.parse

MAX_CLAIMS = 10


def claims_from_fec(results: list | None) -> list[dict]:
    """FEC individual contributions → claims."""
    if not results:
        return []
    claims = []
    for r in results[:MAX_CLAIMS]:
        name = r.get("contributor_name")
        amount = r.get("contribution_receipt_amount")
        committee = r.get("committee", {}).get("name") if isinstance(r.get("committee"), dict) else r.get("committee_name", "")
        date = r.get("contribution_receipt_date", "")
        if not name or amount is None:
            continue
        encoded_name = urllib.parse.quote(str(name))
        claims.append({
            "text": f"{name} contributed ${amount:,.2f} to {committee} on {date}" if isinstance(amount, (int, float)) else f"{name} contributed {amount} to {committee} on {date}",
            "source_url": f"https://www.fec.gov/data/receipts/individual-contributions/?contributor_name={encoded_name}",
            "confidence": "high",
            "origin": "template",
        })
    return claims


def claims_from_usaspending(results: list | None) -> list[dict]:
    """USAspending awards → claims."""
    if not results:
        return []
    claims = []
    for r in results[:MAX_CLAIMS]:
        recipient = r.get("recipient_name")
        amount = r.get("award_amount")
        agency = r.get("awarding_agency_name", "")
        start_date = r.get("period_of_performance_start_date", "")
        source_url = r.get("source_url", "")
        if not recipient or amount is None or not source_url:
            continue
        amount_str = f"${amount:,.2f}" if isinstance(amount, (int, float)) else str(amount)
        claims.append({
            "text": f"{recipient} received {amount_str} from {agency} ({start_date})",
            "source_url": source_url,
            "confidence": "high",
            "origin": "template",
        })
    return claims


def claims_from_opencorporates(officers: list | None) -> list[dict]:
    """OpenCorporates officers → claims."""
    if not officers:
        return []
    claims = []
    for r in officers[:MAX_CLAIMS]:
        name = r.get("name")
        position = r.get("position")
        company = r.get("company_name")
        url = r.get("opencorporates_url", "")
        if not name or not position or not company or not url:
            continue
        claims.append({
            "text": f"{name} serves as {position} at {company}",
            "source_url": url,
            "confidence": "medium",
            "origin": "template",
        })
    return claims


def claims_from_edgar_search(results: list | None) -> list[dict]:
    """EDGAR full-text search results → claims."""
    if not results:
        return []
    claims = []
    for r in results[:MAX_CLAIMS]:
        entity_name = r.get("entity_name")
        file_type = r.get("file_type")
        file_date = r.get("file_date", "")
        file_url = r.get("file_url", "")
        if not entity_name or not file_type or not file_url:
            continue
        claims.append({
            "text": f"{entity_name} filed {file_type} mentioning search term ({file_date})",
            "source_url": file_url,
            "confidence": "medium",
            "origin": "template",
        })
    return claims


def claims_from_wikipedia_infobox(wiki_data: dict | None) -> list[dict]:
    """Wikipedia infobox fields + board memberships → claims."""
    if not wiki_data:
        return []

    claims = []
    source_url = wiki_data.get("content_urls", "")
    if not source_url:
        title = wiki_data.get("title", "")
        source_url = f"https://en.wikipedia.org/wiki/{urllib.parse.quote(title.replace(' ', '_'), safe='')}" if title else ""

    if not source_url:
        return []

    infobox = wiki_data.get("infobox", {})
    title_name = wiki_data.get("title", "")

    # Current role from infobox
    role_title = infobox.get("title", "")
    role_org = infobox.get("organization", "") or infobox.get("employer", "")
    if role_title and role_org:
        claims.append({
            "text": f"{title_name} serves as {role_title} at {role_org}",
            "source_url": source_url,
            "confidence": "high",
            "origin": "template",
        })
    elif role_title:
        claims.append({
            "text": f"{title_name} holds the position of {role_title}",
            "source_url": source_url,
            "confidence": "high",
            "origin": "template",
        })

    # Education
    alma_mater = infobox.get("alma_mater", "") or infobox.get("education", "")
    if alma_mater:
        claims.append({
            "text": f"{title_name} studied at {alma_mater}",
            "source_url": source_url,
            "confidence": "high",
            "origin": "template",
        })

    # Known for
    known_for = infobox.get("known_for", "")
    if known_for:
        claims.append({
            "text": f"{title_name} is known for {known_for}",
            "source_url": source_url,
            "confidence": "high",
            "origin": "template",
        })

    # Office (for political/public figures)
    office = infobox.get("office", "")
    if office:
        claims.append({
            "text": f"{title_name} held the office of {office}",
            "source_url": source_url,
            "confidence": "high",
            "origin": "template",
        })

    # Board memberships from parsed article
    for bm in wiki_data.get("board_memberships", [])[:MAX_CLAIMS]:
        org = bm.get("organization", "")
        status = bm.get("temporal_status", "unknown")
        if not org:
            continue
        prefix = "serves" if status == "current" else "served" if status == "former" else "has served"
        claims.append({
            "text": f"{title_name} {prefix} on the board of {org}",
            "source_url": source_url,
            "confidence": "high" if status != "unknown" else "medium",
            "origin": "template",
        })

    # Career history (notable positions only, first few)
    for pos in wiki_data.get("career_history", [])[:5]:
        pos_title = pos.get("title", "")
        pos_org = pos.get("organization", "")
        status = pos.get("temporal_status", "unknown")
        if not pos_title or not pos_org:
            continue
        prefix = "serves" if status == "current" else "served" if status == "former" else "has served"
        claims.append({
            "text": f"{title_name} {prefix} as {pos_title} at {pos_org}",
            "source_url": source_url,
            "confidence": "high" if status != "unknown" else "medium",
            "origin": "template",
        })

    return claims[:MAX_CLAIMS]


# ---------------------------------------------------------------------------
# Web search claims (Google Custom Search + Haiku extraction)
# ---------------------------------------------------------------------------

def claims_from_web_search(
    search_results: list[dict],
    person_name: str,
    client=None,
) -> list[dict]:
    """Extract structured claims from web search snippets using Haiku.

    If no LLM client is available, falls back to raw snippet claims.
    """
    if not search_results:
        return []

    claims = []

    if client is not None:
        # Build context from snippets
        snippet_text = "\n".join(
            f"[{r['title']}]({r['link']}): {r['snippet']}"
            for r in search_results[:10]
            if r.get("snippet")
        )
        if not snippet_text:
            return []

        try:
            result = client.complete(
                "web_search_extractor",
                f"Person: {person_name}\n\nWeb search results:\n{snippet_text}",
                (
                    "Extract factual claims about this person from web search results. "
                    "Focus on: current role/title, organization, board positions, "
                    "philanthropic activity, education, career history, notable achievements. "
                    "Each claim must include a source_url from the search result it came from. "
                    "Output JSON: {\"claims\": [{\"text\": \"...\", \"source_url\": \"https://...\", "
                    "\"confidence\": \"high|medium|low\"}]}. "
                    "Output valid JSON only, no markdown fences."
                ),
            )
            text = result.get("text", "")

            import json, re
            json_match = re.search(r"\{[^{}]*\"claims\"[^{}]*\[.*?\]\s*\}", text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                for c in parsed.get("claims", []):
                    if c.get("text") and c.get("source_url"):
                        claims.append({
                            "text": c["text"],
                            "source_url": c["source_url"],
                            "confidence": c.get("confidence", "medium"),
                            "origin": "web_search",
                        })
        except Exception as e:
            import logging
            logging.getLogger("pebble.claim_templates").warning(
                "Web search Haiku extraction failed: %s", e
            )

    # Fallback: raw snippet claims if LLM failed or unavailable
    if not claims:
        for r in search_results[:5]:
            snippet = r.get("snippet", "").strip()
            link = r.get("link", "")
            if snippet and link and person_name.lower() in snippet.lower():
                claims.append({
                    "text": snippet,
                    "source_url": link,
                    "confidence": "medium",
                    "origin": "web_search",
                })

    return claims[:MAX_CLAIMS]


# ---------------------------------------------------------------------------
# ProPublica 990 officer matching (person-level from org data)
# ---------------------------------------------------------------------------

def claims_from_propublica_officers(
    officers: list[dict],
    person_name: str,
    org_name: str = "",
    ein: str = "",
) -> list[dict]:
    """Match a person's name against 990 officer list.

    Fuzzy-matches person_name against officer names from ProPublica 990 data.
    """
    if not officers or not person_name:
        return []

    claims = []
    name_parts = person_name.lower().split()
    source_url = f"https://projects.propublica.org/nonprofits/organizations/{ein}" if ein else ""

    for officer in officers:
        officer_name = (officer.get("name") or "").lower()
        if not officer_name:
            continue
        # Fuzzy match: all parts of person_name must appear in officer_name
        if all(part in officer_name for part in name_parts):
            title = officer.get("title", "Officer")
            comp = officer.get("total_compensation")
            text = f"{person_name} is listed as {title} at {org_name}"
            if comp and float(comp) > 0:
                text += f" with compensation of ${float(comp):,.0f}"
            text += " (IRS Form 990)"
            claims.append({
                "text": text,
                "source_url": source_url,
                "confidence": "high",
                "origin": "template",
            })

    return claims[:MAX_CLAIMS]


# ---------------------------------------------------------------------------
# USAspending person affiliation (person context from org awards)
# ---------------------------------------------------------------------------

def claims_from_usaspending_person(
    usa_data: list,
    person_name: str,
    org_name: str = "",
) -> list[dict]:
    """Generate person-affiliation claims from USAspending org awards."""
    if not usa_data or not person_name or not org_name:
        return []

    claims = []
    org_lower = org_name.lower()

    for award in (usa_data or []):
        recipient = (award.get("recipient_name") or "").lower()
        if org_lower in recipient or recipient in org_lower:
            amount = award.get("award_amount")
            agency = award.get("awarding_agency_name", "")
            award_type = award.get("award_type", "award")
            url = award.get("url", "https://www.usaspending.gov")
            text = f"{person_name} is affiliated with {org_name}"
            if amount:
                text += f", which received a ${float(amount):,.0f} {award_type} from {agency}"
            claims.append({
                "text": text,
                "source_url": url,
                "confidence": "medium",
                "origin": "template",
            })

    return claims[:3]  # Limit to top 3 — these are inferred, not direct
