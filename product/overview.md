## Pursuit Revenue & Relationships Platform — Product Overview

This repo now contains two closely related product efforts:

- A **Grants Management Platform** that unifies Salesforce and Sage Intacct for reliable pipeline, invoicing, and payment tracking (see `PRD.md`).
- A **Prospect Dashboard** that helps the fundraising team:
  - Clean up a messy, over‑full prospect list
  - Identify the **top prospects in new and existing leads**
  - Cross‑reference Nick’s LinkedIn network and org‑wide LinkedIn exports against external prospect/HNWI lists
  - Manage tasks and deadlines so work stays focused on the highest‑probability fundraising opportunities  
    (see `product/fundraising-team/raw-prds/prospect-dashboard/vision.md`).

Together, these roll up into a single long‑term vision: a **knowledge‑graph‑enabled system of record** that gives Pursuit a trustworthy view of every funder, prospect, opportunity, payment, and interaction—and intelligently highlights where to focus next.

---

## Long‑Term Vision

We are building a single “source of truth” for Pursuit’s external revenue and relationships. At steady state:

- **Fundraising team** runs their day from this system: pipeline, tasks, follow‑ups, and prospect research all live here, and the system tells them which prospects to focus on next instead of forcing them to manually scan long lists.
- **Finance team** trusts the data: invoices and payments are linked to real opportunities, and cash‑flow forecasts are grounded in the same records that fundraising sees.
- **Leadership** can answer “how are we doing?” in seconds: revenue pipeline, committed funding, overdue payments, and top near‑term priorities are visible in one place.

Under the hood, a **knowledge graph** connects:

- Organizations (funders, partners, employers)
- People (prospects, alumni, champions, staff)
- Opportunities and grants
- Invoices and payments
- Meetings, notes, and documents

In practice, this means that when any record changes (for example, a new meeting note is added or a new LinkedIn contact is imported), the system can immediately improve how it scores, prioritizes, and routes outreach across the whole graph.

Each new feature—whether it is a grant workflow, a prospecting tool, or a reporting view—should fit into this graph rather than creating a silo.

---

## One Platform: Bedrock (unified with learning platform)

The end state is **one clean platform** (we call it **Bedrock**) that combines:

- **CRM** — Contacts, accounts, opportunities, pipeline stages, and relationship history in one place.
- **Research tools** — LinkedIn network cross-reference, prospect scoring, HNWI matching, and suggested intro paths so the team knows who to focus on and how to reach them.
- **Reporting** — Dashboards, cash-flow projections, executive views, and board-ready outputs, all driven by the same data.

**Integration strategy:** The existing build in this repo (the app that already connects to Salesforce and Sage Intacct) is the integration point. We do not maintain two separate products. We:

- **Pull from Salesforce** for opportunities, accounts, contacts, and pipeline state so that prospect and network-search workflows can link to real opportunities (“already in pipeline,” “assigned owner,” “stage”).
- **Add** the prospecting tool (CSV upload, matching, “Add to Leads”) and research features into this same app so that leads and prospects connect to the same Accounts and Opportunities the team already manages.
- **Extend** reporting and dashboards so they surface both pipeline/grants data and prospect-intelligence views (top priorities, network matches, next best actions).

**Where Bedrock lives:** Bedrock will eventually **live inside the unified Pursuit platform** — the same application that runs the learning management system (builders, admissions, Pathfinder/Sputnik). We prototype in **this repo** for speed (Salesforce/Sage already wired here); the roadmap is to integrate into the learning platform codebase so staff have one login and one place for both learning and fundraising. See `product/ROADMAP-AND-STANDARDS.md` for the phased plan and week 1 deliverable (spreadsheet → actionable weekly priority list by grant deadlines).

Early prototypes (e.g. prospect matching with local/IndexedDB data) are fine for speed, but the target is always: one Bedrock with CRM + research + reporting, backed by the same Salesforce (and later Sage) data, then merged into the unified platform.

---

## Major Capabilities

At a high level, the system aims to provide five major capability areas:

- **CRM & Knowledge Graph**
  - Clean, connected records for organizations, people, opportunities, and grants
  - Links to emails, documents, meeting transcripts, and notes
  - Support for both institutional funders and individual prospects

