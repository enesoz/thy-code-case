import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import { AuthProvider } from '../../contexts/AuthContext';
import * as authApi from '../../services/api';

// Mock the API
vi.mock('../../services/api', () => ({
  authApi: {
    login: vi.fn(),
  },
  setUnauthorizedCallback: vi.fn(),
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  const renderLoginPage = () => {
    return render(
      <BrowserRouter>
        <AuthProvider>
          <LoginPage />
        </AuthProvider>
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('should render login form with all elements', () => {
      renderLoginPage();

      expect(screen.getByRole('heading', { name: /enes airlines/i })).toBeInTheDocument();
      expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
    });


    it('should have proper accessibility attributes', () => {
      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);

      expect(usernameInput).toHaveAttribute('autocomplete', 'username');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Form Validation', () => {
    it('should show validation error when username is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/username is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when username is too short', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      await user.type(usernameInput, 'ab');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/username must be at least 3 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should show validation error when password is empty', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/password is required/i)).toBeInTheDocument();
      });
    });

    it('should show validation error when password is too short', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const passwordInput = screen.getByLabelText(/password/i);
      await user.type(passwordInput, '12345');

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        expect(
          screen.getByText(/password must be at least 6 characters/i)
        ).toBeInTheDocument();
      });
    });

    it('should mark invalid fields with aria-invalid', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/username/i);
        const passwordInput = screen.getByLabelText(/password/i);
        expect(usernameInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
      });
    });
  });

  describe('Login Functionality', () => {
    it('should call login API with correct credentials', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockResolvedValue({
        token: 'mock-token',
        tokenType: 'Bearer',
        userId: '1',
        username: 'admin',
        role: 'ADMIN',
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith({
          username: 'admin',
          password: 'admin123',
        });
      });
    });

    it('should show loading state during login', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  token: 'mock-token',
                  tokenType: 'Bearer',
                  userId: '1',
                  username: 'admin',
                  role: 'ADMIN',
                }),
              100
            )
          )
      );

      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      // Should show loading state
      expect(screen.getByText(/signing in/i)).toBeInTheDocument();
      expect(submitButton).toBeDisabled();

      // Inputs should be disabled
      expect(usernameInput).toBeDisabled();
      expect(passwordInput).toBeDisabled();
    });

    it('should navigate to routes page after successful login', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockResolvedValue({
        token: 'mock-token',
        tokenType: 'Bearer',
        userId: '1',
        username: 'admin',
        role: 'ADMIN',
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/routes');
      });
    });

    it('should show error message on login failure', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockRejectedValue({
        message: 'Invalid credentials',
        status: 401,
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      await user.type(usernameInput, 'wrong');
      await user.type(passwordInput, 'wrong123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      });
    });

    it('should clear error message on new submission', async () => {
      const user = userEvent.setup();
      const mockLogin = vi.mocked(authApi.authApi.login);
      mockLogin.mockRejectedValueOnce({
        message: 'Invalid credentials',
        status: 401,
      });

      renderLoginPage();

      const usernameInput = screen.getByLabelText(/username/i);
      const passwordInput = screen.getByLabelText(/password/i);
      const submitButton = screen.getByRole('button', { name: /sign in/i });

      // First attempt - error
      await user.type(usernameInput, 'wrong');
      await user.type(passwordInput, 'wrong123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/invalid credentials/i);
      });

      // Second attempt - error should clear
      mockLogin.mockResolvedValueOnce({
        token: 'mock-token',
        tokenType: 'Bearer',
        userId: '1',
        username: 'admin',
        role: 'ADMIN',
      });

      await user.clear(usernameInput);
      await user.clear(passwordInput);
      await user.type(usernameInput, 'admin');
      await user.type(passwordInput, 'admin123');
      await user.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      });
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      renderLoginPage();

      const form = screen.getByRole('button', { name: /sign in/i }).closest('form');
      expect(form).toHaveAttribute('novalidate');
    });

    it('should associate error messages with inputs', async () => {
      const user = userEvent.setup();
      renderLoginPage();

      const submitButton = screen.getByRole('button', { name: /sign in/i });
      await user.click(submitButton);

      await waitFor(() => {
        const usernameInput = screen.getByLabelText(/username/i);
        const errorId = usernameInput.getAttribute('aria-describedby');
        expect(errorId).toBe('username-error');
        expect(screen.getByText(/username is required/i)).toHaveAttribute('id', 'username-error');
      });
    });
  });
});
