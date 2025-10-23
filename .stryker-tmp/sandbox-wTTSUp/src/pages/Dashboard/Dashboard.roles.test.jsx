// @ts-nocheck
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Dashboard from './Dashboard';
import Layout from '../../components/Layout/Layout';
import { AuthContext } from '../../context/AuthContext';

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

vi.mock('lucide-react', () => ({
  AlertTriangle: () => <div>AlertTriangle</div>,
  Calendar: () => <div>Calendar</div>,
  BookOpen: () => <div>BookOpen</div>,
  ArrowRight: () => <div>ArrowRight</div>,
  ChevronLeft: () => <div>ChevronLeft</div>,
  ChevronRight: () => <div>ChevronRight</div>,
  LogOut: () => <div>LogOut</div>,
  Settings: () => <div>Settings</div>,
  Award: () => <div>Award</div>,
  Users: () => <div>Users</div>,
  Bug: () => <div>Bug</div>,
  Brain: () => <div>Brain</div>,
  MessageCircle: () => <div>MessageCircle</div>,
  X: () => <div>X</div>,
}));

/**
 * Helper to render Layout + Dashboard with authentication context
 */
const renderWithLayout = (authValue = {}) => {
  const defaultAuthValue = {
    token: 'test-token',
    user: {
      firstName: 'Test',
      role: 'student',
      active: true
    },
    isAuthenticated: true,
    isLoading: false,
    logout: vi.fn(),
    ...authValue
  };

  return render(
    <MemoryRouter initialEntries={['/dashboard']}>
      <AuthContext.Provider value={defaultAuthValue}>
        <Layout>
          <Dashboard />
        </Layout>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

/**
 * Helper to render just Dashboard without Layout (for Dashboard-specific tests)
 */
const renderDashboardOnly = (authValue = {}) => {
  const defaultAuthValue = {
    token: 'test-token',
    user: {
      firstName: 'Test',
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

describe('Dashboard - Role-Based Access Control', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockNavigate.mockClear();
    
    // Mock fetch for dashboard data
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        day: { daily_goal: 'Test goal', week: 1, level: 1, weekly_goal: 'Test' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      })
    });
    
    import.meta.env.VITE_API_URL = 'http://localhost:3000';
  });

  describe('Student/Builder Role', () => {
    it('should show standard navigation items for students', async () => {
      renderWithLayout({
        user: { firstName: 'Student', role: 'student', active: true }
      });

      // Standard navigation items should be present
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('AI Chat')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      expect(screen.getByText('Progress')).toBeInTheDocument();
      expect(screen.getByText('Assessment')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should NOT show admin navigation items for students', () => {
      renderWithLayout({
        user: { firstName: 'Student', role: 'student', active: true }
      });

      // Admin-only items should NOT be present
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Assessment Grades')).not.toBeInTheDocument();
      expect(screen.queryByText('Admissions')).not.toBeInTheDocument();
      expect(screen.queryByText('Content Generation')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Prompts')).not.toBeInTheDocument();
    });

    it('should NOT show volunteer feedback for students', () => {
      renderWithLayout({
        user: { firstName: 'Student', role: 'student', active: true }
      });

      expect(screen.queryByText('Volunteer Feedback')).not.toBeInTheDocument();
    });

    it('should render dashboard content for active students', async () => {
      const mockData = {
        day: { daily_goal: 'Learn Testing', week: 1, level: 1, weekly_goal: 'Test' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 0
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => []
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

      // Standard items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
      
      // No admin items
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Volunteer Feedback')).not.toBeInTheDocument();
    });
  });

  describe('Volunteer Role', () => {
    it('should show standard navigation items for volunteers', () => {
      renderWithLayout({
        user: { firstName: 'Volunteer', role: 'volunteer', active: true }
      });

      // Standard navigation
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should show Volunteer Feedback link for volunteers', () => {
      renderWithLayout({
        user: { firstName: 'Volunteer', role: 'volunteer', active: true }
      });

      expect(screen.getByText('Volunteer Feedback')).toBeInTheDocument();
    });

    it('should NOT show admin navigation items for volunteers', () => {
      renderWithLayout({
        user: { firstName: 'Volunteer', role: 'volunteer', active: true }
      });

      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
      expect(screen.queryByText('Assessment Grades')).not.toBeInTheDocument();
      expect(screen.queryByText('Admissions')).not.toBeInTheDocument();
      expect(screen.queryByText('Content Generation')).not.toBeInTheDocument();
      expect(screen.queryByText('AI Prompts')).not.toBeInTheDocument();
    });

    it('should show volunteer-specific dashboard view', async () => {
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

      // Volunteer sees special view (if Card component were available)
      // For now, checking it doesn't show standard student dashboard
      await new Promise(resolve => setTimeout(resolve, 100));
      expect(screen.queryByText(/Hey Jane. Good to see you!/i)).not.toBeInTheDocument();
    });
  });

  describe('Staff Role', () => {
    it('should show standard navigation items for staff', () => {
      renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      // Standard items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should show ALL admin navigation items for staff', () => {
      renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      // Admin items
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Assessment Grades')).toBeInTheDocument();
      expect(screen.getByText('Admissions')).toBeInTheDocument();
      expect(screen.getByText('Content Generation')).toBeInTheDocument();
      expect(screen.getByText('AI Prompts')).toBeInTheDocument();
    });

    it('should show Volunteer Feedback for staff', () => {
      renderWithLayout({
        user: { firstName: 'Staff', role: 'staff', active: true }
      });

      expect(screen.getByText('Volunteer Feedback')).toBeInTheDocument();
    });

    it('should have access to full dashboard with cohort filtering', async () => {
      const mockData = {
        day: { daily_goal: 'Staff goal', week: 1, level: 1, weekly_goal: 'Test' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 5
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      renderDashboardOnly({
        user: { firstName: 'StaffUser', role: 'staff', active: true }
      });

      await screen.findByText(/Hey StaffUser. Good to see you!/i);
      expect(screen.getAllByText(/Staff goal/i)[0]).toBeInTheDocument();
    });
  });

  describe('Admin Role', () => {
    it('should show standard navigation items for admins', () => {
      renderWithLayout({
        user: { firstName: 'Admin', role: 'admin', active: true }
      });

      // Standard items
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Learning')).toBeInTheDocument();
      expect(screen.getByText('Account')).toBeInTheDocument();
    });

    it('should show ALL admin navigation items for admins', () => {
      renderWithLayout({
        user: { firstName: 'Admin', role: 'admin', active: true }
      });

      // All admin items
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Assessment Grades')).toBeInTheDocument();
      expect(screen.getByText('Admissions')).toBeInTheDocument();
      expect(screen.getByText('Content Generation')).toBeInTheDocument();
      expect(screen.getByText('AI Prompts')).toBeInTheDocument();
    });

    it('should show Volunteer Feedback for admins', () => {
      renderWithLayout({
        user: { firstName: 'Admin', role: 'admin', active: true }
      });

      expect(screen.getByText('Volunteer Feedback')).toBeInTheDocument();
    });

    it('should have full access to dashboard features', async () => {
      const mockData = {
        day: { daily_goal: 'Admin goal', week: 5, level: 2, weekly_goal: 'Admin Week' },
        timeBlocks: [],
        taskProgress: [],
        missedAssignmentsCount: 10
      };

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockData
      }).mockResolvedValueOnce({
        ok: true,
        json: async () => []
      });

      renderDashboardOnly({
        user: { firstName: 'AdminUser', role: 'admin', active: true }
      });

      await screen.findByText(/Hey AdminUser. Good to see you!/i);
      expect(screen.getAllByText(/Admin goal/i)[0]).toBeInTheDocument();
    });
  });

  describe('Cross-Role Navigation Link Verification', () => {
    const roles = [
      { name: 'student', hasAdmin: false, hasVolunteer: false },
      { name: 'builder', hasAdmin: false, hasVolunteer: false },
      { name: 'volunteer', hasAdmin: false, hasVolunteer: true },
      { name: 'staff', hasAdmin: true, hasVolunteer: true },
      { name: 'admin', hasAdmin: true, hasVolunteer: true }
    ];

    roles.forEach(({ name, hasAdmin, hasVolunteer }) => {
      it(`should have correct navigation links for ${name} role`, () => {
        renderWithLayout({
          user: { firstName: 'User', role: name, active: true }
        });

        // Everyone has these
        expect(screen.getByText('Dashboard')).toBeInTheDocument();
        expect(screen.getByText('Learning')).toBeInTheDocument();
        expect(screen.getByText('AI Chat')).toBeInTheDocument();
        expect(screen.getByText('Calendar')).toBeInTheDocument();
        expect(screen.getByText('Progress')).toBeInTheDocument();
        expect(screen.getByText('Assessment')).toBeInTheDocument();
        expect(screen.getByText('Account')).toBeInTheDocument();

        // Admin-only items
        if (hasAdmin) {
          expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
          expect(screen.getByText('Assessment Grades')).toBeInTheDocument();
          expect(screen.getByText('Admissions')).toBeInTheDocument();
          expect(screen.getByText('Content Generation')).toBeInTheDocument();
          expect(screen.getByText('AI Prompts')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
          expect(screen.queryByText('Assessment Grades')).not.toBeInTheDocument();
          expect(screen.queryByText('Admissions')).not.toBeInTheDocument();
          expect(screen.queryByText('Content Generation')).not.toBeInTheDocument();
          expect(screen.queryByText('AI Prompts')).not.toBeInTheDocument();
        }

        // Volunteer feedback
        if (hasVolunteer) {
          expect(screen.getByText('Volunteer Feedback')).toBeInTheDocument();
        } else {
          expect(screen.queryByText('Volunteer Feedback')).not.toBeInTheDocument();
        }
      });
    });
  });

  describe('Inactive User Access', () => {
    it('should show limited dashboard for inactive students', async () => {
      renderDashboardOnly({
        user: { firstName: 'Inactive', role: 'student', active: false }
      });

      await screen.findByText(/Historical Access Only/i);
      expect(screen.getByText(/View Past Sessions/i)).toBeInTheDocument();
    });

    it('should still show navigation for inactive users', () => {
      renderWithLayout({
        user: { firstName: 'Inactive', role: 'student', active: false }
      });

      // Navigation is still available
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      expect(screen.getByText('Calendar')).toBeInTheDocument();
    });

    it('should not allow inactive users to start new sessions', async () => {
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

      renderDashboardOnly({
        user: { firstName: 'Inactive', role: 'student', active: false }
      });

      await screen.findByText(/Historical Access Only/i);
      
      // Should not have "Start" button for learning
      expect(screen.queryByText('Start')).not.toBeInTheDocument();
    });
  });

  describe('Navigation Links Accessibility', () => {
    it('should have proper link attributes for all roles', () => {
      renderWithLayout({
        user: { firstName: 'Test', role: 'admin', active: true }
      });

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      const learningLink = screen.getByRole('link', { name: /Learning/i });
      const adminLink = screen.getByRole('link', { name: /Admin Dashboard/i });

      expect(dashboardLink).toHaveAttribute('href', '/dashboard');
      expect(learningLink).toHaveAttribute('href', '/learning');
      expect(adminLink).toHaveAttribute('href', '/admin-dashboard');
    });

    it('should show logout button for all roles', () => {
      renderWithLayout({
        user: { firstName: 'Test', role: 'student', active: true }
      });

      expect(screen.getByText('Logout')).toBeInTheDocument();
    });
  });

  describe('Role Permission Edge Cases', () => {
    it('should handle undefined role gracefully', () => {
      renderWithLayout({
        user: { firstName: 'Unknown', role: undefined, active: true }
      });

      // Standard items should still appear
      expect(screen.getByText('Dashboard')).toBeInTheDocument();
      
      // Admin items should not appear
      expect(screen.queryByText('Admin Dashboard')).not.toBeInTheDocument();
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

      // Both should see admin items
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      
      // Remount with admin role
      rerender(
        <MemoryRouter initialEntries={['/dashboard']}>
          <AuthContext.Provider value={{
            token: 'test-token',
            user: { firstName: 'Admin', role: 'admin', active: true },
            isAuthenticated: true,
            isLoading: false,
            logout: vi.fn()
          }}>
            <Layout>
              <Dashboard />
            </Layout>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      // Admin should also see all admin items
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    });
  });
});

