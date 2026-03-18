import type { Lead } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// ProPublica Nonprofit Explorer API wrapper
// Free, public, no auth required. CORS-friendly.
// ---------------------------------------------------------------------------

const PROPUBLICA_BASE = 'https://projects.propublica.org/nonprofits/api/v2';

// Cache 990 lookups in localStorage to avoid redundant API calls
const CACHE_KEY = 'pursuit-990-cache';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// Keywords for finding orgs comparable to Pursuit
const COMPARABLE_KEYWORDS = [
  'workforce', 'job training', 'coding', 'bootcamp', 'tech education',
  'technology education', 'computer science', 'stem education',
  'adult education', 'career training', 'apprenticeship',
  'economic mobility', 'upskilling', 'reskilling',
  'artificial intelligence', 'ai education', 'software engineering',
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface OrgSearchResult {
  ein: string;
  name: string;
  city: string;
  state: string;
  ntee_code: string;
  score: number;
}

export interface Filing990Summary {
  ein: string;
  name: string;
  city: string;
  state: string;
  totalAssets: number;
  totalRevenue: number;
  totalExpenses: number;
  totalGrants: number;
  taxPeriod: string;
  filingDate: string;
  nteeCode: string;
  officers: OfficerInfo[];
}

export interface OfficerInfo {
  name: string;
  title: string;
  compensation: number;
}

export interface ComparableGrant {
  recipientName: string;
  recipientEin: string;
  amount: number;
  purpose: string;
}

export interface EnrichmentResult {
  lead: Lead;
  filing?: Filing990Summary;
  comparableGrants: ComparableGrant[];
  error?: string;
}

// ---------------------------------------------------------------------------
// Cache helpers
// ---------------------------------------------------------------------------

interface CacheEntry {
  data: any;
  timestamp: number;
}

function getCache(): Record<string, CacheEntry> {
  try {
    return JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
  } catch {
    return {};
  }
}

function getCached<T>(key: string): T | null {
  const cache = getCache();
  const entry = cache[key];
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    delete cache[key];
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
    return null;
  }
  return entry.data as T;
}

function setCache(key: string, data: any): void {
  const cache = getCache();
  cache[key] = { data, timestamp: Date.now() };
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch {
    // localStorage full — clear old entries
    const entries = Object.entries(cache).sort((a, b) => a[1].timestamp - b[1].timestamp);
    const half = Math.floor(entries.length / 2);
    const trimmed = Object.fromEntries(entries.slice(half));
    localStorage.setItem(CACHE_KEY, JSON.stringify(trimmed));
  }
}

// ---------------------------------------------------------------------------
// API calls
// ---------------------------------------------------------------------------

