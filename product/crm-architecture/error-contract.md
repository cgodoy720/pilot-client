# Pursuit CRM (Bedrock) — Error Contract

> Version: 1.0 | Date: 2026-03-15
>
> Defines error codes, validation rules, and partial failure behavior.
> Every feature must use these conventions — no ad-hoc error handling.

---

## Error Response Shape

All errors in Bedrock (API responses, import results, sync results) use this shape:

```typescript
interface BedrockError {
  code: string;          // Stable, machine-readable (see table below)
  message: string;       // Human-readable, safe to display in UI
  field?: string;        // Which field caused the error (for validation errors)
  entity?: string;       // Which entity type (e.g., "opportunity", "contact")
  entity_id?: string;    // Which specific record, if applicable
  details?: Record<string, unknown>; // Additional context (never PII)
}

interface BedrockResult<T> {
  success: boolean;
  data?: T;              // Present when success = true
  errors?: BedrockError[]; // Present when success = false OR partial success
  warnings?: BedrockError[]; // Non-fatal issues (e.g., "field truncated")
}
```

---

## Error Codes

### Validation Errors (client can fix)

| Code | When | Example Message |
|------|------|-----------------|
| `REQUIRED_FIELD_MISSING` | A required field is null/empty | "Contact last_name is required" |
| `INVALID_ENUM_VALUE` | Value not in allowed enum | "Stage 'pending' is not valid. Expected: identified, qualified, ..." |
| `INVALID_FORMAT` | Value doesn't match expected format | "Email 'not-an-email' is not a valid email address" |
| `INVALID_DATE` | Date is unparseable or nonsensical | "expected_close_date '2026-13-45' is not a valid date" |
| `REFERENCE_NOT_FOUND` | Foreign key points to nonexistent record | "Account 'acct-nonexistent' does not exist" |
| `DUPLICATE_DETECTED` | Record likely duplicates an existing one | "Contact 'Sarah Chen' at 'Goldman Sachs' may duplicate contact-sarah-chen" |
| `CONSTRAINT_VIOLATION` | Business rule violated | "Payment total ($350,000) exceeds opportunity amount_confirmed ($300,000)" |
| `FILE_TOO_LARGE` | Import file exceeds size limit | "CSV file exceeds 5 MB limit" |
| `ROW_LIMIT_EXCEEDED` | Import file exceeds row limit | "CSV contains 15,000 rows; maximum is 10,000" |
| `MISSING_REQUIRED_COLUMN` | CSV import missing required column | "CSV must contain at least one of: 'name', 'first_name'+'last_name'" |

### System Errors (client cannot fix)

| Code | When | Example Message |
|------|------|-----------------|
| `SALESFORCE_SYNC_FAILED` | Salesforce API call failed | "Failed to sync opportunity to Salesforce. Will retry." |
| `SAGE_SYNC_FAILED` | Sage Intacct API call failed | "Failed to create invoice in Sage. Will retry." |
| `EXTERNAL_API_ERROR` | Any external API returned an error | "Salesforce returned: INVALID_FIELD_FOR_INSERT_UPDATE" |
| `INTERNAL_ERROR` | Unexpected server error | "An unexpected error occurred. Please try again." |
| `RATE_LIMITED` | External API rate limit hit | "Salesforce API rate limit reached. Retrying in 60 seconds." |

> **Rate limit handling:** On `RATE_LIMITED`, the server queues the operation for retry after 60 seconds. The client should not retry independently — display the message and wait for the queued retry to complete.

### Authorization Errors

| Code | When | Example Message |
|------|------|-----------------|
| `UNAUTHORIZED` | User not authenticated | "Please log in to continue" |
| `FORBIDDEN` | User lacks permission for this action | "Finance role cannot edit opportunities" |

---

## Validation Rules by Entity

### Opportunity

| Field | Rule | Error Code |
|-------|------|-----------|
| `name` | Required, non-empty | `REQUIRED_FIELD_MISSING` |
| `account_id` | Required, must reference existing Account | `REQUIRED_FIELD_MISSING` / `REFERENCE_NOT_FOUND` |
| `primary_contact_id` | Required, must reference existing Contact | `REQUIRED_FIELD_MISSING` / `REFERENCE_NOT_FOUND` |
| `stage` | Required, must be in canonical stage enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| `revenue_stream` | Required, must be `nonprofit` or `pbc` | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| `assigned_to` | Required | `REQUIRED_FIELD_MISSING` |
| `amount_estimated` | If present, must be ≥ 0 | `CONSTRAINT_VIOLATION` |
| `expected_close_date` | If present, must be valid date | `INVALID_DATE` |
| `probability` | If present, must be 0–100 | `CONSTRAINT_VIOLATION` |

### Contact

| Field | Rule | Error Code |
|-------|------|-----------|
| `first_name` | Required | `REQUIRED_FIELD_MISSING` |
| `last_name` | Required | `REQUIRED_FIELD_MISSING` |
| `email` | If present, must be valid email format | `INVALID_FORMAT` |
| `source` | Required, must be in source enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| (first_name + last_name + organization) | Warn if matches existing Contact | `DUPLICATE_DETECTED` (warning, not blocking) |

### Account

| Field | Rule | Error Code |
|-------|------|-----------|
| `name` | Required, non-empty | `REQUIRED_FIELD_MISSING` |
| `type` | Required, must be in type enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| `name` | Warn if matches existing Account name (fuzzy, >90% similarity) | `DUPLICATE_DETECTED` (warning) |

