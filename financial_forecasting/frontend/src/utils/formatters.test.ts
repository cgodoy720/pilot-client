import { formatDollar, formatDollarMillions, formatPercentage } from './formatters';

// ---------------------------------------------------------------------------
// formatDollar
// ---------------------------------------------------------------------------
describe('formatDollar', () => {
  // ── Null / undefined / NaN ──────────────────────────────────────────────
  it('returns "$0" for null', () => {
    expect(formatDollar(null)).toBe('$0');
  });

  it('returns "$0" for undefined', () => {
    expect(formatDollar(undefined)).toBe('$0');
  });

  it('returns "$0" for NaN', () => {
    expect(formatDollar(NaN)).toBe('$0');
  });

  // ── Sub-thousand (full dollar display) ──────────────────────────────────
  it('formats zero as "$0"', () => {
    expect(formatDollar(0)).toBe('$0');
  });

  it('formats small amounts without abbreviation', () => {
    expect(formatDollar(500)).toBe('$500');
    expect(formatDollar(999)).toBe('$999');
  });

  // ── Thousands (K) ──────────────────────────────────────────────────────
  it('formats under 10K with one decimal', () => {
    expect(formatDollar(1000)).toBe('$1.0K');
    expect(formatDollar(5500)).toBe('$5.5K');
    expect(formatDollar(9999)).toBe('$10.0K');
  });

  it('formats 10K+ with no decimals', () => {
    expect(formatDollar(10000)).toBe('$10K');
    expect(formatDollar(450000)).toBe('$450K');
    expect(formatDollar(999999)).toBe('$1000K');
  });

  // ── Millions (M) ──────────────────────────────────────────────────────
  it('formats under 10M with two decimals', () => {
    expect(formatDollar(1000000)).toBe('$1.00M');
    expect(formatDollar(5450000)).toBe('$5.45M');
  });

  it('formats 10M–100M with one decimal', () => {
    expect(formatDollar(45500000)).toBe('$45.5M');
  });

  it('formats 100M+ with no decimals', () => {
    expect(formatDollar(450000000)).toBe('$450M');
  });

  // ── Billions (B) ──────────────────────────────────────────────────────
  it('formats under 10B with two decimals', () => {
    expect(formatDollar(1000000000)).toBe('$1.00B');
  });

  it('formats 10B–100B with one decimal', () => {
    expect(formatDollar(45500000000)).toBe('$45.5B');
  });

  it('formats 100B+ with no decimals', () => {
    expect(formatDollar(450000000000)).toBe('$450B');
  });

  // ── Negative values ───────────────────────────────────────────────────
  it('handles negative values with a leading minus', () => {
    expect(formatDollar(-500)).toBe('-$500');
    expect(formatDollar(-5500)).toBe('-$5.5K');
    expect(formatDollar(-5450000)).toBe('-$5.45M');
    expect(formatDollar(-1000000000)).toBe('-$1.00B');
  });
});

// ---------------------------------------------------------------------------
// formatDollarMillions alias
// ---------------------------------------------------------------------------
describe('formatDollarMillions', () => {
  it('is the same function as formatDollar', () => {
    expect(formatDollarMillions).toBe(formatDollar);
  });
});

// ---------------------------------------------------------------------------
// formatPercentage
// ---------------------------------------------------------------------------
describe('formatPercentage', () => {
  it('returns "0%" for null', () => {
    expect(formatPercentage(null)).toBe('0%');
  });

  it('returns "0%" for undefined', () => {
    expect(formatPercentage(undefined)).toBe('0%');
  });

  it('returns "0%" for NaN', () => {
    expect(formatPercentage(NaN)).toBe('0%');
  });

  it('rounds to the nearest integer', () => {
    expect(formatPercentage(45.4)).toBe('45%');
    expect(formatPercentage(45.5)).toBe('46%');
    expect(formatPercentage(99.9)).toBe('100%');
  });

  it('formats zero and 100 correctly', () => {
    expect(formatPercentage(0)).toBe('0%');
    expect(formatPercentage(100)).toBe('100%');
  });
});
