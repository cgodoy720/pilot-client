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
Upload 100 prospect names. Pebble researches all of them, auto-categorizes each one (renewal candidate, warm intro available, insufficient giving capacity, cold prospect), and creates follow-up tasks in Salesforce for the best fits. The team reviews and acts on the recommendations.

**Stage 4: Live Assistant + Path Recommendations**
Pebble runs proactively. New contact added? Auto-researched. Profile going stale? Flagged. Warm intro path available through your network? Surfaced before you ask. Pebble stops just reporting facts and starts recommending actions.

### How Pebble Works: Bounded Autonomy

Think of Pebble not as a single AI, but as a *team* of specialized researchers with a manager:

- **Workers** handle narrow tasks — extract data from one source, verify one claim
- **Specialists** analyze patterns across multiple sources — wealth indicators, philanthropy signals, political connections
- **A synthesizer** combines verified findings into a coherent profile with confidence ratings

Where this is going: workers will collaborate with each other. One finds a board membership, another finds the organization's 990 filing, a third cross-references the giving history. They share findings, build on each other's work, and escalate to the manager when they're uncertain.

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

## D. 6-Week Rollout Sprint Plan

Three 2-week sprints with measurable outcomes and decision gates.

### Sprint 1: Foundation (Week 1-2)

**Goal:** Team sees their own data in Bedrock and believes it's accurate.

| JP Delivers | Team Does |
|---|---|
| Salesforce data seeded and verified (spot-check 10 opportunities) | Log in and explore your assigned starting page |
| User accounts created with correct roles | Dev Managers: verify your top 5 opportunities appear correctly |
| Navigation trimmed to essentials | CEO: verify dashboard pipeline total matches your mental model |
| 1-on-1 walkthroughs completed for all 4 users | PM: confirm AI Jobs Institute project structure makes sense |

**Success metrics:**
- [ ] All 4 users logged in 3+ times
- [ ] Zero unresolved "this data is wrong" reports by end of Week 2
- [ ] At least 1 task completed through Bedrock
- [ ] CEO opened Dashboard 2+ times
- [ ] All 4 feedback check-ins completed (via Slack)

**Decision gate:** If any user hasn't logged in by end of Week 2, JP schedules a second walkthrough before proceeding. Data accuracy issues get fixed before Sprint 2.

---

### Sprint 2: Daily Use (Week 3-4)

**Goal:** Bedrock replaces at least one existing workflow for each person. One spreadsheet retired.

| JP Delivers | Team Does |
|---|---|
| Dashboard projected in existing pipeline meeting | Dev Managers: update at least 1 opportunity per week in Bedrock |
| Sprint 1 bug fixes shipped | CEO: use Dashboard as primary pipeline reference in meetings |
| Names one specific spreadsheet to retire | PM: update project tasks in Bedrock instead of other tools |
| Pebble demo prepared (pre-run on a real prospect) | All: report anything confusing or wrong via Slack |

**Success metrics:**
- [ ] 3+ opportunities edited through Bedrock (across Dev Managers)
- [ ] Pipeline meeting run from Bedrock Dashboard at least once
- [ ] PM updated 5+ project tasks
- [ ] One named spreadsheet officially retired
- [ ] Pebble demo completed and feedback collected from all attendees
- [ ] Feature request list has 3+ entries (they care enough to ask for more)

**Decision gate:** If zero opportunities have been edited through Bedrock by Week 4, investigate why (UX friction? data trust? habit?) before proceeding to Sprint 3.

---

### Sprint 3: Expand + Pebble (Week 5-6)

**Goal:** Full platform access. Pebble self-service (with guardrails) or JP-assisted.

| JP Delivers | Team Does |
|---|---|
| Pebble permission guardrails implemented — or JP continues running on request | Use Pebble to prep for at least 1 real meeting |
| Additional pages unlocked (Automation Review, Giving Capacity, Cashflow, Network Map) | CEO: review Cashflow page alongside Dashboard |
| Top feature request from Sprint 2 shipped (or timeline given) | All: structured 15-minute feedback 1:1 with JP |
| Sprint 1-2 bugs resolved | |

**Success metrics:**
- [ ] 2+ Pebble research runs on real prospects
- [ ] Pebble output referenced in at least 1 meeting or decision
- [ ] All 4 users logging in at least 2x per week
- [ ] Second spreadsheet identified for retirement
- [ ] Structured feedback collected from all 4 users
- [ ] Zero critical bugs open

**Decision gate:** JP + CEO review at end of Sprint 3 — Is Bedrock the team's primary pipeline tool? **Yes** → continue building (Pebble Stage 2, decision audit trail, grant requirements). **No** → diagnose what's blocking adoption before adding new features.

---

## E. Glossary

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
