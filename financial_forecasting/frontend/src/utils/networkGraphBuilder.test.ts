import { buildGraphData } from './networkGraphBuilder';
import type { LinkedInContact } from '../types/networkGraph';
import type { Lead } from '../types/weeklyPriorities';

// ---------------------------------------------------------------------------
// Fixture factories — minimal valid shapes for each entity type.
// These document the implicit contracts that buildGraphData relies on.
// ---------------------------------------------------------------------------
function makeAccount(overrides: Record<string, any> = {}) {
  return { Id: 'ACC001', Name: 'Acme Foundation', ...overrides };
}

function makeOpportunity(overrides: Record<string, any> = {}) {
  return {
    Id: 'OPP001',
    Name: 'Spring Grant 2026',
    AccountId: 'ACC001',
    Amount: 50000,
    ...overrides,
  };
}

function makeSfContact(overrides: Record<string, any> = {}) {
  return {
    Id: 'CON001',
    FirstName: 'Alice',
    LastName: 'Smith',
    AccountId: 'ACC001',
    ...overrides,
  };
}

function makeLead(overrides: Partial<Lead> = {}): Lead {
  return {
    id: 'lead-1',
    first_name: 'Bob',
    last_name: 'Jones',
    source: 'test',
    status: 'new',
    priority: 'medium',
    created_at: '2026-03-01T00:00:00Z',
    updated_at: '2026-03-01T00:00:00Z',
    ...overrides,
  };
}

