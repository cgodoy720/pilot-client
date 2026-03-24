---
type: feature-spec
id: spec-network-search
status: draft
phase: 1
depends_on: ["[[data-model]]", "[[leads-tracker]]"]
---

# Network Search & HNWI Intelligence Engine

## What it does

The core differentiator. An AI-assisted search tool that cross-references Nick Simmons' LinkedIn connections export against external prospect lists to surface the highest-value outreach targets. Phase 1 uses rule-based fuzzy matching; Phase 2 adds Pebble API for intelligent disambiguation and prospect summaries.

## User stories

- As JP, I need to upload Nick's LinkedIn export and prospect lists and immediately see ranked matches so I can identify outreach targets
- As Nick, I need to review the top matches and quickly identify people worth reaching out to
- As JP, I need to add a promising match to the leads tracker with one click so it enters the cultivation workflow

## Data sources (input)

**LinkedIn Connections Export (CSV):**
- Fields: first name, last name, headline/title, company, connection date, email (if available)
- This is Nick's "rolodex" — thousands of connections accumulated over a career in tech workforce development, philanthropy, and social enterprise
- Format changes over time — parser must handle missing fields gracefully

**External Prospect/Wealth Lists (CSV/JSON):**
- One or more datasets containing HNWI individuals, corporate giving officers, foundation program officers, or compiled prospect lists
- Possible fields: name, organization, title, estimated net worth or giving capacity tier, philanthropic interests, giving history, geographic location
- May come from purchased lists, Foundation Directory Online, GuideStar/Candid, SEC filings, or team-compiled research

**Internal Data (CSV/JSON):**
- Existing Pursuit contacts from Salesforce export or internal CRM
- Used to flag contacts already in the pipeline (existing_relationship_bonus in scoring)

## Core matching logic (Phase 1)

**Fuzzy name matching (Fuse.js):**
- Handle: "Robert" vs "Bob," name order differences, middle initials, hyphenated names
- Configurable threshold (default: 0.6 match confidence minimum for inclusion)

**Organization matching:**
- Current employer on LinkedIn vs. organization in prospect list
- Handle abbreviations, subsidiaries, name changes

**Title/role matching:**
- Parse seniority from LinkedIn headline
- C-suite/Board = 100, SVP/EVP = 80, VP = 65, Director = 50, Manager = 30, Other = 10

**Composite scoring algorithm:**

```
composite_score = (
    match_confidence * 0.25 +
    wealth_tier_score * 0.25 +
    title_seniority_score * 0.20 +
    industry_relevance_score * 0.15 +
    connection_recency_score * 0.10 +
    existing_relationship_bonus * 0.05
)
```

Scoring detail:
- **match_confidence (0-100):** Fuse.js score. Threshold for inclusion: >= 60.
- **wealth_tier_score:** Tier 1 ($10M+) = 100, Tier 2 ($1M-$10M) = 75, Tier 3 ($100K-$1M) = 50, Tier 4 ($10K-$100K) = 25, Unknown = 10.
- **title_seniority_score:** Parsed from LinkedIn headline (see above).
- **industry_relevance_score:** Keyword match against Pursuit mission areas. Technology = 100, Education/Workforce = 100, Finance = 80, Consulting = 70, Philanthropy/Nonprofit = 90, Government = 60, Other = 20.
- **connection_recency_score:** Years connected. 5+ years = 100, 3-5 = 80, 1-3 = 60, < 1 year = 40.
- **existing_relationship_bonus:** Binary (0 or 100). Is this contact already in Pursuit's pipeline?

Weights and tier mappings should be calibrated against real data in Phase 2.

## Search interface

**Search:**
- Full-text search across merged dataset by name, company, title, keyword

**Filter panel:**
- Wealth tier
- Industry
- Title level / seniority
- Connection recency
- Match confidence threshold (slider)
- Already-in-pipeline flag (show/hide)

**Results display:**
- Ranked cards with: name, title, company, LinkedIn connection date, matched prospect list source(s), composite score breakdown, suggested outreach priority (Hot / Warm / Worth Exploring)
- Outreach priority derived from composite score: >= 75 = Hot, 50-74 = Warm, < 50 = Worth Exploring

**Actions:**
- "Add to Leads" — one click, pushes to [[leads-tracker]] with pre-filled data, source = "network search hit"
- Batch operations: multi-select, bulk add to leads, export to CSV

> **Note (2026-03-23):** The Phase 2/3 Pebble API additions below are superseded by the Ask Pebble tiered query design. Disambiguation is now handled by a multi-layer readiness gate (CRM multi-match → cross-entity → identity risk). Batch prospect research uses progressive tiers (T1 identity check → T2 structured intelligence → T3 full brief) with human review gates. See `product/crm-prds/ask-pebble-spec.md`.

## Phase 2 additions (Pebble API)

- Natural-language prospect summary generation per match (Pebble API)
- Intelligent name disambiguation for low-confidence matches (Pebble API)
- Duplicate detection against existing pipeline contacts

## Phase 3 additions

- Saved searches and search history
- Watchlist: flag contacts to monitor
- Batch prospect research via Pebble API (Bedrock sends contact IDs to Pebble → Pebble generates research briefs)
- Export as formatted report (PDF or structured CSV) for Nick's review

## Data privacy and compliance

See [[security-requirements]] for full details. Key points:
- All data processed and stored locally / within Pursuit infrastructure
- No third-party data sharing
- LinkedIn data used per LinkedIn's terms for personal connection management
- Prospect lists sourced through legitimate channels only
- No scraping — operates only on exported/imported structured data

## Data model dependencies

Uses from [[data-model]]:
- `Contact` entity (LinkedIn connections imported as contacts)
- `NetworkMatch` entity (primary — each match is a record)
- `Lead` entity (created via "Add to Leads" action)

## UI/UX

- CSV upload area at top (drag-and-drop or file picker)
- Upload status: show record count, field mapping preview, parsing errors
- Results load immediately after matching completes (should be < 5 seconds for typical datasets)
- Score breakdown visible on hover or expand (not cluttering the card by default)

## Exit criteria

- [ ] CSV upload works for LinkedIn export and prospect lists
- [ ] Parser handles missing fields without crashing
- [ ] Fuzzy matching produces ranked results with composite scores
- [ ] Filter panel narrows results correctly
- [ ] "Add to Leads" creates a lead record linked to the match
- [ ] Results persist to IndexedDB
- [ ] Batch export to CSV works

## Open questions

- What does Nick's actual LinkedIn export look like? (Need to inspect real file for field mapping)
- Which prospect lists does the team currently have? (Determines field mapping for wealth tiers)
- Should matching run on every page load, or only on explicit "Run Match" action?
- How do we handle updates — re-uploading a CSV should merge/update, not duplicate
