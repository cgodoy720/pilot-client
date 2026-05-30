/**
 * Coach Evals API Service
 * Admin/staff harness for running and reviewing automated quality evaluations
 * of the v2 coach agent. Backed by /api/admin/coach-evals
 * (controllers/coachEvalController.js).
 */

import { fetchWithAuth } from '../utils/api';

/** List available eval suites for the run picker. */
export const listSuites = async (token) =>
  fetchWithAuth('/api/admin/coach-evals/suites', { method: 'GET' }, token);

/** Start an eval batch. Returns { batchId, totalCases, status } (202). */
export const runEval = async (token, { suiteKey, modelUnderTest, judgeModel }) =>
  fetchWithAuth(
    '/api/admin/coach-evals/run',
    { method: 'POST', body: JSON.stringify({ suiteKey, modelUnderTest, judgeModel }) },
    token
  );

/** List recent batches (aggregates + status). */
export const listBatches = async (token) =>
  fetchWithAuth('/api/admin/coach-evals', { method: 'GET' }, token);

/** Get one batch + its cases. */
export const getBatch = async (token, batchId) =>
  fetchWithAuth(`/api/admin/coach-evals/${batchId}`, { method: 'GET' }, token);

/** Get one case's full verdicts. */
export const getCase = async (token, caseId) =>
  fetchWithAuth(`/api/admin/coach-evals/cases/${caseId}`, { method: 'GET' }, token);
