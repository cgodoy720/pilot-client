import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within, waitFor, act } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Dashboard from '../Dashboard';
import Layout from '../../../components/Layout/Layout';
import useAuthStore from '../../../stores/authStore';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

// Mock child components
vi.mock('../../components/MissedAssignmentsSidebar/MissedAssignmentsSidebar', () => ({
  default: () => null
}));

vi.mock('../../components/animate-ui/components/buttons/ripple', () => ({
  RippleButton: ({ children, ...props }) => <button {...props}>{children}</button>
}));

vi.mock('lucide-react', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});

/**
 * Helper to render Layout + Dashboard with Zustand store state
 */
const renderWithLayout = (storeState = {}) => {
  const defaultState = {
    token: 'test-token',
    user: {
      firstName: 'Test',
      role: 'student',
      active: true
    },
    isAuthenticated: true,
    isLoading: false,
    _hasHydrated: true,
    logout: vi.fn(),
  };

  useAuthStore.setState({ ...defaultState, ...storeState });

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <Layout>
        <Dashboard />
      </Layout>
    </MemoryRouter>
  );
};

/**
 * Helper to render just Dashboard without Layout (for Dashboard-specific tests)
 */
const renderDashboardOnly = (storeState = {}) => {
  const defaultState = {
    token: 'test-token',
    user: {
      firstName: 'Test',
      role: 'student',
      active: true
    },
    isAuthenticated: true,
    isLoading: false,
    _hasHydrated: true,
  };

  useAuthStore.setState({ ...defaultState, ...storeState });

  return render(
    <BrowserRouter>
      <Dashboard />
    </BrowserRouter>
  );
};

const createJsonResponse = (data, ok = true, status = 200) =>
  Promise.resolve({
    ok,
    status,
    json: async () => data,
  });

