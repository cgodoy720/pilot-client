"""SQLite storage for prospect import: persons, organizations, affiliations, import_sessions, raw_rows."""

import json
import re
import sqlite3
import uuid
from pathlib import Path

DB_PATH = Path(__file__).parent / "prospect_import.db"


def get_db() -> sqlite3.Connection:
    conn = sqlite3.connect(str(DB_PATH))
    conn.row_factory = sqlite3.Row
    return conn


def init_db() -> None:
    """Create tables: import_sessions, raw_rows, persons, organizations, affiliations."""
    conn = get_db()
    try:
        conn.executescript("""
            CREATE TABLE IF NOT EXISTS import_sessions (
                id TEXT PRIMARY KEY,
                filename TEXT,
                uploaded_at TEXT DEFAULT (datetime('now')),
                status TEXT DEFAULT 'pending',
                column_mapping_json TEXT,
                notes TEXT
            );
            CREATE TABLE IF NOT EXISTS raw_rows (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                session_id TEXT NOT NULL,
                row_index INTEGER NOT NULL,
                raw_json TEXT NOT NULL,
                FOREIGN KEY (session_id) REFERENCES import_sessions(id)
            );
            CREATE TABLE IF NOT EXISTS persons (
                id TEXT PRIMARY KEY,
                first_name TEXT NOT NULL,
                last_name TEXT NOT NULL,
                email TEXT,
                phone TEXT,
                title TEXT,
                source TEXT DEFAULT 'prospect_import',
                import_session_id TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (import_session_id) REFERENCES import_sessions(id)
            );
            CREATE TABLE IF NOT EXISTS organizations (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                type TEXT DEFAULT 'other',
                ein TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            );
            CREATE TABLE IF NOT EXISTS affiliations (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                person_id TEXT NOT NULL,
                org_id TEXT NOT NULL,
                role TEXT,
                is_primary INTEGER DEFAULT 0,
                source_row_index INTEGER,
                created_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (person_id) REFERENCES persons(id),
                FOREIGN KEY (org_id) REFERENCES organizations(id),
                UNIQUE(person_id, org_id)
            );
            CREATE INDEX IF NOT EXISTS idx_affiliations_person ON affiliations(person_id);
            CREATE INDEX IF NOT EXISTS idx_affiliations_org ON affiliations(org_id);
        """)
        conn.commit()
    finally:
        conn.close()


def _slug(s: str) -> str:
    """Generate URL-safe slug from string."""
    s = re.sub(r"[^\w\s-]", "", s.lower())
    s = re.sub(r"[-\s]+", "-", s).strip("-")
    return s[:50] if s else "unknown"


def create_import_session(filename: str, column_mapping: dict, notes: str = "") -> str:
    """Create a new import session. Returns session_id."""
    session_id = f"import-{uuid.uuid4().hex[:12]}"
    conn = get_db()
    try:
        conn.execute(
            """INSERT INTO import_sessions (id, filename, column_mapping_json, notes)
               VALUES (?, ?, ?, ?)""",
            (session_id, filename, json.dumps(column_mapping), notes),
        )
        conn.commit()
    finally:
        conn.close()
    return session_id


def save_raw_rows(session_id: str, rows: list[dict]) -> None:
    """Save raw parsed rows for an import session."""
    conn = get_db()
    try:
        for i, row in enumerate(rows):
            conn.execute(
                "INSERT INTO raw_rows (session_id, row_index, raw_json) VALUES (?, ?, ?)",
                (session_id, i, json.dumps(row)),
            )
        conn.commit()
    finally:
        conn.close()


def _infer_org_type(name: str) -> str:
    """Infer organization type from name suffix."""
    n = name.lower()
    if any(x in n for x in ["foundation", "fund", "trust", "charitable"]):
        return "foundation"
    if any(x in n for x in [" inc", " llc", " corp", " ltd", " co."]):
        return "corporation"
    if any(x in n for x in ["gov", "government", "state of", "city of"]):
        return "government"
    return "other"


