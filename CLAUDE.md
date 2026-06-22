# pilot-client

React 19 SPA for Pursuit's learning management platform. Serves builders (learners), staff, admins, volunteers, and applicants with role-based access control.

## Quick Reference

- **Entry**: `src/main.jsx` → `src/App.jsx` (routes + providers)
- **Build**: Vite 6 — `npm run dev` (port 5173), `npm run build`
- **Test**: `npm test` (Vitest), `npm run test:ui`, `npm run test:coverage`
- **Deploy**: Netlify (`netlify.toml`); Node 20, npm 10.9.0
- **Partner repo**: `../test-pilot-server` (Express backend on port 7001)

## Architecture

```
src/
├── main.jsx                    # React root + React Query + Router
├── App.jsx                     # Route definitions + protected routes + modal handling
├── stores/
│   ├── authStore.js             # Zustand store — auth state, login/logout, permissions
│   └── navStore.js              # Zustand store — navigation state
├── pages/ (57+ pages)          # Route-level components
├── components/ (57+ components)
│   └── ui/ (33+ shadcn)        # Radix-based accessible components
├── hooks/                      # usePermissions, useStreamingText, useMobile, etc.
├── services/                   # API modules (adminApi, volunteerApi, formService, etc.)
├── utils/                      # api.js, attendanceAuth, retryUtils, dateHelpers, etc.
├── constants/permissions.js    # Permission definitions & role mappings
└── lib/utils.js                # Helpers (cn function for classnames)
```

## Tech Stack

- **UI**: React 19, Tailwind CSS 3, shadcn/ui (Radix UI), MUI (selective), Lucide icons
- **State**: React Query (TanStack) for server state (30s stale, 30s polling), Zustand for auth/nav (persisted to localStorage), no Context providers
- **Routing**: React Router DOM 6 with role-based route guards
- **Rich content**: Tiptap editor, React Markdown, Recharts, FullCalendar
- **Animations**: Framer Motion, Animate.css
- **Testing**: Vitest, Testing Library, Stryker (mutation testing)

## Auth Flow

1. Login → `POST /api/unified-auth/login` → receives `{ user, token, redirectTo, userType }`
2. Token + user stored in localStorage
3. Permissions fetched from `GET /api/permissions/my-permissions` → cached in authStore
4. All API calls include `Authorization: Bearer <token>` header
5. Global error handler detects 401/403 → `ExpiredTokenModal` → redirect to login

**Roles**: `admin` (wildcard '*'), `staff`, `builder`, `volunteer`, `workshop_participant`, `enterprise_builder`, `enterprise_admin`, `candidate`, `applicant`

## Permission System

`usePermissions()` hook — hybrid DB-sourced + hardcoded fallback:
- `hasPermission(key)`, `canAccessPage(page)`, `canUseFeature(feature)`
- Admin bypasses all checks
- Permissions drive nav visibility and route guards (`components/RouteGuards/`)
- Defined in `constants/permissions.js` with `DEFAULT_ROLE_PERMISSIONS` fallback

## State Management (Zustand)

Auth and nav state live in Zustand stores (`src/stores/`), not React Context. There are no Context providers to wrap.

### authStore (`src/stores/authStore.js`)

```js
import useAuthStore from '@/stores/authStore';

// Reading state — use selectors for optimal re-renders
const user = useAuthStore((s) => s.user);
const token = useAuthStore((s) => s.token);
const permissions = useAuthStore((s) => s.permissions);
const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

// Multiple values — single selector returning an object
const { user, token } = useAuthStore((s) => ({ user: s.user, token: s.token }));

// Actions
const login = useAuthStore((s) => s.login);       // (credentials) → API call, sets user+token+permissions
const signup = useAuthStore((s) => s.signup);      // (userData) → API call, sets user+token
const logout = useAuthStore((s) => s.logout);      // () → clears state + localStorage
const updateUser = useAuthStore((s) => s.updateUser); // (fields) → merges into user object
const setAuthState = useAuthStore((s) => s.setAuthState); // (stateObj) → bulk update
const refreshPermissions = useAuthStore((s) => s.refreshPermissions); // () → re-fetches from API
```

**Persistence**: `user` and `token` auto-persist to localStorage via Zustand `persist` middleware. On page reload, state rehydrates automatically and `refreshPermissions` runs to re-fetch permissions from the server.

### navStore (`src/stores/navStore.js`)

