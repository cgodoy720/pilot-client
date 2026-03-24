"""Affiliation cluster — OpenCorporates, Wikipedia career, LDA, FINRA, Federal Register.

Focuses on organizational connections, board seats, officer positions,
lobbying ties, professional registrations, and government relationships.
"""

from __future__ import annotations

import asyncio
import logging

from ..research_context import ProspectResearchContext
from .source_router import SourceConfig
from .budget import ClusterBudget

logger = logging.getLogger("pebble.clusters.affiliation")


def _safe_result(val):
    """Convert exceptions to None, logging the error."""
    if isinstance(val, BaseException):
        logger.warning("Affiliation cluster API call failed: %s", val)
        return None
    return val


async def run_affiliation_cluster(
    ctx: ProspectResearchContext,
    person_name: str,
    org_name: str,
    source_config: SourceConfig,
    budget: ClusterBudget,
) -> list[dict]:
    """Run the affiliation research cluster.

    Sources: OpenCorporates, Wikipedia infobox/career, LDA, FINRA, Federal Register.
    Also extracts connected_orgs from discovered board seats and officer positions.

    Returns list of claims.
    """
    from ..data_sources import search_officers, fetch_full_profile
    from ..data_sources.lda import search_lobbyists, search_filings as lda_search_filings
    from ..data_sources.finra import search_individual
    from ..data_sources.federal_register import search_documents
    from ..claim_templates import (
        claims_from_opencorporates,
        claims_from_wikipedia_infobox,
        claims_from_lobbying,
        claims_from_finra,
        claims_from_federal_register,
    )

    budget.start()
    claims = []
    limits = source_config.search_limits
    name = person_name or org_name or ""

    # --- Parallel independent fetches ---
    tasks = []
    keys = []

    # OpenCorporates
    if source_config.opencorporates and not ctx.has_source("oc_data") and budget.can_call():
        oc_limit = limits.get("opencorporates", 10)
        tasks.append(asyncio.to_thread(search_officers, name, oc_limit))
        keys.append("oc_data")

    # Wikipedia (if Public Profile cluster hasn't fetched it yet)
    if source_config.wikipedia and not ctx.has_source("wiki_data") and budget.can_call():
        tasks.append(asyncio.to_thread(fetch_full_profile, name))
        keys.append("wiki_data")

    # LDA lobbyists
    if source_config.lda == "yes" and not ctx.has_source("lda_lobbyists") and budget.can_call():
        lda_limit = limits.get("lda", 10)
        tasks.append(asyncio.to_thread(search_lobbyists, name, lda_limit))
        keys.append("lda_lobbyists")

    # LDA filings (org-level)
    if source_config.lda == "yes" and org_name and not ctx.has_source("lda_filings") and budget.can_call():
        lda_limit = limits.get("lda", 10)
        tasks.append(asyncio.to_thread(
            lda_search_filings, client_name=org_name, limit=lda_limit
        ))
        keys.append("lda_filings")

    # Federal Register ("yes" = always, "conditional" = deferred)
    if source_config.federal_register == "yes" and not ctx.has_source("federal_register_data") and budget.can_call():
        fr_limit = limits.get("federal_register", 10)
        tasks.append(asyncio.to_thread(search_documents, name, None, fr_limit))
        keys.append("federal_register_data")

    # FINRA (professional affiliations — shares data with financial cluster)
    if source_config.finra and not ctx.has_source("finra_data") and budget.can_call():
        tasks.append(asyncio.to_thread(search_individual, name))
        keys.append("finra_data")

    if tasks:
        results = await asyncio.gather(*tasks, return_exceptions=True)
        for key, result in zip(keys, results):
            safe = _safe_result(result)
            ctx.add_source(key, safe)
            budget.record_call()

    logger.info("Affiliation cluster: %d sources fetched", len(tasks))

    # --- Conditional sources (if wiki/web suggests govt connections) ---
    wiki_data = ctx.raw_data.get("wiki_data")
    has_govt_signal = _suggests_government_connections(wiki_data)

    if source_config.lda == "conditional" and not ctx.has_source("lda_lobbyists") and budget.can_call():
        if has_govt_signal:
            lda_limit = limits.get("lda", 5)
            try:
                lobbyists = await asyncio.to_thread(search_lobbyists, name, lda_limit)
                ctx.add_source("lda_lobbyists", lobbyists)
                budget.record_call()
                logger.info("Conditional LDA activated — government connections detected")
            except Exception as e:
                logger.warning("Conditional LDA fetch failed: %s", e)

    if source_config.federal_register == "conditional" and not ctx.has_source("federal_register_data") and budget.can_call():
        if has_govt_signal:
            fr_limit = limits.get("federal_register", 5)
            try:
                docs = await asyncio.to_thread(search_documents, name, None, fr_limit)
                ctx.add_source("federal_register_data", docs)
                budget.record_call()
                logger.info("Conditional Federal Register activated — government connections detected")
            except Exception as e:
                logger.warning("Conditional Federal Register fetch failed: %s", e)

    # --- Build claims ---
    # OpenCorporates
    claims.extend(claims_from_opencorporates(ctx.raw_data.get("oc_data") or []))

    # Wikipedia infobox + career
    claims.extend(claims_from_wikipedia_infobox(ctx.raw_data.get("wiki_data")))

    # LDA lobbying
    claims.extend(claims_from_lobbying(
        lobbyists=ctx.raw_data.get("lda_lobbyists"),
        filings=ctx.raw_data.get("lda_filings"),
        person_name=person_name,
    ))

    # Federal Register
    claims.extend(claims_from_federal_register(
        ctx.raw_data.get("federal_register_data"), person_name
    ))

    # FINRA (professional registrations)
    claims.extend(claims_from_finra(ctx.raw_data.get("finra_data"), person_name))

    # --- Extract connected orgs for Sprint 4 ---
    connected_orgs = _extract_connected_orgs(ctx)
    ctx.add_source("connected_orgs", connected_orgs)

    logger.info("Affiliation cluster: %d claims, %d connected orgs, %d API calls",
                len(claims), len(connected_orgs), budget.api_calls_used)
    return claims


