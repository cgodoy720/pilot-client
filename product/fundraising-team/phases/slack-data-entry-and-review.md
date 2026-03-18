# Slack Bot: Pipeline Updates from Conversation

**Goal:** The team updates Salesforce from Slack in 3 seconds — not by navigating to a web app. The bot parses natural language, proposes a structured change, and waits for confirmation before writing anything.

**Principles:** Elegance, fidelity, reliability, speed, efficient token use, user confirmation before every database write.

---

## How It Works

```
Team member posts in #pipeline-updates
        ↓
Bot parses → proposes change (reply in thread)
        ↓
User: Confirm / Edit / Cancel (Slack buttons)
        ↓
On Confirm → write to Salesforce → bot confirms with link
```

Confirmed updates write immediately and are logged as **auto-approved** in the Automation Review queue (see Layer 2 below). Unconfirmed proposals (24-hour timeout) flow to the queue for later review.

---

## Example

**User posts:**
> Just met with Ford Foundation — they're moving to contract, $250K, close by end of April

**Bot replies (in thread):**
> I'd update **Ford Foundation Grant** (Opp-0042):
> - Stage: Qualifying → **Contract Creation**
> - Amount: $150,000 → **$250,000**
> - Close Date: 2026-03-31 → **2026-04-30**
>
> `[Confirm]` `[Edit]` `[Cancel]`

**User clicks Confirm →** Bot writes to Salesforce, replies: "Done. [View in Salesforce →](link)"

---

## Two-Layer Parsing

### Layer 1: Rule-based (handles ~80% of messages, zero API cost)

Pattern matching for the things the team actually says:
- **Stage changes:** "moving to contract," "closed won," "withdrew," "collecting"
- **Amounts:** "$250K," "$1.2M," "two hundred fifty thousand"
- **Dates:** "end of April," "by Q2," "next Friday"
- **Account/Opportunity resolution:** Fuzzy match against cached Salesforce names (Fuse.js or similar). Pre-load accounts and opportunity names on bot startup; refresh every 15 minutes.

When the entity is ambiguous (multiple matches or zero matches), the bot asks:
> I found 2 matches for "Ford": **Ford Foundation Grant** or **Ford Motor Fund**. Which one?

### Layer 2: AI fallback (for ambiguous messages, ~$0.001 per call)

When rule-based parsing can't extract a structured change:
- Send message + context (account list, recent opps) to **Haiku**
- Prompt: "Extract entity, field changes, and confidence. If unclear, say what's unclear."
- Cost: ~500 input tokens + ~200 output tokens = **< $0.001 per message**
- At 100 messages/day: **< $3/month**

The bot always shows what it understood and asks for confirmation. AI is a parser, not a decision-maker.

---

## What the Bot Can Update

| Entity | Fields | Target System |
|--------|--------|---------------|
| Opportunity | Stage, Amount, Close Date, Probability, Owner, notes | Salesforce |
| Account | Name, Type, notes | Salesforce |
| Contact | Name, Title, Email, Phone | Salesforce |
| Payment | Amount, Date, Status | Salesforce (NPSP) |

Payments require explicit confirmation with amount and date shown clearly. No shortcuts.

---

## Trigger & Channel

- **Channel:** `#pipeline-updates` (allowlisted; configurable)
- **Trigger:** Any message in the channel, OR `@BedrockBot` mention in other channels
- **DMs:** Bot accepts DMs from allowlisted users (same parse → confirm flow)
- **Not a slash command** for v1 — natural language is the point. Slash commands feel like forms; we want the team to just talk.

---

## Confirmation Rules

1. **Every change requires explicit confirmation** via Slack button. No exceptions.
2. Bot shows the current value → proposed value diff so the user sees exactly what will change.
3. **Edit flow:** User clicks Edit → bot shows fields as a Slack modal (pre-filled) → user adjusts → confirms.
4. **Timeout:** Unconfirmed proposals expire after 24 hours. Bot reacts with a clock emoji and stops listening.
5. **Payments:** Always show amount and date prominently. Large payments (> $50K) get a second confirmation: "This is a large payment. Confirm again?"

---

## Entity Resolution

How the bot maps "Ford" to "Ford Foundation Grant":

1. **Exact match** against opportunity or account name → use it
2. **Fuzzy match** (Levenshtein / token overlap) → if one result scores > 0.8, propose it; if multiple, ask user to pick
3. **Zero matches** → ask: "I couldn't find that opportunity. Can you give me the full name?"
4. **Context helps:** If the message mentions an amount and stage that match an existing opp, boost that match
5. **Cache:** Account and opportunity names loaded from Salesforce, refreshed every 15 minutes. No API call per message for resolution.

---

## Error Handling

| Scenario | Bot Behavior |
|----------|-------------|
| Salesforce write fails | "Failed to update Salesforce (timeout/error). Your change is saved — I'll retry in 60 seconds. [Retry Now]" |
| Retry succeeds | "Update applied on retry. [View in Salesforce →]" |
| Retry fails 3 times | "Still failing after 3 attempts. Please update manually: [Salesforce link]. I've logged this for the admin." |
| Bot can't parse the message | "I couldn't figure out what to update from this. Can you rephrase? (e.g., 'Ford Foundation → contract stage, $250K, close April')" |
| User not authorized | "You're not on the approved list for pipeline updates. Ask your admin to add you." |

