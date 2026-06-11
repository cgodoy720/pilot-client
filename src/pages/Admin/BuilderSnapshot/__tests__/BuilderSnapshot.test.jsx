import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('../../../../stores/authStore', () => {
  const state = { token: 'test-token', user: { id: 99, role: 'admin' } };
  const useAuthStore = (selector) => (selector ? selector(state) : state);
  useAuthStore.getState = () => state;
  return { __esModule: true, default: useAuthStore };
});

vi.mock('../../../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
    hasPermission: () => true,
    canUseFeature: () => true,
  }),
}));

vi.mock('../../../../services/builderProfileInspectorApi', () => ({
  searchUsers: vi.fn(),
}));

import { searchUsers } from '../../../../services/builderProfileInspectorApi';

// Mock useSearchParams so we can control ?userId= per test.
let currentSearch = '';
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => {
      const params = new URLSearchParams(currentSearch);
      const setSearchParams = (next) => {
        currentSearch =
          typeof next === 'function'
            ? next(new URLSearchParams(currentSearch)).toString()
            : next instanceof URLSearchParams
            ? next.toString()
            : new URLSearchParams(next).toString();
      };
      return [params, setSearchParams];
    },
  };
});

// Mock recharts — jsdom doesn't render canvas/SVG measurements; we just check
// the radar is invoked with the right data shape.
vi.mock('recharts', () => ({
  ResponsiveContainer: ({ children }) => <div data-testid="recharts-responsive">{children}</div>,
  RadarChart: ({ children, data }) => (
    <div data-testid="recharts-radar" data-points={data?.length ?? 0}>
      {children}
    </div>
  ),
  PolarGrid: () => <div data-testid="recharts-polargrid" />,
  PolarAngleAxis: () => <div data-testid="recharts-axis" />,
  PolarRadiusAxis: () => <div data-testid="recharts-radius" />,
  Radar: ({ dataKey, name }) => (
    <div data-testid={`recharts-series-${dataKey}`} data-name={name} />
  ),
}));

// Mock ReactMarkdown — render plain text so we can assert content.
vi.mock('react-markdown', () => ({
  __esModule: true,
  default: ({ children }) => <div data-testid="markdown">{children}</div>,
}));

import BuilderSnapshot, { composeSummary } from '../BuilderSnapshot';

const FULL_SNAPSHOT = {
  identity: {
    user_id: 42,
    first_name: 'Bea',
    last_name: 'Builder',
    email: 'bea@pursuit.org',
    cohort: 'March 2026 L1',
  },
  full_name: 'Bea Builder',
  cohort_name: 'March 2026 L1',
  headshot_url: 'https://cdn.example.com/bea.jpg',
  profile: {
    background: { markdown: 'Self-taught dev from Queens with a museum-tech background.' },
    goals: { markdown: 'Land a frontend role at a values-aligned org by fall.' },
    learning_profile: { markdown: 'Likes worked examples followed by hands-on practice.' },
    learning_modality_preferences: { preferred: 'example_based' },
    competencies: {
      by_skill: {
        'write-structure-prompts': { evidence: [{ task_id: 1 }, { task_id: 2 }, { task_id: 3 }] },
        'evaluate-ai-critically': { evidence: [{ task_id: 4 }] },
      },
    },
    performance: {
      entries: [
        { date: '2026-06-01', summary: 'Strong remediation on prompt-structure task.' },
        { date: '2026-06-08', summary: 'Built a tight evaluator harness.' },
      ],
    },
    skill_levels: {
      'write-structure-prompts': 82,
      'evaluate-ai-critically': 67,
      'reason-about-models': 54,
    },
    prior_knowledge_by_skill: {},
    apply_accuracy_by_skill: {},
    onboarding_assessment: null,
    interview_themes: null,
  },
};

