# Sprint Backlog: Salesforce Required Fields Audit

**Added**: 2026-03-24
**Priority**: Medium
**Context**: During design consultation session, JP noted uncertainty about which Salesforce fields are required vs optional. Close Date may be required in their SF org but we haven't validated this in the frontend.

## Scope
- [ ] Audit Pursuit's Salesforce org for required fields on Opportunity, Task, Contact, Account
- [ ] Compare against frontend validation — are we enforcing the same requirements?
- [ ] Add frontend validation for any required fields we're not checking
- [ ] Document findings in `product/reference/`
