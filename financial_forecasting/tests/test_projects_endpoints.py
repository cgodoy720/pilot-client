"""Tests for Projects router — CRUD + auth enforcement."""

import sys
import os
import json
import uuid
from unittest.mock import AsyncMock

import pytest

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, os.path.dirname(__file__))

from fastapi.testclient import TestClient
from main import app, get_current_user
from auth import require_auth
from db import get_db

app.router.on_startup.clear()
app.router.on_shutdown.clear()

TEST_USER = {"user_id": "test_user", "email": "test@pursuit.org", "name": "Test"}
PROJECT_ID = str(uuid.uuid4())
WORKSTREAM_ID = str(uuid.uuid4())
MILESTONE_ID = str(uuid.uuid4())
TASK_ID = str(uuid.uuid4())


class MockDBRow(dict):
    def __getattr__(self, key):
        try:
            return self[key]
        except KeyError:
            raise AttributeError(key)


@pytest.fixture
def mock_db():
    db = AsyncMock()
    db.fetch = AsyncMock(return_value=[])
    db.fetchrow = AsyncMock(return_value=None)
    db.fetchval = AsyncMock(return_value=0)
    db.execute = AsyncMock(return_value="DELETE 1")
    return db


@pytest.fixture
def authed_client(mock_db):
    app.dependency_overrides[get_current_user] = lambda: TEST_USER
    app.dependency_overrides[require_auth] = lambda: TEST_USER
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture
def unauthed_client(mock_db):
    """No auth override — tests 401 enforcement."""
    app.dependency_overrides[get_db] = lambda: mock_db
    with TestClient(app, raise_server_exceptions=False) as c:
        yield c
    app.dependency_overrides.clear()


# ===========================================================================
# AUTH ENFORCEMENT — all endpoints require auth
# ===========================================================================


class TestProjectsAuthEnforcement:
    """Every projects endpoint must return 401 without authentication."""

    def test_list_projects_requires_auth(self, unauthed_client):
        assert unauthed_client.get("/api/projects").status_code == 401

    def test_get_project_requires_auth(self, unauthed_client):
        assert unauthed_client.get(f"/api/projects/{PROJECT_ID}").status_code == 401

    def test_create_workstream_requires_auth(self, unauthed_client):
        resp = unauthed_client.post(f"/api/projects/{PROJECT_ID}/workstreams", json={"name": "Test"})
        assert resp.status_code == 401

    def test_update_workstream_requires_auth(self, unauthed_client):
        resp = unauthed_client.put(f"/api/workstreams/{WORKSTREAM_ID}", json={"name": "Updated"})
        assert resp.status_code == 401

    def test_delete_workstream_requires_auth(self, unauthed_client):
        assert unauthed_client.delete(f"/api/workstreams/{WORKSTREAM_ID}").status_code == 401

    def test_create_milestone_requires_auth(self, unauthed_client):
        resp = unauthed_client.post(f"/api/workstreams/{WORKSTREAM_ID}/milestones", json={"title": "M1"})
        assert resp.status_code == 401

    def test_update_milestone_requires_auth(self, unauthed_client):
        resp = unauthed_client.put(f"/api/milestones/{MILESTONE_ID}", json={"title": "Updated"})
        assert resp.status_code == 401

    def test_delete_milestone_requires_auth(self, unauthed_client):
        assert unauthed_client.delete(f"/api/milestones/{MILESTONE_ID}").status_code == 401

    def test_create_task_requires_auth(self, unauthed_client):
        resp = unauthed_client.post(f"/api/milestones/{MILESTONE_ID}/tasks", json={"title": "T1"})
        assert resp.status_code == 401

    def test_update_task_requires_auth(self, unauthed_client):
        resp = unauthed_client.put(f"/api/project-tasks/{TASK_ID}", json={"title": "Updated"})
        assert resp.status_code == 401

    def test_delete_task_requires_auth(self, unauthed_client):
        assert unauthed_client.delete(f"/api/project-tasks/{TASK_ID}").status_code == 401


# ===========================================================================
# CRUD OPERATIONS — authenticated
# ===========================================================================


class TestListProjects:
    def test_returns_projects(self, authed_client, mock_db):
        mock_db.fetch = AsyncMock(return_value=[
            MockDBRow(id=PROJECT_ID, name="AIJI", description="Main project", created_at="2026-01-01", updated_at="2026-01-01"),
        ])
        resp = authed_client.get("/api/projects")
        assert resp.status_code == 200
        assert len(resp.json()["data"]) == 1

    def test_returns_empty_list(self, authed_client, mock_db):
        mock_db.fetch = AsyncMock(return_value=[])
        resp = authed_client.get("/api/projects")
        assert resp.status_code == 200
        assert resp.json()["data"] == []


class TestCreateWorkstream:
    def test_creates_workstream(self, authed_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=MockDBRow(
            id=WORKSTREAM_ID, name="Strategy", description="", sort_order=0,
        ))
        resp = authed_client.post(f"/api/projects/{PROJECT_ID}/workstreams", json={"name": "Strategy"})
        assert resp.status_code == 200
        assert resp.json()["success"] is True


class TestUpdateWorkstream:
    def test_updates_workstream(self, authed_client, mock_db):
        mock_db.execute = AsyncMock(return_value="UPDATE 1")
        resp = authed_client.put(f"/api/workstreams/{WORKSTREAM_ID}", json={"name": "Updated"})
        assert resp.status_code == 200


class TestDeleteWorkstream:
    def test_deletes_workstream(self, authed_client, mock_db):
        mock_db.execute = AsyncMock(return_value="DELETE 1")
        resp = authed_client.delete(f"/api/workstreams/{WORKSTREAM_ID}")
        assert resp.status_code == 200


class TestCreateMilestone:
    def test_creates_milestone(self, authed_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=MockDBRow(
            id=MILESTONE_ID, title="Phase 1", priority="high", status="active", sort_order=0,
        ))
        resp = authed_client.post(
            f"/api/workstreams/{WORKSTREAM_ID}/milestones",
            json={"title": "Phase 1", "priority": "high"},
        )
        assert resp.status_code == 200


class TestCreateProjectTask:
    def test_creates_task(self, authed_client, mock_db):
        mock_db.fetchrow = AsyncMock(return_value=MockDBRow(
            id=TASK_ID, title="Research", status="Not Started", owner="", deadline=None,
            start_date=None, description="", updates="", links=[], depends_on=[], sort_order=0,
        ))
        resp = authed_client.post(
            f"/api/milestones/{MILESTONE_ID}/tasks",
            json={"title": "Research"},
        )
        assert resp.status_code == 200
        assert resp.json()["success"] is True


class TestUpdateProjectTask:
    def test_updates_task(self, authed_client, mock_db):
        mock_db.execute = AsyncMock(return_value="UPDATE 1")
        resp = authed_client.put(
            f"/api/project-tasks/{TASK_ID}",
            json={"status": "In Progress"},
        )
        assert resp.status_code == 200


class TestDeleteProjectTask:
    def test_deletes_task(self, authed_client, mock_db):
        mock_db.execute = AsyncMock(return_value="DELETE 1")
        resp = authed_client.delete(f"/api/project-tasks/{TASK_ID}")
        assert resp.status_code == 200
