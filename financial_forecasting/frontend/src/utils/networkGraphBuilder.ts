import type { GraphNode, GraphLink, LinkedInContact } from '../types/networkGraph';
import type { Lead } from '../types/weeklyPriorities';

const COLORS = {
  account: '#1976d2',
  contact: '#4caf50',
  opportunity: '#ff9800',
  lead: '#9c27b0',
  linkedin: '#607d8b',
};

function nameKey(first: string, last: string): string {
  return `${(first || '').toLowerCase().trim()}|${(last || '').toLowerCase().trim()}`;
}

export function buildGraphData(
  sfContacts: any[],
  accounts: any[],
  opportunities: any[],
  leads: Lead[],
  linkedInContacts: LinkedInContact[]
): { nodes: GraphNode[]; links: GraphLink[] } {
  const nodes: GraphNode[] = [];
  const links: GraphLink[] = [];
  const nodeIds = new Set<string>();

  // Accounts
  const accountAmounts = new Map<string, number>();
  for (const opp of opportunities) {
    if (opp.AccountId) {
      accountAmounts.set(
        opp.AccountId,
        (accountAmounts.get(opp.AccountId) || 0) + (opp.Amount || 0)
      );
    }
  }

  for (const acct of accounts) {
    const id = `acct-${acct.Id}`;
    const total = accountAmounts.get(acct.Id) || 1;
    nodes.push({
      id,
      label: acct.Name || 'Unknown Account',
      type: 'account',
      val: Math.max(2, Math.log10(total + 1) * 3),
      color: COLORS.account,
      meta: { ...acct },
    });
    nodeIds.add(id);
  }

  // Opportunities
  for (const opp of opportunities) {
    const id = `opp-${opp.Id}`;
    nodes.push({
      id,
      label: opp.Name || 'Unknown Opportunity',
      type: 'opportunity',
      val: Math.max(2, Math.log10((opp.Amount || 1) + 1) * 2),
      color: COLORS.opportunity,
      meta: { ...opp },
    });
    nodeIds.add(id);

    if (opp.AccountId && nodeIds.has(`acct-${opp.AccountId}`)) {
      links.push({ source: id, target: `acct-${opp.AccountId}`, type: 'account_opportunity' });
    }
  }

  // SF Contacts
  const sfContactNameKeys = new Map<string, string>(); // nameKey -> node id
  for (const c of sfContacts) {
    const id = `contact-${c.Id}`;
    nodes.push({
      id,
      label: `${c.FirstName || ''} ${c.LastName || ''}`.trim() || 'Unknown Contact',
      type: 'contact',
      val: 3,
      color: COLORS.contact,
      meta: { ...c },
    });
    nodeIds.add(id);
    sfContactNameKeys.set(nameKey(c.FirstName || '', c.LastName || ''), id);

    if (c.AccountId && nodeIds.has(`acct-${c.AccountId}`)) {
      links.push({ source: id, target: `acct-${c.AccountId}`, type: 'employment' });
    }
  }

  // Leads
  const accountNameToId = new Map<string, string>();
  for (const acct of accounts) {
    accountNameToId.set((acct.Name || '').toLowerCase().trim(), `acct-${acct.Id}`);
  }

  for (const lead of leads) {
    const id = `lead-${lead.id}`;
    nodes.push({
      id,
      label: `${lead.first_name} ${lead.last_name}`.trim(),
      type: 'lead',
      val: lead.priority === 'high' ? 3 : 2,
      color: COLORS.lead,
      meta: { ...lead },
    });
    nodeIds.add(id);

    if (lead.grant_id && nodeIds.has(`opp-${lead.grant_id}`)) {
      links.push({ source: id, target: `opp-${lead.grant_id}`, type: 'grant_link' });
    }

    if (lead.organization) {
      const acctId = accountNameToId.get(lead.organization.toLowerCase().trim());
      if (acctId) {
        links.push({ source: id, target: acctId, type: 'employment' });
      }
    }
  }

  // LinkedIn contacts — merge with SF contacts where names match
  for (const li of linkedInContacts) {
    const nk = nameKey(li.first_name, li.last_name);
    const matchedSfId = sfContactNameKeys.get(nk);

    if (matchedSfId) {
      // Merge: add linkedin metadata to existing SF contact node
      const sfNode = nodes.find((n) => n.id === matchedSfId);
      if (sfNode) {
        sfNode.meta.linkedin = li;
      }
      links.push({ source: matchedSfId, target: matchedSfId, type: 'linkedin_connection' });
    } else {
      const id = `li-${li.id}`;
      nodes.push({
        id,
        label: `${li.first_name} ${li.last_name}`.trim(),
        type: 'linkedin',
        val: 1,
        color: COLORS.linkedin,
        meta: { ...li },
      });
      nodeIds.add(id);
    }
  }

  // Remove self-links
  const cleanLinks = links.filter((l) => l.source !== l.target);

  return { nodes, links: cleanLinks };
}
