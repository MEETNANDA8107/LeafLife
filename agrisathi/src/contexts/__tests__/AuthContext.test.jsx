import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../AuthContext.jsx';

// Mock the auth service so we don't depend on crypto.subtle in this test
vi.mock('../../services/auth.js', () => ({
  login: vi.fn(async (identifier, password) => {
    if (identifier === 'test@example.com' && password === 'correct') {
      return { id: '1', email: 'test@example.com', fullName: 'Test User' };
    }
    throw new Error('Invalid credentials');
  }),
  signup: vi.fn(async (userData) => ({
    id: Date.now().toString(),
    ...userData,
    password: undefined,
  })),
  getCurrentUser: vi.fn(() => null),
}));

// Helper component to expose context values in the DOM for assertions
function AuthConsumer() {
  const { user, isAuthenticated, login, logout } = useAuth();
  return (
    <div>
      <span data-testid="auth-status">{isAuthenticated ? 'authenticated' : 'anonymous'}</span>
      <span data-testid="user-name">{user?.fullName || 'none'}</span>
      <button data-testid="login-btn" onClick={() => login('test@example.com', 'correct')}>
        Login
      </button>
      <button data-testid="bad-login-btn" onClick={() => login('test@example.com', 'wrong').catch(() => {})}>
        Bad Login
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

describe('AuthContext', () => {
  it('starts as unauthenticated with no user', () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    expect(screen.getByTestId('auth-status').textContent).toBe('anonymous');
    expect(screen.getByTestId('user-name').textContent).toBe('none');
  });

  it('becomes authenticated after successful login', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });
    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');
    expect(screen.getByTestId('user-name').textContent).toBe('Test User');
  });

  it('sets localStorage after login', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });
    expect(localStorage.setItem).toHaveBeenCalledWith(
      'agrisathi_current_user',
      expect.stringContaining('Test User')
    );
  });

  it('reverts to anonymous after logout', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    // Login first
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });
    expect(screen.getByTestId('auth-status').textContent).toBe('authenticated');

    // Logout
    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });
    expect(screen.getByTestId('auth-status').textContent).toBe('anonymous');
    expect(screen.getByTestId('user-name').textContent).toBe('none');
  });

  it('clears localStorage on logout', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('login-btn').click();
    });
    await act(async () => {
      screen.getByTestId('logout-btn').click();
    });
    expect(localStorage.removeItem).toHaveBeenCalledWith('agrisathi_current_user');
  });

  it('stays anonymous on failed login', async () => {
    render(
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    );
    await act(async () => {
      screen.getByTestId('bad-login-btn').click();
    });
    expect(screen.getByTestId('auth-status').textContent).toBe('anonymous');
  });

  it('renders children only after loading completes', () => {
    const { container } = render(
      <AuthProvider>
        <div data-testid="child">Child Content</div>
      </AuthProvider>
    );
    // AuthProvider renders children after loading=false
    expect(screen.getByTestId('child').textContent).toBe('Child Content');
  });
});
