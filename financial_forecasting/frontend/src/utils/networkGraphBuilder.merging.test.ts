/**
 * Tier 16-20: Prospect matching & dedup tests for the network graph builder.
 *
 * Tests the LinkedIn↔Salesforce contact merge logic, lead↔account employment
 * wiring, and graph structural invariants that make the network map insightful
 * (meaningful connections, not just visual noise).
 */
import { buildGraphData } from './networkGraphBuilder';
import type { Lead } from '../types/weeklyPriorities';
import type { LinkedInContact } from '../types/networkGraph';

// ---------------------------------------------------------------------------
// Factories
// ---------------------------------------------------------------------------
function makeSfContact(overrides: Record<string, any> = {}) {
  return {
    Id: 'CON001',
    FirstName: 'Alice',
    LastName: 'Smith',
    AccountId: null,
    Email: 'alice@example.com',
    ...overrides,
  };
}

function makeAccount(overrides: Record<string, any> = {}) {
  return {
    Id: 'ACC001',
    Name: 'Pursuit Foundation',
    ...overrides,
  };
}

function makeOpportunity(overrides: Record<string, any> = {}) {
  return {
    Id: 'OPP001',
    Name: 'Spring Grant',
    AccountId: 'ACC001',
    Amount: 50000,
    StageName: 'Collecting / In Effect',
    ...overrides,
  };
}

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-1',
    first_name: 'Bob',
    last_name: 'Jones',
    source: 'test.csv',
    status: 'new',
    priority: 'medium',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

