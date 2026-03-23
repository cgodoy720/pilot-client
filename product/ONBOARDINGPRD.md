# Bedrock & Pebble: What We Built and What It Does for You

> Version: 0.1 | Date: 2026-03-23 | Author: JP
>
> A guide for the Pursuit fundraising team. No technical background required.
> Feedback welcome — this is a living document.

---

## Why This Exists

Right now, tracking Pursuit's fundraising pipeline means switching between Salesforce, spreadsheets, Slack, Google Calendar, and email — with no single place that shows the full picture. Assembling a pipeline status update takes an hour. Preparing for a funder meeting means 20 minutes of Googling. When someone asks "where does the money stand?" nobody has a fast answer.

Bedrock and Pebble exist to change that.

---

## What These Tools Are

**Bedrock** is Pursuit's fundraising command center. One place where every funder, every conversation, every dollar, and every deadline lives — so nothing falls through the cracks. It connects to Salesforce and Sage Intacct so data entered once appears everywhere. (Integration with Drive, Slack, and Fireflies coming soon.)

**Pebble** is an AI research assistant that lives inside Bedrock. Give it a name and organization, and it builds a sourced profile in under 30 seconds — pulling from public records, SEC filings, nonprofit databases, and news — so you walk into every meeting prepared.

*Bedrock organizes what you know. Pebble discovers what you don't.*

---

## What Changes for You

### For the Development Managers

| What you can do | Status |
|---|---|
| See your weekly priorities — deadlines, tasks, calendar, goal progress — in one view | Working today |
| Track every opportunity from first call to signed award, with filters by stage, owner, or close date | Working today |
| See Slack messages and Fireflies meeting notes for any account without hunting across apps | Working today |
| Post a pipeline update in Slack — Bedrock parses it, proposes the change, and you approve with one click | Working today (confirm-to-Salesforce being tested) |
| Upload a CSV prospect list, map columns, and score giving capacity | Working today |
| Get an AI-sourced research brief on any prospect in 30 seconds (Pebble) | Demo only at launch — JP runs it for you |

### For the AI Jobs Institute PM

| What you can do | Status |
|---|---|
| Manage AI Jobs Institute projects with Gantt charts, Kanban boards, milestones, and task dependencies | Working today |
| See how fundraising connects to your projects — view pipeline status for grants tied to your work | Working today |

### For the CEO

| What you can do | Status |
|---|---|
| See total pipeline, weighted pipeline, cash flow by quarter, and a stage funnel — in seconds | Working today |
| Filter by team member to see who owns what — their portfolio, tasks, and deadlines | Working today |
| Project the Dashboard during your existing pipeline meeting (no new meeting needed) | Recommended from Week 2 |
| Score and rank prospects by wealth tier, engagement, and institutional authority | Working today |

### For everyone

Every AI-proposed change (from Slack parsing or Pebble) goes into a review queue. Nothing writes to Salesforce without a human clicking "Approve." Your judgment stays in the loop — that's by design.

---

## What Works Today vs. What's Coming

### Working Now

- Weekly priorities view (deadlines, tasks, calendar, goal tracker — filterable by team member)
- Opportunity pipeline (create, edit, track stages)
- Accounts and contacts (search, create, link organizations to people)
- Salesforce connection (reads your data automatically; edits you make in Bedrock save back to Salesforce)
- Executive dashboard (pipeline funnel, cash flow projections, quarterly breakdown)
- Ownership visibility (every opportunity shows its owner; filter by team member)
- Task management (create, assign, track with due dates)
- Automation Review queue (Slack messages parsed into proposed CRM changes — approve or reject)
- Giving capacity scoring (prospect type inference + composite wealth score, computed on demand)
- Invoice matching (link Sage invoices to Salesforce opportunities)
- Payment schedule creation and tracking
- Network map (visualize LinkedIn and Salesforce connections)
- Project management (Gantt, Kanban, List, and Executive views with task dependencies)
- CSV prospect import and export
- Role-based permissions (different views for different roles)
- Activity feeds per account (Slack messages and Fireflies meeting notes)
- Pebble single-contact research *(demo only at launch — self-service after cost guardrails are added)*

### Coming Next
*(Design done, being built or tested)*

Manual activity entry form, stale deal flagging, decision audit trail (record why you pursued or passed), grant requirements capture, Sage invoice creation from Bedrock, full Slack-to-Salesforce write loop, Gmail activity integration

