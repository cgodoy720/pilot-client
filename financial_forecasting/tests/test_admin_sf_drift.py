"""Tests for admin schema drift endpoints — scan, list, resolve."""

import sys
import os
from datetime import datetime, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app, get_current_user
from auth import require_auth
from db import get_db
from dependencies import get_mcp_client
from routes.permissions import require_admin

app.router.on_startup.clear()
app.router.on_shutdown.clear()

ADMIN_USER = {"user_id": "admin_user", "email": "admin@pursuit.org", "name": "Admin"}


class MockDBRow(dict):
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)


# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.fetch = AsyncMock(return_value=[])
    db.fetchrow = AsyncMock(return_value=None)
    db.fetchval = AsyncMock(return_value=0)
    db.execute = AsyncMock(return_value="UPDATE 1")
    db.executemany = AsyncMock()
    return db


@pytest.fixture
def mock_mcp():
    """MCP client with mocked describe_sobject."""
    client = MagicMock()
    client.salesforce = AsyncMock()
    client.salesforce.describe_sobject = AsyncMock(return_value={"fields": []})
    return client


@pytest.fixture
def admin_client(mock_db, mock_mcp):
    app.dependency_overrides[get_current_user] = lambda: ADMIN_USER
    app.dependency_overrides[require_auth] = lambda: ADMIN_USER
    app.dependency_overrides[require_admin] = lambda: ADMIN_USER
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_mcp_client] = lambda: mock_mcp
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def unauthed_client(mock_db):
    """No admin override — tests 403 enforcement."""
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ---------------------------------------------------------------------------
# POST /scan — drift detection
# ---------------------------------------------------------------------------

class TestScanEndpoint:

    def test_scan_detects_type_change(self, admin_client, mock_db, mock_mcp):
        """A field whose type changed in live SF is detected."""
        mock_db.fetch.return_value = [
            MockDBRow(field_name="LastName", field_type="string",
                      is_required=True, has_default=False, is_updateable=True),
        ]
        mock_mcp.salesforce.describe_sobject.return_value = {
            "fields": [
                {"name": "LastName", "type": "textarea", "nillable": False,
                 "updateable": True, "custom": False},
            ],
        }
        resp = admin_client.post("/api/admin/sf-schema-drift/scan")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["total_drifts"] >= 1
        # Find the type_changed drift
        all_details = [d for r in data["results"] for d in r["details"]]
        type_drifts = [d for d in all_details if d["drift_type"] == "type_changed"]
        assert len(type_drifts) >= 1
        assert type_drifts[0]["old_value"] == "string"
        assert type_drifts[0]["new_value"] == "textarea"

    def test_scan_detects_field_removed(self, admin_client, mock_db, mock_mcp):
        """A field in requirements but absent from live describe is flagged."""
        mock_db.fetch.return_value = [
            MockDBRow(field_name="Removed_Field__c", field_type="string",
                      is_required=False, has_default=False, is_updateable=True),
        ]
        mock_mcp.salesforce.describe_sobject.return_value = {"fields": []}

        resp = admin_client.post("/api/admin/sf-schema-drift/scan")
        data = resp.json()["data"]
        all_details = [d for r in data["results"] for d in r["details"]]
        removed = [d for d in all_details if d["drift_type"] == "field_removed"]
        assert len(removed) >= 1
        assert removed[0]["field_name"] == "Removed_Field__c"

    def test_scan_detects_required_changed(self, admin_client, mock_db, mock_mcp):
        """A field that became nullable is detected as is_required_changed."""
        mock_db.fetch.return_value = [
            MockDBRow(field_name="Name", field_type="string",
                      is_required=True, has_default=False, is_updateable=True),
        ]
        mock_mcp.salesforce.describe_sobject.return_value = {
            "fields": [
                {"name": "Name", "type": "string", "nillable": True,
                 "updateable": True, "custom": False},
            ],
        }
        resp = admin_client.post("/api/admin/sf-schema-drift/scan")
        all_details = [d for r in resp.json()["data"]["results"] for d in r["details"]]
        req_drifts = [d for d in all_details if d["drift_type"] == "is_required_changed"]
        assert len(req_drifts) >= 1

    def test_scan_detects_field_added(self, admin_client, mock_db, mock_mcp):
        """A new custom field in live SF is detected as field_added."""
        mock_db.fetch.return_value = []  # no requirements
        mock_mcp.salesforce.describe_sobject.return_value = {
            "fields": [
                {"name": "New_Custom__c", "type": "string", "nillable": True,
                 "updateable": True, "custom": True},
                {"name": "StandardField", "type": "string", "nillable": True,
                 "updateable": True, "custom": False},
            ],
        }
        resp = admin_client.post("/api/admin/sf-schema-drift/scan")
        all_details = [d for r in resp.json()["data"]["results"] for d in r["details"]]
        added = [d for d in all_details if d["drift_type"] == "field_added"]
        assert len(added) >= 1
        assert added[0]["field_name"] == "New_Custom__c"
        # Standard field should NOT trigger field_added
        assert not any(d["field_name"] == "StandardField" for d in all_details)

    def test_scan_handles_describe_failure(self, admin_client, mock_db, mock_mcp):
        """If describe() fails for one sobject, others still scan."""
        call_count = 0

        async def flaky_describe(sobject):
            nonlocal call_count
            call_count += 1
            if sobject == "Opportunity":
                raise Exception("SF connection timeout")
            return {"fields": []}

        mock_db.fetch.return_value = []
        mock_mcp.salesforce.describe_sobject = flaky_describe

        resp = admin_client.post("/api/admin/sf-schema-drift/scan")
        assert resp.status_code == 200
        data = resp.json()["data"]
        # Opportunity should have an error, others should succeed
        opp_result = next(r for r in data["results"] if r["sobject"] == "Opportunity")
        assert opp_result["error"] is not None
        assert data["sobjects_scanned"] == 3  # 4 total - 1 failed

    def test_scan_no_drift(self, admin_client, mock_db, mock_mcp):
        """When live matches requirements, no drifts are logged."""
        mock_db.fetch.return_value = [
            MockDBRow(field_name="Name", field_type="string",
                      is_required=True, has_default=False, is_updateable=True),
        ]
        mock_mcp.salesforce.describe_sobject.return_value = {
            "fields": [
                {"name": "Name", "type": "string", "nillable": False,
                 "updateable": True, "custom": False},
            ],
        }
        resp = admin_client.post("/api/admin/sf-schema-drift/scan")
        assert resp.json()["data"]["total_drifts"] == 0


