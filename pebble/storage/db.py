"""SQLite storage for Pebble: harness_log, profiles, feedback."""

import json
import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).parent.parent / "pebble.db"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables: harness_log, profiles, feedback."""
    conn = get_db()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS harness_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                agent_name TEXT NOT NULL,
                outcome TEXT NOT NULL,
                cost_usd REAL,
                tokens_input INTEGER,
                tokens_output INTEGER,
                attempts INTEGER,
                elapsed_seconds REAL,
                error TEXT,
                prospect_id TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS profiles (
                contact_id TEXT PRIMARY KEY,
                profile_json TEXT NOT NULL,
                cost_usd REAL,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS feedback (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                claim_id TEXT NOT NULL,
                correct INTEGER NOT NULL,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS source_scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source_name TEXT NOT NULL,
                richness_score REAL NOT NULL,
                prospect_id TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS api_cache (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                source TEXT NOT NULL,
                lookup_key TEXT NOT NULL,
                response_json TEXT NOT NULL,
                created_at TEXT,
                expires_at TEXT
            );
            CREATE UNIQUE INDEX IF NOT EXISTS idx_api_cache_source_key
                ON api_cache(source, lookup_key);
            CREATE TABLE IF NOT EXISTS research_sessions (
                id TEXT PRIMARY KEY,
                contact_id TEXT NOT NULL,
                profile_json TEXT NOT NULL,
                cost_usd REAL,
                prospect_name TEXT,
                prospect_org TEXT,
                status TEXT DEFAULT 'completed',
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE INDEX IF NOT EXISTS idx_sessions_contact ON research_sessions(contact_id);
            CREATE INDEX IF NOT EXISTS idx_sessions_created ON research_sessions(created_at DESC);
        """)
        conn.commit()

        # Migrate feedback table — add columns if missing
        try:
            conn.execute("ALTER TABLE feedback ADD COLUMN text TEXT")
        except Exception:
            pass  # already exists
        try:
            conn.execute("ALTER TABLE feedback ADD COLUMN contact_id TEXT")
        except Exception:
            pass
        try:
            conn.execute("ALTER TABLE feedback ADD COLUMN user_id TEXT")
        except Exception:
            pass
        conn.commit()
    finally:
        conn.close()


def log_harness_outcome(
    agent_name: str,
    outcome: str,
    cost_usd: float | None = None,
    tokens_input: int = 0,
    tokens_output: int = 0,
    attempts: int = 0,
    elapsed_seconds: float = 0,
    error: str | None = None,
    prospect_id: str | None = None,
) -> None:
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO harness_log
               (agent_name, outcome, cost_usd, tokens_input, tokens_output, attempts, elapsed_seconds, error, prospect_id)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (agent_name, outcome, cost_usd, tokens_input, tokens_output, attempts, elapsed_seconds, error, prospect_id),
        )
        conn.commit()
    finally:
        conn.close()


def save_profile(contact_id: str, profile: dict, cost_usd: float | None = None) -> None:
    conn = get_db()
    try:
        conn.execute(
            "INSERT OR REPLACE INTO profiles (contact_id, profile_json, cost_usd) VALUES (?, ?, ?)",
            (contact_id, json.dumps(profile), cost_usd),
        )
        conn.commit()
    finally:
        conn.close()


def get_profile(contact_id: str) -> dict | None:
    conn = get_db()
    try:
        row = conn.execute("SELECT profile_json FROM profiles WHERE contact_id = ?", (contact_id,)).fetchone()
        if row:
            return json.loads(row["profile_json"])
        return None
    finally:
        conn.close()


def save_feedback(
    claim_id: str,
    correct: bool,
    text: str | None = None,
    contact_id: str | None = None,
    user_id: str | None = None,
) -> None:
    conn = get_db()
    try:
        conn.execute(
            "INSERT INTO feedback (claim_id, correct, text, contact_id, user_id) VALUES (?, ?, ?, ?, ?)",
            (claim_id, 1 if correct else 0, text, contact_id, user_id),
        )
        conn.commit()
    finally:
        conn.close()


