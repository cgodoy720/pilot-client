"""Tests for CRM tool-use agent handler (pebble/handlers/crm_agent.py)."""

from unittest.mock import MagicMock, AsyncMock, patch

import pytest

from pebble.handlers.crm_agent import (
    handle_crm_agent,
    MAX_TOOL_CALLS,
    COST_CAP_USD,
    _extract_text,
    _calculate_turn_cost,
    _build_initial_messages,
)
from pebble.router import RouteResult
from pebble.tools.crm_tools import CRM_TOOLS, CRM_WRITE_TOOLS


# ---------------------------------------------------------------------------
# Fixtures / helpers
# ---------------------------------------------------------------------------

def _make_route(**overrides) -> RouteResult:
    """Create a minimal RouteResult for CRM agent tests."""
    defaults = dict(
        level=0,
        intent="contact_field_lookup",
        entities={"original_query": "Who is John Smith?", "person_name": "John Smith"},
    )
    defaults.update(overrides)
    return RouteResult(**defaults)


def _end_turn_response(text: str, usage: dict | None = None) -> dict:
    """Simulate an LLM response with stop_reason=end_turn."""
    return {
        "message": {
            "role": "assistant",
            "content": [{"type": "text", "text": text}],
        },
        "stop_reason": "end_turn",
        "usage": usage or {"input": 500, "output": 100},
    }


def _tool_use_response(
    tool_name: str,
    tool_input: dict,
    tool_use_id: str = "toolu_01",
    usage: dict | None = None,
) -> dict:
    """Simulate an LLM response with stop_reason=tool_use."""
    return {
        "message": {
            "role": "assistant",
            "content": [
                {
                    "type": "tool_use",
                    "id": tool_use_id,
                    "name": tool_name,
                    "input": tool_input,
                },
            ],
        },
        "stop_reason": "tool_use",
        "usage": usage or {"input": 500, "output": 100},
    }


# ---------------------------------------------------------------------------
# Test: end_turn response returns text
# ---------------------------------------------------------------------------