def normalize_and_save(
    session_id: str,
    parsed: list[dict],
) -> dict:
    """
    Normalize parsed rows into persons, organizations, affiliations.
    Parsed rows must have: first_name, last_name, email (optional), organizations (list of org names).
    Dedupes by (first_name, last_name, email) for persons and by name for orgs.
    Returns {persons_count, orgs_count, affiliations_count}.
    """
    init_db()
    persons_seen: dict[tuple, str] = {}  # (first, last, email) -> person_id
    orgs_seen: dict[str, str] = {}  # name_lower -> org_id
    person_ids: list[str] = []
    org_ids: list[str] = []
    aff_count = 0

    conn = get_db()
    try:
        for row_idx, row in enumerate(parsed):
            first = str(row.get("first_name", "") or "").strip()
            last = str(row.get("last_name", "") or "").strip()
            email = str(row.get("email", "") or "").strip().lower()
            if not first and not last:
                continue

            key = (first, last, email or "")
            if key in persons_seen:
                person_id = persons_seen[key]
            else:
                person_id = f"person-{_slug(first)}-{_slug(last)}-{uuid.uuid4().hex[:6]}"
                persons_seen[key] = person_id
                conn.execute(
                    """INSERT OR IGNORE INTO persons (id, first_name, last_name, email, source, import_session_id)
                       VALUES (?, ?, ?, ?, 'prospect_import', ?)""",
                    (person_id, first, last, email or None, session_id),
                )
                person_ids.append(person_id)

            org_names = list(row.get("organizations") or [])

            for i, org_name in enumerate(org_names):
                on = org_name.strip()
                if not on:
                    continue
                ol = on.lower()
                if ol in orgs_seen:
                    org_id = orgs_seen[ol]
                else:
                    org_id = f"acct-{_slug(on)}-{uuid.uuid4().hex[:6]}"
                    orgs_seen[ol] = org_id
                    conn.execute(
                        """INSERT OR IGNORE INTO organizations (id, name, type)
                           VALUES (?, ?, ?)""",
                        (org_id, on, _infer_org_type(on)),
                    )
                    org_ids.append(org_id)

                conn.execute(
                    """INSERT OR IGNORE INTO affiliations (person_id, org_id, is_primary, source_row_index)
                       VALUES (?, ?, ?, ?)""",
                    (person_id, org_id, 1 if i == 0 else 0, row_idx),
                )
                aff_count += 1

        conn.execute(
            "UPDATE import_sessions SET status = 'normalized' WHERE id = ?",
            (session_id,),
        )
        conn.commit()
    finally:
        conn.close()

    return {
        "persons_count": len(persons_seen),
        "orgs_count": len(orgs_seen),
        "affiliations_count": aff_count,
    }


def get_persons_with_affiliations(session_id: str | None = None) -> list[dict]:
    """Get all persons with their affiliations. Optionally filter by session_id."""
    conn = get_db()
    try:
        if session_id:
            persons = conn.execute(
                "SELECT * FROM persons WHERE import_session_id = ? ORDER BY created_at",
                (session_id,),
            ).fetchall()
        else:
            persons = conn.execute("SELECT * FROM persons ORDER BY created_at").fetchall()

        result = []
        for p in persons:
            pid = p["id"]
            affs = conn.execute(
                """SELECT a.*, o.name as org_name, o.type as org_type
                   FROM affiliations a
                   JOIN organizations o ON a.org_id = o.id
                   WHERE a.person_id = ?
                   ORDER BY a.is_primary DESC""",
                (pid,),
            ).fetchall()
            result.append({
                "id": pid,
                "first_name": p["first_name"],
                "last_name": p["last_name"],
                "email": p["email"],
                "affiliations": [
                    {"org_id": a["org_id"], "org_name": a["org_name"], "org_type": a["org_type"], "role": a["role"]}
                    for a in affs
                ],
            })
        return result
    finally:
        conn.close()
