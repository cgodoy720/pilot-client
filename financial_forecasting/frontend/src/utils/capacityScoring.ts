import type { Lead, ProspectType, WealthTier } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Sub-score breakdown returned by computeSubScores
// ---------------------------------------------------------------------------
export interface SubScoreBreakdown {
  directWealth: number;       // 0-100
  institutionalAuthority: number; // 0-100
  givingHistory: number;      // 0-100
  relationshipAccess: number; // 0-100
  affinityTimeline: number;   // 0-100
  weights: WeightProfile;
  composite: number;          // 0-100
}

export interface WeightProfile {
  directWealth: number;
  institutionalAuthority: number;
  givingHistory: number;
  relationshipAccess: number;
  affinityTimeline: number;
}

// ---------------------------------------------------------------------------
// Default weights and prospect-type-specific overrides
// ---------------------------------------------------------------------------
const DEFAULT_WEIGHTS: WeightProfile = {
  directWealth: 0.25,
  institutionalAuthority: 0.25,
  givingHistory: 0.20,
  relationshipAccess: 0.15,
  affinityTimeline: 0.15,
};

const PROSPECT_TYPE_WEIGHTS: Record<ProspectType, WeightProfile> = {
  hnwi: { directWealth: 0.35, institutionalAuthority: 0.15, givingHistory: 0.20, relationshipAccess: 0.15, affinityTimeline: 0.15 },
  elected_official: { directWealth: 0.15, institutionalAuthority: 0.35, givingHistory: 0.20, relationshipAccess: 0.15, affinityTimeline: 0.15 },
  institutional_grantmaker: { directWealth: 0.15, institutionalAuthority: 0.30, givingHistory: 0.25, relationshipAccess: 0.15, affinityTimeline: 0.15 },
  board_member: { directWealth: 0.15, institutionalAuthority: 0.30, givingHistory: 0.15, relationshipAccess: 0.20, affinityTimeline: 0.20 },
  connector: { directWealth: 0.10, institutionalAuthority: 0.15, givingHistory: 0.15, relationshipAccess: 0.30, affinityTimeline: 0.30 },
  unknown: DEFAULT_WEIGHTS,
};

// ---------------------------------------------------------------------------
// Affinity keywords that indicate alignment with Pursuit's mission
// ---------------------------------------------------------------------------
const AFFINITY_KEYWORDS = [
  'workforce', 'workforce-dev', 'workforce development',
  'job training', 'job-training', 'jobs',
  'coding', 'bootcamp', 'coding bootcamp',
  'tech education', 'tech-education', 'technology education',
  'ai', 'artificial intelligence', 'machine learning',
  'education', 'higher education', 'adult education',
  'apprenticeship', 'apprenticeships',
  'economic mobility', 'economic-mobility',
  'social mobility', 'upskilling', 'reskilling',
  'stem', 'computer science',
];

// ---------------------------------------------------------------------------
// Wealth tier → numeric score mapping
// ---------------------------------------------------------------------------
const WEALTH_TIER_SCORES: Record<WealthTier, number> = {
  'tier-1': 100,
  'tier-2': 75,
  'tier-3': 50,
  'tier-4': 25,
  'unknown': 10,
};

// ---------------------------------------------------------------------------
// Title seniority → score (keyword matching)
// ---------------------------------------------------------------------------
const TITLE_SENIORITY: Array<{ keywords: string[]; score: number }> = [
  { keywords: ['ceo', 'chief executive', 'president', 'chairman', 'chairwoman', 'chairperson', 'executive director'], score: 100 },
  { keywords: ['cfo', 'coo', 'cto', 'cio', 'chief', 'c-suite'], score: 95 },
  { keywords: ['svp', 'senior vice president', 'evp', 'executive vice president'], score: 80 },
  { keywords: ['vp', 'vice president'], score: 65 },
  { keywords: ['director', 'managing director', 'general manager'], score: 50 },
  { keywords: ['board member', 'trustee', 'board of directors'], score: 60 },
  { keywords: ['senator', 'representative', 'congress', 'mayor', 'governor', 'council member', 'councilmember'], score: 85 },
  { keywords: ['manager', 'head of', 'lead'], score: 30 },
  { keywords: ['program officer', 'grants officer', 'grants manager'], score: 55 },
];

// ---------------------------------------------------------------------------
// Sub-score computation helpers
// ---------------------------------------------------------------------------