class TestEndTurnResponse:
    """When the LLM returns stop_reason=end_turn, text is returned directly."""

    @pytest.mark.asyncio
    async def test_returns_text_on_end_turn(self):
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("**John Smith** is a contact at Acme Corp.")
        )
        crm_bridge = MagicMock()

        result = await handle_crm_agent(
            route=route,
            crm_bridge=crm_bridge,
            search_results=None,
            conversation_context=None,
            client=client,
        )

        assert result.text == "**John Smith** is a contact at Acme Corp."
        assert result.level == 0
        assert result.intent == "contact_field_lookup"
        assert result.cost_usd > 0

    @pytest.mark.asyncio
    async def test_fallback_text_when_no_text_blocks(self):
        """If the end_turn message has no text blocks, use fallback."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(return_value={
            "message": {"role": "assistant", "content": []},
            "stop_reason": "end_turn",
            "usage": {"input": 100, "output": 50},
        })
        crm_bridge = MagicMock()

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        assert "CRM data" in result.text or "couldn't form" in result.text


# ---------------------------------------------------------------------------
# Test: tool-use loop
# ---------------------------------------------------------------------------

class TestToolUseLoop:
    """The agent should execute tool calls and feed results back to the LLM."""

    @pytest.mark.asyncio
    async def test_tool_call_then_end_turn(self):
        """LLM calls a tool, gets the result, then returns text."""
        route = _make_route()
        crm_bridge = MagicMock()
        crm_bridge.search_contacts = AsyncMock(return_value=[
            {"Name": "John Smith", "Title": "Director", "Email": "john@acme.com"},
        ])

        # First call: LLM requests crm_contacts tool
        # Second call: LLM produces final text
        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=[
            _tool_use_response("crm_contacts", {"query": "John Smith"}),
            _end_turn_response("**John Smith** is a Director at Acme."),
        ])

        result = await handle_crm_agent(
            route=route,
            crm_bridge=crm_bridge,
            search_results=None,
            conversation_context=None,
            client=client,
        )

        assert result.text == "**John Smith** is a Director at Acme."
        # Tool was executed via crm_bridge
        crm_bridge.search_contacts.assert_awaited_once_with("John Smith", limit=10)
        # LLM was called twice (tool_use + end_turn)
        assert client.complete_with_tools.call_count == 2

    @pytest.mark.asyncio
    async def test_tool_result_passed_as_user_message(self):
        """After tool execution, the result is appended as a user message with tool_result."""
        route = _make_route()
        crm_bridge = MagicMock()
        crm_bridge.search_contacts = AsyncMock(return_value=[{"Name": "John Smith"}])

        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=[
            _tool_use_response("crm_contacts", {"query": "John Smith"}, tool_use_id="toolu_abc"),
            _end_turn_response("Found John Smith."),
        ])

        await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        # Inspect the messages passed to the second LLM call
        second_call_args = client.complete_with_tools.call_args_list[1]
        messages = second_call_args.kwargs.get("messages") or second_call_args[1]
        # The last user message should contain the tool_result
        last_user_msg = [m for m in messages if m.get("role") == "user"][-1]
        assert last_user_msg["content"][0]["type"] == "tool_result"
        assert last_user_msg["content"][0]["tool_use_id"] == "toolu_abc"

    @pytest.mark.asyncio
    async def test_collected_data_includes_tool_results(self):
        """Structured data from tools is stored in result.data."""
        route = _make_route()
        crm_bridge = MagicMock()
        contact_data = [{"Name": "John Smith", "Title": "Director"}]
        crm_bridge.search_contacts = AsyncMock(return_value=contact_data)

        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=[
            _tool_use_response("crm_contacts", {"query": "John Smith"}),
            _end_turn_response("Found John."),
        ])

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        assert result.data is not None
        assert "crm_contacts" in result.data
        assert result.data["crm_contacts"] == contact_data

    @pytest.mark.asyncio
    async def test_multi_step_tool_chain(self):
        """LLM chains two tool calls across iterations."""
        route = _make_route(entities={
            "original_query": "What's the pipeline for Goldman Sachs?",
            "org_name": "Goldman Sachs",
        })
        crm_bridge = MagicMock()
        crm_bridge.search_accounts = AsyncMock(return_value=[
            {"Name": "Goldman Sachs", "Id": "001abc"},
        ])
        crm_bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "GS Grant 2026", "Amount": 50000, "StageName": "Prospecting"},
        ])

        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=[
            _tool_use_response("crm_accounts", {"query": "Goldman Sachs"}, tool_use_id="t1"),
            _tool_use_response(
                "crm_opportunities",
                {"query": "Goldman Sachs", "account_id": "001abc"},
                tool_use_id="t2",
            ),
            _end_turn_response("Goldman Sachs has 1 opportunity worth $50,000."),
        ])

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        assert "$50,000" in result.text
        assert client.complete_with_tools.call_count == 3
        assert "crm_accounts" in result.data
        assert "crm_opportunities" in result.data


# ---------------------------------------------------------------------------
# Test: write permission gating
# ---------------------------------------------------------------------------

class TestWritePermissionGating:
    """Tools passed to the LLM depend on user_permissions."""

    @pytest.mark.asyncio
    async def test_read_only_when_no_permissions(self):
        """No user_permissions -> only 5 read tools."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("Answer.")
        )
        crm_bridge = MagicMock()

        await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None,
            client=client, user_permissions=None,
        )

        call_kwargs = client.complete_with_tools.call_args
        tools_passed = call_kwargs.kwargs.get("tools") or call_kwargs[0][3]
        assert len(tools_passed) == 5
        assert tools_passed == CRM_TOOLS

    @pytest.mark.asyncio
    async def test_read_only_when_crm_write_false(self):
        """user_permissions without crm_write -> only 5 read tools."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("Answer.")
        )
        crm_bridge = MagicMock()

        await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None,
            client=client, user_permissions={"crm_write": False},
        )

        call_kwargs = client.complete_with_tools.call_args
        tools_passed = call_kwargs.kwargs.get("tools") or call_kwargs[0][3]
        assert len(tools_passed) == 5
        tool_names = {t["name"] for t in tools_passed}
        assert "crm_create_account" not in tool_names
        assert "crm_create_contact" not in tool_names

    @pytest.mark.asyncio
    async def test_write_tools_included_with_permission(self):
        """user_permissions={"crm_write": True} -> 8 tools (5 read + 3 write)."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("Answer.")
        )
        crm_bridge = MagicMock()

        await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None,
            client=client, user_permissions={"crm_write": True},
        )

        call_kwargs = client.complete_with_tools.call_args
        tools_passed = call_kwargs.kwargs.get("tools") or call_kwargs[0][3]
        assert len(tools_passed) == 8
        assert tools_passed == CRM_TOOLS + CRM_WRITE_TOOLS
        tool_names = {t["name"] for t in tools_passed}
        assert "crm_create_account" in tool_names
        assert "crm_create_contact" in tool_names
        assert "crm_create_opportunity" in tool_names

    @pytest.mark.asyncio
    async def test_system_prompt_includes_write_guidelines(self):
        """With write permission, system prompt includes write guidelines."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("Answer.")
        )
        crm_bridge = MagicMock()

        await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None,
            client=client, user_permissions={"crm_write": True},
        )

        call_kwargs = client.complete_with_tools.call_args
        system_passed = call_kwargs.kwargs.get("system") or call_kwargs[0][2]
        assert "WRITE GUIDELINES" in system_passed
        assert "read-only" not in system_passed

    @pytest.mark.asyncio
    async def test_system_prompt_includes_readonly_note(self):
        """Without write permission, system prompt includes read-only note."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("Answer.")
        )
        crm_bridge = MagicMock()

        await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None,
            client=client, user_permissions=None,
        )

        call_kwargs = client.complete_with_tools.call_args
        system_passed = call_kwargs.kwargs.get("system") or call_kwargs[0][2]
        assert "read-only" in system_passed
        assert "WRITE GUIDELINES" not in system_passed


