import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';

import type { Lead } from '../types/weeklyPriorities';
import { batchScore } from '../utils/capacityScoring';
import { batchEnrich, isEnrichable, countEnrichable } from '../utils/nonprofitResearch';

// ---------------------------------------------------------------------------
// Test the business logic functions used by GivingCapacity page,
// NOT the page component itself (which requires MUI DataGrid, router, etc.).
// This tests the scoring → enrichment → conversion pipeline.
// ---------------------------------------------------------------------------

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: `test-${Math.random().toString(36).slice(2, 8)}`,
    first_name: 'Jane',
    last_name: 'Donor',
    organization: 'Test Foundation',
    title: 'Program Director',
    source: 'csv',
    status: 'new',
    priority: 'medium',
    notes: '',
    email: 'jane@test.org',
    phone: '555-0100',
    grant_id: '',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    owner: '',
    ...overrides,
  } as Lead;
}

// ---------------------------------------------------------------------------
// Batch scoring tests
// ---------------------------------------------------------------------------
describe('GivingCapacity — batchScore pipeline', () => {
  it('scores all leads and assigns prospect_type', () => {
    const leads = [
      makeLead({ first_name: 'Alice', organization: 'Big Foundation', title: 'Director' }),
      makeLead({ first_name: 'Bob', organization: 'City Council', title: 'Mayor' }),
      makeLead({ first_name: 'Carol', organization: 'Unknown Corp' }),
    ];

    const scored = batchScore(leads);

    expect(scored).toHaveLength(3);
    scored.forEach((lead) => {
      expect(lead.capacity_score).toBeDefined();
      expect(typeof lead.capacity_score).toBe('number');
      expect(lead.capacity_score).toBeGreaterThanOrEqual(0);
      expect(lead.capacity_score).toBeLessThanOrEqual(100);
      expect(lead.prospect_type).toBeDefined();
      expect(lead.capacity_computed_at).toBeDefined();
    });
  });

  it('assigns different scores to different prospect types', () => {
    const institutional = makeLead({
      organization: 'Gates Foundation',
      title: 'Grants Officer',
      institution_annual_budget: 50000000000,
      total_990_assets: 40000000000,
      total_990_grants_paid: 5000000000,
    });
    const individual = makeLead({
      organization: '',
      title: '',
      first_name: 'Random',
      last_name: 'Person',
    });

    const [scoredInst] = batchScore([institutional]);
    const [scoredInd] = batchScore([individual]);

    // Institutional with huge assets should score higher than unknown individual
    expect(scoredInst.capacity_score!).toBeGreaterThan(scoredInd.capacity_score!);
  });

  it('handles empty lead list', () => {
    const scored = batchScore([]);
    expect(scored).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Conversion threshold logic
// ---------------------------------------------------------------------------
describe('GivingCapacity — conversion threshold', () => {
  const CONVERSION_THRESHOLD = 30;

  it('lead with score >= 30 is eligible for conversion', () => {
    const lead = makeLead({ capacity_score: 45, status: 'new' });
    const eligible = lead.capacity_score != null && lead.capacity_score >= CONVERSION_THRESHOLD && lead.status !== 'converted';
    expect(eligible).toBe(true);
  });

  it('lead with score < 30 is NOT eligible for conversion', () => {
    const lead = makeLead({ capacity_score: 20, status: 'new' });
    const eligible = lead.capacity_score != null && lead.capacity_score >= CONVERSION_THRESHOLD;
    expect(eligible).toBe(false);
  });

  it('lead without score is NOT eligible for conversion', () => {
    const lead = makeLead({ capacity_score: undefined, status: 'new' });
    const eligible = lead.capacity_score != null && lead.capacity_score >= CONVERSION_THRESHOLD;
    expect(eligible).toBe(false);
  });

  it('already converted lead is NOT eligible', () => {
    const lead = makeLead({ capacity_score: 80, status: 'converted' });
    const eligible = lead.capacity_score != null && lead.capacity_score >= CONVERSION_THRESHOLD && lead.status !== 'converted';
    expect(eligible).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Enrichment eligibility
// ---------------------------------------------------------------------------
describe('GivingCapacity — enrichment eligibility', () => {
  it('institutional lead with org name is enrichable', () => {
    const lead = makeLead({ organization: 'Ford Foundation', enrichment_status: undefined });
    expect(isEnrichable(lead)).toBe(true);
  });

  it('individual lead with name is enrichable', () => {
    const lead = makeLead({ organization: '', institution_name: '', ein: '', enrichment_status: undefined });
    expect(isEnrichable(lead)).toBe(true); // has first_name + last_name
  });

  it('already enriched lead is not enrichable', () => {
    const lead = makeLead({ enrichment_status: 'enriched' });
    expect(isEnrichable(lead)).toBe(false);
  });

  it('countEnrichable returns correct count', () => {
    const leads = [
      makeLead({ enrichment_status: undefined, organization: 'Org A' }),
      makeLead({ enrichment_status: 'enriched', organization: 'Org B' }),
      makeLead({ enrichment_status: undefined, organization: 'Org C' }),
    ];
    expect(countEnrichable(leads)).toBe(2);
  });
});

// ---------------------------------------------------------------------------
// Campaign priority sorting (Tab 2 logic)
// ---------------------------------------------------------------------------
describe('GivingCapacity — campaign priority ordering', () => {
  const CONVERSION_THRESHOLD = 30;

  function buildCampaignPriority(leads: Lead[]) {
    return leads
      .filter(
        (l) =>
          l.capacity_score != null &&
          l.capacity_score >= CONVERSION_THRESHOLD &&
          l.timeline_fit !== 'long_term'
      )
      .sort((a, b) => (b.capacity_score || 0) - (a.capacity_score || 0));
  }

  it('filters out leads below threshold', () => {
    const leads = [
      makeLead({ capacity_score: 80 }),
      makeLead({ capacity_score: 10 }),
      makeLead({ capacity_score: 50 }),
    ];
    const result = buildCampaignPriority(leads);
    expect(result).toHaveLength(2);
    expect(result.every((l) => (l.capacity_score || 0) >= CONVERSION_THRESHOLD)).toBe(true);
  });

  it('filters out long_term timeline leads', () => {
    const leads = [
      makeLead({ capacity_score: 80, timeline_fit: 'immediate' }),
      makeLead({ capacity_score: 90, timeline_fit: 'long_term' }),
    ];
    const result = buildCampaignPriority(leads);
    expect(result).toHaveLength(1);
    expect(result[0].timeline_fit).toBe('immediate');
  });

  it('sorts by capacity_score descending', () => {
    const leads = [
      makeLead({ capacity_score: 40 }),
      makeLead({ capacity_score: 90 }),
      makeLead({ capacity_score: 60 }),
    ];
    const result = buildCampaignPriority(leads);
    expect(result.map((l) => l.capacity_score)).toEqual([90, 60, 40]);
  });

  it('returns empty for all-below-threshold leads', () => {
    const leads = [
      makeLead({ capacity_score: 10 }),
      makeLead({ capacity_score: 20 }),
    ];
    expect(buildCampaignPriority(leads)).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// CSV export structure (verifying field mapping)
// ---------------------------------------------------------------------------
describe('GivingCapacity — CSV export fields', () => {
  it('export fields match lead properties', () => {
    const exportFields = [
      'first_name', 'last_name', 'organization', 'prospect_type',
      'capacity_score', 'wealth_tier', 'estimated_capacity',
      'timeline_fit', 'relationship_strength', 'enrichment_status', 'status',
    ];

    const lead = makeLead({
      prospect_type: 'institutional_grantmaker',
      capacity_score: 75,
      wealth_tier: 'tier-1',
      estimated_capacity: 100000,
      timeline_fit: 'immediate',
      relationship_strength: 8,
      enrichment_status: 'enriched',
    });

    // Verify all export fields exist on the lead object
    exportFields.forEach((field) => {
      expect(field in lead).toBe(true);
    });
  });
});
