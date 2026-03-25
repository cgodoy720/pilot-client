/**
 * Frontend API response types.
 *
 * Mirrors the backend ApiResponse model so the frontend can
 * rely on a single contract: { success, data?, error?, meta? }.
 */

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  meta?: Record<string, unknown>;
}

/** Shape returned by Salesforce opportunity update / create endpoints. */
export interface MutationResult {
  id?: string;
  message: string;
}

/** Shape returned by bulk update endpoint. */
export interface BulkUpdateResult {
  total: number;
  success_count: number;
  failed_count: number;
  results: Array<{ id: string; success: boolean; error?: string }>;
}

/** Request shape for updating a single opportunity. */
export interface OpportunityUpdatePayload {
  opportunity_id: string;
  updates: Record<string, string | number | boolean | null>;
  reason?: string;
}

/** Request shape for creating a new opportunity. */
export interface OpportunityCreatePayload {
  Name: string;
  AccountId: string;
  StageName: string;
  Amount?: number;
  Probability?: number;
  CloseDate?: string;
  [key: string]: string | number | boolean | undefined;
}

/** Request shape for updating an Account. */
export interface AccountUpdatePayload {
  updates: Record<string, string | number | boolean | null>;
  reason?: string;
}

/** Request shape for updating a Contact. */
export interface ContactUpdatePayload {
  updates: Record<string, string | number | boolean | null>;
  reason?: string;
}

/** Request shape for updating a Payment. */
export interface PaymentUpdatePayload {
  updates: Record<string, string | number | boolean | null>;
  reason?: string;
}