---

## Audit Trail

Every confirmed change is logged:
```
{ timestamp, slack_user, slack_message_id, channel,
  entity_type, salesforce_id, field_changes: { field: [old, new] },
  parse_method: "rule" | "ai", confirmed_at }
```

Stored server-side (append-only JSON or DB table). No PII in logs beyond Slack user ID and Salesforce record ID.

---

## Automation Review Queue (Layer 2)

The Slack bot is the **fast path** — one of several sources that feed the unified **Automation Review** queue in Bedrock (see `home-page-spec.md` §3.4).

**What flows into the queue:**

| Source | What it proposes | Status on arrival |
|--------|-----------------|-------------------|
| Slack bot (confirmed) | Opportunity/Contact/Account updates | **Auto-approved** (already written; available for pipeline meeting review) |
| Slack bot (unconfirmed) | Timed-out or complex proposals | **Pending** (requires human action) |
| Google Calendar | Meeting detected → Activity record + suggested tasks | **Pending** |
| Google Drive | New document in grant folder → link to Opportunity | **Pending** |
| Gmail | Email correspondence → Activity log | **Pending** |
| Fireflies | Transcript summary → next steps, stage suggestion | **Pending** |
| Knowledge Graph (future) | New connection → relationship update | **Pending** |
| Learning Platform (future) | Builder placement → funder signal | **Pending** |

**Review workflow:**
- Queue is reviewed weekly (pipeline meeting) or ad hoc
- Everything is **in-line editable** — confirm, edit fields, or dismiss without leaving the page
- Auto-approved Slack items can be skipped or spot-checked
- Pending items require explicit confirmation before any DB write
- Refresh button pulls latest from GCal, GDrive, etc. on demand

**Why both paths exist:**
- **Slack bot** = speed. 3-second updates for explicit, human-initiated changes. The team builds a single habit: post in `#pipeline-updates`.
- **Automation Review** = breadth. Surfaces intelligence from every data source the org touches. The pipeline meeting becomes a review of what the system detected, not a manual status roundup.

---

## What We Don't Build

- **No auto-apply.** Ever. Human confirmation required for every write, whether via Slack button or Automation Review.
- **No full conversational AI.** The bot parses one message into one proposed change. It doesn't maintain multi-turn context.
- **No Sage writes from Slack** for v1. Payments update Salesforce NPSP records only; Sage sync happens through the existing payment processing flow.
- **No history search.** The bot doesn't trawl old messages. It only responds to new posts.

---

## Security

1. **User allowlist:** Config-based list of authorized Slack user IDs. Bot rejects messages and confirmations from unauthorized users. Separate permissions for posting vs. confirming if needed.
2. **PII sanitization:** Before AI fallback (Haiku), strip donor names and contact details. Pass only entity type, field names, proposed values, and confidence signals.
3. **Audit trail storage:** Restricted DB table (not flat file). Include Slack `user_id`, `thread_ts`, `team_id`. 90-day rotation for PII-containing entries.
4. **Concurrent write protection:** On confirm, check Salesforce `LastModifiedDate` against the value at parse time. If the record changed since parsing, re-fetch current values and re-propose the diff.
5. **Rate limiting:** 2-second cooldown between confirmations from the same user. Idempotency key on each confirmation to prevent double-click writes.

---

## Implementation Order

1. **Slack event listener** — receive messages from `#pipeline-updates` via Slack Events API (or Socket Mode for dev)
2. **Rule-based parser** — extract stage, amount, date, entity name from message text
3. **Entity resolver** — fuzzy match against cached Salesforce names
4. **Propose in thread** — format diff, render Confirm/Edit/Cancel buttons (Slack Block Kit)
5. **Confirm handler** — on button click, write to Salesforce via existing `apiService.updateOpportunity`
6. **AI fallback** — when rule parser returns low confidence, send to Haiku for extraction
7. **Edit modal** — Slack modal with pre-filled fields for manual adjustment
8. **Retry logic** — exponential backoff on SF write failures (2s, 4s, 8s; max 3 attempts)

---

## Success Criteria

- [ ] Post in `#pipeline-updates` → bot proposes structured change in thread within 2 seconds
- [ ] Confirm button → Salesforce updated within 3 seconds; bot confirms with SF link
- [ ] Edit button → modal with pre-filled fields; confirm applies to SF
- [ ] Cancel → proposal dismissed; no write
- [ ] Ambiguous entity → bot asks clarifying question with options
- [ ] SF write failure → bot retries transparently; surfaces error after 3 failures
- [ ] Unconfirmed proposal → expires after 24 hours
- [ ] Rule-based parsing handles stage changes, amounts, and dates without AI
- [ ] AI fallback costs < $5/month at expected volume
- [ ] Audit log captures every confirmed change with before/after values
- [ ] Confirmed Slack updates appear as auto-approved items in Automation Review queue
- [ ] Unconfirmed proposals (24hr timeout) flow to Automation Review as pending items
- [ ] Unauthorized Slack user → bot rejects with message; no proposal created
