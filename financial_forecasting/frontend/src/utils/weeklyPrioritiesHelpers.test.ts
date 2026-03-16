import {
  LOOKAHEAD_DAYS,
  getThisWeekRange,
  isInLookaheadWindow,
  buildAction,
  buildPriorityItems,
} from './weeklyPrioritiesHelpers';
import type { Grant, Lead } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------
function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-1',
    first_name: 'Alice',
    last_name: 'Smith',
    source: 'test.csv',
    status: 'new',
    priority: 'medium',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

function makeGrant(overrides: Partial<Grant> = {}): Grant {
  return {
    id: 'OPP001',
    name: 'Spring Grant 2026',
    close_date: '2026-03-20',
    stage: 'Qualifying',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// getThisWeekRange
// ---------------------------------------------------------------------------
describe('getThisWeekRange', () => {
  it('returns a range of LOOKAHEAD_DAYS starting from today (midnight)', () => {
    const now = new Date('2026-03-16T15:30:00Z');
    const { start, end } = getThisWeekRange(now);

    // Start should be midnight of the given day
    expect(start.getHours()).toBe(0);
    expect(start.getMinutes()).toBe(0);

    // End should be LOOKAHEAD_DAYS - 1 after start
    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    expect(diffDays).toBe(LOOKAHEAD_DAYS - 1);
  });
});

// ---------------------------------------------------------------------------
// isInLookaheadWindow
// ---------------------------------------------------------------------------
describe('isInLookaheadWindow', () => {
  const now = new Date('2026-03-16T00:00:00Z');

  it('returns true for a date within the window', () => {
    expect(isInLookaheadWindow('2026-03-20', now)).toBe(true);
  });

  it('returns true for the first day of the window', () => {
    expect(isInLookaheadWindow('2026-03-16', now)).toBe(true);
  });

  it('returns true for the last day of the window', () => {
    // 30-day window starting March 16 → last day is April 14
    expect(isInLookaheadWindow('2026-04-14', now)).toBe(true);
  });

  it('returns false for a date after the window', () => {
    expect(isInLookaheadWindow('2026-06-01', now)).toBe(false);
  });

  it('returns false for a date before the window', () => {
    expect(isInLookaheadWindow('2026-03-01', now)).toBe(false);
  });

  it('returns false for null', () => {
    expect(isInLookaheadWindow(null, now)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isInLookaheadWindow(undefined, now)).toBe(false);
  });

  it('returns false for invalid date string', () => {
    expect(isInLookaheadWindow('not-a-date', now)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildAction
// ---------------------------------------------------------------------------
describe('buildAction', () => {
  it('generates action text with the grant close date', () => {
    const grant = makeGrant({ close_date: '2026-04-01' });
    expect(buildAction(grant)).toBe('Follow up before close date 2026-04-01');
  });
});

// ---------------------------------------------------------------------------
// buildPriorityItems
// ---------------------------------------------------------------------------
describe('buildPriorityItems', () => {
  it('returns empty array when no leads have grant_id', () => {
    const leads = [makeLead({ grant_id: undefined })];
    const grants = [makeGrant()];
    expect(buildPriorityItems(leads, grants)).toEqual([]);
  });

  it('returns empty array when grant_id does not match any grant', () => {
    const leads = [makeLead({ grant_id: 'NONEXISTENT' })];
    const grants = [makeGrant({ id: 'OPP001' })];
    expect(buildPriorityItems(leads, grants)).toEqual([]);
  });

  it('builds priority items for leads linked to matching grants', () => {
    const leads = [
      makeLead({ id: 'lead-1', grant_id: 'OPP001' }),
      makeLead({ id: 'lead-2', grant_id: 'OPP002' }),
    ];
    const grants = [
      makeGrant({ id: 'OPP001', name: 'Grant A', close_date: '2026-03-20' }),
      makeGrant({ id: 'OPP002', name: 'Grant B', close_date: '2026-04-01' }),
    ];

    const items = buildPriorityItems(leads, grants);
    expect(items).toHaveLength(2);
    expect(items[0].lead.id).toBe('lead-1');
    expect(items[0].grant.id).toBe('OPP001');
    expect(items[0].suggested_action).toContain('2026-03-20');
    expect(items[1].grant.name).toBe('Grant B');
  });

  it('excludes leads without grant_id from the result', () => {
    const leads = [
      makeLead({ id: 'lead-1', grant_id: 'OPP001' }),
      makeLead({ id: 'lead-2' }), // no grant_id
    ];
    const grants = [makeGrant({ id: 'OPP001' })];

    const items = buildPriorityItems(leads, grants);
    expect(items).toHaveLength(1);
    expect(items[0].lead.id).toBe('lead-1');
  });
});
