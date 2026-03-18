"""ModelClient: routes to Anthropic API. Worker tier → Haiku for MVP (no Ollama)."""

from dataclasses import dataclass
from enum import Enum

from anthropic import Anthropic


class ModelTier(Enum):
    WORKER = "worker"  # MVP: routes to Haiku
    DRONE = "drone"
    FORAGER = "forager"
    QUEEN = "queen"


@dataclass
class ModelConfig:
    tier: ModelTier
    model_id: str
    temperature: float
    max_tokens: int
    cost_per_mtok_input: float
    cost_per_mtok_output: float


TIER_CONFIGS = {
    ModelTier.WORKER: ModelConfig(
        tier=ModelTier.WORKER,
        model_id="claude-haiku-4-5-20251001",
        temperature=0.0,
        max_tokens=2000,
        cost_per_mtok_input=1.0,
        cost_per_mtok_output=5.0,
    ),
    ModelTier.DRONE: ModelConfig(
        tier=ModelTier.DRONE,
        model_id="claude-haiku-4-5-20251001",
        temperature=0.0,
        max_tokens=2000,
        cost_per_mtok_input=1.0,
        cost_per_mtok_output=5.0,
    ),
    ModelTier.FORAGER: ModelConfig(
        tier=ModelTier.FORAGER,
        model_id="claude-sonnet-4-6",
        temperature=0.2,
        max_tokens=4000,
        cost_per_mtok_input=3.0,
        cost_per_mtok_output=15.0,
    ),
    ModelTier.QUEEN: ModelConfig(
        tier=ModelTier.QUEEN,
        model_id="claude-opus-4-6",
        temperature=0.0,
        max_tokens=6000,
        cost_per_mtok_input=5.0,
        cost_per_mtok_output=25.0,
    ),
}

AGENT_TIERS = {
    "csv_normalizer": ModelTier.WORKER,
    "api_response_extractor": ModelTier.WORKER,
    "name_normalizer": ModelTier.WORKER,
    "batch_summarizer": ModelTier.DRONE,
    "filing_agent": ModelTier.WORKER,
    "sec_corporate_agent": ModelTier.WORKER,
    "fec_political_agent": ModelTier.WORKER,
    "news_agent": ModelTier.DRONE,
    "real_estate_agent": ModelTier.WORKER,
    "philanthropy_agent": ModelTier.FORAGER,
    "wealth_indicator_agent": ModelTier.FORAGER,
    "entity_resolution_agent": ModelTier.FORAGER,
    "fact_check_agent": ModelTier.QUEEN,
    "profile_synthesizer": ModelTier.QUEEN,
}


def get_model_config(agent_name: str) -> ModelConfig:
    tier = AGENT_TIERS.get(agent_name)
    if tier is None:
        raise ValueError(f"Unknown agent: {agent_name}. Valid: {list(AGENT_TIERS.keys())}")
    config = TIER_CONFIGS.get(tier)
    if config is None:
        raise ValueError(f"No config for tier: {tier}")
    return config


class ModelClient:
    """Routes to Anthropic API. Worker tier uses Haiku for MVP."""

    def __init__(self):
        self._client = Anthropic()
        self._last_usage = {"input": 0, "output": 0}

    def complete(self, agent_name: str, prompt: str, system: str = "") -> dict:
        config = get_model_config(agent_name)
        message = self._client.messages.create(
            model=config.model_id,
            max_tokens=config.max_tokens,
            system=system,
            messages=[{"role": "user", "content": prompt}],
            temperature=config.temperature,
        )
        self._last_usage = {
            "input": message.usage.input_tokens,
            "output": message.usage.output_tokens,
        }
        text = message.content[0].text if message.content else ""
        return {"content": text, "usage": self._last_usage}

    def get_last_token_count(self) -> dict:
        return self._last_usage.copy()

    def calculate_cost(self, agent_name: str, tokens: dict) -> float:
        config = get_model_config(agent_name)
        input_cost = (tokens["input"] / 1_000_000) * config.cost_per_mtok_input
        output_cost = (tokens["output"] / 1_000_000) * config.cost_per_mtok_output
        return input_cost + output_cost

    def estimate_cost(self, agent_name: str, input_tokens: float, output_tokens: float) -> float:
        config = get_model_config(agent_name)
        return (
            (input_tokens / 1_000_000) * config.cost_per_mtok_input
            + (output_tokens / 1_000_000) * config.cost_per_mtok_output
        )
