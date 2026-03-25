# Onboarding Addendum: Vision, Architecture & Sprint Plan

> Companion to [ONBOARDINGPRD.md](ONBOARDINGPRD.md). Not required for onboarding — read this when you want to go deeper.

---

## A. Two Revenue Streams

Pursuit raises money through two distinct channels with different rules:

**Nonprofit grants** — Longer timelines, milestone-based payments, reporting requirements, restricted funding. Examples: Robin Hood Foundation, NYC Economic Development Corporation.

**PBC contracts** — Corporate partnerships, apprenticeship agreements, sponsorships. Invoice-on-delivery or net-30/60 terms. Examples: Google.org, JPMorgan Chase.

Both flow through the same pipeline stages in Bedrock, but every opportunity is tagged with its revenue stream so reporting can split or combine them. The executive dashboard already shows revenue by stream. When grant requirements capture launches, it will add reporting schedules and funder obligations specifically for nonprofit grants.

A single organization can have both a grant and a contract — the system handles this naturally.

*You don't need to do anything special. Just select "Nonprofit" or "PBC" when creating an opportunity.*

---

## B. The Vision — Five Core Jobs

Every Bedrock feature traces back to one of these. If it doesn't serve one of these five, it doesn't get built.

1. **Know who we're talking to and why.** Clean, unified records of every organization, contact, and prospect — with relationship history, not just data fields. When someone leaves Pursuit, the institutional knowledge stays.

2. **Track every dollar through its lifecycle.** From "we identified a funder" through "proposal sent" through "award signed" through "invoice paid" — one continuous thread, not scattered across Salesforce, Sage, and spreadsheets.

3. **Tell us what to do this week — and remember why we decided it.** Surface time-sensitive actions automatically. Grant deadlines, follow-up calls, stalled deals, overdue tasks — prioritized and assigned. Record the reasoning behind pursue/pass/deprioritize decisions so institutional knowledge survives turnover.

4. **Show leadership where the money stands.** Accurate pipeline value, weighted forecasts, cash flow projections, and revenue by stream — available in seconds, not after an hour of number-pulling.

5. **Keep Salesforce and Sage as sources of truth.** Bedrock doesn't replace your systems of record — it makes them work together. Data entered in one place appears in all three. No re-keying.

---

## C. Nirvana — Pebble's Full Evolution

### The 4-Stage Roadmap

Each stage builds on the last. Each delivers full user capability — no half-built features.

**Stage 1: Research Quality + UX** *(Complete today)*
Sourced profiles with confidence scoring, session history, human feedback, and markdown export. Data from ProPublica 990s, SEC EDGAR filings, FEC political contributions, Wikipedia, USAspending, and OpenCorporates. Every claim links to its source so you can verify.

**Stage 2: Internal Data Integration** *(Next)*
Pebble checks Salesforce before researching — if you already have a relationship with this person, Pebble tells you instead of starting from scratch. LinkedIn connections stored on the server (not just in your browser). Your own giving history enriches profiles.

**Stage 3: Bulk Research + Categorization**
Upload 100 prospect names. Pebble runs a quick identity check on all of them — confirming who they are and flagging ambiguous matches. You review the results, select who's worth a deeper look, and Pebble runs structured research only on the ones you choose. The best fits get auto-categorized (renewal candidate, warm intro available, insufficient giving capacity, cold prospect), and follow-up tasks are created in Salesforce for the winners. No money wasted on the wrong person.

**Stage 4: Live Assistant + Path Recommendations**
Pebble runs proactively. New contact added? Auto-researched. Profile going stale? Flagged. Warm intro path available through your network? Surfaced before you ask. Pebble stops just reporting facts and starts recommending actions.

### How You'll Talk to Pebble: Ask Pebble

Today Pebble researches one prospect at a time. Ask Pebble changes that — it's a conversational interface where you type a question and Pebble decides how deep to go.

**Three levels of depth:**

