import { type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import ErrorBoundary from './ErrorBoundary';

interface ErrorBoundaryWrapperProps {
  children: ReactNode;
}

/**
 * Wrapper component that provides navigation to ErrorBoundary
 * Allows ErrorBoundary class component to use React Router navigation
 */
const ErrorBoundaryWrapper: React.FC<ErrorBoundaryWrapperProps> = ({ children }) => {
  const navigate = useNavigate();

  return <ErrorBoundary navigate={navigate}>{children}</ErrorBoundary>;
};

export default ErrorBoundaryWrapper;
