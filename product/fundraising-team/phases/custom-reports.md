# Custom Reports (Prompts + Pre-Built Filters)

**Goal:** Useful reports without a full report builder. **V1:** Basic prompts + pre-built filters; optional advanced builder later. Roadmap: `product/ROADMAP-AND-STANDARDS.md`.

---

## V1: Prompts + pre-built filters

- **Prompts:** Short text or template (e.g. “Pipeline by stage this quarter,” “Payments last 30 days by account,” “Leads from network search this month”). System maps to saved report definition or parameterized query. No free-form SQL or formula builder.
- **Filters:** Chips/dropdowns: date range, stage, owner, account type, revenue stream, payment status, lead source. Combine prompt + filters → narrow result set.
- **Output:** Table or summary; CSV export. Data: Bedrock’s view of Salesforce, Sage, and local entities (one place to run reports).

---

## Later (optional)

- Advanced report builder: pick entities, fields, grouping, filters, simple logic (Salesforce-style). Not required for first release.

---

## Success criteria

- [ ] At least 3–5 report types via prompt/template (e.g. pipeline by stage, payments by period, leads by source).
- [ ] Pre-built filters narrow results correctly; table/summary + CSV export work.
- [ ] No complex join/formula builder in v1.
