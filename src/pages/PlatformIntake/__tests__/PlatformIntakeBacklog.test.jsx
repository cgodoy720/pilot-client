import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import PlatformIntakeBacklog from '../PlatformIntakeBacklog';
import useAuthStore from '../../../stores/authStore';

vi.mock('../../../services/platformIntakeService', () => ({
  fetchAllSubmissions: vi.fn(),
}));

vi.mock('../../../components/Layout/Layout', () => ({
  default: ({ children }) => <div data-testid="layout">{children}</div>,
}));

const { fetchAllSubmissions } = await import('../../../services/platformIntakeService');

const MOCK_SUBMISSIONS = [
  {
    id: '1',
    type: 'bug',
    title: 'Login broken',
    description: 'Cannot login with valid credentials',
    reporter: 'Alice',
    reporter_email: 'alice@test.com',
    platform_component: 'Dashboard',
    recommended_prioritization: 'urgent',
    prioritization_justification: 'Blocks all users',
    upload_url: 'gs://bucket/file.png',
    status: 'open',
    created_at: '2026-03-20T12:00:00Z',
  },
  {
    id: '2',
    type: 'feature',
    title: 'Add dark mode',
    description: 'Users want dark mode',
    reporter: 'Bob',
    reporter_email: 'bob@test.com',
    platform_component: 'Learning / Curriculum',
    recommended_prioritization: 'low',
    prioritization_justification: 'Nice to have',
    upload_url: null,
    status: 'open',
    created_at: '2026-03-19T12:00:00Z',
  },
];

const renderComponent = () =>
  render(
    <BrowserRouter>
      <PlatformIntakeBacklog />
    </BrowserRouter>
  );

describe('PlatformIntakeBacklog', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { first_name: 'Admin', last_name: 'User', email: 'admin@pursuit.org', role: 'admin' },
      token: 'test-token',
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState());
  });

  it('renders submissions after loading', async () => {
    fetchAllSubmissions.mockResolvedValue(MOCK_SUBMISSIONS);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Login broken')).toBeInTheDocument();
      expect(screen.getByText('Add dark mode')).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    fetchAllSubmissions.mockReturnValue(new Promise(() => {})); // never resolves
    renderComponent();

    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('shows error state on fetch failure', async () => {
    fetchAllSubmissions.mockRejectedValue(new Error('Network error'));
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('filters by type', async () => {
    fetchAllSubmissions.mockResolvedValue(MOCK_SUBMISSIONS);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Login broken')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Bug' }));

    expect(screen.getByText('Login broken')).toBeInTheDocument();
    expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Feature' }));

    expect(screen.queryByText('Login broken')).not.toBeInTheDocument();
    expect(screen.getByText('Add dark mode')).toBeInTheDocument();
  });

  it('filters by priority', async () => {
    fetchAllSubmissions.mockResolvedValue(MOCK_SUBMISSIONS);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Login broken')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Urgent' }));

    expect(screen.getByText('Login broken')).toBeInTheDocument();
    expect(screen.queryByText('Add dark mode')).not.toBeInTheDocument();
  });

  it('expands submission to show details', async () => {
    fetchAllSubmissions.mockResolvedValue(MOCK_SUBMISSIONS);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText('Login broken')).toBeInTheDocument();
    });

    // Click to expand
    fireEvent.click(screen.getByText('Login broken'));

    await waitFor(() => {
      expect(screen.getByText('Cannot login with valid credentials')).toBeInTheDocument();
      expect(screen.getByText('Blocks all users')).toBeInTheDocument();
    });
  });

  it('shows empty state when no submissions match filters', async () => {
    fetchAllSubmissions.mockResolvedValue([]);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText(/No submissions match/)).toBeInTheDocument();
    });
  });
});
