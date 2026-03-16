import { getStageColor, getProbabilityColor, calculatePaymentDate } from './helpers';

// ---------------------------------------------------------------------------
// getStageColor
// ---------------------------------------------------------------------------
describe('getStageColor', () => {
  it('returns "success" for completed stages', () => {
    expect(getStageColor('Closed / Completed')).toBe('success');
    expect(getStageColor('Completed')).toBe('success');
  });

  it('returns "error" for lost / withdrawn / unfulfilled stages', () => {
    expect(getStageColor('Closed Lost')).toBe('error');
    expect(getStageColor('Withdrawn')).toBe('error');
    expect(getStageColor('Closed / Did not Fulfill')).toBe('error');
  });

  it('returns "warning" for proposal and negotiation stages', () => {
    expect(getStageColor('Design / Proposal Creation')).toBe('warning');
    expect(getStageColor('Proposal Negotiation')).toBe('warning');
    expect(getStageColor('Negotiating Contract')).toBe('warning');
  });

  it('returns "info" for all other stages', () => {
    expect(getStageColor('Lead Gen')).toBe('info');
    expect(getStageColor('New Lead')).toBe('info');
    expect(getStageColor('Qualifying')).toBe('info');
    expect(getStageColor('Collecting / In Effect')).toBe('info');
    expect(getStageColor('--None--')).toBe('info');
  });
});

// ---------------------------------------------------------------------------
// getProbabilityColor
// ---------------------------------------------------------------------------
describe('getProbabilityColor', () => {
  it('returns "success" for 70% and above', () => {
    expect(getProbabilityColor(70)).toBe('success');
    expect(getProbabilityColor(100)).toBe('success');
    expect(getProbabilityColor(85)).toBe('success');
  });

  it('returns "warning" for 40%–69%', () => {
    expect(getProbabilityColor(40)).toBe('warning');
    expect(getProbabilityColor(69)).toBe('warning');
    expect(getProbabilityColor(50)).toBe('warning');
  });

  it('returns "error" for below 40%', () => {
    expect(getProbabilityColor(39)).toBe('error');
    expect(getProbabilityColor(0)).toBe('error');
    expect(getProbabilityColor(10)).toBe('error');
  });
});

// ---------------------------------------------------------------------------
// calculatePaymentDate
// ---------------------------------------------------------------------------
describe('calculatePaymentDate', () => {
  it('returns a date 30 days after the close date', () => {
    const result = calculatePaymentDate('2026-03-01');
    expect(result).toBeInstanceOf(Date);
    // March 1 + 30 days = March 31
    expect(result!.getFullYear()).toBe(2026);
    expect(result!.getMonth()).toBe(2); // 0-indexed: March = 2
    expect(result!.getDate()).toBe(31);
  });

  it('handles month boundaries (rolls into next month)', () => {
    const result = calculatePaymentDate('2026-01-15');
    // Jan 15 + 30 = Feb 14
    expect(result!.getMonth()).toBe(1); // February
    expect(result!.getDate()).toBe(14);
  });

  it('returns null for empty string', () => {
    expect(calculatePaymentDate('')).toBeNull();
  });

  it('returns Invalid Date for non-parseable strings (known gap — see note)', () => {
    // NOTE: calculatePaymentDate wraps `new Date(closeDate)` in try/catch,
    // but `new Date('not-a-date')` does NOT throw — it returns Invalid Date.
    // addDays then returns another Invalid Date. The function would need an
    // explicit isNaN check to return null here. Documenting current behavior;
    // fix tracked separately if this matters for callers.
    const result = calculatePaymentDate('not-a-date');
    expect(result).toBeInstanceOf(Date);
    expect(isNaN(result!.getTime())).toBe(true);
  });
});
