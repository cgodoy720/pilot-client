import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import Swal from 'sweetalert2';
import PathfinderProjects from '../PathfinderProjects';

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({}) },
}));

vi.mock('canvas-confetti', () => ({
  default: vi.fn(),
}));

// One project sitting in "planning" with a PRD link. prd_approved is intentionally
// FALSE here to simulate the stale-client-state bug: staff approved the PRD on the
// server after this list was fetched, but the local copy still says not-approved.
const STALE_PROJECT = {
  project_id: 1,
  builder_id: 279,
  project_name: 'Stale Approval App',
  stage: 'planning',
  target_date: '2026-07-01T00:00:00.000Z',
  prd_link: 'https://docs.google.com/document/d/prd',
  prd_submitted: true,
  prd_approved: false, // stale — server says approved
  launch_checklist: null,
};

let putCalls = [];

const installFetchMock = (projects) => {
  putCalls = [];
  global.fetch = vi.fn((url, opts = {}) => {
    const u = String(url);
    const method = opts.method || 'GET';

    if (/\/api\/pathfinder\/projects\/\d+$/.test(u) && method === 'PUT') {
      const body = JSON.parse(opts.body);
      putCalls.push({ url: u, body });
      return Promise.resolve({
        ok: true,
        json: async () => ({ ...projects[0], stage: body.stage }),
      });
    }
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
  // Render and drain the detached mount fetches (fetchProjects + fetchAvailableJobs)
  // inside act() so their state updates don't escape the act() boundary.
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

// Find the kanban column whose header label matches, then return the droppable
// container (the element carrying the onDrop handler). Headers are unique per stage.
const columnHeader = (label) => screen.getByRole('heading', { name: label });

const makeDataTransfer = () => ({ setData: vi.fn(), effectAllowed: '', dropEffect: '' });

// Drive a full drag→drop and let the async handler (PUT + success toast + the
// detached, non-awaited fetchProjects refetch) fully settle inside act(), so no
// state update escapes the act() boundary and assertions can run synchronously.
const dragCardToColumn = async (cardText, columnLabel) => {
  const card = screen.getByText(cardText);
  const dt = makeDataTransfer();
  fireEvent.dragStart(card, { dataTransfer: dt });
  await act(async () => {
    fireEvent.drop(columnHeader(columnLabel), { dataTransfer: dt });
    for (let i = 0; i < 20; i++) await Promise.resolve();
  });
};

describe('PathfinderProjects — kanban stage moves are server-authoritative', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState());
    vi.restoreAllMocks();
  });

  it('moves a stale-not-approved card into Development by asking the server (no client-side block)', async () => {
    installFetchMock([STALE_PROJECT]);
    await renderBoard();

    await waitFor(() => expect(screen.getByText('Stale Approval App')).toBeInTheDocument());

    await dragCardToColumn('Stale Approval App', 'Development');

    // The fix: the client PUTs to the server instead of blocking on stale local state.
    expect(putCalls).toHaveLength(1);
    expect(putCalls[0].url).toMatch(/\/api\/pathfinder\/projects\/1$/);
    expect(putCalls[0].body).toEqual({ stage: 'development' });

    // No spurious "PRD Approval Required" warning was shown client-side.
    const warned = Swal.fire.mock.calls.some(
      ([arg]) => arg && arg.title === 'PRD Approval Required',
    );
    expect(warned).toBe(false);
  });

  it('allows skipping stages (planning -> testing) — the no-skip rule is gone', async () => {
    installFetchMock([STALE_PROJECT]);
    await renderBoard();

    await waitFor(() => expect(screen.getByText('Stale Approval App')).toBeInTheDocument());

    await dragCardToColumn('Stale Approval App', 'Testing');

    expect(putCalls).toHaveLength(1);
    expect(putCalls[0].body).toEqual({ stage: 'testing' });

    const warned = Swal.fire.mock.calls.some(
      ([arg]) => arg && (arg.title === 'Cannot Skip Stages'),
    );
    expect(warned).toBe(false);
  });

  it('surfaces the server\'s requiresApproval response as a warning when the server rejects', async () => {
    putCalls = [];
    global.fetch = vi.fn((url, opts = {}) => {
      const u = String(url);
      const method = opts.method || 'GET';
      if (/\/api\/pathfinder\/projects\/\d+$/.test(u) && method === 'PUT') {
        putCalls.push({ url: u, body: JSON.parse(opts.body) });
        return Promise.resolve({
          ok: false,
          json: async () => ({ error: 'PRD must be approved before moving to development', requiresApproval: true }),
        });
      }
      if (u.endsWith('/api/pathfinder/projects') && method === 'GET') {
        return Promise.resolve({ ok: true, json: async () => [{ ...STALE_PROJECT, prd_link: null }] });
      }
      if (u.includes('/api/pathfinder/applications')) {
        return Promise.resolve({ ok: true, json: async () => [] });
      }
      return Promise.resolve({ ok: true, json: async () => [] });
    });
    await renderBoard();

    await waitFor(() => expect(screen.getByText('Stale Approval App')).toBeInTheDocument());

    await dragCardToColumn('Stale Approval App', 'Development');

    expect(putCalls).toHaveLength(1);
    expect(
      Swal.fire.mock.calls.some(([arg]) => arg && arg.title === 'PRD Approval Required'),
    ).toBe(true);
  });
});
