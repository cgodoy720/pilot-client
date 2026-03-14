import Papa from 'papaparse';
import type { LinkedInContact } from '../types/networkGraph';
import type { ImportResult } from '../types/weeklyPriorities';

const COLUMN_ALIASES: Record<string, keyof LinkedInContact> = {
  first_name: 'first_name',
  firstname: 'first_name',
  'first name': 'first_name',
  last_name: 'last_name',
  lastname: 'last_name',
  'last name': 'last_name',
  email: 'email',
  email_address: 'email',
  company: 'organization',
  organization: 'organization',
  position: 'title',
  title: 'title',
  connected_on: 'connection_date',
  connection_date: 'connection_date',
};

function normalizeKey(raw: string): string {
  return raw.trim().toLowerCase().replace(/[\s_-]+/g, '_');
}

export function parseLinkedInCSV(
  file: File
): Promise<ImportResult & { contacts: LinkedInContact[] }> {
  return new Promise((resolve) => {
    if (file.size > 5 * 1024 * 1024) {
      resolve({
        contacts: [],
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
            contacts: [],
            imported: 0,
            skipped: 0,
            errors: [{ row: 0, message: `TOO_MANY_ROWS: File has ${rows.length} rows; limit is 10,000.` }],
          });
          return;
        }

        const contacts: LinkedInContact[] = [];
        const errors: ImportResult['errors'] = [];
        const timestamp = Date.now();

        rows.forEach((row, index) => {
          const fields: Partial<Record<keyof LinkedInContact, string>> = {};
          Object.entries(row).forEach(([k, v]) => {
            const canonical = COLUMN_ALIASES[normalizeKey(k)];
            if (canonical) fields[canonical] = (v || '').trim();
          });

          const hasName = ((fields.first_name || '') + (fields.last_name || '')).trim().length > 0;
          if (!hasName) {
            errors.push({ row: index + 2, message: 'VALIDATION_ERROR: Missing name.' });
            return;
          }

          contacts.push({
            id: `li-${timestamp}-${index}`,
            first_name: fields.first_name || '',
            last_name: fields.last_name || '',
            email: fields.email || undefined,
            organization: fields.organization || undefined,
            title: fields.title || undefined,
            connection_date: fields.connection_date || undefined,
          });
        });

        resolve({ contacts, imported: contacts.length, skipped: errors.length, errors });
      },
      error: (err: Error) => {
        resolve({
          contacts: [],
          imported: 0,
          skipped: 0,
          errors: [{ row: 0, message: `PARSE_ERROR: ${err.message}` }],
        });
      },
    });
  });
}
