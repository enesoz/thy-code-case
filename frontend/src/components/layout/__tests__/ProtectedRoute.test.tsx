import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ProtectedRoute from '../ProtectedRoute';
import { AuthProvider } from '../../../contexts/AuthContext';
import { generateMockJWT } from '../../../test/testUtils';

// Mock the API
vi.mock('../../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
  setUnauthorizedCallback: vi.fn(),
}));

// Mock Navigate component
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Navigate: ({ to, replace }: { to: string; replace: boolean }) => {
      mockNavigate(to, replace);
      return <div data-testid="navigate">Navigate to {to}</div>;
    },
  };
});

describe('ProtectedRoute', () => {
  const TestContent = () => <div>Protected Content</div>;

  const renderProtectedRoute = (authenticated: boolean = false) => {
    if (authenticated) {
      // Set token in localStorage to simulate authenticated state
      const mockToken = generateMockJWT('test', 'ADMIN');
      localStorage.setItem('token', mockToken);
      localStorage.setItem(
        'user',
        JSON.stringify({ id: '1', username: 'test', role: 'ADMIN' })
      );
    } else {
      localStorage.clear();
    }

    return render(
      <BrowserRouter>
        <AuthProvider>
          <ProtectedRoute>
            <TestContent />
          </ProtectedRoute>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render children when authenticated', () => {
    renderProtectedRoute(true);
    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    renderProtectedRoute(false);
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login', true);
  });

  it('should use replace navigation', () => {
    renderProtectedRoute(false);
    expect(mockNavigate).toHaveBeenCalledWith('/login', true);
  });
});
