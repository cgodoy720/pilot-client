"""Pebble API: prospect research pipeline. Integration #9."""

import asyncio
import hmac
import logging
import os
import uuid
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env", override=True)
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response


# ---------------------------------------------------------------------------
# API key validation (set PEBBLE_API_KEY to enable; empty = dev mode)
# ---------------------------------------------------------------------------
_PEBBLE_API_KEY = os.getenv("PEBBLE_API_KEY", "")


async def verify_api_key(request: Request):
    """Validate X-Api-Key header against PEBBLE_API_KEY.

    If PEBBLE_API_KEY is not set, validation is skipped (dev mode).
    """
    if not _PEBBLE_API_KEY:
        return  # Dev mode — no key required
    provided = request.headers.get("X-Api-Key", "")
    if not provided or not hmac.compare_digest(provided, _PEBBLE_API_KEY):
        raise HTTPException(status_code=403, detail="Invalid or missing API key")

from .schemas import ResearchRequest, ResearchFeedback, CancelRequest
from .storage.db import (
    init_db, save_profile, get_profile, save_feedback,
    get_feedback_for_contact, get_feedback_trends,
    save_session, get_recent_sessions, get_session,
)
from .export import render_profile_markdown

# Cooperative cancellation: job_ids that should be stopped
_cancel_flags: set[str] = set()

logger = logging.getLogger("pebble.main")


async def _noop():
    return None


def _safe_result(val):
    """Return None if val is an Exception (from gather return_exceptions)."""
    return None if isinstance(val, BaseException) else val


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s %(name)s %(levelname)s %(message)s",
    )
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

_pebble_cors_origins = ["http://localhost:3000"]
_frontend_url = os.getenv("FRONTEND_URL")
if _frontend_url:
    _pebble_cors_origins.append(_frontend_url)

app.add_middleware(
    CORSMiddleware,
    allow_origins=_pebble_cors_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization", "X-Api-Key", "Cookie"],
)

# Rate limiting
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

limiter = Limiter(key_func=get_remote_address)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


def _error_response(code: str, message: str, status: int = 400) -> dict:
    """BedrockResult-style error."""
    return {"success": False, "error": {"code": code, "message": message}}


@app.post("/api/v1/research/cancel", dependencies=[Depends(verify_api_key)])
async def cancel_research(body: CancelRequest):
    """Cancel a running research job by job_id."""
    _cancel_flags.add(body.job_id)
    logger.info("Cancel requested for job %s", body.job_id)
    return {"ok": True, "job_id": body.job_id}


def _is_cancelled(job_id: str | None) -> bool:
    """Check if a job has been cancelled."""
    return job_id is not None and job_id in _cancel_flags