```js
import useNavStore from '@/stores/navStore';

const isSecondaryNavPage = useNavStore((s) => s.isSecondaryNavPage);
const setIsSecondaryNavPage = useNavStore((s) => s.setIsSecondaryNavPage);
```

### Testing with Zustand stores

Do NOT wrap components in providers. Set state directly before each test:

```js
import useAuthStore from '@/stores/authStore';

beforeEach(() => {
  useAuthStore.setState({
    user: { id: 1, role: 'builder', firstName: 'Test' },
    token: 'test-token',
    permissions: [],
    isAuthenticated: true,
  });
});

afterEach(() => {
  useAuthStore.setState(useAuthStore.getInitialState());
});
```

## Key Routes

**Public**: `/login`, `/signup`, `/forgot-password`, `/reset-password/:token`, `/verify-email/:token`, `/apply/*`, `/form/:slug`, `/attendance-login`, `/workshops`, `/info-sessions`

**Builder**: `/dashboard`, `/ai-chat`, `/learning`, `/calendar`, `/assessment`, `/performance`, `/pathfinder/*`, `/account`, `/payment`, `/volunteering`

**Staff/Admin**: `/admin-dashboard`, `/admin-attendance-dashboard`, `/admissions-dashboard`, `/content/*`, `/facilitator-view`, `/volunteer-management`, `/forms`, `/sputnik`, `/workshop-admin-dashboard`, `/platform-intake`

**Admin-only**: `/admin-prompts`, `/admin/organization-management`, `/admin/permissions`, `/admin/weekly-reports`, `/admin/platform-analytics`, `/admin/demo-cohort-refresh`, `/admin/coach`

**Admin Prompts** (`/admin-prompts`, `pages/AdminPrompts/AdminPrompts.jsx`): two top-level engine tabs — **V1 Engine** and **V2 Coach Engine**. The V1 tab has 6 sub-tabs (Base Prompts, Personas, Program Contexts, Modes, Content Generation, Current AI Prompt). The V1 Content Generation tab is filtered to V1 prompt_types only (`json_builder`, `facilitator_notes`, `other`) — V2 coach + onboarding + eval rows live in the same `content_generation_prompts` table but ONLY appear on the V2 tab. Server enforces the partition (`queries/contentGenerationPrompts.js:V1_PROMPT_TYPES` whitelist on GET, 400 on V1 POST/PUT of V2 types); client adds belt-and-suspenders filter. **V2 Coach Engine tab** (`components/V2CoachEngineTab.jsx`): 4 sub-tabs — **Config & Reference** (default; graph flow Mermaid diagram with robot-face hover tooltips, program context, builder profile fields, skill taxonomy), **Coaching Loop** (all 7 editable coaching prompts in conversation order: learn → generate challenge → apply → grade → remediate → complete → reflect, each a nested sub-tab rendering a `TemplateCard`), **Onboarding** (5 editable system-prompt sections for the SSE chat coach — Persona / Grounding Contract / Anchor Guidance / Do Not Ask / Pacing — each a nested sub-tab; the 4 read-only "computed at runtime" debug sections (build-artifact guidance + opening line, ×2) were removed 2026-06-15 from both the tab and the server payload in `adminPromptsController.js`), **Eval Harness** (judge + simulated builder templates + 7 read-only rubric dimensions including `teaching_method_adherence` added 2026-06-16, which only scores runs whose builder has a declared `learning_modality_preferences.preferred`). The former **Inline Nodes** tab was removed (2026-06-15); its 3 editable node prompts (Generate Challenge / Complete / Reflect, sourced from `data.coachv2InlineNodes` where `editableNode && id`) were merged into the Coaching Loop tab alongside the 4 phase templates, ordered via the `LOOP_PROMPT_ORDER` constant and friendly-named via the `NODES` map in `CoachV2NodeTooltip.jsx`. The page-level Refresh button was also removed (data still loads on mount + after each save/revert via `fetchData`). Per-prompt edit dialogs (`PromptFormDialog`), per-skill edit dialog (`SkillEditDialog`), graph-config scalar inputs, and a shared history-with-revert dialog (`PromptChangeHistoryDialog`) — all attached to the relevant editable items. Edits PUT to `/api/admin/prompts/{content-generation,contexts,coach-v2-config,skill-taxonomy}/:id` and trigger `promptManager.reloadPrompts()` on the server so the change takes effect on the next coach turn. Eval batches with frozen prompts show a green "🧊 Frozen prompts" indicator on the Coach Evals tab.

