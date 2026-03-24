# Bedrock & Pebble: What We Built and What It Does for You

> Version: 0.2 | Date: 2026-03-23 | Author: JP
>
> A guide for the Pursuit fundraising team. No technical background required.
> Feedback welcome — this is a living document.

---

## Why This Exists

Right now, tracking Pursuit's fundraising pipeline means switching between Salesforce, spreadsheets, Slack, Google Calendar, and email — with no single place that shows the full picture. Assembling a pipeline status update takes an hour. Preparing for a funder meeting means 20 minutes of Googling. When someone asks "where does the money stand?" nobody has a fast answer.

Bedrock and Pebble exist to change that.

---

## What These Tools Are

**Bedrock** is Pursuit's fundraising command center. One place where every funder, every opportunity, every dollar, and every deadline lives — so nothing falls through the cracks. It connects to Salesforce so data entered once appears everywhere. (Integration with Sage Intacct, Slack, and other tools coming soon.)

**Pebble** is an AI research assistant that lives inside Bedrock. Ask it a quick CRM question and get an instant answer, or give it a name and organization and it builds a sourced profile in under 30 seconds — pulling from public records, SEC filings, nonprofit databases, and news — so you walk into every meeting prepared.

*Bedrock organizes what you know. Pebble discovers what you don't.*

---

## What Changes for You

### For the Development Managers

| What you can do | Status |
|---|---|
| See your weekly priorities — deadlines, tasks, calendar, goal progress — in one view | Working today |
| Edit opportunities directly — change stage, amount, close date, owner — and it saves to Salesforce instantly | Working today |
| Create new opportunities, accounts, and contacts without opening Salesforce | Working today |
| Create and complete tasks — assigned, dated, tracked — saves to Salesforce | Working today |
| Upload a CSV prospect list and manage leads | Working today |
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
| Create and assign tasks to track team commitments | Working today |

### For everyone

When you edit an opportunity or create a task in Bedrock, those changes save back to Salesforce. You're not maintaining two systems — Bedrock is your Salesforce interface, just simpler. Salesforce stays the system of record underneath.

---

## What Works Today vs. What's Coming

### Working Now

- Weekly priorities view (deadlines, tasks, calendar, goal tracker — filterable by team member)
- Opportunity pipeline (create, edit in-line, change stage — all changes save to Salesforce)
- Accounts and contacts (search, create — saves to Salesforce)
- Salesforce connection (reads your data automatically; your edits save back to Salesforce)
- Executive dashboard (pipeline funnel, cash flow projections, scenario analysis)
- Ownership visibility (every opportunity shows its owner; filter by team member)
- Task management (create, assign, complete — saves to Salesforce)
- Lead management (import CSV, track status and priority)
- Project management (Gantt, Kanban, List, and Executive views with task dependencies)
- Role-based permissions (different views for different roles)
- Pebble prospect research *(demo only at launch — self-service after cost guardrails are added)*

### Coming Next
*(Built or being built — unlocked after MVP rollout)*

- Automation Review (Slack messages parsed into proposed CRM updates — approve or reject before writing to Salesforce)
- Giving capacity scoring (prospect type inference + composite wealth score)
- Invoice matching (link Sage invoices to Salesforce opportunities)
- Network map (visualize LinkedIn and Salesforce connections)
- Cashflow detail views (deeper analysis beyond the dashboard summary)
- Activity feeds per account (Slack messages, meeting notes, and email aggregated in one view)
- Manual activity entry (log a call or meeting note directly in Bedrock)
- Stale deal flagging (auto-flag opportunities with no activity for 30+ days)
- Decision audit trail (record why you pursued or passed on a prospect)
- Grant requirements capture (track what funders require: reporting schedules, metrics, outcomes)
- Sage Intacct invoice creation from Bedrock
- Gmail activity integration
- Ask Pebble — a conversational chat for instant CRM questions and tiered prospect research (quick check → structured intel → full brief)

### On the Roadmap
*(Planned, not yet started)*

- AI portfolio recommendations (who should own which opportunities based on all available context)
- Pebble bulk research with tiered review (quick-check hundreds, deep-research the best fits, auto-categorize the winners)
- Pebble warm intro paths (who on our team knows this prospect?)
- Live Pebble assistant (proactive research and recommendations)
- Kanban drag-and-drop pipeline view
- Google Calendar sync
- Duplicate detection
- Concentration risk alerts

---

## How Bedrock Fits With Your Current Tools

- **Salesforce:** When you edit an opportunity in Bedrock — change the stage, update the amount, reassign the owner — that change saves to Salesforce immediately. When you create a new contact or account, it appears in Salesforce. You're not maintaining two systems. You can still open Salesforce anytime.
- **Sage Intacct:** Integration is in progress. Invoice matching and cashflow detail will be available after the initial rollout. Sage stays the accounting system of record.
- **Slack:** Slack integration is being built. Soon you'll be able to post pipeline updates in Slack and Bedrock will capture them automatically, propose the change, and wait for your approval.
- **Calendar & Fireflies:** Meeting data integration is being built. Once connected, Bedrock will show meeting notes and activity history per account.

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
- Dev Managers: edit an opportunity or create a task in Bedrock instead of opening Salesforce
- CEO: Dashboard projected during the existing pipeline meeting
- PM: Projects page in active daily use for AI Jobs Institute milestones
- JP names one spreadsheet that can be retired

### Week 4-5: "Meet Pebble" (Demo Only)
- JP demos Pebble live on a real prospect the team recognizes
- Team watches, asks questions, gives feedback — but does not self-service yet
- Self-service comes after permission guardrails and cost controls are in place

### Week 6+: Expand
- Additional pages unlocked (Automation Review, Giving Capacity, Cashflow, Network Map)
- Pebble self-service access (with usage limits) once guardrails are ready
- Weekly Slack check-ins continue. Every feature request gets a timeline — never "maybe later."

---

## What This Is NOT (Yet)

Being honest about where things stand builds trust faster than overpromising.

- This is a custom internal tool being actively developed by one person. It will improve every week. Some edges will be rough.
- It won't send emails or schedule events. It tracks relationships, money, and decisions.
- It won't auto-generate outreach messages. Pebble provides intelligence; you write the message in your own voice.
- It's not replacing Salesforce. It makes Salesforce data useful by combining it with everything else.
- Features like Slack automation, cashflow analysis, giving capacity scoring, and invoice matching are built and being tested — they'll be unlocked once the team is comfortable with the core workflows.
- Pebble is demo-only at launch. Each research run uses paid AI services. Self-service access is coming once usage controls are in place.
- There will be bugs. Reporting them to JP is helpful, not annoying.

---

## Where This Is Going

Bedrock exists to do five things: know who we're talking to and why, track every dollar through its lifecycle, tell us what to do this week, show leadership where the money stands, and keep Salesforce and Sage as sources of truth.

Over the next 6 weeks, we'll measure progress in sprints — from first login to daily use to Pebble integration. The measurable targets: Bedrock as the primary pipeline tool, at least one retired spreadsheet, and pipeline meetings run from the Dashboard.

**Coming over time:**
- Pebble evolves from single-contact research to a conversational CRM intelligence tool — ask a quick question or run deep research — then to bulk research with auto-categorization, and finally to a live assistant that recommends actions
- AI portfolio intelligence: recommendations for who should own which opportunities based on relationship history, workload, and funder fit
- Bedrock merges into Pursuit's unified AI-native learning platform — one login, one system

*For the full vision, Pebble architecture, sprint plan with measurable success criteria, and glossary, see the [Addendum](ONBOARDING-ADDENDUM.md).*
