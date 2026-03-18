---
type: vision-doc
id: vision-prospect-dashboard
status: active
version: 2.0
author: jp
created: 2026-03-13
updated: 2026-03-13
---

# Pursuit Prospect Dashboard — Vision

## What we're building

An internal tool for Pursuit's development (fundraising) team to manage active opportunities, track new leads, coordinate task deadlines, and surface high-net-worth individuals (HNWI) within CEO Nick Simmons' professional network by cross-referencing LinkedIn connection data against external prospect and wealth indicator lists.

This is the first concrete project in a larger Pursuit knowledge graph vision. The dashboard is designed as one view into a structured knowledge system — not a standalone silo. See [[knowledge-graph-compat]] for the long-term architecture.

## The problem

Pursuit's fundraising pipeline is scattered across spreadsheets, Salesforce (unreliable and messy), email, and people's heads. There is no systematic way to:

- See all active opportunities and their stages in one place
- Identify which of Nick's thousands of LinkedIn connections overlap with HNWI lists, donor databases, or corporate giving officers
- Prioritize outreach based on network proximity, estimated capacity, and relationship warmth
- Track deadlines across multiple simultaneous cultivation cycles

The network search gap is the most acute pain point. Nick's LinkedIn connections contain major gift prospects, corporate partnership leads, and board referral pathways — but there's no way to systematically find and prioritize them.

## Users and stakeholders

**Primary users:**
- JP (Senior Manager, Strategic Partnerships — primary builder and power user)
- Nick Simmons, CEO (executive review of pipeline and network intelligence; lightweight interaction)
- Development/partnerships team members (pipeline and task tracking)

**Downstream stakeholders:**
- Finance team (pipeline data feeds cash flow projections)
- Program team (corporate partnerships affect talent pipeline)

## Core features

Each feature has a self-contained spec in the `specs/` directory:

| Feature | Spec | Phase |
|---------|------|-------|
| Opportunity Pipeline (Kanban) | [[opportunity-pipeline]] | 1 |
| Leads Tracker | [[leads-tracker]] | 1 |
| Calendar & Task Management | [[calendar-tasks]] | 1 |
| Network Search & HNWI Matching | [[network-search]] | 1 (basic), 2-3 (AI) |
| Meeting Transcript Pipeline | [[transcript-pipeline]] | 4+ (foundation now) |

## Architecture docs

| Document | Purpose |
|----------|---------|
| [[data-model]] | Entities, relationships, schema |
| [[security-requirements]] | PII handling, encryption, access control |
| [[transcript-reliability]] | Confidence scoring, multi-source meeting input |
| [[knowledge-graph-compat]] | How this connects to the larger Pursuit graph |

## Timeline

Working prototype within ~1 month. Architecture designed for where agents will be in 6 months.

- **Phase 1** (Days 1-7): All four views functional, data persistence, deployed. [[phase-1]]
- **Phase 2** (Days 8-14): Polish, Pebble integration, activity logging. [[phase-2]]
- **Phase 3** (Days 15-21): Production hardening, executive view, migration prep, Pebble integration. [[phase-3]]

## Success metrics

**Quantitative:**
- 50+ actionable prospects surfaced from LinkedIn cross-reference in first run
- Prospect research brief in < 30 seconds (Pebble API call) vs. 15-30 minutes manually
- 100% of active opportunities tracked in dashboard within 2 weeks of launch

**Qualitative:**
- Nick can review top network matches and immediately identify 5+ outreach targets
- Team reports the dashboard as their "first tab" for fundraising work
- Data entry friction low enough that activity logging actually happens

## Risks

| Risk | Mitigation |
|------|------------|
| LinkedIn CSV format incomplete or inconsistent | Flexible parser that handles missing fields. Document expected format. |
| Fuzzy matching too many false positives | Conservative thresholds, tune with feedback. Pebble API disambiguation in Phase 2. |
| Timeline aggressive for one builder | Prioritize ruthlessly. Phase 1 ships even if minimal. Cut Phase 2/3 scope before cutting Phase 1 quality. |
| PII/wealth data privacy | Local storage only, no third-party sharing. See [[security-requirements]]. |
| Low team adoption | Build for existing workflows. Minimize data entry friction. Team feedback in Phase 2. |

## Open questions

1. **LinkedIn data:** Do we have a recent export from Nick's account? What fields?
2. **Prospect lists:** What external HNWI lists does the team have? Format? Record count?
3. **Existing pipeline data:** Current spreadsheet or Salesforce export to seed the dashboard?
4. **Opportunity stages:** Are the default stages accurate? (Identified → Qualified → Proposal Sent → In Negotiation → Verbal Commit → Closed Won/Lost)
5. **Team access:** How many users? Shared link sufficient or password protection needed?
6. **Nick's priorities:** Specific sectors, regions, or giving interests to weight in scoring?

## Out of scope (for now)

PostgreSQL migration, Sage integration, Slack bot, voice-to-text logging, automated email sequences, learning platform integration, mobile UI, multi-user auth, automated LinkedIn refresh, external API integrations (FDO, GuideStar, SEC EDGAR).
