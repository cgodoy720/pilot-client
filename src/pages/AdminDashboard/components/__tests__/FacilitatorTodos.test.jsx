import { describe, it, expect } from 'vitest';

/**
 * Tests the holiday exclusion filtering logic used in FacilitatorTodos.jsx.
 *
 * FacilitatorTodos builds a Set of curriculum dates from the calendar API,
 * filtering out non-instructional types. Only days in that Set appear in the
 * attendance verification checklist. We replicate the exact filter here.
 */

const NON_INSTRUCTIONAL_TYPES = ['Holiday'];

function buildCurriculumDates(calendarWeeks) {
  const dates = new Set();
  (calendarWeeks || []).forEach(w => {
    (w.days || []).forEach(d => {
      const dateStr = d.day_date?.split?.('T')?.[0] || d.day_date;
      if (dateStr && !NON_INSTRUCTIONAL_TYPES.includes(d.day_type)) dates.add(dateStr);
    });
  });
  return dates;
}

const sampleCalendar = [
  {
    week: 3,
    days: [
      { day_date: '2026-03-30T04:00:00.000Z', day_type: 'Weekday', day_number: 11 },
      { day_date: '2026-03-31T04:00:00.000Z', day_type: 'Weekday', day_number: 12 },
      { day_date: '2026-04-01T04:00:00.000Z', day_type: 'Weekday', day_number: 13 },
      { day_date: '2026-04-02T04:00:00.000Z', day_type: 'Weekday', day_number: 14 },
      { day_date: '2026-04-03T04:00:00.000Z', day_type: 'Weekday', day_number: 15 },
      { day_date: '2026-04-04T04:00:00.000Z', day_type: 'Weekend', day_number: 16 },
      { day_date: '2026-04-05T04:00:00.000Z', day_type: 'Holiday', day_number: 17 },
    ],
  },
  {
    week: 4,
    days: [
      { day_date: '2026-04-06T04:00:00.000Z', day_type: 'Weekend', day_number: 18 },
      { day_date: '2026-04-07T04:00:00.000Z', day_type: 'Weekday', day_number: 19 },
      { day_date: '2026-04-08T04:00:00.000Z', day_type: 'Homework', day_number: 20 },
      { day_date: '2026-04-09T04:00:00.000Z', day_type: 'Reflection', day_number: 21 },
    ],
  },
];

describe('FacilitatorTodos — curriculum date filtering', () => {
  it('includes Weekday dates', () => {
    const dates = buildCurriculumDates(sampleCalendar);
    expect(dates.has('2026-03-30')).toBe(true);
    expect(dates.has('2026-04-07')).toBe(true);
  });

  it('includes Weekend dates (class held on weekends)', () => {
    const dates = buildCurriculumDates(sampleCalendar);
    expect(dates.has('2026-04-04')).toBe(true);
    expect(dates.has('2026-04-06')).toBe(true);
  });

  it('excludes Holiday dates', () => {
    const dates = buildCurriculumDates(sampleCalendar);
    expect(dates.has('2026-04-05')).toBe(false);
  });

  it('includes Homework dates', () => {
    const dates = buildCurriculumDates(sampleCalendar);
    expect(dates.has('2026-04-08')).toBe(true);
  });

  it('includes Reflection dates', () => {
    const dates = buildCurriculumDates(sampleCalendar);
    expect(dates.has('2026-04-09')).toBe(true);
  });

  it('returns empty set for empty calendar', () => {
    const dates = buildCurriculumDates([]);
    expect(dates.size).toBe(0);
  });

  it('returns empty set for null calendar', () => {
    const dates = buildCurriculumDates(null);
    expect(dates.size).toBe(0);
  });

  it('handles all day_type values correctly', () => {
    const all = [
      { week: 1, days: [
        { day_date: '2026-01-01', day_type: 'Weekday', day_number: 1 },
        { day_date: '2026-01-02', day_type: 'Weekend', day_number: 2 },
        { day_date: '2026-01-03', day_type: 'Homework', day_number: 3 },
        { day_date: '2026-01-04', day_type: 'Reflection', day_number: 4 },
        { day_date: '2026-01-05', day_type: 'Async Homework', day_number: 5 },
        { day_date: '2026-01-06', day_type: 'Learn Club', day_number: 6 },
        { day_date: '2026-01-07', day_type: 'Holiday', day_number: 7 },
      ]},
    ];
    const dates = buildCurriculumDates(all);
    expect(dates.size).toBe(6);
    expect(dates.has('2026-01-01')).toBe(true);
    expect(dates.has('2026-01-02')).toBe(true);
    expect(dates.has('2026-01-03')).toBe(true);
    expect(dates.has('2026-01-04')).toBe(true);
    expect(dates.has('2026-01-05')).toBe(true);
    expect(dates.has('2026-01-06')).toBe(true);
    expect(dates.has('2026-01-07')).toBe(false);
  });

  it('handles ISO date strings with timezone offset', () => {
    const cal = [{ week: 1, days: [
      { day_date: '2026-04-04T04:00:00.000Z', day_type: 'Weekend', day_number: 1 },
    ]}];
    const dates = buildCurriculumDates(cal);
    expect(dates.has('2026-04-04')).toBe(true);
  });

  it('handles plain date strings (no T separator)', () => {
    const cal = [{ week: 1, days: [
      { day_date: '2026-04-04', day_type: 'Weekend', day_number: 1 },
    ]}];
    const dates = buildCurriculumDates(cal);
    expect(dates.has('2026-04-04')).toBe(true);
  });
});
