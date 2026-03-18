# Prospect Import Pipeline — Full Spec

**Version:** 1.0  
**Date:** March 2026  
**Status:** Implementation spec  
**References:** [Prospect Import and Normalized Store plan](.cursor/plans/prospect_import_and_normalized_store_e59cc88d.plan.md), entity-map.md, integration-register.md

---

## 1. Problem Statement

Contact and prospect lists arrive in many formats. A basic spreadsheet filler is insufficient because:

1. **Messy input** — Column names, layouts, and data quality vary widely.
2. **Multi-affiliation** — HNWI like the Cohen family are connected to many businesses and foundations; we need all affiliations, not a single "Organization" field.
3. **EIN** — Should not be required; Pebble discovers it when needed for research.
4. **CRM writes** — Must map to Contact, Account, ContactAccount (and Prospect) — the CRM already supports many-to-many via ContactAccount.
5. **Storage** — Needs a proper database with connected objects, not a flat table.

---

## 2. Data Model: Normalized Prospect Store

### Core Tables

| Table | Purpose |
|-------|---------|
| **persons** | One row per unique person (deduped by name + fuzzy match). first_name, last_name, email, source, import_session_id |
| **organizations** | One row per unique org (deduped). name, type (corporation/foundation/other), ein (nullable; Pebble fills later) |
| **affiliations** | Junction: person_id, org_id, role (optional), is_primary (bool), source_row_index |

### Import Metadata

| Table | Purpose |
|-------|---------|
| **import_sessions** | id, filename, uploaded_at, status, column_mapping_json, notes |
| **raw_rows** | session_id, row_index, raw_json (original parsed row) |

### Column Mapping (User-Guided)

User maps spreadsheet columns to:

- **Required for person:** First Name, Last Name (or combined "Name" with split)
- **Optional:** Email, Phone, Title
- **Affiliations:** Organization 1, Organization 2, … OR a single "Organizations" column (comma/semicolon-separated)
- **Explicitly not required:** EIN (Pebble finds it)

**Note in UI:** "Organization is optional. Some prospects (e.g. HNWI families) have many affiliations — map additional org columns or use a multi-value column."

---

## 3. Handling Messy Spreadsheets

1. **Preview** — Parse with PapaParse; show first 20 rows; detect headers (first row vs. inferred).
2. **Column mapping UI** — Dropdown per target field: "Map to: [First Name] [Last Name] [Organization 1] [Organization 2] [Email] …" with "Skip" for unmapped columns.
3. **Name splitting** — If only "Name" column: offer "Split into First/Last" (rule-based or LLM-assisted for edge cases like "Cohen, Steven" vs "Steven Cohen").
4. **Multi-org parsing** — If "Organizations" contains "Point72; Cohen Foundation; SAC Capital" → create 3 org rows + 3 affiliation rows.
5. **Deduplication** — Same person (name+email) across rows → merge into one person with multiple affiliations. Same org name → one organization row.

---

## 4. CRM Write Mapping

| Normalized Store | CRM Entity | Notes |
|-----------------|------------|-------|
| persons | Contact | first_name, last_name, email, source |
| organizations | Account | name, type (infer from suffix: Foundation→foundation, Inc→corporation) |
| affiliations | ContactAccount | contact_id, account_id, role |
| (optional) | Prospect | When user promotes a Contact to pipeline; links contact_id |

---

## 5. Storage

**SQLite** for the import/normalize pipeline (prospect_import service or pebble-adjacent). When merging to learning platform, migrate schema to PostgreSQL.

---

## 6. Open Questions

1. **Household vs. individual** — "Cohen family" as one prospect vs. Steven Cohen + Alexandra Cohen. Defer or support both?
2. **Merge key for dedup** — name+email? name+primary_org? Configurable?
3. **Salesforce ContactAccount** — Does SF have a standard junction or custom object for Contact–Account many-to-many? NPSP uses AccountId on Contact for primary; additional affiliations may need custom object.
