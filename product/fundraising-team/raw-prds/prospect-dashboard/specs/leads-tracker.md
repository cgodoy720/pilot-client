---
type: feature-spec
id: spec-leads-tracker
status: draft
phase: 1
depends_on: ["[[data-model]]", "[[opportunity-pipeline]]"]
---

# Leads Tracker

## What it does

A dedicated view for inbound and outbound leads that have not yet been qualified into the opportunity pipeline. Leads are the entry point for new prospects — they start here and graduate to opportunities when qualified.

## User stories

- As JP, I need to quickly log a new lead after a meeting or event so it doesn't fall through the cracks
- As a team member, I need to see all my assigned leads and their status so I know who to follow up with
- As JP, I need to convert a qualified lead into an opportunity with one click so the pipeline stays accurate

## Requirements

**Table/list view:**
- Columns: name, organization, source, date added, assigned team member, status, initial notes
- Source types: inbound referral, event, cold outreach, network search hit, other
- Status flow: New → Contacted → Qualifying → Converted to Opportunity / Archived
- Sortable by any column
- Filterable by status, source, assigned team member, date range

**Quick-add form:**
- Minimal required fields: name, organization, source
- Optional fields: contact info, notes, assigned team member
- Should feel fast — modal or inline, not a full-page form

**Convert to Opportunity:**
- One-click action from lead row or detail view
- Pre-populates opportunity fields from lead data (contact, organization, source)
- Prompts for: estimated amount, expected close date, revenue stream, stage
- On conversion: lead status changes to "Converted", links to new opportunity via opportunity_id

**Lead scoring (Phase 2):**
- Composite score based on: network proximity, estimated giving capacity, engagement signals
- Visual indicator (e.g., color dot or score badge) on each lead row
- Scoring algorithm details in [[network-search]] spec

## Data model dependencies

Uses from [[data-model]]:
- `Lead` entity (primary)
- `Contact` entity (linked via contact_id)
- `Opportunity` entity (created on conversion)

## UI/UX

- Default sort: most recently added first
- Archived leads hidden by default, accessible via filter
- Converted leads show a link to their opportunity
- Batch operations (Phase 2): select multiple leads, bulk archive, bulk assign

## Exit criteria

- [ ] Table renders with mock data
- [ ] Sorting and filtering work
- [ ] Quick-add form creates a new lead and persists to IndexedDB
- [ ] Convert to Opportunity creates a linked opportunity record
- [ ] Lead status updates persist

## Open questions

- Do we need a lead detail view, or is the table row + expand sufficient for Phase 1?
- Should "network search hit" leads auto-populate from the Network Search feature?
