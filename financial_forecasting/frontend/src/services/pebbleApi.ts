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
  organizations?: string[];
}

export interface ResearchRequest {
  contact_ids: string[];
  prospects?: ProspectInput[];
  job_id?: string;
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
  requestResearch: (body: ResearchRequest, signal?: AbortSignal) =>
    pebbleApi.post('/api/v1/research/request', body, { signal }),

  cancelResearch: (jobId: string) =>
    pebbleApi.post('/api/v1/research/cancel', { job_id: jobId }),

  getProfile: (contactId: string) =>
    pebbleApi.get<{ profile: Profile | null }>(`/api/v1/research/profiles/${contactId}`),

  submitFeedback: (claimId: string, correct: boolean, text?: string, contactId?: string) =>
    pebbleApi.post('/api/v1/research/feedback', { claim_id: claimId, correct, text: text || null, contact_id: contactId || null }),

  getContactFeedback: (contactId: string) =>
    pebbleApi.get<{ feedback: Array<{ id: number; claim_id: string; correct: number; text: string | null; contact_id: string; created_at: string }> }>(
      `/api/v1/research/feedback/${contactId}`,
    ),

  getFeedbackTrends: (days?: number) =>
    pebbleApi.get<{ total: number; correct_count: number; incorrect_count: number; correct_pct: number; by_contact: Array<{ contact_id: string; total: number; correct_count: number }> }>(
      '/api/v1/research/feedback/trends',
      { params: { days } },
    ),

  exportProfile: (contactId: string, format: string = 'md') =>
    pebbleApi.get(`/api/v1/research/profiles/${contactId}/export`, {
      params: { format },
      responseType: 'blob',
    }),

  getHistory: (limit: number = 100, grouped: boolean = false) =>
    pebbleApi.get<{ sessions?: ResearchSession[]; batches?: HistoryBatch[] }>('/api/v1/research/history', {
      params: { limit, grouped },
    }),

  getSession: (sessionId: string) =>
    pebbleApi.get<ResearchSessionDetail>(`/api/v1/research/history/${sessionId}`),

  health: () => pebbleApi.get('/health'),

  // Ask Pebble chat
  chatQuery: (body: ChatQueryRequest) =>
    pebbleApi.post<ChatQueryResponse>('/api/v1/chat/query', body),

  getChatHistory: (conversationId?: string, userEmail?: string) =>
    pebbleApi.get('/api/v1/chat/history', {
      params: { conversation_id: conversationId, user_email: userEmail },
    }),

  // Tiered single-prospect research
  tieredResearch: (body: { first_name: string; last_name: string; organization: string; contact_id?: string; tier: number; batch_id?: string }) =>
    pebbleApi.post<TieredResearchResponse>('/api/v1/research/tiered', body),

  // Batch research
  batchResearch: (body: { prospects: Array<{ name: string; organization?: string }>; target_tier?: number; batch_id?: string; user_email?: string }) =>
    pebbleApi.post('/api/v1/research/batch', body),

  getBatchStatus: (batchId: string) =>
    pebbleApi.get(`/api/v1/research/batch/${batchId}`),
};

export interface AgentLogEntry {
  name: string;
  outcome: string;
  elapsed_seconds: number;
  cost_usd: number;
  tokens_input: number;
  tokens_output: number;
  attempts: number;
  error: string | null;
  records_found: number | null;
}

export interface ResearchSession {
  id: string;
  contact_id: string;
  prospect_name: string;
  prospect_org: string;
  status: string;
  tier: string | null;
  batch_id: string | null;
  cost_usd: number | null;
  claims_count: number;
  confidence_score: string;
  created_at: string;
}

export interface ChatQueryRequest {
  query: string;
  mode?: string;
  conversation_id?: string;
  user_email?: string;
  selected_option?: string;
}

export interface ClarificationOption {
  label: string;
  value: string;
  description?: string | null;
}

export interface ChatQueryResponse {
  answer: string;
  level: number;
  intent: string;
  data?: Record<string, any> | null;
  sources?: string[];
  cost_usd: number;
  elapsed_seconds: number;
  conversation_id: string;
  redirect_target?: string | null;
  redirect_reason?: string | null;
  requires_clarification: boolean;
  clarification_options?: ClarificationOption[] | null;
  blocked_reason?: string | null;
}

export interface TieredResearchResponse {
  tier: string;
  text: string;
  data: Record<string, any> | null;
  cost_usd: number;
  elapsed_seconds: number;
  sources: string[];
  contact_id: string;
  agents_log: AgentLogEntry[];
  batch_id: string;
}

export interface ResearchSessionDetail {
  id: string;
  contact_id: string;
  profile: Profile;
  cost_usd: number | null;
  prospect_name: string;
  prospect_org: string;
  status: string;
  agents_log: AgentLogEntry[] | null;
  tier: string | null;
  batch_id: string | null;
  created_at: string;
}

export interface HistoryBatch {
  batch_id: string | null;
  created_at: string;
  prospects: HistoryProspect[];
}

export interface HistoryProspect {
  prospect_name: string;
  prospect_org: string;
  contact_id: string;
  runs: ResearchSession[];
}
