"""Pebble API: prospect research pipeline. Integration #9."""

import asyncio
import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import ResearchRequest, ResearchFeedback
from .storage.db import init_db, save_profile, get_profile, save_feedback

logger = logging.getLogger("pebble.main")


async def _noop():
    return None


def _safe_result(val):
    """Return None if val is an Exception (from gather return_exceptions)."""
    return None if isinstance(val, BaseException) else val


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    logger.info(
        "Pebble starting — ANTHROPIC_API_KEY=%s, OPENROUTER_API_KEY=%s, FEC_API_KEY=%s",
        "set" if os.getenv("ANTHROPIC_API_KEY") else "MISSING",
        "set" if os.getenv("OPENROUTER_API_KEY") else "MISSING",
        "set" if os.getenv("FEC_API_KEY") else "MISSING",
    )
    yield


app = FastAPI(
    title="Pebble API",
    description="Prospect research pipeline for Bedrock. Integration #9.",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def _error_response(code: str, message: str, status: int = 400) -> dict:
    """BedrockResult-style error."""
    return {"success": False, "error": {"code": code, "message": message}}


@app.post("/api/v1/research/request")
async def research_request(body: ResearchRequest):
    """Accept research request. Runs Stage 1 enrichment when prospects provided."""
    if not body.prospects:
        return {"status": "queued", "contact_ids": body.contact_ids}

    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    # Build prospect map from request
    prospect_map = {p.id: p.model_dump() for p in body.prospects}
    # Include contact_ids not in prospects as stubs
    for cid in body.contact_ids:
        if cid not in prospect_map:
            prospect_map[cid] = {"id": cid, "first_name": "", "last_name": "", "organization": "", "ein": None}

    from .orchestrator import (
        stage1_enrich_prospect,
        stage3_fact_check_and_synthesize,
        verify_urls,
        ProspectBudgetTracker,
    )
    from .model_client import ModelClient
    from .data_sources import (
        fetch_organization,
        search_organizations,
        fetch_company,
        search_contributions,
        search_filings,
        search_awards,
        fetch_summary,
        search_officers,
    )
    from .data_sources.sec import search_cik
    from .claim_templates import (
        claims_from_fec,
        claims_from_usaspending,
        claims_from_opencorporates,
        claims_from_edgar_search,
    )

    client = ModelClient()
    results = []

    for cid in body.contact_ids:
        prospect = prospect_map.get(cid, {"id": cid, "first_name": "", "last_name": "", "organization": "", "ein": None, "organizations": None})
        budget = ProspectBudgetTracker(prospect_id=cid)

        try:
            # Collect org names: organizations list, or single organization
            org_names = list(prospect.get("organizations") or [])
            if prospect.get("organization") and prospect["organization"] not in org_names:
                org_names.insert(0, prospect["organization"])
            primary_org = org_names[0] if org_names else prospect.get("organization")

            ein = prospect.get("ein")
            name = f"{prospect.get('first_name', '')} {prospect.get('last_name', '')}".strip() or primary_org or ""

            # Phase 1: All independent fetches in parallel
            phase1 = await asyncio.gather(
                asyncio.to_thread(search_organizations, primary_org) if primary_org and not ein else _noop(),
                asyncio.to_thread(search_cik, primary_org) if primary_org else _noop(),
                asyncio.to_thread(search_contributions, name, 10) if name else _noop(),
                asyncio.to_thread(search_filings, name) if name else _noop(),
                asyncio.to_thread(search_awards, name) if name else _noop(),
                asyncio.to_thread(fetch_summary, name) if name else _noop(),
                asyncio.to_thread(search_officers, name) if name else _noop(),
                return_exceptions=True,
            )
            ein_orgs, cik_result, fec_data, edgar_data, usa_data, wiki_data, oc_data = [_safe_result(r) for r in phase1]

            # Phase 2: Dependent fetches (need EIN / CIK from phase 1)
            ein = ein or (str(ein_orgs[0]["ein"]) if ein_orgs and ein_orgs[0].get("ein") else None)
            cik_val = cik_result
            phase2 = await asyncio.gather(
                asyncio.to_thread(fetch_organization, ein) if ein else _noop(),
                asyncio.to_thread(fetch_company, cik_val) if cik_val else _noop(),
                return_exceptions=True,
            )
            propublica_data, sec_data = [_safe_result(r) for r in phase2]

            # Build structured claims from templates (no LLM)
            structured_claims = []
            structured_claims.extend(claims_from_fec(fec_data or []))
            structured_claims.extend(claims_from_usaspending(usa_data or []))
            structured_claims.extend(claims_from_opencorporates(oc_data or []))
            structured_claims.extend(claims_from_edgar_search(edgar_data or []))

            # Stage 1: LLM extraction for ProPublica + SEC only
            enriched = stage1_enrich_prospect(prospect, structured_claims, propublica_data, sec_data, client, budget)
            claims = [c for c in enriched.get("claims", []) if isinstance(c, dict) and c.get("source_url")]

            # URL pre-filter: drop claims with dead source URLs before Opus fact-check
            if claims and not budget.exceeded():
                claims, dropped = await verify_urls(claims)
                if dropped:
                    logger.info(
                        "URL pre-filter dropped %d claims: %s",
                        len(dropped), [c.get("source_url") for c in dropped],
                    )

            # Stage 3: Fact-check + synthesis with Wikipedia context
            wikipedia_context = wiki_data.get("extract") if wiki_data else None
            if claims and not budget.exceeded():
                profile_data = stage3_fact_check_and_synthesize(claims, prospect, client, budget, wikipedia_context=wikipedia_context)
                profile = {
                    "claims": profile_data.get("claims", claims),
                    "summary": profile_data.get("summary", ""),
                    "confidence_score": profile_data.get("confidence_score", "medium"),
                    "partial": profile_data.get("partial", False),
                    "failed_agents": profile_data.get("failed_agents", []),
                }
            else:
                profile = {
                    "claims": claims,
                    "summary": "",
                    "confidence_score": "medium",
                    "partial": enriched.get("partial", False),
                    "failed_agents": enriched.get("failed_agents", []),
                }
        except Exception as e:
            logger.exception("Prospect %s failed: %s", cid, e)
            profile = {
                "claims": [],
                "summary": "",
                "confidence_score": "low",
                "partial": True,
                "failed_agents": ["pipeline_error"],
            }

        save_profile(cid, profile)
        results.append({"contact_id": cid, "claims_count": len(profile["claims"])})

    return {"status": "completed", "contact_ids": body.contact_ids, "results": results}


@app.get("/api/v1/research/profiles/{contact_id}")
async def get_research_profile(contact_id: str):
    """Get research profile for a contact. Stub: returns null if not found."""
    profile = get_profile(contact_id)
    if profile is None:
        return {"profile": None}
    return {"profile": profile}


@app.post("/api/v1/research/feedback")
async def research_feedback(body: ResearchFeedback):
    """Store human feedback on a claim."""
    save_feedback(body.claim_id, body.correct)
    return {"ok": True}


@app.get("/health")
async def health():
    return {"status": "ok"}
