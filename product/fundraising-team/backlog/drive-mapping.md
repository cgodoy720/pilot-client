# Google Drive Mapping for Salesforce Objects

## Summary

Map Google Drive folders and files to Accounts, Contacts, Opportunities, and Prospects in Salesforce so the team can quickly find relevant documents without manually searching Drive.

## How It Works

1. **Suggest**: When a user opens an Account/Contact/Opportunity/Prospect, the system searches Drive for folders and files that match by name, related keywords, or past associations.
2. **Confirm**: The user reviews suggested links and confirms which ones should be saved to that Salesforce object (stored as a custom field or related list).
3. **Learn**: Each confirmation (or rejection) improves future recommendation quality — the system tracks what matched well and adjusts its heuristics.

## Objects to Support

- **Accounts** — funder organization folders, grant agreements, financial docs
- **Contacts** — individual correspondence, meeting notes, CVs
- **Opportunities** — proposals, budgets, signed contracts, payment schedules
- **Prospects** — research docs, outreach drafts, LinkedIn exports

## Open Questions

- Should we store Drive links as a Salesforce custom field (simple) or a related list (richer metadata)?
- How do we handle permissions — should the app verify the user has Drive access to each suggested file?
- What's the matching strategy: name similarity, folder hierarchy, or content-based?

## Priority

Backlog — to be scheduled after core pipeline and payment tracking are stable.
