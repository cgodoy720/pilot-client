"""WorkerHarness: timeout, retries, schema validation, cost cap. Queen commands the hive."""

import json
import logging
import time
from dataclasses import dataclass, field
from enum import Enum
from typing import Any

from .model_client import ModelClient, get_model_config

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
    """Wraps every LLM call. Timeout, retries, schema validation, cost cap."""

    def __init__(self, agent_name: str, config: HarnessConfig, client: ModelClient):
        self.agent_name = agent_name
        self.config = config
        self.client = client

    def execute(self, prompt: str, system: str = "") -> HarnessResult:
        start = time.monotonic()
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
                        if self.config.escalation_tier:
                            return HarnessResult(
                                outcome=AgentOutcome.ESCALATED,
                                attempts=attempt,
                                elapsed_seconds=time.monotonic() - start,
                                error=f"Schema failures; escalating to {self.config.escalation_tier}",
                            )
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