**Coach** (`/admin/coach`, `pages/Admin/Coach/Coach.jsx`): combined admin surface for the v2 coach agent — an Organization-Management-style tabbed page with **Coach Runs** and **Coach Evals** tabs (synced to `?tab=runs|evals`). The top nav is a single compact bar — the "Coach" title beside the tabs **grouped in a bordered rounded pill** (`bg-slate-50 border p-1 rounded-lg`, OrgManagement-style), no separate title/subtitle band. One "Coach" nav entry in the Admin dropdown, gated by *either* `page:coach_observability` or `page:coach_evals` via `MultiPermissionRoute`. The old `/admin/coach-runs` and `/admin/coach-evals` routes now redirect here. `CoachRuns`/`CoachEvals` take an `embedded` prop (suppress their own page header when rendered as tab bodies); the Evals→Runs "View agent timeline" switches to the Runs tab in-place via an `onViewTimeline(threadId)` callback (passed to `CoachRuns` as `openThreadId`) instead of navigating. The **Builder Snapshot** tab (`?tab=snapshot&userId=`, `pages/Admin/BuilderSnapshot/`) embeds `BuilderSnapshot`; its Skill Profile (`components/BuilderSnapshotSkillsPanel.jsx`) renders the 33-skill taxonomy as **small multiples — one full-circle radar per category** (not one combined 33-axis radar; that collapsed each series to a third of the circle with unreadable labels). Axis labels word-wrap to two lines via `wrapLabel`; clicking a category card opens a shadcn `Dialog` with an enlarged radar (`CategoryRadar size="large"`). Top Strengths / Growth Areas leaderboards sit below the radar grid.

**Admin Dashboard — Cohort Hub Logs tab** (`/admin-dashboard`, `pages/AdminDashboard/tabs/LogsTab.jsx` + `pages/AdminDashboard/components/BuilderLogModal.jsx`): the Logs tab's **Add Log** button opens `BuilderLogModal` which has two tabs — **Builder** (existing builder behavioral/conversation log, unchanged) and **Cohort** (new as of 2026-06-01). The Cohort tab lets staff log facilitator or cohort feedback: cohort search (auto-populated from the selected cohort), log category pills (`facilitator_feedback` / `cohort_feedback`), three-state Curriculum Status selector (thumbs up/neutral/down), Curriculum Status Notes, collapsible day and next-day curriculum change sections, and a Flags section with an Action Required checkbox. `canSave` is true when Action Required is checked even if the Flags textarea is empty. `action_required` resets when the Flags toggle is turned off. Saved via `POST /api/admin/dashboard/cohort-logs`; backed by `cohort_log` table (migration `create_cohort_log_table.sql` in test-pilot-server). `LogsTab` passes the `cohorts` prop into `BuilderLogModal` for auto-population.

**Coach Evals** (Coach Evals tab of `/admin/coach`, `pages/Admin/CoachEvals/CoachEvals.jsx`): staff/admin harness for automated quality evaluation of the v2 coach. A run bar (suite picker + optional model-under-test / judge-model overrides + **Run eval** button) kicks off a batch via `POST /api/admin/coach-evals/run`; the page polls batch status while it runs. Left pane lists batches (aggregate score, pass rate, status); selecting one shows its cases (persona, task, overall + per-dimension score chips, pass/fail), and a case expands to per-dimension judge verdicts (score, reasoning, evidence) plus a **"View agent timeline →"** link to `/admin/coach?tab=runs&thread=<id>` (CoachRuns reads the `?thread=` param to deep-link). Backed by `services/coachEvalsApi.js`; gated by `page:coach_evals` (`PAGE_PERMISSIONS.COACH_EVALS`, staff by default in `DEFAULT_ROLE_PERMISSIONS`, admin via wildcard). CoachRuns hides the synthetic `Eval Harness` cohort users from its list (they still open via the deep-link).

