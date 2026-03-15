# Week 2: Pipeline CRM, Dashboard & Network Map

**Status:** Shipped
**Dates:** 2026-03-10 → 2026-03-14

---

## What we built

### Leads as a Pipeline tab
- New **Leads** tab in Pipeline page alongside Opportunities, Accounts, Contacts
- MUI DataGrid with inline editing, sorting, filtering, pagination
- CSV import (PapaParse) and export
- Leads persist in localStorage via `LeadsContext`
- Deduplication on first_name + last_name + source
- Link leads to Salesforce opportunities via `grant_id` dropdown
- Status (new/contacted/qualified/unqualified/converted) and priority (high/medium/low) with chip rendering
- Bulk select and delete

### Lead enrichment (prospect sizing)
- Extended Lead type with fundraising-specific fields: `estimated_capacity`, `avg_comparable_grant`, `estimated_ask`, `likelihood` (0-100), `wealth_tier` (tier-1 through tier-4 / unknown)
- All optional — backward compatible with existing leads
- Editable columns in the DataGrid with currency formatting and wealth tier dropdown
- CSV parser updated with aliases (`capacity`, `giving_capacity`, `avg_grant`, `probability`, etc.)

### My Dashboard (Home page)
- New `/home` route, set as default redirect from `/`
- Sections: action items, calendar/upcoming, pipeline summary, recent accounts, activity feed
- Data from Salesforce opportunities + accounts via react-query

### Network Mapping page
- Force-directed graph visualization using `react-force-graph-2d` (canvas-based, ~150KB)
- **Data sources:** SF Contacts, Accounts, Opportunities, localStorage Leads, LinkedIn CSV import
- **Node types:** Account (blue), Contact (green), Opportunity (amber), Lead (purple), LinkedIn (grey)
- **Links:** derived from foreign keys (AccountId, grant_id, name matching)
- **LinkedIn dedup:** LinkedIn contacts matching SF Contacts by name are merged into the SF node
- Three-panel layout: filter sidebar (type toggles, search, amount slider, unlinked toggle) + graph canvas + detail panel on click
- "Add to Leads" action for LinkedIn nodes
- LinkedIn contacts persist in localStorage

### Navigation & branding
- Rebranded from "Revenue Hub" to **Bedrock** with HolidayVillage icon
- Pipeline tab icons: MonetizationOn for Opportunities, PersonSearch for Leads
- Network page added to sidebar with Timeline icon
- Home page at top of navigation

---

## Acceptance criteria

- [x] Leads tab: import CSV → leads appear in DataGrid → inline edit status → persists on refresh
- [x] Lead enrichment: capacity/ask/likelihood/wealth_tier columns visible and editable
- [x] Dashboard: `/home` renders with pipeline summary and upcoming items
- [x] Network Map: `/network` renders graph → upload LinkedIn CSV → nodes appear → click shows detail → "Add to Leads" works
- [x] Sidebar shows "Bedrock" with icon; collapsed shows icon only
- [x] Browser tab title reads "Bedrock"
- [x] Pipeline tabs: Opportunities has MonetizationOn, Leads has PersonSearch
- [x] No secrets or CSV data committed to git

---

## Data model changes

### Lead (extended)
```typescript
// Added to existing Lead interface in types/weeklyPriorities.ts
estimated_capacity?: number;      // giving capacity in USD
avg_comparable_grant?: number;    // average grant from similar grantees
estimated_ask?: number;           // planned ask amount
likelihood?: number;              // 0-100 probability
linkedin_url?: string;
connection_date?: string;
wealth_tier?: 'tier-1' | 'tier-2' | 'tier-3' | 'tier-4' | 'unknown';
tags?: string[];
```

### Network graph types (new)
```typescript
// types/networkGraph.ts
GraphNode { id, label, type, val, color, meta }
GraphLink { source, target, type }
LinkedInContact { id, first_name, last_name, email?, organization?, title?, connection_date? }
```

---

## Stack decisions

- **Stayed in React + MUI** (CRA) — consistent with Week 1, reuses existing Salesforce integration
- **react-force-graph-2d** for network visualization — canvas-based, handles 2000+ nodes, MIT license, native React API
- **localStorage** for Leads and LinkedIn contacts — no backend required for prototype
- **PapaParse** for both lead and LinkedIn CSV parsing

---

## Deferred to later

- Server-side persistence for leads (PostgreSQL when merging into unified platform)
- LinkedIn API integration (currently CSV-only)
- Advanced graph analytics (centrality, clustering, shortest path)
- Wealth/capacity data from external providers
- Network map: drag-to-group, saved layouts, annotations
- Slack-driven data entry and review (separate phase)
