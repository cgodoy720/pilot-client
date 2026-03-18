---
type: feature-spec
id: spec-transcript-pipeline
status: future
phase: 4+
depends_on: ["[[data-model]]", "[[transcript-reliability]]"]
note: "Not built in Phases 1-3. This spec documents the future pipeline so architectural decisions made now are forward-compatible."
---

# Meeting Transcript Pipeline

## What it does

An agent-powered pipeline that processes Fireflies meeting transcripts (combined with post-meeting brain dumps and calendar context) into structured, confidence-tagged extracts that feed the knowledge graph. This is NOT part of the prototype dashboard build — it's documented here so the data model and file conventions are compatible from day one.

## Why this matters now

Pursuit's Fireflies transcripts are unreliable. Based on actual data (March 2026): 9 of 10 recent meetings produced no usable transcript (silent_meeting). When transcripts do exist, shared-room recordings produce speaker misattribution and word errors. See [[transcript-reliability]] for the full analysis.

The pipeline must handle noisy, incomplete, and sometimes absent input — and still extract value. The key architectural insight: no single source is reliable enough. Each meeting node draws from multiple inputs.

## Pipeline design

```
Meeting occurs
    ↓
Sources captured:
    1. Fireflies transcript (auto, if available — often poor quality)
    2. Brain dump (human, 2 min post-meeting — highest value source)
    3. Calendar context (auto — attendees, agenda, meeting title)
    ↓
Transcript enrichment agent (pre-extraction) — see § Transcript enrichment agent below:
    - Ingest raw Fireflies transcript
    - Query knowledge graph (contacts, accounts, opportunities, past meeting extracts)
    - Query MCP, Drive, and other connectors for related context (attendees, prior notes, linked docs)
    - Improve transcript: correct names/entities, resolve acronyms, suggest speaker IDs from contacts, fix obvious errors
    - Output: improved transcript with suggested links and corrections (before extraction)
    ↓
Agent extraction pass:
    - Uses improved transcript + brain dump + calendar
    - Extract: claims, decisions, action items, strategic shifts
    - Tag each with confidence: high / medium / low / needs-verification
    - Flag speaker attribution uncertainties
    - Cross-reference brain dump against transcript to resolve ambiguities
    ↓
Structured draft (markdown with confidence metadata)
    ↓
Human review queue (meeting owner, 5-10 min):
    - Confirm/correct speaker attribution
    - Verify key decisions and claims
    - Fill remaining gaps from memory
    ↓
Verified extract → enters knowledge graph as trusted state
    - Links to related opportunities, contacts, decisions via wikilinks
    - Feeds into pipeline dashboards, prospect research, funder briefs
```

---

## Transcript enrichment agent (pre-extraction)

**Goal:** Before a raw Fireflies transcript is used in the extraction pipeline, a **dedicated agent** improves it by comparing the transcript to the knowledge graph and other context (MCP, Drive, connectors). The improved transcript is then what gets fed into the extraction pass, so downstream quality is higher.

**Why:** Raw Fireflies output has speaker misattribution, word errors, and ambiguous references (names, orgs, acronyms). Enrichment uses existing institutional context to correct and disambiguate before we extract structured claims.

**Inputs:**
- Raw Fireflies transcript (text + optional speaker segments)
- Calendar context for the meeting (attendees, title, agenda)
- **Knowledge graph:** contacts, accounts, opportunities, past meeting extracts (names, orgs, linked entities)
- **MCP (Model Context Protocol):** tools/servers that expose Salesforce, Drive, or other connectors — e.g. lookup contacts by name, fetch related docs, resolve opportunity/account references
- **Drive / connectors:** related docs (agendas, prior notes, shared folders) for the meeting or attendees

**Agent behavior:**
- Resolve speaker labels (e.g. “Speaker 2” → suggested Contact or attendee from calendar + knowledge graph)
- Correct or suggest corrections for names, organizations, and acronyms using graph + MCP/Drive
- Link mentioned entities to knowledge-graph nodes (opportunities, contacts, accounts) where confident
- Fix obvious transcription errors (e.g. “Pursuit” vs “pursue”) using org vocabulary
- Output an **improved transcript** (or diff + suggestions) that preserves the original but adds: suggested speaker IDs, entity links, corrections, and confidence markers. Human review can confirm/reject before extraction.

**Placement:** Runs after Fireflies delivers the transcript and before (or in tandem with) the extraction agent. Can be the same codebase as the extraction agent but a distinct step so we can iterate on enrichment logic separately.

**References:** [[transcript-reliability]] (multi-source, confidence); [[knowledge-graph-compat]] (entity IDs, wikilinks). MCP/Drive connector specs TBD per environment.

## Meeting extract file format

```markdown
---
type: meeting-extract
id: mtg-2026-03-12-nick-erica
source_meeting: "Nick / Erica pipeline review"
date: 2026-03-12
attendees: [nick, erica, jp]
sources:
  - type: fireflies-transcript
    quality: poor
    id: 01KKA1W8RKC27J5Z3B5F1K1S0A
  - type: brain-dump
    quality: high
    captured_by: jp
  - type: calendar-context
    agenda: "Pipeline review, LinkedIn data discussion"
transcript_quality: poor
speaker_confidence: low
extraction_status: draft
primary_source: brain-dump
reviewed_by: null
reviewed_at: null
---

# Nick / Erica — Pipeline Review — March 12, 2026

## Extraction Notes
[How this extract was produced, source quality, caveats]

## Decisions
- **[confidence: high, source: brain-dump]** Decision text. Reasoning.
- **[confidence: medium, source: transcript]** Decision text. [[related-note]]

## Action Items
- Assignee: task description [source, confidence]

## Claims & Context
- [confidence: high] Factual claims or strategic context extracted

## Open Questions
- Questions raised but not resolved in this meeting
```

## What this means for Phases 1-3

Even though the pipeline isn't built yet, the following should be true of the prototype data model:
- The `Activity` entity should have fields for `source_type` and `source_quality`
- Contact and Opportunity records should support wikilink-style references in their notes fields
- The ID pattern for meetings (`mtg-YYYY-MM-DD-slug`) should be established now
- The brain-dump habit should start immediately — even just typed notes in a consistent location

## Data model dependencies

Uses from [[data-model]]:
- `Activity` entity (extended with source metadata)
- `Contact` entity (linked via attendees)
- `Opportunity` entity (linked via extracted decisions/action items)

## Exit criteria (Phase 4+)

- [ ] **Enrichment agent:** Improves raw Fireflies transcript using knowledge graph + MCP + Drive/connectors before extraction; outputs suggested speaker IDs, entity links, and corrections (with optional human confirm step).
- [ ] Agent processes a Fireflies transcript + brain dump into a structured extract (using improved transcript when available).
- [ ] Confidence tags appear on every extracted claim
- [ ] Human review interface allows confirm/correct/fill workflow
- [ ] Verified extracts link to relevant opportunities and contacts via wikilinks
- [ ] Extract metadata (quality, confidence, review status) is queryable
