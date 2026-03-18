# Projects — Planning Doc for Re-enabling

**Status:** Archived (hidden from MVP nav).

## Current State

- **Route:** `/projects`
- **Scope:** TBD — project tracking, grant projects, or internal initiatives

## Dependencies

- Clarify scope: grant projects vs. internal projects vs. campaigns
- Entity model: Project, link to Opportunity/Account
- Feature Register: check for Project-related features

## Integration Points

- Salesforce (if Project object exists)
- Opportunities, Accounts
- Possibly Campaign (F32, F33)

## Security

- Standard auth; scope-based visibility if projects are team-specific

## Acceptance Criteria for Wiring In

- [ ] Scope defined and documented
- [ ] Nav item visible when phase allows
- [ ] Data model and API designed
- [ ] Page functional for defined scope