- **Quick CRM answers** (free, instant) — "What's Jane Smith's title?" or "Show me open opportunities with Acme." Pebble checks Salesforce and responds in under a second. No AI cost.
- **Structured research** (seconds, pennies) — "What's Jane's public giving look like?" Pebble pulls from public records, SEC filings, and nonprofit databases to build a structured profile across five dimensions: giving capacity, affiliations, board positions, wealth indicators, and comparable giving.
- **Full research briefs** (minutes, modest cost) — "Run a full brief on Jane." Pebble runs its complete research pipeline — multiple AI agents cross-referencing sources, verifying claims, and producing a comprehensive profile with confidence ratings.

**You're always in control.** Pebble never spends research budget without your say-so. It starts cheap, shows what it found, and asks if you want to go deeper. If you ask about "John Smith" and there are three in Salesforce, Pebble shows all three and asks you to pick — so it never researches the wrong person.

**Pebble knows its lane.** Need to draft an email or brainstorm strategy? Pebble hands you off to CoWork, Pursuit's general AI workspace. Pebble stays focused on research and CRM intelligence — that's what it's built for.

*For technical details, see the [Ask Pebble design spec](crm-prds/ask-pebble-spec.md).*

### How Pebble Works: Bounded Autonomy

Think of Pebble not as a single AI, but as a *team* of specialized researchers with a manager:

- **Workers** handle narrow tasks — extract data from one source, verify one claim
- **Specialists** analyze patterns across multiple sources — wealth indicators, philanthropy signals, political connections
- **A synthesizer** combines verified findings into a coherent profile with confidence ratings

Where this is going: workers organized into specialized clusters. A financial cluster cross-references political donations against nonprofit filings against federal awards. An affiliation cluster verifies board positions against Wikipedia entries against corporate registrations. Each cluster has a budget cap and time limit — they do their best within those bounds and flag anything uncertain for you to review.

Every agent operates within boundaries. There's a budget cap per prospect ($0.50 today). Agents can't take new research directions without checking with the orchestrator first. If something looks promising but expensive, it escalates rather than exploring on its own.

This is bounded autonomy — powerful enough to surface insights humans would miss, constrained enough to never run away with your money or your data.

The end state: give Pebble a name, and it comes back not just with "here's what we know" but with "here's what we recommend you do about it — and here's the path to get there."

### The North Star: AI Portfolio Intelligence

Each team member owns 20-30 Opportunities. Today, assignment is manual — based on who has bandwidth or who knows the funder. In the future, Bedrock will analyze all available context:

- **Relationship history** — Who has the deepest connection to this funder?
- **Sector alignment** — Who specializes in government vs. corporate vs. foundation?
- **Workload balance** — Who's overloaded? Who has capacity?
- **Pipeline composition** — Does this person's portfolio have enough diversity, or too much concentration risk?
- **Funder preferences** — Does this funder respond better to certain approaches?

...and recommend: "Move Opportunity X from Person A to Person B. Here's why."

This is the knockout capability. Bedrock doesn't just track your portfolio — it makes your portfolio smarter. It combines everything Pebble knows about the prospect with everything Bedrock knows about your team.

### Long-Term Home

Bedrock is being built to eventually merge into Pursuit's unified AI-native learning platform (alongside Pathfinder for learner operations). One login, one platform — fundraising tools alongside workforce development tools. The technology choices being made today are already aligned with that future.

---

## D. Glossary

