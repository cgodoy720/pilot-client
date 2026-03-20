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


def score_source_richness(
    propublica_data: dict | None,
    sec_data: dict | None,
    fec_data: list | None,
    edgar_data: list | None,
    usa_data: list | None,
    wiki_data: dict | None,
    oc_data: list | None,
) -> dict[str, float]:
    """Scout-Recruit: score each source's data richness (waggle dance). Pure Python, no LLM."""
    scores: dict[str, float] = {}

    # ProPublica: full org with filings = 1.0, org found = 0.5, None = 0.0
    if propublica_data:
        org = propublica_data.get("organization", {})
        scores["propublica"] = 1.0 if org.get("filings_with_data", 0) > 0 else 0.5
    else:
        scores["propublica"] = 0.0

    # SEC: company with filings = 1.0, company found = 0.5, None = 0.0
    if sec_data:
        filings = sec_data.get("filings", sec_data.get("recent", {}))
        scores["sec"] = 1.0 if filings else 0.5
    else:
        scores["sec"] = 0.0

    # List-based sources: min(1.0, len(results) / 5)
    scores["fec"] = min(1.0, len(fec_data) / 5) if fec_data else 0.0
    scores["edgar"] = min(1.0, len(edgar_data) / 5) if edgar_data else 0.0
    scores["usaspending"] = min(1.0, len(usa_data) / 5) if usa_data else 0.0
    scores["opencorporates"] = min(1.0, len(oc_data) / 5) if oc_data else 0.0

    # Wikipedia: 1.0 if extract > 200 chars, 0.5 if shorter, 0.0 if None
    if wiki_data:
        extract = wiki_data.get("extract", "") if isinstance(wiki_data, dict) else ""
        scores["wikipedia"] = 1.0 if len(extract) > 200 else (0.5 if extract else 0.0)
    else:
        scores["wikipedia"] = 0.0

    return scores


async def activate_foragers(
    source_scores: dict[str, float],
    data_results: dict,
    prospect: dict,
    client: ModelClient,
    budget: ProspectBudgetTracker,
) -> list[dict]:
    """Division of Labor: activate specialist FORAGER agents when their signal threshold is met."""
    forager_claims: list[dict] = []

    wealth_score = source_scores.get("fec", 0) + source_scores.get("opencorporates", 0) + source_scores.get("usaspending", 0)
    philanthropy_score = source_scores.get("propublica", 0) + source_scores.get("edgar", 0) + source_scores.get("wikipedia", 0)

    tasks = []

    # Wealth indicator: fires when financial signals >= 1.5
    if wealth_score >= 1.5 and not budget.exceeded():
        source_urls = []
        if data_results.get("fec_data"):
            source_urls.append("https://api.open.fec.gov/")
        if data_results.get("oc_data"):
            source_urls.append("https://api.opencorporates.com/")
        if data_results.get("usa_data"):
            source_urls.append("https://api.usaspending.gov/")

        spec = TaskSpec(
            agent_name="wealth_indicator_agent",
            data={
                "prospect": prospect,
                "fec_data": data_results.get("fec_data", []),
                "oc_data": data_results.get("oc_data", []),
                "usa_data": data_results.get("usa_data", []),
            },
            source_urls=source_urls,
        )
        tasks.append(("wealth_indicator_agent", spec))

    # Philanthropy: fires when nonprofit signals >= 1.0
    if philanthropy_score >= 1.0 and not budget.exceeded():
        source_urls = []
        if data_results.get("propublica_data"):
            ein = data_results["propublica_data"].get("organization", {}).get("ein", "")
            source_urls.append(f"https://projects.propublica.org/nonprofits/organizations/{ein}")
        if data_results.get("edgar_data"):
            source_urls.append("https://efts.sec.gov/LATEST/search-index")
        if data_results.get("wiki_data"):
            name = f"{prospect.get('first_name', '')}_{prospect.get('last_name', '')}".strip("_")
            source_urls.append(f"https://en.wikipedia.org/wiki/{name}")

        spec = TaskSpec(
            agent_name="philanthropy_agent",
            data={
                "prospect": prospect,
                "propublica_data": data_results.get("propublica_data"),
                "edgar_data": data_results.get("edgar_data", []),
                "wiki_data": data_results.get("wiki_data"),
            },
            source_urls=source_urls,
        )
        tasks.append(("philanthropy_agent", spec))

    # Execute foragers (in parallel via asyncio)
    async def _run_forager(agent_name: str, spec: TaskSpec) -> list[dict]:
        harness = WorkerHarness(agent_name, harness_config_for_agent(agent_name), client)
        result = await asyncio.to_thread(harness.execute_task, spec)
        _log_result(result, agent_name, prospect.get("id"))

        if result.outcome in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
            budget.add(result.cost_usd)
            try:
                raw = _strip_fences(result.data.get("content", "{}"))
                data = json.loads(raw)
                claims = data.get("claims", [])
                for c in claims:
                    if isinstance(c, dict):
                        c["origin"] = "forager"
                return [c for c in claims if isinstance(c, dict) and c.get("source_url")]
            except json.JSONDecodeError:
                logger.warning("Failed to parse forager claims from %s", agent_name)
        return []

    if tasks:
        results = await asyncio.gather(*[_run_forager(name, spec) for name, spec in tasks])
        for claim_list in results:
            forager_claims.extend(claim_list)

    return forager_claims


