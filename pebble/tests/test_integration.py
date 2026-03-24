"""End-to-end integration test: query -> route -> dispatch -> response."""

import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from pebble.router import RouteResult
from pebble.handlers import dispatch_handler, HandlerResponse
from pebble.clusters.budget import ResearchScratchpad
from pebble.prospect_type import ProspectType


class TestEndToEnd:
    """Full pipeline mock: query -> classify -> handle_t2 -> response."""

    @pytest.mark.asyncio
    async def test_t2_dispatch_returns_response(self):
        """Mock the full T2 path and verify response structure."""
        route = RouteResult(
            level=20,
            intent="research_structured",
            entities={
                "person_name": "Jane Smith",
                "org_name": "Acme Foundation",
            },
            confidence=0.9,
        )

        mock_crm = MagicMock()
        mock_crm.search_all = AsyncMock(return_value=None)

        mock_scratchpad = ResearchScratchpad(prospect_type=ProspectType.FOUNDATION)
        mock_scratchpad.source_outcomes = {
            "financial": "ok", "affiliation": "ok", "public_profile": "ok",
        }
        mock_claims = [
            {"text": "Jane Smith serves as CEO at Acme Foundation (per Wikipedia)", "source_url": "https://wiki"},
            {"text": "Acme Foundation reported $5,000,000 in revenue (2023 Form 990)", "source_url": "https://propublica"},
        ]

        with patch("pebble.clusters.run_cluster_research", new_callable=AsyncMock,
                    return_value=(mock_scratchpad, mock_claims)), \
             patch("pebble.orchestrator.score_source_richness", return_value={"wiki": 0.8}), \
             patch("pebble.orchestrator.activate_foragers", new_callable=AsyncMock, return_value=[]), \
             patch("pebble.prospect_type.classify_prospect", return_value=(ProspectType.FOUNDATION, 0.9, "heuristic")):

            response = await dispatch_handler(route, mock_crm)

        assert isinstance(response, HandlerResponse)
        assert response.level == 20
        assert "Jane Smith" in response.text or "Structured Intelligence" in response.text
        assert response.elapsed_seconds >= 0

    @pytest.mark.asyncio
    async def test_redirect_dispatch(self):
        """Redirect routes return immediately without CRM lookup."""
        route = RouteResult(
            level=-1,
            intent="redirect_drafting",
            redirect_target="cowork",
            redirect_reason="Drafting is a CoWork task.",
        )

        response = await dispatch_handler(route, crm_bridge=None)

        assert isinstance(response, HandlerResponse)
        assert response.level == -1
        assert response.redirect_target == "cowork"

    @pytest.mark.asyncio
    async def test_crm_agent_dispatch(self):
        """L0 queries dispatch to CRM agent when client is available."""
        route = RouteResult(
            level=0,
            intent="contact_field_lookup",
            entities={"person_name": "John Doe", "original_query": "Who is John Doe?"},
        )

        mock_crm = MagicMock()
        mock_crm.search_all = AsyncMock(return_value=None)

        mock_client = MagicMock()
        mock_client.complete_with_tools = MagicMock(return_value={
            "message": {"content": [{"type": "text", "text": "John Doe is a contact."}]},
            "stop_reason": "end_turn",
            "usage": {"input": 100, "output": 50},
        })

        response = await dispatch_handler(
            route, mock_crm, client=mock_client,
        )

        assert isinstance(response, HandlerResponse)
        assert response.level == 0
        assert response.text
