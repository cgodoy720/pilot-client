/**
 * Builder Profiles API Service (internal Coach-page tooling).
 *
 * Backs the "Learner Profiles" tab — a temporary internal roster view to
 * sanity-check whether onboarding is aligning a teaching-method preference to
 * each builder. Read-only. Backed by /api/admin/builder-profiles/roster
 * (builderProfileInspectorController.js, gated by page:coach).
 */

import { fetchWithAuth } from '../utils/api';

/**
 * Fetch the learner roster for a cohort (or all builders).
 * @param {string} token
 * @param {string} [cohort] cohort name; omit for current-signup cohort, 'all' for everyone
 * @returns {Promise<{
 *   cohorts: Array<{ name: string, is_current: boolean, start_date: string }>,
 *   selectedCohort: string|null,
 *   summary: { total: number, onboarded: number, notOnboarded: number, byMethod: Record<string, number> },
 *   rows: Array<object>
 * }>}
 */
export const getLearnerRoster = async (token, cohort) => {
  const qs = cohort ? `?cohort=${encodeURIComponent(cohort)}` : '';
  return fetchWithAuth(`/api/admin/builder-profiles/roster${qs}`, { method: 'GET' }, token);
};

/**
 * Full profile snapshot for one builder — used to expand a roster row and show
 * the onboarding transcript (what they said) + the teaching-method provenance
 * behind the classification. Returns the getSnapshot payload, which includes
 * `onboarding_assessment` (with `.transcript`) and `learning_modality_preferences`.
 * @param {string} token
 * @param {number} userId
 */
export const getBuilderProfileSnapshot = async (token, userId) => {
  return fetchWithAuth(`/api/admin/builder-profiles/${userId}`, { method: 'GET' }, token);
};
