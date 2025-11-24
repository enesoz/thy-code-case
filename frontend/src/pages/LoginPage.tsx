import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { formatErrorMessage } from '../utils';
import type { LoginFormData } from '../types';
import LoadingSpinner from '../components/common/LoadingSpinner';

const LoginPage: React.FC = () => {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>();

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/routes" replace />;
  }

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login(data.username, data.password);
      navigate('/routes');
    } catch (error) {
      setErrorMessage(formatErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-500 to-primary-700 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white rounded-lg shadow-2xl p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4" aria-hidden="true">
              ✈️
            </div>
            <h2 className="text-3xl font-extrabold text-gray-900">Enes Airlines</h2>
            <p className="mt-2 text-sm text-gray-600">
              Sign in to access the flight route system
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div
              className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
              role="alert"
            >
              <p className="text-sm">{errorMessage}</p>
            </div>
          )}

          {/* Login Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div>
              <label htmlFor="username" className="label">
                Username
              </label>
              <input
                id="username"
                type="text"
                autoComplete="username"
                disabled={isLoading}
                className={`input-field ${errors.username ? 'input-error' : ''}`}
                {...register('username', {
                  required: 'Username is required',
                  minLength: {
                    value: 3,
                    message: 'Username must be at least 3 characters',
                  },
                })}
                aria-invalid={errors.username ? 'true' : 'false'}
                aria-describedby={errors.username ? 'username-error' : undefined}
              />
              {errors.username && (
                <p className="error-message" id="username-error" role="alert">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="label">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={isLoading}
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                aria-invalid={errors.password ? 'true' : 'false'}
                aria-describedby={errors.password ? 'password-error' : undefined}
              />
              {errors.password && (
                <p className="error-message" id="password-error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-primary flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner size="sm" className="mr-2" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};

export default LoginPage;