@app.post("/api/v1/research/request", dependencies=[Depends(verify_api_key)])
@limiter.limit("10/minute")
async def research_request(request: Request, body: ResearchRequest):
    """Accept research request. Runs Stage 1 enrichment when prospects provided."""
    if not body.prospects:
        return {"status": "queued", "contact_ids": body.contact_ids}

    if not os.getenv("ANTHROPIC_API_KEY"):
        raise HTTPException(status_code=503, detail="ANTHROPIC_API_KEY not configured")

    job_id = body.job_id

    # Build prospect map from request
    prospect_map = {p.id: p.model_dump() for p in body.prospects}
    # Include contact_ids not in prospects as stubs
    for cid in body.contact_ids:
        if cid not in prospect_map:
            prospect_map[cid] = {"id": cid, "first_name": "", "last_name": "", "organization": "", "ein": None}

    from .orchestrator import (
        stage1_enrich_prospect,
        score_source_richness,
        activate_foragers,
        quorum_verify_claims,
        synthesize_profile,
        verify_urls,
        ProspectBudgetTracker,
    )
    from .storage.db import save_source_scores
    from .model_client import ModelClient
    from .data_sources import (
        fetch_organization,
        search_organizations,
        fetch_company,
        search_contributions,
        search_filings,
        search_awards,
        fetch_full_profile,
        search_officers,
    )
    from .data_sources.sec import search_cik
    from .claim_templates import (
        claims_from_fec,
        claims_from_usaspending,
        claims_from_opencorporates,
        claims_from_edgar_search,
        claims_from_wikipedia_infobox,
    )

    client = ModelClient()
    results = []

    cancelled = False

    for cid in body.contact_ids:
        # Cancel checkpoint: before starting a new prospect
        if _is_cancelled(job_id):
            logger.info("Job %s cancelled before prospect %s", job_id, cid)
            cancelled = True
            break

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
                asyncio.to_thread(fetch_full_profile, name) if name else _noop(),
                asyncio.to_thread(search_officers, name) if name else _noop(),
                return_exceptions=True,
            )
            ein_orgs, cik_result, fec_data, edgar_data, usa_data, wiki_data, oc_data = [_safe_result(r) for r in phase1]

            # Cancel checkpoint: after data fetches, before dependent fetches
            if _is_cancelled(job_id):
                logger.info("Job %s cancelled after phase 1 for %s", job_id, cid)
                cancelled = True
                break

            # Phase 2: Dependent fetches (need EIN / CIK from phase 1)
            ein = ein or (str(ein_orgs[0]["ein"]) if ein_orgs and ein_orgs[0].get("ein") else None)
            cik_val = cik_result
            phase2 = await asyncio.gather(
                asyncio.to_thread(fetch_organization, ein) if ein else _noop(),
                asyncio.to_thread(fetch_company, cik_val) if cik_val else _noop(),
                return_exceptions=True,
            )
            propublica_data, sec_data = [_safe_result(r) for r in phase2]

            # Score source richness (waggle dance)
            source_scores = score_source_richness(
                propublica_data, sec_data, fec_data, edgar_data,
                usa_data, wiki_data, oc_data,
            )
            save_source_scores(cid, source_scores)
            logger.info("Source scores for %s: %s", cid, source_scores)

            # Build structured claims from templates (no LLM)
            structured_claims = []
            structured_claims.extend(claims_from_fec(fec_data or []))
            structured_claims.extend(claims_from_usaspending(usa_data or []))
            structured_claims.extend(claims_from_opencorporates(oc_data or []))
            structured_claims.extend(claims_from_edgar_search(edgar_data or []))
            structured_claims.extend(claims_from_wikipedia_infobox(wiki_data))

            # Cancel checkpoint: before LLM-heavy stages
            if _is_cancelled(job_id):
                logger.info("Job %s cancelled before foragers for %s", job_id, cid)
                save_profile(cid, {"claims": structured_claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["cancelled"]})
                results.append({"contact_id": cid, "claims_count": len(structured_claims)})
                cancelled = True
                break

            # Activate specialist foragers (conditional on richness thresholds)
            forager_claims = await activate_foragers(
                source_scores,
                {
                    "fec_data": fec_data,
                    "oc_data": oc_data,
                    "usa_data": usa_data,
                    "propublica_data": propublica_data,
                    "edgar_data": edgar_data,
                    "wiki_data": wiki_data,
                },
                prospect, client, budget,
            )

            # Stage 1: LLM extraction for ProPublica + SEC only
            enriched = stage1_enrich_prospect(prospect, structured_claims, propublica_data, sec_data, client, budget)
            llm_claims = [c for c in enriched.get("claims", []) if isinstance(c, dict) and c.get("source_url")]

            # Merge all claims: template + forager + llm-extracted
            all_claims = llm_claims + forager_claims
            logger.info(
                "Claim pool for %s: %d template, %d forager, %d llm = %d total",
                cid, len(structured_claims), len(forager_claims),
                len(llm_claims) - len(structured_claims), len(all_claims),
            )

            # Cancel checkpoint: before verification and synthesis
            if _is_cancelled(job_id):
                logger.info("Job %s cancelled before verification for %s", job_id, cid)
                save_profile(cid, {"claims": all_claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["cancelled"]})
                results.append({"contact_id": cid, "claims_count": len(all_claims)})
                cancelled = True
                break

            # URL pre-filter: drop claims with dead source URLs
            if all_claims and not budget.exceeded():
                all_claims, dropped = await verify_urls(all_claims)
                if dropped:
                    logger.info(
                        "URL pre-filter dropped %d claims: %s",
                        len(dropped), [c.get("source_url") for c in dropped],
                    )

            # Quorum verification (replaces single Opus fact-check)
            # Build enriched Wikipedia context: full text + infobox summary
            wikipedia_context = None
            if wiki_data:
                parts = []
                if wiki_data.get("full_text"):
                    parts.append(wiki_data["full_text"][:3000])
                elif wiki_data.get("extract"):
                    parts.append(wiki_data["extract"])
                infobox = wiki_data.get("infobox", {})
                if infobox:
                    infobox_summary = ", ".join(f"{k}: {v}" for k, v in infobox.items())
                    parts.append(f"Infobox: {infobox_summary}")
                wikipedia_context = "\n\n".join(parts) if parts else None
            verified_claims = all_claims
            if all_claims and not budget.exceeded():
                verified_claims = await quorum_verify_claims(all_claims, prospect, client, budget)

            # Cancel checkpoint: before synthesis (most expensive LLM call)
            if _is_cancelled(job_id):
                logger.info("Job %s cancelled before synthesis for %s", job_id, cid)
                save_profile(cid, {"claims": verified_claims, "summary": "", "confidence_score": "medium", "partial": True, "failed_agents": ["cancelled"]})
                results.append({"contact_id": cid, "claims_count": len(verified_claims)})
                cancelled = True
                break

            # Synthesis (Opus, with pre-verified origin-tagged claims)
            if verified_claims and not budget.exceeded():
                profile_data = synthesize_profile(verified_claims, prospect, client, budget, wikipedia_context=wikipedia_context)
                profile = {
                    "claims": profile_data.get("claims", verified_claims),
                    "summary": profile_data.get("summary", ""),
                    "confidence_score": profile_data.get("confidence_score", "medium"),
                    "partial": profile_data.get("partial", False),
                    "failed_agents": profile_data.get("failed_agents", []),
                }
            else:
                profile = {
                    "claims": verified_claims,
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
        # Save session history entry
        session_status = "cancelled" if _is_cancelled(job_id) else "completed"
        save_session(
            session_id=str(uuid.uuid4()),
            contact_id=cid,
            profile=profile,
            prospect_name=name,
            prospect_org=primary_org or "",
            cost_usd=budget.total_cost if hasattr(budget, "total_cost") else None,
            status=session_status,
        )
        results.append({"contact_id": cid, "claims_count": len(profile["claims"])})

    # Clean up cancel flag
    if job_id:
        _cancel_flags.discard(job_id)

    status = "cancelled" if cancelled else "completed"
    return {"status": status, "contact_ids": body.contact_ids, "results": results}


@app.get("/api/v1/research/profiles/{contact_id}/export", dependencies=[Depends(verify_api_key)])
async def export_profile(contact_id: str, format: str = "md"):
    """Export a research profile as Markdown (or PDF in the future)."""
    profile = get_profile(contact_id)
    if profile is None:
        raise HTTPException(status_code=404, detail="Profile not found")

    # Try to find prospect name/org from the most recent session
    from .storage.db import get_db
    conn = get_db()
    try:
        row = conn.execute(
            "SELECT prospect_name, prospect_org FROM research_sessions WHERE contact_id = ? ORDER BY created_at DESC LIMIT 1",
            (contact_id,),
        ).fetchone()
        prospect_name = row["prospect_name"] if row else contact_id
        prospect_org = row["prospect_org"] if row else ""
    finally:
        conn.close()

    md_text = render_profile_markdown(profile, prospect_name, prospect_org)

    if format == "pdf":
        from .export import render_profile_pdf
        pdf_bytes = render_profile_pdf(md_text)
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f'attachment; filename="profile-{contact_id}.pdf"'},
        )

    return Response(
        content=md_text,
        media_type="text/markdown",
        headers={"Content-Disposition": f'attachment; filename="profile-{contact_id}.md"'},
    )


