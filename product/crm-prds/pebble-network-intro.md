# Pebble Feature Spec — Network Intro Routing

> Version: 0.1 | Status: **Future (blocked on learning platform integration)** | Date: 2026-03-19
>
> **Cross-reference (2026-03-23):** This feature maps to **Tier 4 (Network Intelligence)** in the Ask Pebble tiered query design. T4 runs full network mapping — ranked intro paths, shared contacts, connection strength. See `product/crm-prds/ask-pebble-spec.md`.
>
> **T1 Enhancement (contingent on Stage 2D):** Once LinkedIn data is server-side (Stage 2D of evolution roadmap), T1 (ID & Triage) will include a lightweight "in-network check" — a simple query against `linkedin_contacts` returning whether any team members are connected to the prospect and how many. This is NOT T4's full network mapping; it's a boolean enrichment to the identity card. T4 remains the tier for ranked intro paths, shared contacts, and connection strength analysis.

---

## Purpose

After Pebble identifies, researches, and prioritizes HNWI prospects, the fundraising
team faces a gap: "We have great research — now what?" This feature bridges prospect
research to cultivation by analyzing the team's LinkedIn network to find the best
intro route to each target prospect.

---

## User Pain Point (verbatim from JP)

"Even after getting good prospect research from Pebble, what do we do with it?
The next step for Pebble will be to analyze our network contacts from the LinkedIn
downloads and identify connections in-network who provide the best route to getting
an intro to one of the HNWI identified, researched, and prioritized by Pebble."

---

## Scope

**In scope:**
- Analyze team LinkedIn contacts (from learning platform repository) against
  Pebble-researched HNWI prospects
- Identify in-network connections who can provide introductions
- Rank intro routes by connection strength, recency, and relevance
- Surface recommendations in Bedrock UI alongside Pebble research results

**Out of scope (for this spec):**
- LinkedIn API direct integration (contacts come from learning platform downloads)
- Automated outreach or message drafting
- CRM contact deduplication (covered by PRD #02)

---

## Prospect List Ingestion (related capability)

Pebble also needs to ingest the team's existing prospect research:
- Semi-structured Excel and Google Sheets with years of accumulated research
- Some data sourced from professional wealth screening tools
- Formats vary; Pebble must normalize and work with this data

---

## Dependencies

| Dependency | Type | Notes |
|-----------|------|-------|
| Learning platform integration | **Hard blocker** | LinkedIn contact repository lives in the learning platform. Must establish connectivity before this feature can be built. |
| PRD #11 — Prospect Intelligence | Soft | Network search scoring, intelligence freshness infrastructure |
| PRD #09 — Salesforce Migration | Soft | Contact data sync for dedup and enrichment |
| Pebble MVP (current) | Prerequisite | HNWI research pipeline must be working |
| Ask Pebble tiered design | Reference | T4 tier definition, T1 LinkedIn enhancement. See `product/crm-prds/ask-pebble-spec.md` |

---

## Sequencing

This feature is reserved for AFTER:
1. Pebble MVP is stable and producing reliable prospect research
2. Learning platform connectivity is established (LinkedIn contact repository access)
3. Prospect list ingestion (Excel/Sheets) is functional

---

## Open Questions

1. What fields are available in the learning platform's LinkedIn contact downloads?
2. How frequently are LinkedIn networks refreshed in the learning platform?
3. Should intro routing consider organizational hierarchy (e.g., board members vs staff)?
4. How should "connection strength" be defined? (mutual connections, interaction recency, shared affiliations?)

---

## Acceptance Criteria (preliminary)

### Positive scenarios
- Given a Pebble-researched HNWI, when network analysis runs, then the system surfaces
  ranked intro routes from team LinkedIn contacts.
- Given multiple team members have connections to the same HNWI, when network analysis
  runs, then all routes are surfaced and ranked.

### Negative scenarios
- Given no in-network connections exist, when network analysis runs, then the system
  indicates "no direct path" and suggests alternative approaches (e.g., event-based outreach).
