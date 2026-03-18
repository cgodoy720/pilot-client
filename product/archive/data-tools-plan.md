# Data Tools — Planning Doc for Re-enabling

**Status:** Archived (hidden from MVP nav).

## Current State

- **Route:** `/data-tools`
- **Scope:** Cleanup tools, data migration, bulk operations

## Dependencies

- Salesforce/Sage API access
- Admin or power-user role (access control)
- Clear use cases for each tool

## Integration Points

- Salesforce (bulk update, cleanup)
- Sage Intacct (reconciliation, sync)
- CSV import/export

## Security

- **Access control:** Restrict to admin or designated roles
- Audit logging for bulk changes
- No PII leakage in logs

## Acceptance Criteria for Wiring In

- [ ] Access control implemented
- [ ] Nav item visible when phase allows (and user has permission)
- [ ] Each tool has defined scope and safety checks
- [ ] Audit trail for destructive operations
