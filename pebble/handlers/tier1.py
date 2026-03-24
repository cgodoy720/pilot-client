"""T1 handler — ID & Triage. CRM check + web search + 3 data sources + Haiku.

Cost: ~$0.01/prospect. Speed: 5-10s.
"""

from __future__ import annotations

import asyncio
import logging
from typing import Optional

from ..router import RouteResult
from ..research_context import get_or_create_context
from . import HandlerResponse

logger = logging.getLogger("pebble.handlers.tier1")


async def handle_t1(
    route: RouteResult,
    crm_bridge,
    client=None,
) -> HandlerResponse:
    """Run T1 (ID & Triage) for a single prospect.

    1. CRM check via bridge
    2. Parallel: Web search, Wikipedia (with org fallback), OpenCorporates, FEC
    3. LLM extraction from web search snippets
    4. Template claims from structured sources
    5. Single Haiku call for identity assessment
    """
    from ..data_sources import fetch_full_profile, search_officers, search_contributions
    from ..data_sources.web_search import search_person
    from ..claim_templates import (
        claims_from_wikipedia_infobox,
        claims_from_opencorporates,
        claims_from_fec,
        claims_from_web_search,
    )

    person_name = route.entities.get("person_name", "")
    org_name = route.entities.get("org_name", "")
    crm_match = route.entities.get("crm_match")
    name = person_name or org_name or "Unknown"
    cost = 0.0

    # Get or create research context for tier data sharing
    prospect_id = crm_match["id"] if crm_match else name.replace(" ", "_").lower()
    ctx = get_or_create_context(prospect_id, person_name, org_name)

    # CRM status
    crm_status = "in_crm" if crm_match else "not_in_crm"
    crm_info = ""
    if crm_match:
        crm_info = f"CRM: {crm_match['name']} ({crm_match['type']})"

    # Parallel data fetches (4 sources: web search + 3 structured)
    wiki_data, oc_data, fec_data, web_results = None, None, None, []
    try:
        results = await asyncio.gather(
            asyncio.to_thread(search_person, name, org_name) if name else _noop(),
            asyncio.to_thread(fetch_full_profile, name) if name else _noop(),
            asyncio.to_thread(search_officers, name) if name else _noop(),
            asyncio.to_thread(search_contributions, name, 3) if name else _noop(),
            return_exceptions=True,
        )
        web_results = results[0] if not isinstance(results[0], BaseException) else []
        wiki_data = results[1] if not isinstance(results[1], BaseException) else None
        oc_data = results[2] if not isinstance(results[2], BaseException) else None
        fec_data = results[3] if not isinstance(results[3], BaseException) else None
    except Exception as e:
        logger.warning("T1 data fetch failed: %s", e)

    # Wikipedia org fallback — if no personal article, search for org
    if wiki_data is None and org_name:
        try:
            wiki_data = await asyncio.to_thread(fetch_full_profile, org_name)
            if wiki_data:
                wiki_data["fallback_source"] = "org_article"
                logger.info("T1: Wikipedia org fallback found article for %s", org_name)
        except Exception:
            pass

    # Store raw data in context (for T2 to reuse)
    ctx.add_source("wiki_data", wiki_data)
    ctx.add_source("oc_data", oc_data)
    ctx.add_source("fec_data", fec_data)
    ctx.add_source("web_search_data", web_results)

    # Build claims from all sources
    claims = []

    # Web search claims (LLM extraction from snippets)
    web_claims = claims_from_web_search(web_results or [], person_name, client)
    claims.extend(web_claims)

    # Structured source claims
    claims.extend(claims_from_wikipedia_infobox(wiki_data))
    claims.extend(claims_from_opencorporates(oc_data or []))
    claims.extend(claims_from_fec(fec_data or []))

    # Store claims in context
    ctx.add_claims(claims)

    # Classify prospect type
    from ..prospect_type import classify_prospect
    pt, pt_conf, pt_method = classify_prospect(crm_match, org_name, wiki_data, client)
    ctx.prospect_type = pt.value
    ctx.prospect_type_confidence = pt_conf
    ctx.prospect_type_method = pt_method

    ctx.mark_tier_complete("T1")

    # Identity assessment via Haiku
    confidence = "low" if not claims else "medium"
    summary = f"Found {len(claims)} data points for {name}."

    if client and claims:
        try:
            claims_text = "\n".join(
                f"- {c['text']} (source: {c.get('source_url', 'unknown')})"
                for c in claims[:15]
            )
            result = client.complete(
                "t1_identity_assessor",
                f"Name: {name}\nOrganization: {org_name}\n\nEvidence:\n{claims_text}",
                "You assess identity confidence for prospect research. "
                "Return JSON: {\"confidence\": \"high|medium|low\", "
                "\"summary\": \"one-sentence assessment\", "
                "\"likely_correct_person\": true|false}. Output JSON only.",
            )
            text = result.get("text", "")
            usage = result.get("usage", {})
            cost += (usage.get("input_tokens", 0) * 1.0 + usage.get("output_tokens", 0) * 5.0) / 1_000_000

            import json, re
            json_match = re.search(r"\{[^}]+\}", text, re.DOTALL)
            if json_match:
                parsed = json.loads(json_match.group())
                confidence = parsed.get("confidence", confidence)
                summary = parsed.get("summary", summary)
        except Exception as e:
            logger.warning("T1 identity assessment failed: %s", e)

    # Format identity card
    card_parts = [f"**{name}**"]
    if org_name:
        card_parts.append(f"Organization: {org_name}")
    card_parts.append(f"CRM Status: {crm_status.replace('_', ' ').title()}")
    if crm_info:
        card_parts.append(crm_info)
    card_parts.append(f"Prospect Type: **{pt.value.upper()}** ({pt_conf:.0%} via {pt_method})")
    card_parts.append(f"Identity Confidence: **{confidence.upper()}**")
    card_parts.append(f"Data Points: {len(claims)}")
    if web_claims:
        card_parts.append(f"Web Sources: {len(web_results or [])} results")
    card_parts.append(f"\n{summary}")

    return HandlerResponse(
        text="\n".join(card_parts),
        level=10,
        intent=route.intent,
        cost_usd=cost,
        data={
            "identity_card": {
                "name": name,
                "organization": org_name,
                "crm_status": crm_status,
                "confidence": confidence,
                "claims_count": len(claims),
                "summary": summary,
                "prospect_type": pt.value,
                "prospect_type_confidence": pt_conf,
            },
        },
        sources=[c.get("source_url", "") for c in claims if c.get("source_url")][:10],
    )


async def _noop():
    return None
