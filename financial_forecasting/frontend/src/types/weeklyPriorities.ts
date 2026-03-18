export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
export type LeadPriority = 'high' | 'medium' | 'low';
export type WealthTier = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'unknown';
export type ProspectType = 'hnwi' | 'elected_official' | 'institutional_grantmaker' | 'board_member' | 'connector' | 'unknown';
export type TimelineFit = 'immediate' | '6mo' | '12mo' | '18mo' | 'long_term';
export type EnrichmentStatus = 'pending' | 'enriched' | 'partial' | 'not_found';

export interface Lead {
  id: string; // lead-{timestamp}-{index}
  first_name: string;
  last_name: string;
  organization?: string;
  title?: string;
  notes?: string;
  email?: string;
  phone?: string;
  source: string; // e.g. filename
  grant_id?: string; // linked opportunity ID
  status: LeadStatus;
  priority: LeadPriority;
  created_at: string; // ISO string
  updated_at: string; // ISO string
  owner?: string; // user display name
  // Prospect sizing
  estimated_capacity?: number;
  avg_comparable_grant?: number;
  estimated_ask?: number;
  likelihood?: number; // 0-100
  // Additional context
  linkedin_url?: string;
  connection_date?: string;
  wealth_tier?: WealthTier;
  tags?: string[];
  // Giving capacity calculator fields
  prospect_type?: ProspectType;
  net_worth_estimate?: number;
  annual_giving_history?: number;
  asset_holdings?: number;
  institutional_role?: string;
  institution_name?: string;
  institution_annual_budget?: number;
  board_memberships?: string;
  government_office?: string;
  discretionary_budget?: number;
  degrees_of_separation?: number;
  relationship_strength?: number; // 1-5
  affinity_tags?: string[];
  timeline_fit?: TimelineFit;
  capacity_score?: number; // 0-100 composite score
  capacity_computed_at?: string; // ISO timestamp
  // 990 enrichment fields
  ein?: string;
  enrichment_status?: EnrichmentStatus;
  enrichment_source?: string;
  enriched_at?: string;
  comparable_grants_to_similar_orgs?: number;
  total_990_assets?: number;
  total_990_grants_paid?: number;
}

export interface Grant {
  id: string;
  name: string;
  close_date: string; // ISO date string e.g. "2026-03-20"
  stage: string;
}

export interface WeeklyPriorityItem {
  lead: Lead;
  grant: Grant;
  suggested_action: string;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  errors: Array<{ row: number; message: string }>;
}