| Term | Definition |
|---|---|
| **Opportunity** | A specific fundraising deal — a grant application, a contract, a sponsorship |
| **Pipeline** | All active opportunities, organized by how far along they are |
| **Stage** | Where a deal is in its lifecycle, from initial identification through proposal and negotiation to a final outcome (won or lost) |
| **Prospect** | A potential funder who hasn't yet been qualified into the pipeline |
| **Weighted pipeline** | Pipeline value adjusted by probability. A $100K deal at 50% probability counts as $50K |
| **Revenue stream** | Whether an opportunity is a nonprofit grant or a PBC contract |
| **Pebble profile** | The AI-generated research brief for a contact, with sourced claims and confidence scoring |
| **Claim** | A specific piece of information in a Pebble profile (e.g., "Board member of XYZ Foundation") with its source linked |
| **Automation Review** | The queue where AI-proposed changes (from Slack, calendar, etc.) wait for human approval before being applied to Salesforce |
| **Portfolio** | The set of opportunities a team member owns and manages |
| **Ask Pebble** | The conversational interface for querying CRM data and requesting prospect research — from quick lookups to full research briefs. Lives on the Pebble page; eventually a floating assistant on every Bedrock page |
| **CoWork** | Pursuit's Claude-powered AI workspace for drafting, analysis, and general tasks. Pebble handles research and CRM intelligence; CoWork handles everything else |
| **Tiered Research** | Pebble's progressive approach — quick identity check (T1), structured intelligence across 5 dimensions (T2), full verified research brief (T3). Each tier requires your approval before spending |
| **CRM Bridge** | The connection between Pebble and Bedrock that lets Pebble query Salesforce data directly for instant answers about contacts, accounts, and opportunities |

---

## E. How Priority Opportunities Scoring Works

The Priorities page ranks your open opportunities using **two separate systems** that serve different purposes.

### Rank Order (the # column)

This controls the sort position — which deals appear at the top of the table.

- **"Total" mode:** Sorted by dollar Amount, biggest first. A $5M deal always ranks above a $100K deal.
- **"Weighted" mode:** Sorted by Amount x Probability, with a slight log-scale bonus for very large deals. A $1M deal at 50% probability (~$500K weighted) ranks above a $500K deal at 80% (~$400K weighted).

The # is purely a position indicator — it tells you where the deal falls in your portfolio by financial impact.

### Urgency Alerts (the Alerts column)

This surfaces what needs your attention *right now*. Each condition adds points to an urgency score and shows a colored chip. Multiple alerts can stack on the same opportunity.

| Alert | What it means | Points | Color |
|-------|--------------|--------|-------|
| Overdue by X days | Close date has passed | +40 | Amber |
| Closing in X days | Close date within 7 or 30 days | +15 to +30 | Green |
| X overdue tasks | Tasks past their due date | +20 | Amber |
| No tasks assigned | No open tasks — nobody has a next action | +10 | Blue |
| Stale — X days | No activity (modification or task/event) in 30+ days | +15 | Blue |
| Quiet Xd+ ($Ym) | Large deal ($250K+) with no activity, escalating severity | +10 to +30 | Amber |
| Meeting in X days | Upcoming meeting — time to prep | +10 | Blue |
| Renewal | Opportunity marked as renewal (RenewalRepeat field) | +5 | Purple |
| Upsell | Opportunity marked as upsell | +5 | Purple |

**The urgency score determines the rank dot color** (the circle around the # number), not the sort order:
- **Amber dot** — has overdue tasks (something is late)
- **Green dot** — closing soon (deal is progressing toward close)
- **Blue dot** — has informational alerts (stale, no tasks, meeting prep)
- **Gray dot** — no alerts

### Color System

Alerts use a consistent color language across the entire application:

- **Red** = Priority/severity (High priority tasks, critical issues)
- **Amber** = Temporal pressure (overdue, time-sensitive — something is late or stalling)
- **Green** = Closing momentum (deal approaching Collecting / In Effect stage)
- **Blue** = Informational (no tasks, stale, meeting prep — things to know, not alarms)
- **Purple** = Relationship tags (Renewal, Upsell — protecting existing revenue)

### Why Two Systems?

The rank order answers: *"Which deals matter most financially?"*
The urgency alerts answer: *"Which deals need action right now?"*

A $20M deal with no alerts still ranks #1 — it's your biggest opportunity. But a $100K deal with overdue tasks and a stale pipeline gets amber chips screaming for attention. Both signals are useful; combining them into one score would blur the distinction.
