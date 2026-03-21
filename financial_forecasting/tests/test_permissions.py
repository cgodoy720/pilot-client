"""Tests for Permission Profiles, User Roles & Opportunity Locking."""

import sys
import os
import json
import uuid
from unittest.mock import AsyncMock, MagicMock

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient

from main import app, get_current_user, get_mcp_client
from auth import require_auth
from db import get_db
from routes.permissions import check_permission

# Disable startup/shutdown
app.router.on_startup.clear()
app.router.on_shutdown.clear()

# ---------------------------------------------------------------------------
# Fixtures
# ---------------------------------------------------------------------------

TEST_USER = {"user_id": "test_user", "email": "test@pursuit.org", "name": "Test User"}
ADMIN_PROFILE_ID = str(uuid.uuid4())
FUNDRAISER_PROFILE_ID = str(uuid.uuid4())
USER_ID = str(uuid.uuid4())
SF_USER_ID = "005TESTSFUSER0001"
OPP_ID = "006TESTOPPORT01"

ADMIN_PERMS = json.dumps({
    "view_opportunities": True, "edit_own_opportunities": True, "edit_all_opportunities": True,
    "create_opportunities": True, "bulk_update_opportunities": True, "lock_own_opportunities": True,
    "view_tasks": True, "edit_own_tasks": True, "edit_all_tasks": True, "create_tasks": True,
    "view_revenue_dashboard": True, "view_cashflow_forecasts": True,
    "view_sage_invoices_payments": True, "create_sage_invoices": True,
    "match_invoices": True, "manage_payment_schedules": True, "generate_financial_reports": True,
    "trigger_data_sync": True, "manage_users_roles": True,
})

FUNDRAISER_PERMS = json.dumps({
    "view_opportunities": True, "edit_own_opportunities": True, "edit_all_opportunities": False,
    "create_opportunities": True, "bulk_update_opportunities": False, "lock_own_opportunities": True,
    "view_tasks": True, "edit_own_tasks": True, "edit_all_tasks": False, "create_tasks": True,
    "view_revenue_dashboard": True, "view_cashflow_forecasts": True,
    "view_sage_invoices_payments": False, "create_sage_invoices": False,
    "match_invoices": False, "manage_payment_schedules": False, "generate_financial_reports": False,
    "trigger_data_sync": False, "manage_users_roles": False,
})


class MockDBRow(dict):
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)


def make_admin_user():
    return MockDBRow(
        id=USER_ID, sf_user_id=SF_USER_ID, email="test@pursuit.org",
        name="Test User", is_active=True, permissions=ADMIN_PERMS,
        profile_name="Admin", profile_id=ADMIN_PROFILE_ID,
    )


def make_fundraiser_user():
    return MockDBRow(
        id=USER_ID, sf_user_id=SF_USER_ID, email="test@pursuit.org",
        name="Test User", is_active=True, permissions=FUNDRAISER_PERMS,
        profile_name="Fundraiser", profile_id=FUNDRAISER_PROFILE_ID,
    )


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.fetch = AsyncMock(return_value=[])
    db.fetchrow = AsyncMock(return_value=make_admin_user())
    db.fetchval = AsyncMock(return_value=0)
    db.execute = AsyncMock(return_value="DELETE 1")
    return db


@pytest.fixture
def mock_client():
    client = MagicMock()
    client.salesforce = AsyncMock()
    client.disconnect_all = AsyncMock()
    return client


@pytest.fixture
def admin_client(mock_db, mock_client):
    """Client authenticated as admin."""
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    app.dependency_overrides[require_auth] = lambda: TEST_USER
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_mcp_client] = lambda: mock_client
    # Override check_permission to always pass for admin tests
    # (The real check_permission hits the DB — we override require_auth instead)

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def fundraiser_client(mock_db, mock_client):
    """Client authenticated as fundraiser (non-admin)."""
    mock_db.fetchrow = AsyncMock(return_value=make_fundraiser_user())

    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    app.dependency_overrides[require_auth] = lambda: TEST_USER
    app.dependency_overrides[get_db] = lambda: mock_db
    app.dependency_overrides[get_mcp_client] = lambda: mock_client

    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ===========================================================================