**Coach Runs** (Coach Runs tab of `/admin/coach`, `pages/Admin/CoachRuns/CoachRuns.jsx`): staff/admin observability into the v2 coach agent (the `coachV2` LangGraph in test-pilot-server). Two-pane layout — left is a searchable list of runs (one per builder + personalized task + thread), right is the selected run with a **Readable ⇄ Developer** view toggle (defaults to Readable). **Developer view** is the original **agent timeline**: one card per node execution (init/learn/generateApply/apply/grade/remediate/complete) with phase badge, model, latency, tokens, marker chips (`READY_FOR_APPLY`/`APPLY_SUBMITTED`), the grade node's criteria-score table, and collapsible System Prompt / Raw Output / Visible Output / Structured Result panels, plus a run-level token/cost strip. **Readable ("Story") view** is a plain-language, non-technical-friendly summary built entirely from the same `getCoachRun` payload: an outcome summary card (passed/failed/in-progress + score, messages, attempts, coach-processing time, est. cost), a **"How the coach personalized this run"** card (teaching style / difficulty / +20% modifier, from the init step's `structured_result`), a **"What the coach saw"** panel rendering the init step's `builder_context` (skill-level bars, learning profile, mock-interview weak areas, background/goals, + a raw-JSON fallback — this is the structured profile the LLM received), a **session timeline** bar (per-phase duration + cost, click a segment to jump), and the **conversation** as builder↔coach chat bubbles with phase dividers and inline grade results, plus a **Copy summary** button (plain-text recap for Slack/email). The phase-friendly labels live in `PHASE_META`; teaching-method descriptions in `TEACHING_METHOD_LABEL`. Data comes from `services/coachRunsApi.js` (`listCoachRuns`, `getCoachRun`) hitting `/api/admin/coach-runs` with bearer auth; gated by `page:coach_observability` (`PAGE_PERMISSIONS.COACH_OBSERVABILITY`, granted to staff by default in `DEFAULT_ROLE_PERMISSIONS`, admin via wildcard). On-demand load with manual refresh — no live streaming.

**Golden Dataset** (Golden Dataset tab of `/admin/coach`, `pages/Admin/GoldenDataset/GoldenDataset.jsx`, synced to `?tab=golden`, placed after Builder Snapshot, gated by `canAccessPage('coach_observability')`): a tab that surfaces 16 handcrafted, maximally-distinct synthetic builder archetypes (one+ per teaching style) spanning every coach personalization axis. The layout is **master-detail only** (no top controls bar, no view toggle, no matrix view, no explicit seed button — seeding happens automatically inside the run path via `ensureGoldenUser` + `applyGoldenProfile`, invisible to the user). A left rail lists every archetype by name with **per-style colored** teaching chips + a difficulty chip (each of the 7 teaching styles has its own distinct `Chip` tone via `METHOD_TONE`/`methodTone`, kept off green/amber/slate/red which mean difficulty/status); selecting one populates the right `DetailPanel`. The DetailPanel header shows the builder identity + the coach's REAL deterministic decision on the left (teaching method / difficulty band+avg / +20% interview modifier, computed server-side via `deriveLearnStrategy`, zero LLM calls) and the **task picker + "Run on this task" button on the right** (`listGoldenTasks` drives both the derived-difficulty basis and the run target; the task dropdown + run live in the header, not a separate bar) (`ArchetypeDetailBody`: learning_profile fields, skill_levels bars, prior-knowledge/apply-accuracy/interview-weakness chips, background/goals markdown). **Run flow**: `runArchetype` resets the archetype to its fixture, drives a live headless coach run, and returns `{ threadId, turns, finalPhase, before, after, transcript, steps }`. The run's profile write-back persists to the archetype's `builder_profiles` row (so the `after` is a real DB write), but each run resets to the fixture first, so changes do NOT accumulate across runs. Below the (raised, white) header + run control, the body is split into **three tabs** of **full-bleed, borderless "sunken" sections** (`SunkenSection` — recessed grey wells with an inset shadow, full container width, padding-only, no card margins): (1) **Background & Goals** — `AuthoredContextBody` (background/goals/persona/interview-weaknesses, static) + a `LearningProfileBody` showing the learning profile, which after a run becomes a before/after side-by-side plus a `ProfileDiff variant="learning"`; (2) **Skills & Stats** — after a run, a `ProfileDiff variant="stats"` (skill-level EMA shifts, new performance entry/competency evidence, apply-accuracy) then the `before`/`after` numeric profiles side by side via `StatsBody`; before a run, just the authored baseline `StatsBody`; (3) **Conversation** — a static, scrollable `ConversationView` (full interleaved builder↔coach transcript, no auto-player, grows to ~74vh, node/phase rail init→learn→…→complete). Authored fixtures render through `inputsToProfile()` so the baseline uses the same `StatsBody`/`LearningProfileBody` components as the snapshots. Before a run, the Background/Stats tabs show the authored fixture; the before→after comparisons only appear once a run has generated them. A "View full timeline →" link deep-links to the Coach Runs tab (`onViewTimeline(threadId)`). Self-contained Chip/Section styling (brand `#4242EA`, `font-proxima`) like CoachProfiles, no shadcn Badge. Backed by `services/goldenDatasetApi.js` (`listArchetypes`, `listGoldenTasks`, `runArchetype`) hitting `/api/admin/golden-dataset*` with bearer auth. (The server `POST /seed` bulk-seed endpoint still exists but the client no longer calls it — runs auto-seed via `ensureGoldenUser`.)

