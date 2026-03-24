"""Tests for the Pebble query router."""

import pytest
from unittest.mock import MagicMock, AsyncMock

from pebble.router import classify_query, _check_redirect, RouteResult


class TestCheckRedirect:
    """Regex redirect patterns."""

    def test_drafting_redirect(self):
        result = _check_redirect("draft an email to John")
        assert result is not None
        assert result.level == -1
        assert result.redirect_target == "cowork"

    def test_calendar_redirect(self):
        result = _check_redirect("schedule a meeting tomorrow")
        assert result is not None
        assert result.level == -1
        assert result.redirect_target == "bedrock_priorities"

    def test_no_redirect_for_research(self):
        result = _check_redirect("Who is Jane Smith?")
        assert result is None

    def test_no_redirect_for_crm(self):
        result = _check_redirect("What's the pipeline value?")
        assert result is None


class TestClassifyQuery:
    """Tests for the main classify_query function."""

    @pytest.mark.asyncio
    async def test_mode_override_full(self):
        result = await classify_query("anything", mode="full")
        assert result.level == 30
        assert result.mode_override == "full"

    @pytest.mark.asyncio
    async def test_mode_override_quick(self):
        result = await classify_query("anything", mode="quick")
        assert result.level == 0
        assert result.mode_override == "quick"

    @pytest.mark.asyncio
    async def test_fallback_no_client(self):
        result = await classify_query("Who is Jane Smith?")
        assert result.level == 1
        assert result.intent == "default_l1"
        assert result.confidence == 0.3

    @pytest.mark.asyncio
    async def test_redirect_bypasses_llm(self):
        result = await classify_query("send an email to John")
        assert result.level == -1
        assert result.redirect_target == "cowork"

    @pytest.mark.asyncio
    async def test_haiku_classification(self):
        """Router regex \\{[^}]*\\} only handles flat JSON — no nested braces."""
        client = MagicMock()
        client.complete.return_value = {
            "text": '{"level": 20, "intent": "research_structured", "confidence": 0.9}'
        }
        result = await classify_query("Research Jane Smith at Acme", client=client)
        assert result.level == 20
        assert result.intent == "research_structured"
        assert result.confidence == 0.9

    @pytest.mark.asyncio
    async def test_haiku_low_confidence_defaults_to_l1(self):
        client = MagicMock()
        client.complete.return_value = {
            "text": '{"level": 30, "intent": "unclear", "entities": {}, "confidence": 0.4}'
        }
        result = await classify_query("something ambiguous", client=client)
        assert result.level == 1  # low confidence → default to L1

    @pytest.mark.asyncio
    async def test_haiku_failure_defaults_to_l1(self):
        client = MagicMock()
        client.complete.side_effect = Exception("API error")
        result = await classify_query("Who is Jane Smith?", client=client)
        assert result.level == 1
        assert result.confidence == 0.3

    @pytest.mark.asyncio
    async def test_haiku_non_json_defaults_to_l1(self):
        client = MagicMock()
        client.complete.return_value = {"text": "I don't understand the query"}
        result = await classify_query("something weird", client=client)
        assert result.level == 1
        assert result.intent == "haiku_parse_error"

    @pytest.mark.asyncio
    async def test_mode_override_with_client(self):
        """Mode override sets level even when Haiku returns different level."""
        client = MagicMock()
        client.complete.return_value = {
            "text": '{"level": 10, "intent": "research", "confidence": 0.95}'
        }
        result = await classify_query("Research John Doe", mode="full", client=client)
        assert result.level == 30  # mode override
        assert result.mode_override == "full"
