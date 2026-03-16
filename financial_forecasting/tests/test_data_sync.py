"""Tests for DataSyncService — pure/deterministic methods.

The sync methods themselves are async and require mocked MCP clients,
so we focus here on the state management helpers and the
create_intacct_customer_from_account ID generation logic.
"""

import sys
import os
from datetime import datetime

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from data_sync import DataSyncService


@pytest.fixture
def service():
    """DataSyncService with no real MCP client."""
    return DataSyncService(mcp_client=None)


# ---------------------------------------------------------------------------
# Sync history
# ---------------------------------------------------------------------------
class TestSyncHistory:
    def test_empty_history(self, service):
        assert service.get_sync_history() == []

    def test_records_history(self, service):
        service.sync_history.append({
            "timestamp": datetime.now(),
            "type": "test",
            "status": "completed",
        })
        history = service.get_sync_history()
        assert len(history) == 1
        assert history[0]["type"] == "test"

    def test_history_respects_limit(self, service):
        for i in range(100):
            service.sync_history.append({
                "timestamp": datetime.now(),
                "type": f"sync-{i}",
                "status": "completed",
            })
        assert len(service.get_sync_history(limit=10)) == 10
        # Returns the most recent 10
        assert service.get_sync_history(limit=10)[-1]["type"] == "sync-99"


# ---------------------------------------------------------------------------
# Customer mappings
# ---------------------------------------------------------------------------
class TestCustomerMappings:
    def test_empty_mappings(self, service):
        assert service.get_customer_mappings() == {}

    def test_returns_copy(self, service):
        service.customer_mappings["ACC001"] = "CUST001"
        mappings = service.get_customer_mappings()
        mappings["ACC002"] = "CUST002"
        # Original should not be modified
        assert "ACC002" not in service.customer_mappings

    def test_stores_and_retrieves(self, service):
        service.customer_mappings["ACC001"] = "CUST001"
        assert service.get_customer_mappings() == {"ACC001": "CUST001"}


# ---------------------------------------------------------------------------
# Opportunity mappings
# ---------------------------------------------------------------------------
class TestOpportunityMappings:
    def test_empty_mappings(self, service):
        assert service.get_opportunity_mappings() == {}

    def test_returns_copy(self, service):
        service.opportunity_mappings["OPP001"] = {
            "invoice_id": "INV001",
            "status": "invoiced",
        }
        mappings = service.get_opportunity_mappings()
        mappings["OPP002"] = {"invoice_id": "INV002"}
        assert "OPP002" not in service.opportunity_mappings


# NOTE: create_intacct_customer_from_account accesses self.mcp_client.services
# before building the customer ID. The ID generation is buried after an I/O
# dependency, so it can't be tested without a mocked MCP client. This is a
# code smell — the ID construction should be extracted into a pure function.
