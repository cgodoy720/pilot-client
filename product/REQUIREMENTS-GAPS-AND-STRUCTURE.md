# Areas Requiring More Structure (Before Build)

Gaps in the current product docs that, if left unspecified, will lead to ambiguous requirements and bad or inconsistent code. This doc also adds **software-engineering rigor** (testability, contracts, invariants, observability) so implementations are more likely to stand up on the first try.

---

## 0. Software development rigor (applies to all features)

- **Testable acceptance criteria:** Every “done” criterion verifiable; ≥1 positive and 1 negative scenario per main path; edge cases: empty file, max rows, encoding.
- **Interface contracts:** Per operation: input (required/optional, format), success output shape, failure (stable codes: `VALIDATION_ERROR`, `ENTITY_NOT_FOUND`, `REMOTE_API_ERROR`, etc.) and one place for user messages.
- **Data invariants:** Document invariants (e.g. Lead.contact_id exists; PendingChange confirmed ⇒ resolved_at set); when a flow might break one, relax with a rule or require the step that satisfies it.

- **Idempotency:** External calls and Confirm/Submit: define retry behavior (idempotent or key); double-click: disable or idempotent server-side.
- **Observability:** Log operation, actor, entity IDs, outcome, error code (no PII); define audit trail; one place to inspect failed ops without secrets.
- **Scale and limits:** Max rows (e.g. import 10k), report cap, timeouts (e.g. SF/Sage 30s); behavior when exceeded.
- **Security boundaries:** Per sensitive op: who (role), what’s allowed; ref `security-requirements.md`.

---

## 1. Week 1 prototype

| Gap | Risk | What to add |
|-----|------|-------------|
| **Prospect ↔ grant link undefined** | Builders will invent ad hoc linking; “weekly priority” will be inconsistent. | Define exactly how a prospect is linked to a grant in week 1: e.g. “User assigns prospect to one grant (dropdown of grants with deadlines this week)” or “Spreadsheet column `grant_name` matched to opportunity name.” One chosen approach; document in week-1 spec. |
| **“This week” and date range** | Different code will use different definitions. | Specify: “This week” = calendar week (Mon–Sun) of today, or “next 7 days,” or configurable. Same for “dates relevant to grant deadlines” (e.g. close_date in [today, today+7]). Put in week-1 spec. |
| **CSV column mapping** | Parser will guess or hardcode; breaks when format changes. | Require: (a) expected column names or aliases (e.g. `name` / `Name` / `Contact Name`), and (b) behavior when required columns are missing (fail vs partial row + warning). Document in week-1 spec; consider a one-time “map columns” UI. |
| **Validation and errors** | Invalid rows can crash import or silently drop data. | Define: required fields per row; valid date format; what to do with invalid rows (skip and list errors, or reject entire file). Add “Validation & errors” subsection to week-1 spec. |
| **ID generation for prospects** | “id (or generated)” is unspecified. | Decide: e.g. `prospect-{timestamp}-{index}` or `contact-{slug-from-name}`. Align with data-model ID patterns. Add to week-1 data model. |

### 1.1 Week 1 – Rigor add-ons

- **Contract (import):** Input = file (CSV, max size e.g. 5MB, max rows e.g. 10k). Output success = `{ imported: number, skipped: number, errors: { row: number, message: string }[] }`. Output failure = `VALIDATION_ERROR` (with row-level details) or `FILE_TOO_LARGE` / `TOO_MANY_ROWS`.
- **Invariants:** Every prospect in “this week’s priorities” has a non-null link to at least one grant (or explicit “unassigned” bucket). Every grant in the list has `close_date` within the chosen “this week” range.
- **Acceptance criteria (testable):** (1) Given CSV with required columns, import returns imported = N, skipped = 0, UI shows N prospects. (2) Given CSV missing “name,” import returns VALIDATION_ERROR and does not add rows. (3) Given grants with close_date in [Mon, Sun], “This week’s priorities” shows those grants and any prospects linked to them.

---

## 2. Slack-driven data entry & human verification

