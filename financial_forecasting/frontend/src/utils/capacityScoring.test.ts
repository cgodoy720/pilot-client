import {
  computeCapacityScore,
  computeSubScores,
  inferProspectType,
  batchScore,
  getWeightsForType,
} from './capacityScoring';
import type { Lead } from '../types/weeklyPriorities';

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-test-0',
    first_name: 'Test',
    last_name: 'User',
    source: 'test.csv',
    status: 'new',
    priority: 'medium',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

describe('inferProspectType', () => {
  it('returns existing prospect_type if set and not unknown', () => {
    const lead = makeLead({ prospect_type: 'hnwi' });
    expect(inferProspectType(lead)).toBe('hnwi');
  });

  it('identifies elected officials from title', () => {
    expect(inferProspectType(makeLead({ title: 'Senator' }))).toBe('elected_official');
    expect(inferProspectType(makeLead({ title: 'City Council Member' }))).toBe('elected_official');
    expect(inferProspectType(makeLead({ title: 'Mayor of New York' }))).toBe('elected_official');
  });

  it('identifies elected officials from government_office', () => {
    expect(inferProspectType(makeLead({ government_office: 'US Senate' }))).toBe('elected_official');
  });

  it('identifies institutional grantmakers from org name', () => {
    expect(inferProspectType(makeLead({ organization: 'Ford Foundation' }))).toBe('institutional_grantmaker');
    expect(inferProspectType(makeLead({ organization: 'Robin Hood Trust' }))).toBe('institutional_grantmaker');
    expect(inferProspectType(makeLead({ organization: 'Gates Charitable Fund' }))).toBe('institutional_grantmaker');
  });

  it('identifies board members', () => {
    expect(inferProspectType(makeLead({ title: 'Board Member at Goldman Sachs', organization: 'Goldman Sachs' }))).toBe('board_member');
    expect(inferProspectType(makeLead({ institutional_role: 'Trustee' }))).toBe('board_member');
  });

  it('identifies HNWI from wealth tier', () => {
    expect(inferProspectType(makeLead({ wealth_tier: 'tier-1' }))).toBe('hnwi');
    expect(inferProspectType(makeLead({ wealth_tier: 'tier-2' }))).toBe('hnwi');
    expect(inferProspectType(makeLead({ net_worth_estimate: 5_000_000 }))).toBe('hnwi');
  });

  it('identifies connectors from strong relationship without wealth', () => {
    expect(inferProspectType(makeLead({ relationship_strength: 5 }))).toBe('connector');
  });

  it('returns unknown when no signals present', () => {
    expect(inferProspectType(makeLead())).toBe('unknown');
  });
});

describe('getWeightsForType', () => {
  it('returns HNWI weights with higher directWealth', () => {
    const w = getWeightsForType('hnwi');
    expect(w.directWealth).toBe(0.35);
    expect(w.institutionalAuthority).toBe(0.15);
  });

  it('returns elected_official weights with higher authority', () => {
    const w = getWeightsForType('elected_official');
    expect(w.institutionalAuthority).toBe(0.35);
    expect(w.directWealth).toBe(0.15);
  });

  it('weights always sum to 1', () => {
    const types: Array<'hnwi' | 'elected_official' | 'institutional_grantmaker' | 'board_member' | 'connector' | 'unknown'> = [
      'hnwi', 'elected_official', 'institutional_grantmaker', 'board_member', 'connector', 'unknown',
    ];
    for (const type of types) {
      const w = getWeightsForType(type);
      const sum = w.directWealth + w.institutionalAuthority + w.givingHistory + w.relationshipAccess + w.affinityTimeline;
      expect(sum).toBeCloseTo(1, 5);
    }
  });
});