- **Fundraising Workflows**
  - Simple UI for pipeline management (opportunities, stages, owners, payment schedules)
  - Prospect discovery and prioritization from LinkedIn and other lists
  - Task and deadline tracking so nothing slips through the cracks

- **Prospect Intelligence & Network Mapping**
  - Rank new and existing leads by fundraising probability, not just by list membership.
  - Cross‑reference Nick’s LinkedIn network, org‑wide LinkedIn exports, and external prospect/HNWI lists to find the strongest paths in.
  - Suggest intro paths (who should reach out, via whom, with what angle) to speed up go‑to‑market for fundraising.

- **Finance & Cash‑Flow**
  - Reliable mapping between opportunities, invoices, and payments
  - Projections of revenue and cash‑flow by month, quarter, and year
  - Clear status of “what’s committed vs. collected vs. at risk”

- **Reporting & Executive Views**
  - Dashboards for CEO and leadership; board-ready views; **custom reports:** basic prompts + pre-built filters (date, stage, owner, payment status, etc.); optional advanced report builder later. See `product/fundraising-team/phases/custom-reports.md`.

- **Slack-driven data entry & human verification**
  - Team posts updates in Slack (messy OK); system proposes changes to Opportunities, Leads, Contacts, Accounts, and Payments (Sage). **Review queue** in Bedrock: staff confirm or reject before any DB write. Human verification required for all entities; critical for Payments. See `product/fundraising-team/phases/slack-data-entry-and-review.md`.

---

## How Existing Docs Map Into This Vision

This repo now separates **vision**, **phase plans**, and **detailed specs**:

- **Grants Management Platform PRD** — `PRD.md`
  - Focuses on Phase 1 of the grants platform: opportunity management, payment schedules, dashboards, and future finance workflows.

- **Prospect Dashboard Vision & Specs** — `product/fundraising-team/raw-prds/prospect-dashboard/`
  - `vision.md` describes the prospect dashboard for fundraising and its role in the broader knowledge graph.
  - `specs/` contains feature‑level documents (pipeline, leads, calendar & tasks, network search, transcript pipeline).
  - `architecture/` and `decisions/` document technical choices and how this work stays compatible with the long‑term graph.

- **Fundraising Team Vision & Phases** — `product/fundraising-team/`
  - `vision.md` (this will be written to tell the fundraising story in non‑technical language).
  - `phases/README.md` (phase index); `phases/week-1-prototype.md`, `slack-data-entry-and-review.md`, `custom-reports.md` (concrete specs).

- **Learning platform alignment** — `product/learning-platform-integration.md`
  - How Bedrock stays compatible with the Pursuit AI Native learning platform (builders, admissions, Pathfinder/Sputnik): shared identity, auth, and data-model touchpoints so we can integrate cleanly when Bedrock moves into the unified platform.

- **Roadmap, standards & week 1** — `product/ROADMAP-AND-STANDARDS.md`
  - Unified platform vision (Bedrock lives in the learning platform); phased plan; **week 1 deliverable:** messy spreadsheet → actionable weekly priority list by grant deadlines; software development standards, fundraising best practices, and database security/redundancy. Detailed week 1 spec: `product/fundraising-team/phases/week-1-prototype.md`.

As we evolve the product, new features and PRDs should either:

- Extend one of these existing documents (for small changes), or
- Add a new, clearly named spec or phase doc that plugs into this structure.

---

## End State Criteria

We will know we are close to the desired end state when:

- **Fundraising**
  - The fundraising team treats this system as their default home base for daily work.
  - No major gift or key opportunity is tracked only in someone’s head, inbox, or spreadsheet.
  - Deadlines and follow‑ups are driven by the system, not by manual reminders.

- **Finance**
  - Every closed‑won opportunity has a clear, linked payment schedule and invoice history.
  - Expected vs. actual cash‑flow can be explained directly from system data.
  - Finance and fundraising agree on “one truth” for pipeline and receivables.

- **Leadership**
  - CEO and leadership can answer “what’s in the pipeline?”, “what’s at risk?”, and “what did we actually receive?” without bespoke exports.
  - Strategic questions about prospects, funders, and relationships can be explored quickly because the underlying graph is rich and well‑structured.
  - The CEO can open a single view to see the top priority prospects for the current quarter, with clear reasoning and suggested intro paths.

The rest of the docs in `product/fundraising-team/` and `PRD.md` fill in the details needed to deliver this vision in iterative phases.