function makeLinkedIn(overrides: Partial<LinkedInContact> = {}): LinkedInContact {
  return {
    id: 'li-1',
    first_name: 'Alice',
    last_name: 'Smith',
    organization: 'Pursuit Foundation',
    title: 'Director',
    connection_date: '2026-01-15',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// LinkedIn↔Salesforce merge
// ---------------------------------------------------------------------------
describe('LinkedIn↔SF contact merge', () => {
  it('merges LinkedIn contact with matching SF contact by name (case-insensitive)', () => {
    const sfContacts = [makeSfContact({ FirstName: 'Alice', LastName: 'Smith' })];
    const liContacts = [makeLinkedIn({ first_name: 'alice', last_name: 'smith' })];

    const { nodes } = buildGraphData(sfContacts, [], [], [], liContacts);

    // Should NOT create a separate LinkedIn node
    const liNodes = nodes.filter((n) => n.type === 'linkedin');
    expect(liNodes).toHaveLength(0);

    // SF contact node should have linkedin metadata merged
    const sfNode = nodes.find((n) => n.type === 'contact');
    expect(sfNode?.meta.linkedin).toBeDefined();
    expect(sfNode?.meta.linkedin.organization).toBe('Pursuit Foundation');
  });

  it('creates separate LinkedIn node when no SF match exists', () => {
    const liContacts = [makeLinkedIn({ first_name: 'Carl', last_name: 'Lee' })];

    const { nodes } = buildGraphData([], [], [], [], liContacts);

    const liNodes = nodes.filter((n) => n.type === 'linkedin');
    expect(liNodes).toHaveLength(1);
    expect(liNodes[0].label).toBe('Carl Lee');
  });

  it('handles multiple LinkedIn contacts with some matching SF', () => {
    const sfContacts = [makeSfContact({ Id: 'CON001', FirstName: 'Alice', LastName: 'Smith' })];
    const liContacts = [
      makeLinkedIn({ id: 'li-1', first_name: 'Alice', last_name: 'Smith' }),
      makeLinkedIn({ id: 'li-2', first_name: 'New', last_name: 'Person' }),
    ];

    const { nodes } = buildGraphData(sfContacts, [], [], [], liContacts);

    const contactNodes = nodes.filter((n) => n.type === 'contact');
    const liNodes = nodes.filter((n) => n.type === 'linkedin');
    expect(contactNodes).toHaveLength(1); // Alice merged
    expect(liNodes).toHaveLength(1); // New Person standalone
  });
});

// ---------------------------------------------------------------------------
// Self-link removal
// ---------------------------------------------------------------------------
describe('self-link removal', () => {
  it('removes self-referencing links from merged LinkedIn contacts', () => {
    const sfContacts = [makeSfContact({ FirstName: 'Alice', LastName: 'Smith' })];
    const liContacts = [makeLinkedIn({ first_name: 'Alice', last_name: 'Smith' })];

    const { links } = buildGraphData(sfContacts, [], [], [], liContacts);

    // The merge creates a self-link (source === target) which should be filtered
    const selfLinks = links.filter((l) => l.source === l.target);
    expect(selfLinks).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Lead↔Account employment wiring
// ---------------------------------------------------------------------------
describe('lead↔account employment links', () => {
  it('links lead to account when organization matches account name', () => {
    const accounts = [makeAccount({ Id: 'ACC001', Name: 'Pursuit Foundation' })];
    const leads = [makeLead({ organization: 'Pursuit Foundation' })];

    const { links } = buildGraphData([], accounts, [], leads, []);

    const employmentLinks = links.filter((l) => l.type === 'employment');
    expect(employmentLinks).toHaveLength(1);
    expect(employmentLinks[0].source).toBe('lead-lead-1');
    expect(employmentLinks[0].target).toBe('acct-ACC001');
  });

  it('matches organization name case-insensitively', () => {
    const accounts = [makeAccount({ Name: 'pursuit foundation' })];
    const leads = [makeLead({ organization: 'PURSUIT FOUNDATION' })];

    const { links } = buildGraphData([], accounts, [], leads, []);

    expect(links.filter((l) => l.type === 'employment')).toHaveLength(1);
  });

  it('does not link when organization does not match any account', () => {
    const accounts = [makeAccount({ Name: 'Pursuit Foundation' })];
    const leads = [makeLead({ organization: 'Unknown Org' })];

    const { links } = buildGraphData([], accounts, [], leads, []);

    expect(links.filter((l) => l.type === 'employment')).toHaveLength(0);
  });

  it('does not link when lead has no organization', () => {
    const accounts = [makeAccount()];
    const leads = [makeLead({ organization: undefined })];

    const { links } = buildGraphData([], accounts, [], leads, []);

    expect(links.filter((l) => l.type === 'employment')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Lead↔Grant wiring
// ---------------------------------------------------------------------------
describe('lead↔grant links', () => {
  it('links lead to opportunity when grant_id matches', () => {
    const opps = [makeOpportunity({ Id: 'OPP001', AccountId: null })];
    const leads = [makeLead({ grant_id: 'OPP001' })];

    const { links } = buildGraphData([], [], opps, leads, []);

    const grantLinks = links.filter((l) => l.type === 'grant_link');
    expect(grantLinks).toHaveLength(1);
    expect(grantLinks[0].target).toBe('opp-OPP001');
  });

  it('does not link when grant_id has no matching opportunity', () => {
    const opps = [makeOpportunity({ Id: 'OPP001' })];
    const leads = [makeLead({ grant_id: 'OPP999' })];

    const { links } = buildGraphData([], [], opps, leads, []);

    expect(links.filter((l) => l.type === 'grant_link')).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Account node sizing (opportunity-weighted)
// ---------------------------------------------------------------------------
describe('account node sizing', () => {
  it('accounts with more opportunity value get larger nodes', () => {
    const accounts = [
      makeAccount({ Id: 'ACC001', Name: 'Big Funder' }),
      makeAccount({ Id: 'ACC002', Name: 'Small Funder' }),
    ];
    const opps = [
      makeOpportunity({ Id: 'OPP001', AccountId: 'ACC001', Amount: 1000000 }),
      makeOpportunity({ Id: 'OPP002', AccountId: 'ACC002', Amount: 1000 }),
    ];

    const { nodes } = buildGraphData([], accounts, opps, [], []);

    const big = nodes.find((n) => n.id === 'acct-ACC001');
    const small = nodes.find((n) => n.id === 'acct-ACC002');
    expect(big!.val).toBeGreaterThan(small!.val);
  });

  it('accounts with no opportunities get minimum size', () => {
    const accounts = [makeAccount()];
    const { nodes } = buildGraphData([], accounts, [], [], []);
    const node = nodes.find((n) => n.type === 'account');
    expect(node!.val).toBeGreaterThanOrEqual(2); // minimum val
  });
});

// ---------------------------------------------------------------------------
// Graph structural invariants
// ---------------------------------------------------------------------------
describe('graph structural invariants', () => {
  it('all node IDs are unique', () => {
    const sfContacts = [
      makeSfContact({ Id: 'CON001' }),
      makeSfContact({ Id: 'CON002', FirstName: 'Bob', LastName: 'Jones' }),
    ];
    const accounts = [makeAccount()];
    const opps = [makeOpportunity()];
    const leads = [makeLead()];
    const liContacts = [makeLinkedIn({ id: 'li-99', first_name: 'New', last_name: 'Person' })];

    const { nodes } = buildGraphData(sfContacts, accounts, opps, leads, liContacts);

    const ids = nodes.map((n) => n.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all link targets reference existing nodes', () => {
    const accounts = [makeAccount()];
    const opps = [makeOpportunity()];
    const sfContacts = [makeSfContact({ AccountId: 'ACC001' })];
    const leads = [makeLead({ grant_id: 'OPP001', organization: 'Pursuit Foundation' })];

    const { nodes, links } = buildGraphData(sfContacts, accounts, opps, leads, []);

    const nodeIds = new Set(nodes.map((n) => n.id));
    for (const link of links) {
      expect(nodeIds.has(link.source as string)).toBe(true);
      expect(nodeIds.has(link.target as string)).toBe(true);
    }
  });

  it('returns empty graph for empty inputs', () => {
    const { nodes, links } = buildGraphData([], [], [], [], []);
    expect(nodes).toHaveLength(0);
    expect(links).toHaveLength(0);
  });
});