# ---------------------------------------------------------------------------
# Test: cost cap
# ---------------------------------------------------------------------------

class TestCostCap:
    """The agent stops when cumulative cost exceeds COST_CAP_USD ($0.02)."""

    @pytest.mark.asyncio
    async def test_stops_on_cost_cap_exceeded(self):
        """When cumulative LLM usage pushes cost over the cap, handler stops."""
        route = _make_route()
        crm_bridge = MagicMock()
        crm_bridge.search_contacts = AsyncMock(return_value=[{"Name": "John"}])

        # First call: tool_use with moderate cost ($0.015 -- under cap)
        # Second call: end_turn that pushes cumulative cost over ($0.015 + $0.015 = $0.03 > $0.02)
        # The second response includes text, so the handler extracts it before stopping.
        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=[
            _tool_use_response(
                "crm_contacts", {"query": "John"},
                usage={"input": 5000, "output": 2000},  # $0.005 + $0.01 = $0.015
            ),
            {
                "message": {
                    "role": "assistant",
                    "content": [{"type": "text", "text": "Found something."}],
                },
                "stop_reason": "end_turn",
                "usage": {"input": 5000, "output": 2000},  # another $0.015 -> total $0.03
            },
        ])

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        # First iteration: tool_use costs $0.015 (under cap), tool executes normally.
        # Second iteration: end_turn costs $0.015, cumulative $0.03 > $0.02 cap.
        # Handler extracts text from the over-budget response and returns it.
        assert result.cost_usd > COST_CAP_USD
        assert result.text == "Found something."

    @pytest.mark.asyncio
    async def test_cost_cap_with_no_text_falls_through(self):
        """Cost exceeded + no text in response -> fallback message."""
        route = _make_route()
        crm_bridge = MagicMock()
        crm_bridge.search_contacts = AsyncMock(return_value=[{"Name": "John"}])

        # All responses exceed budget and have no text blocks
        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=[
            {
                "message": {"role": "assistant", "content": [
                    {"type": "tool_use", "id": "t1", "name": "crm_contacts", "input": {"query": "x"}},
                ]},
                "stop_reason": "tool_use",
                "usage": {"input": 15000, "output": 5000},  # $0.04 > cap
            },
        ])

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        # The tool_use is executed, then cost check triggers on next iteration.
        # Since first response had no text (only tool_use), after executing the tool
        # the loop continues. But since side_effect is exhausted, it will error.
        # Actually: first call returns tool_use. Cost = $0.04 > cap.
        # The handler checks cost AFTER the call. It extracts text from the tool_use
        # message (no text blocks) -> empty. Falls through to fallback.
        assert "complete" in result.text.lower() or "unable" in result.text.lower()

    @pytest.mark.asyncio
    async def test_under_cost_cap_continues(self):
        """Small usage stays under cap -- agent completes normally."""
        route = _make_route()
        client = MagicMock()
        # Tiny usage: 100 input + 50 output = $0.00035 per turn
        client.complete_with_tools = MagicMock(
            return_value=_end_turn_response("Answer.", usage={"input": 100, "output": 50})
        )
        crm_bridge = MagicMock()

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        assert result.text == "Answer."
        assert result.cost_usd < COST_CAP_USD


