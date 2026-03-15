# Documentation Review — 2026-03-15

Comprehensive review of all product documentation. Flagged concerns organized by severity.

---

## Critical / Blocking

### 1. Two apps with no merge plan

Bedrock (React + MUI/CRA, in `financial_forecasting/frontend/`) shipped weeks 1–2. The Prospect Dashboard (React + Vite + Tailwind + shadcn/ui) is specced in `raw-prds/prospect-dashboard/` but not yet started. The docs say "Vite does not apply to week 1" but never state:

- When/if Bedrock migrates to the Prospect Dashboard stack
- Whether the two apps coexist long-term
- How features built in Bedrock transfer to Prospect Dashboard

**Affected files:** `CLAUDE.md`, `product/ROADMAP-AND-STANDARDS.md`, `product/fundraising-team/raw-prds/prospect-dashboard/decisions/2026-03-13-react-vite-stack.md`

**Recommendation:** Write an "App Architecture" doc clarifying the long-term relationship and migration plan.

---

### 2. Open questions from `vision.md` remain unresolved

Six questions at the end of `product/fundraising-team/raw-prds/prospect-dashboard/vision.md` are unanswered:

1. Does Nick's LinkedIn export exist? What fields?
2. What external HNWI/prospect lists does the team have? Format? Record count?
3. Existing pipeline data (spreadsheet or Salesforce export)?
4. Are opportunity stages accurate?
5. How many users? Shared link or password protection?
6. Nick's prioritization criteria (sectors, regions, giving interests)?

These block the network search feature entirely — the algorithm cannot be calibrated without real data.

**Recommendation:** Answer these before any further Prospect Dashboard development.

---

### 3. Network search scoring weights are uncalibrated

`product/fundraising-team/raw-prds/prospect-dashboard/specs/network-search.md` defines a composite score:

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

The document itself says: *"Weights and tier mappings should be calibrated against real data in Phase 2."* The "Hot / Warm / Worth Exploring" tiers (≥75, 50–74, <50) depend on these untested weights.

**Risk:** Poorly calibrated scores waste JP's time surfacing irrelevant contacts.

**Recommendation:** Run a proof-of-concept with real data before locking weights.

---

### 4. `home-page-spec.md` is severely out of scope

`product/fundraising-team/phases/home-page-spec.md` is labeled "Draft" but describes a full pipeline automation system:

- Google Calendar integration with keyword matching + manual mapping + feedback loop
- Gmail → Activity → Salesforce sync
- Slack → Chatter + Task
- Automation review queue with confidence tags
- Claude API for suggested task generation

This is Phase 4+ territory. The spec has no phase assignment, no MVP definition, and no prioritized checklist. The implementation checklist mixes 11 backend + 10 frontend items with no priority ordering.

**Recommendation:** Trim to a scoped MVP; defer Gmail/Slack/Chatter/automation to Phase 4+.

---

### 5. No data migration path from Bedrock to Prospect Dashboard

- Weeks 1–2 (Bedrock) store leads in **localStorage**; no Salesforce sync
- Prospect Dashboard uses **IndexedDB** (Dexie.js)
- No data export, import, or sync path exists between them

If real lead data accumulates in Bedrock over the coming weeks/months, there is no plan to transfer it.

**Affected files:** `product/fundraising-team/phases/week-2-pipeline-dashboard-network.md`, `product/fundraising-team/raw-prds/prospect-dashboard/decisions/2026-03-13-indexeddb-for-prototype.md`

**Recommendation:** Document an export/import path before loading real data.

---

## Structural / Design Concerns

### 6. Phase numbering is ambiguous

Three separate numbering systems exist:

| System | Meaning | Source |
|--------|---------|--------|
| Week 1, Week 2 | Calendar weeks (shipped) | `phases/week-1-prototype.md`, `phases/week-2-*` |
| Phase 1–3 | Grants → invoicing → reporting (PRD roadmap) | `phases/README.md`, `PRD.md` |
| Phase 1–3 | 7-day dev cycles in 1-month build | `raw-prds/prospect-dashboard/vision.md` |