async def quorum_verify_claims(
    claims: list[dict],
    prospect: dict,
    client: ModelClient,
    budget: ProspectBudgetTracker,
) -> list[dict]:
    """Quorum Sensing: 3 independent Haiku verifiers, majority vote (2-of-3) to include a claim."""
    if not claims or budget.exceeded():
        return claims

    # Build numbered claim list for verifier input
    claim_lines = []
    for i, c in enumerate(claims):
        text = c.get("text", "")
        url = c.get("source_url", "")
        confidence = c.get("confidence", "medium")
        claim_lines.append(f"[{i}] {text} (source: {url}, confidence: {confidence})")
    claims_text = "\n".join(claim_lines)

    verifier_names = ["verifier_source", "verifier_consistency", "verifier_crossref"]

    async def _run_verifier(agent_name: str) -> set[int]:
        """Run a single verifier, return set of approved claim indices."""
        harness = WorkerHarness(agent_name, harness_config_for_agent(agent_name), client)
        spec = TaskSpec(
            agent_name=agent_name,
            data={"claims_text": claims_text},
        )
        result = await asyncio.to_thread(harness.execute_task, spec)
        _log_result(result, agent_name, prospect.get("id"))

        if result.outcome in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
            budget.add(result.cost_usd)
            try:
                raw = _strip_fences(result.data.get("content", "{}"))
                data = json.loads(raw)
                approved = set(data.get("approved", []))
                return approved
            except (json.JSONDecodeError, TypeError):
                logger.warning("Failed to parse verifier output from %s", agent_name)
        # On failure, approve all (fail-open to avoid losing claims)
        return set(range(len(claims)))

    # Run all 3 verifiers in parallel
    results = await asyncio.gather(*[_run_verifier(name) for name in verifier_names])

    # Majority vote: claim included if approved by 2-of-3
    verified = []
    for i, claim in enumerate(claims):
        votes = sum(1 for approved_set in results if i in approved_set)
        if votes >= 2:
            claim["verification_votes"] = votes
            verified.append(claim)
        else:
            logger.info("Quorum rejected claim %d (%d/3 votes): %s", i, votes, claim.get("text", "")[:80])

    logger.info("Quorum verification: %d/%d claims passed (2-of-3 vote)", len(verified), len(claims))
    return verified


def synthesize_profile(
    verified_claims: list[dict],
    prospect: dict,
    client: ModelClient,
    budget: ProspectBudgetTracker,
    wikipedia_context: str | None = None,
) -> dict:
    """Synthesis: Opus produces summary + confidence from pre-verified, origin-tagged claims."""
    if budget.exceeded():
        return {"claims": verified_claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["budget"]}

    verified_json = _safe_truncate(verified_claims, max_chars=2500)
    wiki_synth = f"\n\nWikipedia context:\n{wikipedia_context[:1000]}" if wikipedia_context else ""

    prompt = (
        f"Synthesize a 2-3 sentence summary for a development officer. "
        f"Prospect: {prospect.get('first_name', '')} {prospect.get('last_name', '')}.\n"
        f"Claims: {verified_json}{wiki_synth}\n"
        f'Output JSON: {{"summary": "...", "confidence_score": "high|medium|low"}}'
    )
    harness = WorkerHarness("profile_synthesizer", harness_config_for_agent("profile_synthesizer"), client)
    result = harness.execute(prompt, system="You write concise prospect summaries. Output valid JSON only, no markdown fences.")

    _log_result(result, "profile_synthesizer", prospect.get("id"))

    if result.outcome not in (AgentOutcome.SUCCESS, AgentOutcome.ESCALATED):
        return {"claims": verified_claims, "summary": "", "confidence_score": "low", "partial": True, "failed_agents": ["profile_synthesizer"]}

    budget.add(result.cost_usd)

    try:
        raw = _strip_fences(result.data.get("content", "{}"))
        data = json.loads(raw)
        return {
            "claims": verified_claims,
            "summary": data.get("summary", ""),
            "confidence_score": data.get("confidence_score", "medium"),
            "partial": False,
            "failed_agents": [],
        }
    except json.JSONDecodeError:
        return {"claims": verified_claims, "summary": "", "confidence_score": "medium", "partial": False, "failed_agents": []}


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
