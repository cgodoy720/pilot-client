"""Tests for CRM bridge and tool execution."""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock, patch

from pebble.tools.crm_tools import execute_tool, _check_write_permission, CRM_TOOLS, CRM_WRITE_TOOLS


class TestCheckWritePermission:

    def test_none_permissions(self):
        assert _check_write_permission(None) is False

    def test_empty_permissions(self):
        assert _check_write_permission({}) is False

    def test_write_enabled(self):
        assert _check_write_permission({"crm_write": True}) is True

    def test_write_disabled(self):
        assert _check_write_permission({"crm_write": False}) is False


class TestToolDispatch:

    @pytest.mark.asyncio
    async def test_crm_search_dispatches(self):
        bridge = MagicMock()
        bridge.search_all = AsyncMock(return_value={"Contact": [], "Account": []})
        result = await execute_tool("crm_search", {"query": "test"}, bridge)
        parsed = json.loads(result)
        bridge.search_all.assert_called_once_with("test", limit=10)
        assert "Contact" in parsed

    @pytest.mark.asyncio
    async def test_crm_contacts_dispatches(self):
        bridge = MagicMock()
        bridge.search_contacts = AsyncMock(return_value=[{"Name": "Jane"}])
        result = await execute_tool("crm_contacts", {"query": "Jane"}, bridge)
        parsed = json.loads(result)
        bridge.search_contacts.assert_called_once_with("Jane", limit=10)
        assert parsed[0]["Name"] == "Jane"

    @pytest.mark.asyncio
    async def test_crm_pipeline_dispatches(self):
        bridge = MagicMock()
        bridge.get_opportunities = AsyncMock(return_value=[])
        result = await execute_tool("crm_pipeline", {"stage": "Prospecting"}, bridge)
        bridge.get_opportunities.assert_called_once_with(stage="Prospecting")

    @pytest.mark.asyncio
    async def test_unknown_tool_raises(self):
        bridge = MagicMock()
        result = await execute_tool("nonexistent_tool", {}, bridge)
        parsed = json.loads(result)
        assert "error" in parsed

    @pytest.mark.asyncio
    async def test_bridge_returns_none_gives_error(self):
        bridge = MagicMock()
        bridge.search_all = AsyncMock(return_value=None)
        result = await execute_tool("crm_search", {"query": "test"}, bridge)
        parsed = json.loads(result)
        assert "error" in parsed

    @pytest.mark.asyncio
    async def test_write_tool_blocked_without_permission(self):
        bridge = MagicMock()
        result = await execute_tool(
            "crm_create_account", {"name": "Test"}, bridge,
            user_permissions=None,
        )
        parsed = json.loads(result)
        assert parsed["error"] == "CRM write access denied."

    @pytest.mark.asyncio
    async def test_write_tool_allowed_with_permission(self):
        bridge = MagicMock()
        bridge.create_account = AsyncMock(return_value={"id": "001xx"})
        result = await execute_tool(
            "crm_create_account", {"name": "Test Corp"},
            bridge, user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["id"] == "001xx"
        bridge.create_account.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_contact_dispatches(self):
        bridge = MagicMock()
        bridge.create_contact = AsyncMock(return_value={"id": "003xx"})
        result = await execute_tool(
            "crm_create_contact",
            {"first_name": "Jane", "last_name": "Doe"},
            bridge, user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["id"] == "003xx"


class TestToolSchemas:

    def test_read_tools_count(self):
        assert len(CRM_TOOLS) == 5

    def test_write_tools_count(self):
        assert len(CRM_WRITE_TOOLS) == 2

    def test_all_tools_have_required_fields(self):
        for tool in CRM_TOOLS + CRM_WRITE_TOOLS:
            assert "name" in tool
            assert "description" in tool
            assert "input_schema" in tool
