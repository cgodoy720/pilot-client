# Projects-Salesforce Integration Roadmap

## Vision
Connect project tasks to Salesforce Tasks **only** when there's a relevant Partnership or Opportunity to link to. Not a blanket sync — targeted, manual linking.

## When to Link
- A project milestone relates to a specific Salesforce Opportunity (e.g., "Anchor Investor Commitment" milestone -> Opportunity record)
- A project task tracks action items for a deal (e.g., "Send LOI to Blackstone" -> Salesforce Task linked to the Blackstone Opportunity via `WhatId`)

## Data Model Changes
```sql
ALTER TABLE project_task ADD COLUMN salesforce_task_id TEXT;
ALTER TABLE milestone ADD COLUMN salesforce_opportunity_id TEXT;
```

## Sync Behavior
- **Manual linking**: User selects a Salesforce Opportunity/Task to link (no auto-sync)
- **Status sync**: When project task status changes -> update linked Salesforce Task status
- **Bidirectional (optional)**: Salesforce task updates could reflect back via webhook or polling
- **Guard rails**: Only show "Link to Salesforce" when a matching Opportunity/Account exists

## Existing Infrastructure to Reuse
- Salesforce Task CRUD: `simple_server.py` (`/api/salesforce/my-tasks`, `/api/salesforce/opportunities/{id}/tasks`)
- Opportunity data already flows through the Dashboard
- Projects backend: `routes/projects.py` (full CRUD for projects/workstreams/milestones/tasks)
- DB schema: `db/init.sql` (project, workstream, milestone, project_task tables)

## Implementation Phases
1. **Schema migration**: Add `salesforce_task_id` and `salesforce_opportunity_id` columns
2. **Backend**: API endpoints to link/unlink project tasks <-> Salesforce Tasks
3. **Frontend**: "Link to Salesforce" UI in project task detail view
4. **Status sync**: Bidirectional status updates when linked
5. **Search/match**: Suggest relevant Opportunities when linking a milestone

## Related Documentation
- `product/crm-prds/README.md` — PRD #09 (Salesforce Migration & Sync) covers the broader sync strategy. This roadmap is a subset focused on Projects.
- `product/crm-architecture/entity-map.md` — Canonical schema for `project_task`, `milestone` tables.
- `tasks/pebble-evolution-roadmap.md` — Pebble Stage 3 also creates Salesforce Tasks (for renewals). Both should share the same Bedrock client API (`pebble/data_sources/bedrock_client.py`) to avoid duplication.
