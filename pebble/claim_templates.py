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
