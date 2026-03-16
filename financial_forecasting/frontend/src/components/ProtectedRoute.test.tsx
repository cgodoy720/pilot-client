import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';

// Mock useAuth
const mockUseAuth = jest.fn();
jest.mock('../contexts/AuthContext', () => ({
  useAuth: () => mockUseAuth(),
}));

// Helper to capture Navigate behavior
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    Navigate: (props: any) => {
      mockNavigate(props);
      return null;
    },
  };
});

beforeEach(() => {
  jest.clearAllMocks();
});

describe('ProtectedRoute', () => {
  it('shows a loading spinner when auth is loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: true });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>protected content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    // Should show spinner, not content
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('redirects to /login when user is null and not loading', () => {
    mockUseAuth.mockReturnValue({ user: null, loading: false });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>protected content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith(
      expect.objectContaining({ to: '/login', replace: true }),
    );
  });

  it('renders children when user is authenticated', () => {
    mockUseAuth.mockReturnValue({
      user: { name: 'Alice', email: 'alice@test.com', sub: '123' },
      loading: false,
    });

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>protected content</div>
        </ProtectedRoute>
      </MemoryRouter>,
    );

    expect(screen.getByText('protected content')).toBeInTheDocument();
  });
});
