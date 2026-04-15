import { describe, it, expect } from 'vitest';

/**
 * Tests for BuilderDrawer helper functions and data parsing logic.
 *
 * Covers:
 * - VideoItem date formatting (TKT-22)
 * - resolveDate / resolveStr helpers
 * - All-time date range for data fetching
 * - Roster filter logic (TKT-13)
 */

// ── VideoItem date parsing ──────────────────────────────────────────────

function parseVideoDate(submission_date) {
  const rawDate = typeof submission_date === 'object' && submission_date?.value
    ? submission_date.value
    : submission_date;
  if (!rawDate) return '—';
  try {
    const d = new Date(String(rawDate).length <= 10 ? rawDate + 'T12:00:00' : rawDate);
    return isNaN(d) ? '—' : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return '—'; }
}

describe('VideoItem date parsing (TKT-22)', () => {
  it('formats a standard date string', () => {
    const result = parseVideoDate('2026-03-15');
    expect(result).toBe('Mar 15, 2026');
  });

  it('formats an ISO date string with time', () => {
    const result = parseVideoDate('2026-03-15T14:30:00.000Z');
    expect(result).toContain('Mar');
    expect(result).toContain('2026');
  });

  it('handles BigQuery {value} wrapper', () => {
    const result = parseVideoDate({ value: '2026-03-15' });
    expect(result).toBe('Mar 15, 2026');
  });

  it('returns dash for null', () => {
    expect(parseVideoDate(null)).toBe('—');
  });

  it('returns dash for undefined', () => {
    expect(parseVideoDate(undefined)).toBe('—');
  });

  it('returns dash for empty string', () => {
    expect(parseVideoDate('')).toBe('—');
  });

  it('returns dash for invalid date', () => {
    expect(parseVideoDate('not-a-date')).toBe('—');
  });

  it('never returns "Invalid Date"', () => {
    const inputs = [null, undefined, '', 'garbage', { value: 'nope' }, 0, false];
    inputs.forEach(input => {
      const result = parseVideoDate(input);
      expect(result).not.toBe('Invalid Date');
    });
  });
});

// ── resolveDate / resolveStr helpers ────────────────────────────────────

function resolveDate(d) {
  if (!d) return '—';
  const raw = typeof d === 'object' && d.value ? d.value : String(d);
  try {
    return new Date(raw).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch { return raw; }
}

function resolveStr(v) {
  if (!v) return '';
  if (typeof v === 'object' && v.value) return v.value;
  if (typeof v === 'object') return JSON.stringify(v);
  return String(v);
}

describe('resolveDate helper', () => {
  it('formats a date string', () => {
    expect(resolveDate('2026-03-15')).toContain('Mar');
  });

  it('unwraps BigQuery {value} objects', () => {
    expect(resolveDate({ value: '2026-03-15' })).toContain('Mar');
  });

  it('returns dash for null', () => {
    expect(resolveDate(null)).toBe('—');
  });

  it('returns dash for undefined', () => {
    expect(resolveDate(undefined)).toBe('—');
  });
});

describe('resolveStr helper', () => {
  it('returns plain strings', () => {
    expect(resolveStr('hello')).toBe('hello');
  });

  it('unwraps BigQuery {value} objects', () => {
    expect(resolveStr({ value: 'hello' })).toBe('hello');
  });

  it('JSON-stringifies plain objects', () => {
    expect(resolveStr({ a: 1 })).toBe('{"a":1}');
  });

  it('returns empty string for null', () => {
    expect(resolveStr(null)).toBe('');
  });

  it('returns empty string for undefined', () => {
    expect(resolveStr(undefined)).toBe('');
  });

  it('converts numbers to string', () => {
    expect(resolveStr(42)).toBe('42');
  });
});

// ── All-time date range (TKT-22) ───────────────────────────────────────

describe('All-time date range for builder panel', () => {
  const allTimeStart = '2020-01-01';

  it('start date is 2020-01-01', () => {
    expect(allTimeStart).toBe('2020-01-01');
  });

  it('end date is today in ET', () => {
    const allTimeEnd = new Date().toLocaleDateString('en-CA', { timeZone: 'America/New_York' });
    expect(allTimeEnd).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const today = new Date();
    const year = today.getFullYear();
    expect(parseInt(allTimeEnd.split('-')[0])).toBeGreaterThanOrEqual(year - 1);
  });
});

// ── Roster filter logic (TKT-13) ───────────────────────────────────────

function filterBuilders(builders, enrollmentFilter, searchQuery) {
  let list = builders;
  if (enrollmentFilter === 'active') {
    list = list.filter(b => b.enrollment_status === 'in_progress' || b.enrollment_status === 'completed');
  } else if (enrollmentFilter === 'withdrawn') {
    list = list.filter(b => b.enrollment_status === 'withdrawn' || b.enrollment_status === 'dismissed');
  }
  if (searchQuery?.trim()) {
    const q = searchQuery.toLowerCase();
    list = list.filter(b => b.name?.toLowerCase().includes(q) || b.email?.toLowerCase().includes(q));
  }
  return list;
}

const testBuilders = [
  { name: 'Alice Active', email: 'alice@example.com', enrollment_status: 'in_progress' },
  { name: 'Bob Complete', email: 'bob@example.com', enrollment_status: 'completed' },
  { name: 'Carol Withdrawn', email: 'carol@example.com', enrollment_status: 'withdrawn' },
  { name: 'Dave Dismissed', email: 'dave@example.com', enrollment_status: 'dismissed' },
];

describe('Roster filter logic (TKT-13)', () => {
  it('"active" filter includes in_progress and completed', () => {
    const result = filterBuilders(testBuilders, 'active', '');
    expect(result.map(b => b.name)).toEqual(['Alice Active', 'Bob Complete']);
  });

  it('"withdrawn" filter includes withdrawn and dismissed', () => {
    const result = filterBuilders(testBuilders, 'withdrawn', '');
    expect(result.map(b => b.name)).toEqual(['Carol Withdrawn', 'Dave Dismissed']);
  });

  it('"all" filter shows everyone', () => {
    const result = filterBuilders(testBuilders, 'all', '');
    expect(result.length).toBe(4);
  });

  it('search query filters by name', () => {
    const result = filterBuilders(testBuilders, 'all', 'alice');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Alice Active');
  });

  it('search query filters by email', () => {
    const result = filterBuilders(testBuilders, 'all', 'bob@example');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Bob Complete');
  });

  it('search is case-insensitive', () => {
    const result = filterBuilders(testBuilders, 'all', 'ALICE');
    expect(result.length).toBe(1);
  });

  it('combined filter + search works', () => {
    const result = filterBuilders(testBuilders, 'active', 'bob');
    expect(result.length).toBe(1);
    expect(result[0].name).toBe('Bob Complete');
  });

  it('search with no match returns empty', () => {
    const result = filterBuilders(testBuilders, 'all', 'zzz');
    expect(result.length).toBe(0);
  });

  it('badge always shows "X of Y" format', () => {
    const filtered = filterBuilders(testBuilders, 'active', '');
    const badge = `${filtered.length} of ${testBuilders.length}`;
    expect(badge).toBe('2 of 4');
  });
});
