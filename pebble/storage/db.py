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

            -- Ask Pebble chat tables
            CREATE TABLE IF NOT EXISTS chat_conversations (
                id TEXT PRIMARY KEY,
                user_email TEXT NOT NULL,
                title TEXT,
                total_cost_usd REAL DEFAULT 0.0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS chat_messages (
                id TEXT PRIMARY KEY,
                conversation_id TEXT NOT NULL,
                role TEXT NOT NULL,
                content TEXT NOT NULL,
                tier TEXT,
                cost_usd REAL DEFAULT 0.0,
                metadata_json TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id)
            );
            CREATE INDEX IF NOT EXISTS idx_chat_messages_conv
                ON chat_messages(conversation_id, created_at);

            -- Ask Pebble batch research tables
            CREATE TABLE IF NOT EXISTS research_batches (
                id TEXT PRIMARY KEY,
                user_email TEXT NOT NULL,
                total_prospects INTEGER NOT NULL DEFAULT 0,
                completed_prospects INTEGER DEFAULT 0,
                target_tier TEXT NOT NULL DEFAULT 'T1',
                status TEXT DEFAULT 'pending',
                total_cost_usd REAL DEFAULT 0.0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS batch_prospects (
                id TEXT PRIMARY KEY,
                batch_id TEXT NOT NULL,
                prospect_name TEXT,
                prospect_org TEXT,
                current_tier TEXT DEFAULT 'pending',
                identity_confidence TEXT DEFAULT 'none',
                crm_status TEXT DEFAULT 'unknown',
                result_json TEXT,
                cost_usd REAL DEFAULT 0.0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (batch_id) REFERENCES research_batches(id)
            );
            CREATE INDEX IF NOT EXISTS idx_batch_prospects_batch
                ON batch_prospects(batch_id);
        """)
        conn.commit()

        # Enable WAL mode for concurrent read/write safety (chat + research)
        conn.execute("PRAGMA journal_mode=WAL")

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


# ---------------------------------------------------------------------------
# Chat persistence (Ask Pebble)
# ---------------------------------------------------------------------------

def ensure_conversation(conversation_id: str, user_email: str) -> None:
    """Create a conversation record if it doesn't exist."""
    conn = get_db()
    try:
        conn.execute(
            """INSERT OR IGNORE INTO chat_conversations (id, user_email)
               VALUES (?, ?)""",
            (conversation_id, user_email),
        )
        conn.commit()
    finally:
        conn.close()


def save_chat_message(
    message_id: str,
    conversation_id: str,
    role: str,
    content: str,
    tier: str | None = None,
    cost_usd: float = 0.0,
    metadata: dict | None = None,
) -> None:
    """Save a chat message and update conversation cost."""
    conn = get_db()
    try:
        metadata_json = json.dumps(metadata) if metadata else None
        conn.execute(
            """INSERT INTO chat_messages
               (id, conversation_id, role, content, tier, cost_usd, metadata_json)
               VALUES (?, ?, ?, ?, ?, ?, ?)""",
            (message_id, conversation_id, role, content, tier, cost_usd, metadata_json),
        )
        if cost_usd > 0:
            conn.execute(
                """UPDATE chat_conversations
                   SET total_cost_usd = total_cost_usd + ?,
                       updated_at = datetime('now')
                   WHERE id = ?""",
                (cost_usd, conversation_id),
            )
        conn.commit()
    finally:
        conn.close()


def get_conversation_messages(
    conversation_id: str, limit: int = 50
) -> list[dict]:
    """Get recent messages for a conversation."""
    conn = get_db()
    try:
        rows = conn.execute(
            """SELECT id, role, content, tier, cost_usd, metadata_json, created_at
               FROM chat_messages
               WHERE conversation_id = ?
               ORDER BY created_at ASC
               LIMIT ?""",
            (conversation_id, limit),
        ).fetchall()
        results = []
        for r in rows:
            msg = dict(r)
            if msg.get("metadata_json"):
                msg["metadata"] = json.loads(msg.pop("metadata_json"))
            else:
                msg.pop("metadata_json", None)
                msg["metadata"] = None
            results.append(msg)
        return results
    finally:
        conn.close()


def get_recent_conversations(
    user_email: str | None = None, limit: int = 20
) -> list[dict]:
    """Get recent conversations, optionally filtered by user."""
    conn = get_db()
    try:
        if user_email:
            rows = conn.execute(
                """SELECT id, user_email, title, total_cost_usd, created_at, updated_at
                   FROM chat_conversations
                   WHERE user_email = ?
                   ORDER BY updated_at DESC
                   LIMIT ?""",
                (user_email, limit),
            ).fetchall()
        else:
            rows = conn.execute(
                """SELECT id, user_email, title, total_cost_usd, created_at, updated_at
                   FROM chat_conversations
                   ORDER BY updated_at DESC
                   LIMIT ?""",
                (limit,),
            ).fetchall()
        return [dict(r) for r in rows]
    finally:
        conn.close()


def get_conversation_context(conversation_id: str) -> dict | None:
    """Get the last assistant message's metadata for context resolution."""
    conn = get_db()
    try:
        row = conn.execute(
            """SELECT metadata_json FROM chat_messages
               WHERE conversation_id = ? AND role = 'assistant'
               ORDER BY created_at DESC LIMIT 1""",
            (conversation_id,),
        ).fetchone()
        if row and row["metadata_json"]:
            return json.loads(row["metadata_json"])
        return None
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Batch research persistence (Ask Pebble Phase 4)
# ---------------------------------------------------------------------------

def create_batch(batch_id: str, user_email: str, prospects: list[dict]) -> None:
    """Create a batch and its prospect rows."""
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO research_batches (id, user_email, total_prospects)
               VALUES (?, ?, ?)""",
            (batch_id, user_email, len(prospects)),
        )
        for p in prospects:
            conn.execute(
                """INSERT INTO batch_prospects
                   (id, batch_id, prospect_name, prospect_org)
                   VALUES (?, ?, ?, ?)""",
                (p["id"], batch_id, p.get("name", ""), p.get("organization", "")),
            )
        conn.commit()
    finally:
        conn.close()


def update_batch_prospect(
    prospect_id: str,
    current_tier: str,
    identity_confidence: str = "none",
    crm_status: str = "unknown",
    result_json: str | None = None,
    cost_usd: float = 0.0,
) -> None:
    """Update a prospect's tier result in a batch."""
    conn = get_db()
    try:
        conn.execute(
            """UPDATE batch_prospects
               SET current_tier = ?, identity_confidence = ?, crm_status = ?,
                   result_json = ?, cost_usd = ?, updated_at = datetime('now')
               WHERE id = ?""",
            (current_tier, identity_confidence, crm_status, result_json, cost_usd, prospect_id),
        )
        conn.commit()
    finally:
        conn.close()


def update_batch_status(
    batch_id: str,
    status: str,
    completed_prospects: int | None = None,
    total_cost_usd: float | None = None,
) -> None:
    """Update batch-level status."""
    conn = get_db()
    try:
        updates = ["status = ?", "updated_at = datetime('now')"]
        params: list = [status]
        if completed_prospects is not None:
            updates.append("completed_prospects = ?")
            params.append(completed_prospects)
        if total_cost_usd is not None:
            updates.append("total_cost_usd = ?")
            params.append(total_cost_usd)
        params.append(batch_id)
        conn.execute(
            f"UPDATE research_batches SET {', '.join(updates)} WHERE id = ?",
            params,
        )
        conn.commit()
    finally:
        conn.close()


def get_batch_status(batch_id: str) -> dict | None:
    """Get batch status and summary."""
    conn = get_db()
    try:
        row = conn.execute(
            """SELECT id, user_email, total_prospects, completed_prospects,
                      target_tier, status, total_cost_usd, created_at, updated_at
               FROM research_batches WHERE id = ?""",
            (batch_id,),
        ).fetchone()
        return dict(row) if row else None
    finally:
        conn.close()


def get_batch_prospects(batch_id: str) -> list[dict]:
    """Get all prospects in a batch."""
    conn = get_db()
    try:
        rows = conn.execute(
            """SELECT id, prospect_name, prospect_org, current_tier,
                      identity_confidence, crm_status, result_json, cost_usd
               FROM batch_prospects
               WHERE batch_id = ?
               ORDER BY prospect_name ASC""",
            (batch_id,),
        ).fetchall()
        results = []
        for r in rows:
            item = dict(r)
            if item.get("result_json"):
                item["result"] = json.loads(item.pop("result_json"))
            else:
                item.pop("result_json", None)
                item["result"] = None
            results.append(item)
        return results
    finally:
        conn.close()