**Teaching Lab** (Teaching Lab tab of `/admin/coach`, `pages/Admin/TeachingLab/TeachingLab.jsx`, synced to `?tab=lab`, placed after Golden Dataset, gated by `canAccessPage('coach_observability')`): a mock environment for the onboarding **teaching-method classifier** (the behavioral pass over anchor #9, "how they like to learn") — the analog of Golden Dataset but for learning-preference classification. Left rail is a grouped **example-answer gallery** (Clear style / Ambiguous / Sensory modality) served by `GET /api/admin/onboarding-lab/presets`; clicking one classifies it. Right pane has a free-text answer box + **Classify** button. Each result (`POST /api/admin/onboarding-lab/classify`, body `{ answer }`) renders in full-bleed `SunkenSection`s: the answer tested, the **classifier output** (predicted style chip colored via the same `METHOD_TONE` map as Golden Dataset, or an "Omitted — no usable signal" chip; a `ConfidenceBar` showing confidence vs the 0.7 floor marker; source + evidence), and **what the coach would do** (persisted-vs-dropped chip → effective method, where below-floor/omitted resolves to **Balanced (no preference)**, plus the exact guidance directive injected into the learn prompt). Below that, a **"See the coach in action"** section (`CoachInAction`, keyed per classification) calls `POST /api/admin/onboarding-lab/coach-turn` to **actually run the coach's learn phase** in the effective method on a fixed sample task and render the real coach output as chat bubbles (Builder right / Coach left) — you can reply as the builder to continue a stateless multi-turn conversation and watch the style play out. The classification itself is READ-ONLY (no profile writes; real classifier over an ephemeral transcript); the coach-turn demo is also stateless (no thread/DB). Backed by `services/onboardingLabApi.js` (`listLabPresets`, `classifyTeachingMethod`, `coachTurn`) with bearer auth.

**Demo Cohort Manager** (`/admin/demo-cohort-refresh`, `pages/Admin/DemoCohortRefresh/DemoCohortRefresh.jsx`): admin tool to wipe and rebuild the Platform Demo cohort with 12 months of curriculum + past-day attendance/submissions/feedback for `dave+demo@pursuit.org`. Gated by `page:demo_cohort` (admin-only by wildcard; grantable to staff). Three cards — Status, Seed 12 months (configurable operating days + source 4-week template cycle), Advance to today (idempotent catch-up). Legacy single-week refresh lives as a collapsed utility at the bottom. Backend: `/api/admin/demo-cohort/*` in test-pilot-server.

**Performance page** (`/performance`, `pages/Performance/Performance.jsx`): two-panel builder view — `AttendanceCalendar` on the left, `WeeklyFeedbackReport` on the right (week-selector dropdown + report). As of 2026-04-27 the right panel renders unconditionally for all cohorts; the previous cohort gate that limited the report to `March 2026 L1` was removed. `WeeklyFeedbackReport` pulls from `utils/weeklyFeedbackService.js` (`fetchAvailableReportWeeks`, `fetchWeeklyFeedbackReport`). The legacy `components/FeedbackInbox.jsx` and `utils/performanceFeedbackService.js` (`fetchCombinedFeedback`, `filterFeedback`, `getFeedbackStatistics`) are parked but no longer wired up — kept on disk in case the inbox view needs to be revived; do not re-import without product sign-off.

**Pathfinder Compass** (`/pathfinder/compass`, `pages/PathfinderCompass/PathfinderCompass.jsx`): SSE chat career coach. Two panes — `CompassChat` (streaming chat) + `CompassDashboard` (strategy/cycle/goals). Server (`test-pilot-server` `controllers/compassController.js`) is the source of truth for chat history (`job_strategy_chat_messages`, up to 500 msgs, returned on `GET /api/pathfinder/compass/status` as `chatHistory`). **Hydration (fixed 2026-06-12)**: on mount the history useEffect is now SERVER-FIRST — it hydrates from `status.chatHistory` and merges back any local-only tail messages (dedup on role + `stripForDisplay` prefix), then demotes localStorage to a write-through cache. Previously localStorage (capped at 50 msgs) won whenever non-empty, which hid the server's larger history and caused "Compass forgot my conversation" reports. The effect guards on `status.fetchError` (don't reconcile against a failed fetch) and sets `initDoneRef` before the onboarding-greeting init effect reads it (declaration order matters). Server-side, Compass now has durable memory: a reflection pass distills conversations into `builder_profiles.{background,goals,strategy}` and re-injects them into the coach's system prompt, so continuity no longer depends on the local cache or the transcript window (see test-pilot-server CLAUDE.md → Compass).

