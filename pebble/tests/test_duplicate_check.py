"""Tests for CRM duplicate detection (pebble/tools/duplicate_check.py)."""

import json
import pytest
from unittest.mock import AsyncMock, MagicMock

from pebble.tools.duplicate_check import (
    extract_fiscal_year,
    normalize_opportunity_name,
    check_for_duplicates,
)
from pebble.tools.crm_tools import execute_tool


# ---------------------------------------------------------------------------
# extract_fiscal_year
# ---------------------------------------------------------------------------

class TestExtractFiscalYear:

    def test_fy_two_digit(self):
        assert extract_fiscal_year("FY25 - Robin Hood") == "2025"

    def test_fy_two_digit_standalone(self):
        assert extract_fiscal_year("FY25") == "2025"

    def test_fy_four_digit(self):
        assert extract_fiscal_year("FY2026 Grant") == "2026"

    def test_fy_four_digit_standalone(self):
        assert extract_fiscal_year("FY2026") == "2026"

    def test_bare_year(self):
        assert extract_fiscal_year("2025 Robin Hood") == "2025"

    def test_bare_year_in_middle(self):
        assert extract_fiscal_year("Robin Hood 2026 Grant") == "2026"

    def test_no_year(self):
        assert extract_fiscal_year("Robin Hood - $150k") is None

    def test_empty_string(self):
        assert extract_fiscal_year("") is None

    def test_none_like_empty(self):
        # Ensure no crash on empty-ish input
        assert extract_fiscal_year("   ") is None

    def test_fy_case_insensitive(self):
        assert extract_fiscal_year("fy25 - Test") == "2025"
        assert extract_fiscal_year("Fy2026 - Test") == "2026"

    def test_fy_four_digit_preferred_over_bare(self):
        """FY2026 should be matched as FY pattern, not bare year."""
        assert extract_fiscal_year("FY2026 stuff") == "2026"

    def test_fy_two_digit_does_not_match_four_digit(self):
        """FY2026 should NOT be matched by the 2-digit FY pattern."""
        # FY2026 → matched by 4-digit pattern → "2026"
        # Not matched as FY20 → "2020"
        assert extract_fiscal_year("FY2026") == "2026"


# ---------------------------------------------------------------------------
# normalize_opportunity_name
# ---------------------------------------------------------------------------

class TestNormalizeOpportunityName:

    def test_strips_fy_and_amount(self):
        assert normalize_opportunity_name("FY25 - Robin Hood - $150k") == "robin hood"

    def test_plain_name(self):
        assert normalize_opportunity_name("Robin Hood Foundation") == "robin hood foundation"

    def test_four_digit_fy_and_large_amount(self):
        assert normalize_opportunity_name(
            "FY2026 - Robin Hood Foundation - $1,000,000"
        ) == "robin hood foundation"

    def test_no_decorations(self):
        assert normalize_opportunity_name("Robin Hood") == "robin hood"

    def test_bare_year_stripped(self):
        assert normalize_opportunity_name("2025 Grant for Robin Hood") == "grant for robin hood"

    def test_amount_with_suffix(self):
        assert normalize_opportunity_name("Robin Hood - $1.5M") == "robin hood"

    def test_empty_string(self):
        assert normalize_opportunity_name("") == ""

    def test_only_fy_and_amount(self):
        """Edge case: name is entirely FY + amount."""
        result = normalize_opportunity_name("FY26 - $150k")
        assert result == ""


# ---------------------------------------------------------------------------
# check_for_duplicates — Account
# ---------------------------------------------------------------------------

