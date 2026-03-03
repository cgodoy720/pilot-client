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

**Staff/Admin**: `/admin-dashboard`, `/admin-attendance-dashboard`, `/admissions-dashboard`, `/content/*`, `/facilitator-view`, `/volunteer-management`, `/forms`, `/sputnik`, `/workshop-admin-dashboard`

**Admin-only**: `/admin-prompts`, `/admin/organization-management`, `/admin/permissions`, `/admin/weekly-reports`, `/admin/platform-analytics`

## API Integration

Base URL: `VITE_API_URL` env (default `http://localhost:7001`)

**Two patterns**:
1. **REST**: `fetch()` / `axios` with auth headers → JSON response
2. **SSE Streaming**: `streamMessageToGPT()`, `streamLearningMessage()` — real-time AI text chunks with `AbortSignal` support

**Service modules**: `utils/api.js` (generic + streaming), `services/adminApi.js` (27KB, admin ops), `services/volunteerApi.js`, `services/formService.js`, `utils/statsApi.js`, `utils/analyticsApi.js`, `utils/attendanceService.js`

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
