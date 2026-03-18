"""Orchestrator: pipeline stages, ProspectBudgetTracker."""

import json
import logging
from dataclasses import dataclass, field

from .model_client import ModelClient
from .harness import WorkerHarness, HarnessConfig, AgentOutcome
from .storage.db import log_harness_outcome

logger = logging.getLogger("pebble.orchestrator")

PROSPECT_COST_CAP_USD = 0.50


@dataclass
class ProspectBudgetTracker:
    """Sum costs per prospect; abort if cap exceeded."""

    prospect_id: str
    total_cost_usd: float = 0.0
    cap_usd: float = PROSPECT_COST_CAP_USD

    def add(self, cost_usd: float) -> None:
        self.total_cost_usd += cost_usd

    def would_exceed(self, additional_cost_usd: float) -> bool:
        return self.total_cost_usd + additional_cost_usd > self.cap_usd

    def exceeded(self) -> bool:
        return self.total_cost_usd > self.cap_usd


def _log_result(result, agent_name: str, prospect_id: str | None = None) -> None:
    """Log harness outcome to harness_log."""
    log_harness_outcome(
        agent_name=agent_name,
        outcome=result.outcome.value,
        cost_usd=result.cost_usd if result.outcome == AgentOutcome.SUCCESS else None,
        tokens_input=result.tokens_used.get("input", 0),
        tokens_output=result.tokens_used.get("output", 0),
        attempts=result.attempts,
        elapsed_seconds=result.elapsed_seconds,
        error=result.error,
        prospect_id=prospect_id,
    )


def stage1_enrich_prospect(
    prospect: dict,
    propublica_data: dict | None,
    sec_data: dict | None,
    fec_data: list | None,
    client: ModelClient,
    budget: ProspectBudgetTracker,
) -> dict:
    """
    Stage 1: Extract structured claims from raw API data using Haiku.
    Returns enriched prospect with claims (each has source_url).
    """
    if budget.exceeded():
        return {"prospect_id": prospect["id"], "claims": [], "partial": True, "failed_agents": ["budget_exceeded"]}

    # Build context for extraction
    context_parts = []
    sources = []

    if propublica_data:
        org = propublica_data.get("organization", {})
        filings = propublica_data.get("filings_with_data", [])[:3]
        context_parts.append(f"ProPublica 990: {json.dumps(org)[:2000]}...")
        sources.append("https://projects.propublica.org/nonprofits/organizations/" + str(org.get("ein", "")))

    if sec_data:
        context_parts.append(f"SEC: {json.dumps(sec_data)[:2000]}...")
        sources.append("https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=" + str(sec_data.get("cik", "")))

    if fec_data:
        context_parts.append(f"FEC: {json.dumps(fec_data[:5])[:1500]}...")
        sources.append("https://www.fec.gov/data/receipts/individual-contributions/")

    if not context_parts:
        return {"prospect_id": prospect["id"], "claims": [], "summary": "No external data found"}

    prompt = f"""Extract factual claims about this prospect from the following data. 
Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')} at {prospect.get('organization', '')}

Data:
{chr(10).join(context_parts)}

Output JSON with this exact structure. Every claim MUST have a source_url.
{{"claims": [{{"text": "...", "source_url": "https://...", "confidence": "high|medium|low"}}]}}

Use these source URLs: {', '.join(sources[:5])}
"""

    harness = WorkerHarness("api_response_extractor", HarnessConfig(), client)
    result = harness.execute(prompt, system="You extract factual claims. Every claim must have source_url.")

    _log_result(result, "api_response_extractor", prospect["id"])

    if result.outcome != AgentOutcome.SUCCESS:
        return {"prospect_id": prospect["id"], "claims": [], "partial": True, "failed_agents": ["api_response_extractor"]}

    budget.add(result.cost_usd)

    try:
        data = json.loads(result.data.get("content", "{}"))
        claims = data.get("claims", [])
        # Ensure every claim has source_url
        for c in claims:
            if isinstance(c, dict) and not c.get("source_url") and sources:
                c["source_url"] = sources[0]
        return {"prospect_id": prospect["id"], "claims": claims}
    except json.JSONDecodeError:
        return {"prospect_id": prospect["id"], "claims": [], "partial": True, "failed_agents": ["api_response_extractor"]}