class TestCheckDuplicatesAccount:

    @pytest.mark.asyncio
    async def test_returns_matches(self):
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock(return_value=[
            {"Name": "Robin Hood Foundation", "Id": "001abc", "Type": "Foundation"},
        ])
        result = await check_for_duplicates(
            "account", {"name": "Robin Hood Foundation"}, bridge,
        )
        assert result is not None
        assert len(result) == 1
        assert result[0]["Name"] == "Robin Hood Foundation"
        bridge.search_accounts.assert_awaited_once_with("Robin Hood Foundation")

    @pytest.mark.asyncio
    async def test_no_matches(self):
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock(return_value=[])
        result = await check_for_duplicates(
            "account", {"name": "Totally New Org"}, bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_api_failure_returns_none(self):
        """Fail-open: bridge returns None on failure."""
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock(return_value=None)
        result = await check_for_duplicates(
            "account", {"name": "Robin Hood"}, bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_empty_name(self):
        bridge = MagicMock()
        result = await check_for_duplicates(
            "account", {"name": ""}, bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_exception_fails_open(self):
        """If bridge raises, duplicate check fails open."""
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock(side_effect=RuntimeError("Network error"))
        result = await check_for_duplicates(
            "account", {"name": "Test"}, bridge,
        )
        assert result is None


# ---------------------------------------------------------------------------
# check_for_duplicates — Contact
# ---------------------------------------------------------------------------

class TestCheckDuplicatesContact:

    @pytest.mark.asyncio
    async def test_returns_matches(self):
        bridge = MagicMock()
        bridge.search_contacts = AsyncMock(return_value=[
            {"Name": "Jane Doe", "Id": "003abc", "Title": "Director"},
        ])
        result = await check_for_duplicates(
            "contact", {"first_name": "Jane", "last_name": "Doe"}, bridge,
        )
        assert result is not None
        assert len(result) == 1
        bridge.search_contacts.assert_awaited_once_with("Jane Doe")

    @pytest.mark.asyncio
    async def test_no_matches(self):
        bridge = MagicMock()
        bridge.search_contacts = AsyncMock(return_value=[])
        result = await check_for_duplicates(
            "contact", {"first_name": "New", "last_name": "Person"}, bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_empty_names(self):
        bridge = MagicMock()
        result = await check_for_duplicates(
            "contact", {"first_name": "", "last_name": ""}, bridge,
        )
        assert result is None


# ---------------------------------------------------------------------------
# check_for_duplicates — Opportunity (fiscal year awareness)
# ---------------------------------------------------------------------------

class TestCheckDuplicatesOpportunity:

    @pytest.mark.asyncio
    async def test_different_fy_is_renewal_not_duplicate(self):
        """FY25 vs FY26 on the same base name → renewal, not duplicate."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "FY25 - Robin Hood - $100k", "Id": "006abc",
             "Amount": 100000, "StageName": "Closed Won"},
        ])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood - $150k", "account_id": "001abc"},
            bridge,
        )
        assert result is None
        bridge.search_opportunities.assert_awaited_once()

    @pytest.mark.asyncio
    async def test_same_name_no_fy_is_duplicate(self):
        """Same name with no fiscal year → duplicate."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "Robin Hood - $150k", "Id": "006abc",
             "Amount": 150000, "StageName": "Prospecting"},
        ])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "Robin Hood - $150k"},
            bridge,
        )
        assert result is not None
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_same_fy_is_duplicate(self):
        """Same FY + same base name → duplicate."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "FY26 - Robin Hood - $200k", "Id": "006abc",
             "Amount": 200000, "StageName": "Qualifying"},
        ])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood - $150k"},
            bridge,
        )
        assert result is not None
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_proposed_has_fy_match_does_not(self):
        """Proposed has FY, match doesn't → potential duplicate (can't confirm renewal)."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "Robin Hood - $100k", "Id": "006abc",
             "Amount": 100000, "StageName": "Closed Won"},
        ])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood - $150k"},
            bridge,
        )
        assert result is not None
        assert len(result) == 1

    @pytest.mark.asyncio
    async def test_no_matches_from_search(self):
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Brand New Grant"},
            bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_different_base_names_not_duplicate(self):
        """Same FY but different base name → not a duplicate."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "FY26 - Goldman Sachs - $500k", "Id": "006xyz",
             "Amount": 500000, "StageName": "Prospecting"},
        ])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood - $150k"},
            bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_account_id_passed_to_search(self):
        """account_id from proposed is forwarded to bridge search."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[])
        await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood", "account_id": "001abc"},
            bridge,
        )
        call_kwargs = bridge.search_opportunities.call_args
        assert call_kwargs.kwargs.get("account_id") == "001abc"

    @pytest.mark.asyncio
    async def test_api_failure_returns_none(self):
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=None)
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood"},
            bridge,
        )
        assert result is None

    @pytest.mark.asyncio
    async def test_multiple_matches_filters_correctly(self):
        """With multiple search results, only actual duplicates are returned."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "FY25 - Robin Hood - $100k", "Id": "006a",
             "Amount": 100000, "StageName": "Closed Won"},
            {"Name": "FY26 - Robin Hood - $200k", "Id": "006b",
             "Amount": 200000, "StageName": "Prospecting"},
            {"Name": "FY26 - Goldman Sachs", "Id": "006c",
             "Amount": 50000, "StageName": "Qualifying"},
        ])
        result = await check_for_duplicates(
            "opportunity",
            {"name": "FY26 - Robin Hood - $150k"},
            bridge,
        )
        # FY25 Robin Hood → renewal, excluded
        # FY26 Robin Hood → same FY + same base → duplicate
        # FY26 Goldman Sachs → different base name → excluded
        assert result is not None
        assert len(result) == 1
        assert result[0]["Id"] == "006b"


# ---------------------------------------------------------------------------
# execute_tool integration — duplicate warning flow
# ---------------------------------------------------------------------------

class TestExecuteToolDuplicateWarning:

    @pytest.mark.asyncio
    async def test_create_account_returns_warning_on_duplicates(self):
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock(return_value=[
            {"Name": "Robin Hood Foundation", "Id": "001abc"},
        ])
        bridge.create_account = AsyncMock(return_value={"id": "001xyz"})

        result = await execute_tool(
            "crm_create_account",
            {"name": "Robin Hood Foundation"},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["duplicate_warning"] is True
        assert len(parsed["existing_records"]) == 1
        assert "Robin Hood Foundation" in parsed["existing_records"][0]["Name"]
        # Must NOT have actually created
        bridge.create_account.assert_not_called()

    @pytest.mark.asyncio
    async def test_confirmed_bypasses_duplicate_check(self):
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock()
        bridge.create_account = AsyncMock(return_value={"id": "001xyz"})

        result = await execute_tool(
            "crm_create_account",
            {"name": "Robin Hood Foundation", "_confirmed": True},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["id"] == "001xyz"
        # Duplicate search was NOT called
        bridge.search_accounts.assert_not_called()
        bridge.create_account.assert_called_once()

    @pytest.mark.asyncio
    async def test_create_contact_returns_warning_on_duplicates(self):
        bridge = MagicMock()
        bridge.search_contacts = AsyncMock(return_value=[
            {"Name": "Jane Doe", "Id": "003abc"},
        ])

        result = await execute_tool(
            "crm_create_contact",
            {"first_name": "Jane", "last_name": "Doe"},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["duplicate_warning"] is True

    @pytest.mark.asyncio
    async def test_create_account_no_duplicates_proceeds(self):
        """No duplicates found → creation proceeds normally."""
        bridge = MagicMock()
        bridge.search_accounts = AsyncMock(return_value=[])
        bridge.create_account = AsyncMock(return_value={"id": "001new"})

        result = await execute_tool(
            "crm_create_account",
            {"name": "Brand New Foundation"},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["id"] == "001new"
        bridge.create_account.assert_called_once()

    @pytest.mark.asyncio
    async def test_opportunity_renewal_not_blocked(self):
        """FY renewal (different FY) should NOT trigger duplicate warning."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "FY25 - Robin Hood - $100k", "Id": "006abc",
             "Amount": 100000, "StageName": "Closed Won"},
        ])
        bridge.create_opportunity = AsyncMock(return_value={"id": "006new"})

        result = await execute_tool(
            "crm_create_opportunity",
            {"name": "FY26 - Robin Hood - $150k", "account_id": "001abc"},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        # Renewal → no warning → creation proceeds
        assert "duplicate_warning" not in parsed
        assert parsed["id"] == "006new"

    @pytest.mark.asyncio
    async def test_opportunity_true_duplicate_blocked(self):
        """Same base name + same FY → duplicate warning."""
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[
            {"Name": "Robin Hood - $150k", "Id": "006abc",
             "Amount": 150000, "StageName": "Prospecting"},
        ])

        result = await execute_tool(
            "crm_create_opportunity",
            {"name": "Robin Hood - $150k"},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["duplicate_warning"] is True
        assert len(parsed["existing_records"]) == 1


# ---------------------------------------------------------------------------
# execute_tool integration — payment block
# ---------------------------------------------------------------------------

class TestPaymentBlock:

    @pytest.mark.asyncio
    async def test_payment_blocked_with_write_permission(self):
        bridge = MagicMock()
        result = await execute_tool(
            "crm_create_payment",
            {"amount": 5000},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert "error" in parsed
        assert "Payment creation is not available" in parsed["error"]
        assert "Sage" in parsed["error"]

    @pytest.mark.asyncio
    async def test_payment_blocked_without_permission(self):
        """Without write permission, hits the permission check first."""
        bridge = MagicMock()
        result = await execute_tool(
            "crm_create_payment",
            {"amount": 5000},
            bridge,
            user_permissions=None,
        )
        parsed = json.loads(result)
        assert parsed["error"] == "CRM write access denied."


# ---------------------------------------------------------------------------
# execute_tool integration — create_opportunity dispatch
# ---------------------------------------------------------------------------

class TestCreateOpportunityDispatch:

    @pytest.mark.asyncio
    async def test_create_opportunity_dispatches(self):
        bridge = MagicMock()
        bridge.search_opportunities = AsyncMock(return_value=[])
        bridge.create_opportunity = AsyncMock(return_value={"id": "006new"})

        result = await execute_tool(
            "crm_create_opportunity",
            {"name": "FY26 - New Grant", "account_id": "001abc",
             "amount": 50000, "stage": "Prospecting", "close_date": "2026-06-30"},
            bridge,
            user_permissions={"crm_write": True},
        )
        parsed = json.loads(result)
        assert parsed["id"] == "006new"
        bridge.create_opportunity.assert_called_once_with(
            name="FY26 - New Grant",
            account_id="001abc",
            amount=50000,
            stage="Prospecting",
            close_date="2026-06-30",
        )

    @pytest.mark.asyncio
    async def test_create_opportunity_blocked_without_permission(self):
        bridge = MagicMock()
        result = await execute_tool(
            "crm_create_opportunity",
            {"name": "Test"},
            bridge,
            user_permissions=None,
        )
        parsed = json.loads(result)
        assert parsed["error"] == "CRM write access denied."
