import Papa from 'papaparse';
import type { ImportResult, Lead, ProspectType, TimelineFit } from '../types/weeklyPriorities';

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
  | 'wealth_tier'
  // Giving capacity fields
  | 'prospect_type'
  | 'net_worth_estimate'
  | 'annual_giving_history'
  | 'asset_holdings'
  | 'institutional_role'
  | 'institution_name'
  | 'institution_annual_budget'
  | 'board_memberships'
  | 'government_office'
  | 'discretionary_budget'
  | 'degrees_of_separation'
  | 'relationship_strength'
  | 'affinity_tags'
  | 'timeline_fit'
  | 'ein';

const VALID_PROSPECT_TYPES: ProspectType[] = ['hnwi', 'elected_official', 'institutional_grantmaker', 'board_member', 'connector', 'unknown'];
const VALID_TIMELINE_FITS: TimelineFit[] = ['immediate', '6mo', '12mo', '18mo', 'long_term'];

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
  // Giving capacity fields
  prospect_type: 'prospect_type',
  type_of_prospect: 'prospect_type',
  net_worth: 'net_worth_estimate',
  net_worth_estimate: 'net_worth_estimate',
  annual_giving: 'annual_giving_history',
  giving_history: 'annual_giving_history',
  annual_giving_history: 'annual_giving_history',
  assets: 'asset_holdings',
  asset_holdings: 'asset_holdings',
  role: 'institutional_role',
  institutional_role: 'institutional_role',
  institution: 'institution_name',
  institution_name: 'institution_name',
  inst_budget: 'institution_annual_budget',
  institution_annual_budget: 'institution_annual_budget',
  institution_budget: 'institution_annual_budget',
  boards: 'board_memberships',
  board_memberships: 'board_memberships',
  office: 'government_office',
  government_office: 'government_office',
  disc_budget: 'discretionary_budget',
  discretionary_budget: 'discretionary_budget',
  hops: 'degrees_of_separation',
  degrees_separation: 'degrees_of_separation',
  degrees_of_separation: 'degrees_of_separation',
  rel_strength: 'relationship_strength',
  relationship_strength: 'relationship_strength',
  affinity: 'affinity_tags',
  affinity_tags: 'affinity_tags',
  timeline: 'timeline_fit',
  timeline_fit: 'timeline_fit',
  ein: 'ein',
  tax_id: 'ein',
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

          // Parse affinity_tags from comma-separated string
          const affinityRaw = fields['affinity_tags'];
          const affinityTags = affinityRaw
            ? affinityRaw.split(',').map((t) => t.trim()).filter(Boolean)
            : undefined;

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
            // Giving capacity fields
            prospect_type: (VALID_PROSPECT_TYPES.includes(fields['prospect_type'] as ProspectType)
              ? fields['prospect_type'] as ProspectType
              : undefined),
            net_worth_estimate: parseNum(fields['net_worth_estimate']),
            annual_giving_history: parseNum(fields['annual_giving_history']),
            asset_holdings: parseNum(fields['asset_holdings']),
            institutional_role: fields['institutional_role'],
            institution_name: fields['institution_name'],
            institution_annual_budget: parseNum(fields['institution_annual_budget']),
            board_memberships: fields['board_memberships'],
            government_office: fields['government_office'],
            discretionary_budget: parseNum(fields['discretionary_budget']),
            degrees_of_separation: parseNum(fields['degrees_of_separation']),
            relationship_strength: parseNum(fields['relationship_strength']),
            affinity_tags: affinityTags,
            timeline_fit: (VALID_TIMELINE_FITS.includes(fields['timeline_fit'] as TimelineFit)
              ? fields['timeline_fit'] as TimelineFit
              : undefined),
            ein: fields['ein'],
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
