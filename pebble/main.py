"""Pebble API: prospect research pipeline. Integration #9."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .schemas import ResearchRequest, ResearchFeedback
from .storage.db import init_db, save_profile, get_profile, save_feedback

logger = logging.getLogger("pebble.main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield


app = FastAPI(
    title="Pebble API",
    description="Prospect research pipeline for Bedrock. Integration #9.",
    version="0.1.0",
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
        ProspectBudgetTracker,
    )
    from .model_client import ModelClient
    from .data_sources import fetch_organization, search_organizations, fetch_company, search_contributions
    from .data_sources.sec import search_cik
    from .storage.db import save_profile

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

            # Fetch raw data (990, SEC) for primary org; Pebble finds EIN when missing
            ein = prospect.get("ein")
            if not ein and primary_org:
                orgs = search_organizations(primary_org)
                if orgs and orgs[0].get("ein"):
                    ein = str(orgs[0]["ein"])
            propublica_data = fetch_organization(ein) if ein else None

            sec_data = None
            if primary_org:
                cik = search_cik(primary_org)
                if cik:
                    sec_data = fetch_company(cik)

            name = f"{prospect.get('first_name', '')} {prospect.get('last_name', '')}".strip() or primary_org or ""
            fec_data = search_contributions(name, limit=10) if name else []

            # Stage 1 enrichment
            enriched = stage1_enrich_prospect(
                prospect, propublica_data, sec_data, fec_data, client, budget
            )
            claims = [c for c in enriched.get("claims", []) if isinstance(c, dict) and c.get("source_url")]

            # Stage 3: Fact-check + Profile Synthesizer (when we have claims)
            if claims and not budget.exceeded():
                profile_data = stage3_fact_check_and_synthesize(claims, prospect, client, budget)
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
