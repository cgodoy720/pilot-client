import React from 'react';
import { render, screen, waitFor, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { apiService } from '../services/api';

// Mock apiService
jest.mock('../services/api', () => ({
  apiService: {
    getCurrentUser: jest.fn(),
    logout: jest.fn(),
    disconnectSalesforce: jest.fn(),
  },
}));

const mockApiService = apiService as jest.Mocked<typeof apiService>;

// Test component that exposes auth context values
function AuthConsumer() {
  const { user, loading } = useAuth();
  if (loading) return <div>loading</div>;
  if (!user) return <div>no-user</div>;
  return <div>user:{user.name}</div>;
}

beforeEach(() => {
  jest.clearAllMocks();
  // Reset window.location for dev bypass tests
  Object.defineProperty(window, 'location', {
    writable: true,
    value: { hostname: 'example.com', href: '' },
  });
});

// ---------------------------------------------------------------------------
// useAuth guard
// ---------------------------------------------------------------------------
describe('useAuth', () => {
  it('throws when used outside AuthProvider', () => {
    // Suppress console.error for the expected error boundary
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    expect(() => render(<AuthConsumer />)).toThrow(
      'useAuth must be used within an AuthProvider',
    );
    spy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// AuthProvider — user fetching
// ---------------------------------------------------------------------------
describe('AuthProvider', () => {
  it('shows loading state while fetching user', () => {
    // Never resolve — stays loading
    mockApiService.getCurrentUser.mockReturnValue(new Promise(() => {}));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    expect(screen.getByText('loading')).toBeInTheDocument();
  });

  it('sets user on successful API response', async () => {
    mockApiService.getCurrentUser.mockResolvedValue({
      data: { email: 'alice@test.com', name: 'Alice', sub: '123' },
    } as any);

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('user:Alice')).toBeInTheDocument();
    });
  });

  it('sets user to null on API error (non-localhost)', async () => {
    mockApiService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('no-user')).toBeInTheDocument();
    });
  });

  it('falls back to dev user on localhost when API fails', async () => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { hostname: 'localhost', href: '' },
    });
    mockApiService.getCurrentUser.mockRejectedValue(new Error('Unauthorized'));

    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>,
    );

    await waitFor(() => {
      expect(screen.getByText('user:Dev User')).toBeInTheDocument();
    });
  });
});
