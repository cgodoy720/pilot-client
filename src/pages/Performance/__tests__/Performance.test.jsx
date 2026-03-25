import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import Performance from '../Performance';

// Mock child components to isolate the cohort-gating logic
vi.mock('../components/AttendanceCalendar', () => ({
  default: () => <div data-testid="attendance-calendar">AttendanceCalendar</div>,
}));

vi.mock('../components/FeedbackInbox', () => ({
  default: (props) => (
    <div data-testid="feedback-inbox" data-user-id={props.userId}>
      FeedbackInbox
    </div>
  ),
}));

vi.mock('../components/WeeklyFeedbackReport', () => ({
  default: (props) => (
    <div data-testid="weekly-feedback-report" data-user-id={props.userId}>
      WeeklyFeedbackReport
    </div>
  ),
}));

vi.mock('../../../components/LoadingCurtain/LoadingCurtain', () => ({
  default: ({ isLoading }) =>
    isLoading ? <div data-testid="loading-curtain">Loading...</div> : null,
}));

// Mock service calls so they don't fire real requests
vi.mock('../../../utils/attendanceService', () => ({
  fetchUserAttendance: vi.fn().mockResolvedValue({ attendance: [], programInfo: null }),
}));

vi.mock('../../../utils/performanceFeedbackService', () => ({
  fetchCombinedFeedback: vi.fn().mockResolvedValue([]),
}));

vi.mock('../../../utils/userPhotoService', () => ({
  getUserProfilePhoto: vi.fn().mockResolvedValue('/assets/default-avatar.png'),
}));

const renderPerformance = (storeOverrides = {}) => {
  const defaultUser = {
    user_id: 279,
    firstName: 'Carlos',
    lastName: 'Godoy',
    role: 'builder',
    cohort: 'March 2026 L1',
    active: true,
  };

  useAuthStore.setState({
    user: defaultUser,
    token: 'test-token',
    isAuthenticated: true,
    isLoading: false,
    _hasHydrated: true,
    ...storeOverrides,
  });

  return render(
    <MemoryRouter initialEntries={['/performance']}>
      <Performance />
    </MemoryRouter>
  );
};

describe('Performance page — cohort gating', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders WeeklyFeedbackReport for March 2026 L1 builder', async () => {
    renderPerformance({
      user: {
        user_id: 279,
        firstName: 'Carlos',
        lastName: 'Godoy',
        role: 'builder',
        cohort: 'March 2026 L1',
        active: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('weekly-feedback-report')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('feedback-inbox')).not.toBeInTheDocument();
    expect(screen.getByTestId('attendance-calendar')).toBeInTheDocument();
  });

  it('renders FeedbackInbox for January 2026 L2 builder', async () => {
    renderPerformance({
      user: {
        user_id: 101,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'builder',
        cohort: 'January 2026 L2',
        active: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('feedback-inbox')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('weekly-feedback-report')).not.toBeInTheDocument();
    expect(screen.getByTestId('attendance-calendar')).toBeInTheDocument();
  });

  it('renders FeedbackInbox for December 2025 L1 builder', async () => {
    renderPerformance({
      user: {
        user_id: 55,
        firstName: 'Alex',
        lastName: 'Lee',
        role: 'builder',
        cohort: 'December 2025 L1',
        active: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('feedback-inbox')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('weekly-feedback-report')).not.toBeInTheDocument();
  });

  it('does NOT show WeeklyFeedbackReport for a similar but different cohort name', async () => {
    renderPerformance({
      user: {
        user_id: 200,
        firstName: 'Bob',
        lastName: 'Jones',
        role: 'builder',
        cohort: 'March 2026 L2',
        active: true,
      },
    });

    await waitFor(() => {
      expect(screen.getByTestId('feedback-inbox')).toBeInTheDocument();
    });

    expect(screen.queryByTestId('weekly-feedback-report')).not.toBeInTheDocument();
  });

  it('passes correct userId to the rendered right-panel component', async () => {
    // March 2026 L1 builder
    const { unmount } = renderPerformance({
      user: {
        user_id: 279,
        firstName: 'Carlos',
        lastName: 'Godoy',
        role: 'builder',
        cohort: 'March 2026 L1',
        active: true,
      },
    });

    await waitFor(() => {
      const report = screen.getByTestId('weekly-feedback-report');
      expect(report).toHaveAttribute('data-user-id', '279');
    });

    unmount();

    // Different cohort builder
    renderPerformance({
      user: {
        user_id: 101,
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'builder',
        cohort: 'January 2026 L2',
        active: true,
      },
    });

    await waitFor(() => {
      const inbox = screen.getByTestId('feedback-inbox');
      expect(inbox).toHaveAttribute('data-user-id', '101');
    });
  });
});
