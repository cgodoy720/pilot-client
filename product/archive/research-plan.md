# Research — Planning Doc for Re-enabling

**Status:** Archived (hidden from MVP nav). Pebble preview in Phase 2.

## Current State

- **Route:** `/research`
- **Features:** Giving capacity, network map, prospect intelligence
- **Alignment:** Pebble Phase 2 (prospect dashboard, network search)

## Dependencies

- `product/fundraising-team/raw-prds/prospect-dashboard/` — vision and specs
- Feature Register: F14–F18 (Prospect tracker, conversion, network search, scoring, AI intelligence)
- Anthropic/Claude API for enrichment

## Integration Points

- Salesforce Contacts, Accounts
- CSV import (prospect list)
- LinkedIn CSV × prospect fuzzy match (F16)
- Calendar account-activity (PBD calendar)

## Security

- Prospect data may include PII; access control and audit
- API keys for Anthropic; no keys in frontend

## Acceptance Criteria for Wiring In

- [ ] Nav item visible when phase allows
- [ ] Giving capacity view loads
- [ ] Network map / search functional
- [ ] Pebble Phase 2 alignment documented
