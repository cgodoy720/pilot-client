# PRD 10 — Unified Home Page

> Version: 0.1 | Status: Draft | Date: 2026-03-16
> Author: Jac (with Claude)

---

## Purpose

Give each fundraising team member a single screen that answers: "What should I focus on right now?" The home page surfaces the user's upcoming meetings, tasks grouped by parent opportunity/prospect, and top-priority deals — replacing the current MyDashboard's sprawling list view with a scannable, calendar-driven layout.

Serves **Core Job #3:** "Tell us what to do this week and remember why we decided it."

---

## Scope

**In scope:**
- GCal-style calendar view for This Week + Next Week (14-day fixed window)
- Tasks grouped under their parent Opportunity or Prospect (not standalone)
- Scoped to the current user's data only (my opps, my tasks, my calendar)
- Top-N priority prospects ranked by weighted formula
- Stale opportunity flagging (no activity or stage change in 30 days)
- Action items: tasks due soon, close dates approaching

**Out of scope:**
- Team-wide task view (each user sees only their own)
- Month/quarter time windows (removed — fixed to 14 days)
- Automation review queue (defer to post-MVP)
- Active Comms / Inactive Comms sections from `home-page-spec.md` (defer)
- Kanban or drag-drop on home
- Slack/Fireflies activity feed (already exists in current dashboard — keep as-is or defer)

---

## User Stories

- As a partnerships IC, I need to see my meetings for this week and next week in a calendar layout so I can prepare for upcoming funder conversations.
- As a partnerships IC, I need my tasks displayed under their parent Opportunity so I have context for why each task matters.
- As a partnerships IC, I need to see which of my deals are highest priority so I know where to focus outreach.
- As a partnerships IC, I need stale opportunities flagged so nothing falls through the cracks.
- As the CEO, I need to glance at the home page and know what the team's top priorities are this week.

---

## Data Requirements

**Entities touched:**
- Opportunity (user's open opps — `assigned_to` or SF `OwnerId`)
- Task (linked to Opportunity via `opportunity_id` or Prospect via `prospect_id`)
- Google Calendar events (via existing `/api/calendar/` endpoints)
- Account (for display names on calendar events and opp cards)
- Contact (for calendar event matching)

**Key fields:**
- Opportunity: `name`, `account_id`, `stage`, `amount_estimated`, `probability`, `expected_close_date`, `assigned_to`, `revenue_stream`
- Task: `title`, `due_date`, `priority`, `status`, `opportunity_id`, `prospect_id`, `assigned_to`
- Calendar event: `summary`, `start`, `end`, `attendees`

**Reference:** `product/crm-architecture/entity-map.md`

---

## Functional Requirements

### Calendar View

1. The system must display a GCal-style calendar for This Week + Next Week (14 calendar days from Monday of the current week).
2. The system must show Google Calendar events that match Account names, Contact emails, or Opportunity names (keyword matching against SF data).
3. The system must show Salesforce Tasks with `due_date` in the 14-day window, placed on their due date.
4. Calendar events must link to their matched Opportunity or Account when a match exists.
5. The range selector must offer Day / Week / 2 Weeks views (no Month).

### Tasks (Grouped by Parent)

6. The system must display the current user's open tasks grouped under their parent Opportunity or Prospect.
7. Each Opportunity/Prospect group must show: name, account, stage, and its child tasks sorted by `due_date`.
8. Tasks without a parent Opportunity or Prospect must appear in an "Ungrouped" section.
9. Overdue tasks (past `due_date`, not completed/cancelled) must be visually flagged.

### Top Prospects

10. The system must display the user's top N open Opportunities ranked by priority score.
11. Priority formula: `score = Amount × (Probability / 100) × (1 + log10(1 + Amount / 1,000,000))`.
12. Exclude opportunities with `Probability < 15%`.
13. N must be user-configurable: 5, 10, or 25 (default 10), persisted in localStorage.

### Stale Detection

14. The system must flag opportunities with no Activity AND no stage change in the last 30 days as "stale."
15. Stale opportunities must appear with a visual indicator in both Top Prospects and Task groupings.

### Action Items

16. The system must surface a consolidated action items section: tasks due within 7 days + opportunities closing within 14 days.

---

## Non-Functional Requirements

- **Performance:** Page must load in <2s. Single batch of API calls on mount — no N+1 queries per account.
- **Security:** Only show current user's opportunities and tasks. Respect `assigned_to` / `OwnerId` filtering.
- **Reliability:** Gracefully degrade if Google Calendar API is unavailable (show SF tasks only).
- **Scale limits:** Designed for 4-6 concurrent users, <500 total opportunities.

---

## Integration Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| PRD 01 (Data Model) | Soft | Can use SF schema directly for MVP |
| PRD 03 (Opportunity Management) | Soft | Home reads from same opp data; doesn't need PRD 03 features |
| Google Calendar API | Hard | Existing `/api/calendar/` endpoints |
| Salesforce Tasks | Hard | Need `GET /api/salesforce/my-tasks?start=&end=` endpoint (new) |

---

## Open Questions

1. Should home show AIJI-only or all Pursuit opportunities?
2. Priority formula from `home-page-spec.md` — still use, or just sort by due date?
3. What pipeline summary metrics (if any) should remain on home? (Current: count, total, weighted)
4. Keep existing "Recent Activity" feed (Slack/Gmail/Calendar/Fireflies) or remove for simplicity?
5. CSV import (from WeeklyPriorities.tsx) — fold into home page or keep as separate utility?

---

## Acceptance Criteria

### Positive scenarios
- Given I am logged in, when I navigate to `/home`, then I see a calendar view showing my meetings and tasks for the next 14 days.
- Given I have 3 opportunities with tasks, when I view the tasks section, then tasks are grouped under their parent opportunity with the opportunity name, account, and stage visible.
- Given I have 15 open opportunities, when I view top prospects with N=10, then I see exactly 10 opportunities sorted by the priority formula.
- Given one of my opportunities has had no activity for 35 days, when I view home, then that opportunity is flagged as stale.

### Negative scenarios
- Given I am logged in as User A, when I view home, then I do not see User B's tasks or opportunities.
- Given Google Calendar is unreachable, when I load home, then the calendar section shows SF tasks and a "Calendar unavailable" message — the rest of the page works normally.

### Data invariants
- Tasks always appear under exactly one parent (Opportunity, Prospect, or Ungrouped).
- Priority scores are always non-negative.
- The 14-day window always starts from Monday of the current week.

---

## Existing Code to Enhance

| File | What exists | What changes |
|------|------------|-------------|
| `MyDashboard.tsx` (662 lines) | 5 collapsible sections, time-window toggle, pipeline metrics, activity feed | Replace list layout with calendar view; regroup tasks under parents; add priority formula |
| `useOpportunityData` hook | Fetches all opps from SF | Filter to current user; add stale computation |
| `/api/calendar/account-activity/` | Calendar events per account | Need new endpoint: `/api/salesforce/my-tasks?start=&end=` |
| `WeeklyPriorities.tsx` (435 lines) | CSV import → priority list, redirects to `/home` | Evaluate: fold CSV import into home or keep separate |

---

## Feature Register Mapping

F09 (Weekly priorities view), F12 (Task CRUD — read portion), F13 (Task notifications — stale/overdue flags), F06 (Stale detection on home)
