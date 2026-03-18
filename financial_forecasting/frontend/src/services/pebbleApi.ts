/**
 * Pebble API service — prospect research (Integration #9)
 * Pebble runs on port 8001 by default.
 */

import axios, { AxiosInstance } from 'axios';

const pebbleBase = process.env.REACT_APP_PEBBLE_API_URL || 'http://localhost:8001';

const pebbleApi: AxiosInstance = axios.create({
  baseURL: pebbleBase,
  timeout: 120000, // Research can take a while
  headers: {
    'Content-Type': 'application/json',
  },
});

if (process.env.REACT_APP_PEBBLE_API_KEY) {
  pebbleApi.defaults.headers.common['X-Api-Key'] = process.env.REACT_APP_PEBBLE_API_KEY;
}

export interface ProspectInput {
  id: string;
  first_name?: string;
  last_name?: string;
  organization?: string;
  ein?: string;
}

export interface ResearchRequest {
  contact_ids: string[];
  prospects?: ProspectInput[];
}

export interface Claim {
  text: string;
  source_url: string;
  confidence: string;
}

export interface Profile {
  claims: Claim[];
  summary: string;
  confidence_score: string;
  partial?: boolean;
  failed_agents?: string[];
}

export const pebbleService = {
  requestResearch: (body: ResearchRequest) =>
    pebbleApi.post('/api/v1/research/request', body),

  getProfile: (contactId: string) =>
    pebbleApi.get<{ profile: Profile | null }>(`/api/v1/research/profiles/${contactId}`),

  submitFeedback: (claimId: string, correct: boolean) =>
    pebbleApi.post('/api/v1/research/feedback', { claim_id: claimId, correct }),

  health: () => pebbleApi.get('/health'),
};