**Pathfinder Build Tracker** (`/pathfinder/projects`, `pages/PathfinderProjects/PathfinderProjects.jsx`): builder-facing kanban of `builder_projects` across 5 stages (Ideation → Planning → Development → Testing → Launch) with HTML5 drag-and-drop. PRDs are submitted/approved via the staff `PathfinderAdmin` PRDs tab (`POST /api/pathfinder/projects/:id/approve-prd`). **Stage moves are server-authoritative (fixed 2026-06-16)**: `handleDrop` no longer pre-checks stage rules against the locally cached project list — it just PUTs `{ stage }` and renders the server's response. The previous client-side gate read `draggedProject.prd_approved` from stale state, so a PRD approved by staff *after* the page loaded still read `false` and the move was wrongly blocked with a spurious "PRD Approval Required" warning. The board now also allows **free stage movement** (the one-step-at-a-time "Cannot Skip Stages" rule was removed on both client and server); the only remaining gates, enforced server-side against fresh DB state, are: a PRD must be approved to enter **Development**, and the launch checklist must be complete to enter **Launch** (the launch gate now fires entering Launch from *any* stage, not only from Testing). The client surfaces the server's `requiresApproval` / `requiresChecklist` responses as warnings.

**Admissions Dashboard** (`/admissions-dashboard`, `pages/AdmissionsDashboard/AdmissionsDashboard.jsx`): staff/admin view over the v2 cohort-enrollment model. Tab-lazy: `OverviewTab`, `ApplicationsTab`, `InfoSessionsTab`, `WorkshopsTab`, `EmailsTab`, `LeadsTab`. Each tab fetcher hits `/api/admissions/dashboard/*` with bearer auth; cohort filter default is centralized in a single `useEffect` keyed on `[cohorts]` (`applyCurrentCycleDefault`) so the three concurrent tab fetches can't race on first render. The "applied" tracking ref (`cycleDefaultAppliedRef`) is intentionally **mount-scoped, not sessionStorage-keyed** — so a page reload or route-revisit re-applies the current-cycle default on both Overview and Applicants, while mid-session refetches (e.g., after a bulk action) still find the ref true and preserve an explicit All Time choice. Do NOT seed this ref from sessionStorage; that pattern (in place 2026-05-19 → 2026-05-21) broke the current-cycle default on every reload. `ApplicationsTab` reads `app.cohort_id` (v2 source of truth) plus `program_admission_status` and `enrollment_status`. Status badges go through `components/shared/utils.js#getStatusBadgeClasses(status, context)` — pass `'enrollment'` for enrollment_status to disambiguate `'withdrawn'` from the admission-status `'withdrawn'`. Bulk operations call `BulkActionsModal`. **No automatic rollover (2026-06-15)**: cohort assignment is permanent — an application's `cohort_id` changes only via a staff move (`move_to_cohort` / per-applicant cohort change) or an applicant cohort-switch/reapply; there is no rollover cron (`services/rolloverService.js` was deleted server-side). The `OverviewTab` KPI cards therefore show single pipeline totals — the old "Selected This Cycle / Carried Forward" net-new/rolled split was removed. The `source_bucket` filter in `ApplicationsTab` (and its `carried_forward`/`selected_this_cycle` badges) is kept; with rollover gone, `carried_forward` now means staff-moved or applicant-switched and trends toward zero. **Activity Recency contract**: the `OverviewTab` Activity Recency card and the Funnel-by-Activity heatmap surface applicant-driven activity only — signup, application started/submitted, response edits, event registration/attendance. Row-level `updated_at` columns (`applicant`, `application`, `applicant_stage`) are explicitly excluded because they're bumped by system writes (bulk ops, deliberation toggles, the 2026-04-29 v2 cohort backfill; formerly the rollover cron too). Contract is enforced server-side in `getOverviewStatsByCohort` + `getFunnelHeatmap` and pinned by `__tests__/queries/admissionsFunnelHeatmap.test.js` in test-pilot-server. The tooltip on the page ("System/admin updates are excluded") matches the data. **GJA column + viewer (2026-06-22)**: `ApplicationsTab` has a `gja` column ("GJA Signed", default ON) rendered like the Pledge column — a green "✓ Signed" pill (with signed date + source tooltip) that is clickable when `app.gja_signed`, opening a self-contained viewer modal (`openGjaModal`/`Dialog`, mirrors the PaymentAdmin preview: PDF iframe / image / "Open in new tab"). The modal fetches `/api/admissions/applicants/:id/gja` for metadata; DocuSign PDFs (`viewAuth==='bearer'`) are fetched as a blob with the auth header and rendered via an object URL (revoked on close), while manual uploads use their pre-signed GCS URL directly. The "Enrollment" column now reads "Enrolled" once both the pledge AND the GJA are signed (server-derived; see test-pilot-server enrollment note) rather than only after a builder account is created.

