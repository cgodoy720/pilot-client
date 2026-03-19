"""Orchestrator: pipeline stages, ProspectBudgetTracker."""

import asyncio
import json
import logging
import re
from dataclasses import dataclass, field

from .model_client import ModelClient
from .harness import WorkerHarness, HarnessConfig, AgentOutcome, TaskSpec, harness_config_for_agent
from .storage.db import log_harness_outcome

logger = logging.getLogger("pebble.orchestrator")

PROSPECT_COST_CAP_USD = 0.50

# Strip markdown fences that LLMs sometimes wrap around JSON
_FENCE_RE = re.compile(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", re.DOTALL)


def _strip_fences(text: str) -> str:
    """Remove markdown code fences wrapping JSON output."""
    m = _FENCE_RE.match(text.strip())
    return m.group(1) if m else text


def _safe_truncate(records, max_chars: int = 2000) -> str:
    """Serialize records individually, stop when byte limit reached."""
    parts = []
    total = 2  # for "[]"
    items = records if isinstance(records, list) else [records]
    for r in items:
        s = json.dumps(r)
        if total + len(s) + 2 > max_chars:
            break
        parts.append(s)
        total += len(s) + 2
    return "[" + ", ".join(parts) + "]"


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
    structured_claims: list[dict],
    propublica_data: dict | None,
    sec_data: dict | None,
    client: ModelClient,
    budget: ProspectBudgetTracker,
) -> dict:
    """
    Stage 1: Merge structured claims (from templates) with LLM-extracted claims.
    Only sends ProPublica + SEC data to Haiku for extraction; structured data skips LLM.
    """
    if budget.exceeded():
        return {"prospect_id": prospect["id"], "claims": structured_claims, "partial": True, "failed_agents": ["budget_exceeded"]}

    # If no ProPublica/SEC data, skip LLM entirely — return just structured claims
    if not propublica_data and not sec_data:
        return {"prospect_id": prospect["id"], "claims": structured_claims}

    # Build context for Haiku extraction of ProPublica + SEC only
    context_parts = []
    sources = []

    if propublica_data:
        org = propublica_data.get("organization", {})
        context_parts.append(f"ProPublica 990: {_safe_truncate(org)}")
        sources.append("https://projects.propublica.org/nonprofits/organizations/" + str(org.get("ein", "")))

    if sec_data:
        context_parts.append(f"SEC: {_safe_truncate(sec_data)}")
        sources.append("https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=" + str(sec_data.get("cik", "")))

    harness = WorkerHarness("api_response_extractor", harness_config_for_agent("api_response_extractor"), client)
    spec = TaskSpec(
        agent_name="api_response_extractor",
        data={"prospect": prospect, "context_parts": context_parts},
        source_urls=sources,
    )
    result = harness.execute_task(spec)

    _log_result(result, "api_response_extractor", prospect["id"])

    llm_claims = []
    if result.outcome in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
        budget.add(result.cost_usd)
        try:
            raw = _strip_fences(result.data.get("content", "{}"))
            data = json.loads(raw)
            llm_claims = data.get("claims", [])
            for c in llm_claims:
                if isinstance(c, dict):
                    c["origin"] = "llm_extracted"
        except json.JSONDecodeError:
            logger.warning("Failed to parse LLM claims for %s", prospect["id"])

    # Merge: structured claims first (higher reliability), then LLM-extracted
    all_claims = list(structured_claims) + [c for c in llm_claims if isinstance(c, dict) and c.get("source_url")]

    failed = []
    if result.outcome not in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
        failed.append("api_response_extractor")

    return {
        "prospect_id": prospect["id"],
        "claims": all_claims,
        "partial": bool(failed),
        "failed_agents": failed,
    }


def stage1_batch_summary(prospects: list[dict], client: ModelClient, budget: ProspectBudgetTracker) -> dict | None:
    """Batch summary for ~50 contacts. Returns summary text or None."""
    if not prospects or budget.exceeded():
        return None

    names = [f"{p.get('first_name', '')} {p.get('last_name', '')} ({p.get('organization', '')})" for p in prospects[:50]]
    harness = WorkerHarness("batch_summarizer", harness_config_for_agent("batch_summarizer"), client)
    spec = TaskSpec(
        agent_name="batch_summarizer",
        data={"prospect_names": names},
    )
    result = harness.execute_task(spec)

    _log_result(result, "batch_summarizer", None)

    if result.outcome == AgentOutcome.SUCCESS:
        budget.add(result.cost_usd)
        content = result.data.get("content", "") if result.data else ""
        try:
            raw = _strip_fences(content)
            return json.loads(raw) if raw.strip().startswith("{") else {"summary": content}
        except json.JSONDecodeError:
            return {"summary": content}
    return None


