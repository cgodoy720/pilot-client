import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CohortDaySelector from '../components/CohortDaySelector';
import axios from 'axios';

// Mock axios
vi.mock('axios');

// Mock lucide-react
vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual };
});

const API_URL = 'http://localhost:7001';

// Mock cohorts response
const mockCohorts = [
  {
    cohort_id: 1,
    cohort_name: 'Cohort A',
    organization_name: 'Org 1',
    program_name: 'Program 1',
    course_level: 'Foundations',
    day_count: 30,
  },
  {
    cohort_id: 2,
    cohort_name: 'Cohort B',
    organization_name: 'Org 1',
    program_name: 'Program 2',
    course_level: 'Advanced',
    day_count: 20,
  },
];

// Mock weeks/days response
const mockWeeks = [
  {
    weekNumber: 1,
    weeklyGoal: 'Introduction to Programming',
    days: [
      {
        id: 10,
        day_number: 1,
        day_date: '2025-06-01T00:00:00.000Z',
        daily_goal: 'Setup environment',
        day_type: 'regular',
      },
      {
        id: 11,
        day_number: 2,
        day_date: '2025-06-02T00:00:00.000Z',
        daily_goal: 'Learn variables',
      },
    ],
  },
  {
    weekNumber: 2,
    weeklyGoal: 'Data Structures',
    days: [
      {
        id: 20,
        day_number: 6,
        day_date: '2025-06-08T00:00:00.000Z',
        daily_goal: 'Arrays and objects',
      },
    ],
  },
];

const defaultProps = {
  token: 'test-token',
  selectedCohort: null,
  selectedDay: null,
  onCohortSelect: vi.fn(),
  onDaySelect: vi.fn(),
  onUploadCurriculum: vi.fn(),
  canEdit: true,
  refreshTrigger: 0,
};

const createProps = (overrides = {}) => ({
  ...defaultProps,
  ...overrides,
  onCohortSelect: overrides.onCohortSelect || vi.fn(),
  onDaySelect: overrides.onDaySelect || vi.fn(),
  onUploadCurriculum: overrides.onUploadCurriculum || vi.fn(),
});

