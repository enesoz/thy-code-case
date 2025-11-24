import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react';
import { authApi, setUnauthorizedCallback } from '../services/api';
import type { User, AuthContextType } from '../types';
import { UserRole } from '../types';
import { isTokenExpired, isValidTokenFormat } from '../utils/tokenUtils';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// Token check interval: every 30 seconds
const TOKEN_CHECK_INTERVAL = 30000;

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    return stored ? (JSON.parse(stored) as User) : null;
  });
  const [isLoading, setIsLoading] = useState(false);
  const tokenCheckIntervalRef = useRef<number | null>(null);

  /**
   * Clears auth data from state and localStorage
   */
  const clearAuthData = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);

    // Clear interval if exists
    if (tokenCheckIntervalRef.current) {
      clearInterval(tokenCheckIntervalRef.current);
      tokenCheckIntervalRef.current = null;
    }
  }, []);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser) as User;
        setToken(storedToken);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing stored auth data:', error);
        clearAuthData();
      }
    }

    setIsLoading(false);
  }, [clearAuthData]);

  // Periodic token expiration check
  useEffect(() => {
    if (!token) {
      return;
    }

    // Immediate check
    if (isTokenExpired(token)) {
      console.warn('Token expired during periodic check, logging out');
      clearAuthData();
      return;
    }

    // Set up periodic check
    tokenCheckIntervalRef.current = setInterval(() => {
      const currentToken = localStorage.getItem('token');
      if (!currentToken || isTokenExpired(currentToken)) {
        console.warn('Token expired during periodic check, logging out');
        clearAuthData();
      }
    }, TOKEN_CHECK_INTERVAL);

    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
    };
  }, [token, clearAuthData]);

  const login = async (username: string, password: string): Promise<void> => {
    try {
      const response = await authApi.login({ username, password });

      // Validate required fields
      if (!response.token || !response.userId || !response.username || !response.role) {
        throw new Error('Invalid response from server: missing required fields');
      }

      // Validate token before storing
      if (!isValidTokenFormat(response.token)) {
        throw new Error('Invalid token format received from server');
      }

      if (isTokenExpired(response.token)) {
        throw new Error('Received expired token from server');
      }

      // Transform backend response to match frontend User type
      // Backend returns: { token, tokenType, userId, username, role }
      // Frontend expects: { token, user: { id, username, role } }
      const user = {
        id: response.userId,
        username: response.username,
        role: response.role,
      };

      // Store token and user data
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(user));

      setToken(response.token);
      setUser(user);
    } catch (error) {
      // Clear any existing auth data on login failure
      clearAuthData();
      throw error;
    }
  };

  /**
   * Logout function that will be passed to API interceptor
   * Uses callback pattern to avoid circular dependency
   */
  const logout = useCallback((): void => {
    clearAuthData();
    // Note: Navigation will be handled by ProtectedRoute when user/token becomes null
  }, [clearAuthData]);

  // Register logout callback with API service on mount
  useEffect(() => {
    setUnauthorizedCallback(logout);
  }, [logout]);

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === UserRole.ADMIN,
  };

  // Don't render children until initial auth state is loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