def get_feedback_for_contact(contact_id: str) -> list[dict]:
    """Return all feedback rows for a contact, newest first."""
    conn = get_db()
    try:
        rows = conn.execute(
            "SELECT id, claim_id, correct, text, contact_id, user_id, created_at "
            "FROM feedback WHERE contact_id = ? ORDER BY created_at DESC",
            (contact_id,),
        ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_feedback_trends(days: int = 30) -> dict:
    """Return feedback trend stats over the last N days."""
    conn = get_db()
    try:
        cutoff = f"-{days} days"
        # Overall counts
        row = conn.execute(
            "SELECT COUNT(*) AS total, "
            "SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) AS correct_count, "
            "SUM(CASE WHEN correct = 0 THEN 1 ELSE 0 END) AS incorrect_count "
            "FROM feedback WHERE created_at >= datetime('now', ?)",
            (cutoff,),
        ).fetchone()
        total = row["total"] or 0
        correct_count = row["correct_count"] or 0
        incorrect_count = row["incorrect_count"] or 0
        correct_pct = round(correct_count / total * 100, 1) if total > 0 else 0.0

        # By contact
        by_contact_rows = conn.execute(
            "SELECT contact_id, COUNT(*) AS total, "
            "SUM(CASE WHEN correct = 1 THEN 1 ELSE 0 END) AS correct_count "
            "FROM feedback WHERE created_at >= datetime('now', ?) AND contact_id IS NOT NULL "
            "GROUP BY contact_id ORDER BY total DESC",
            (cutoff,),
        ).fetchall()
        by_contact = [
            {"contact_id": r["contact_id"], "total": r["total"], "correct_count": r["correct_count"] or 0}
            for r in by_contact_rows
        ]

        return {
            "total": total,
            "correct_count": correct_count,
            "incorrect_count": incorrect_count,
            "correct_pct": correct_pct,
            "by_contact": by_contact,
        }
    finally:
        conn.close()


def save_source_scores(prospect_id: str, scores: dict[str, float]) -> None:
    """Stigmergy: write source richness scores to environment."""
    conn = get_db()
    try:
        conn.executemany(
            "INSERT INTO source_scores (source_name, richness_score, prospect_id) VALUES (?, ?, ?)",
            [(name, score, prospect_id) for name, score in scores.items()],
        )
        conn.commit()
    finally:
        conn.close()


def get_source_reliability(source_name: str) -> float:
    """Stigmergy: read pheromone trail — success rate over last 50 runs for a source."""
    conn = get_db()
    try:
        rows = conn.execute(
            """SELECT outcome FROM harness_log
               WHERE agent_name = ? ORDER BY created_at DESC LIMIT 50""",
            (source_name,),
        ).fetchall()
        if not rows:
            return 1.0  # No history — neutral multiplier (no dampening)
        successes = sum(1 for r in rows if r["outcome"] == "success")
        return successes / len(rows)
    finally:
        conn.close()


# ── Session History ──


def save_session(
    session_id: str,
    contact_id: str,
    profile: dict,
    prospect_name: str,
    prospect_org: str,
    cost_usd: float | None = None,
    status: str = "completed",
) -> None:
    """Insert a research session record."""
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO research_sessions
               (id, contact_id, profile_json, cost_usd, prospect_name, prospect_org, status)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (session_id, contact_id, json.dumps(profile), cost_usd, prospect_name, prospect_org, status),
        )
        conn.commit()
    finally:
        conn.close()


def get_recent_sessions(limit: int = 100) -> list[dict]:
    """Return recent research sessions ordered by created_at DESC.

    Each dict contains: id, contact_id, prospect_name, prospect_org,
    status, claims_count, confidence_score, created_at.
    """
    conn = get_db()
    try:
        rows = conn.execute(
            """SELECT id, contact_id, prospect_name, prospect_org, status,
                      profile_json, created_at
               FROM research_sessions
               ORDER BY created_at DESC
               LIMIT ?""",
            (limit,),
        ).fetchall()
        results = []
        for r in rows:
            profile = json.loads(r["profile_json"])
            results.append({
                "id": r["id"],
                "contact_id": r["contact_id"],
                "prospect_name": r["prospect_name"],
                "prospect_org": r["prospect_org"],
                "status": r["status"],
                "claims_count": len(profile.get("claims", [])),
                "confidence_score": profile.get("confidence_score", "unknown"),
                "created_at": r["created_at"],
            })
        return results
    finally:
        conn.close()


def get_session(session_id: str) -> dict | None:
    """Return a full session record including profile_json (parsed)."""
    conn = get_db()
    try:
        row = conn.execute(
            """SELECT id, contact_id, profile_json, cost_usd,
                      prospect_name, prospect_org, status, created_at
               FROM research_sessions WHERE id = ?""",
            (session_id,),
        ).fetchone()
        if not row:
            return None
        result = dict(row)
        result["profile"] = json.loads(result.pop("profile_json"))
        return result
    finally:
        conn.close()
