export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'unqualified' | 'converted';
export type LeadPriority = 'high' | 'medium' | 'low';
export type WealthTier = 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'unknown';

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
