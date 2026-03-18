import { parseLinkedInCSV } from './linkedInCsvParser';

// Helper: create a File from CSV string
function csvFile(content: string, name = 'linkedin.csv'): File {
  return new File([content], name, { type: 'text/csv' });
}

// ---------------------------------------------------------------------------
// Happy path
// ---------------------------------------------------------------------------
describe('parseLinkedInCSV', () => {
  it('imports valid rows with standard LinkedIn column names', async () => {
    const csv =
      'First Name,Last Name,Email Address,Company,Position,Connected On\n' +
      'Alice,Smith,alice@example.com,Acme Inc,Director,01 Jan 2025\n' +
      'Bob,Jones,bob@example.com,Initech,VP,15 Mar 2025\n';

    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.contacts).toHaveLength(2);

    const alice = result.contacts[0];
    expect(alice.first_name).toBe('Alice');
    expect(alice.last_name).toBe('Smith');
    expect(alice.email).toBe('alice@example.com');
    expect(alice.organization).toBe('Acme Inc');
    expect(alice.title).toBe('Director');
    expect(alice.connection_date).toBe('01 Jan 2025');
    expect(alice.id).toMatch(/^li-\d+-0$/);
  });

  // ── Column alias handling ───────────────────────────────────────────────
  it('recognizes column aliases (email_address, organization, title)', async () => {
    const csv =
      'FirstName,LastName,Email,Organization,Title,Connection Date\n' +
      'Carol,Lee,carol@test.com,BigCorp,CTO,2024-12-01\n';

    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    const c = result.contacts[0];
    expect(c.first_name).toBe('Carol');
    expect(c.organization).toBe('BigCorp');
    expect(c.title).toBe('CTO');
    expect(c.connection_date).toBe('2024-12-01');
  });

  // ── Partial data ────────────────────────────────────────────────────────
  it('imports contacts with only a name (optional fields are undefined)', async () => {
    const csv = 'First Name,Last Name\nDave,Kim\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    const c = result.contacts[0];
    expect(c.first_name).toBe('Dave');
    expect(c.email).toBeUndefined();
    expect(c.organization).toBeUndefined();
    expect(c.title).toBeUndefined();
  });

  it('accepts first name only (no last name) as valid', async () => {
    const csv = 'First Name,Last Name\nEve,\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    expect(result.contacts[0].first_name).toBe('Eve');
    expect(result.contacts[0].last_name).toBe('');
  });

  // ── Validation ──────────────────────────────────────────────────────────
  it('skips rows with no name and reports VALIDATION_ERROR', async () => {
    const csv = 'First Name,Last Name,Email\n,,anon@test.com\nAlice,Smith,a@b.com\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    expect(result.skipped).toBe(1);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('VALIDATION_ERROR');
    expect(result.errors[0].row).toBe(2); // 1-indexed data row + header
  });

  it('handles partial success (mix of valid and invalid rows)', async () => {
    const csv = 'First Name,Last Name\nAlice,Smith\n,\nBob,Jones\n,\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(2);
    expect(result.skipped).toBe(2);
    expect(result.contacts).toHaveLength(2);
    expect(result.errors).toHaveLength(2);
  });

  // ── File size limit ─────────────────────────────────────────────────────
  it('rejects files over 5 MB with FILE_TOO_LARGE', async () => {
    const bigContent = 'First Name\n' + 'A'.repeat(6 * 1024 * 1024);
    const result = await parseLinkedInCSV(csvFile(bigContent));

    expect(result.imported).toBe(0);
    expect(result.contacts).toEqual([]);
    expect(result.errors[0].message).toContain('FILE_TOO_LARGE');
  });

  // ── Row count limit ─────────────────────────────────────────────────────
  it('rejects files with more than 10,000 rows', async () => {
    const header = 'First Name,Last Name\n';
    const rows = Array.from({ length: 10001 }, (_, i) => `User${i},Last${i}`).join('\n');
    const result = await parseLinkedInCSV(csvFile(header + rows));

    expect(result.imported).toBe(0);
    expect(result.contacts).toEqual([]);
    expect(result.errors[0].message).toContain('TOO_MANY_ROWS');
  });

  // ── Edge cases ──────────────────────────────────────────────────────────
  it('returns empty result for header-only CSV', async () => {
    const csv = 'First Name,Last Name\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.errors).toEqual([]);
    expect(result.contacts).toEqual([]);
  });

  it('ignores unrecognized columns without error', async () => {
    const csv = 'First Name,Last Name,Zodiac Sign,Shoe Size\nAlice,Smith,Aries,8\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.imported).toBe(1);
    expect(result.contacts[0].first_name).toBe('Alice');
  });

  it('trims whitespace from field values', async () => {
    const csv = 'First Name,Last Name,Email\n  Alice  ,  Smith  ,  alice@test.com  \n';
    const result = await parseLinkedInCSV(csvFile(csv));

    expect(result.contacts[0].first_name).toBe('Alice');
    expect(result.contacts[0].last_name).toBe('Smith');
    expect(result.contacts[0].email).toBe('alice@test.com');
  });

  // ── ID uniqueness ──────────────────────────────────────────────────────
  it('generates unique IDs for each contact', async () => {
    const csv = 'First Name,Last Name\nAlice,Smith\nBob,Jones\nCarol,Lee\n';
    const result = await parseLinkedInCSV(csvFile(csv));

    const ids = result.contacts.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
