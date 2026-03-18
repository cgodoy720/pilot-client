---
type: feature-spec
id: spec-opportunity-pipeline
status: draft
phase: 1
depends_on: ["[[data-model]]"]
---

# Opportunity Pipeline Dashboard

## What it does

A visual Kanban board of all active fundraising opportunities across Pursuit's nonprofit and PBC (Public Benefit Corporation). This is the team's primary view for understanding pipeline state at a glance.

## User stories

- As JP, I need to see all active opportunities organized by stage so I can prioritize my week
- As Nick, I need a quick snapshot of total pipeline value and where deals stand so I can make strategic calls
- As a team member, I need to update an opportunity's stage by dragging it between columns so tracking stays current with minimal friction

## Requirements

**Kanban board:**
- Configurable stages: Identified → Qualified → Proposal Sent → In Negotiation → Verbal Commit → Closed Won / Closed Lost
- Drag-and-drop between stages (dnd-kit)
- **Stage-change checkpoints:** Before applying a stage change, enforce checkpoints per `product/fundraising-team/phases/stage-change-checkpoints-and-rules.md` (e.g. Closed Won requires amount_confirmed); block or warn and log in edit history
- Distinguish nonprofit donations from PBC contracts visually (color or badge)

**Opportunity cards display:**
- Account name
- Primary contact name
- Estimated amount
- Expected close date
- Assigned team member
- Revenue stream (nonprofit / PBC)
- Current stage

**Summary statistics bar:**
- Total pipeline value
- Weighted pipeline (by stage probability)
- Count by stage
- Average days in current stage

**Opportunity detail view (click-through from card):**
- All card fields plus: activity history, associated tasks, notes, linked contacts
- Edit capability for all fields
- Activity logging: add notes, log calls/emails/meetings (Phase 2)

**Filtering:**
- Revenue stream (nonprofit / PBC / all)
- Team member assignment
- Stage
- Expected close date range
- Amount range

## Data model dependencies

Uses from [[data-model]]:
- `Opportunity` entity (primary)
- `Account` entity (linked via account_id)
- `Contact` entity (linked via primary_contact_id)
- `Task` entity (linked via opportunity_id)
- `Activity` entity (linked via opportunity_id, Phase 2)

## UI/UX

- Kanban columns are horizontally scrollable on smaller screens
- Cards are compact by default, expandable on hover or click
- Stage probability is configurable (Identified = 10%, Qualified = 25%, Proposal Sent = 50%, In Negotiation = 75%, Verbal Commit = 90%)
- Closed Won / Closed Lost are collapsed/archived by default

## Exit criteria

- [ ] Kanban board renders with mock data showing all stages
- [ ] Drag-and-drop between stages works and persists to IndexedDB
- [ ] Card displays all required fields
- [ ] Click-through to detail view works
- [ ] Summary stats bar calculates correctly
- [ ] Filtering works for revenue stream and stage (minimum)
- [ ] Data persists across browser sessions

## Open questions

- Should we support multiple contacts per opportunity (vs. single primary)?
- Do we need a "probability override" per opportunity, or always use stage defaults?
