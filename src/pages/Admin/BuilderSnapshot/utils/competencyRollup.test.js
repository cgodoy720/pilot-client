import { describe, it, expect } from 'vitest';
import { computeCompetencyRollup } from './competencyRollup';

const FAKE_TAXONOMY = {
  categories: { ai: { name: 'AI Fluency' }, swe: { name: 'Software Engineering' } },
  skills: {
    'write-structure-prompts': { name: 'Write & Structure Prompts', slug: 'write-structure-prompts', category: 'ai' },
    'evaluate-ai-critically':   { name: 'Evaluate AI Critically',   slug: 'evaluate-ai-critically',   category: 'ai' },
    'write-clean-code':         { name: 'Write Clean Code',         slug: 'write-clean-code',         category: 'swe' },
    'debug-systematically':     { name: 'Debug Systematically',     slug: 'debug-systematically',     category: 'swe' },
  },
  foundationalCompetencies: {
    'critical-thinking': {
      name: 'Critical Thinking',
      definition: 'Reasons rigorously about problems.',
      developedThrough: ['evaluate-ai-critically', 'debug-systematically'],
    },
    'technical-craft': {
      name: 'Technical Craft',
      definition: 'Builds robust software.',
      // includes a bad-data slug not present in skills:
      developedThrough: ['write-structure-prompts', 'write-clean-code', 'ghost-skill-not-in-taxonomy'],
    },
    'communication': {
      name: 'Communication',
      definition: 'Communicates clearly.',
      developedThrough: ['write-structure-prompts'],
    },
  },
};

const byKey = (rows, key) => rows.find((r) => r.key === key);

describe('computeCompetencyRollup', () => {
  it('rolls scored skills up to a per-competency mean, rounded', () => {
    const levels = {
      'evaluate-ai-critically': 67,
      'debug-systematically': 80,
      'write-structure-prompts': 82,
      'write-clean-code': 55,
    };
    const out = computeCompetencyRollup(levels, FAKE_TAXONOMY);

    const ct = byKey(out, 'critical-thinking');
    const tc = byKey(out, 'technical-craft');

    // (67 + 80) / 2 = 73.5 → Math.round → 74
    expect(ct.score).toBe(74);
    // (82 + 55) / 2 = 68.5 → Math.round → 69
    expect(tc.score).toBe(69);

    // The ghost slug is dropped from BOTH numerator and denominator.
    expect(tc.coverage).toEqual({ scored: 2, total: 2 });
    expect(tc.contributing.length).toBe(2);
    expect(tc.contributing.some((c) => c.slug === 'ghost-skill-not-in-taxonomy')).toBe(false);
  });

  it('excludes unscored (0 / missing) skills from the mean but keeps them in contributing', () => {
    const levels = { 'evaluate-ai-critically': 60 };
    const out = computeCompetencyRollup(levels, FAKE_TAXONOMY);

    const ct = byKey(out, 'critical-thinking');
    // mean of the single scored skill, NOT (60 + 0) / 2
    expect(ct.score).toBe(60);
    expect(ct.coverage).toEqual({ scored: 1, total: 2 });
    expect(ct.contributing.length).toBe(2);

    const debug = ct.contributing.find((c) => c.slug === 'debug-systematically');
    expect(debug.level).toBe(0);
  });

  it('returns null score for a competency with zero scored skills', () => {
    const out = computeCompetencyRollup({}, FAKE_TAXONOMY);
    for (const row of out) {
      expect(row.score).toBe(null);
      expect(row.coverage.scored).toBe(0);
    }
    const comm = byKey(out, 'communication');
    expect(comm.coverage).toEqual({ scored: 0, total: 1 });
  });

  it('sorts by score descending with null scores last', () => {
    // critical-thinking: (90 + 90) / 2 = 90
    // technical-craft:   write-clean-code absent → only write-structure-prompts=40 scored → 40
    // communication:     write-structure-prompts=40 → 40
    // No competency is null here, so use levels that strand one as null:
    const levels = {
      'evaluate-ai-critically': 90,
      'debug-systematically': 90,
      // write-structure-prompts intentionally absent → communication & technical-craft
      //   have zero scored skills → null
    };
    const out = computeCompetencyRollup(levels, FAKE_TAXONOMY);

    // critical-thinking = 90 (numeric); technical-craft & communication = null
    expect(out[0].key).toBe('critical-thinking');
    expect(out[0].score).toBe(90);
    expect(out[out.length - 1].score).toBe(null);

    // Leading numeric entries are in non-increasing order.
    const numeric = out.filter((r) => r.score !== null).map((r) => r.score);
    for (let i = 1; i < numeric.length; i += 1) {
      expect(numeric[i - 1]).toBeGreaterThanOrEqual(numeric[i]);
    }
  });

  it('returns an empty array when foundationalCompetencies is missing', () => {
    expect(computeCompetencyRollup({}, { skills: {}, categories: {} })).toEqual([]);
    expect(computeCompetencyRollup({ x: 50 }, null)).toEqual([]);
    expect(computeCompetencyRollup(null, undefined)).toEqual([]);
    expect(computeCompetencyRollup({}, { foundationalCompetencies: {} })).toEqual([]);
  });

  it('does not throw on null skillLevels', () => {
    const out = computeCompetencyRollup(null, FAKE_TAXONOMY);
    expect(out.length).toBe(3);
    for (const row of out) {
      expect(row.score).toBe(null);
      expect(row.coverage.scored).toBe(0);
    }
  });
});
