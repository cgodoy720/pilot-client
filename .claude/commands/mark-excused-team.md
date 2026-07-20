---
name: mark-excused-team
description: Mark one or more builders as excused on the Pursuit platform — works for any cohort (L1, L2, L3, L3+). Use this skill whenever a facilitator needs to excuse a builder for a single day, retroactively, or for an extended date range. Triggers on phrases like "mark excused", "excuse this builder", "they were out", "retroactive excuse", "extended absence", or any attendance excuse request.
---

# Mark Builders Excused

You help Pursuit facilitators mark builders as excused on the platform for any cohort level.

## Step 1: Get a fresh token

Ask for a Bearer token before doing anything:

> "Paste your Bearer token — DevTools → Network tab → click any request to test-pilot-server.onrender.com → Request Headers → copy the Authorization value."

Tokens expire after 7 days. Never use a previously seen token.

## Step 2: Fetch active cohorts

Call:
```
GET https://test-pilot-server.onrender.com/api/admin/dashboard/program-cohorts
Authorization: Bearer {token}
```

Filter to `is_active: true` and present the list to the facilitator. Ask which cohort they're working with. Note the `cohort_id` for the chosen cohort and its `level`.

## Step 3: Get builder and absence details

Ask:
- Which builder(s)? (name is fine — you'll look them up)
- What date range? (single day, a few days, or extended — get start and end date)
- What's the reason? Options: `Sick`, `Personal`, `Program Event`, `Technical Issue`, `Other`
- Any staff notes to add? (e.g., "traveling", "work conflict", "medical")

If multiple builders share the same dates and reason, handle them together.

## Step 4: Look up builder user IDs

For each builder, search by first name:
```
GET https://test-pilot-server.onrender.com/api/admin/dashboard/builders-search?cohortId={cohort_id}&q={first_name}
Authorization: Bearer {token}
```

Confirm the full name matches before proceeding. If multiple results appear, ask the facilitator to confirm which one.

## Step 5: Determine class days

Use the cohort level to determine which days of the week to include:

- **L1**: Monday–Friday
- **L2**: Saturday–Wednesday
- **L3 / L3+**: Monday–Thursday

Generate only the relevant class days within the date range (skip non-class days).

## Step 6: Confirm before posting

Show a summary before making any API calls:

```
Builder: [Name] (user_id: X)
Cohort: [Cohort name]
Dates: [start] → [end] ([N] class days)
Reason: [reason]
Notes: [staff notes]
```

Ask: "Ready to post? Type 'go' or let me know if anything needs to change."

## Step 7: Post excuses

For each builder × each class day, call:
```
POST https://test-pilot-server.onrender.com/api/admin/excuses/mark-excused
Authorization: Bearer {token}
Content-Type: application/json

{
  "userId": {user_id},
  "absenceDate": "YYYY-MM-DD",
  "excuseReason": "{reason}",
  "staffNotes": "{notes}"
}
```

- `201` = success
- `409` = already excused (skip, don't count as error)
- `401` = token expired — stop and ask for a fresh token
- Any other error = flag it

Add a small delay (~100ms) between requests to avoid rate-limiting.

## Step 8: Report results

```
✓ Marked: X new excuses
~ Skipped: X (already excused)
✗ Errors: X
```

Flag any errors with the specific date and response so the facilitator can follow up.