function makeLinkedInContact(overrides: Partial<LinkedInContact> = {}): LinkedInContact {
  return {
    id: 'li-1',
    first_name: 'Carol',
    last_name: 'Lee',
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// Empty inputs
// ---------------------------------------------------------------------------
describe('buildGraphData', () => {
  it('returns empty nodes and links when all inputs are empty', () => {
    const { nodes, links } = buildGraphData([], [], [], [], []);
    expect(nodes).toEqual([]);
    expect(links).toEqual([]);
  });

  // ── Node creation ──────────────────────────────────────────────────────
  describe('node creation', () => {
    it('creates account nodes with "acct-" prefix', () => {
      const { nodes } = buildGraphData([], [makeAccount()], [], [], []);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('acct-ACC001');
      expect(nodes[0].type).toBe('account');
      expect(nodes[0].label).toBe('Acme Foundation');
    });

    it('creates opportunity nodes with "opp-" prefix', () => {
      const { nodes } = buildGraphData([], [], [makeOpportunity()], [], []);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('opp-OPP001');
      expect(nodes[0].type).toBe('opportunity');
    });

    it('creates SF contact nodes with "contact-" prefix', () => {
      const { nodes } = buildGraphData([makeSfContact()], [], [], [], []);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('contact-CON001');
      expect(nodes[0].type).toBe('contact');
      expect(nodes[0].label).toBe('Alice Smith');
    });

    it('creates lead nodes with "lead-" prefix', () => {
      const { nodes } = buildGraphData([], [], [], [makeLead()], []);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('lead-lead-1');
      expect(nodes[0].type).toBe('lead');
    });

    it('creates LinkedIn nodes with "li-" prefix when no SF match', () => {
      const { nodes } = buildGraphData([], [], [], [], [makeLinkedInContact()]);
      expect(nodes).toHaveLength(1);
      expect(nodes[0].id).toBe('li-li-1');
      expect(nodes[0].type).toBe('linkedin');
    });
  });

  // ── Link creation ─────────────────────────────────────────────────────
  describe('link creation', () => {
    it('links opportunities to their accounts', () => {
      const acct = makeAccount();
      const opp = makeOpportunity({ AccountId: 'ACC001' });
      const { links } = buildGraphData([], [acct], [opp], [], []);

      expect(links).toContainEqual({
        source: 'opp-OPP001',
        target: 'acct-ACC001',
        type: 'account_opportunity',
      });
    });

    it('links SF contacts to their accounts', () => {
      const acct = makeAccount();
      const contact = makeSfContact({ AccountId: 'ACC001' });
      const { links } = buildGraphData([contact], [acct], [], [], []);

      expect(links).toContainEqual({
        source: 'contact-CON001',
        target: 'acct-ACC001',
        type: 'employment',
      });
    });

    it('links leads to their grant (opportunity)', () => {
      const opp = makeOpportunity({ Id: 'OPP001' });
      const lead = makeLead({ grant_id: 'OPP001' });
      const { links } = buildGraphData([], [], [opp], [lead], []);

      expect(links).toContainEqual({
        source: 'lead-lead-1',
        target: 'opp-OPP001',
        type: 'grant_link',
      });
    });

    it('links leads to accounts by organization name match', () => {
      const acct = makeAccount({ Id: 'ACC001', Name: 'Acme Foundation' });
      const lead = makeLead({ organization: 'Acme Foundation' });
      const { links } = buildGraphData([], [acct], [], [lead], []);

      expect(links).toContainEqual({
        source: 'lead-lead-1',
        target: 'acct-ACC001',
        type: 'employment',
      });
    });

    it('does not create links when referenced entity is missing', () => {
      // Opportunity references account that doesn't exist
      const opp = makeOpportunity({ AccountId: 'MISSING' });
      const { links } = buildGraphData([], [], [opp], [], []);

      const accountLinks = links.filter((l) => l.type === 'account_opportunity');
      expect(accountLinks).toHaveLength(0);
    });
  });

  // ── LinkedIn ↔ SF merge ────────────────────────────────────────────────
  describe('LinkedIn–Salesforce merge', () => {
    it('merges LinkedIn contact into matching SF contact by name', () => {
      const sfContact = makeSfContact({ FirstName: 'Alice', LastName: 'Smith' });
      const liContact = makeLinkedInContact({
        first_name: 'Alice',
        last_name: 'Smith',
        email: 'alice@linkedin.com',
      });

      const { nodes } = buildGraphData([sfContact], [], [], [], [liContact]);

      // Should NOT create a separate LinkedIn node
      const liNodes = nodes.filter((n) => n.type === 'linkedin');
      expect(liNodes).toHaveLength(0);

      // Should attach LinkedIn data to the SF contact node
      const sfNode = nodes.find((n) => n.id === 'contact-CON001');
      expect(sfNode?.meta.linkedin).toBeDefined();
      expect(sfNode?.meta.linkedin.email).toBe('alice@linkedin.com');
    });

    it('name matching is case-insensitive', () => {
      const sfContact = makeSfContact({ FirstName: 'ALICE', LastName: 'SMITH' });
      const liContact = makeLinkedInContact({ first_name: 'alice', last_name: 'smith' });

      const { nodes } = buildGraphData([sfContact], [], [], [], [liContact]);

      const liNodes = nodes.filter((n) => n.type === 'linkedin');
      expect(liNodes).toHaveLength(0); // merged, not duplicated
    });

    it('creates separate node when names do not match', () => {
      const sfContact = makeSfContact({ FirstName: 'Alice', LastName: 'Smith' });
      const liContact = makeLinkedInContact({ first_name: 'Carol', last_name: 'Lee' });

      const { nodes } = buildGraphData([sfContact], [], [], [], [liContact]);

      expect(nodes.filter((n) => n.type === 'contact')).toHaveLength(1);
      expect(nodes.filter((n) => n.type === 'linkedin')).toHaveLength(1);
    });
  });

  // ── Self-link removal ─────────────────────────────────────────────────
  describe('self-link removal', () => {
    it('removes self-links from the output', () => {
      // When a LinkedIn contact merges with an SF contact, a self-link
      // (source === target) is initially created; it should be filtered out.
      const sfContact = makeSfContact({ FirstName: 'Alice', LastName: 'Smith' });
      const liContact = makeLinkedInContact({ first_name: 'Alice', last_name: 'Smith' });

      const { links } = buildGraphData([sfContact], [], [], [], [liContact]);
      const selfLinks = links.filter((l) => l.source === l.target);
      expect(selfLinks).toHaveLength(0);
    });
  });

  // ── Node sizing ───────────────────────────────────────────────────────
  describe('node sizing', () => {
    it('scales account node size by associated opportunity amounts', () => {
      const acct = makeAccount();
      const bigOpp = makeOpportunity({ Amount: 1000000 });
      const { nodes: bigNodes } = buildGraphData([], [acct], [bigOpp], [], []);

      const acctNoOpp = makeAccount({ Id: 'ACC002', Name: 'Small Org' });
      const { nodes: smallNodes } = buildGraphData([], [acctNoOpp], [], [], []);

      const bigVal = bigNodes.find((n) => n.id === 'acct-ACC001')!.val;
      const smallVal = smallNodes.find((n) => n.id === 'acct-ACC002')!.val;

      expect(bigVal).toBeGreaterThan(smallVal);
    });

    it('gives high-priority leads a larger node than medium-priority', () => {
      const highLead = makeLead({ id: 'lead-hi', priority: 'high' });
      const medLead = makeLead({ id: 'lead-med', priority: 'medium' });

      const { nodes } = buildGraphData([], [], [], [highLead, medLead], []);

      const hiVal = nodes.find((n) => n.id === 'lead-lead-hi')!.val;
      const medVal = nodes.find((n) => n.id === 'lead-lead-med')!.val;
      expect(hiVal).toBeGreaterThan(medVal);
    });
  });

  // ── Missing / malformed fields ────────────────────────────────────────
  describe('missing fields', () => {
    it('labels accounts "Unknown Account" when Name is missing', () => {
      const { nodes } = buildGraphData([], [{ Id: 'X', Name: undefined }], [], [], []);
      expect(nodes[0].label).toBe('Unknown Account');
    });

    it('labels contacts "Unknown Contact" when both names are missing', () => {
      const { nodes } = buildGraphData(
        [{ Id: 'X', FirstName: undefined, LastName: undefined }],
        [],
        [],
        [],
        []
      );
      expect(nodes[0].label).toBe('Unknown Contact');
    });

    it('handles opportunities with zero amount', () => {
      const opp = makeOpportunity({ Amount: 0 });
      const { nodes } = buildGraphData([], [], [opp], [], []);
      expect(nodes[0].val).toBeGreaterThanOrEqual(2); // minimum val enforced
    });
  });
});
