# Presenter Script — Pursuit Platform (Builder Side)

A click-by-click walkthrough for demoing the platform from the **builder** (learner) perspective. Target runtime: **10–12 minutes**. The demo cohort is auto-maintained — every day at 03:00 ET attendance / submissions / completions / feedback roll forward, and every Sunday at 02:00 ET fresh AI-generated conversations are seeded for the trailing week's tasks. You should never need to stage data manually before a demo.

---

## Pre-demo checklist (2 minutes)

1. Open `/admin/demo-cohort-refresh` in one browser tab. Confirm:
   - **Last seeded day** is today (or yesterday if before 03:00 ET).
   - The latest job is `completed` with no errors.
   - If anything looks off, click **Run catch-up** under "Advance to today" and (optionally) **Seed conversations** to top off recent threads.
2. Open a separate **incognito/private window** for the builder demo. Two windows means you can flip back to the admin tab if you need to recover, without exposing admin chrome to the audience.
3. Confirm your network is stable — the AI coach streams over SSE and a flaky connection makes it look like the product hangs.

---

## Demo account

| Field | Value |
| --- | --- |
| Login URL | `/login` |
| Email | `dave+demo@pursuit.org` |
| Password | *(see internal secret store — do not commit)* |
| User ID | `699` |
| Cohort | `bf0af959-11ec-4903-860b-f9f6243a0a44` ("Platform Demo") |

If login fails, the most likely cause is the demo password having been rotated. Recover from the admin tab via the standard password-reset flow, then update the internal secret store.

---

## The walkthrough — 7 stops

### Stop 1 — Dashboard (`/dashboard`) · 60s

**What to click**
- Land on Dashboard after login.
- Point at the **today** indicator and the **Today's Tasks** checklist.
- Click the week-navigation arrow to step back one week, then forward to today.
- Hover the **Missed assignments** sidebar.

**Talking points**
- "This is what a builder sees the moment they sign in — current week, today's work, and anything they've fallen behind on, all in one view."
- "Each task on the list links straight into the Learning page with the right task pre-opened. Builders never have to hunt for what they're supposed to be doing right now."
- "Missed assignments roll up in the sidebar, so even on Monday morning after a busy weekend you start with a clear punch-list."

---

### Stop 2 — Learning (`/learning`) · 2 min — *the centerpiece*

**What to click**
- From Dashboard, click into today's first task with a deliverable.
- Read the task description out loud (briefly).
- Open the **AI coach** panel and ask: *"What's the strongest version of this submission?"*
- Wait for the streamed response (~5–10s) and let it land on screen.
- Scroll down to the submission box — type or paste a short draft into the deliverable field but **don't submit** during the demo (keeps the daily-advance state clean).

**Talking points**
- "The Learning page is where builders spend most of their time. The structure is: read the prompt, draft a submission, get coached, iterate."
- "The AI coach has the task description and the day's learning objectives loaded as context, so its responses are grounded in *this specific task* — not generic chatbot platitudes."
- "Streaming responses, with abort support — if the coach goes in a direction the builder didn't want, they can stop it mid-sentence and ask again."

**Gotchas**
- If the stream hangs more than ~10s, switch tabs and say: "In production this streams token-by-token; let me show you on a different task." Pick a second task and try again.

---

### Stop 3 — AI Chat (`/ai-chat`) · 90s

**What to click**
- Open the AI Chat page.
- In the threads list on the left, click into one of the **pre-seeded threads** (these come from the weekly conversation cron).
- Scroll up through the conversation so the audience sees a real builder ↔ coach exchange.
- Open the **model selector** dropdown — point out the model options without switching.
- Click **New thread** and send: *"Help me think about how I'd approach a research-spike task this week."*

**Talking points**
- "Builders also have a free-form chat outside of tasks. Same assistant, same memory of what they're working on, but no task scaffolding — useful for big-picture questions, career-prep, or just thinking out loud."
- "Multi-threaded — every thread is preserved, so a builder can come back to a half-finished conversation a week later."
- "Model-selectable. Today this defaults to Claude — staff can configure which models are available per cohort."

**Gotchas**
- If AI Chat is not visible in the nav, the demo cohort doesn't have the `page:ai_chat` permission turned on. Fix from the admin Permissions page, then re-login as Dave.

---

### Stop 4 — Calendar (`/calendar`) · 45s

**What to click**
- Open Calendar in month view.
- Click a date from a past week to jump to it.
- Toggle to week view if available.
- Return to today.

**Talking points**
- "The calendar is the macro view of the curriculum arc. Builders use it to plan ahead and to look back at what they've covered."
- "Every day is clickable — it deep-links into the Learning page on that day's first task."

---

### Stop 5 — Assessments (`/assessment`) · 60s