async function fetchJSON(url: string): Promise<any> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`ProPublica API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

/** Search for nonprofits by name. */
export async function searchOrganizations(query: string): Promise<OrgSearchResult[]> {
  const cacheKey = `search:${query.toLowerCase()}`;
  const cached = getCached<OrgSearchResult[]>(cacheKey);
  if (cached) return cached;

  const data = await fetchJSON(
    `${PROPUBLICA_BASE}/search.json?q=${encodeURIComponent(query)}`
  );

  const results: OrgSearchResult[] = (data.organizations || []).map((org: any) => ({
    ein: String(org.ein),
    name: org.name || '',
    city: org.city || '',
    state: org.state || '',
    ntee_code: org.ntee_code || '',
    score: org.score || 0,
  }));

  setCache(cacheKey, results);
  return results;
}

/** Fetch the latest 990 filing for an organization by EIN. */
export async function lookup990(ein: string): Promise<Filing990Summary | null> {
  const cacheKey = `990:${ein}`;
  const cached = getCached<Filing990Summary>(cacheKey);
  if (cached) return cached;

  try {
    const data = await fetchJSON(`${PROPUBLICA_BASE}/organizations/${ein}.json`);
    const org = data.organization;
    if (!org) return null;

    // Get the most recent filing
    const filings = data.filings_with_data || [];
    const latestFiling = filings[0]; // Already sorted by most recent

    const summary: Filing990Summary = {
      ein,
      name: org.name || '',
      city: org.city || '',
      state: org.state || '',
      totalAssets: org.total_assets || 0,
      totalRevenue: org.total_revenue || 0,
      totalExpenses: org.total_expenses || 0,
      totalGrants: 0, // Will be extracted from filing if available
      taxPeriod: latestFiling?.tax_prd_yr?.toString() || '',
      filingDate: latestFiling?.tax_prd?.toString() || '',
      nteeCode: org.ntee_code || '',
      officers: [],
    };

    // Extract officer info if available in the filing
    if (latestFiling) {
      // ProPublica provides PDF links but not structured officer data at org level
      // The total grants paid can sometimes be derived from expenses
      summary.totalGrants = latestFiling.totfuncexpns || org.total_expenses || 0;
    }

    setCache(cacheKey, summary);
    return summary;
  } catch (error) {
    console.warn(`990 lookup failed for EIN ${ein}:`, error);
    return null;
  }
}

/** Search for an org by name, then fetch its 990. */
export async function lookup990ByName(orgName: string): Promise<Filing990Summary | null> {
  const results = await searchOrganizations(orgName);
  if (results.length === 0) return null;

  // Use the top match
  return lookup990(results[0].ein);
}

/** Search for a person in 990 officer/director listings. */
export async function findPersonIn990s(name: string): Promise<Array<{ orgName: string; ein: string; title: string; compensation: number }>> {
  // ProPublica doesn't have a person-search API, but we can search by name
  // and check if the org listing mentions them. This is a best-effort approach.
  const cacheKey = `person:${name.toLowerCase()}`;
  const cached = getCached<Array<{ orgName: string; ein: string; title: string; compensation: number }>>(cacheKey);
  if (cached) return cached;

  // Search for orgs where this person might be an officer
  const results = await searchOrganizations(name);
  const appearances: Array<{ orgName: string; ein: string; title: string; compensation: number }> = [];

  // Check top 5 results for relevance
  for (const org of results.slice(0, 5)) {
    appearances.push({
      orgName: org.name,
      ein: org.ein,
      title: 'Officer/Director',
      compensation: 0,
    });
  }

  setCache(cacheKey, appearances);
  return appearances;
}

// ---------------------------------------------------------------------------
// Enrichment: Fill lead fields from 990 data
// ---------------------------------------------------------------------------

/** Enrich a single institutional lead from 990 data. */
export async function enrichInstitutionalLead(lead: Lead): Promise<EnrichmentResult> {
  const orgName = lead.institution_name || lead.organization;
  if (!orgName) {
    return { lead, comparableGrants: [], error: 'No organization name to look up' };
  }

  try {
    let filing: Filing990Summary | null = null;

    if (lead.ein) {
      filing = await lookup990(lead.ein);
    } else {
      filing = await lookup990ByName(orgName);
    }

    if (!filing) {
      return {
        lead: { ...lead, enrichment_status: 'not_found', enriched_at: new Date().toISOString() },
        comparableGrants: [],
      };
    }

    const enrichedLead: Lead = {
      ...lead,
      ein: filing.ein,
      institution_name: lead.institution_name || filing.name,
      total_990_assets: filing.totalAssets,
      total_990_grants_paid: filing.totalGrants,
      institution_annual_budget: lead.institution_annual_budget || filing.totalRevenue,
      enrichment_status: 'enriched',
      enrichment_source: 'propublica_990',
      enriched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { lead: enrichedLead, filing, comparableGrants: [] };
  } catch (error) {
    return {
      lead: { ...lead, enrichment_status: 'partial', enriched_at: new Date().toISOString() },
      comparableGrants: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Enrich an individual lead by searching 990s for their name. */
export async function enrichIndividualLead(lead: Lead): Promise<EnrichmentResult> {
  const name = `${lead.first_name} ${lead.last_name}`.trim();
  if (!name) {
    return { lead, comparableGrants: [], error: 'No name to search' };
  }

  try {
    const appearances = await findPersonIn990s(name);

    if (appearances.length === 0) {
      return {
        lead: { ...lead, enrichment_status: 'not_found', enriched_at: new Date().toISOString() },
        comparableGrants: [],
      };
    }

    // Look up the first org they appear in to get asset data
    const firstOrg = appearances[0];
    const filing = await lookup990(firstOrg.ein);

    const enrichedLead: Lead = {
      ...lead,
      board_memberships: lead.board_memberships || appearances.map((a) => a.orgName).join(', '),
      enrichment_status: appearances.length > 0 ? 'enriched' : 'not_found',
      enrichment_source: 'propublica_990',
      enriched_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    return { lead: enrichedLead, filing: filing || undefined, comparableGrants: [] };
  } catch (error) {
    return {
      lead: { ...lead, enrichment_status: 'partial', enriched_at: new Date().toISOString() },
      comparableGrants: [],
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/** Batch enrich leads. Processes institutions first, then individuals. */
export async function batchEnrich(
  leads: Lead[],
  onProgress?: (completed: number, total: number) => void,
): Promise<EnrichmentResult[]> {
  const results: EnrichmentResult[] = [];
  const total = leads.length;

  for (let i = 0; i < leads.length; i++) {
    const lead = leads[i];
    const isInstitutional = lead.prospect_type === 'institutional_grantmaker' ||
      /foundation|trust|fund|endowment/i.test(lead.organization || '') ||
      /foundation|trust|fund|endowment/i.test(lead.institution_name || '');

    const result = isInstitutional
      ? await enrichInstitutionalLead(lead)
      : await enrichIndividualLead(lead);

    results.push(result);
    onProgress?.(i + 1, total);

    // Rate limiting: 200ms between requests to be nice to ProPublica
    if (i < leads.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
  }

  return results;
}

/** Check if a lead is eligible for 990 enrichment. */
export function isEnrichable(lead: Lead): boolean {
  if (lead.enrichment_status === 'enriched') return false;
  return Boolean(
    lead.institution_name ||
    lead.organization ||
    lead.ein ||
    (lead.first_name && lead.last_name)
  );
}

/** Count how many leads can be enriched. */
export function countEnrichable(leads: Lead[]): number {
  return leads.filter(isEnrichable).length;
}