def stage1_batch_summary(prospects: list[dict], client: ModelClient, budget: ProspectBudgetTracker) -> dict | None:
    """Batch summary for ~50 contacts. Returns summary text or None."""
    if not prospects or budget.exceeded():
        return None

    names = [f"{p.get('first_name', '')} {p.get('last_name', '')} ({p.get('organization', '')})" for p in prospects[:50]]
    prompt = f"""Summarize these prospects in 2-3 sentences for prioritization:
{chr(10).join(names)}
"""
    harness = WorkerHarness("batch_summarizer", HarnessConfig(), client)
    result = harness.execute(prompt, system="You provide brief prioritization summaries.")

    _log_result(result, "batch_summarizer", None)

    if result.outcome == AgentOutcome.SUCCESS:
        budget.add(result.cost_usd)
        content = result.data.get("content", "") if result.data else ""
        try:
            return json.loads(content) if content.strip().startswith("{") else {"summary": content}
    except json.JSONDecodeError:
        return {"summary": content}
    return None


def stage2_score(prospects: list[dict], amount: float = 0, probability: float = 50) -> float:
    """Stage 2: Quick-score formula. amount × (probability/100) × size_factor."""
    if amount <= 0:
        return 0.0
    import math
    size_factor = 1 + math.log10(1 + amount / 1_000_000)
    return amount * (probability / 100) * size_factor


def stage3_fact_check_and_synthesize(
    claims: list[dict],
    prospect: dict,
    client: ModelClient,
    budget: ProspectBudgetTracker,
) -> dict:
    """
    Stage 3 (reduced): Fact-check (Opus) + Profile Synthesizer (Opus).
    Returns profile with claims, summary, confidence_score.
    """
    if budget.exceeded():
        return {"claims": claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["budget"]}

    # Fact-check: verify claims have source support
    claims_json = json.dumps(claims[:20])[:3000]  # Compress
    prompt = f"""Verify these claims are supported by their source URLs. Remove any claim that cannot be verified.
Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')} at {prospect.get('organization', '')}

Claims:
{claims_json}

Output JSON: {{"verified_claims": [{{"text", "source_url", "confidence"}}]}}
"""
    harness = WorkerHarness("fact_check_agent", HarnessConfig(), client)
    result = harness.execute(prompt, system="You verify claims against sources. Only include claims with valid source_url.")

    _log_result(result, "fact_check_agent", prospect.get("id"))

    if result.outcome != AgentOutcome.SUCCESS:
        return {"claims": claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["fact_check_agent"]}

    budget.add(result.cost_usd)

    verified = claims
    try:
        data = json.loads(result.data.get("content", "{}"))
        verified = data.get("verified_claims", claims)
    except (json.JSONDecodeError, TypeError):
        pass

    # Profile Synthesizer
    verified_json = json.dumps(verified)[:2500]
    prompt2 = f"""Synthesize a 2-3 sentence summary for a development officer. Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')}.
Claims: {verified_json}
Output JSON: {{"summary": "...", "confidence_score": "high|medium|low"}}
"""
    harness2 = WorkerHarness("profile_synthesizer", HarnessConfig(), client)
    result2 = harness2.execute(prompt2, system="You write concise prospect summaries. Output valid JSON only.")

    _log_result(result2, "profile_synthesizer", prospect.get("id"))

    if result2.outcome != AgentOutcome.SUCCESS:
        return {"claims": verified, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["profile_synthesizer"]}

    budget.add(result2.cost_usd)

    try:
        data2 = json.loads(result2.data.get("content", "{}"))
        return {
            "claims": verified,
            "summary": data2.get("summary", ""),
            "confidence_score": data2.get("confidence_score", "medium"),
            "partial": False,
            "failed_agents": [],
        }
    except json.JSONDecodeError:
        return {"claims": verified, "summary": "", "confidence_score": "medium", "partial": False, "failed_agents": []}