### On the Roadmap
*(Planned, not yet started)*

AI portfolio recommendations, Pebble bulk research, warm intro paths, live Pebble assistant, Kanban drag-and-drop pipeline, Google Calendar sync, duplicate detection, concentration risk alerts

---

## How Bedrock Fits With Your Current Tools

- **Salesforce:** Bedrock reads your Salesforce data automatically. When you edit an opportunity or contact in Bedrock, those changes save back to Salesforce. You can still open Salesforce anytime.
- **Sage Intacct:** You can view invoices, payments, and bills from Sage inside Bedrock. Full two-way integration is being tested. Sage stays the accounting system of record.
- **Slack:** Post in #pipeline-updates. Bedrock parses it, shows you what it understood, and waits for your approval before touching Salesforce. You still post in Slack — Bedrock just listens.
- **Calendar & Fireflies:** Meeting data is pulled into activity feeds per account. Your calendar and recordings stay where they are.

**What Bedrock replaces:** The spreadsheets. The tab-switching. The "ask someone who remembers" workflow.

**What Bedrock does NOT replace:** Email, your judgment about relationships, Salesforce (it's still underneath), Sage (still the financial system of record).

---

## How You'll Be Introduced

### Pre-Launch
JP seeds Bedrock with your actual Salesforce data — you'll see real opportunities, not a demo. Accounts created with correct roles. Navigation trimmed to essentials.

### Week 1: "Your Week at a Glance"
- 30-minute 1-on-1 walkthrough with JP (your screen, your data — not a slide deck)
- Dev Managers start with the **Priorities** page
- CEO starts with the **Dashboard** and **Priorities**
- PM starts with the **Projects** page
- No expectation to enter data this week. Just look and explore.
- End of week: JP checks in via Slack — Did you open it? What couldn't you find? What would make you open it every morning?

### Week 2-3: "Start Using for One Workflow"
- Dev Managers: use Pipeline to look up or update opportunities instead of going to Salesforce directly
- CEO: Dashboard projected during the existing pipeline meeting
- PM: Projects page in active daily use for AI Jobs Institute milestones
- JP names one spreadsheet that can be retired

### Week 4-5: "Meet Pebble" (Demo Only)
- JP demos Pebble live on a real prospect the team recognizes
- Team watches, asks questions, gives feedback — but does not self-service yet
- Self-service comes after permission guardrails and cost controls are in place
- After the demo: "Was this useful? What would you want to know that it didn't show?"

### Week 6+: Expand
- Additional pages unlocked as core workflows become habits
- Pebble self-service access (with usage limits) once guardrails are ready
- Weekly Slack check-ins continue. Every feature request gets a timeline — never "maybe later."

---

## What This Is NOT (Yet)

Being honest about where things stand builds trust faster than overpromising.

- This is a custom internal tool being actively developed by one person. It will improve every week. Some edges will be rough.
- It won't send emails or schedule events. It tracks relationships, money, and decisions.
- It won't auto-generate outreach messages. Pebble provides intelligence; you write the message in your own voice.
- It's not replacing Salesforce. It makes Salesforce data useful by combining it with everything else.
- It can't yet flag stale deals automatically or record why you passed on a prospect — those features are being built now.
- Pebble is demo-only at launch. Each research run uses paid AI services. Self-service access is coming once usage controls are in place.
- Gmail integration is not connected yet. Activity feeds currently show Slack and Fireflies data.
- There will be bugs. Reporting them to JP is helpful, not annoying.

---

## Where This Is Going

Bedrock exists to do five things: know who we're talking to and why, track every dollar through its lifecycle, tell us what to do this week, show leadership where the money stands, and keep Salesforce and Sage as sources of truth.

Over the next 6 weeks, we'll measure progress in sprints — from first login to daily use to Pebble integration. The measurable targets: Bedrock as the primary pipeline tool, at least one retired spreadsheet, and pipeline meetings run from the Dashboard.

**Coming over time:**
- Pebble evolves from single-contact research to bulk research with auto-categorization to a live assistant that recommends actions
- AI portfolio intelligence: recommendations for who should own which opportunities based on relationship history, workload, and funder fit
- Bedrock merges into Pursuit's unified AI-native learning platform — one login, one system

*For the full vision, Pebble architecture, sprint plan with measurable success criteria, and glossary, see the [Addendum](ONBOARDING-ADDENDUM.md).*
