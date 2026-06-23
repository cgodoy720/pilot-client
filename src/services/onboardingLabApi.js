/**
 * Teaching Lab API Service
 * Admin mock environment for the onboarding teaching-method classifier (the
 * behavioral pass over anchor #9, "how they like to learn"). Feeds a typed mock
 * answer (or a transcript) through the REAL classifier and returns the predicted
 * style + confidence + evidence, the 0.7 confidence-floor verdict, and the
 * effective method the coach would use (style or the neutral 'balanced' fallback)
 * plus the guidance directive injected into the learn prompt. READ-ONLY — no
 * profile writes. Backed by /api/admin/onboarding-lab (onboardingLabController.js).
 */

import { fetchWithAuth } from '../utils/api';

/**
 * The curated example-answer gallery + the anchor-#9 question + the confidence floor.
 * @param {string} token
 * @returns {Promise<{ presets: Object[], question: string, floor: number }>}
 */
export const listLabPresets = async (token) => {
  return fetchWithAuth('/api/admin/onboarding-lab/presets', { method: 'GET' }, token);
};

/**
 * Run the real classifier over a mock answer (or transcript).
 * @param {string} token
 * @param {{ answer?: string, transcript?: Array }} payload
 * @returns {Promise<{ raw: object|null, wouldPersist: boolean, effectiveMethod: string, floor: number, guidance: string, model: string, question: string }>}
 */
export const classifyTeachingMethod = async (token, { answer, transcript } = {}) => {
  return fetchWithAuth(
    '/api/admin/onboarding-lab/classify',
    { method: 'POST', body: JSON.stringify(transcript ? { transcript } : { answer }) },
    token
  );
};

/**
 * Generate ONE real coach learn-phase turn in the given teaching method, using
 * the same prompt + model the live coach uses (stateless — no thread/DB). With
 * no messages, the coach produces its first teaching turn (server seeds a
 * builder opener, returned as `seededOpener`).
 * @param {string} token
 * @param {{ teachingMethod: string, messages?: Array<{role:'user'|'assistant', content:string}> }} payload
 * @returns {Promise<{ reply: string, method: string, model: string, seededOpener: string|null, task: { title: string, learning_goal: string } }>}
 */
export const coachTurn = async (token, { teachingMethod, messages } = {}) => {
  return fetchWithAuth(
    '/api/admin/onboarding-lab/coach-turn',
    { method: 'POST', body: JSON.stringify({ teachingMethod, messages: messages || [] }) },
    token
  );
};
