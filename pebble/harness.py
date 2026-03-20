"""WorkerHarness: timeout, retries, schema validation, cost cap, escalation. Queen commands the hive."""

import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Callable

from .model_client import ModelClient, ModelTier, get_model_config, AGENT_TIERS, ESCALATION_CHAIN
from .storage.db import log_harness_outcome

logger = logging.getLogger("pebble.harness")


class AgentOutcome(Enum):
    SUCCESS = "success"
    KILLED_TIMEOUT = "killed_timeout"
    KILLED_BUDGET = "killed_budget"
    KILLED_RETRIES = "killed_retries"
    KILLED_SCHEMA = "killed_schema_fail"
    ESCALATED = "escalated"
    SKIPPED = "skipped"


@dataclass
class HarnessConfig:
    max_input_tokens: int = 6000
    max_output_tokens: int = 3000
    timeout_seconds: float = 120.0
    max_retries: int = 3
    retry_backoff_base: float = 2.0
    output_schema: dict | None = None
    escalation_tier: str | None = None
    cost_cap_usd: float = 0.50


@dataclass
class HarnessResult:
    outcome: AgentOutcome
    data: dict | None = None
    tokens_used: dict = field(default_factory=lambda: {"input": 0, "output": 0})
    cost_usd: float = 0.0
    attempts: int = 0
    elapsed_seconds: float = 0.0
    error: str | None = None


@dataclass
class TaskSpec:
    """Structured task definition. Required for all sub-Queen tiers."""
    agent_name: str
    data: dict
    output_hint: str = ""
    source_urls: list[str] = field(default_factory=list)


PROMPT_TEMPLATES: dict[str, Callable[[dict, list[str]], tuple[str, str]]] = {}
TEMPLATE_MAX_DATA_SOURCES: dict[str, int | None] = {}

# Default max data source keys per tier (Layer 2 guardrail)
_TIER_MAX_DATA_SOURCES = {
    ModelTier.WORKER: 2,
    ModelTier.DRONE: 2,
    ModelTier.FORAGER: 5,
    ModelTier.QUEEN: None,  # uncapped — token budget is the natural guard
}


def register_template(agent_name: str, max_data_sources: int | None = None):
    """Decorator to register a prompt template for an agent.

    Args:
        agent_name: Agent identifier matching AGENT_TIERS key.
        max_data_sources: Explicit override for max data source keys allowed.
            When set, overrides the tier default. Forces a conscious design decision
            with documented reason (see the template's docstring for rationale).
    """
    def decorator(fn):
        PROMPT_TEMPLATES[agent_name] = fn
        if max_data_sources is not None:
            TEMPLATE_MAX_DATA_SOURCES[agent_name] = max_data_sources
        return fn
    return decorator


@register_template("api_response_extractor")
def _tpl_extractor(data: dict, source_urls: list[str]) -> tuple[str, str]:
    prospect = data["prospect"]
    context_parts = data["context_parts"]
    name = f"{prospect.get('first_name', '')} {prospect.get('last_name', '')}".strip()
    org = prospect.get("organization", "")
    prompt = (
        f"Extract factual claims about this prospect from the following data.\n"
        f"Prospect: {name} at {org}\n\n"
        f"Data:\n{chr(10).join(context_parts)}\n\n"
        f'{{"claims": [{{"text": "...", "source_url": "https://...", "confidence": "high|medium|low"}}]}}\n\n'
        f"Use these source URLs: {', '.join(source_urls[:5])}"
    )
    system = "You extract factual claims. Every claim must have source_url. Output valid JSON only, no markdown fences."
    return prompt, system


@register_template("batch_summarizer")
def _tpl_summarizer(data: dict, source_urls: list[str]) -> tuple[str, str]:
    names = data["prospect_names"]
    prompt = f"Summarize these prospects in 2-3 sentences for prioritization:\n{chr(10).join(names)}"
    system = "You provide brief prioritization summaries. Output valid JSON only."
    return prompt, system


