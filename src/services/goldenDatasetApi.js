/**
 * Golden Dataset API Service
 * Admin surface for the handcrafted synthetic builder archetypes that span
 * every coach personalization axis. Lists each archetype's inputs + the coach's
 * DETERMINISTIC decision (difficulty band, teaching method, +20% interview
 * modifier) with zero LLM calls, and drives a real headless coach run per
 * archetype (the run auto-seeds the segregated builder row on demand).
 * Backed by /api/admin/golden-dataset (controllers/goldenDatasetController.js).
 */

import { fetchWithAuth } from '../utils/api';

/**
 * List the 12 archetypes with inputs, derived coach decision, and seeded state.
 * @param {string} token
 * @param {number} [taskId] - recompute derived difficulty against this task's skill tags
 * @returns {Promise<{ archetypes: Object[] }>}
 */
export const listArchetypes = async (token, taskId) => {
  const qs = taskId ? `?taskId=${taskId}` : '';
  return fetchWithAuth(`/api/admin/golden-dataset${qs}`, { method: 'GET' }, token);
};

/**
 * List personalized tasks available as a derived-difficulty / run target.
 * @param {string} token
 * @returns {Promise<{ tasks: Object[] }>}
 */
export const listGoldenTasks = async (token) => {
  return fetchWithAuth('/api/admin/golden-dataset/tasks', { method: 'GET' }, token);
};

/**
 * Drive a real headless coach run for one archetype on a task.
 * Note: awaits the full run (may take 1-2 min).
 * @param {string} token
 * @param {{ archetypeKey: string, taskId: number }} payload
 * @returns {Promise<{ threadId: number, turns: number, finalPhase: string }>}
 */
export const runArchetype = async (token, { archetypeKey, taskId }) => {
  return fetchWithAuth(
    '/api/admin/golden-dataset/run',
    { method: 'POST', body: JSON.stringify({ archetypeKey, taskId }) },
    token
  );
};