# ---------------------------------------------------------------------------
# Test: error handling
# ---------------------------------------------------------------------------

class TestErrorHandling:
    """The agent returns a friendly error on exceptions."""

    @pytest.mark.asyncio
    async def test_exception_returns_error_message(self):
        """If client.complete_with_tools raises, handler returns error text."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(side_effect=RuntimeError("API down"))
        crm_bridge = MagicMock()

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        assert "error" in result.text.lower()
        assert result.level == 0
        assert result.intent == "contact_field_lookup"

    @pytest.mark.asyncio
    async def test_unexpected_stop_reason(self):
        """Unexpected stop_reason (e.g., max_tokens) with text -> returns that text."""
        route = _make_route()
        client = MagicMock()
        client.complete_with_tools = MagicMock(return_value={
            "message": {
                "role": "assistant",
                "content": [{"type": "text", "text": "Partial answer..."}],
            },
            "stop_reason": "max_tokens",
            "usage": {"input": 200, "output": 100},
        })
        crm_bridge = MagicMock()

        result = await handle_crm_agent(
            route=route, crm_bridge=crm_bridge,
            search_results=None, conversation_context=None, client=client,
        )

        assert result.text == "Partial answer..."


# ---------------------------------------------------------------------------
# Test: helpers
# ---------------------------------------------------------------------------

class TestExtractText:
    def test_single_text_block(self):
        msg = {"content": [{"type": "text", "text": "Hello"}]}
        assert _extract_text(msg) == "Hello"

    def test_multiple_text_blocks(self):
        msg = {"content": [
            {"type": "text", "text": "Line 1"},
            {"type": "tool_use", "id": "t1", "name": "crm_search", "input": {}},
            {"type": "text", "text": "Line 2"},
        ]}
        assert _extract_text(msg) == "Line 1\nLine 2"

    def test_no_text_blocks(self):
        msg = {"content": [{"type": "tool_use", "id": "t1", "name": "x", "input": {}}]}
        assert _extract_text(msg) == ""

    def test_empty_content(self):
        assert _extract_text({"content": []}) == ""
        assert _extract_text({}) == ""


class TestCalculateTurnCost:
    def test_basic_cost(self):
        # 1000 input * $1/Mtok + 500 output * $5/Mtok = $0.001 + $0.0025 = $0.0035
        cost = _calculate_turn_cost({"input": 1000, "output": 500})
        assert abs(cost - 0.0035) < 1e-9

    def test_zero_usage(self):
        assert _calculate_turn_cost({}) == 0.0
        assert _calculate_turn_cost({"input": 0, "output": 0}) == 0.0


class TestBuildInitialMessages:
    def test_basic_query(self):
        route = _make_route()
        messages = _build_initial_messages(route, None, None)
        assert len(messages) == 1
        assert messages[0]["role"] == "user"
        assert "John Smith" in messages[0]["content"]

    def test_with_search_results(self):
        route = _make_route()
        search_results = {
            "Contact": [{"Name": "John Smith", "Title": "Director"}],
        }
        messages = _build_initial_messages(route, search_results, None)
        assert len(messages) == 1
        # Should include pre-fetched context
        assert "John Smith" in messages[0]["content"]
        assert "CRM search already found" in messages[0]["content"]

    def test_with_conversation_context(self):
        route = _make_route()
        context = [
            {"role": "user", "content": "Hi"},
            {"role": "assistant", "content": "Hello!"},
        ]
        messages = _build_initial_messages(route, None, context)
        # 2 context messages + 1 new user message = 3
        assert len(messages) == 3
        assert messages[0]["role"] == "user"
        assert messages[1]["role"] == "assistant"
        assert messages[2]["role"] == "user"

    def test_fallback_query_from_entities(self):
        route = _make_route(entities={"person_name": "Jane Doe"})
        messages = _build_initial_messages(route, None, None)
        assert "Jane Doe" in messages[0]["content"]