@app.get("/api/v1/research/profiles/{contact_id}", dependencies=[Depends(verify_api_key)])
async def get_research_profile(contact_id: str):
    """Get research profile for a contact. Stub: returns null if not found."""
    profile = get_profile(contact_id)
    if profile is None:
        return {"profile": None}
    return {"profile": profile}


@app.post("/api/v1/research/feedback", dependencies=[Depends(verify_api_key)])
async def research_feedback(body: ResearchFeedback):
    """Store human feedback on a claim."""
    save_feedback(body.claim_id, body.correct, text=body.text, contact_id=body.contact_id)
    return {"ok": True}


@app.get("/api/v1/research/feedback/trends", dependencies=[Depends(verify_api_key)])
async def feedback_trends(days: int = 30):
    """Return feedback accuracy trends over the last N days."""
    return get_feedback_trends(days)


@app.get("/api/v1/research/feedback/{contact_id}", dependencies=[Depends(verify_api_key)])
async def contact_feedback(contact_id: str):
    """Return all feedback for a contact."""
    return {"feedback": get_feedback_for_contact(contact_id)}


@app.get("/api/v1/research/history", dependencies=[Depends(verify_api_key)])
async def research_history(limit: int = 100):
    """Return recent research sessions."""
    sessions = get_recent_sessions(limit)
    return {"sessions": sessions}


@app.get("/api/v1/research/history/{session_id}", dependencies=[Depends(verify_api_key)])
async def research_session(session_id: str):
    """Return a full research session including profile."""
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@app.get("/health")
async def health():
    return {"status": "ok"}