describe('computeSubScores', () => {
  it('returns all zeros for empty lead', () => {
    const result = computeSubScores(makeLead());
    expect(result.composite).toBe(0);
    expect(result.directWealth).toBe(0);
    expect(result.institutionalAuthority).toBe(0);
    expect(result.givingHistory).toBe(0);
    expect(result.relationshipAccess).toBe(0);
    expect(result.affinityTimeline).toBe(0);
  });

  it('scores wealth tier correctly', () => {
    const tier1 = computeSubScores(makeLead({ wealth_tier: 'tier-1' }));
    const tier4 = computeSubScores(makeLead({ wealth_tier: 'tier-4' }));
    expect(tier1.directWealth).toBeGreaterThan(tier4.directWealth);
  });

  it('scores institutional authority from org budget', () => {
    const rich = computeSubScores(makeLead({
      prospect_type: 'institutional_grantmaker',
      institution_annual_budget: 500_000_000,
      institutional_role: 'Executive Director',
    }));
    expect(rich.institutionalAuthority).toBeGreaterThan(50);
  });

  it('scores giving history from comparable grants', () => {
    const generous = computeSubScores(makeLead({
      avg_comparable_grant: 500_000,
      estimated_capacity: 1_000_000,
    }));
    expect(generous.givingHistory).toBeGreaterThan(40);
  });

  it('scores relationship access from degrees and strength', () => {
    const close = computeSubScores(makeLead({
      degrees_of_separation: 1,
      relationship_strength: 5,
    }));
    expect(close.relationshipAccess).toBe(100);
  });

  it('scores affinity and timeline', () => {
    const aligned = computeSubScores(makeLead({
      affinity_tags: ['workforce development', 'ai', 'education'],
      timeline_fit: 'immediate',
    }));
    expect(aligned.affinityTimeline).toBeGreaterThan(80);
  });

  it('uses 990 enrichment data when available', () => {
    const enriched = computeSubScores(makeLead({
      total_990_assets: 100_000_000,
      total_990_grants_paid: 20_000_000,
      comparable_grants_to_similar_orgs: 500_000,
    }));
    expect(enriched.directWealth).toBeGreaterThan(0);
    expect(enriched.givingHistory).toBeGreaterThan(0);
  });
});

describe('computeCapacityScore', () => {
  it('returns 0 for empty lead', () => {
    expect(computeCapacityScore(makeLead())).toBe(0);
  });

  it('returns score between 0 and 100', () => {
    const lead = makeLead({
      wealth_tier: 'tier-1',
      net_worth_estimate: 50_000_000,
      avg_comparable_grant: 1_000_000,
      relationship_strength: 4,
      degrees_of_separation: 1,
      affinity_tags: ['education', 'workforce'],
      timeline_fit: '6mo',
    });
    const score = computeCapacityScore(lead);
    expect(score).toBeGreaterThanOrEqual(0);
    expect(score).toBeLessThanOrEqual(100);
    expect(score).toBeGreaterThan(50); // Well-qualified prospect
  });

  it('HNWI with strong signals scores higher than sparse lead', () => {
    const strong = computeCapacityScore(makeLead({
      prospect_type: 'hnwi',
      wealth_tier: 'tier-1',
      net_worth_estimate: 100_000_000,
      annual_giving_history: 5_000_000,
      relationship_strength: 5,
      degrees_of_separation: 1,
      affinity_tags: ['workforce development', 'ai'],
      timeline_fit: 'immediate',
    }));
    const weak = computeCapacityScore(makeLead({
      wealth_tier: 'tier-4',
    }));
    expect(strong).toBeGreaterThan(weak);
  });
});

describe('batchScore', () => {
  it('scores all leads and sets computed_at', () => {
    const leads = [
      makeLead({ id: 'a', wealth_tier: 'tier-1' }),
      makeLead({ id: 'b', organization: 'Ford Foundation' }),
      makeLead({ id: 'c' }),
    ];
    const scored = batchScore(leads);
    expect(scored).toHaveLength(3);
    for (const lead of scored) {
      expect(lead.capacity_score).toBeDefined();
      expect(lead.capacity_computed_at).toBeDefined();
      expect(lead.prospect_type).toBeDefined();
    }
  });

  it('infers prospect type if not set', () => {
    const leads = [
      makeLead({ id: 'a', organization: 'Gates Foundation' }),
      makeLead({ id: 'b', title: 'Senator' }),
    ];
    const scored = batchScore(leads);
    expect(scored[0].prospect_type).toBe('institutional_grantmaker');
    expect(scored[1].prospect_type).toBe('elected_official');
  });

  it('does not overwrite existing prospect_type', () => {
    const leads = [makeLead({ id: 'a', prospect_type: 'connector' })];
    const scored = batchScore(leads);
    expect(scored[0].prospect_type).toBe('connector');
  });
});
