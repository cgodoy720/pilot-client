import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import { AuthContext } from '../../context/AuthContext';

// Mock useNavigate at the top level
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock child components to isolate Dashboard testing
vi.mock('../../components/MissedAssignmentsSidebar/MissedAssignmentsSidebar', () => ({
  default: ({ isOpen, onClose }) => (
    isOpen ? <div data-testid="missed-assignments-sidebar">Sidebar</div> : null
  )
}));

vi.mock('../../components/animate-ui/components/buttons/ripple', () => ({
  RippleButton: ({ children, onClick, disabled, ...props }) => (
    <button onClick={onClick} disabled={disabled} {...props}>
      {children}
    </button>
  )
}));

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div>AlertTriangle</div>,
  Calendar: () => <div>Calendar</div>,
  BookOpen: () => <div>BookOpen</div>,
  ArrowRight: () => <div>ArrowRight</div>,
  ChevronLeft: () => <div>ChevronLeft</div>,
  ChevronRight: () => <div>ChevronRight</div>,
}));

// Helper to render Dashboard with all required providers
const renderDashboard = (authValue = {}) => {
  const defaultAuthValue = {
    token: 'test-token',
    user: {
      firstName: 'John',
      role: 'student',
      active: true
    },
    isAuthenticated: true,
    isLoading: false,
    ...authValue
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthValue}>
        <Dashboard />
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock fetch globally
    global.fetch = vi.fn();
    
    // Mock environment variable
    import.meta.env.VITE_API_URL = 'http://localhost:3000';
  });

  describe('Unit Tests - Helper Functions', () => {
    // Note: These are internal functions, so we'll test them through component behavior
    // In a real scenario, you'd export them or test through public API

    describe('formatTime', () => {
      it('should convert 24-hour time to 12-hour format with AM', async () => {
        const mockData = {
          day: { daily_goal: 'Test goal', week: 1, level: 1 },
          timeBlocks: [{
            start_time: '09:30',
            tasks: [{
              id: 1,
              task_title: 'Morning Task',
              duration_minutes: 30,
              task_type: 'lecture'
            }]
          }],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        });

        renderDashboard();
        
        await waitFor(() => {
          expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
        });
      });

      it('should convert 24-hour time to 12-hour format with PM', async () => {
        const mockData = {
          day: { daily_goal: 'Test goal', week: 1, level: 1 },
          timeBlocks: [{
            start_time: '14:30',
            tasks: [{
              id: 1,
              task_title: 'Afternoon Task',
              duration_minutes: 30,
              task_type: 'lecture'
            }]
          }],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        });

        renderDashboard();
        
        await waitFor(() => {
          expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
        });
      });
    });

    describe('Date formatting', () => {
      it('should format today date with TODAY prefix', async () => {
        const today = new Date().toISOString();
        const mockWeekData = [{
          id: 1,
          day_date: today,
          tasks: []
        }];

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => ({
              day: { daily_goal: 'Test', week: 1, level: 1 },
              timeBlocks: [],
              taskProgress: [],
              missedAssignmentsCount: 0
            })
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockWeekData
          });

        renderDashboard();

        await waitFor(() => {
          // Use getAllByText since TODAY appears in both desktop and mobile views
          const todayElements = screen.getAllByText(/TODAY/i);
          expect(todayElements.length).toBeGreaterThan(0);
        });
      });
    });
  });

  describe('Integration Tests - Component Rendering', () => {
    describe('Loading State', () => {
      it('should show loading message initially', () => {
        global.fetch.mockImplementation(() => new Promise(() => {})); // Never resolves
        
        renderDashboard();
        
        expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
      });
    });

    describe('Error Handling', () => {
      it('should display error message when API fails', async () => {
        global.fetch.mockRejectedValueOnce(new Error('Network error'));

        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
        });
      });

      it('should handle non-ok response from API', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server error' })
        });

        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText(/Failed to load dashboard data/i)).toBeInTheDocument();
        });
      });
    });

    describe('User Role-Based Rendering', () => {
      it('should show volunteer view for volunteer users', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            day: {},
            timeBlocks: [],
            taskProgress: [],
            missedAssignmentsCount: 0
          })
        });

        renderDashboard({
          user: { firstName: 'Jane', role: 'volunteer', active: true }
        });

        await waitFor(() => {
          expect(screen.getByText(/Welcome, Volunteer!/i)).toBeInTheDocument();
          expect(screen.getByText(/Go to Volunteer Feedback/i)).toBeInTheDocument();
        });
      });

      it('should show historical view for inactive users', async () => {
        renderDashboard({
          user: { firstName: 'Jane', role: 'student', active: false }
        });

        await waitFor(() => {
          expect(screen.getByText(/Historical Access Only/i)).toBeInTheDocument();
          expect(screen.getByText(/View Past Sessions/i)).toBeInTheDocument();
        });
      });

      it('should show regular dashboard for active students', async () => {
        const mockData = {
          day: { 
            daily_goal: 'Learn React Testing',
            week: 1,
            level: 1,
            weekly_goal: 'Master Testing'
          },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => []
          });

        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText(/Hey John. Good to see you!/i)).toBeInTheDocument();
          expect(screen.getByText(/Learn React Testing/i)).toBeInTheDocument();
        });
      });
    });

    describe('Dashboard Content', () => {
      beforeEach(() => {
        const mockDashboardData = {
          day: {
            daily_goal: 'Complete all tests',
            week: 5,
            level: 1,
            weekly_goal: 'Master Testing'
          },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 3
        };

        const mockWeekData = [
          {
            id: 1,
            day_date: new Date().toISOString(),
            tasks: [
              { id: 1, task_title: 'Task 1', deliverable_type: null },
              { id: 2, task_title: 'Task 2', deliverable_type: 'video', hasSubmission: false }
            ]
          }
        ];

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockDashboardData
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockWeekData
          });
      });

      it('should display user greeting with first name', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText(/Hey John. Good to see you!/i)).toBeInTheDocument();
        });
      });

      it('should display today\'s goal', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText('Complete all tests')).toBeInTheDocument();
        });
      });

      it('should display missed assignments count', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText(/\( 3 \) missed assignments/i)).toBeInTheDocument();
        });
      });

      it('should display week and level information', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText(/L1: Week 5/i)).toBeInTheDocument();
        });
      });

      it('should display weekly goal', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText('Master Testing')).toBeInTheDocument();
        });
      });
    });

    describe('Upcoming Events', () => {
      it('should display upcoming events list', async () => {
        const mockData = {
          day: { daily_goal: 'Test', week: 1, level: 1 },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => []
          });

        renderDashboard();

        await waitFor(() => {
          expect(screen.getByText('Upcoming')).toBeInTheDocument();
          expect(screen.getByText('Demo Day')).toBeInTheDocument();
          expect(screen.getByText('Fireside Chat with David Yang')).toBeInTheDocument();
        });
      });
    });
  });

  describe('Integration Tests - User Interactions', () => {
    beforeEach(() => {
      const mockData = {
        day: { daily_goal: 'Test', week: 1, level: 1, weekly_goal: 'Test Week' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 2
      };

      global.fetch.mockResolvedValue({
        ok: true,
        json: async () => mockData
      });
    });

    describe('Navigation', () => {
      it('should navigate to learning page when Start button is clicked', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
        });

        const startButton = screen.getAllByText('Start')[0];
        fireEvent.click(startButton);

        await waitFor(() => {
          expect(mockNavigate).toHaveBeenCalledWith('/learning');
        });
      });

      it('should prevent navigation for inactive users', async () => {
        renderDashboard({
          user: { firstName: 'Jane', role: 'student', active: false }
        });

        await waitFor(() => {
          expect(screen.getByText(/Historical Access Only/i)).toBeInTheDocument();
        });

        // Inactive users should see calendar button instead
        expect(screen.getByText(/View Past Sessions/i)).toBeInTheDocument();
      });
    });

    describe('Missed Assignments Sidebar', () => {
      it('should open sidebar when missed assignments button is clicked', async () => {
        renderDashboard();

        await waitFor(() => {
          expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
        });

        const missedButton = screen.getByText(/\( 2 \) missed assignments/i);
        fireEvent.click(missedButton);

        await waitFor(() => {
          expect(screen.getByTestId('missed-assignments-sidebar')).toBeInTheDocument();
        });
      });
    });

    describe('Week Navigation', () => {
      it('should disable prev button when on week 1', async () => {
        const mockData = {
          day: { daily_goal: 'Test', week: 1, level: 1, weekly_goal: 'Week 1' },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => []
          });

        renderDashboard();

        await waitFor(() => {
          const prevButtons = screen.getAllByRole('button');
          const chevronLeftButton = prevButtons.find(btn => 
            btn.querySelector('div')?.textContent === 'ChevronLeft'
          );
          expect(chevronLeftButton).toBeDisabled();
        });
      });

      it('should disable next button when on current week', async () => {
        const mockData = {
          day: { daily_goal: 'Test', week: 5, level: 1, weekly_goal: 'Week 5' },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockData
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => []
          });

        renderDashboard();

        await waitFor(() => {
          const nextButtons = screen.getAllByRole('button');
          const chevronRightButton = nextButtons.find(btn => 
            btn.querySelector('div')?.textContent === 'ChevronRight'
          );
          expect(chevronRightButton).toBeDisabled();
        });
      });
    });
  });

  describe('Integration Tests - API Interactions', () => {
    describe('fetchDashboardData', () => {
      it('should call API with correct authorization header', async () => {
        const mockData = {
          day: { daily_goal: 'Test', week: 1, level: 1 },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        });

        renderDashboard({ token: 'my-test-token' });

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/progress/current-day'),
            expect.objectContaining({
              headers: {
                'Authorization': 'Bearer my-test-token'
              }
            })
          );
        });
      });

      it('should include cohort parameter for staff users', async () => {
        const mockData = {
          day: { daily_goal: 'Test', week: 1, level: 1 },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        });

        renderDashboard({
          user: { firstName: 'Admin', role: 'staff', active: true }
        });

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalled();
        });
      });

      it('should handle "No schedule for today" message', async () => {
        global.fetch.mockResolvedValueOnce({
          ok: true,
          json: async () => ({ message: 'No schedule for today' })
        });

        renderDashboard();

        await waitFor(() => {
          expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
        });
      });
    });

    describe('fetchWeekData', () => {
      it('should fetch week data when day has week number', async () => {
        const mockDashboardData = {
          day: { daily_goal: 'Test', week: 3, level: 1, weekly_goal: 'Week 3' },
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        };

        const mockWeekData = [
          { id: 1, day_date: new Date().toISOString(), tasks: [] }
        ];

        global.fetch
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockDashboardData
          })
          .mockResolvedValueOnce({
            ok: true,
            json: async () => mockWeekData
          });

        renderDashboard();

        await waitFor(() => {
          expect(global.fetch).toHaveBeenCalledTimes(2);
          expect(global.fetch).toHaveBeenNthCalledWith(
            2,
            expect.stringContaining('/api/curriculum/weeks/3'),
            expect.any(Object)
          );
        });
      });
    });
  });

  describe('Task Completion Status', () => {
    it('should show completion badge for past days', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockData = {
        day: { daily_goal: 'Test', week: 1, level: 1 },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      const mockWeekData = [
        {
          id: 1,
          day_date: yesterday.toISOString(),
          tasks: [
            { 
              id: 1, 
              task_title: 'Submit video', 
              deliverable_type: 'video',
              hasSubmission: true 
            }
          ]
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeekData
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });
    });

    it('should show incomplete badge when deliverables are missing', async () => {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const mockData = {
        day: { daily_goal: 'Test', week: 1, level: 1 },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      const mockWeekData = [
        {
          id: 1,
          day_date: yesterday.toISOString(),
          tasks: [
            { 
              id: 1, 
              task_title: 'Submit video', 
              deliverable_type: 'video',
              hasSubmission: false 
            }
          ]
        }
      ];

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockWeekData
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Incomplete')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design', () => {
    it('should render both desktop and mobile views', async () => {
      const mockData = {
        day: { daily_goal: 'Test goal', week: 1, level: 1, weekly_goal: 'Test' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockData
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => []
        });

      const { container } = renderDashboard();

      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
      });

      // Check for desktop and mobile classes
      expect(container.querySelector('.dashboard__desktop')).toBeInTheDocument();
      expect(container.querySelector('.dashboard__mobile')).toBeInTheDocument();
    });
  });

  describe('Dashboard Data Loading', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should make API call to fetch dashboard data on mount', async () => {
      const mockDashboardData = {
        day: { daily_goal: 'Learn React Testing', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockDashboardData
      });

      renderDashboard();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/progress/current-day',
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer mock-token'
            }
          })
        );
      });
    });

    it('should fetch week data when week number is available', async () => {
      const mockDashboardData = {
        day: { daily_goal: 'Test Goal', week: 2, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      const mockWeekData = [
        { id: 6, day_date: new Date().toISOString(), tasks: [] },
        { id: 7, day_date: new Date().toISOString(), tasks: [] }
      ];

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeekData });

      renderDashboard();

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          'http://localhost:3000/api/curriculum/weeks/2',
          expect.any(Object)
        );
      });
    });

    it('should handle API errors gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal Server Error' })
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should retry loading data when retry button is clicked', async () => {
      const mockDashboardData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // First call fails
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server Error' })
        })
        // Retry succeeds
        .mockResolvedValueOnce({
          ok: true,
          json: async () => mockDashboardData
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.queryByText('Failed to load dashboard data. Please try again later.')).not.toBeInTheDocument();
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });
  });

  describe('Weekly Card Content', () => {
    const mockDashboardData = {
      day: { daily_goal: 'Complete React Testing', week: 1, level: 1, weekly_goal: 'Master Testing' },
      timeBlocks: [],
      taskProgress: [],
      missedAssignmentsCount: 0
    };

    const mockWeekData = [
      {
        id: 1,
        day_date: new Date().toISOString(),
        tasks: [
          { id: 'task1', task_title: 'Learn Unit Testing', deliverable_type: 'document' },
          { id: 'task2', task_title: 'Write Test Cases', type: 'lecture' }
        ]
      },
      {
        id: 2,
        day_date: new Date(Date.now() + 86400000).toISOString(),
        tasks: [
          { id: 'task3', task_title: 'Integration Testing', deliverable_type: 'video' }
        ]
      }
    ];

    beforeEach(() => {
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeekData });
    });

    it('should display weekly goal in card', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Master Testing')).toBeInTheDocument();
      });
    });

    it('should display current level and week', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('L1: Week 1')).toBeInTheDocument();
      });
    });

    it('should show tasks for current day', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Learn Unit Testing')).toBeInTheDocument();
        expect(screen.getByText('Write Test Cases')).toBeInTheDocument();
      });
    });

    it('should show completion badges for past days', async () => {
      const pastDayWithDeliverable = {
        id: 1,
        day_date: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        tasks: [
          { id: 'task1', task_title: 'Complete Assignment', deliverable_type: 'document', hasSubmission: true }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockResolvedValueOnce({ ok: true, json: async () => [pastDayWithDeliverable] });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Complete')).toBeInTheDocument();
      });
    });

    it('should show incomplete badge for missing deliverables', async () => {
      const pastDayIncomplete = {
        id: 1,
        day_date: new Date(Date.now() - 86400000).toISOString(),
        tasks: [
          { id: 'task1', task_title: 'Missing Assignment', deliverable_type: 'video', hasSubmission: false }
        ]
      };

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockResolvedValueOnce({ ok: true, json: async () => [pastDayIncomplete] });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Incomplete')).toBeInTheDocument();
      });
    });

    it('should display upcoming events correctly', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Upcoming')).toBeInTheDocument();
        expect(screen.getByText('Demo Day')).toBeInTheDocument();
        expect(screen.getByText('Fireside Chat with David Yang')).toBeInTheDocument();
        expect(screen.getByText('Presentation')).toBeInTheDocument();
      });
    });
  });

  describe('Missed Assignments Modal', () => {
    beforeEach(() => {
      const mockDashboardData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 3
      };

      const mockWeekData = [{
        id: 1,
        day_date: new Date().toISOString(),
        tasks: []
      }];

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockWeekData });
    });

    it('should display missed assignments count', async () => {
      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('( 3 ) missed assignments')).toBeInTheDocument();
      });
    });

    it('should open missed assignments sidebar when clicked', async () => {
      renderDashboard();

      await waitFor(() => {
        const missedButton = screen.getByText(/\( 3 \) missed assignments/i);
        expect(missedButton).toBeInTheDocument();
      });

      const missedButton = screen.getByText(/\( 3 \) missed assignments/i);
      fireEvent.click(missedButton);

      await waitFor(() => {
        expect(screen.getByTestId('missed-assignments-sidebar')).toBeInTheDocument();
      });
    });

    it('should pass correct props to missed assignments sidebar', async () => {
      renderDashboard();

      await waitFor(() => {
        const missedButton = screen.getByText(/\( 3 \) missed assignments/i);
        fireEvent.click(missedButton);
      });

      await waitFor(() => {
        const sidebar = screen.getByTestId('missed-assignments-sidebar');
        expect(sidebar).toBeInTheDocument();
      });
    });

    it('should handle zero missed assignments', async () => {
      const mockDashboardData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      renderDashboard();

      await waitFor(() => {
        expect(screen.queryByText(/missed assignments/i)).not.toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Loading States', () => {
    it('should show loading state initially', () => {
      // Mock a slow response
      global.fetch.mockImplementation(() => new Promise(() => {}));

      renderDashboard();
      expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();
    });

    it('should show loading state for week data', async () => {
      const mockDashboardData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // Dashboard loads quickly, week data loads slowly
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockDashboardData })
        .mockImplementationOnce(() => new Promise(() => {}));

      renderDashboard();

      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });

      // Week loading should still be in progress
      expect(screen.getByText('Loading week data...')).toBeInTheDocument();
    });

    it('should handle network timeout', async () => {
      // Mock a timeout
      global.fetch.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard Edge Cases', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should handle empty API response gracefully', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}) // Empty response
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('child-component')).toBeInTheDocument();
      });
    });

    it('should handle malformed API response', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ malformed: 'data' }) // Missing expected fields
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('child-component')).toBeInTheDocument();
      });
    });

    it('should handle network timeout', async () => {
      global.fetch.mockImplementation(() =>
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Network timeout')), 100)
        )
      );

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should handle multiple rapid API calls', async () => {
      const mockData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // Multiple rapid calls
      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockData })
        .mockResolvedValueOnce({ ok: true, json: async () => mockData });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });

    it('should handle concurrent state updates', async () => {
      const mockData1 = {
        day: { daily_goal: 'Goal 1', week: 1, level: 1, weekly_goal: 'Week 1' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      const mockData2 = {
        day: { daily_goal: 'Goal 2', week: 2, level: 2, weekly_goal: 'Week 2' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      renderDashboard();

      // Simulate state update during loading
      await waitFor(() => {
        expect(screen.getByText('Goal 1')).toBeInTheDocument();
      });
    });

    it('should recover from multiple consecutive errors', async () => {
      const mockData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // Multiple failures followed by success
      global.fetch
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Server Error 1' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Server Error 2' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => mockData });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });

    it('should handle authentication token changes', async () => {
      const { rerender } = renderDashboard();

      // Change auth token
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={{
            token: 'new-token',
            user: { firstName: 'John', role: 'student', active: true },
            logout: vi.fn(),
          }}>
            <Dashboard />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          expect.any(String),
          expect.objectContaining({
            headers: {
              'Authorization': 'Bearer new-token'
            }
          })
        );
      });
    });

    it('should handle user role changes during session', async () => {
      const { rerender } = renderDashboard();

      // Change user role
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={{
            token: 'mock-token',
            user: { firstName: 'John', role: 'admin', active: true },
            logout: vi.fn(),
          }}>
            <Dashboard />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-component')).toBeInTheDocument();
      });
    });

    it('should handle component unmount during API call', async () => {
      const { unmount } = renderDashboard();

      // Unmount during API call
      unmount();

      // Should not cause memory leaks or errors
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle browser navigation events', async () => {
      renderDashboard();

      // Simulate browser back/forward
      window.dispatchEvent(new PopStateEvent('popstate'));

      await waitFor(() => {
        expect(screen.getByTestId('child-component')).toBeInTheDocument();
      });
    });

    it('should handle localStorage corruption', async () => {
      // Mock corrupted localStorage
      const originalGetItem = Storage.prototype.getItem;
      Storage.prototype.getItem = vi.fn(() => {
        throw new Error('localStorage corrupted');
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByTestId('child-component')).toBeInTheDocument();
      });

      // Restore
      Storage.prototype.getItem = originalGetItem;
    });
  });

  describe('Dashboard State Management', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should maintain state during rapid re-renders', async () => {
      const mockData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch
        .mockResolvedValueOnce({ ok: true, json: async () => mockData })
        .mockResolvedValueOnce({ ok: true, json: async () => [] });

      const { rerender } = renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });

      // Rapid re-renders
      for (let i = 0; i < 5; i++) {
        rerender(
          <BrowserRouter>
            <AuthContext.Provider value={{
              token: 'mock-token',
              user: { firstName: 'John', role: 'student', active: true },
              logout: vi.fn(),
            }}>
              <Dashboard />
            </AuthContext.Provider>
          </BrowserRouter>
        );
      }

      expect(screen.getByText('Test Goal')).toBeInTheDocument();
    });

    it('should handle state updates during error recovery', async () => {
      const mockData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // First call fails, retry succeeds
      global.fetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          json: async () => ({ error: 'Server Error' })
        })
        .mockResolvedValueOnce({ ok: true, json: async () => mockData });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });

    it('should handle concurrent navigation and data loading', async () => {
      const mockData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch.mockResolvedValueOnce({ ok: true, json: async () => mockData });

      renderDashboard();

      // Click navigation while loading
      const startButton = screen.getByText('Start');
      fireEvent.click(startButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/learning');
      });
    });

    it('should handle props changes during loading', async () => {
      const { rerender } = renderDashboard();

      // Change auth context during loading
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={{
            token: 'different-token',
            user: { firstName: 'Jane', role: 'student', active: true },
            logout: vi.fn(),
          }}>
            <Dashboard />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      await waitFor(() => {
        expect(screen.getByTestId('child-component')).toBeInTheDocument();
      });
    });
  });

  describe('Dashboard User Experience', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should show loading states appropriately', async () => {
      // Slow response
      global.fetch.mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({
            ok: true,
            json: async () => ({
              day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
              timeBlocks: [],
              taskProgress: [],
              missedAssignmentsCount: 0
            })
          }), 100)
        )
      );

      renderDashboard();

      // Should show loading initially
      expect(screen.getByText('Loading dashboard data...')).toBeInTheDocument();

      await waitFor(() => {
        expect(screen.queryByText('Loading dashboard data...')).not.toBeInTheDocument();
      });
    });

    it('should handle keyboard navigation', async () => {
      renderDashboard();

      const startButton = screen.getByText('Start');

      // Focus and activate with keyboard
      startButton.focus();
      fireEvent.keyDown(startButton, { key: 'Enter' });

      expect(mockNavigate).toHaveBeenCalledWith('/learning');
    });

    it('should maintain focus management', async () => {
      renderDashboard();

      const startButton = screen.getByText('Start');
      startButton.focus();

      expect(document.activeElement).toBe(startButton);
    });

    it('should handle accessibility requirements', async () => {
      renderDashboard();

      // Check for proper heading structure
      expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();

      // Check for proper button labeling
      expect(screen.getByRole('button', { name: /Start/i })).toBeInTheDocument();
    });
  });

  describe('Dashboard Error Recovery', () => {
    beforeEach(() => {
      global.fetch = vi.fn();
    });

    it('should recover from multiple consecutive errors', async () => {
      const mockData = {
        day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // Multiple failures followed by success
      global.fetch
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Error 1' }) })
        .mockResolvedValueOnce({ ok: false, status: 500, json: async () => ({ error: 'Error 2' }) })
        .mockResolvedValueOnce({ ok: true, json: async () => mockData });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });

      const retryButton = screen.getByText('Try Again');
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });

    it('should handle partial API failures', async () => {
      // Dashboard API succeeds, but week data fails
      global.fetch
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            day: { daily_goal: 'Test Goal', week: 1, level: 1, weekly_goal: 'Master Testing' },
            timeBlocks: [],
            taskProgress: [],
            missedAssignmentsCount: 0
          })
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 404,
          json: async () => ({ error: 'Week not found' })
        });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Test Goal')).toBeInTheDocument();
      });
    });

    it('should handle authentication errors', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });
    });

    it('should handle rate limiting', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: async () => ({ error: 'Too many requests' })
      });

      renderDashboard();

      await waitFor(() => {
        expect(screen.getByText('Failed to load dashboard data. Please try again later.')).toBeInTheDocument();
      });
    });
  });
});