| Gap | Risk | What to add |
|-----|------|-------------|
| **Entity resolution (which record?)** | Parser proposes “update Opportunity X” but “X” is ambiguous. | Define: how the system resolves “which Opportunity/Contact/Account” from message text (e.g. match by name, or require ID/mention). Behavior when multiple matches or zero matches (show in review as “unresolved,” require user to pick or reject). Add “Entity resolution rules” to Slack spec. |
| **Pending change schema** | No canonical shape; each implementer invents one. | Define: fields for a pending change (e.g. `id`, `source_message_id`, `source_channel`, `entity_type`, `target_id` or `target_name`, `proposed_diff` or `field_updates`, `status`, `created_at`, `resolved_at`, `resolved_by`). Add to Slack spec or data-model. |
| **Conflict and duplicates** | Two messages for same record, or same message twice. | Define: dedupe (e.g. by message ID); when two pending changes touch the same record/field, show both and let user pick, or “last in wins.” Add to Slack spec. |
| **Apply failures** | User confirms but Salesforce or Sage API fails. | Define: retry policy; what the user sees (error message, “stays in queue” or “marked failed”); whether they can edit and retry. Add “Failure handling on apply” to Slack spec. |
| **Which channel / trigger** | “Designated channel or DM” is vague. | Specify: exact channel name(s) or ID(s), or “messages that mention @BedrockBot” or slash command only. Document in Slack spec. |

### 2.1 Slack – State machine (pending change)

- **States:** `pending` → `confirmed` | `rejected` | `failed` (apply attempted but remote API error). Optionally `editing` (user is editing before confirm).
- **Transitions:** Only `pending` can transition to `confirmed` / `rejected` / `failed`. Once `confirmed` or `rejected`, record is immutable (no “undo apply” in V1 unless specified). `failed` can transition back to `pending` after user edits and retries, if you allow “edit and retry.”
- Document in Slack spec; implement and test transitions so no invalid state (e.g. `confirmed` but no `resolved_at`).

### 2.2 Slack – Rigor add-ons

- **Contract (apply):** Input = `pending_change_id`, optional `field_overrides`. Output success = `{ applied: true, entity_type, target_id }`. Output failure = `ENTITY_NOT_FOUND`, `REMOTE_API_ERROR` (with short message), `VALIDATION_ERROR` (e.g. SF validation failed).
- **Idempotency:** If apply is retried for the same `pending_change_id` and the change is already `confirmed`, return success and do not call Salesforce/Sage again (or use remote idempotency if available).
- **Invariants:** Every pending change in `confirmed` has `resolved_at` and `resolved_by`. No pending change in `pending` has `resolved_at` set.
- **Observability:** Log every ingest (message_id, channel, entity_type proposed) and every apply (pending_change_id, actor, outcome, error_code if failed).
- **Acceptance criteria (testable):** (1) Message in channel → pending change appears with status `pending`. (2) Confirm → status `confirmed`, Salesforce/Sage updated, audit log has entry. (3) Confirm when SF is down → status `failed`, user sees REMOTE_API_ERROR message; retry after fix succeeds.

---

## 3. Custom reports

| Gap | Risk | What to add |
|-----|------|-------------|
| **Prompt → report mapping** | Builders will hardcode or over-engineer. | Define: **catalog of report types** for V1. For each: canonical prompt/keyphrase, underlying query or API, and required filters. Add “Report type catalog” to custom-reports spec. |
| **Filter semantics and defaults** | No default values or combine rules. | Specify: default filter values (e.g. “this quarter” for date); how multiple filters combine (AND); behavior when a filter has no selection (all vs none). Add “Filter semantics” to custom-reports spec. |
| **CSV export shape** | Columns and ordering undefined. | Define: for each report type, which columns and in what order; whether export matches on-screen table or a separate layout. |

### 3.1 Custom reports – Rigor add-ons

- **Contract (run report):** Input = `report_type_id` or prompt key, `filters` (key–value). Output success = `{ columns: string[], rows: object[], total: number }`. Output failure = `UNKNOWN_REPORT_TYPE`, `VALIDATION_ERROR` (invalid filter value), `QUERY_TIMEOUT` or `REMOTE_ERROR`.
- **Limits:** Max rows returned in UI (e.g. 1000); “Export CSV” may allow more with a warning (e.g. “Exporting 5k rows”). Timeout for report query (e.g. 15s).
- **Acceptance criteria (testable):** (1) Select “Pipeline by stage” + date “This quarter” → table has columns [stage, count, amount] and rows per stage. (2) Invalid date range → VALIDATION_ERROR. (3) Export CSV → file columns match spec for that report type.

---

## 4. Network search (prospect dashboard)

| Gap | Risk | What to add |
|-----|------|-------------|
| **LinkedIn CSV schema** | No concrete mapping; parser will guess. | Document: **expected LinkedIn export columns** and fallbacks when missing. Optionally: sample anonymized header. Add to network-search spec or “Data sources” doc. |
| **Prospect list schema** | No minimum required set. | Define: **minimum columns** for a prospect list; how wealth_tier is inferred when missing (default “unknown”). Add to network-search spec. |
| **Dedupe and re-upload** | Merge key and overwrite behavior not decided. | Decide: merge key (e.g. email, or name+company); overwrite vs new version. Document in network-search spec. |

