import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '../AuthContext';
import * as authApi from '../../services/api';
import { generateMockJWT } from '../../test/testUtils';

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
      const validToken = generateMockJWT('admin', 'ADMIN');

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
      const expiredToken = generateMockJWT('admin', 'ADMIN', -3600); // Expired 1 hour ago

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
      const validToken = generateMockJWT('admin', 'ADMIN');

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
      const expiredToken = generateMockJWT('admin', 'ADMIN', -3600); // Expired 1 hour ago

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
      const validToken = generateMockJWT('admin', 'ADMIN');

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
