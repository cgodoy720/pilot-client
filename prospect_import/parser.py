"""Parse messy spreadsheets with column mapping, name splitting, multi-org parsing."""

import csv
import io
import re
from typing import Any


def split_name(full_name: str) -> tuple[str, str]:
    """
    Split a full name into first and last.
    Handles: "Cohen, Steven" -> (Steven, Cohen); "Steven Cohen" -> (Steven, Cohen)
    """
    s = (full_name or "").strip()
    if not s:
        return ("", "")

    if "," in s:
        parts = [p.strip() for p in s.split(",", 1)]
        if len(parts) == 2:
            return (parts[1], parts[0])  # "Cohen, Steven" -> first=Steven, last=Cohen
        return (parts[0], "")

    parts = s.split()
    if len(parts) == 1:
        return (parts[0], "")
    if len(parts) == 2:
        return (parts[0], parts[1])
    return (parts[0], " ".join(parts[1:]))


def parse_organizations(value: str) -> list[str]:
    """
    Parse a multi-org string into a list of org names.
    Supports comma, semicolon, pipe, newline separators.
    """
    if not value or not str(value).strip():
        return []
    s = str(value).strip()
    for sep in [";", "|", "\n", "\r"]:
        s = s.replace(sep, ",")
    return [o.strip() for o in s.split(",") if o.strip()]


def parse_csv_with_mapping(
    csv_text: str,
    column_mapping: dict[str, str],
    split_name_column: str | None = None,
) -> list[dict]:
    """
    Parse CSV with user-defined column mapping.

    column_mapping: {
        "first_name": "First Name",      # spreadsheet column -> first_name
        "last_name": "Last Name",
        "email": "Email",
        "organizations": ["Organization", "Org 2"] or "Organizations"  # single or multi
    }
    If split_name_column is set, use that column and split into first/last instead of separate columns.
    """
    reader = csv.DictReader(io.StringIO(csv_text))
    rows = []
    for row in reader:
        out: dict[str, Any] = {}
        for k, v in row.items():
            if v and str(v).strip():
                out[k] = str(v).strip()

        if split_name_column and split_name_column in out:
            first, last = split_name(out[split_name_column])
            out["first_name"] = first
            out["last_name"] = last
        else:
            first_key = column_mapping.get("first_name")
            last_key = column_mapping.get("last_name")
            out["first_name"] = out.get(first_key or "first_name", "")
            out["last_name"] = out.get(last_key or "last_name", "")

        email_key = column_mapping.get("email")
        if email_key:
            out["email"] = out.get(email_key, "")
        else:
            out["email"] = out.get("email", "")

        org_keys = column_mapping.get("organizations")
        if isinstance(org_keys, list):
            orgs = []
            for k in org_keys:
                if k and out.get(k):
                    orgs.extend(parse_organizations(out[k]))
            out["organizations"] = orgs
        elif org_keys and out.get(org_keys):
            out["organizations"] = parse_organizations(out[org_keys])
        else:
            out["organizations"] = []

        rows.append(out)
    return rows


def preview_csv(csv_text: str, max_rows: int = 20) -> dict:
    """
    Parse CSV and return preview: headers and first N rows.
    """
    reader = csv.DictReader(io.StringIO(csv_text))
    headers = reader.fieldnames or []
    rows = []
    for i, row in enumerate(reader):
        if i >= max_rows:
            break
        rows.append(dict(row))
    return {"headers": headers, "rows": rows, "row_count": len(rows)}