# GET /api/permissions/me
# ===========================================================================


class TestGetMyPermissions:
    def test_returns_permissions(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_admin_user())
        resp = admin_client.get("/api/permissions/me")
        assert resp.status_code == 200
        data = resp.json()["data"]
        assert data["email"] == "test@pursuit.org"
        assert data["permissions"]["manage_users_roles"] is True

    def test_auto_provisions_first_user_as_admin(self, admin_client, mock_db):
        # First call: no user found
        mock_db.fetchrow = AsyncMock(side_effect=[
            None,  # get_user_permissions: no existing user
            MockDBRow(id=ADMIN_PROFILE_ID, permissions=ADMIN_PERMS, name="Admin"),  # admin profile
            MockDBRow(id=USER_ID, sf_user_id=None, email="new@pursuit.org", name="", is_active=True),  # insert
        ])
        mock_db.fetchval = AsyncMock(return_value=0)  # no users exist
        resp = admin_client.get("/api/permissions/me")
        assert resp.status_code == 200


# ===========================================================================
# Profile CRUD
# ===========================================================================


class TestListProfiles:
    def test_returns_profiles(self, admin_client, mock_db):
        mock_db.fetch = AsyncMock(return_value=[
            MockDBRow(id=ADMIN_PROFILE_ID, name="Admin", description="Full access", is_default=False, permissions=ADMIN_PERMS, created_at="2026-01-01"),
        ])
        resp = admin_client.get("/api/permissions/profiles")
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1


