"""T3 handler — Full Research Brief. Builds on T2 context or runs full pipeline.

If T2 already ran: skips data fetching + foragers, goes straight to quorum + synthesis.
If only T1 ran: fetches remaining sources, then full pipeline.
If no prior tiers: runs the complete pipeline from scratch.
Cost: ~$0.20-0.50/prospect.
"""

from __future__ import annotations

import logging
from typing import Optional

from ..router import RouteResult
from ..research_context import get_or_create_context
from . import HandlerResponse

logger = logging.getLogger("pebble.handlers.tier3")


async def handle_t3(
    route: RouteResult,
    crm_bridge,
    client=None,
) -> HandlerResponse:
    """Run T3 (Full Research Brief) — quorum verification + Opus synthesis.

    Leverages context from T1/T2 if available. If T2 ran, skips data
    fetching entirely and goes straight to verification + synthesis.
    """
    from ..orchestrator import (
        research_single_prospect, quorum_verify_claims,
        synthesize_profile, verify_urls, ProspectBudgetTracker,
    )
    from ..model_client import ModelClient
    from ..storage.db import save_profile, save_session
    import uuid

    person_name = route.entities.get("person_name", "")
    org_name = route.entities.get("org_name", "")
    crm_match = route.entities.get("crm_match")
    name = person_name or org_name or "Unknown"

    prospect = {
        "id": crm_match["id"] if crm_match else name.replace(" ", "_").lower(),
        "first_name": person_name.split()[0] if person_name else "",
        "last_name": " ".join(person_name.split()[1:]) if person_name else "",
        "organization": org_name,
        "organizations": [org_name] if org_name else [],
    }
    contact_id = prospect["id"]

    model_client = client if isinstance(client, ModelClient) else ModelClient()

    # Get context — check if T2 already ran
    ctx = get_or_create_context(contact_id, person_name, org_name)

    if ctx.tier_completed("T2"):
        # T2 done — skip ALL data fetching and foragers
        # Go straight to quorum verification + Opus synthesis on accumulated claims
        logger.info("T3: T2 context available — skipping data fetch, going to quorum + synthesis")

        budget = ProspectBudgetTracker(prospect_id=contact_id)
        all_claims = ctx.all_claims()

        if not all_claims:
            return HandlerResponse(
                text=f"No claims to verify for {name}. Try running T2 first.",
                level=30, intent=route.intent,
            )

        # --- Org intelligence (after clusters, before verification) ---
        from ..clusters.org_intelligence import investigate_connected_orgs
        from ..clusters.budget import ClusterBudget

        recommendations = []
        org_budget = ClusterBudget(max_api_calls=10, max_seconds=30.0)
        try:
            recommendations, officer_claims = await investigate_connected_orgs(
                ctx, person_name, crm_bridge, org_budget,
                max_orgs=5, enable_xml=True,
            )
            all_claims.extend(officer_claims)  # local list — no double-counting
            ctx.add_source("org_recommendations", recommendations)
            logger.info("T3: org intelligence — %d recommendations, %d officer claims",
                        len(recommendations), len(officer_claims))
        except Exception as e:
            logger.warning("T3 org intelligence failed: %s", e)

        try:
            # URL verification
            all_claims, dropped = await verify_urls(all_claims)

            # Build Wikipedia context for synthesis
            wiki_data = ctx.raw_data.get("wiki_data")
            wikipedia_context = None
            if wiki_data:
                parts = []
                if wiki_data.get("full_text"):
                    parts.append(wiki_data["full_text"][:3000])
                elif wiki_data.get("extract"):
                    parts.append(wiki_data["extract"])
                infobox = wiki_data.get("infobox", {})
                if infobox:
                    parts.append("Infobox: " + ", ".join(f"{k}: {v}" for k, v in infobox.items()))
                wikipedia_context = "\n\n".join(parts) if parts else None

            # Quorum verification
            verified_claims = await quorum_verify_claims(all_claims, prospect, model_client, budget)

            # Opus synthesis
            profile_data = synthesize_profile(
                verified_claims, prospect, model_client, budget,
                wikipedia_context=wikipedia_context,
            )
            profile = {
                "claims": profile_data.get("claims", verified_claims),
                "summary": profile_data.get("summary", ""),
                "confidence_score": profile_data.get("confidence_score", "medium"),
                "partial": profile_data.get("partial", False),
                "failed_agents": profile_data.get("failed_agents", []),
            }
            if recommendations:
                profile["recommendations"] = recommendations
        except Exception as e:
            logger.error("T3 quorum/synthesis failed for %s: %s", name, e)
            profile = {
                "claims": ctx.all_claims(),
                "summary": "",
                "confidence_score": "low",
                "partial": True,
                "failed_agents": ["t3_pipeline_error"],
            }

        # Save profile and session
        save_profile(contact_id, profile)
        save_session(
            session_id=str(uuid.uuid4()),
            contact_id=contact_id,
            profile=profile,
            prospect_name=name,
            prospect_org=org_name,
            cost_usd=budget.total_cost_usd,
            status="completed",
        )
        ctx.mark_tier_complete("T3")

    else:
        # No T2 context — run the full pipeline
        logger.info("T3: No T2 context — running full pipeline")
        try:
            result = await research_single_prospect(
                prospect=prospect,
                contact_id=contact_id,
                client=model_client,
                cancel_check=lambda: False,
            )
        except Exception as e:
            logger.error("T3 pipeline failed for %s: %s", name, e)
            return HandlerResponse(
                text=f"Research pipeline failed for {name}: {e}",
                level=30, intent=route.intent,
            )
        ctx.mark_tier_complete("T3")

    # Fetch the saved profile for display
    from ..storage.db import get_profile
    saved_profile = get_profile(contact_id)
    profile = saved_profile or {}
    claims = profile.get("claims", [])
    summary = profile.get("summary", "")
    confidence = profile.get("confidence_score", "unknown")

    # Format chat response
    text_parts = [f"**Research complete: {name}**\n"]
    if summary:
        sentences = summary.split(". ")
        chat_summary = ". ".join(sentences[:3])
        if len(sentences) > 3:
            chat_summary += "..."
        text_parts.append(chat_summary)
    text_parts.append(f"\nConfidence: **{confidence.upper()}** | {len(claims)} verified claims")
    text_parts.append(f"\nView Full Profile in the Research tab.")

    return HandlerResponse(
        text="\n".join(text_parts),
        level=30,
        intent=route.intent,
        cost_usd=0.0,  # Cost tracked by budget tracker internally
        data={
            "contact_id": contact_id,
            "profile_summary": {
                "claims_count": len(claims),
                "confidence": confidence,
                "partial": profile.get("partial", False),
            },
        },
        sources=[c.get("source_url", "") for c in claims if c.get("source_url")][:10],
    )
