---
type: feature-spec
id: spec-calendar-tasks
status: draft
phase: 1
depends_on: ["[[data-model]]", "[[opportunity-pipeline]]", "[[leads-tracker]]"]
---

# Calendar & Task Management

## What it does

A calendar interface showing all tasks and deadlines associated with opportunities and leads. This is how the team tracks follow-ups, proposal deadlines, meetings, and stewardship touchpoints across the entire pipeline.

## User stories

- As JP, I need to see all my upcoming deadlines in one view so nothing falls through the cracks
- As a team member, I need to create a follow-up task directly from an opportunity so it's linked automatically
- As Nick, I need to see overdue items so I know where the team needs to focus

## Requirements

**Calendar views:**
- Monthly, weekly, and daily views (FullCalendar)
- Tasks displayed on their due dates

**Color coding (user-selectable mode):**
- By opportunity stage
- By team member assignment
- By priority level (high / medium / low)

**Task types:**
- Follow-up call/email
- Proposal draft due
- Meeting scheduled
- Deliverable deadline
- Internal review
- Thank you / stewardship touchpoint

**Task fields:**
- Title, description, type, due date, priority, assigned team member, status
- Linked to parent opportunity and/or lead (via opportunity_id, lead_id)

**Task creation:**
- From calendar view (click a date → create task)
- From opportunity detail page (create task linked to that opportunity)
- From leads tracker (create task linked to that lead)

**Overdue handling:**
- Visual highlighting for overdue tasks (red)
- Notification-ready flag (for future Slack integration — store as boolean, no Slack in prototype)

**Not in Phase 1:**
- iCal export or Google Calendar sync (Phase 2)
- Recurring tasks (Phase 3)
- Task templates (Phase 3)

## Data model dependencies

Uses from [[data-model]]:
- `Task` entity (primary)
- `Opportunity` entity (linked via opportunity_id)
- `Lead` entity (linked via lead_id)

## UI/UX

- Default view: weekly, current week
- Clicking a task opens a detail panel (not a full page navigation)
- Task completion: checkbox or status toggle, completed tasks gray out
- Today's line clearly marked on calendar

## Exit criteria

- [ ] Monthly and weekly calendar views render with mock data
- [ ] Tasks appear on correct dates with color coding
- [ ] Task creation works from calendar, opportunity detail, and leads tracker
- [ ] Task edit/complete works and persists to IndexedDB
- [ ] Overdue tasks are visually highlighted
- [ ] Each task links back to its parent opportunity or lead

## Open questions

- Do we need a standalone task list view (non-calendar) for people who prefer lists?
- Should task priority default to the parent opportunity's stage/amount, or always be manual?
