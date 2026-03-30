"""T2 handler — Structured Intelligence. Cluster-routed sources + forager analysis.

Uses prospect type classification to route research through 3 concurrent
clusters (Financial, Affiliation, Public Profile), each activating only
the data sources relevant to the prospect type.

Builds on T1's context if available — skips re-fetching sources T1 already got.
Skips quorum verification and Opus synthesis (those are T3-only).
Cost: ~$0.05/prospect. Speed: 15-45s.
"""

from __future__ import annotations

import asyncio
import logging
import time
from datetime import datetime, timedelta
from typing import Optional

from ..router import RouteResult
from ..research_context import get_or_create_context
from . import HandlerResponse

logger = logging.getLogger("pebble.handlers.tier2")


async def handle_t2(
    route: RouteResult,
    crm_bridge,
    client=None,
    user_email: str | None = None,
) -> HandlerResponse:
    """Run T2 (Structured Intelligence) for a single prospect.

    1. Get/create ProspectResearchContext
    2. Resolve prospect_type (from T1 context or classify now)
    3. Run cluster research (3 concurrent clusters, source-routed)
    4. Score source richness + activate foragers
    5. Organize output across 5 dimensions
    """
    from ..orchestrator import (
        score_source_richness,
        activate_foragers,
        ProspectBudgetTracker,
    )
    from ..prospect_type import ProspectType, classify_prospect
    from ..clusters import run_cluster_research

    person_name = route.entities.get("person_name", "")
    org_name = route.entities.get("org_name", "")
    crm_match = route.entities.get("crm_match")
    name = person_name or org_name or "Unknown"

    prospect_id = crm_match["id"] if crm_match else name.replace(" ", "_").lower()
    ctx = get_or_create_context(prospect_id, person_name, org_name)

    prospect = {
        "first_name": person_name.split()[0] if person_name else "",
        "last_name": " ".join(person_name.split()[1:]) if person_name else "",
        "organization": org_name,
        "organizations": [org_name] if org_name else [],
    }

    budget = ProspectBudgetTracker(prospect_id=name)

    # --- Resolve prospect type ---
    if ctx.prospect_type:
        # T1 already classified — safely deserialize
        try:
            prospect_type = ProspectType(ctx.prospect_type)
        except ValueError:
            logger.warning("T2: invalid prospect_type '%s' in context, falling back to UNKNOWN",
                           ctx.prospect_type)
            prospect_type = ProspectType.UNKNOWN
        logger.info("T2: using T1 classification: %s (%.0f%% via %s)",
                     prospect_type.value, ctx.prospect_type_confidence * 100,
                     ctx.prospect_type_method)
    else:
        # No T1 context — classify now
        prospect_type, pt_conf, pt_method = classify_prospect(
            crm_match, org_name, ctx.raw_data.get("wiki_data"), client
        )
        ctx.prospect_type = prospect_type.value
        ctx.prospect_type_confidence = pt_conf
        ctx.prospect_type_method = pt_method
        logger.info("T2: classified as %s (%.0f%% via %s)",
                     prospect_type.value, pt_conf * 100, pt_method)

    # --- Run cluster research (replaces flat fetch-all) ---
    scratchpad, cluster_claims = await run_cluster_research(
        ctx, person_name, org_name, prospect_type, budget, client,
    )

    logger.info("T2: cluster research complete — %d claims, statuses=%s",
                len(cluster_claims), scratchpad.cluster_status)

    # --- Build agents_log from scratchpad ---
    agents_log: list[dict] = []

    # Cluster-level entries
    for cluster_name in ["financial", "affiliation", "public_profile"]:
        budget_map = {
            "financial": scratchpad.financial_budget,
            "affiliation": scratchpad.affiliation_budget,
            "public_profile": scratchpad.profile_budget,
        }
        cluster_budget = budget_map[cluster_name]
        agents_log.append({
            "name": f"{cluster_name}_cluster",
            "outcome": scratchpad.cluster_status.get(cluster_name, "unknown"),
            "elapsed_seconds": round(cluster_budget.elapsed(), 3),
            "cost_usd": 0.0,
            "tokens_input": 0, "tokens_output": 0,
            "attempts": cluster_budget.api_calls_used,
            "error": ", ".join(cluster_budget.failed_sources) if cluster_budget.failed_sources else None,
            "records_found": None,
        })

    # Individual data sources that failed or returned no data
    for skipped in scratchpad.skipped_sources:
        agents_log.append({
            "name": skipped,
            "outcome": "skipped",
            "elapsed_seconds": 0.0,
            "cost_usd": 0.0,
            "tokens_input": 0, "tokens_output": 0,
            "attempts": 0,
            "error": "skipped",
            "records_found": None,
        })

    # --- Score source richness ---
    source_scores = await score_source_richness(
        ctx.raw_data.get("propublica_data"),
        ctx.raw_data.get("sec_data"),
        ctx.raw_data.get("fec_data"),
        ctx.raw_data.get("edgar_data"),
        ctx.raw_data.get("usa_data"),
        ctx.raw_data.get("wiki_data"),
        ctx.raw_data.get("oc_data"),
        lda_data=ctx.raw_data.get("lda_lobbyists") or ctx.raw_data.get("lda_filings"),
        finra_data=ctx.raw_data.get("finra_data"),
        federal_register_data=ctx.raw_data.get("federal_register_data"),
        fec_committees_data=ctx.raw_data.get("fec_committees_data"),
        insider_data=ctx.raw_data.get("insider_data"),
    )
    ctx.source_scores = source_scores

    # --- Activate foragers ---
    t0_foragers = time.time()
    forager_claims = []
    if client:
        try:
            forager_claims = await activate_foragers(
                source_scores,
                {
                    "fec_data": ctx.raw_data.get("fec_data"),
                    "oc_data": ctx.raw_data.get("oc_data"),
                    "usa_data": ctx.raw_data.get("usa_data"),
                    "propublica_data": ctx.raw_data.get("propublica_data"),
                    "edgar_data": ctx.raw_data.get("edgar_data"),
                    "wiki_data": ctx.raw_data.get("wiki_data"),
                },
                prospect, client, budget,
                prospect_type=prospect_type.value,
            )
            agents_log.append({
                "name": "foragers",
                "outcome": "success",
                "elapsed_seconds": round(time.time() - t0_foragers, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": None,
                "records_found": len(forager_claims),
            })
        except Exception as e:
            agents_log.append({
                "name": "foragers",
                "outcome": "error",
                "elapsed_seconds": round(time.time() - t0_foragers, 3),
                "cost_usd": 0.0,
                "tokens_input": 0, "tokens_output": 0,
                "attempts": 1,
                "error": str(e)[:200],
                "records_found": None,
            })
            logger.warning("T2 forager activation failed: %s", e)

    ctx.forager_claims = forager_claims
    ctx.mark_tier_complete("T2")

    # --- Format output across 5 dimensions ---
    all_claims = ctx.all_claims()
    dimensions = _organize_by_dimension(all_claims)

    text_parts = [f"**Structured Intelligence: {name}**"]
    text_parts.append(f"Prospect Type: {prospect_type.value.upper()} ({ctx.prospect_type_confidence:.0%})\n")

    dim_labels = [
        "Giving Capacity", "Organizational Affiliations",
        "Board Positions & Leadership", "Wealth Sources & Financial Footprint",
        "Comparable Giving",
    ]
    for label, key in zip(dim_labels, ["giving", "affiliations", "boards", "wealth", "comparable"]):
        dim_claims = dimensions.get(key, [])
        if dim_claims:
            text_parts.append(f"\n**{label}** ({len(dim_claims)} findings)")
            for c in dim_claims[:5]:
                text_parts.append(f"  - {c['text']}")
        else:
            text_parts.append(f"\n**{label}**: No data found")

    # Note connected orgs (store-only — Sprint 4)
    connected_orgs = ctx.raw_data.get("connected_orgs", [])
    connected_orgs_count = len(connected_orgs)

    active_sources = sum(1 for s in source_scores.values() if s > 0)
    text_parts.append(f"\n{len(all_claims)} total claims from {active_sources}/{len(source_scores)} sources.")

    if connected_orgs_count > 0:
        text_parts.append(f"{connected_orgs_count} connected organizations available for investigation.")

    # Surface cluster failures so the user knows results may be incomplete
    failed_clusters = [
        name for name, status in scratchpad.cluster_status.items()
        if status in ("timeout", "error")
    ]
    if failed_clusters:
        text_parts.append(f"\n*Note: {', '.join(failed_clusters)} cluster(s) {'timed out' if 'timeout' in scratchpad.cluster_status.values() else 'failed'} — results may be incomplete.*")

    if scratchpad.skipped_sources:
        source_list = ", ".join(sorted(set(scratchpad.skipped_sources)))
        text_parts.append(f"\n*Data unavailable from: {source_list}. Results may be incomplete.*")

    return HandlerResponse(
        text="\n".join(text_parts),
        level=20,
        intent=route.intent,
        cost_usd=budget.total_cost_usd,
        data={
            "dimensions": dimensions,
            "claims_count": len(all_claims),
            "source_scores": source_scores,
            "prospect_type": prospect_type.value,
            "cluster_status": scratchpad.cluster_status,
            "connected_orgs_count": connected_orgs_count,
        },
        sources=[c.get("source_url", "") for c in all_claims if c.get("source_url")][:15],
        agents_log=agents_log,
    )


def _organize_by_dimension(claims: list[dict]) -> dict[str, list[dict]]:
    """Organize claims into the 5 research dimensions by keyword matching."""
    dimensions: dict[str, list[dict]] = {
        "giving": [], "affiliations": [], "boards": [],
        "wealth": [], "comparable": [],
    }
    giving_kw = {"contribut", "donat", "fec", "giving", "grant", "philanthrop", "gift"}
    board_kw = {"board", "director", "trustee", "advisory", "governor", "committee"}
    wealth_kw = {"sec", "edgar", "filing", "award", "contract", "federal", "revenue", "asset",
                 "net worth", "insider", "form 4", "finra", "broker"}
    affil_kw = {"officer", "president", "ceo", "cfo", "cto", "vp", "manager", "founder", "co-founder",
                "title", "employ", "executive", "leader", "chief", "lobbyist", "registrant"}

    for claim in claims:
        text_lower = claim.get("text", "").lower()
        url_lower = claim.get("source_url", "").lower()

        if any(k in text_lower or k in url_lower for k in giving_kw):
            dimensions["giving"].append(claim)
        elif any(k in text_lower for k in board_kw):
            dimensions["boards"].append(claim)
        elif any(k in text_lower or k in url_lower for k in wealth_kw):
            dimensions["wealth"].append(claim)
        elif any(k in text_lower for k in affil_kw):
            dimensions["affiliations"].append(claim)
        else:
            dimensions["affiliations"].append(claim)

    # --- Per-dimension: sort by recency, tag age, cap to 5 ---
    now = datetime.now()
    old_cutoff = (now - timedelta(days=3650)).strftime("%Y")      # ~10 years
    very_old_cutoff = (now - timedelta(days=7300)).strftime("%Y")  # ~20 years

    def _sort_key(claim):
        """Sort by data_as_of descending. None sorts last."""
        d = claim.get("data_as_of")
        return d if d else ""

    for key in dimensions:
        sorted_claims = sorted(dimensions[key], key=_sort_key, reverse=True)
        for c in sorted_claims:
            d = c.get("data_as_of")
            if d:
                year = d[:4]
                if year < very_old_cutoff:
                    c["data_age"] = "very_old"
                elif year < old_cutoff:
                    c["data_age"] = "old"
        dimensions[key] = sorted_claims[:5]

    return dimensions
