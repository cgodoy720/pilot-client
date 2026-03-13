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
