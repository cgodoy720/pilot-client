import { parseCSV, normalizeKey, COLUMN_ALIASES } from './csvParser';

// Helper: create a File from CSV string
function csvFile(content: string, name = 'test.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

// ---------------------------------------------------------------------------
// normalizeKey
// ---------------------------------------------------------------------------
describe('normalizeKey', () => {
  it('lowercases and collapses whitespace/dashes to underscores', () => {
    expect(normalizeKey('First Name')).toBe('first_name');
    expect(normalizeKey('  Last-Name ')).toBe('last_name');
    expect(normalizeKey('EMAIL')).toBe('email');
  });
});

// ---------------------------------------------------------------------------
// COLUMN_ALIASES coverage
// ---------------------------------------------------------------------------
describe('COLUMN_ALIASES', () => {
  it('maps common aliases', () => {
    expect(COLUMN_ALIASES['company']).toBe('organization');
    expect(COLUMN_ALIASES['firstname']).toBe('first_name');
    expect(COLUMN_ALIASES['contact_name']).toBe('name');
  });
});

// ---------------------------------------------------------------------------
// parseCSV – contract shape (§1.1 of REQUIREMENTS-GAPS-AND-STRUCTURE)
// ---------------------------------------------------------------------------
describe('parseCSV', () => {
  // Acceptance criterion 1: CSV with required columns → imported = N, skipped = 0
  it('imports valid rows and returns the ImportResult contract shape', async () => {
    const csv = 'First Name,Last Name,Organization,Title\nAlice,Smith,Acme,VP\nBob,Jones,Initech,Dir\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.leads).toHaveLength(2);

    // Contract: each lead has required fields
    const lead = result.leads[0];
    expect(lead.id).toMatch(/^lead-\d+-0$/);
    expect(lead.first_name).toBe('Alice');
    expect(lead.last_name).toBe('Smith');
    expect(lead.organization).toBe('Acme');
    expect(lead.title).toBe('VP');
    expect(lead.source).toBe('test.csv');
    expect(lead.grant_id).toBeUndefined();
  });

  // Acceptance criterion 2: missing name → VALIDATION_ERROR, row not added
  it('skips rows missing required name and reports VALIDATION_ERROR', async () => {
    const csv = 'Organization,Title\nAcme,VP\nInitech,Dir\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(2);
    expect(result.errors).toHaveLength(2);
    expect(result.errors[0].message).toContain('VALIDATION_ERROR');
    expect(result.errors[0].row).toBe(2); // row numbers are 1-indexed + header
    expect(result.leads).toEqual([]);
  });

  it('handles "Name" column by splitting into first/last', async () => {
    const csv = 'Name,Email\nAlice Smith,alice@example.com\nBob,bob@example.com\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(2);
    expect(result.leads[0].first_name).toBe('Alice');
    expect(result.leads[0].last_name).toBe('Smith');
    expect(result.leads[1].first_name).toBe('Bob');
    expect(result.leads[1].last_name).toBe('');
  });

  it('handles column aliases (Company, FirstName, etc.)', async () => {
    const csv = 'FirstName,LastName,Company,Job_Title,Email_Address,Phone_Number\nAlice,Smith,Acme,VP,a@b.com,555-1234\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    const lead = result.leads[0];
    expect(lead.organization).toBe('Acme');
    expect(lead.title).toBe('VP');
    expect(lead.email).toBe('a@b.com');
    expect(lead.phone).toBe('555-1234');
  });

  it('partial success: imports valid rows, skips invalid ones', async () => {
    const csv = 'First Name,Last Name\nAlice,Smith\n,\nBob,Jones\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.leads).toHaveLength(2);
  });

  it('rejects files over 5 MB with FILE_TOO_LARGE', async () => {
    const bigContent = 'Name\n' + 'A'.repeat(6 * 1024 * 1024);
    const result = await parseCSV(csvFile(bigContent));

    expect(result.imported).toBe(0);
    expect(result.errors[0].message).toContain('FILE_TOO_LARGE');
    expect(result.leads).toEqual([]);
  });

  it('ignores unknown columns gracefully', async () => {
    const csv = 'First Name,Last Name,Favorite Color,Zodiac Sign\nAlice,Smith,Blue,Aries\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    expect(result.leads[0].first_name).toBe('Alice');
  });

  it('returns an empty result for an empty CSV (header only)', async () => {
    const csv = 'First Name,Last Name\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.leads).toEqual([]);
  });

  // -------------------------------------------------------------------------
  // Numeric field parsing (parseNum strips $, before Number())
  // -------------------------------------------------------------------------
  it('parses dollar-formatted capacity and ask fields', async () => {
    const csv = 'First Name,Last Name,Estimated Capacity,Estimated Ask,Likelihood\nAlice,Smith,"$50,000","$25,000",0.75\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    const lead = result.leads[0];
    expect(lead.estimated_capacity).toBe(50000);
    expect(lead.estimated_ask).toBe(25000);
    expect(lead.likelihood).toBe(0.75);
  });

  it('parses avg_comparable_grant with alias "average_grant"', async () => {
    const csv = 'First Name,Last Name,Average Grant\nAlice,Smith,"$10,000"\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.leads[0].avg_comparable_grant).toBe(10000);
  });

  it('leaves numeric fields undefined when non-numeric', async () => {
    const csv = 'First Name,Last Name,Estimated Capacity,Likelihood\nAlice,Smith,N/A,high\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.leads[0].estimated_capacity).toBeUndefined();
    expect(result.leads[0].likelihood).toBeUndefined();
  });

  it('leaves numeric fields undefined when empty', async () => {
    const csv = 'First Name,Last Name,Estimated Capacity\nAlice,Smith,\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.leads[0].estimated_capacity).toBeUndefined();
  });

  // -------------------------------------------------------------------------
  // Wealth tier validation
  // -------------------------------------------------------------------------
  it('accepts valid wealth tiers', async () => {
    const csv = 'First Name,Last Name,Wealth Tier\nAlice,Smith,tier-1\nBob,Jones,tier-4\nCarl,Lee,unknown\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.leads[0].wealth_tier).toBe('tier-1');
    expect(result.leads[1].wealth_tier).toBe('tier-4');
    expect(result.leads[2].wealth_tier).toBe('unknown');
  });

  it('rejects invalid wealth tier values', async () => {
    const csv = 'First Name,Last Name,Wealth Tier\nAlice,Smith,tier-5\nBob,Jones,Tier-1\n';
    const result = await parseCSV(csvFile(csv));

    expect(result.leads[0].wealth_tier).toBeUndefined();
    expect(result.leads[1].wealth_tier).toBeUndefined(); // case-sensitive
  });
});