### 4.1 Network search – Rigor add-ons

- **Contract (match run):** Input = LinkedIn CSV + prospect list CSV (or references). Output success = `{ match_count: number, matches: { id, composite_score, ... }[] }`. Output failure = `MISSING_REQUIRED_COLUMN`, `PARSE_ERROR` (with row/line), `TOO_MANY_ROWS` if limit defined.
- **Invariants:** Every NetworkMatch has a valid `linkedin_contact_id` that exists in the imported Contact set; `composite_score` in [0, 100].
- **Acceptance criteria (testable):** (1) Two CSVs with overlapping names → match_count &gt; 0, matches have composite_score. (2) LinkedIn CSV missing “First Name” → PARSE_ERROR or graceful fallback (document which).

---

## 5. Data model and cross-system alignment

| Gap | Risk | What to add |
|-----|------|-------------|
| **Stage enum alignment** | PRD vs prospect-dashboard vs Salesforce diverge; sync bugs. | Publish **single source of truth** for pipeline stages and mapping to Salesforce. Add to data-model or “Stage mapping” section. |
| **ID authority (Salesforce vs local)** | When to use SF ID vs local ID is undefined. | Define: create in Bedrock first → local ID until synced, then store SF ID; display join by SF ID when present. One-page “ID and sync rules.” |
| **Lead: Bedrock vs learning platform** | Storage model for fundraising vs admissions lead not decided. | Decide: same table with `domain` or separate tables. Document in learning-platform-integration or data-model. |

### 5.1 Data model – Rigor add-ons

- **Invariants (canonical list):** Document in data-model or a short “Invariants” section. Examples: Lead.contact_id → Contact.id; Opportunity.account_id → Account.id; PendingChange in status applied → resolved_at, resolved_by set. Any Opportunity with stage closed-won has amount_confirmed set (or explicit exception).
- **Required-by-context matrix:** Table: [Flow × Field] = required yes/no. Flows: “Create opportunity (UI),” “Convert lead to opportunity,” “Slack apply (opportunity),” “Slack apply (payment),” “Create lead.” Prevents “required in DB but not collected in UI.”

---

## 6. Cross-cutting: validation and errors

| Gap | Risk | What to add |
|-----|------|-------------|
| **Field-level validation** | No single place for rules (email, amount, dates). | Add **validation rules** to data-model or shared “Validation” doc: per-entity, per-field rules. Reference from week-1, Slack apply, forms. |
| **User-visible error messages** | Copy will be ad hoc. | Define: **error message policy** (validation vs API vs internal); never expose stack traces. Optional: list of common messages. |
| **Required vs optional by context** | Required in DB but not in UI causes bugs. | Per-flow required fields (see 5.1 Required-by-context matrix). |

### 6.1 Error taxonomy (stable codes)

- Use a **single set of error codes** across features so UI and logs are consistent. Suggested minimum: `VALIDATION_ERROR`, `ENTITY_NOT_FOUND`, `DUPLICATE`, `REMOTE_API_ERROR`, `TIMEOUT`, `FILE_TOO_LARGE`, `TOO_MANY_ROWS`, `UNAUTHORIZED`. Each code has a **user-facing message template** (e.g. REMOTE_API_ERROR → “We couldn’t update the external system. Please try again or contact support.”). Document in “Validation and errors” or a short “Error handling” doc.

---

## 7. Prioritization for implementation

**Fix first (blocks clean week 1 and Slack):**
- Week 1: prospect↔grant link, “this week” definition, CSV column mapping and validation.
- Slack: entity resolution, pending change schema and state machine, which channel/trigger.

**Fix before scaling (prevents rework):**
- Stage enum alignment; ID authority (Salesforce vs local).
- Custom reports: report type catalog and filter semantics.
- Error taxonomy and validation rules (shared).

**Fix before merge with learning platform:**
- Lead storage (fundraising vs admissions); shared validation/error policy where applicable.

---

## How to use

**Product:** Turn “What to add” into decisions in the referenced specs; add rigor add-ons (contract, invariants, acceptance criteria) there. **Engineering:** Before implementing, resolve gaps in this doc and spec; implement to contract; assert invariants in tests; add logging; enforce limits. **Review:** “Ready for build” = table rows addressed + contract/invariants in spec + ≥1 testable acceptance criterion per main path.
