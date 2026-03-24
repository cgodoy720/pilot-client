# Bedrock & Pebble: What We Built and What It Does for You

Version: 0.3 | Date: 2026-03-24 | Author: JP

A guide for the Pursuit fundraising team. No technical background required. Feedback welcome — this is a living document.

---

## Why This Exists

Right now, tracking Pursuit's fundraising pipeline means switching between Salesforce, spreadsheets, Slack, Google Calendar, and email — with no single place that shows the full picture. Assembling a pipeline status update takes an hour. Preparing for a funder meeting means 20 minutes of Googling. When someone asks "where does the money stand?" nobody has a fast answer.

Bedrock and Pebble exist to change that.

---

## What These Tools Are

**Bedrock** is Pursuit's fundraising command center — every funder, opportunity, dollar, and deadline in one place. It connects to Salesforce so data entered once appears everywhere.

**Pebble** is an AI research assistant that lives inside Bedrock. Ask it a quick CRM question and get an instant answer, or give it a name and organization and it builds a sourced profile in under 30 seconds — pulling from public records, SEC filings, nonprofit databases, and news — so you walk into every meeting prepared.

*Bedrock organizes what you know. Pebble discovers what you don't.*

---

## What Changes for You

### For the Development Managers

| What you can do | Status |
| :---- | :---- |
| See your weekly priorities — deadlines, tasks, calendar, goal progress — in one view (filter by weighted or total) | Working today |
| Edit opportunities directly — change stage, amount, close date, owner — and it saves to Salesforce instantly | Working today |
| Create new opportunities, accounts, and contacts without opening Salesforce | Working today |
| Create and complete tasks — assigned, dated, tracked — saves to Salesforce | Working today |
| Upload a CSV prospect list and manage leads | Working today |
| Get an AI-sourced research brief on any prospect in 30 seconds (Pebble) | Demo only at launch — JP runs it for you |

### For the AI Jobs Institute PM

| What you can do | Status |
| :---- | :---- |
| Manage AI Jobs Institute projects with Gantt charts, Kanban boards, milestones, and task dependencies | Working today |
| See how fundraising connects to your projects — view pipeline status for grants tied to your work | Working today |

### For the CEO

| What you can do | Status |
| :---- | :---- |
| See total pipeline, weighted pipeline, cash flow by quarter, and a stage funnel — in seconds | Working today |
| Filter by team member to see who owns what — their portfolio, tasks, and deadlines | Working today |
| Project the Dashboard during your existing pipeline meeting (no new meeting needed) | Working today |
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
- Duplicate detection (automatic — when creating records through Pebble, it checks for existing matches and asks before creating duplicates; fiscal-year-aware for opportunity renewals)
- Pebble prospect research *(demo only at launch — self-service after cost guardrails are added)*

### Coming Next

*(Built or being built — unlocked after MVP rollout)*

- Automation Review (Slack messages → proposed CRM updates → approve or reject)
- Giving capacity scoring (prospect type inference + composite wealth score)
- Invoice matching (link Sage invoices to Salesforce opportunities)
- Network map (LinkedIn and Salesforce connections visualized)
- Cashflow detail views (deeper analysis beyond the dashboard summary)
- Activity feeds per account (Slack, meeting notes, email — one view)
- Manual activity entry (log a call or meeting note in Bedrock)
- Stale deal flagging (auto-flag opportunities with no activity for 30+ days)
- Decision audit trail (record why you pursued or passed on a prospect)
- Grant requirements capture (reporting schedules, metrics, funder obligations)
- Sage Intacct invoice creation
- Gmail activity integration
- Ask Pebble — conversational CRM intelligence: instant lookups, tiered research (quick check → structured intel → full brief), and record creation with built-in duplicate safeguards

### On the Roadmap

*(Planned, 1-3 weeks out)*

- AI portfolio recommendations (who should own which opportunities, and why)
- Pebble bulk research (quick-check hundreds → deep-research the best fits → auto-categorize)
- Pebble warm intro paths (who on our team knows this prospect?)
- Live Pebble assistant (proactive research and action recommendations)
- Kanban drag-and-drop pipeline view
- Google Calendar sync & Chrome extension for logging in GCal and Gmail
- Concentration risk alerts

---

## How Bedrock Fits With Your Current Tools

- **Salesforce:** Every edit in Bedrock saves to Salesforce immediately. You're not maintaining two systems. You can still open Salesforce anytime.
- **Sage Intacct:** Invoice matching and cashflow detail coming after initial rollout. Sage stays the accounting system of record.
- **Slack:** Coming soon — post pipeline updates in Slack and Bedrock captures them automatically, proposes the change, and waits for your approval.
- **Calendar & Fireflies:** Coming soon — meeting notes and activity history per account.

**What Bedrock replaces:** The spreadsheets. The tab-switching. The "ask someone who remembers" workflow.

**What Bedrock does NOT replace:** Email, your judgment about relationships, Salesforce (it's still underneath; although we could migrate away eventually), Sage (still the financial system of record).

---

## Getting Started

### Pre-Launch

JP seeds Bedrock with your actual Salesforce data — you'll see real opportunities, not a demo. Accounts created with correct roles.

### Day 1: Click Around and Try to Break Things

- Log in, explore every page, click everything
- Dev Managers: check your top opportunities and tasks on the **Priorities** page
- CEO: open the **Dashboard** and **Priorities** — do the numbers match your mental model?
- PM: open the **Projects** page — does the AI Jobs Institute structure make sense?
- If something looks wrong or confusing, screenshot it and send to JP on Slack

### Day 2: Start Cleaning Up Your Opps and Tasks

- Dev Managers: edit an opportunity — update a stage, fix a close date, reassign an owner
- Create or complete a task in Bedrock instead of Salesforce
- Flag any records that are stale, duplicated, or wrong — a bulk cleanup tool is coming ~1 week after rollout
- CEO: project the Dashboard during your next pipeline meeting

### Day 3: Review with JP

- 15-minute check-in with JP (Slack or in person)
- Walk through any ambiguous feedback, design questions, or "I expected X but got Y" moments
- JP prioritizes fixes and feature requests from Day 1-2 feedback
- Pebble demo on a real prospect the team recognizes (JP runs it, team watches and gives feedback)

### After Day 3

- Keep using Bedrock as your primary pipeline view
- Bulk cleanup tool ships ~1 week after rollout
- Pebble self-service access once cost guardrails are ready
- JP stays on Slack — every feature request gets a timeline, never "maybe later"

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

The near-term targets: Bedrock as the primary pipeline tool, at least one retired spreadsheet, and pipeline meetings run from the Dashboard.

**Coming over time:**

- Pebble evolves from single-contact research → conversational CRM intelligence → bulk research with auto-categorization → live assistant that recommends actions
- AI portfolio intelligence: who should own which opportunities, based on relationship history, workload, and funder fit
- Bedrock merges into Pursuit's unified AI-native learning platform — one login, one system

*For the full vision, Pebble architecture, and glossary, see the [Addendum](ONBOARDING-ADDENDUM.md).*
