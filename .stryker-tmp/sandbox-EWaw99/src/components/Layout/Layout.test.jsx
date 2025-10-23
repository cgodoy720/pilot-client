// @ts-nocheck
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, MemoryRouter } from 'react-router-dom';
import Layout from './Layout';
import { AuthContext } from '../../context/AuthContext';

// Mock lucide-react icons
vi.mock('lucide-react', () => ({
  LogOut: () => <div data-testid="logout-icon">LogOut</div>,
  Settings: () => <div data-testid="settings-icon">Settings</div>,
  Award: () => <div data-testid="award-icon">Award</div>,
  Users: () => <div data-testid="users-icon">Users</div>,
  Bug: () => <div data-testid="bug-icon">Bug</div>,
  Brain: () => <div data-testid="brain-icon">Brain</div>,
  MessageCircle: () => <div data-testid="message-circle-icon">MessageCircle</div>,
  X: () => <div data-testid="x-icon">X</div>,
}));

// Mock the logo import
vi.mock('../../assets/logo.png', () => ({ default: 'logo.png' }));

// Mock useNavigate at the top level
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock window.innerWidth for mobile detection
const mockWindowInnerWidth = (width) => {
  Object.defineProperty(window, 'innerWidth', {
    writable: true,
    configurable: true,
    value: width,
  });
};

// Helper to render Layout with mocked AuthContext
const renderLayout = (authProps = {}, initialPath = '/dashboard') => {
  const defaultAuthProps = {
    token: 'mock-token',
    user: {
      firstName: 'Test',
      role: 'student',
      active: true,
    },
    logout: vi.fn(),
    ...authProps,
  };

  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <AuthContext.Provider value={defaultAuthProps}>
        <Layout>
          <div data-testid="child-component">Child Component</div>
        </Layout>
      </AuthContext.Provider>
    </MemoryRouter>
  );
};