// The radar component filters out empty categories — give each of the 3 fake
// categories at least one skill so all 3 series render.
const FAKE_TAXONOMY = {
  categories: {
    ai: { name: 'AI Fluency' },
    swe: { name: 'Software Engineering' },
    pro: { name: 'Professionalism' },
  },
  skills: {
    'write-structure-prompts': { name: 'Write & Structure Prompts', slug: 'write-structure-prompts', category: 'ai' },
    'evaluate-ai-critically': { name: 'Evaluate AI Critically', slug: 'evaluate-ai-critically', category: 'ai' },
    'reason-about-models': { name: 'Reason About Models', slug: 'reason-about-models', category: 'ai' },
    'write-clean-code': { name: 'Write Clean Code', slug: 'write-clean-code', category: 'swe' },
    'communicate-effectively': { name: 'Communicate Effectively', slug: 'communicate-effectively', category: 'pro' },
  },
};

function renderUI() {
  return render(
    <MemoryRouter>
      <BuilderSnapshot embedded />
    </MemoryRouter>,
  );
}

// Route-aware fetch mock. The component fires TWO endpoints:
//   1. /api/admin/builder-profiles/:userId  → snapshot
//   2. /api/admin/prompts/skill-taxonomy    → taxonomy
// Tests configure each independently via setRoutes().
let routeHandlers = {};
const setRoutes = (handlers) => {
  routeHandlers = { ...routeHandlers, ...handlers };
};
const buildRouteFetch = () =>
  vi.fn().mockImplementation(async (url) => {
    if (url.includes('/api/admin/builder-profiles/')) {
      return routeHandlers.snapshot || {
        ok: true,
        status: 200,
        json: async () => FULL_SNAPSHOT,
      };
    }
    if (url.includes('/api/admin/prompts/v2-coach-engine')) {
      // Server wraps taxonomy under `skillTaxonomy` in the v2-coach-engine
      // bundle response. The client extracts data.skillTaxonomy.
      return routeHandlers.taxonomy || {
        ok: true,
        status: 200,
        json: async () => ({ skillTaxonomy: FAKE_TAXONOMY }),
      };
    }
    return { ok: false, status: 404, json: async () => ({}) };
  });

const okResponse = (body) => ({ ok: true, status: 200, json: async () => body });
const errResponse = (status, body = { error: 'fail' }) => ({
  ok: false,
  status,
  json: async () => body,
});

beforeEach(() => {
  currentSearch = '';
  routeHandlers = {};
  vi.clearAllMocks();
  searchUsers.mockResolvedValue({ results: [] });
  global.fetch = buildRouteFetch();
});

afterEach(() => {
  delete global.fetch;
});

describe('composeSummary (pure helper)', () => {
  it('combines background, goals, and top skills into one sentence', () => {
    const out = composeSummary(FULL_SNAPSHOT, FAKE_TAXONOMY);
    expect(out).toMatch(/Self-taught dev from Queens/);
    expect(out).toMatch(/Currently focused on/);
    expect(out).toMatch(/Write & Structure Prompts/);
  });

  it('falls back gracefully when only background is present', () => {
    const partial = { ...FULL_SNAPSHOT, profile: { background: FULL_SNAPSHOT.profile.background } };
    const out = composeSummary(partial, FAKE_TAXONOMY);
    expect(out).toContain('Self-taught dev from Queens');
    expect(out).not.toMatch(/Strengths in\s*\./);
  });

  it('returns a no-data placeholder when every field is empty', () => {
    expect(composeSummary({ profile: {} }, FAKE_TAXONOMY)).toBe('No summary available yet.');
  });
});