@register_template("wealth_indicator_agent")
def _tpl_wealth(data: dict, source_urls: list[str]) -> tuple[str, str]:
    prospect = data["prospect"]
    name = f"{prospect.get('first_name', '')} {prospect.get('last_name', '')}".strip()
    sections = []
    if data.get("fec_data"):
        sections.append(f"FEC Contributions:\n{json.dumps(data['fec_data'][:10], default=str)}")
    if data.get("oc_data"):
        sections.append(f"OpenCorporates Officer Positions:\n{json.dumps(data['oc_data'][:10], default=str)}")
    if data.get("usa_data"):
        sections.append(f"USAspending Awards:\n{json.dumps(data['usa_data'][:10], default=str)}")
    prompt = (
        f"Analyze financial signals for {name} and produce claims about giving capacity, "
        f"wealth indicators, and financial connections.\n\n"
        f"{chr(10).join(sections)}\n\n"
        f"Source URLs: {', '.join(source_urls[:5])}\n\n"
        f'{{"claims": [{{"text": "...", "source_url": "https://...", "confidence": "high|medium|low"}}]}}'
    )
    system = (
        "You are a wealth analysis specialist. Analyze financial signals to produce claims about "
        "giving capacity, wealth indicators, and financial connections. "
        "Every claim must have a source_url. Output valid JSON only, no markdown fences."
    )
    return prompt, system


@register_template("philanthropy_agent")
def _tpl_philanthropy(data: dict, source_urls: list[str]) -> tuple[str, str]:
    prospect = data["prospect"]
    name = f"{prospect.get('first_name', '')} {prospect.get('last_name', '')}".strip()
    sections = []
    if data.get("propublica_data"):
        sections.append(f"ProPublica 990 Data:\n{json.dumps(data['propublica_data'], default=str)[:2000]}")
    if data.get("edgar_data"):
        sections.append(f"EDGAR Filings:\n{json.dumps(data['edgar_data'][:10], default=str)}")
    if data.get("wiki_data"):
        extract = data["wiki_data"].get("extract", "") if isinstance(data["wiki_data"], dict) else ""
        if extract:
            sections.append(f"Wikipedia:\n{extract[:1500]}")
    prompt = (
        f"Analyze nonprofit and biographical data for {name} and produce claims about "
        f"philanthropic activity, board service, and nonprofit affiliations.\n\n"
        f"{chr(10).join(sections)}\n\n"
        f"Source URLs: {', '.join(source_urls[:5])}\n\n"
        f'{{"claims": [{{"text": "...", "source_url": "https://...", "confidence": "high|medium|low"}}]}}'
    )
    system = (
        "You are a philanthropy research specialist. Analyze nonprofit data and biographical info "
        "to produce claims about philanthropic activity, board service, and nonprofit affiliations. "
        "Every claim must have a source_url. Output valid JSON only, no markdown fences."
    )
    return prompt, system


@register_template("verifier_source")
def _tpl_verifier_source(data: dict, source_urls: list[str]) -> tuple[str, str]:
    claims_text = data["claims_text"]
    prompt = (
        f"Evaluate each claim's source credibility.\n\n{claims_text}\n\n"
        f"For each claim: is the source_url a .gov database, major institution site, "
        f"or unrecognizable/suspicious? Approve claims with credible institutional sources.\n\n"
        f'{{"approved": [0, 1, 3], "rejected": [{{"index": 2, "reason": "unverifiable source"}}]}}'
    )
    system = (
        "You verify source credibility. Approve claims from .gov, .edu, major nonprofit, "
        "or established institutional sources. Reject claims with unrecognizable URLs. "
        "Output valid JSON only, no markdown fences."
    )
    return prompt, system


@register_template("verifier_consistency")
def _tpl_verifier_consistency(data: dict, source_urls: list[str]) -> tuple[str, str]:
    claims_text = data["claims_text"]
    prompt = (
        f"Check internal consistency of these claims.\n\n{claims_text}\n\n"
        f"Flag any claim that contradicts another claim in the set. "
        f"Approve claims that are internally consistent.\n\n"
        f'{{"approved": [0, 1, 3], "rejected": [{{"index": 2, "reason": "contradicts claim 0"}}]}}'
    )
    system = (
        "You check internal consistency. Flag claims that contradict each other. "
        "Approve claims that are mutually consistent. Output valid JSON only, no markdown fences."
    )
    return prompt, system


