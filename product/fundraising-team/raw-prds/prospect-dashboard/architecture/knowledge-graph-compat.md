---
type: architecture-doc
id: arch-knowledge-graph-compat
status: draft
created: 2026-03-13
updated: 2026-03-13
---

# Knowledge Graph Compatibility

## The big picture

The Prospect Dashboard is the first concrete project in a larger vision: a structured Pursuit knowledge graph that captures institutional knowledge as traversable, composable markdown files. This document defines the conventions that make the dashboard forward-compatible with that future graph.

Full architecture: see `pursuit-knowledge-graph-architecture.md` (in the parent outputs directory).

## How dashboard entities map to graph nodes

Every entity in [[data-model]] should be representable as a markdown file:

| Entity | Graph path | Filename pattern |
|--------|-----------|-----------------|
| Opportunity | `fundraising/pipeline/opportunities/` | `opp-2026-003.md` |
| Lead | `fundraising/pipeline/leads/` | `lead-2026-042.md` |
| Contact | `fundraising/contacts/` | `contact-sarah-chen.md` |
| Account | `fundraising/accounts/` | `acct-goldman-sachs-foundation.md` |
| NetworkMatch | `fundraising/prospects/network-matches/` | `match-sarah-chen-hnwi-list.md` |
| Task | Embedded in parent opportunity/lead | In YAML `tasks:` array |
| Activity | `meetings/extracted/` or embedded | `mtg-2026-03-12-nick-erica.md` |

## File convention

Every node follows this pattern:

```markdown
---
type: opportunity              # Entity type
id: opp-2026-003               # Human-readable, collision-resistant ID
[entity-specific fields]       # All fields from data model as YAML
tags: [corporate-foundation, tech-workforce, tier-1]
created: 2026-03-01
updated: 2026-03-12
---

# [Human-readable title]

## Current Status
[Narrative description]

## Decision Log
- **[date]**: Decision. Reasoning. [[related-note]]

## Related
- [[contact-sarah-chen]]
- [[acct-goldman-sachs-foundation]]
- [[mtg-2026-03-05-strategy-call]]
```

## Structural primitives

These are the building blocks that make a graph traversable:

1. **YAML frontmatter** — queryable metadata on every file. Agents can filter, sort, and aggregate without reading the full content.

2. **Wikilinks** (`[[double-bracket]]`) — semantic connections between notes. `[[contact-sarah-chen]]` creates a traversable link from an opportunity to a contact. In the prototype, these are just text patterns. In the full graph, they're navigable.

3. **Atomic notes** — one concept, one decision, one contact per file. Small files that can be composed into larger views.

4. **Maps of content** — index files that give topology. `pipeline-state.md` is a map of content for all active opportunities. `prospect-research-index.md` indexes all research briefs.

5. **Decision logs** — every decision with reasoning and alternatives. Captured inline in entity files AND as standalone files in `decisions/` for cross-cutting decisions.

6. **Confidence metadata** — source quality, extraction status, review status. See [[transcript-reliability]].

## ID conventions

IDs must be:
- Human-readable (not UUIDs)
- Collision-resistant (include date or sequence number)
- Valid filenames (lowercase, hyphens, no spaces)
- Consistent across the system

| Entity | Pattern | Example |
|--------|---------|---------|
| Opportunity | `opp-YYYY-NNN` | `opp-2026-003` |
| Lead | `lead-YYYY-NNN` | `lead-2026-042` |
| Contact | `contact-{slug}` | `contact-sarah-chen` |
| Account | `acct-{slug}` | `acct-goldman-sachs-foundation` |
| Task | `task-YYYY-NNN` | `task-2026-017` |
| NetworkMatch | `match-{linkedin-slug}-{source}` | `match-sarah-chen-hnwi-2026` |
| Activity | `act-YYYY-NNN` | `act-2026-005` |
| Meeting extract | `mtg-YYYY-MM-DD-{slug}` | `mtg-2026-03-12-nick-erica` |
| Decision | `dec-YYYY-MM-DD-{slug}` | `dec-2026-03-13-indexeddb-prototype` |

## What to implement now (Phases 1-3)

- Use these ID patterns in IndexedDB from day one
- Include `tags` arrays on entities that will need flexible categorization
- Store notes as plain text that can contain `[[wikilink]]` patterns (even if not yet navigable)
- Include `source_type` and `source_quality` on Activity records
- Export functionality should produce markdown files matching the convention above (in addition to CSV)

## What to implement later (Phase 4+)

- Markdown export that generates the full graph folder structure from the database
- Wikilink resolution: clicking `[[contact-sarah-chen]]` navigates to that record
- Maps of content auto-generated from database queries
- Graph visualization showing relationship density between entities
- Agent traversal: Claude reads the graph to prepare briefings, research, proposals
