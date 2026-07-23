/**
 * Coach Runs API Service
 * Admin/staff observability into the v2 coach agent — lists personalized-task
 * runs and fetches the per-agent step timeline for a single run.
 * Backed by /api/admin/coach-runs (controllers/coachObservabilityController.js).
 */

import { fetchWithAuth } from '../utils/api';

/**
 * List recent coach runs.
 * @param {string} token
 * @param {Object} [filters] - { userId, taskId, cohort, search, limit }
 *   `search` is free-text (builder name / email / task title) and scans ALL
 *   runs on the server, not just the recent-limit window.
 * @returns {Promise<{ runs: Object[] }>}
 */
export const listCoachRuns = async (token, filters = {}) => {
  const params = new URLSearchParams();
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.taskId) params.append('taskId', filters.taskId);
  if (filters.cohort) params.append('cohort', filters.cohort);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  const qs = params.toString();
  return fetchWithAuth(`/api/admin/coach-runs${qs ? `?${qs}` : ''}`, { method: 'GET' }, token);
};

/**
 * Fetch the full agent-step timeline for one run.
 * @param {string} token
 * @param {number} threadId
 * @returns {Promise<Object>} { thread_id, identity, steps, outcomes, usageTotals }
 */
export const getCoachRun = async (token, threadId) => {
  return fetchWithAuth(`/api/admin/coach-runs/${threadId}`, { method: 'GET' }, token);
};