These are never reconciled. "Phase 2" means something different in each context.

**Recommendation:** Create a single unified roadmap with calendar dates.

---

### 7. `Activity` entity allows orphaned records

`product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md` defines Activity with three optional parent references:

```typescript
contact_id?: string;       // Optional
opportunity_id?: string;   // Optional
lead_id?: string;          // Optional
```

All three can be null simultaneously — an activity with no parent. The spec also doesn't clarify whether activities can be multi-parented (linked to both Contact AND Opportunity for the same interaction).

**Recommendation:** Add a minimum-parent constraint (at least one must be non-null). Document multi-parent semantics.

---

### 8. `Opportunity` supports only one contact

`data-model.md` uses `primary_contact_id: string` (singular). Real fundraising involves coordinating with multiple people at an organization. A foundation grant might involve a program officer, a CFO, and an executive sponsor.

**Recommendation:** Consider a junction table or at minimum a `secondary_contact_ids` array.

---

### 9. `NetworkMatch` schema doesn't handle ambiguous matches

Fuzzy matching a 5,000-contact LinkedIn export against a 3,000-record prospect list will produce many-to-many ambiguities (e.g., multiple "John Smith" hits). The `NetworkMatch` entity stores one `linkedin_contact_id` and one `prospect_list_source` but doesn't model:

- Multiple candidate matches per prospect
- User resolution of ambiguous matches
- Confidence-ranked alternatives

**Recommendation:** Add a match-candidates model or document the resolution workflow.

---

### 10. `Lead` is defined inconsistently across four sources

| Source | Definition |
|--------|-----------|
| `home-page-spec.md` | Fundraising prospects not yet qualified |
| `knowledge-graph-compat.md` | Learning platform admissions/marketing leads |
| Decision 6.3 (`home-page-spec.md`) | Salesforce Lead as system of record |
| Weeks 1–2 implementation | `localStorage`, no Salesforce sync |

No single canonical definition or storage location for leads.

**Recommendation:** Write a "Lead Entity" decision doc that resolves all four sources.

---

### 11. Sequential IDs assume a global counter

`data-model.md` uses `opp-2026-{nnn}` patterns. No mechanism prevents collisions under concurrent creates. This matters when the system migrates to PostgreSQL with multiple users.

**Recommendation:** Use timestamp-based IDs or UUIDs with human-readable prefixes.

---

### 12. Payment schedule validation gap

`PRD.md` requires total payments to equal opportunity amount but doesn't define what happens when a user manually edits one payment. No "fix total" action, rejection logic, or tolerance threshold documented.

**Recommendation:** Define validation behavior for manual edits (reject, warn, or auto-adjust).

---

## Security Concerns

### 13. Prototype security assumptions are vague

`product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md` says IndexedDB without encryption is "acceptable risk for internal team use on Pursuit-managed devices." But:

- "Pursuit-managed device" is never defined
- Deployment audience (team only? investors? board?) is unspecified
- No explicit sign-off documented

The data involved: wealth tiers, donor PII, pipeline financials, relationship intelligence, internal cultivation strategy.

**Recommendation:** Get written sign-off from leadership. Define device and audience scope.

---

### 14. Claude API governance is undefined

`home-page-spec.md §3.3` references "the org's Claude subscription" with a single backend API key. Missing:

- Procurement plan
- Monthly budget estimate
- Key ownership and rotation policy
- Cost monitoring and alerting

**Recommendation:** Define API governance before integrating Claude.

---

## Missing Documentation

### 15. No Salesforce integration spec

Both `PRD.md` and `home-page-spec.md` assume Salesforce as the source of truth. No documentation exists for:

- API contracts and field mappings
- Rate limits and quotas
- Error handling and fallback behavior
- Which Salesforce objects are used and how

**Recommendation:** Write a Salesforce integration spec before building any sync features.

---

### 16. No test strategy