const createDefaultFetchMock = () =>
  vi.fn((input) => {
    const url = typeof input === 'string' ? input : input?.url || String(input);

    if (url.includes('/api/learning/batch-completion-status')) {
      return createJsonResponse({ completionStatus: {} });
    }

    if (url.includes('/api/permissions/cohorts')) {
      return createJsonResponse({ cohorts: [] });
    }

    if (url.includes('/api/progress/dashboard-full')) {
      return createJsonResponse({
        day: { daily_goal: 'Default Test Goal', week: 1, level: 1, weekly_goal: 'Default Weekly Goal' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0,
        weeks: [],
      });
    }

    return createJsonResponse({});
  });

describe('Dashboard - Role-Based Access Control', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.clearAllMocks();
    mockNavigate.mockClear();

    // Reset Zustand auth store
    useAuthStore.setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      _hasHydrated: true,
      logout: vi.fn(),
    });

    global.fetch = createDefaultFetchMock();

    import.meta.env.VITE_API_URL = 'http://localhost:3000';
  });

  describe('Student/Builder Role', () => {
    it('should show standard navigation items for students', async () => {
      renderWithLayout({
        user: { firstName: 'Student', role: 'builder', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Standard navigation items should be present as links
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();
      expect(within(nav).getByText('Learning')).toBeInTheDocument();
      expect(within(nav).getByText('AI Chat')).toBeInTheDocument();
      expect(within(nav).getByText('Calendar')).toBeInTheDocument();
      expect(within(nav).getByText('Pathfinder')).toBeInTheDocument();
      expect(within(nav).getByText('Performance')).toBeInTheDocument();

      // Logout button should be present
      expect(within(nav).getByText('Logout')).toBeInTheDocument();
    });

    it('should NOT show admin navigation items for students', () => {
      renderWithLayout({
        user: { firstName: 'Student', role: 'student', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // No dropdown triggers should be present for students
      expect(within(nav).queryByText('Program')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Employment')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Staff')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Admin')).not.toBeInTheDocument();

      // No admin flat links
      expect(within(nav).queryByText('Enterprise Admin')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Admissions Dashboard')).not.toBeInTheDocument();
    });

    it('should NOT show volunteer link for students', () => {
      renderWithLayout({
        user: { firstName: 'Student', role: 'student', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      expect(within(nav).queryByText('Volunteers')).not.toBeInTheDocument();
    });

    it('should render dashboard content for active students', async () => {
      const mockData = {
        day: { daily_goal: 'Learn Testing', week: 1, level: 1, weekly_goal: 'Test' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      // Override the default mock for this specific test
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ completionStatus: {} })
      });

      renderDashboardOnly({
        user: { firstName: 'John', role: 'student', active: true }
      });

      await screen.findByText(/Hey John. Good to see you!/i);
      expect(screen.getAllByText(/Learn Testing/i)[0]).toBeInTheDocument();
    });
  });

  describe('Builder Role', () => {
    it('should show same navigation as students for builders', () => {
      renderWithLayout({
        user: { firstName: 'Builder', role: 'builder', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Standard items (same as student)
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();
      expect(within(nav).getByText('Learning')).toBeInTheDocument();
      expect(within(nav).getByText('AI Chat')).toBeInTheDocument();
      expect(within(nav).getByText('Calendar')).toBeInTheDocument();
      expect(within(nav).getByText('Pathfinder')).toBeInTheDocument();
      expect(within(nav).getByText('Performance')).toBeInTheDocument();

      // No dropdown triggers
      expect(within(nav).queryByText('Program')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Employment')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Staff')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Admin')).not.toBeInTheDocument();

      // No volunteer link
      expect(within(nav).queryByText('Volunteers')).not.toBeInTheDocument();
    });
  });

  describe('Volunteer Role', () => {
    it('should show standard navigation items for volunteers', () => {
      renderWithLayout({
        user: { firstName: 'Volunteer', role: 'volunteer', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Volunteers see Dashboard, Learning, and Volunteers link
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();
      expect(within(nav).getByText('Learning')).toBeInTheDocument();
      expect(within(nav).getByText('Volunteers')).toBeInTheDocument();

      // Volunteers do NOT see AI Chat, Calendar, Pathfinder, Performance
      expect(within(nav).queryByText('AI Chat')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Calendar')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Pathfinder')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Performance')).not.toBeInTheDocument();
    });

    it('should show Volunteers link for volunteers', () => {
      renderWithLayout({
        user: { firstName: 'Volunteer', role: 'volunteer', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      expect(within(nav).getByText('Volunteers')).toBeInTheDocument();
    });

    it('should NOT show admin navigation items for volunteers', () => {
      renderWithLayout({
        user: { firstName: 'Volunteer', role: 'volunteer', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // No dropdown triggers for volunteers
      expect(within(nav).queryByText('Program')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Employment')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Staff')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Admin')).not.toBeInTheDocument();

      // No admin flat links
      expect(within(nav).queryByText('Enterprise Admin')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Admissions Dashboard')).not.toBeInTheDocument();
    });

    it('should show volunteer-specific dashboard view', async () => {
      // Override the default mock for this specific test
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          day: {},
          timeBlocks: [],
          taskProgress: [],
          missedAssignmentsCount: 0
        })
      });

      renderDashboardOnly({
        user: { firstName: 'Jane', role: 'volunteer', active: true }
      });

      await waitFor(() => {
        expect(screen.getByText(/Welcome, Volunteer!/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/Go to Volunteer Feedback/i)).toBeInTheDocument();
      // Volunteer sees special view, not the standard active student greeting
      expect(screen.queryByText(/Hey Jane. Good to see you!/i)).not.toBeInTheDocument();
    });
  });

  describe('Staff Role', () => {
    it('should show standard navigation items for staff', () => {
      renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Standard link items
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();
      expect(within(nav).getByText('Learning')).toBeInTheDocument();
      expect(within(nav).getByText('AI Chat')).toBeInTheDocument();
      expect(within(nav).getByText('Calendar')).toBeInTheDocument();
      expect(within(nav).getByText('Pathfinder')).toBeInTheDocument();
      expect(within(nav).getByText('Performance')).toBeInTheDocument();
      expect(within(nav).getByText('Enterprise Admin')).toBeInTheDocument();
      expect(within(nav).getByText('Admissions Dashboard')).toBeInTheDocument();

      // Dropdown triggers visible for staff
      expect(within(nav).getByText('Program')).toBeInTheDocument();
      expect(within(nav).getByText('Employment')).toBeInTheDocument();
      expect(within(nav).getByText('Staff')).toBeInTheDocument();

      // Logout button
      expect(within(nav).getByText('Logout')).toBeInTheDocument();
    });

    it('should show dropdown triggers for staff but NOT Admin dropdown', () => {
      renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Staff sees Program, Employment, Staff dropdown triggers
      expect(within(nav).getByText('Program')).toBeInTheDocument();
      expect(within(nav).getByText('Employment')).toBeInTheDocument();
      expect(within(nav).getByText('Staff')).toBeInTheDocument();

      // Staff does NOT see the Admin dropdown trigger (lacks admin-only permissions)
      expect(within(nav).queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should NOT show Volunteers flat link for staff (it is inside Staff dropdown)', () => {
      renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Staff/admin don't see the flat 'Volunteers' link (that's for volunteer role only)
      // Volunteer management is inside the Staff dropdown as a hidden item
      expect(within(nav).queryByText('Volunteers')).not.toBeInTheDocument();
    });

    it('should have access to full dashboard with cohort filtering', async () => {
      // Staff triggers a cohorts fetch on mount
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cohorts: [] })
      });

      renderDashboardOnly({
        user: { firstName: 'StaffUser', role: 'staff', active: true }
      });

      // Staff/admin see "Welcome back" greeting (not "Hey ... Good to see you")
      await screen.findByText(/Welcome back, StaffUser!/i);
      // Without a cohort selected, shows placeholder (desktop + mobile)
      expect(screen.getAllByText(/Select a cohort to preview the builder dashboard/i)[0]).toBeInTheDocument();
    });
  });

  describe('Admin Role', () => {
    it('should show standard navigation items for admins', () => {
      renderWithLayout({
        user: { firstName: 'Admin', role: 'admin', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Standard link items
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();
      expect(within(nav).getByText('Learning')).toBeInTheDocument();
      expect(within(nav).getByText('AI Chat')).toBeInTheDocument();
      expect(within(nav).getByText('Calendar')).toBeInTheDocument();
      expect(within(nav).getByText('Pathfinder')).toBeInTheDocument();
      expect(within(nav).getByText('Performance')).toBeInTheDocument();
      expect(within(nav).getByText('Enterprise Admin')).toBeInTheDocument();
      expect(within(nav).getByText('Admissions Dashboard')).toBeInTheDocument();

      // Logout button
      expect(within(nav).getByText('Logout')).toBeInTheDocument();
    });

    it('should show ALL dropdown triggers for admins including Admin', () => {
      renderWithLayout({
        user: { firstName: 'Admin', role: 'admin', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Admin sees all four dropdown triggers
      expect(within(nav).getByText('Program')).toBeInTheDocument();
      expect(within(nav).getByText('Employment')).toBeInTheDocument();
      expect(within(nav).getByText('Staff')).toBeInTheDocument();
      expect(within(nav).getByText('Admin')).toBeInTheDocument();
    });

    it('should NOT show Volunteers flat link for admins (it is inside Staff dropdown)', () => {
      renderWithLayout({
        user: { firstName: 'Admin', role: 'admin', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Admin/staff don't see the flat 'Volunteers' link (that's for volunteer role only)
      // Volunteer management is inside the Staff dropdown as a hidden item
      expect(within(nav).queryByText('Volunteers')).not.toBeInTheDocument();
    });

    it('should have full access to dashboard features', async () => {
      // Admin triggers a cohorts fetch on mount
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ cohorts: [] })
      });

      renderDashboardOnly({
        user: { firstName: 'AdminUser', role: 'admin', active: true }
      });

      // Admin sees "Welcome back" greeting
      await screen.findByText(/Welcome back, AdminUser!/i);
      // Without a cohort selected, shows placeholder (desktop + mobile)
      expect(screen.getAllByText(/Select a cohort to preview the builder dashboard/i)[0]).toBeInTheDocument();
    });
  });

  describe('Cross-Role Navigation Link Verification', () => {
    const roles = [
      {
        name: 'builder', // 'student' maps to 'builder' in the permission system
        expectedLinks: ['Dashboard', 'Learning', 'AI Chat', 'Calendar', 'Pathfinder', 'Performance'],
        expectedDropdowns: [],
        hasVolunteersLink: false,
      },
      {
        name: 'builder',
        expectedLinks: ['Dashboard', 'Learning', 'AI Chat', 'Calendar', 'Pathfinder', 'Performance'],
        expectedDropdowns: [],
        hasVolunteersLink: false,
      },
      {
        name: 'volunteer',
        expectedLinks: ['Dashboard', 'Learning'],
        expectedDropdowns: [],
        hasVolunteersLink: true,
      },
      {
        name: 'staff',
        expectedLinks: ['Dashboard', 'Learning', 'AI Chat', 'Calendar', 'Pathfinder', 'Performance', 'Enterprise Admin', 'Admissions Dashboard'],
        expectedDropdowns: ['Program', 'Employment', 'Staff'],
        hasVolunteersLink: false,
      },
      {
        name: 'admin',
        expectedLinks: ['Dashboard', 'Learning', 'AI Chat', 'Calendar', 'Pathfinder', 'Performance', 'Enterprise Admin', 'Admissions Dashboard'],
        expectedDropdowns: ['Program', 'Employment', 'Staff', 'Admin'],
        hasVolunteersLink: false,
      },
    ];

    roles.forEach(({ name, expectedLinks, expectedDropdowns, hasVolunteersLink }) => {
      it(`should have correct navigation links for ${name} role`, () => {
        renderWithLayout({
          user: { firstName: 'User', role: name, active: true }
        });

        const nav = screen.getAllByRole('navigation')[0];

        // Check expected link items are present
        expectedLinks.forEach(linkText => {
          expect(within(nav).getByText(linkText)).toBeInTheDocument();
        });

        // Check expected dropdown triggers are present
        expectedDropdowns.forEach(dropdownText => {
          expect(within(nav).getByText(dropdownText)).toBeInTheDocument();
        });

        // Check that unexpected dropdown triggers are NOT present
        const allDropdowns = ['Program', 'Employment', 'Staff', 'Admin'];
        allDropdowns
          .filter(d => !expectedDropdowns.includes(d))
          .forEach(dropdownText => {
            expect(within(nav).queryByText(dropdownText)).not.toBeInTheDocument();
          });

        // Check Volunteers flat link
        if (hasVolunteersLink) {
          expect(within(nav).getByText('Volunteers')).toBeInTheDocument();
        } else {
          expect(within(nav).queryByText('Volunteers')).not.toBeInTheDocument();
        }

        // Everyone sees Logout
        expect(within(nav).getByText('Logout')).toBeInTheDocument();
      });
    });
  });

  describe('Inactive User Access', () => {
    it('should show limited dashboard for inactive builders', async () => {
      renderDashboardOnly({
        user: { firstName: 'Inactive', role: 'builder', active: false }
      });

      await screen.findByText('Historical Access Only');
      expect(screen.getByText(/View Past Sessions/i)).toBeInTheDocument();
    });

    it('should still show navigation for inactive users', () => {
      renderWithLayout({
        user: { firstName: 'Inactive', role: 'builder', active: false }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Navigation is still available - check for link text
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();
      expect(within(nav).getByText('Calendar')).toBeInTheDocument();
      expect(within(nav).getByText('Logout')).toBeInTheDocument();
    });

    it('should not allow inactive users to start new sessions', async () => {
      renderDashboardOnly({
        user: { firstName: 'Inactive', role: 'builder', active: false }
      });

      await screen.findByText('Historical Access Only');

      // Historical view has no "Start" button — only "View Past Sessions"
      expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links Accessibility', () => {
    it('should have proper link attributes for all roles', () => {
      renderWithLayout({
        user: { firstName: 'Test', role: 'admin', active: true }
      });

      // Get all links and find the specific ones we need
      const allLinks = screen.getAllByRole('link');

      const dashboardLink = allLinks.find(link => link.getAttribute('href') === '/dashboard');
      const learningLink = allLinks.find(link => link.getAttribute('href') === '/learning');
      const calendarLink = allLinks.find(link => link.getAttribute('href') === '/calendar');

      expect(dashboardLink).toBeInTheDocument();
      expect(learningLink).toBeInTheDocument();
      expect(calendarLink).toBeInTheDocument();

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(learningLink).toHaveAttribute('href', '/learning');
      expect(calendarLink).toHaveAttribute('href', '/calendar');
    });

    it('should show logout button for all roles', () => {
      renderWithLayout({
        user: { firstName: 'Test', role: 'student', active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      expect(within(nav).getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('Role Permission Edge Cases', () => {
    it('should handle undefined role gracefully', () => {
      renderWithLayout({
        user: { firstName: 'Unknown', role: undefined, active: true }
      });

      const nav = screen.getAllByRole('navigation')[0];
      // Dashboard nav link should still appear (always rendered)
      expect(within(nav).getByText('Dashboard')).toBeInTheDocument();

      // No dropdown triggers should appear
      expect(within(nav).queryByText('Program')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Employment')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Staff')).not.toBeInTheDocument();
      expect(within(nav).queryByText('Admin')).not.toBeInTheDocument();
    });

    it('should handle null user gracefully', () => {
      const { container } = renderWithLayout({
        user: null,
        isAuthenticated: false
      });

      // Should not crash, but may not render full content
      expect(container).toBeInTheDocument();
    });

    it('should differentiate between staff and admin correctly', () => {
      const { rerender } = renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      let nav = screen.getAllByRole('navigation')[0];
      // Staff should see Program, Employment, Staff triggers but NOT Admin
      expect(within(nav).getByText('Program')).toBeInTheDocument();
      expect(within(nav).getByText('Employment')).toBeInTheDocument();
      expect(within(nav).getByText('Staff')).toBeInTheDocument();
      expect(within(nav).queryByText('Admin')).not.toBeInTheDocument();

      // Remount with admin role
      act(() => {
        useAuthStore.setState({
          token: 'test-token',
          user: { firstName: 'Admin', role: 'admin', active: true },
          isAuthenticated: true,
          isLoading: false,
          _hasHydrated: true,
          logout: vi.fn(),
        });
        rerender(
          <MemoryRouter initialEntries={['/dashboard']}>
            <Layout>
              <Dashboard />
            </Layout>
          </MemoryRouter>
        );
      });

      // Admin should see all four dropdown triggers including Admin
      nav = screen.getAllByRole('navigation')[0];
      expect(within(nav).getByText('Program')).toBeInTheDocument();
      expect(within(nav).getByText('Employment')).toBeInTheDocument();
      expect(within(nav).getByText('Staff')).toBeInTheDocument();
      expect(within(nav).getByText('Admin')).toBeInTheDocument();
    });
  });
});