describe('BuilderSnapshot', () => {
  it('renders the user picker when no ?userId is in the URL', async () => {
    renderUI();
    expect(screen.getByLabelText(/search builders/i)).toBeInTheDocument();
    // No snapshot fetch should have fired — only the best-effort taxonomy fetch
    // (gated on auth + permission) MAY fire. Verify the inspector endpoint
    // hasn't been called.
    await waitFor(() => {
      const calls = global.fetch.mock.calls.map((c) => c[0]);
      expect(calls.find((u) => u.includes('/api/admin/builder-profiles/'))).toBeUndefined();
    });
  });

  it('fetches and renders the hero + name + cohort when ?userId is set', async () => {
    currentSearch = 'userId=42';
    renderUI();
    await waitFor(() => {
      expect(screen.getByText('Bea Builder')).toBeInTheDocument();
    });
    expect(screen.getByText(/March 2026 L1/)).toBeInTheDocument();
    // Background text appears in BOTH the hero summary AND the markdown card —
    // assert there's at least one occurrence (the summary).
    expect(screen.getAllByText(/Self-taught dev from Queens/).length).toBeGreaterThanOrEqual(1);
  });

  it('shows the silhouette placeholder when headshot_url is null', async () => {
    currentSearch = 'userId=42';
    setRoutes({
      snapshot: okResponse({ ...FULL_SNAPSHOT, headshot_url: null }),
    });
    const { container } = renderUI();
    await waitFor(() => {
      expect(screen.getByText('Bea Builder')).toBeInTheDocument();
    });
    // SVG silhouette is the fallback (matches AdminDashboard's BuilderDrawer
    // placeholder). No <img> tag should render for the headshot when URL is null.
    expect(container.querySelector('img[alt="Bea Builder"]')).toBeNull();
    expect(container.querySelector('svg[aria-hidden="true"]')).toBeTruthy();
  });

  it('renders one radar per skill category', async () => {
    currentSearch = 'userId=42';
    // FAKE_TAXONOMY has 3 categories — default route mock serves it.
    renderUI();
    await waitFor(() => {
      expect(screen.getAllByTestId('recharts-radar')).toHaveLength(3);
    });
    // Each category's chart renders its own <Radar /> series keyed by category.
    expect(screen.getByTestId('recharts-series-ai')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-series-swe')).toBeInTheDocument();
    expect(screen.getByTestId('recharts-series-pro')).toBeInTheDocument();
  });

  it('clicking a category card opens an enlarged radar dialog', async () => {
    currentSearch = 'userId=42';
    renderUI();
    await waitFor(() => {
      expect(screen.getAllByTestId('recharts-radar')).toHaveLength(3);
    });
    fireEvent.click(screen.getByRole('button', { name: /enlarge ai fluency radar/i }));
    // The dialog renders a 4th radar (the large one) plus the category title.
    await waitFor(() => {
      expect(screen.getAllByTestId('recharts-radar')).toHaveLength(4);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getAllByTestId('recharts-series-ai')).toHaveLength(2);
  });

  it('renders the themed sections with markdown content', async () => {
    currentSearch = 'userId=42';
    renderUI();
    await waitFor(() => {
      expect(screen.getByText('Bea Builder')).toBeInTheDocument();
    });
    // Background / Goals / Learning Style cards each render one markdown block.
    const markdownBlocks = screen.getAllByTestId('markdown');
    expect(markdownBlocks.length).toBeGreaterThanOrEqual(3);
  });

  it('shows an error card with a retry button on a 500 response', async () => {
    currentSearch = 'userId=42';
    setRoutes({ snapshot: errResponse(500, { error: 'boom' }) });
    renderUI();
    await waitFor(() => {
      expect(screen.getByText(/Something went wrong/i)).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /retry/i })).toBeInTheDocument();
  });

  it('shows a "Builder not found" message on 404 with no retry', async () => {
    currentSearch = 'userId=999';
    setRoutes({ snapshot: errResponse(404, { error: 'not found' }) });
    renderUI();
    // "Builder not found" renders in BOTH the heading AND the body paragraph,
    // so assert at least one match rather than exactly one.
    await waitFor(() => {
      expect(screen.getAllByText(/Builder not found/i).length).toBeGreaterThan(0);
    });
    expect(screen.queryByRole('button', { name: /retry/i })).not.toBeInTheDocument();
  });

  it('clicking "Back to search" clears userId and re-shows the picker', async () => {
    currentSearch = 'userId=42';
    renderUI();
    await waitFor(() => {
      expect(screen.getByText('Bea Builder')).toBeInTheDocument();
    });
    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: /back to search/i }));
      await Promise.resolve();
    });
    // After clearing, the search box should be the visible state.
    expect(screen.getByLabelText(/search builders/i)).toBeInTheDocument();
  });
});