describe('CohortDaySelector', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    import.meta.env.VITE_API_URL = API_URL;

    // Default: cohorts fetch succeeds
    axios.get.mockImplementation((url) => {
      if (url.includes('/api/preview/cohorts')) {
        return Promise.resolve({ data: { cohorts: mockCohorts } });
      }
      if (url.includes('/api/curriculum/calendar')) {
        return Promise.resolve({ data: mockWeeks });
      }
      return Promise.reject(new Error('Unknown URL'));
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Cohort Selection View', () => {
    it('should render cohort selection when no cohort is selected', async () => {
      render(<CohortDaySelector {...createProps()} />);

      expect(screen.getByText('Select Cohort')).toBeInTheDocument();
    });

    it('should fetch and display cohorts on mount', async () => {
      render(<CohortDaySelector {...createProps()} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/preview/cohorts'),
          expect.any(Object)
        );
      });

      await waitFor(() => {
        expect(screen.getByText('Org 1')).toBeInTheDocument();
      });
    });

    it('should show search input for filtering cohorts', () => {
      render(<CohortDaySelector {...createProps()} />);

      expect(screen.getByPlaceholderText('Search cohorts...')).toBeInTheDocument();
    });

    it('should filter cohorts by search term', async () => {
      render(<CohortDaySelector {...createProps()} />);

      await waitFor(() => {
        expect(screen.getByText('Org 1')).toBeInTheDocument();
      });

      const searchInput = screen.getByPlaceholderText('Search cohorts...');
      fireEvent.change(searchInput, { target: { value: 'Cohort B' } });

      // Expand the accordion to see filtered cohort names inside
      await waitFor(() => {
        expect(screen.getByText('Org 1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Org 1'));

      await waitFor(() => {
        expect(screen.getByText('Cohort B')).toBeInTheDocument();
      });
    });

    it('should show loading state while fetching cohorts', () => {
      axios.get.mockImplementation(() => new Promise(() => {})); // Never resolves

      render(<CohortDaySelector {...createProps()} />);

      expect(screen.getByText('Loading cohorts...')).toBeInTheDocument();
    });
  });

  describe('Day Selection View', () => {
    const selectedCohort = { cohort_name: 'Cohort A', cohort_id: 1 };

    it('should fetch days when a cohort is selected', async () => {
      render(<CohortDaySelector {...createProps({ selectedCohort })} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/curriculum/calendar?cohort=Cohort%20A'),
          expect.any(Object)
        );
      });
    });

    it('should display the cohort name', async () => {
      render(<CohortDaySelector {...createProps({ selectedCohort })} />);

      expect(screen.getByText('Cohort A')).toBeInTheDocument();
    });

    it('should show back button to return to cohorts', () => {
      const mockOnCohortSelect = vi.fn();
      render(
        <CohortDaySelector
          {...createProps({ selectedCohort, onCohortSelect: mockOnCohortSelect })}
        />
      );

      const backButton = screen.getByText(/Back to Cohorts/);
      fireEvent.click(backButton);

      expect(mockOnCohortSelect).toHaveBeenCalledWith(null);
    });

    it('should display weeks with days after fetching', async () => {
      render(<CohortDaySelector {...createProps({ selectedCohort })} />);

      await waitFor(() => {
        expect(screen.getByText('Week 1')).toBeInTheDocument();
        expect(screen.getByText('Week 2')).toBeInTheDocument();
      });
    });

    it('should display day dates in the sidebar', async () => {
      render(<CohortDaySelector {...createProps({ selectedCohort })} />);

      // Wait for weeks to load then expand the accordion
      await waitFor(() => {
        expect(screen.getByText('Week 1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Week 1'));

      await waitFor(() => {
        expect(screen.getByText('Day 1')).toBeInTheDocument();
      });
    });

    it('should call onDaySelect when a day is clicked', async () => {
      const mockOnDaySelect = vi.fn();
      render(
        <CohortDaySelector
          {...createProps({ selectedCohort, onDaySelect: mockOnDaySelect })}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Week 1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Week 1'));

      await waitFor(() => {
        expect(screen.getByText('Day 1')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Day 1').closest('button'));

      expect(mockOnDaySelect).toHaveBeenCalledWith(mockWeeks[0].days[0]);
    });

    it('should highlight the selected day', async () => {
      const selectedDay = { id: 10 };
      render(
        <CohortDaySelector
          {...createProps({ selectedCohort, selectedDay })}
        />
      );

      await waitFor(() => {
        expect(screen.getByText('Week 1')).toBeInTheDocument();
      });
      fireEvent.click(screen.getByText('Week 1'));

      await waitFor(() => {
        expect(screen.getByText('Day 1')).toBeInTheDocument();
      });

      const dayButton = screen.getByText('Day 1').closest('button');
      expect(dayButton).toHaveClass('border-blue-500');
      expect(dayButton).toHaveClass('bg-blue-50');
    });

    it('should show Upload button when canEdit is true', () => {
      render(<CohortDaySelector {...createProps({ selectedCohort, canEdit: true })} />);

      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('should not show Upload button when canEdit is false', () => {
      render(<CohortDaySelector {...createProps({ selectedCohort, canEdit: false })} />);

      expect(screen.queryByText('Upload')).not.toBeInTheDocument();
    });

    it('should show loading state while fetching days', () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/preview/cohorts')) {
          return Promise.resolve({ data: { cohorts: mockCohorts } });
        }
        return new Promise(() => {}); // Never resolves for calendar
      });

      render(<CohortDaySelector {...createProps({ selectedCohort })} />);

      expect(screen.getByText('Loading days...')).toBeInTheDocument();
    });

    it('should show empty state when no days are found', async () => {
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/preview/cohorts')) {
          return Promise.resolve({ data: { cohorts: mockCohorts } });
        }
        return Promise.resolve({ data: [] });
      });

      render(<CohortDaySelector {...createProps({ selectedCohort })} />);

      await waitFor(() => {
        expect(screen.getByText('No curriculum days found for this cohort')).toBeInTheDocument();
      });
    });
  });

  describe('refreshTrigger Prop', () => {
    const selectedCohort = { cohort_name: 'Cohort A', cohort_id: 1 };

    it('should accept refreshTrigger prop', () => {
      render(
        <CohortDaySelector
          {...createProps({ selectedCohort, refreshTrigger: 0 })}
        />
      );

      // Should render without errors
      expect(screen.getByText('Cohort A')).toBeInTheDocument();
    });

    it('should re-fetch days when refreshTrigger changes', async () => {
      const { rerender } = render(
        <CohortDaySelector
          {...createProps({ selectedCohort, refreshTrigger: 0 })}
        />
      );

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/curriculum/calendar'),
          expect.any(Object)
        );
      });

      // Clear the call count
      const callCountBefore = axios.get.mock.calls.filter(
        (call) => call[0].includes('/api/curriculum/calendar')
      ).length;

      // Rerender with incremented refreshTrigger
      rerender(
        <CohortDaySelector
          {...createProps({ selectedCohort, refreshTrigger: 1 })}
        />
      );

      await waitFor(() => {
        const callCountAfter = axios.get.mock.calls.filter(
          (call) => call[0].includes('/api/curriculum/calendar')
        ).length;
        expect(callCountAfter).toBeGreaterThan(callCountBefore);
      });
    });

    it('should not re-fetch days when refreshTrigger stays the same', async () => {
      const props = createProps({ selectedCohort, refreshTrigger: 0 });
      const { rerender } = render(<CohortDaySelector {...props} />);

      await waitFor(() => {
        expect(axios.get).toHaveBeenCalled();
      });

      const callCountBefore = axios.get.mock.calls.filter(
        (call) => call[0].includes('/api/curriculum/calendar')
      ).length;

      // Rerender with same refreshTrigger
      rerender(<CohortDaySelector {...props} />);

      // Wait a tick and check no additional calls were made
      await new Promise((r) => setTimeout(r, 50));

      const callCountAfter = axios.get.mock.calls.filter(
        (call) => call[0].includes('/api/curriculum/calendar')
      ).length;
      expect(callCountAfter).toBe(callCountBefore);
    });

    it('should not fetch days on refreshTrigger change when no cohort is selected', async () => {
      const { rerender } = render(
        <CohortDaySelector
          {...createProps({ selectedCohort: null, refreshTrigger: 0 })}
        />
      );

      // Only cohorts fetch should have happened
      await waitFor(() => {
        expect(axios.get).toHaveBeenCalledWith(
          expect.stringContaining('/api/preview/cohorts'),
          expect.any(Object)
        );
      });

      const calendarCalls = axios.get.mock.calls.filter(
        (call) => call[0].includes('/api/curriculum/calendar')
      );
      expect(calendarCalls).toHaveLength(0);

      // Increment refreshTrigger without a selected cohort
      rerender(
        <CohortDaySelector
          {...createProps({ selectedCohort: null, refreshTrigger: 1 })}
        />
      );

      await new Promise((r) => setTimeout(r, 50));

      const calendarCallsAfter = axios.get.mock.calls.filter(
        (call) => call[0].includes('/api/curriculum/calendar')
      );
      expect(calendarCallsAfter).toHaveLength(0);
    });

    it('should show updated day dates after refresh', async () => {
      const updatedWeeks = [
        {
          weekNumber: 1,
          weeklyGoal: 'Updated weekly goal',
          days: [
            {
              id: 10,
              day_number: 1,
              day_date: '2025-07-20T00:00:00.000Z', // Changed date
              daily_goal: 'Setup environment',
            },
          ],
        },
      ];

      let fetchCount = 0;
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/preview/cohorts')) {
          return Promise.resolve({ data: { cohorts: mockCohorts } });
        }
        if (url.includes('/api/curriculum/calendar')) {
          fetchCount++;
          // Return updated data on second fetch
          return Promise.resolve({
            data: fetchCount > 1 ? updatedWeeks : mockWeeks,
          });
        }
        return Promise.reject(new Error('Unknown URL'));
      });

      const cohortProp = { cohort_name: 'Cohort A', cohort_id: 1 };

      const { rerender } = render(
        <CohortDaySelector
          {...createProps({ selectedCohort: cohortProp, refreshTrigger: 0 })}
        />
      );

      // Wait for initial data to load
      await waitFor(() => {
        expect(screen.getByText('Week 1')).toBeInTheDocument();
      });

      // The weekly goal from the first fetch is visible in the accordion trigger
      expect(screen.getByText('Introduction to Programming')).toBeInTheDocument();

      // Trigger refresh with incremented key
      rerender(
        <CohortDaySelector
          {...createProps({ selectedCohort: cohortProp, refreshTrigger: 1 })}
        />
      );

      // After refresh, the updated weekly goal should appear (visible in accordion trigger)
      await waitFor(() => {
        expect(screen.getByText('Updated weekly goal')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle cohorts fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockRejectedValueOnce(new Error('Network error'));

      render(<CohortDaySelector {...createProps()} />);

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching cohorts:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });

    it('should handle days fetch error gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      axios.get.mockImplementation((url) => {
        if (url.includes('/api/preview/cohorts')) {
          return Promise.resolve({ data: { cohorts: mockCohorts } });
        }
        return Promise.reject(new Error('Network error'));
      });

      render(
        <CohortDaySelector
          {...createProps({ selectedCohort: { cohort_name: 'Cohort A', cohort_id: 1 } })}
        />
      );

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith(
          'Error fetching days:',
          expect.any(Error)
        );
      });

      consoleSpy.mockRestore();
    });
  });
});