def _suggests_government_connections(wiki_data: dict | None) -> bool:
    """Check if Wikipedia data suggests government/policy connections."""
    if not wiki_data or not isinstance(wiki_data, dict):
        return False
    infobox = wiki_data.get("infobox", {})
    office = infobox.get("office", "")
    if office:
        return True
    categories = wiki_data.get("categories", [])
    govt_keywords = {"government", "politician", "senator", "congressman", "representative",
                     "secretary", "ambassador", "commissioner", "lobbyist"}
    cats_lower = " ".join(str(c).lower() for c in categories)
    return any(kw in cats_lower for kw in govt_keywords)


def _extract_connected_orgs(ctx: ProspectResearchContext) -> list[dict]:
    """Extract organizations discovered during affiliation research.

    Sources: OpenCorporates officer positions, Wikipedia career history,
    LDA registrant orgs. These feed Sprint 4's investigate_connected_orgs().
    """
    orgs = []
    seen = set()

    # From OpenCorporates
    for officer in (ctx.raw_data.get("oc_data") or []):
        company = officer.get("company_name", "")
        if company and company.lower() not in seen:
            seen.add(company.lower())
            orgs.append({
                "name": company,
                "source": "opencorporates",
                "relationship": officer.get("position", "officer"),
            })

    # From Wikipedia career history
    wiki_data = ctx.raw_data.get("wiki_data")
    if wiki_data and isinstance(wiki_data, dict):
        for pos in wiki_data.get("career_history", []):
            org = pos.get("organization", "")
            if org and org.lower() not in seen:
                seen.add(org.lower())
                orgs.append({
                    "name": org,
                    "source": "wikipedia",
                    "relationship": pos.get("title", "affiliated"),
                })

    return orgs
