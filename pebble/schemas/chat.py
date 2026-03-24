"""Chat and batch research Pydantic schemas for Ask Pebble."""

from __future__ import annotations

from pydantic import BaseModel, Field


class ClarificationOption(BaseModel):
    """A clickable disambiguation option in the chat UI."""
    label: str                         # "John Smith — VP, Acme Foundation"
    value: str                         # Structured key (e.g., SF contact ID)
    description: str | None = None     # "3 opportunities, $450K pipeline"


class ChatQueryRequest(BaseModel):
    """Inbound chat query from the frontend."""
    query: str = Field(..., min_length=1, max_length=500)
    mode: str = Field("auto", pattern=r"^(quick|triage|structured|full|auto)$")
    conversation_id: str | None = Field(None, max_length=36)
    user_email: str | None = Field(None, max_length=100)
    selected_option: str | None = Field(None, max_length=100)


class ChatQueryResponse(BaseModel):
    """Outbound chat response to the frontend."""
    answer: str
    level: int                         # -1 (redirect), 0, 1, 2, 3
    intent: str
    data: dict | None = None           # Structured CRM records, profile summary
    sources: list[str] = []
    cost_usd: float = 0.0
    elapsed_seconds: float = 0.0
    conversation_id: str

    # Redirect
    redirect_target: str | None = None     # "cowork" | "bedrock_pipeline" | etc.
    redirect_reason: str | None = None

    # Clarification / disambiguation
    requires_clarification: bool = False
    clarification_options: list[ClarificationOption] | None = None

    # Research readiness
    blocked_reason: str | None = None


class BatchResearchRequest(BaseModel):
    """Batch research request for tiered processing."""
    prospects: list[dict] = Field(..., max_length=500)
    target_tier: int = Field(1, ge=1, le=3)
    selected_ids: list[str] | None = None
    batch_id: str | None = None


class BatchResearchResponse(BaseModel):
    """Batch research response with results."""
    batch_id: str
    status: str
    results: list[dict] = []
    total_cost_usd: float = 0.0
    elapsed_seconds: float = 0.0
