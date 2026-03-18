"""Prospect schema for Stage 1 enrichment."""

from pydantic import BaseModel, Field


class Prospect(BaseModel):
    """Minimal prospect for enrichment."""

    id: str
    first_name: str = ""
    last_name: str = ""
    organization: str = ""
    ein: str | None = None
    email: str = ""


def parse_csv_to_prospects(csv_text: str, id_prefix: str = "p") -> list[dict]:
    """Parse CSV to prospect dicts. Handles common column aliases."""
    import csv
    import io
    import uuid

    aliases = {
        "first_name": ["first_name", "first", "firstname", "given_name"],
        "last_name": ["last_name", "last", "lastname", "surname", "family_name"],
        "organization": ["organization", "org", "company", "employer"],
        "ein": ["ein", "employer_id"],
        "email": ["email", "email_address"],
    }

    reader = csv.DictReader(io.StringIO(csv_text))
    prospects = []
    for i, row in enumerate(reader):
        row_lower = {k.lower().strip(): v for k, v in row.items() if k}
        first = _get_field(row_lower, aliases["first_name"])
        last = _get_field(row_lower, aliases["last_name"])
        org = _get_field(row_lower, aliases["organization"])
        ein = _get_field(row_lower, aliases["ein"]) or None
        email = _get_field(row_lower, aliases["email"])
        pid = f"{id_prefix}-{uuid.uuid4().hex[:8]}" if not row_lower.get("id") else row_lower.get("id", "")
        prospects.append({
            "id": pid,
            "first_name": first or "",
            "last_name": last or "",
            "organization": org or "",
            "ein": ein,
            "email": email or "",
        })
    return prospects


def _get_field(row: dict, keys: list[str]) -> str | None:
    for k in keys:
        for rk, rv in row.items():
            if rk in (k, k.replace("_", "")):
                if rv and str(rv).strip():
                    return str(rv).strip()
    return None
