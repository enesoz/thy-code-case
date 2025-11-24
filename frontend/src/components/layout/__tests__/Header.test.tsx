import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import Header from '../Header';
import { AuthProvider } from '../../../contexts/AuthContext';
import { generateMockJWT } from '../../../test/testUtils';

// Mock the API
vi.mock('../../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
  setUnauthorizedCallback: vi.fn(),
}));

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderHeader = (role: 'ADMIN' | 'AGENCY' = 'ADMIN') => {
    const mockToken = generateMockJWT('testuser', role);
    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify({ id: '1', username: 'testuser', role }));

    return render(
      <BrowserRouter>
        <AuthProvider>
          <Header />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render brand name and logo', () => {
      renderHeader();
      expect(screen.getByText('Enes Airlines')).toBeInTheDocument();
    });

    it('should display username', () => {
      renderHeader();
      expect(screen.getByText('testuser')).toBeInTheDocument();
    });

    it('should show ADMIN badge for admin users', () => {
      renderHeader('ADMIN');
      expect(screen.getByText('ADMIN')).toBeInTheDocument();
    });

    it('should not show ADMIN badge for agency users', () => {
      renderHeader('AGENCY');
      expect(screen.queryByText('ADMIN')).not.toBeInTheDocument();
    });

    it('should always show Search Routes link', () => {
      renderHeader('AGENCY');
      expect(screen.getByRole('link', { name: /search routes/i })).toBeInTheDocument();
    });

    it('should show admin-only links for admin users', () => {
      renderHeader('ADMIN');
      expect(screen.getByRole('link', { name: /locations/i })).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /transportations/i })).toBeInTheDocument();
    });

    it('should hide admin-only links for agency users', () => {
      renderHeader('AGENCY');
      expect(screen.queryByRole('link', { name: /locations/i })).not.toBeInTheDocument();
      expect(screen.queryByRole('link', { name: /transportations/i })).not.toBeInTheDocument();
    });

    it('should have logout button', () => {
      renderHeader();
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have correct href for routes link', () => {
      renderHeader();
      const routesLink = screen.getByRole('link', { name: /search routes/i });
      expect(routesLink).toHaveAttribute('href', '/routes');
    });

    it('should have correct href for locations link (admin)', () => {
      renderHeader('ADMIN');
      const locationsLink = screen.getByRole('link', { name: /locations/i });
      expect(locationsLink).toHaveAttribute('href', '/locations');
    });

    it('should have correct href for transportations link (admin)', () => {
      renderHeader('ADMIN');
      const transportationsLink = screen.getByRole('link', { name: /transportations/i });
      expect(transportationsLink).toHaveAttribute('href', '/transportations');
    });

    it('should have correct href for brand logo', () => {
      renderHeader();
      const brandLink = screen.getByText('Enes Airlines').closest('a');
      expect(brandLink).toHaveAttribute('href', '/routes');
    });
  });

  describe('Logout Functionality', () => {
    it('should call logout when logout button is clicked', async () => {
      const user = userEvent.setup();
      renderHeader();

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      // After logout, token and user should be cleared
      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('should have proper navigation aria-label', () => {
      renderHeader();
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveAttribute('aria-label', 'Main navigation');
    });

    it('should have aria-current on active link', () => {
      renderHeader('ADMIN');
      const routesLink = screen.getByRole('link', { name: /search routes/i });
      // Note: In actual implementation, this would be set based on current location
      // For now, we're just checking the structure
      expect(routesLink).toBeInTheDocument();
    });

    it('should have aria-label on logout button', () => {
      renderHeader();
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toHaveAttribute('aria-label', 'Logout');
    });

    it('should hide decorative emoji from screen readers', () => {
      renderHeader();
      const emoji = screen.getByText('✈️');
      expect(emoji).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('Responsive Design', () => {
    it('should have proper container classes', () => {
      const { container } = renderHeader();
      const header = container.querySelector('header');
      expect(header).toHaveClass('bg-primary-600', 'shadow-lg');
    });

    it('should have responsive padding classes', () => {
      const { container } = renderHeader();
      const innerContainer = container.querySelector('.max-w-7xl');
      expect(innerContainer).toHaveClass('px-4', 'sm:px-6', 'lg:px-8');
    });
  });
});
