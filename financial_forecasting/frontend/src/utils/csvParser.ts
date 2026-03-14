import Papa from 'papaparse';
import type { ImportResult, Lead } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Column alias table: raw CSV header → canonical field name
// ---------------------------------------------------------------------------
export type LeadField =
  | 'name'
  | 'first_name'
  | 'last_name'
  | 'organization'
  | 'title'
  | 'notes'
  | 'email'
  | 'phone'
  | 'estimated_capacity'
  | 'avg_comparable_grant'
  | 'estimated_ask'
  | 'likelihood'
  | 'wealth_tier';

export const COLUMN_ALIASES: Record<string, LeadField> = {
  name: 'name',
  full_name: 'name',
  contact_name: 'name',
  first_name: 'first_name',
  firstname: 'first_name',
  'first name': 'first_name',
  last_name: 'last_name',
  lastname: 'last_name',
  'last name': 'last_name',
  organization: 'organization',
  company: 'organization',
  org: 'organization',
  title: 'title',
  job_title: 'title',
  notes: 'notes',
  note: 'notes',
  email: 'email',
  email_address: 'email',
  phone: 'phone',
  phone_number: 'phone',
  // Prospect sizing
  capacity: 'estimated_capacity',
  giving_capacity: 'estimated_capacity',
  estimated_capacity: 'estimated_capacity',
  avg_grant: 'avg_comparable_grant',
  average_grant: 'avg_comparable_grant',
  comparable_grant: 'avg_comparable_grant',
  avg_comparable_grant: 'avg_comparable_grant',
  ask: 'estimated_ask',
  estimated_ask: 'estimated_ask',
  likelihood: 'likelihood',
  probability: 'likelihood',
  wealth_tier: 'wealth_tier',
  tier: 'wealth_tier',
};

export function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, '_');
}

// ---------------------------------------------------------------------------
// CSV parser: returns ImportResult + leads
// Max 5 MB, 10 000 rows. Bad rows skipped with error entry.
// ---------------------------------------------------------------------------
export function parseCSV(file: File): Promise<ImportResult & { leads: Lead[] }> {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      resolve({
        leads: [],
        imported: 0,
        skipped: 0,
        errors: [{ row: 0, message: 'FILE_TOO_LARGE: File exceeds 5 MB limit.' }],
      });
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data as Record<string, string>[];

        if (rows.length > 10000) {
          resolve({
            leads: [],
            imported: 0,
            skipped: 0,
            errors: [{ row: 0, message: `TOO_MANY_ROWS: File has ${rows.length} rows; limit is 10,000.` }],
          });
          return;
        }

        const leads: Lead[] = [];
        const errors: ImportResult['errors'] = [];
        const timestamp = Date.now();
        const now = new Date().toISOString();

        rows.forEach((row, index) => {
          const fields: Partial<Record<LeadField, string>> = {};
          Object.entries(row).forEach(([k, v]) => {
            const canonical = COLUMN_ALIASES[normalizeKey(k)];
            if (canonical) fields[canonical] = (v || '').trim();
          });

          if (fields['name'] && !fields['first_name'] && !fields['last_name']) {
            const parts = (fields['name'] as string).split(/\s+/);
            fields['first_name'] = parts[0] || '';
            fields['last_name'] = parts.slice(1).join(' ') || '';
          }

          const hasName = ((fields['first_name'] || '') + (fields['last_name'] || '')).trim().length > 0;
          if (!hasName) {
            errors.push({ row: index + 2, message: 'VALIDATION_ERROR: Missing required name field.' });
            return;
          }

          const parseNum = (v: string | undefined): number | undefined => {
            if (!v) return undefined;
            const n = Number(v.replace(/[$,]/g, ''));
            return isNaN(n) ? undefined : n;
          };

          leads.push({
            id: `lead-${timestamp}-${index}`,
            first_name: fields['first_name'] || '',
            last_name: fields['last_name'] || '',
            organization: fields['organization'],
            title: fields['title'],
            notes: fields['notes'],
            email: fields['email'],
            phone: fields['phone'],
            source: file.name,
            status: 'new',
            priority: 'medium',
            created_at: now,
            updated_at: now,
            estimated_capacity: parseNum(fields['estimated_capacity']),
            avg_comparable_grant: parseNum(fields['avg_comparable_grant']),
            estimated_ask: parseNum(fields['estimated_ask']),
            likelihood: parseNum(fields['likelihood']),
            wealth_tier: (['tier-1', 'tier-2', 'tier-3', 'tier-4', 'unknown'].includes(fields['wealth_tier'] || '')
              ? fields['wealth_tier'] as any
              : undefined),
          });
        });

        resolve({ leads, imported: leads.length, skipped: errors.length, errors });
      },
      error: (err: Error) => {
        resolve({
          leads: [],
          imported: 0,
          skipped: 0,
          errors: [{ row: 0, message: `PARSE_ERROR: ${err.message}` }],
        });
      },
    });
  });
}
