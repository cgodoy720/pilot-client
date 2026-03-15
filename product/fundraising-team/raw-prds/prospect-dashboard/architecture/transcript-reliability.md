---
type: architecture-doc
id: arch-transcript-reliability
status: draft
created: 2026-03-13
updated: 2026-03-13
referenced_by: ["[[transcript-pipeline]]"]
---

# Transcript Reliability

## The problem

Fireflies transcripts are unreliable at Pursuit. Based on actual data from JP's account (March 2026):

- **9 out of 10** recent meetings were flagged `silent_meeting` with summaries skipped entirely
- Fireflies joined, detected no usable audio, and produced nothing (~11 seconds of recording each)
- The **one successful transcript** was a 1-on-1 Zoom call with separate audio streams (Ariel mock interview — 76 minutes, fully transcribed with summary)
- The **one partially captured** meeting (Nick/Erica) got only 20 seconds of preamble from a shared room mic before losing audio

When shared-mic recordings DO capture audio, they produce:
- Speaker misattribution ("Speaker 2" instead of the actual person)
- Word-level transcription errors
- Fragmented sentences (one thought split across 5+ entries)
- Crosstalk artifacts from overlapping speech

**Root cause:** Most Pursuit meetings happen in the Jackson Heights HQ with people in the same room. Fireflies' bot joins the Zoom call but hears nothing because the room audio isn't being routed through Zoom properly.

## Transcripts cannot be treated as ground truth

This is a foundational architectural constraint. Any system that ingests meeting data must:
1. Handle absent transcripts (the common case)
2. Handle noisy/incomplete transcripts (the partial case)
3. Handle clean transcripts (the rare case, typically remote 1-on-1s)
4. Combine multiple sources to reconstruct meeting content
5. Tag every extracted claim with confidence and source

## The five-layer solution

### Layer 1: Improve capture (hardware/process)

- Conference speakerphone (Jabra Speak 750 or Meeting Owl) in the HQ conference room — routes room audio through Zoom so Fireflies can hear it
- Individual Zoom joins from laptops even when co-located — gives Fireflies separate audio per speaker (best for attribution)
- For fully in-person meetings: local recording on a phone (Voice Memos, Otter), uploaded to Fireflies after
- **Single highest-leverage fix:** get a speakerphone for the Jackson Heights conference room

### Layer 2: Multi-source input

Each meeting node in the knowledge graph draws from multiple sources:

```yaml
sources:
  - type: fireflies-transcript
    id: 01KKA1W8RKC27J5Z3B5F1K1S0A
    quality: poor          # poor | partial | good
    duration_captured: 20s
  - type: brain-dump
    quality: high
    captured_at: "2026-03-12T14:15:00"
    captured_by: jp
    method: typed           # typed | voice-memo | slack-notes
  - type: calendar-context
    attendees: [nick, erica, jp]
    agenda: "Pipeline review, LinkedIn data discussion"
```

The **brain dump** is the highest-leverage habit: within 30 minutes of a meeting, a 2-minute typed or voice note captures what the transcript missed. An agent can combine noisy transcript + clean brain dump and produce a much better extraction than either alone.

### Layer 3: Confidence-aware extraction

Every extracted claim carries a confidence tag:

- **high**: Corroborated by multiple sources, or from a clean transcript with correct speaker attribution
- **medium**: Single source, plausible but not verified
- **low**: Inferred, speaker uncertain, or from noisy transcript
- **needs-verification**: Contradicts other information or has explicit uncertainty

### Layer 4: File format encodes uncertainty

Meeting extract files carry quality metadata in YAML frontmatter:

```yaml
transcript_quality: poor       # poor | partial | good
speaker_confidence: low        # low | medium | high
extraction_status: draft       # draft | human-reviewed | verified
primary_source: brain-dump     # which source contributed most
reviewed_by: null
reviewed_at: null
```

Any agent traversing the graph sees this metadata and adjusts its confidence accordingly.

### Layer 5: Trust propagation across the graph

- When extracts link to other notes via wikilinks, the connection inherits source quality context
- Contradictions between notes trigger a check of source quality metadata
- Over time, human reviews increase the graph's overall trust level
- An agent preparing a deliverable (e.g., donor briefing) weights "verified" extracts more heavily than "draft" extracts

## What this means for the prototype data model

Even though the full transcript pipeline isn't built in Phases 1-3, the data model should:
- Include `source_type` and `source_quality` fields on the `Activity` entity
- Support meeting ID patterns: `mtg-YYYY-MM-DD-slug`
- Allow free-text notes fields that can contain wikilink-style references
- Not assume any single source of truth for meeting content

## Immediate actions (not software)

1. **Buy a conference speakerphone** for the Jackson Heights HQ conference room
2. **Start the brain-dump habit**: 2-minute typed notes after every meeting with Nick, Erica, or external stakeholders
3. **Store brain dumps consistently**: a dedicated Slack channel, a shared Google Doc, or a folder — anywhere as long as it's the same place every time