### Payment

| Field | Rule | Error Code |
|-------|------|-----------|
| `opportunity_id` | Required, must reference existing Opportunity | `REQUIRED_FIELD_MISSING` / `REFERENCE_NOT_FOUND` |
| `amount` | Required, must be > 0 | `REQUIRED_FIELD_MISSING` / `CONSTRAINT_VIOLATION` |
| `expected_date` | Required, must be valid date | `REQUIRED_FIELD_MISSING` / `INVALID_DATE` |
| `status` | Required, must be in payment status enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| Sum of all Payments on an Opportunity | Must not exceed `amount_confirmed` | `CONSTRAINT_VIOLATION` |

### Prospect

| Field | Rule | Error Code |
|-------|------|-----------|
| `contact_id` | Required, must reference existing Contact | `REQUIRED_FIELD_MISSING` / `REFERENCE_NOT_FOUND` |
| `source` | Required, must be in prospect source enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| `status` | Required, must be in prospect status enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| One active Prospect per Contact | Only one Prospect with status ∉ {`converted`, `archived`} per Contact | `CONSTRAINT_VIOLATION` |

### Task

| Field | Rule | Error Code |
|-------|------|-----------|
| `title` | Required | `REQUIRED_FIELD_MISSING` |
| `due_date` | Required, valid date | `REQUIRED_FIELD_MISSING` / `INVALID_DATE` |
| `assigned_to` | Required | `REQUIRED_FIELD_MISSING` |
| `type` | Required, must be in task type enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| `status` | Required, must be in task status enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| `opportunity_id` + `prospect_id` | At most one may be set (not both) | `CONSTRAINT_VIOLATION` |

### Grant Requirements

| Field | Rule | Error Code |
|-------|------|-----------|
| `opportunity_id` | Required, must reference nonprofit Opportunity | `REQUIRED_FIELD_MISSING` / `REFERENCE_NOT_FOUND` / `CONSTRAINT_VIOLATION` (if PBC) |
| `grant_start_date` | Required, valid date | `REQUIRED_FIELD_MISSING` / `INVALID_DATE` |
| `grant_end_date` | Required, valid date, must be after `grant_start_date` | `REQUIRED_FIELD_MISSING` / `INVALID_DATE` / `CONSTRAINT_VIOLATION` |
| One GrantRequirements per Opportunity | At most one record per Opportunity | `CONSTRAINT_VIOLATION` |

### Decision

| Field | Rule | Error Code |
|-------|------|-----------|
| `rationale` | Required, non-empty | `REQUIRED_FIELD_MISSING` |
| `made_by` | Required | `REQUIRED_FIELD_MISSING` |
| `type` | Required, must be in decision type enum | `REQUIRED_FIELD_MISSING` / `INVALID_ENUM_VALUE` |
| At least one reference | At least one of `contact_id`, `prospect_id`, `opportunity_id` must be set | `CONSTRAINT_VIOLATION` |

---

## Partial Failure Behavior

### CSV Import

CSV imports allow **partial success**. The result shape:

```typescript
interface ImportResult {
  success: boolean;          // true if at least 1 row imported
  imported_count: number;    // rows successfully created
  skipped_count: number;     // empty rows skipped
  error_count: number;       // rows that failed validation
  errors: Array<{
    row: number;             // 1-indexed row number in CSV
    code: string;            // error code from table above
    message: string;
    field?: string;
  }>;
  warnings: Array<{
    row: number;
    code: string;
    message: string;
  }>;
}
```

Rules:
1. **Never fail the entire import** because of individual row errors. Process all rows; collect errors.
2. **Empty rows** are silently skipped (not counted as errors).
3. **Duplicate warnings** (DUPLICATE_DETECTED) do not block import — the row is imported, and a warning is surfaced for human review.
4. **Missing required columns** (MISSING_REQUIRED_COLUMN) fail the entire import — no rows are processed.
5. **File limits** (FILE_TOO_LARGE, ROW_LIMIT_EXCEEDED) fail the entire import before parsing.

### Salesforce Sync

1. **Per-record failure.** If syncing 10 Opportunities and 1 fails, the other 9 succeed. The failed record is logged and queued for retry.
2. **Retry policy.** Up to 3 automatic retries with exponential backoff (2s, 4s, 8s). After 3 failures, record enters error queue for manual review.
3. **Conflict resolution.** Salesforce wins on field-level conflicts. If Bedrock and SF both modified the same field since last sync, SF value overwrites Bedrock.

### Sage Sync (Phase 2)

Same per-record failure and retry policy as Salesforce. Sage wins on payment data.

---

## What This Contract Does NOT Cover

- **UI error display patterns** (toasts, inline, modal) — defined per-component in PRDs.
- **Logging format** — defined in engineering docs, not product architecture.
- **PII in error messages** — three rules:
  1. **Never include** donor financial details, wealth tier, or composite scores in any error message.
  2. **User-facing validation** (shown only to the user who entered the data): names and emails are acceptable. Example: "Contact 'Sarah Chen' may duplicate an existing record."
  3. **Shared contexts** (admin dashboards, sync logs, audit trails, error queues visible to other users): use entity IDs only, never names or emails. Example: "Sync failed for contact-sarah-chen" — not "Sync failed for Sarah Chen (sarah@example.com)".
