/**
 * Cross-system consistency tests: stage enums, group completeness,
 * and frontend↔backend alignment.
 *
 * These verify the invariant documented in salesforce.ts:
 * "Stage values MUST match the custom picklist in the Salesforce org
 *  and the OpportunityStage enum in financial_forecasting/models.py."
 */
import {
  OPPORTUNITY_STAGES,
  OPEN_STAGES,
  COLLECTING_STAGES,
  CLOSED_STAGES,
} from './salesforce';

// ---------------------------------------------------------------------------
// Backend stage values (from models.py OpportunityStage enum)
// ---------------------------------------------------------------------------
const BACKEND_STAGES = [
  '--None--',
  'Lead Gen',
  'New Lead',
  'Qualifying',
  'Design / Proposal Creation',
  'Proposal Negotiation',
  'Contract Creation',
  'Negotiating Contract',
  'Collecting / In Effect',
  'Closed / Did not Fulfill',
  'Closed / Completed',
  'Closed Lost',
  'Withdrawn',
] as const;

// ---------------------------------------------------------------------------
// Frontend ↔ Backend alignment
// ---------------------------------------------------------------------------
describe('frontend↔backend stage alignment', () => {
  it('has the same stages as the backend OpportunityStage enum', () => {
    expect([...OPPORTUNITY_STAGES]).toEqual([...BACKEND_STAGES]);
  });

  it('has exactly 13 stages', () => {
    expect(OPPORTUNITY_STAGES).toHaveLength(13);
  });
});

// ---------------------------------------------------------------------------
// Stage group completeness
// ---------------------------------------------------------------------------
describe('stage groups', () => {
  const allGrouped = [...OPEN_STAGES, ...COLLECTING_STAGES, ...CLOSED_STAGES];

  it('every non-None stage belongs to exactly one group', () => {
    const stagesMinusNone = OPPORTUNITY_STAGES.filter((s) => s !== '--None--');
    expect(allGrouped.sort()).toEqual([...stagesMinusNone].sort());
  });

  it('OPEN_STAGES has 7 stages', () => {
    expect(OPEN_STAGES).toHaveLength(7);
  });

  it('COLLECTING_STAGES has 1 stage', () => {
    expect(COLLECTING_STAGES).toHaveLength(1);
  });

  it('CLOSED_STAGES has 4 stages', () => {
    expect(CLOSED_STAGES).toHaveLength(4);
  });

  it('groups are disjoint (no stage in two groups)', () => {
    const seen = new Set<string>();
    for (const stage of allGrouped) {
      expect(seen.has(stage)).toBe(false);
      seen.add(stage);
    }
  });
});

// ---------------------------------------------------------------------------
// Pipeline ordering invariant
// ---------------------------------------------------------------------------
describe('pipeline stage ordering', () => {
  it('OPEN_STAGES appear before COLLECTING and CLOSED in the enum', () => {
    const indices = (stages: readonly string[]) =>
      stages.map((s) => OPPORTUNITY_STAGES.indexOf(s as any));

    const openIndices = indices(OPEN_STAGES);
    const collectingIndices = indices(COLLECTING_STAGES);
    const closedIndices = indices(CLOSED_STAGES);

    // All open stages should precede collecting
    expect(Math.max(...openIndices)).toBeLessThan(Math.min(...collectingIndices));
    // Collecting should precede closed
    expect(Math.max(...collectingIndices)).toBeLessThan(Math.min(...closedIndices));
  });
});