function clamp(value: number, min = 0, max = 100): number {
  return Math.max(min, Math.min(max, value));
}

/** Log-scale normalization for dollar amounts. Maps $0 → 0, $10M+ → 100. */
function logScale(value: number | undefined, maxRef = 10_000_000): number {
  if (!value || value <= 0) return 0;
  return clamp(Math.log10(1 + value) / Math.log10(1 + maxRef) * 100);
}

function scoreDirectWealth(lead: Lead): number {
  const scores: number[] = [];

  if (lead.net_worth_estimate != null) {
    scores.push(logScale(lead.net_worth_estimate, 100_000_000)); // $100M reference
  }
  if (lead.annual_giving_history != null) {
    scores.push(logScale(lead.annual_giving_history, 5_000_000));
  }
  if (lead.asset_holdings != null) {
    scores.push(logScale(lead.asset_holdings, 50_000_000));
  }
  if (lead.wealth_tier) {
    scores.push(WEALTH_TIER_SCORES[lead.wealth_tier] || 10);
  }
  // Use 990 enrichment data if available
  if (lead.total_990_assets != null) {
    scores.push(logScale(lead.total_990_assets, 1_000_000_000)); // $1B for large foundations
  }

  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreTitleSeniority(title: string | undefined): number {
  if (!title) return 0;
  const lower = title.toLowerCase();
  for (const entry of TITLE_SENIORITY) {
    if (entry.keywords.some((kw) => lower.includes(kw))) {
      return entry.score;
    }
  }
  return 10; // Has a title but no match
}

function scoreInstitutionalAuthority(lead: Lead): number {
  const scores: number[] = [];

  // Role-based score
  if (lead.institutional_role) {
    scores.push(scoreTitleSeniority(lead.institutional_role));
  } else if (lead.title) {
    scores.push(scoreTitleSeniority(lead.title));
  }

  // Institution budget
  const budget = lead.institution_annual_budget || lead.total_990_assets;
  if (budget != null) {
    scores.push(logScale(budget, 1_000_000_000));
  }

  // Discretionary budget (government officials)
  if (lead.discretionary_budget != null) {
    scores.push(logScale(lead.discretionary_budget, 100_000_000));
  }

  // Board memberships count
  if (lead.board_memberships) {
    const boardCount = lead.board_memberships.split(',').filter(Boolean).length;
    scores.push(clamp(boardCount * 20)); // 5+ boards = 100
  }

  // Prospect type bonus
  if (lead.prospect_type === 'institutional_grantmaker' || lead.prospect_type === 'elected_official') {
    scores.push(80);
  } else if (lead.prospect_type === 'board_member') {
    scores.push(60);
  }

  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreGivingHistory(lead: Lead): number {
  const scores: number[] = [];

  if (lead.avg_comparable_grant != null) {
    scores.push(logScale(lead.avg_comparable_grant, 2_000_000));
  }
  if (lead.estimated_capacity != null) {
    scores.push(logScale(lead.estimated_capacity, 5_000_000));
  }
  if (lead.annual_giving_history != null) {
    scores.push(logScale(lead.annual_giving_history, 5_000_000));
  }
  // 990 enrichment: comparable grants to similar orgs
  if (lead.comparable_grants_to_similar_orgs != null) {
    scores.push(logScale(lead.comparable_grants_to_similar_orgs, 2_000_000));
  }
  if (lead.total_990_grants_paid != null) {
    scores.push(logScale(lead.total_990_grants_paid, 50_000_000));
  }

  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreRelationshipAccess(lead: Lead): number {
  const scores: number[] = [];

  // Degrees of separation (1 = best)
  if (lead.degrees_of_separation != null) {
    const degreeScore = lead.degrees_of_separation <= 1 ? 100
      : lead.degrees_of_separation <= 2 ? 70
      : lead.degrees_of_separation <= 3 ? 40
      : 15;
    scores.push(degreeScore);
  }

  // Direct relationship strength (1-5 scale → 0-100)
  if (lead.relationship_strength != null) {
    scores.push(clamp(lead.relationship_strength * 20));
  }

  // Connection recency
  if (lead.connection_date) {
    const daysSince = (Date.now() - new Date(lead.connection_date).getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince < 365) scores.push(100);
    else if (daysSince < 365 * 3) scores.push(70);
    else if (daysSince < 365 * 5) scores.push(40);
    else scores.push(20);
  }

  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

function scoreAffinityTimeline(lead: Lead): number {
  const scores: number[] = [];

  // Affinity tag overlap
  if (lead.affinity_tags && lead.affinity_tags.length > 0) {
    const tags = lead.affinity_tags.map((t) => t.toLowerCase());
    const matchCount = tags.filter((t) =>
      AFFINITY_KEYWORDS.some((kw) => t.includes(kw) || kw.includes(t))
    ).length;
    const ratio = matchCount / Math.max(tags.length, 1);
    scores.push(clamp(ratio * 100));
  }

  // Timeline fit
  if (lead.timeline_fit) {
    const timelineScores: Record<string, number> = {
      'immediate': 100,
      '6mo': 85,
      '12mo': 65,
      '18mo': 45,
      'long_term': 20,
    };
    scores.push(timelineScores[lead.timeline_fit] || 20);
  }

  if (scores.length === 0) return 0;
  return scores.reduce((a, b) => a + b, 0) / scores.length;
}

// ---------------------------------------------------------------------------
// Prospect type inference from title, org, role
// ---------------------------------------------------------------------------
export function inferProspectType(lead: Lead): ProspectType {
  if (lead.prospect_type && lead.prospect_type !== 'unknown') {
    return lead.prospect_type;
  }

  const title = (lead.title || '').toLowerCase();
  const org = (lead.organization || '').toLowerCase();
  const role = (lead.institutional_role || '').toLowerCase();
  const office = (lead.government_office || '').toLowerCase();
  const combined = `${title} ${org} ${role} ${office}`;

  // Elected officials
  if (/senator|representative|congress|mayor|governor|council\s?member|assembly|legislat|commissioner|comptroller|attorney general|secretary of state/.test(combined)) {
    return 'elected_official';
  }

  // Government office explicitly set
  if (lead.government_office) {
    return 'elected_official';
  }

  // Institutional grantmaker
  if (/foundation|trust|fund|endowment|philanthropi|grantmak|charitable/.test(org) ||
      /program officer|grants officer|grants manager|grants director/.test(combined)) {
    return 'institutional_grantmaker';
  }

  // Board member
  if (/board\s?(member|chair|director)|trustee/.test(combined) && !org.includes('foundation')) {
    return 'board_member';
  }

  // HNWI
  if (lead.wealth_tier === 'tier-1' || lead.wealth_tier === 'tier-2' ||
      (lead.net_worth_estimate != null && lead.net_worth_estimate >= 1_000_000)) {
    return 'hnwi';
  }

  // Connector: strong relationship but no wealth indicators
  if (lead.relationship_strength != null && lead.relationship_strength >= 4 &&
      !lead.net_worth_estimate && !lead.wealth_tier) {
    return 'connector';
  }

  return 'unknown';
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getWeightsForType(prospectType: ProspectType): WeightProfile {
  return PROSPECT_TYPE_WEIGHTS[prospectType] || DEFAULT_WEIGHTS;
}

export function computeSubScores(lead: Lead): SubScoreBreakdown {
  const type = inferProspectType(lead);
  const weights = getWeightsForType(type);

  const directWealth = scoreDirectWealth(lead);
  const institutionalAuthority = scoreInstitutionalAuthority(lead);
  const givingHistory = scoreGivingHistory(lead);
  const relationshipAccess = scoreRelationshipAccess(lead);
  const affinityTimeline = scoreAffinityTimeline(lead);

  const composite = clamp(
    directWealth * weights.directWealth +
    institutionalAuthority * weights.institutionalAuthority +
    givingHistory * weights.givingHistory +
    relationshipAccess * weights.relationshipAccess +
    affinityTimeline * weights.affinityTimeline
  );

  return {
    directWealth: Math.round(directWealth),
    institutionalAuthority: Math.round(institutionalAuthority),
    givingHistory: Math.round(givingHistory),
    relationshipAccess: Math.round(relationshipAccess),
    affinityTimeline: Math.round(affinityTimeline),
    weights,
    composite: Math.round(composite),
  };
}

export function computeCapacityScore(lead: Lead): number {
  return computeSubScores(lead).composite;
}

export function batchScore(leads: Lead[]): Lead[] {
  const now = new Date().toISOString();
  return leads.map((lead) => {
    const type = lead.prospect_type || inferProspectType(lead);
    const score = computeCapacityScore({ ...lead, prospect_type: type });
    return {
      ...lead,
      prospect_type: type,
      capacity_score: score,
      capacity_computed_at: now,
    };
  });
}
