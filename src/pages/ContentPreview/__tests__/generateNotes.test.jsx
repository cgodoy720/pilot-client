import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ContentPreview from '../ContentPreview';
import useAuthStore from '../../../stores/authStore';
import axios from 'axios';

vi.mock('axios');

const mockSearchParams = new URLSearchParams();
const mockSetSearchParams = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useSearchParams: () => [mockSearchParams, mockSetSearchParams],
  };
});

vi.mock('sweetalert2', () => ({
  default: { fire: vi.fn().mockResolvedValue({ isConfirmed: false }) },
}));

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

vi.mock('../components/CohortDaySelector', () => ({
  default: ({ onCohortSelect, onDaySelect }) => (
    <div data-testid="cohort-day-selector">
      <button data-testid="select-cohort-btn" onClick={() => onCohortSelect({ cohort_name: 'Test Cohort', cohort_id: 1 })}>
        Select Cohort
      </button>
      <button data-testid="select-day-btn" onClick={() => onDaySelect({ id: 42, day_number: 5, day_date: '2025-06-15' })}>
        Select Day
      </button>
    </div>
  ),
}));

vi.mock('../components/CurriculumUploadDialog', () => ({ default: () => <div data-testid="upload-dialog" /> }));
vi.mock('../components/StaffControlsPanel', () => ({ default: () => <div data-testid="staff-controls" /> }));
vi.mock('../components/LearningPreview', () => ({ default: () => <div data-testid="learning-preview" /> }));
vi.mock('../../components/LoadingCurtain/LoadingCurtain', () => ({ default: () => <div data-testid="loading-curtain" /> }));
vi.mock('../../../components/curriculum/TaskCard', () => ({ default: ({ task }) => <div data-testid={`task-card-${task.id}`}>{task.task_title}</div> }));
vi.mock('../../../components/curriculum/TaskEditDialog', () => ({ default: () => <div data-testid="task-edit-dialog" /> }));
vi.mock('../../../components/curriculum/TaskCreateDialog', () => ({ default: () => <div data-testid="task-create-dialog" /> }));
vi.mock('../../../components/curriculum/FieldHistoryDialog', () => ({ default: () => <div data-testid="field-history-dialog" /> }));
vi.mock('../../../components/curriculum/MoveTaskDialog', () => ({ default: () => <div data-testid="move-task-dialog" /> }));
vi.mock('../../../components/curriculum/DayGoalEditor', () => ({ default: () => null }));

vi.mock('../../../hooks/usePermissions', () => ({
  usePermissions: () => ({
    canAccessPage: () => true,
    canUseFeature: () => true,
  }),
}));

vi.mock('jspdf', () => ({
  jsPDF: vi.fn().mockImplementation(() => ({
    internal: { pageSize: { getWidth: () => 612, getHeight: () => 792 } },
    setFontSize: vi.fn(),
    setFont: vi.fn(),
    setTextColor: vi.fn(),
    splitTextToSize: vi.fn().mockImplementation((text) => [text]),
    getTextWidth: vi.fn().mockImplementation((text) => text.length * 5),
    text: vi.fn(),
    addPage: vi.fn(),
    save: vi.fn(),
  })),
}));

const API_URL = 'http://localhost:4000';

const mockDayContent = {
  day: {
    id: 42,
    day_number: 5,
    day_date: '2025-06-15T00:00:00.000Z',
    daily_goal: 'Learn React hooks',
    weekly_goal: 'Complete React module',
    cohort: 'Test Cohort',
    week: 2,
    level: 'Foundations',
  },
  timeBlocks: [{ id: 1, start_time: '09:00', end_time: '10:00' }],
  flattenedTasks: [{ id: 101, task_title: 'Introduction to Hooks', block_id: 1, start_time: '09:00', end_time: '10:00' }],
};

describe('Generate Notes Button', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 1, role: 'staff', first_name: 'Test', email: 'test@pursuit.org', cohort: 'Test Cohort' },
      token: 'test-token',
      permissions: [],
      isAuthenticated: true,
    });

  });

  afterEach(() => {
    useAuthStore.setState(useAuthStore.getInitialState());
  });

  it('shows Generate Notes button after loading day content', async () => {
    axios.get.mockResolvedValue({ data: mockDayContent });

    render(
      <BrowserRouter>
        <ContentPreview />
      </BrowserRouter>
    );

    // Select cohort then day to trigger content load
    fireEvent.click(screen.getByTestId('select-cohort-btn'));
    fireEvent.click(screen.getByTestId('select-day-btn'));

    await waitFor(() => {
      expect(screen.getByText('Generate Notes')).toBeInTheDocument();
    });
  });

  it('calls API and generates PDF on click', async () => {
    axios.get.mockResolvedValue({ data: mockDayContent });
    axios.post.mockResolvedValue({
      data: { success: true, notes: 'Day 5 - Test Cohort\n\n9:00am - 10:00am: Intro\n\nFacilitator notes:\n- Welcome' },
    });

    const { toast } = await import('sonner');

    render(
      <BrowserRouter>
        <ContentPreview />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTestId('select-cohort-btn'));
    fireEvent.click(screen.getByTestId('select-day-btn'));

    await waitFor(() => {
      expect(screen.getByText('Generate Notes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate Notes'));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/api/content/generate-facilitator-notes-doc'),
        expect.objectContaining({ dayContent: expect.any(Object) }),
        expect.any(Object)
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Facilitator notes downloaded!');
    });
  });

  it('shows toast error when API call fails', async () => {
    axios.get.mockResolvedValue({ data: mockDayContent });
    axios.post.mockRejectedValue(new Error('Network error'));

    const { toast } = await import('sonner');

    render(
      <BrowserRouter>
        <ContentPreview />
      </BrowserRouter>
    );

    fireEvent.click(screen.getByTestId('select-cohort-btn'));
    fireEvent.click(screen.getByTestId('select-day-btn'));

    await waitFor(() => {
      expect(screen.getByText('Generate Notes')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Generate Notes'));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Failed to generate facilitator notes. Please try again.');
    });
  });
});