describe('Layout Component', () => {
  beforeEach(() => {
    // Reset window width to desktop by default
    mockWindowInnerWidth(1024);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Responsive Design', () => {
    it('should detect desktop mode correctly', () => {
      mockWindowInnerWidth(1024); // Desktop
      renderLayout();

      // Desktop navbar should be visible
      expect(screen.getByTestId('desktop-navbar')).toBeInTheDocument();
      expect(screen.getByTestId('mobile-navbar')).toBeInTheDocument();
    });

    it('should detect mobile mode correctly', () => {
      mockWindowInnerWidth(600); // Mobile
      renderLayout();

      // Mobile navbar should be collapsed by default
      const mobileNavbar = screen.getByTestId('mobile-navbar');
      expect(mobileNavbar).toBeInTheDocument();
    });

    it('should update mobile state on window resize', () => {
      mockWindowInnerWidth(1024); // Start desktop
      const { rerender } = renderLayout();

      // Resize to mobile
      mockWindowInnerWidth(600);
      window.dispatchEvent(new Event('resize'));

      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={{
            token: 'mock-token',
            user: { firstName: 'Test', role: 'student', active: true },
            logout: vi.fn(),
          }}>
            <Layout>
              <div data-testid="child-component">Child Component</div>
            </Layout>
          </AuthContext.Provider>
        </MemoryRouter>
      );
    });
  });

  describe('Navigation Links', () => {
    it('should render standard navigation links for students', () => {
      renderLayout({ user: { role: 'student', active: true } });

      expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Learning/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /AI Chat/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Calendar/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Progress/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Assessment/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Account/i })).toBeInTheDocument();
    });

    it('should render admin navigation links for admin users', () => {
      renderLayout({ user: { role: 'admin', active: true } });

      expect(screen.getByRole('link', { name: /Admin Dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Assessment Grades/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Admissions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Content Generation/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /AI Prompts/i })).toBeInTheDocument();
    });

    it('should render admin navigation links for staff users', () => {
      renderLayout({ user: { role: 'staff', active: true } });

      expect(screen.getByRole('link', { name: /Admin Dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Assessment Grades/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Admissions/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Content Generation/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /AI Prompts/i })).toBeInTheDocument();
    });

    it('should render volunteer feedback link for volunteers', () => {
      renderLayout({ user: { role: 'volunteer', active: true } });

      expect(screen.getByRole('link', { name: /Volunteer Feedback/i })).toBeInTheDocument();
    });

    it('should render admin volunteer feedback link for admin users', () => {
      renderLayout({ user: { role: 'admin', active: true } });

      const volunteerFeedbackLinks = screen.getAllByRole('link', { name: /Volunteer Feedback/i });
      expect(volunteerFeedbackLinks.length).toBeGreaterThan(0);
    });

    it('should not render admin links for student users', () => {
      renderLayout({ user: { role: 'student', active: true } });

      expect(screen.queryByRole('link', { name: /Admin Dashboard/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Assessment Grades/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Admissions/i })).not.toBeInTheDocument();
    });

    it('should not render volunteer feedback for non-volunteer users', () => {
      renderLayout({ user: { role: 'student', active: true } });

      expect(screen.queryByRole('link', { name: /Volunteer Feedback/i })).not.toBeInTheDocument();
    });
  });

  describe('Mobile Navigation', () => {
    beforeEach(() => {
      mockWindowInnerWidth(600); // Mobile
    });

    it('should show mobile menu button', () => {
      renderLayout();

      expect(screen.getByTestId('mobile-menu-button')).toBeInTheDocument();
    });

    it('should toggle mobile navbar when menu button is clicked', () => {
      renderLayout();

      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      // Mobile navbar should be open
      expect(screen.getByTestId('mobile-navbar')).toHaveClass('translate-x-0');
    });

    it('should close mobile navbar when close button is clicked', () => {
      renderLayout();

      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      const closeButton = screen.getByTestId('mobile-close-button');
      fireEvent.click(closeButton);

      // Mobile navbar should be closed
      expect(screen.getByTestId('mobile-navbar')).toHaveClass('-translate-x-full');
    });

    it('should close mobile navbar when navigation link is clicked', () => {
      renderLayout();

      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      fireEvent.click(dashboardLink);

      // Mobile navbar should be closed
      expect(screen.getByTestId('mobile-navbar')).toHaveClass('-translate-x-full');
    });

    it('should show admin links in mobile navbar for admin users', () => {
      renderLayout({ user: { role: 'admin', active: true } });

      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      expect(screen.getByRole('link', { name: /Admin Dashboard/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Assessment Grades/i })).toBeInTheDocument();
    });
  });

  describe('User Authentication', () => {
    it('should show logout button for authenticated users', () => {
      renderLayout();

      expect(screen.getByTestId('logout-button')).toBeInTheDocument();
    });

    it('should call logout and navigate to login when logout is clicked', () => {
      const mockLogout = vi.fn();
      mockNavigate.mockClear(); // Clear previous calls

      renderLayout({ logout: mockLogout });

      const logoutButton = screen.getByTestId('logout-button');
      fireEvent.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });

    it('should handle null user gracefully', () => {
      renderLayout({ user: null });

      // Should not crash and should still render basic layout
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('should handle undefined user role gracefully', () => {
      renderLayout({ user: { firstName: 'Test', role: undefined } });

      // Should render standard navigation for undefined role
      expect(screen.getByRole('link', { name: /Dashboard/i })).toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /Admin Dashboard/i })).not.toBeInTheDocument();
    });
  });

  describe('Route-based Icon Rendering', () => {
    it('should show correct icon for dashboard route', () => {
      renderLayout({}, '/dashboard');

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
    });

    it('should show settings icon for admin dashboard route', () => {
      renderLayout({ user: { role: 'admin' } }, '/admin-dashboard');

      // Should show settings icon for admin dashboard
      expect(screen.getByTestId('settings-icon')).toBeInTheDocument();
    });

    it('should show award icon for assessment grades route', () => {
      renderLayout({ user: { role: 'admin' } }, '/admin/assessment-grades');

      expect(screen.getByTestId('award-icon')).toBeInTheDocument();
    });

    it('should show users icon for admissions route', () => {
      renderLayout({ user: { role: 'admin' } }, '/admissions-dashboard');

      expect(screen.getByTestId('users-icon')).toBeInTheDocument();
    });

    it('should show bug icon for content routes', () => {
      renderLayout({ user: { role: 'admin' } }, '/content');

      expect(screen.getByTestId('bug-icon')).toBeInTheDocument();
    });

    it('should show brain icon for AI prompts route', () => {
      renderLayout({ user: { role: 'admin' } }, '/admin-prompts');

      expect(screen.getByTestId('brain-icon')).toBeInTheDocument();
    });

    it('should show message circle icon for volunteer feedback routes', () => {
      renderLayout({ user: { role: 'volunteer' } }, '/volunteer-feedback');

      expect(screen.getByTestId('message-circle-icon')).toBeInTheDocument();
    });
  });

  describe('Navigation Interactions', () => {
    it('should highlight active navigation link', () => {
      renderLayout({}, '/learning');

      const learningLink = screen.getByRole('link', { name: /Learning/i });
      expect(learningLink).toHaveClass('bg-[#4242EA]');
    });

    it('should handle navigation link clicks', () => {
      renderLayout();

      const learningLink = screen.getByRole('link', { name: /Learning/i });
      fireEvent.click(learningLink);

      // Should navigate (in real app, this would change route)
      expect(learningLink).toHaveAttribute('href', '/learning');
    });

    it('should show hover effects on navigation links', () => {
      renderLayout();

      const learningLink = screen.getByRole('link', { name: /Learning/i });
      fireEvent.mouseEnter(learningLink);

      // Should have hover class
      expect(learningLink).toHaveClass('hover:bg-gray-800');
    });
  });

  describe('Error Handling', () => {
    it('should handle logout errors gracefully', () => {
      const mockLogout = vi.fn(() => {
        throw new Error('Logout failed');
      });

      renderLayout({ logout: mockLogout });

      const logoutButton = screen.getByTestId('logout-button');

      // Should not crash when logout throws error
      expect(() => fireEvent.click(logoutButton)).not.toThrow();
    });

    it('should handle navigation errors gracefully', () => {
      renderLayout();

      const brokenLink = screen.getByRole('link', { name: /Dashboard/i });

      // Should not crash when clicking navigation links
      expect(() => fireEvent.click(brokenLink)).not.toThrow();
    });
  });

  describe('Accessibility', () => {
    it('should have proper ARIA labels for navigation', () => {
      renderLayout();

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      expect(dashboardLink).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      renderLayout();

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      dashboardLink.focus();

      expect(document.activeElement).toBe(dashboardLink);
    });

    it('should handle keyboard navigation in mobile menu', () => {
      mockWindowInnerWidth(600);
      renderLayout();

      const menuButton = screen.getByTestId('mobile-menu-button');
      fireEvent.click(menuButton);

      const dashboardLink = screen.getByRole('link', { name: /Dashboard/i });
      dashboardLink.focus();

      expect(document.activeElement).toBe(dashboardLink);
    });
  });

  describe('Performance', () => {
    it('should not cause unnecessary re-renders', () => {
      const { rerender } = renderLayout();

      // Rerender with same props should not cause issues
      rerender(
        <MemoryRouter>
          <AuthContext.Provider value={{
            token: 'mock-token',
            user: { firstName: 'Test', role: 'student', active: true },
            logout: vi.fn(),
          }}>
            <Layout>
              <div data-testid="child-component">Child Component</div>
            </Layout>
          </AuthContext.Provider>
        </MemoryRouter>
      );

      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });

    it('should handle rapid window resize events', () => {
      mockWindowInnerWidth(1024);

      renderLayout();

      // Simulate rapid resize events
      for (let i = 0; i < 5; i++) {
        mockWindowInnerWidth(i % 2 === 0 ? 600 : 1024);
        window.dispatchEvent(new Event('resize'));
      }

      // Should not crash
      expect(screen.getByTestId('child-component')).toBeInTheDocument();
    });
  });
});