@register_template("verifier_crossref")
def _tpl_verifier_crossref(data: dict, source_urls: list[str]) -> tuple[str, str]:
    claims_text = data["claims_text"]
    prompt = (
        f"Check cross-references among these claims.\n\n{claims_text}\n\n"
        f"Do claims corroborate each other? Claims supported by multiple independent sources "
        f"deserve higher confidence. Approve claims that are corroborated or standalone factual.\n\n"
        f'{{"approved": [0, 1, 3], "rejected": [{{"index": 2, "reason": "no corroboration and low confidence"}}]}}'
    )
    system = (
        "You check cross-references. Approve claims corroborated by other claims or from "
        "authoritative standalone sources. Reject unsupported low-confidence claims. "
        "Output valid JSON only, no markdown fences."
    )
    return prompt, system


# Tier design rules (Layer 3 guardrail — intent documentation):
#
# WORKER/DRONE: Single data source, flat output (lists, indices), no cross-referencing.
#   If your template needs 2+ _data sources, either split the task or promote to FORAGER.
#   System prompt enforces "ONE task only" constraint.
#
# FORAGER: Multi-source domain analysis, analytical claims with reasoning.
#   May cross-reference data. Output is structured claims, not raw extraction.
#   System prompt allows multi-source reasoning.
#
# QUEEN: Pre-processed input only (claims, summaries, not raw API data).
#   Token budget is the natural cap. No source count limit.
#   No system prompt constraint — full reasoning capability.
#
TIER_HARNESS_DEFAULTS = {
    ModelTier.WORKER:  {"max_input_tokens": 4000, "max_output_tokens": 2000},
    ModelTier.DRONE:   {"max_input_tokens": 3000, "max_output_tokens": 1500},
    ModelTier.FORAGER: {"max_input_tokens": 8000, "max_output_tokens": 4000},
    ModelTier.QUEEN:   {"max_input_tokens": 16000, "max_output_tokens": 6000},
}


def harness_config_for_agent(agent_name: str) -> HarnessConfig:
    """Return a HarnessConfig with tier-appropriate defaults."""
    tier = AGENT_TIERS.get(agent_name, ModelTier.WORKER)
    defaults = TIER_HARNESS_DEFAULTS.get(tier, {})
    return HarnessConfig(**defaults)


def _validate_schema(response: dict, schema: dict | None) -> tuple[bool, str | None]:
    """Validate response against JSON schema. Returns (is_valid, error_msg)."""
    if not schema:
        return True, None
    # Minimal validation: check required keys exist
    content = response.get("content", "")
    try:
        parsed = json.loads(content) if isinstance(content, str) else content
    except json.JSONDecodeError as e:
        return False, f"Invalid JSON: {e}"
    if "properties" in schema:
        required = schema.get("required", [])
        for key in required:
            if key not in parsed:
                return False, f"Missing required field: {key}"
    return True, None


def _validate_claims_have_source_url(data: dict) -> tuple[bool, str | None]:
    """Reject any claim without source_url (CLAUDE.md Rule 9)."""
    claims = data.get("claims", []) if isinstance(data, dict) else []
    for i, c in enumerate(claims):
        if isinstance(c, dict) and not c.get("source_url"):
            return False, f"Claim {i} missing source_url"
    return True, None


