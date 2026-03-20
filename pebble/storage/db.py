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
        """)
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


def save_feedback(claim_id: str, correct: bool) -> None:
    conn = get_db()
    try:
        conn.execute("INSERT INTO feedback (claim_id, correct) VALUES (?, ?)", (claim_id, 1 if correct else 0))
        conn.commit()
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
