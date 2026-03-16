/**
 * Pure helper functions extracted from WeeklyPriorities.tsx for testability.
 *
 * These handle the date-windowing and action-generation logic that powers
 * the "This Week" priority view.
 */
import { addDays, isWithinInterval, parseISO, startOfDay } from 'date-fns';
import type { Grant, Lead, WeeklyPriorityItem } from '../types/weeklyPriorities';

export const LOOKAHEAD_DAYS = 30;

export function getThisWeekRange(now: Date = new Date()): { start: Date; end: Date } {
  const start = startOfDay(now);
  return { start, end: addDays(start, LOOKAHEAD_DAYS - 1) };
}

export function isInLookaheadWindow(
  dateStr: string | null | undefined,
  now: Date = new Date(),
): boolean {
  if (!dateStr) return false;
  try {
    const { start, end } = getThisWeekRange(now);
    return isWithinInterval(parseISO(dateStr), { start, end });
  } catch {
    return false;
  }
}

export function buildAction(grant: Grant): string {
  return `Follow up before close date ${grant.close_date}`;
}

export function buildPriorityItems(
  leads: Lead[],
  grants: Grant[],
): WeeklyPriorityItem[] {
  return leads
    .filter((l) => l.grant_id)
    .map((l) => {
      const grant = grants.find((g) => g.id === l.grant_id);
      if (!grant) return null;
      return { lead: l, grant, suggested_action: buildAction(grant) };
    })
    .filter((item): item is WeeklyPriorityItem => item !== null);
}
