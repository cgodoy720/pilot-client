/**
 * Activity types — mirrors bedrock.activity table schema and M10 backend models.
 * See: financial_forecasting/models.py (lines 70-185)
 * See: financial_forecasting/db/init.sql (lines 380-473)
 */

// ---------------------------------------------------------------------------
// Enums (string unions matching backend CHECK constraints)
// ---------------------------------------------------------------------------

export type ActivityType =
  | 'call'
  | 'email'
  | 'meeting'
  | 'note'
  | 'slack-message'
  | 'calendar-event';

export type ActivitySource =
  | 'salesforce'
  | 'extension'
  | 'manual'
  | 'gmail-sync'
  | 'calendar-sync';

export type SfSyncStatus = 'synced' | 'pending' | 'failed';

export type Momentum = 'increasing' | 'stable' | 'declining' | 'new';

// ---------------------------------------------------------------------------
// Activity (response shape from _row_to_dict)
// ---------------------------------------------------------------------------

export interface Activity {
  id: string;

  // Salesforce identifiers
  sf_id: string | null;
  sf_type: 'Task' | 'Event' | null;

  // Core fields
  type: ActivityType;
  subject: string;
  description: string | null;
  description_html: string | null;
  activity_date: string; // ISO datetime

  // Association (Opportunity-first model)
  opportunity_id: string | null;
  account_id: string | null;
  contact_ids: string[];
  project_task_id: string | null;
  sf_task_id: string | null;

  // Source tracking
  source: ActivitySource;
  source_ref: string | null;
  source_thread_id: string | null;

  // Email-specific
  email_from: string | null;
  email_to: string[] | null;
  email_cc: string[] | null;
  email_snippet: string | null;

  // Meeting-specific
  meeting_duration_minutes: number | null;
  meeting_attendees: Array<Record<string, any>> | null;
  meeting_location: string | null;

  // Attachments
  attachments: Array<Record<string, any>> | null;

  // Ownership
  logged_by: string | null;
  owner_id: string | null;

  // Sync metadata
  sf_last_modified: string | null;
  synced_at: string | null;
  sf_sync_status: SfSyncStatus | null;

  // Timestamps
  created_at: string | null;
  updated_at: string | null;

  // Search-only: present when returned by GET /api/activities/search
  rank?: number;
}

// ---------------------------------------------------------------------------
// Create / Update payloads
// ---------------------------------------------------------------------------

/** POST /api/activities body — mirrors ActivityCreate (models.py:91-115) */
export interface ActivityCreatePayload {
  type: ActivityType;
  subject: string;
  activity_date: string;
  source: ActivitySource;
  description?: string;
  description_html?: string;
  opportunity_id?: string;
  account_id?: string;
  contact_ids?: string[];
  project_task_id?: string;
  sf_task_id?: string;
  source_ref?: string;
  source_thread_id?: string;
  email_from?: string;
  email_to?: string[];
  email_cc?: string[];
  email_snippet?: string;
  meeting_duration_minutes?: number;
  meeting_attendees?: Array<Record<string, any>>;
  meeting_location?: string;
  logged_by?: string;
  owner_id?: string;
}

/** PUT /api/activities/:id body — all fields optional (models.py:117-140) */
export type ActivityUpdatePayload = Partial<ActivityCreatePayload>;

// ---------------------------------------------------------------------------
// Query params
// ---------------------------------------------------------------------------

/** GET /api/activities query params */
export interface ActivityFilterParams {
  opportunity_id?: string;
  account_id?: string;
  contact_id?: string;
  type?: ActivityType;
  source?: ActivitySource;
  start_date?: string;
  end_date?: string;
  limit?: number;
  offset?: number;
}

/** GET /api/activities/search query params */
export interface ActivitySearchParams {
  q: string;
  opportunity_id?: string;
  account_id?: string;
  contact_id?: string;
  months?: number;
  limit?: number;
}

// ---------------------------------------------------------------------------
// Insights response (direct Pydantic model — NOT wrapped in ApiResponse)
// ---------------------------------------------------------------------------

export interface ActivityInsightsResponse {
  summary: string;
  key_findings: string[];
  action_items: string[];
  momentum: Momentum | null;
  generated_at: string;
  confidence: 'structured' | 'raw' | 'none';
}
