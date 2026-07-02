import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import PathfinderProjects from '../PathfinderProjects';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({}) },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// A project that is approved on the server but has no approver_first_name returned
// (e.g. the JOIN wasn't included or the approver row is missing). The bug: the
// kanban card checked `prd_approved && approver_first_name`, so a null/undefined
// approver_first_name caused the card to fall through to "Pending Approval" even
// though prd_approved is true.
const APPROVED_NO_APPROVER_NAME = {
  project_id: 2,
  builder_id: 279,
  project_name: 'Approved No Approver Name App',
  stage: 'planning',
  target_date: '2026-07-01T00:00:00.000Z',
  prd_link: 'https://docs.google.com/document/d/prd2',
  prd_submitted: true,
  prd_approved: true,        // server says approved
  approver_first_name: null, // but the JOIN produced no name
  approver_last_name: null,
  launch_checklist: null,
};

const installFetchMock = (projects) => {
  global.fetch = vi.fn((url, opts = {}) => {
    const u = String(url);
    const method = opts.method || 'GET';
    if (u.endsWith('/api/pathfinder/projects') && method === 'GET') {
      return Promise.resolve({ ok: true, json: async () => projects });
    }
    if (u.includes('/api/pathfinder/applications')) {
      return Promise.resolve({ ok: true, json: async () => [] });
    }
    return Promise.resolve({ ok: true, json: async () => [] });
  });
};

const renderBoard = async () => {
  useAuthStore.setState({
    user: { user_id: 279, firstName: 'Carlos', role: 'builder', cohort: 'March 2026 L1', active: true },
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    _hasHydrated: true,
  });
  let utils;
  await act(async () => {
    utils = render(
      <MemoryRouter initialEntries={['/pathfinder/projects']}>
        <PathfinderProjects />
      </MemoryRouter>,
    );
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
  return utils;
};

describe('PathfinderProjects — PRD approval status on kanban card', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState());
    vi.restoreAllMocks();
  });

  it('shows "Approved" on the card when prd_approved is true even if approver_first_name is null', async () => {
    installFetchMock([APPROVED_NO_APPROVER_NAME]);
    await renderBoard();

    await waitFor(() =>
      expect(screen.getByText('Approved No Approver Name App')).toBeInTheDocument(),
    );

    // The card should display the approved indicator, not "Pending Approval"
    expect(screen.queryByText('Pending Approval')).not.toBeInTheDocument();
    // The ✓ approved indicator should be present
    expect(screen.getByText(/✓/)).toBeInTheDocument();
  });
});
