import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import useAuthStore from '@/stores/authStore';
import Performance from '../Performance';

vi.mock('../components/AttendanceCalendar', () => ({
  default: () => <div data-testid="attendance-calendar">AttendanceCalendar</div>,
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

vi.mock('../../../utils/attendanceService', () => ({
  fetchUserAttendance: vi.fn().mockResolvedValue({ attendance: [], programInfo: null }),
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

describe('Performance page — right panel', () => {
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
    expect(screen.getByTestId('attendance-calendar')).toBeInTheDocument();
  });

  it('renders WeeklyFeedbackReport for January 2026 L2 builder', async () => {
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
      expect(screen.getByTestId('weekly-feedback-report')).toBeInTheDocument();
    });
  });

  it('renders WeeklyFeedbackReport for December 2025 L1 builder', async () => {
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
      expect(screen.getByTestId('weekly-feedback-report')).toBeInTheDocument();
    });
  });

  it('renders WeeklyFeedbackReport for March 2026 L2 builder', async () => {
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
      expect(screen.getByTestId('weekly-feedback-report')).toBeInTheDocument();
    });
  });

  it('passes correct userId to WeeklyFeedbackReport regardless of cohort', async () => {
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
      const report = screen.getByTestId('weekly-feedback-report');
      expect(report).toHaveAttribute('data-user-id', '101');
    });
  });
});
