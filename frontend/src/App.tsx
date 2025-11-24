import React, { lazy, Suspense, useMemo } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import ErrorBoundaryWrapper from './components/common/ErrorBoundaryWrapper';
import ProtectedRoute from './components/layout/ProtectedRoute';
import AdminRoute from './components/layout/AdminRoute';
import LoadingSpinner from './components/common/LoadingSpinner';

// Lazy load page components for code splitting
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RoutesPage = lazy(() => import('./pages/RoutesPage'));
const LocationsPage = lazy(() => import('./pages/LocationsPage'));
const TransportationsPage = lazy(() => import('./pages/TransportationsPage'));
const AppLayout = lazy(() => import('./components/layout/AppLayout'));

/**
 * Loading fallback component for Suspense
 */
const PageLoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center min-h-screen">
    <LoadingSpinner size="lg" />
  </div>
);

const App: React.FC = () => {
  // Memoize QueryClient to prevent recreation on re-renders
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
            refetchOnWindowFocus: false,
            // Add retry delay with exponential backoff
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
          },
          mutations: {
            retry: 0,
          },
        },
      }),
    []
  );

  return (
    <BrowserRouter>
      <ErrorBoundaryWrapper>
        <QueryClientProvider client={queryClient}>
          {/* React Query DevTools - Only in development */}
          {import.meta.env.DEV && (
            <ReactQueryDevtools initialIsOpen={false} />
          )}

          {/* Toast notifications */}
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                iconTheme: {
                  primary: '#10b981',
                  secondary: '#fff',
                },
              },
              error: {
                duration: 5000,
                iconTheme: {
                  primary: '#ef4444',
                  secondary: '#fff',
                },
              },
            }}
          />

          <AuthProvider>
            <Suspense fallback={<PageLoadingFallback />}>
              <Routes>
                {/* Public routes */}
                <Route path="/login" element={<LoginPage />} />

                {/* Protected routes */}
                <Route
                  path="/"
                  element={
                    <ProtectedRoute>
                      <AppLayout />
                    </ProtectedRoute>
                  }
                >
                  {/* Default redirect to routes */}
                  <Route index element={<Navigate to="/routes" replace />} />

                  {/* All authenticated users can access routes search */}
                  <Route path="routes" element={<RoutesPage />} />

                  {/* Admin-only routes */}
                  <Route
                    path="locations"
                    element={
                      <AdminRoute>
                        <LocationsPage />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="transportations"
                    element={
                      <AdminRoute>
                        <TransportationsPage />
                      </AdminRoute>
                    }
                  />
                </Route>

                {/* Catch all - redirect to routes */}
                <Route path="*" element={<Navigate to="/routes" replace />} />
              </Routes>
            </Suspense>
          </AuthProvider>
        </QueryClientProvider>
      </ErrorBoundaryWrapper>
    </BrowserRouter>
  );
};

export default App;