# ---------------------------------------------------------------------------
# GET / — list unresolved drifts
# ---------------------------------------------------------------------------

class TestListEndpoint:

    def test_list_unresolved_drifts(self, admin_client, mock_db):
        now = datetime.now(timezone.utc)
        mock_db.fetch.return_value = [
            MockDBRow(id=1, sobject="Contact", field_name="Email",
                      drift_type="type_changed", old_value="email",
                      new_value="string", detected_at=now,
                      resolved_at=None, resolved_by=None, action_taken=None),
            MockDBRow(id=2, sobject="Account", field_name="Custom__c",
                      drift_type="field_added", old_value=None,
                      new_value="string", detected_at=now,
                      resolved_at=None, resolved_by=None, action_taken=None),
        ]
        resp = admin_client.get("/api/admin/sf-schema-drift")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert len(data) == 2

    def test_list_empty(self, admin_client, mock_db):
        mock_db.fetch.return_value = []
        resp = admin_client.get("/api/admin/sf-schema-drift")
        assert resp.status_code == 200
        assert resp.json()["data"] == []


# ---------------------------------------------------------------------------
# POST /{drift_id}/resolve
# ---------------------------------------------------------------------------

class TestResolveEndpoint:

    def test_resolve_drift_success(self, admin_client, mock_db):
        now = datetime.now(timezone.utc)
        mock_db.fetchrow.return_value = MockDBRow(
            id=1, sobject="Contact", field_name="Email",
            drift_type="type_changed", old_value="email", new_value="string",
            detected_at=now, resolved_at=now,
            resolved_by="admin@pursuit.org",
            action_taken="Updated field_requirements table",
        )
        resp = admin_client.post(
            "/api/admin/sf-schema-drift/1/resolve",
            json={"action_taken": "Updated field_requirements table"},
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True
        assert resp.json()["data"]["resolved_by"] == "admin@pursuit.org"

    def test_resolve_drift_not_found(self, admin_client, mock_db):
        mock_db.fetchrow.return_value = None
        resp = admin_client.post(
            "/api/admin/sf-schema-drift/999/resolve",
            json={"action_taken": "ignored"},
        )
        assert resp.status_code == 404

    def test_resolve_requires_action_taken(self, admin_client, mock_db):
        resp = admin_client.post(
            "/api/admin/sf-schema-drift/1/resolve",
            json={},
        )
        assert resp.status_code == 422  # Pydantic validation


# ---------------------------------------------------------------------------
# Auth enforcement
# ---------------------------------------------------------------------------

class TestAdminAuth:

    def test_scan_requires_admin(self, unauthed_client):
        resp = unauthed_client.post("/api/admin/sf-schema-drift/scan")
        assert resp.status_code in (401, 403)

    def test_list_requires_admin(self, unauthed_client):
        resp = unauthed_client.get("/api/admin/sf-schema-drift")
        assert resp.status_code in (401, 403)

    def test_resolve_requires_admin(self, unauthed_client):
        resp = unauthed_client.post(
            "/api/admin/sf-schema-drift/1/resolve",
            json={"action_taken": "test"},
        )
        assert resp.status_code in (401, 403)