**What to click**
- Open the Assessments page.
- Click into a **submitted** assessment (one with a green check).
- Scroll to the **staff feedback** section.

**Talking points**
- "Assessments are the formal checkpoints — they bracket modules and the end of the cohort."
- "Builders see their own submission, the rubric, and feedback in one place. No bouncing between email and the LMS."

**Gotchas**
- If the demo account shows no assessments, the source cohort template didn't include assessment periods. Pick a different demo path (skip this stop) or reseed from a template cohort that has them.

---

### Stop 6 — Performance (`/performance`) · 90s — *the moment*

**What to click**
- Open Performance.
- On the **left panel**, hover the attendance calendar — show the present/late/absent legend.
- On the **right panel**, use the week-selector dropdown to step through 2–3 past weeks.
- Let the **AI-generated weekly feedback report** load. Read one or two specific lines out loud.

**Talking points**
- "This is one of the highest-signal pages we ship. Attendance on the left, AI-synthesized weekly feedback on the right."
- "The feedback is generated from the builder's actual week — their submissions, attendance, peer feedback — not a generic template. It calls out specific wins and specific growth areas."
- "Past weeks are always available, so builders see trajectory, not just a snapshot."

**Gotchas**
- If the right panel is empty for the current week, that week isn't complete yet — that's the design. Step back one week and the report appears.

---

### Stop 7 — Pathfinder (`/pathfinder/dashboard` and tabs) · 2 min

**What to click**
- Open the Pathfinder dashboard.
- Show the personal KPIs at the top (interviews, applications, contacts).
- Click into the **Network** tab — browse staff contacts.
- Click into **Mock Interview** — show the AI interview entry-point but don't start one mid-demo.
- (Optional) Direct-URL `/pathfinder/jobs` if the audience asks about the job board.

**Talking points**
- "Pathfinder is the career-prep engine — it kicks in as builders move toward employment."
- "The Network tab is the Pursuit-staff contact list. Builders request intros directly, with quality gates so the requests Pursuit forwards to a hiring partner are actually well-prepared."
- "AI mock interviews give builders unlimited practice reps with real-time feedback, then post-interview coaching. It's the kind of thing only some of them would get from a paid coach in the wild."

**Gotchas**
- `/pathfinder/compass` is gated to L3+ cohorts; the demo cohort may bounce out of it. Avoid that tab unless you know it's enabled.
- `/pathfinder/jobs` is intentionally not in the nav. If asked, navigate via direct URL.

---

## Backup talking points (when something breaks)

| Symptom | What to say while you recover |
| --- | --- |
| AI streaming hangs | "In production this streams token-by-token — let me switch to another task." (Flip to a second task in Learning.) |
| Dashboard shows yesterday's data | "Let me refresh." (Hit reload; if still stale, run **Advance to today** from the admin tab.) |
| Empty AI Chat threads | "These get refreshed weekly — let me kick off a manual seed." (Hit **Seed conversations** in the admin tab; resume the demo on Calendar / Performance while it runs.) |
| Weekly feedback panel empty | "Current week is still in progress — past weeks are populated." (Step back one week in the selector.) |
| Login fails as Dave | "Let me switch accounts." (Pivot to the admin tab; recover the demo password if needed.) |

---

## Known gotchas (reference)

| Area | Gotcha | Workaround |
| --- | --- | --- |
| AI Chat | Not visible in nav | Demo cohort missing `page:ai_chat` permission; grant via admin Permissions page |
| Weekly Feedback | Empty for current week | By design — pick a past week from the dropdown |
| Assessments | No items showing | Template cohort lacked assessments; skip this stop or reseed |
| Pathfinder Compass | Redirects to dashboard | L3+ gated — only certain cohorts can access |
| Pathfinder Jobs | Not in nav | Intentional — navigate by direct URL `/pathfinder/jobs` |
| Network intros | Request blocked / disabled | Quality gates: specific_ask, request_context (100+ chars), builder_preparation (80+ chars), demo URL, readiness checks |

---

## After the demo

- Reset nothing. The daily cron will roll the cohort forward overnight, and the weekly cron will refresh conversations on Sunday at 02:00 ET. Manual cleanup actively hurts — it can wipe state the next demo would have relied on.
- If you discover something broken during the demo (e.g., a stop that wouldn't load), drop a note in the platform-intake form (`/platform-intake`) so it lands in the engineering backlog.

---

## Reference files

- Demo cohort manager: `pilot-client/src/pages/Admin/DemoCohortRefresh/DemoCohortRefresh.jsx`
- Builder route definitions: `pilot-client/src/App.jsx` (lines 233–525 for the routes referenced above)
- Server-side autopilot: `test-pilot-server/queries/demoSeed.js`, `test-pilot-server/services/demoConversationSeeder.js`, `test-pilot-server/server.js` (cron registrations)
