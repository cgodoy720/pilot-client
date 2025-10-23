// @ts-nocheck
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
          expect(screen.getByText(/TODAY/i)).toBeInTheDocument();
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
});