class TestCreateProfile:
    def test_creates_profile(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(side_effect=[
            make_admin_user(),  # require_admin check
            MockDBRow(id=str(uuid.uuid4()), name="Finance", description="", is_default=False, permissions="{}", created_at="2026-01-01", updated_at="2026-01-01"),
        ])
        resp = admin_client.post("/api/permissions/profiles", json={
            "name": "Finance Manager",
            "permissions": {"view_sage_invoices_payments": True, "create_sage_invoices": True},
        })
        assert resp.status_code == 200

    def test_fundraiser_cannot_create_profile(self, fundraiser_client):
        resp = fundraiser_client.post("/api/permissions/profiles", json={
            "name": "Hacker", "permissions": {"manage_users_roles": True},
        })
        assert resp.status_code == 403


class TestDeleteProfile:
    def test_prevents_delete_with_assigned_users(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_admin_user())  # admin check
        mock_db.fetchval = AsyncMock(return_value=3)  # 3 users assigned
        resp = admin_client.delete(f"/api/permissions/profiles/{ADMIN_PROFILE_ID}")
        assert resp.status_code == 400
        assert "3 user(s)" in resp.json()["detail"]

    def test_deletes_empty_profile(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_admin_user())
        mock_db.fetchval = AsyncMock(return_value=0)
        mock_db.execute = AsyncMock(return_value="DELETE 1")
        resp = admin_client.delete(f"/api/permissions/profiles/{ADMIN_PROFILE_ID}")
        assert resp.status_code == 200


# ===========================================================================
# User Management
# ===========================================================================


class TestListUsers:
    def test_admin_can_list_users(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_admin_user())  # admin check
        mock_db.fetch = AsyncMock(return_value=[
            MockDBRow(id=USER_ID, sf_user_id=SF_USER_ID, email="test@pursuit.org", name="Test", is_active=True, profile_id=ADMIN_PROFILE_ID, profile_name="Admin"),
        ])
        resp = admin_client.get("/api/permissions/users")
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1

    def test_fundraiser_cannot_list_users(self, fundraiser_client):
        resp = fundraiser_client.get("/api/permissions/users")
        assert resp.status_code == 403


class TestUpdateUser:
    def test_admin_can_update_user(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(side_effect=[
            make_admin_user(),  # admin check
            MockDBRow(id=USER_ID, sf_user_id=SF_USER_ID, email="test@pursuit.org", name="Test", is_active=True, profile_id=ADMIN_PROFILE_ID),  # existing user
            MockDBRow(id=USER_ID, sf_user_id=SF_USER_ID, email="test@pursuit.org", name="Test", is_active=True, profile_id=FUNDRAISER_PROFILE_ID, profile_name="Fundraiser"),  # after update
        ])
        resp = admin_client.put(f"/api/permissions/users/{USER_ID}", json={"profile_id": FUNDRAISER_PROFILE_ID})
        assert resp.status_code == 200


# ===========================================================================
# Opportunity Lock
# ===========================================================================


class TestLockOpportunity:
    def test_owner_can_lock(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(side_effect=[
            make_admin_user(),  # permission check
            MockDBRow(sf_opportunity_id=OPP_ID, locked_by=SF_USER_ID, locked_at="2026-01-01"),  # insert
        ])
        resp = admin_client.post(f"/api/opportunities/{OPP_ID}/lock", json={"owner_id": SF_USER_ID})
        assert resp.status_code == 200

    def test_non_owner_cannot_lock(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_admin_user())
        resp = admin_client.post(f"/api/opportunities/{OPP_ID}/lock", json={"owner_id": "005DIFFERENTUSER"})
        assert resp.status_code == 403
        assert "only lock opportunities you own" in resp.json()["detail"]

    def test_validates_opportunity_id(self, admin_client):
        resp = admin_client.post("/api/opportunities/bad-id/lock", json={"owner_id": SF_USER_ID})
        assert resp.status_code == 400


class TestUnlockOpportunity:
    def test_owner_can_unlock(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(side_effect=[
            make_admin_user(),  # permission check
            MockDBRow(sf_opportunity_id=OPP_ID, locked_by=SF_USER_ID, locked_at="2026-01-01"),  # lock row
        ])
        resp = admin_client.delete(f"/api/opportunities/{OPP_ID}/lock")
        assert resp.status_code == 200

    def test_non_owner_non_admin_cannot_unlock(self, fundraiser_client, mock_db):
        mock_db.fetchrow = AsyncMock(side_effect=[
            make_fundraiser_user(),  # permission check
            MockDBRow(sf_opportunity_id=OPP_ID, locked_by="005DIFFERENTOWNER", locked_at="2026-01-01"),  # different owner
        ])
        resp = fundraiser_client.delete(f"/api/opportunities/{OPP_ID}/lock")
        assert resp.status_code == 403

    def test_unlock_nonexistent_returns_404(self, admin_client, mock_db):
        mock_db.fetchrow = AsyncMock(side_effect=[
            make_admin_user(),  # permission check
            None,  # no lock row
        ])
        resp = admin_client.delete(f"/api/opportunities/{OPP_ID}/lock")
        assert resp.status_code == 404


# ===========================================================================
# Permission checks on CRUD endpoints (verify check_permission is wired)
# ===========================================================================


class TestPermissionGating:
    """Verify that mutation endpoints now use check_permission, not just require_auth."""

    def test_opportunity_update_requires_edit_permission(self, fundraiser_client, mock_db):
        # Fundraiser has edit_own_opportunities but the endpoint should check
        mock_db.fetchrow = AsyncMock(return_value=make_fundraiser_user())
        resp = fundraiser_client.put(
            f"/api/salesforce/opportunities/{OPP_ID}",
            json={"opportunity_id": OPP_ID, "updates": {"Amount": 100}, "user_id": "test"},
        )
        # Should succeed since fundraiser has edit_own_opportunities
        assert resp.status_code in (200, 500)  # 500 if SF not connected, but NOT 403

    def test_sync_requires_trigger_permission(self, fundraiser_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_fundraiser_user())
        resp = fundraiser_client.post("/api/sync/trigger")
        # Fundraiser doesn't have trigger_data_sync — should be 403
        assert resp.status_code == 403

    def test_matching_requires_match_permission(self, fundraiser_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=make_fundraiser_user())
        resp = fundraiser_client.post("/api/matching/save-match", json={
            "invoice_id": "INV-001", "opportunity_id": OPP_ID,
            "confidence": "high", "notes": "", "customer_name": "Test",
            "invoice_amount": 1000, "invoice_date": "2026-01-01",
        })
        assert resp.status_code == 403
