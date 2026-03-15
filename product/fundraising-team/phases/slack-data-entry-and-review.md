# Slack-Driven Data Entry & Human Verification

**Goal:** Team posts updates in Slack (messy OK); system proposes changes to Opportunity, Lead, Contact, Account, or Payment (Sage). **Nothing written to the DB until a human confirms** — required for all entities, critical for Payments. Roadmap: `product/ROADMAP-AND-STANDARDS.md`.

---

## Flow

1. **Ingest:** Designated Slack channel or DM (optional: slash command or keyword). Messages can be natural language or semi-structured.
2. **Parse & propose:** Backend (rules and/or AI) maps each message to entity type and fields → **pending change** records. Entities: Opportunity (stage, close date, amount, owner, note); Lead (status, assigned_to, note); Contact (name, email, phone, title, org); Account (name, type, note); **Payment** (amount, date, account/opp, ref). Stored in review queue only; no write to Salesforce/Sage yet.
3. **Review:** Bedrock view “Pending changes from Slack” lists: original message + timestamp, proposed entity/record, diff/summary. Actions: **Confirm** (apply), **Reject**, or **Edit** then confirm. Frequency: weekly batch or ad hoc (configurable; Payments can be reviewed sooner).
4. **Apply:** On confirm → write to Salesforce (Opp/Lead/Contact/Account) or Sage (Payment); audit log who and when.

---

## Entity coverage

| Entity      | Target system   | Verification |
|-------------|-----------------|--------------|
| Opportunity | Salesforce      | Required     |
| Lead        | Salesforce/Bedrock | Required  |
| Contact     | Salesforce      | Required     |
| Account     | Salesforce      | Required     |
| Payment     | Sage (+ SF sync where applicable) | **Required** (critical for finance) |

No auto-apply for any entity.

---

## Parsing

- **Phase 1:** Rule-based patterns + simple entity resolution (match by name/ID); tolerate messy wording.
- **Phase 2 (optional):** LLM/intent classifier for varied phrasing; output still structured proposed changes → same review UI.

---

## Security & compliance

- Ingest only from allowlisted Slack workspaces/channels/DMs. Pending changes and audit in Bedrock (or learning platform DB when merged); role-based access (e.g. fundraising + finance can confirm). Payments: verify amount, date, account before confirm; optional two-person confirm for large amounts per policy.

---

## Out of scope

- Arbitrary Slack history for “context”; auto-apply without confirm; full conversational NLP. Focus: one message → one or more proposed changes → review.

---

## Success criteria

- [ ] Post in Slack → pending changes appear in Bedrock within reasonable delay (e.g. minutes).
- [ ] Review view shows message, entity/record, diff; Confirm / Reject / Edit work.
- [ ] On confirm, changes applied to Salesforce (and Sage for Payments); audit log who and when.
- [ ] Payments always require human verification before Sage update.
- [ ] Slack ingest and parsing server-side only; no tokens in client.
