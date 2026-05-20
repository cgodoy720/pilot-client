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

**Admin-only**: `/admin-prompts`, `/admin/organization-management`, `/admin/permissions`, `/admin/weekly-reports`, `/admin/platform-analytics`, `/admin/demo-cohort-refresh`

**Demo Cohort Manager** (`/admin/demo-cohort-refresh`, `pages/Admin/DemoCohortRefresh/DemoCohortRefresh.jsx`): admin tool to wipe and rebuild the Platform Demo cohort with 12 months of curriculum + past-day attendance/submissions/feedback for `dave+demo@pursuit.org`. Gated by `page:demo_cohort` (admin-only by wildcard; grantable to staff). Three cards — Status, Seed 12 months (configurable operating days + source 4-week template cycle), Advance to today (idempotent catch-up). Legacy single-week refresh lives as a collapsed utility at the bottom. Backend: `/api/admin/demo-cohort/*` in test-pilot-server.

**Performance page** (`/performance`, `pages/Performance/Performance.jsx`): two-panel builder view — `AttendanceCalendar` on the left, `WeeklyFeedbackReport` on the right (week-selector dropdown + report). As of 2026-04-27 the right panel renders unconditionally for all cohorts; the previous cohort gate that limited the report to `March 2026 L1` was removed. `WeeklyFeedbackReport` pulls from `utils/weeklyFeedbackService.js` (`fetchAvailableReportWeeks`, `fetchWeeklyFeedbackReport`). The legacy `components/FeedbackInbox.jsx` and `utils/performanceFeedbackService.js` (`fetchCombinedFeedback`, `filterFeedback`, `getFeedbackStatistics`) are parked but no longer wired up — kept on disk in case the inbox view needs to be revived; do not re-import without product sign-off.

**Admissions Dashboard** (`/admissions-dashboard`, `pages/AdmissionsDashboard/AdmissionsDashboard.jsx`): staff/admin view over the v2 cohort-enrollment model. Tab-lazy: `OverviewTab`, `ApplicationsTab`, `InfoSessionsTab`, `WorkshopsTab`, `EmailsTab`, `LeadsTab`. Each tab fetcher hits `/api/admissions/dashboard/*` with bearer auth; cohort filter default is centralized in a single `useEffect` keyed on `[cohorts]` (`applyCurrentCycleDefault`) so the three concurrent tab fetches can't race on first render. `ApplicationsTab` reads `app.cohort_id` (v2 source of truth) plus `program_admission_status` and `enrollment_status`. Status badges go through `components/shared/utils.js#getStatusBadgeClasses(status, context)` — pass `'enrollment'` for enrollment_status to disambiguate `'withdrawn'` from the admission-status `'withdrawn'`. Bulk operations call `BulkActionsModal`; rollover cron is in the server (`services/rolloverService.js`).

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