No unit, integration, or E2E test plan for any feature. No sample CSV fixtures for Week 1 validation. The spec says "smoke test" but provides no fixture data.

**Recommendation:** Create sample CSV fixtures and define acceptance test scenarios per feature.

---

### 17. No IndexedDB → PostgreSQL migration plan

`product/fundraising-team/raw-prds/prospect-dashboard/decisions/2026-03-13-indexeddb-for-prototype.md` says "migrate in Phase 4+" but specifies no plan for how real prototype data gets exported and imported.

**Risk:** Data loss if the team uses the prototype with real data for months.

**Recommendation:** Document migration plan before loading real data.

---

### 18. `knowledge-graph-compat.md` references a missing file

`product/fundraising-team/raw-prds/prospect-dashboard/architecture/knowledge-graph-compat.md` cites `pursuit-knowledge-graph-architecture.md` as a parent document. That file does not exist in the repo.

**Recommendation:** Either write the referenced doc or remove the reference.

---

### 19. Transcript pipeline is blocked on hardware

`product/fundraising-team/raw-prds/prospect-dashboard/architecture/transcript-reliability.md` documents that 9 of 10 Fireflies transcripts fail because the Jackson Heights conference room doesn't route audio through Zoom. A speakerphone purchase is needed. This blocker is not tracked in any roadmap.

**Recommendation:** Add the speakerphone purchase as a tracked dependency for the transcript pipeline.

---

## Contradictions

| # | Issue | Source A | Source B |
|---|-------|----------|----------|
| C1 | Team data sharing | week-2: "Team members can assign and update leads" | indexeddb-for-prototype: "Single-device lock-in" |
| C2 | Slack integration timeline | `phases/README.md`: Phase 3 | `home-page-spec.md`: described as imminent |
| C3 | Prospect list availability | `network-search.md`: spec assumes lists exist | `vision.md` open questions: lists not yet identified |
| C4 | Lead storage | Decision 6.3: Salesforce Lead as system of record | Weeks 1–2: localStorage, no Salesforce sync |

---

## Recommendations Summary

| # | Action | Priority |
|---|--------|----------|
| 1 | Close the 6 open questions in `vision.md` | **Blocking** |
| 2 | Write unified roadmap with calendar dates | **High** |
| 3 | Write "App Architecture" doc (Bedrock vs. Prospect Dashboard) | **High** |
| 4 | Trim `home-page-spec.md` to scoped MVP | **High** |
| 5 | Define canonical Lead entity and storage | **High** |
| 6 | Add minimum-parent constraint to Activity | **Medium** |
| 7 | Document IndexedDB → PostgreSQL migration plan | **Medium** |
| 8 | Get written security sign-off for prototype | **Medium** |
| 9 | Create sample CSV fixtures for testing | **Medium** |
| 10 | Track speakerphone purchase as roadmap dependency | **Low** |

---

## Files Reviewed

- `CLAUDE.md`
- `PRD.md`
- `product/overview.md`
- `product/ROADMAP-AND-STANDARDS.md`
- `product/REQUIREMENTS-GAPS-AND-STRUCTURE.md`
- `product/learning-platform-integration.md`
- `product/fundraising-team/vision.md`
- `product/fundraising-team/phases/README.md`
- `product/fundraising-team/phases/week-1-prototype.md`
- `product/fundraising-team/phases/week-2-pipeline-dashboard-network.md`
- `product/fundraising-team/phases/home-page-spec.md`
- `product/fundraising-team/phases/custom-reports.md`
- `product/fundraising-team/phases/slack-data-entry-and-review.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/vision.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/CLAUDE.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/specs/opportunity-pipeline.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/specs/leads-tracker.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/specs/network-search.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/specs/calendar-tasks.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/specs/transcript-pipeline.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/data-model.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/security-requirements.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/knowledge-graph-compat.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/architecture/transcript-reliability.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/decisions/2026-03-13-react-vite-stack.md`
- `product/fundraising-team/raw-prds/prospect-dashboard/decisions/2026-03-13-indexeddb-for-prototype.md`
