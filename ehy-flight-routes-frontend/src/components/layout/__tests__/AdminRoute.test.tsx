import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import AdminRoute from '../AdminRoute';
import { AuthProvider } from '../../../contexts/AuthContext';

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

describe('AdminRoute', () => {
  const TestContent = () => <div>Admin Content</div>;

  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderAdminRoute = (role: 'ADMIN' | 'AGENCY' | null = null) => {
    if (role) {
      // Set token in localStorage to simulate authenticated state
      localStorage.setItem('token', 'mock-token');
      localStorage.setItem('user', JSON.stringify({ id: '1', username: 'test', role }));
    } else {
      localStorage.clear();
    }

    return render(
      <BrowserRouter>
        <AuthProvider>
          <AdminRoute>
            <TestContent />
          </AdminRoute>
        </AuthProvider>
      </BrowserRouter>
    );
  };

  it('should render children when user is admin', () => {
    renderAdminRoute('ADMIN');
    expect(screen.getByText('Admin Content')).toBeInTheDocument();
  });

  it('should redirect to login when not authenticated', () => {
    renderAdminRoute(null);
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/login', true);
  });

  it('should redirect to routes when authenticated but not admin', () => {
    renderAdminRoute('AGENCY');
    expect(screen.queryByText('Admin Content')).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/routes', true);
  });

  it('should use replace navigation for redirects', () => {
    renderAdminRoute('AGENCY');
    expect(mockNavigate).toHaveBeenCalledWith('/routes', true);
  });
});