**Applicant flow** (`/apply`, `pages/ApplicantDashboard/ApplicantDashboard.jsx` + `pages/ApplicationForm/ApplicationForm.jsx`): public landing for applicants. All form-fill / response / submit / fetch-responses calls require `Authorization: Bearer <applicantToken>` — the legacy `/anonymous` IDOR fallbacks were removed (commits `d06111c`, `5118ec0`); a missing or expired token now 401s and the global fetch interceptor triggers `ExpiredTokenModal` → redirect to login. Ownership-changing actions — **reopen** a submitted application and **change cohort** on a submitted application — go through `databaseService.reopenSubmittedApplication(applicationId)` and a direct `PUT /api/applications/application/:id/cohort` call respectively. The applicant token lives at `localStorage.applicantToken` and is decoded for display data via `getCurrentApplicant()`. **Dashboard side-fetch resilience**: `ApplicantDashboard.loadApplicationStatus` no longer collapses every error into `'not started'` — once `getLatestApplicationByApplicantId` proves an application exists, a subsequent `getApplicationResponses` failure falls back to `'in process'` for `in_progress` apps (so the button stays "Continue Application") and 401s are passed through to the global handler instead of papered over. `loadInfoSessionStatus` also consults `applicant_stage.current_stage` rank when no `event_registration` match is found, so external-event attendance (stage `info_session_attended`) is honored even though the event isn't of type `info_session`.

**Form Builder** (`/forms`, `pages/FormBuilder/`): staff/admin tool for creating, editing, and analyzing public forms. `FormEditor.jsx` has Questions / Settings / Preview tabs; `components/FormSettings.jsx` houses Response Settings, Completion, Email Notifications (admin recipients), **Confirmation Email to Respondent**, and Form Limits. The Confirmation Email card lets a creator toggle a respondent confirmation, optionally customize From Name / Subject / Body, and reference `{{form_title}}`, `{{submission_date}}`, `{{respondent_email}}`. All four fields live on `form.settings` JSONB (`confirmation_email_enabled`, `confirmation_email_subject`, `confirmation_email_body`, `confirmation_email_from_name`); empty strings fall back to the backend defaults. If `require_email` is off, the backend falls back to any answer to a question whose label contains "email" (or any email-shaped answer); FormSettings shows an info banner naming that question, or a warning if neither source exists. The email itself is sent as both plain text and a Pursuit-branded HTML template (purple header band, headline, body, footer) — see `buildConfirmationEmailHtml` in test-pilot-server. `FormSubmissions.jsx` renders submissions as a sortable-style table (Email / Submitted / Interests / Note / Flag / Actions) with row-click → centered detail modal preserving flag, note, and delete actions. When the form contains the question `How would you like to get involved with Pursuit?`, an **Interests** multi-select dropdown filter appears; the filter is applied client-side and CSV/JSON exports are generated client-side from the filtered list (with formula-injection guard + RFC 4180 quoting), so all active filters carry through to the download.

## API Integration

