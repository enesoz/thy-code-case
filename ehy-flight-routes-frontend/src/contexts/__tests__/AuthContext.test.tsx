import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authApi from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
  setUnauthorizedCallback: vi.fn(),
}));

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <BrowserRouter>
      <AuthProvider>{children}</AuthProvider>
    </BrowserRouter>
  );

  describe('Initial State', () => {
    it('should have null user and token initially', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
        expect(result.current.isAdmin).toBe(false);
      });
    });

    it('should load auth state from localStorage on mount', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'ADMIN' as const };

      // Create a valid token (not expired)
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: futureExp, role: 'ADMIN' })) + '.' +
        'signature';

      localStorage.setItem('token', validToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toBe(validToken);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAdmin).toBe(true);
      });
    });

    it('should clear expired token from localStorage on mount', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'ADMIN' };

      // Create an expired token
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: pastExp, role: 'ADMIN' })) + '.' +
        'signature';

      localStorage.setItem('token', expiredToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Should have cleared localStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Login Functionality', () => {
    it('should login successfully and store auth data', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'ADMIN' as const };

      // Create a valid token
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: futureExp, role: 'ADMIN' })) + '.' +
        'signature';

      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockResolvedValue({
        token: validToken,
        tokenType: 'Bearer',
        userId: mockUser.id,
        username: mockUser.username,
        role: mockUser.role,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await act(async () => {
        await result.current.login('admin', 'admin123');
      });

      await waitFor(() => {
        expect(result.current.user).toEqual(mockUser);
        expect(result.current.token).toBe(validToken);
        expect(result.current.isAuthenticated).toBe(true);
        expect(result.current.isAdmin).toBe(true);
      });

      // Should have stored in localStorage
      expect(localStorage.getItem('token')).toBe(validToken);
      expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser));
    });

    it('should reject invalid token format on login', async () => {
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockResolvedValue({
        token: 'invalid-token',
        tokenType: 'Bearer',
        userId: '1',
        username: 'admin',
        role: 'ADMIN' as const,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('admin', 'admin123');
        })
      ).rejects.toThrow('Invalid token format');

      // Should not have stored anything
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });

    it('should reject expired token on login', async () => {
      // Create an expired token
      const pastExp = Math.floor(Date.now() / 1000) - 3600;
      const expiredToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: pastExp, role: 'ADMIN' })) + '.' +
        'signature';

      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockResolvedValue({
        token: expiredToken,
        tokenType: 'Bearer',
        userId: '1',
        username: 'admin',
        role: 'ADMIN' as const,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('admin', 'admin123');
        })
      ).rejects.toThrow('expired token');
    });

    it('should clear auth data on login failure', async () => {
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockRejectedValue({
        message: 'Invalid credentials',
        status: 401,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });

      await expect(
        act(async () => {
          await result.current.login('wrong', 'wrong123');
        })
      ).rejects.toEqual({
        message: 'Invalid credentials',
        status: 401,
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
      });
    });
  });

  describe('Logout Functionality', () => {
    it('should clear auth data on logout', async () => {
      const mockUser = { id: '1', username: 'admin', role: 'ADMIN' as const };
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const validToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: futureExp, role: 'ADMIN' })) + '.' +
        'signature';

      localStorage.setItem('token', validToken);
      localStorage.setItem('user', JSON.stringify(mockUser));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(true);
      });

      act(() => {
        result.current.logout();
      });

      await waitFor(() => {
        expect(result.current.user).toBeNull();
        expect(result.current.token).toBeNull();
        expect(result.current.isAuthenticated).toBe(false);
      });

      // Should have cleared localStorage
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Token Expiration Check', () => {
    it('should periodically check token expiration', async () => {
      // Create a token that will expire in 20 seconds
      const shortExp = Math.floor(Date.now() / 1000) + 20;
      const shortLivedToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: shortExp, role: 'ADMIN' })) + '.' +
        'signature';

      localStorage.setItem('token', shortLivedToken);
      localStorage.setItem('user', JSON.stringify({ id: '1', username: 'admin', role: 'ADMIN' }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAuthenticated).toBe(false); // Within buffer, should be expired
      });
    });
  });

  describe('isAdmin Property', () => {
    it('should return true for ADMIN role', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const adminToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'admin', exp: futureExp, role: 'ADMIN' })) + '.' +
        'signature';

      localStorage.setItem('token', adminToken);
      localStorage.setItem('user', JSON.stringify({ id: '1', username: 'admin', role: 'ADMIN' }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(true);
      });
    });

    it('should return false for AGENCY role', async () => {
      const futureExp = Math.floor(Date.now() / 1000) + 3600;
      const agencyToken = btoa(JSON.stringify({ alg: 'HS256' })) + '.' +
        btoa(JSON.stringify({ sub: 'agency', exp: futureExp, role: 'AGENCY' })) + '.' +
        'signature';

      localStorage.setItem('token', agencyToken);
      localStorage.setItem('user', JSON.stringify({ id: '2', username: 'agency', role: 'AGENCY' }));

      const { result } = renderHook(() => useAuth(), { wrapper });

      await waitFor(() => {
        expect(result.current.isAdmin).toBe(false);
      });
    });
  });

  describe('Error Handling', () => {
    it('should throw error when useAuth is used outside AuthProvider', () => {
      // Suppress console.error for this test
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

      expect(() => {
        renderHook(() => useAuth());
      }).toThrow('useAuth must be used within an AuthProvider');

      consoleError.mockRestore();
    });
  });
});
