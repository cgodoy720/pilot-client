import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import DayGoalEditor from '../DayGoalEditor';

// Mock sonner toast
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock lucide-react icons
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

// Default props factory
const createProps = (overrides = {}) => ({
  open: true,
  onOpenChange: vi.fn(),
  day: {
    id: 42,
    day_date: '2025-06-15T00:00:00.000Z',
    week: 3,
    daily_goal: 'Learn React hooks',
    weekly_goal: 'Complete React module',
  },
  week: null,
  onSave: vi.fn().mockResolvedValue(undefined),
  onViewFieldHistory: vi.fn(),
  canEdit: true,
  ...overrides,
});

describe('DayGoalEditor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Rendering', () => {
    it('should render the dialog when open', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByText('Edit Day Info')).toBeInTheDocument();
      expect(screen.getByText('Update the day date, week, and learning goals')).toBeInTheDocument();
    });

    it('should show "View Day Info" title when canEdit is false', () => {
      render(<DayGoalEditor {...createProps({ canEdit: false })} />);

      expect(screen.getByText('View Day Info')).toBeInTheDocument();
      expect(screen.getByText('Day info (read-only)')).toBeInTheDocument();
    });

    it('should render the date field', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Day Date')).toBeInTheDocument();
    });

    it('should render the week field', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Week')).toBeInTheDocument();
    });

    it('should render the daily goal field', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Daily Goal')).toBeInTheDocument();
    });

    it('should render the weekly goal field', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Weekly Goal')).toBeInTheDocument();
    });

    it('should show "Save Changes" button label', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByText('Save Changes')).toBeInTheDocument();
      expect(screen.queryByText('Save Goals')).not.toBeInTheDocument();
    });

    it('should not show save button when canEdit is false', () => {
      render(<DayGoalEditor {...createProps({ canEdit: false })} />);

      expect(screen.queryByText('Save Changes')).not.toBeInTheDocument();
    });
  });

  describe('Date Field', () => {
    it('should pre-fill the date from day.day_date', () => {
      render(<DayGoalEditor {...createProps()} />);

      const dateInput = screen.getByLabelText('Day Date');
      expect(dateInput).toHaveValue('2025-06-15');
    });

    it('should handle ISO date strings with time component', () => {
      const props = createProps({
        day: {
          id: 42,
          day_date: '2025-12-25T05:00:00.000Z',
          daily_goal: '',
          weekly_goal: '',
        },
      });
      render(<DayGoalEditor {...props} />);

      const dateInput = screen.getByLabelText('Day Date');
      expect(dateInput).toHaveValue('2025-12-25');
    });

    it('should handle missing day_date gracefully', () => {
      const props = createProps({
        day: { id: 42, day_date: null, daily_goal: '', weekly_goal: '' },
      });
      render(<DayGoalEditor {...props} />);

      const dateInput = screen.getByLabelText('Day Date');
      expect(dateInput).toHaveValue('');
    });

    it('should be disabled when canEdit is false', () => {
      render(<DayGoalEditor {...createProps({ canEdit: false })} />);

      const dateInput = screen.getByLabelText('Day Date');
      expect(dateInput).toBeDisabled();
    });

    it('should allow changing the date', () => {
      render(<DayGoalEditor {...createProps()} />);

      const dateInput = screen.getByLabelText('Day Date');
      fireEvent.change(dateInput, { target: { value: '2025-07-20' } });

      expect(dateInput).toHaveValue('2025-07-20');
    });

    it('should show helper text for the date field', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByText('The calendar date for this curriculum day')).toBeInTheDocument();
    });
  });

  describe('Week Field', () => {
    it('should pre-fill the week from day.week', () => {
      render(<DayGoalEditor {...createProps()} />);

      const weekInput = screen.getByLabelText('Week');
      expect(weekInput).toHaveValue(3);
    });

    it('should handle missing week gracefully', () => {
      const props = createProps({
        day: { id: 42, day_date: '2025-06-15T00:00:00.000Z', week: null, daily_goal: '', weekly_goal: '' },
      });
      render(<DayGoalEditor {...props} />);

      const weekInput = screen.getByLabelText('Week');
      expect(weekInput).toHaveValue(null);
    });

    it('should handle undefined week gracefully', () => {
      const props = createProps({
        day: { id: 42, day_date: '2025-06-15T00:00:00.000Z', daily_goal: '', weekly_goal: '' },
      });
      render(<DayGoalEditor {...props} />);

      const weekInput = screen.getByLabelText('Week');
      expect(weekInput).toHaveValue(null);
    });

    it('should be disabled when canEdit is false', () => {
      render(<DayGoalEditor {...createProps({ canEdit: false })} />);

      const weekInput = screen.getByLabelText('Week');
      expect(weekInput).toBeDisabled();
    });

    it('should allow changing the week number', () => {
      render(<DayGoalEditor {...createProps()} />);

      const weekInput = screen.getByLabelText('Week');
      fireEvent.change(weekInput, { target: { value: '5' } });

      expect(weekInput).toHaveValue(5);
    });

    it('should show helper text for the week field', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByText('The week number this day belongs to (used for ordering and grouping)')).toBeInTheDocument();
    });

    it('should have min value of 1', () => {
      render(<DayGoalEditor {...createProps()} />);

      const weekInput = screen.getByLabelText('Week');
      expect(weekInput).toHaveAttribute('min', '1');
    });
  });

  describe('Goals Fields', () => {
    it('should pre-fill daily goal from day prop', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Daily Goal')).toHaveValue('Learn React hooks');
    });

    it('should pre-fill weekly goal from day prop', () => {
      render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Weekly Goal')).toHaveValue('Complete React module');
    });

    it('should prefer week.weeklyGoal over day.weekly_goal', () => {
      const props = createProps({
        week: { weeklyGoal: 'Week override goal' },
      });
      render(<DayGoalEditor {...props} />);

      expect(screen.getByLabelText('Weekly Goal')).toHaveValue('Week override goal');
    });

    it('should allow editing daily goal', () => {
      render(<DayGoalEditor {...createProps()} />);

      const dailyGoalInput = screen.getByLabelText('Daily Goal');
      fireEvent.change(dailyGoalInput, { target: { value: 'New daily goal' } });

      expect(dailyGoalInput).toHaveValue('New daily goal');
    });
  });

  describe('Save Functionality', () => {
    it('should send day_date in the save payload', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      render(<DayGoalEditor {...createProps({ onSave: mockSave })} />);

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith({
          day_date: '2025-06-15',
          week: 3,
          daily_goal: 'Learn React hooks',
          weekly_goal: 'Complete React module',
        });
      });
    });

    it('should send updated day_date after changing the date', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      render(<DayGoalEditor {...createProps({ onSave: mockSave })} />);

      const dateInput = screen.getByLabelText('Day Date');
      fireEvent.change(dateInput, { target: { value: '2025-08-01' } });

      const saveButton = screen.getByText('Save Changes');
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(
          expect.objectContaining({ day_date: '2025-08-01' })
        );
      });
    });

    it('should send updated week after changing the week', async () => {
      const mockSave = vi.fn().mockResolvedValue(undefined);
      render(<DayGoalEditor {...createProps({ onSave: mockSave })} />);

      const weekInput = screen.getByLabelText('Week');
      fireEvent.change(weekInput, { target: { value: '7' } });

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockSave).toHaveBeenCalledWith(
          expect.objectContaining({ week: 7 })
        );
      });
    });

    it('should close dialog after successful save', async () => {
      const mockOnOpenChange = vi.fn();
      render(
        <DayGoalEditor
          {...createProps({ onOpenChange: mockOnOpenChange })}
        />
      );

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it('should show saving state while save is in progress', async () => {
      let resolveSave;
      const mockSave = vi.fn(
        () => new Promise((resolve) => { resolveSave = resolve; })
      );
      render(<DayGoalEditor {...createProps({ onSave: mockSave })} />);

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(screen.getByText('Saving...')).toBeInTheDocument();
      });

      resolveSave();

      await waitFor(() => {
        expect(screen.queryByText('Saving...')).not.toBeInTheDocument();
      });
    });

    it('should handle save failure gracefully', async () => {
      const { toast } = await import('sonner');
      const mockSave = vi.fn().mockRejectedValue(new Error('Save failed'));
      render(<DayGoalEditor {...createProps({ onSave: mockSave })} />);

      fireEvent.click(screen.getByText('Save Changes'));

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to save goals');
      });
    });
  });

  describe('History Buttons', () => {
    it('should have a History button for each field', () => {
      render(<DayGoalEditor {...createProps()} />);

      const historyButtons = screen.getAllByText('History');
      // 4 history buttons: day_date, week, daily_goal, weekly_goal
      expect(historyButtons).toHaveLength(4);
    });

    it('should call onViewFieldHistory with day_date when date History is clicked', () => {
      const mockViewHistory = vi.fn();
      render(
        <DayGoalEditor
          {...createProps({ onViewFieldHistory: mockViewHistory })}
        />
      );

      // The first History button is for day_date (it appears first in the DOM)
      const historyButtons = screen.getAllByText('History');
      fireEvent.click(historyButtons[0]);

      expect(mockViewHistory).toHaveBeenCalledWith('day_date', 'curriculum_day', 42);
    });

    it('should call onViewFieldHistory with week when week History is clicked', () => {
      const mockViewHistory = vi.fn();
      render(
        <DayGoalEditor
          {...createProps({ onViewFieldHistory: mockViewHistory })}
        />
      );

      const historyButtons = screen.getAllByText('History');
      fireEvent.click(historyButtons[1]);

      expect(mockViewHistory).toHaveBeenCalledWith('week', 'curriculum_day', 42);
    });

    it('should call onViewFieldHistory with daily_goal when daily goal History is clicked', () => {
      const mockViewHistory = vi.fn();
      render(
        <DayGoalEditor
          {...createProps({ onViewFieldHistory: mockViewHistory })}
        />
      );

      const historyButtons = screen.getAllByText('History');
      fireEvent.click(historyButtons[2]);

      expect(mockViewHistory).toHaveBeenCalledWith('daily_goal', 'curriculum_day', 42);
    });

    it('should call onViewFieldHistory with weekly_goal when weekly goal History is clicked', () => {
      const mockViewHistory = vi.fn();
      render(
        <DayGoalEditor
          {...createProps({ onViewFieldHistory: mockViewHistory })}
        />
      );

      const historyButtons = screen.getAllByText('History');
      fireEvent.click(historyButtons[3]);

      expect(mockViewHistory).toHaveBeenCalledWith('weekly_goal', 'curriculum_day', 42);
    });
  });

  describe('Cancel Button', () => {
    it('should close the dialog when Cancel is clicked', () => {
      const mockOnOpenChange = vi.fn();
      render(
        <DayGoalEditor
          {...createProps({ onOpenChange: mockOnOpenChange })}
        />
      );

      fireEvent.click(screen.getByText('Cancel'));

      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  describe('State Reset on Day Change', () => {
    it('should update form data when day prop changes', () => {
      const { rerender } = render(<DayGoalEditor {...createProps()} />);

      expect(screen.getByLabelText('Day Date')).toHaveValue('2025-06-15');

      const newProps = createProps({
        day: {
          id: 99,
          day_date: '2025-09-01T00:00:00.000Z',
          week: 8,
          daily_goal: 'New goal',
          weekly_goal: 'New weekly',
        },
      });
      rerender(<DayGoalEditor {...newProps} />);

      expect(screen.getByLabelText('Day Date')).toHaveValue('2025-09-01');
      expect(screen.getByLabelText('Week')).toHaveValue(8);
      expect(screen.getByLabelText('Daily Goal')).toHaveValue('New goal');
      expect(screen.getByLabelText('Weekly Goal')).toHaveValue('New weekly');
    });
  });
});