Base URL: `VITE_API_URL` env (default `http://localhost:7001`)

**Two patterns**:
1. **REST**: `fetch()` / `axios` with auth headers → JSON response
2. **SSE Streaming**: `streamMessageToGPT()`, `streamLearningMessage()` — real-time AI text chunks with `AbortSignal` support

**Service modules**: `utils/api.js` (generic + streaming), `services/adminApi.js` (27KB, admin ops), `services/volunteerApi.js`, `services/formService.js`, `services/platformIntakeService.js`, `utils/statsApi.js`, `utils/analyticsApi.js`, `utils/attendanceService.js`

## Platform Intake

`src/pages/PlatformIntake/PlatformIntake.jsx` — form for reporting bugs and requesting features. Submissions go to `POST /api/platform-intake` on test-pilot-server, which also forwards them to pursuit-factory (`POST /api/intake`) to create tickets in the Kanban system.

- **Nav placement**: standalone link directly above Logout in `Layout.jsx`, gated by `page:platform_intake` (granted to every non-admin role by default; admin via wildcard)
- **Reporter name**: editable text input, pre-filled from auth store user name
- **Reporter email**: read-only, pulled from authenticated user
- **Type toggle**: bug (requires screenshot/video upload) or feature
- **Platform components**: 19 options (Dashboard, AI Chat, Calendar, etc.)
- **Prioritization**: urgent/high/medium/low with required justification
- **Backlog view**: `PlatformIntakeBacklog.jsx` — admin/staff can see all submissions

## Coach / Learning deliverable panel

The V2 Coach APPLY-phase deliverable panel (`src/pages/Learning/components/DeliverablePanel/`) supports file and URL deliverables in addition to image/video/structured/link/document.

- **FileSubmission** (`DeliverablePanel/FileSubmission.jsx`): mirrors `ImageSubmission.jsx` (same props + localStorage-draft UX). Accepts `.pdf,.doc,.docx,.txt,.md,.js,.py,.html,.css,.json,.csv,.pptx,.xlsx,.zip`, max 25MB, read via `FileReader.readAsDataURL` and submitted as `JSON.stringify({ type:"file", filename, mimeType, size, base64 })` (the server uploads it to GCS and the grader extracts its text/vision content).
- **Routing** (`DeliverablePanel/DeliverablePanel.jsx`): `getSubmissionComponent` routes `deliverable_type === "file"` to `FileSubmission` (before the `FlexibleSubmission` fallback). `link`/`document`/`url` still route through `FlexibleSubmission` for URL/Google-Doc links.
- **Assignment button gate** (`src/pages/Learning/Learning.jsx`): the `showAssignmentButton` deliverable-type allowlist includes `file` and `url` (full set: video, document, link, structured, image, file, url).

## Design System

- **Font**: Proxima Nova
- **Colors**: Pursuit Purple `#4242EA`, Carbon Black `#1E1E1E`, Stardust `#E3E3E3`, Mastery Pink `#FF33FF`
- **CSS**: Tailwind utilities + CSS variables in `:root` (index.css)
- **Components**: shadcn/ui (Button, Input, Dialog, Select, Tabs, Card, Badge, etc.)
- **Path alias**: `@/*` → `./src/*`

## Key Architectural Patterns

- React functional components + hooks throughout
- **Zustand** for auth/nav state — no Context providers, use selector hooks directly
- **React Query** for server state with automatic refetch on focus
- `usePermissions()` hook reads `user.role` from authStore to check RBAC permissions
- Custom `useStreamingText` hook smooths bursty SSE into natural typing animation
- `globalErrorHandler.js` listens for auth errors via custom events
- `retryUtils.js` provides backoff strategy for failed requests
- `cacheService.js` for client-side caching beyond React Query
- Attendance system has separate auth flow (`attendanceAuth.js`)

## Environment Variables

- `VITE_API_URL` — backend base URL (required)
- `VITE_GOOGLE_MAPS_API_KEY` — Google Maps for address autocomplete

## Client-Server Contract

This app consumes the REST + SSE API from `../test-pilot-server`:
- Auth: JWT in Bearer header; token lifecycle managed by authStore (Zustand)
- Streaming: SSE for `/api/chat/messages/stream` and `/api/learning/messages/stream`
- Permissions: fetched at login, cached locally, fallback to hardcoded role defaults
- File uploads: multipart/form-data for submissions with images
- CORS: backend allows `FRONTEND_URL` origin