class WorkerHarness:
    """Wraps every LLM call. Timeout, retries, schema validation, cost cap, escalation."""

    def __init__(self, agent_name: str, config: HarnessConfig, client: ModelClient):
        self.agent_name = agent_name
        self.config = config
        self.client = client

    def execute_task(self, spec: TaskSpec) -> HarnessResult:
        """Execute a structured task. Required for WORKER/DRONE/FORAGER tiers."""
        template_fn = PROMPT_TEMPLATES.get(spec.agent_name)
        if not template_fn:
            raise ValueError(
                f"No template registered for '{spec.agent_name}'. "
                f"All sub-Queen agents must have a registered prompt template."
            )

        # Layer 2 guardrail: input scoping validation
        # Count data source keys (keys ending with _data) vs metadata keys
        data_source_keys = [k for k in spec.data if k.endswith("_data")]
        tier = AGENT_TIERS.get(spec.agent_name, ModelTier.WORKER)
        max_sources = TEMPLATE_MAX_DATA_SOURCES.get(
            spec.agent_name,
            _TIER_MAX_DATA_SOURCES.get(tier),
        )

        if max_sources is not None and len(data_source_keys) > max_sources:
            msg = (
                f"{spec.agent_name} ({tier.value}) received {len(data_source_keys)} "
                f"data sources {data_source_keys}, max is {max_sources}"
            )
            logger.warning("INPUT_SCOPING: %s", msg)
            log_harness_outcome(
                agent_name=spec.agent_name,
                outcome="input_scoping_violation",
                error=msg,
            )
            # Block execution — template must declare explicit override
            return HarnessResult(
                outcome=AgentOutcome.SKIPPED,
                error=f"Input scoping violation: {msg}. "
                      f"Add max_data_sources={len(data_source_keys)} to @register_template "
                      f"if this is intentional.",
            )

        prompt, system = template_fn(spec.data, spec.source_urls)
        self._in_template_call = True
        try:
            return self.execute(prompt, system)
        finally:
            self._in_template_call = False

    def execute(self, prompt: str, system: str = "") -> HarnessResult:
        tier = AGENT_TIERS.get(self.agent_name)

        # Block raw execute() for sub-Queen unless called from execute_task()
        if tier in (ModelTier.WORKER, ModelTier.DRONE, ModelTier.FORAGER):
            if not getattr(self, '_in_template_call', False):
                logger.error(
                    "BLOCKED: %s (tier=%s) called execute() directly. Use execute_task().",
                    self.agent_name, tier.value,
                )
                return HarnessResult(
                    outcome=AgentOutcome.SKIPPED,
                    error=f"Direct execute() not allowed for {tier.value} tier. Use execute_task().",
                )

        start = time.monotonic()

        # Max input tokens safety net
        estimated_input = int(len(prompt.split()) * 1.3)
        if estimated_input > self.config.max_input_tokens:
            return HarnessResult(
                outcome=AgentOutcome.KILLED_BUDGET,
                error=f"Input tokens ~{estimated_input} exceeds max {self.config.max_input_tokens}",
            )

        # Tier-aware system prompt prefix for sub-Queen
        if tier == ModelTier.FORAGER:
            system = (
                "Analyze the provided data thoroughly. You may reason across multiple sources. "
                "Output valid JSON only, no markdown fences.\n\n"
                + system
            )
        elif tier and tier != ModelTier.QUEEN:
            # WORKER and DRONE keep strict single-task constraint
            system = (
                "You perform exactly ONE task. Output valid JSON only. "
                "Do not plan, reason across multiple steps, or ask clarifying questions.\n\n"
                + system
            )

        config = get_model_config(self.agent_name)

        for attempt in range(1, self.config.max_retries + 1):
            # Pre-flight: cost check
            estimated_cost = self.client.estimate_cost(
                self.agent_name,
                input_tokens=len(prompt.split()) * 1.3,
                output_tokens=self.config.max_output_tokens,
            )
            if estimated_cost > self.config.cost_cap_usd:
                logger.warning(
                    f"KILLED {self.agent_name}: estimated cost ${estimated_cost:.4f} "
                    f"exceeds cap ${self.config.cost_cap_usd:.4f}"
                )
                return HarnessResult(
                    outcome=AgentOutcome.KILLED_BUDGET,
                    attempts=attempt,
                    elapsed_seconds=time.monotonic() - start,
                    error=f"Cost estimate ${estimated_cost:.4f} exceeds cap",
                )

            try:
                response = self.client.complete(
                    agent_name=self.agent_name,
                    prompt=prompt,
                    system=system,
                )
            except Exception as e:
                logger.error(f"{self.agent_name} error (attempt {attempt}): {e}")
                if attempt == self.config.max_retries:
                    return HarnessResult(
                        outcome=AgentOutcome.KILLED_RETRIES,
                        attempts=attempt,
                        elapsed_seconds=time.monotonic() - start,
                        error=str(e),
                    )
                time.sleep(self.config.retry_backoff_base**attempt)
                continue

            # Schema validation
            if self.config.output_schema:
                is_valid, err = _validate_schema(response, self.config.output_schema)
                if not is_valid:
                    logger.warning(f"{self.agent_name} schema fail (attempt {attempt}): {err}")
                    if attempt == self.config.max_retries:
                        # Try escalation before giving up
                        escalation_result = self._try_escalation(prompt, system, start, attempt, err)
                        if escalation_result:
                            return escalation_result
                        return HarnessResult(
                            outcome=AgentOutcome.KILLED_SCHEMA,
                            attempts=attempt,
                            elapsed_seconds=time.monotonic() - start,
                            error=err or "Schema validation failed",
                        )
                    time.sleep(self.config.retry_backoff_base**attempt)
                    continue

            # Claims must have source_url
            try:
                content = response.get("content", "")
                parsed = json.loads(content) if isinstance(content, str) else {}
                ok, err = _validate_claims_have_source_url(parsed)
                if not ok:
                    logger.warning(f"{self.agent_name} claim missing source_url: {err}")
                    if attempt == self.config.max_retries:
                        # Try escalation before giving up
                        escalation_result = self._try_escalation(prompt, system, start, attempt, err)
                        if escalation_result:
                            return escalation_result
                        return HarnessResult(
                            outcome=AgentOutcome.KILLED_SCHEMA,
                            attempts=attempt,
                            elapsed_seconds=time.monotonic() - start,
                            error=err or "Claim missing source_url",
                        )
                    time.sleep(self.config.retry_backoff_base**attempt)
                    continue
            except json.JSONDecodeError:
                pass  # No claims in response, skip source_url check

            tokens = self.client.get_last_token_count()
            cost = self.client.calculate_cost(self.agent_name, tokens)

            return HarnessResult(
                outcome=AgentOutcome.SUCCESS,
                data=response,
                tokens_used=tokens,
                cost_usd=cost,
                attempts=attempt,
                elapsed_seconds=time.monotonic() - start,
            )

        return HarnessResult(
            outcome=AgentOutcome.KILLED_RETRIES,
            attempts=self.config.max_retries,
            elapsed_seconds=time.monotonic() - start,
            error="Exhausted all retries",
        )

    def _try_escalation(self, prompt: str, system: str, start: float, attempts: int, error: str | None) -> HarnessResult | None:
        """Try one escalation call with a higher-tier model. Returns result or None."""
        tier = AGENT_TIERS.get(self.agent_name)
        escalation_tier = ESCALATION_CHAIN.get(tier) if tier else None
        if not escalation_tier:
            return None

        logger.info("Escalating %s from %s to %s", self.agent_name, tier, escalation_tier)
        try:
            response = self.client.complete_with_tier(
                tier=escalation_tier,
                prompt=prompt,
                system=system,
                agent_name=self.agent_name,
            )
            tokens = self.client.get_last_token_count()
            # Validate escalated response too
            if self.config.output_schema:
                is_valid, err = _validate_schema(response, self.config.output_schema)
                if not is_valid:
                    logger.warning("Escalation also failed schema: %s", err)
                    return HarnessResult(
                        outcome=AgentOutcome.KILLED_SCHEMA,
                        attempts=attempts + 1,
                        elapsed_seconds=time.monotonic() - start,
                        error=f"Escalation failed: {err}",
                    )

            cost = self.client.calculate_cost(self.agent_name, tokens)
            return HarnessResult(
                outcome=AgentOutcome.ESCALATED,
                data=response,
                tokens_used=tokens,
                cost_usd=cost,
                attempts=attempts + 1,
                elapsed_seconds=time.monotonic() - start,
            )
        except Exception as e:
            logger.error("Escalation failed for %s: %s", self.agent_name, e)
            return None