def stage2_score(prospects: list[dict], amount: float = 0, probability: float = 50) -> float:
    """Stage 2: Quick-score formula. amount x (probability/100) x size_factor."""
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
    wikipedia_context: str | None = None,
) -> dict:
    """
    Stage 3 (reduced): Fact-check (Opus) + Profile Synthesizer (Opus).
    Returns profile with claims, summary, confidence_score.
    """
    if budget.exceeded():
        return {"claims": claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["budget"]}

    # Fact-check: verify claims have source support
    claims_json = _safe_truncate(claims[:20], max_chars=3000)
    wiki_section = ""
    if wikipedia_context:
        wiki_section = f"\n\nWikipedia context (use for biographical depth, cross-reference with claims):\n{wikipedia_context[:1500]}"

    prompt = f"""Verify these claims are supported by their source URLs. Remove any claim that cannot be verified.
Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')} at {prospect.get('organization', '')}

Claims:
{claims_json}{wiki_section}

Output JSON: {{"verified_claims": [{{"text", "source_url", "confidence"}}]}}
"""
    harness = WorkerHarness("fact_check_agent", harness_config_for_agent("fact_check_agent"), client)
    result = harness.execute(prompt, system="You verify claims against sources. Only include claims with valid source_url. Output valid JSON only, no markdown fences.")

    _log_result(result, "fact_check_agent", prospect.get("id"))

    if result.outcome not in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
        return {"claims": claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["fact_check_agent"]}

    budget.add(result.cost_usd)

    verified = claims
    try:
        raw = _strip_fences(result.data.get("content", "{}"))
        data = json.loads(raw)
        verified = data.get("verified_claims", claims)
    except (json.JSONDecodeError, TypeError):
        pass

    # Profile Synthesizer
    verified_json = _safe_truncate(verified, max_chars=2500)
    wiki_synth = f"\n\nWikipedia context:\n{wikipedia_context[:1000]}" if wikipedia_context else ""

    prompt2 = f"""Synthesize a 2-3 sentence summary for a development officer. Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')}.
Claims: {verified_json}{wiki_synth}
Output JSON: {{"summary": "...", "confidence_score": "high|medium|low"}}
"""
    harness2 = WorkerHarness("profile_synthesizer", harness_config_for_agent("profile_synthesizer"), client)
    result2 = harness2.execute(prompt2, system="You write concise prospect summaries. Output valid JSON only, no markdown fences.")

    _log_result(result2, "profile_synthesizer", prospect.get("id"))

    if result2.outcome not in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
        return {"claims": verified, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["profile_synthesizer"]}

    budget.add(result2.cost_usd)

    try:
        raw2 = _strip_fences(result2.data.get("content", "{}"))
        data2 = json.loads(raw2)
        return {
            "claims": verified,
            "summary": data2.get("summary", ""),
            "confidence_score": data2.get("confidence_score", "medium"),
            "partial": False,
            "failed_agents": [],
        }
    except json.JSONDecodeError:
        return {"claims": verified, "summary": "", "confidence_score": "medium", "partial": False, "failed_agents": []}


async def verify_urls(claims: list[dict], timeout: float = 5.0) -> tuple[list[dict], list[dict]]:
    """Verify claim source_urls via HEAD request. Returns (live, dropped)."""
    import httpx

    async def check_one(claim: dict) -> tuple[dict, bool]:
        url = claim.get("source_url", "")
        if not url:
            return claim, False
        try:
            async with httpx.AsyncClient(follow_redirects=True) as client:
                r = await client.head(url, timeout=timeout)
                if r.status_code == 405:  # HEAD not allowed, try GET
                    r = await client.get(url, timeout=timeout)
                return claim, r.status_code != 404
        except httpx.HTTPError:
            return claim, True  # Network error — keep claim, let Opus decide

    results = await asyncio.gather(*[check_one(c) for c in claims])
    live = [c for c, ok in results if ok]
    dropped = [c for c, ok in results if not ok]
    return live, dropped
