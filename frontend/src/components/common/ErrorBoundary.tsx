import { Component, type ErrorInfo, type ReactNode } from 'react';
import type { NavigateFunction } from 'react-router-dom';

interface Props {
  children: ReactNode;
  navigate: NavigateFunction;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  handleGoHome = (): void => {
    this.handleReset();
    this.props.navigate('/');
  };

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-3xl font-extrabold text-gray-900">
                Oops! Something went wrong
              </h2>
              <div className="mt-4 text-sm text-gray-600">
                <p className="mb-2">
                  We're sorry for the inconvenience. An unexpected error has occurred.
                </p>
                {this.state.error && (
                  <details className="mt-4 text-left bg-gray-100 p-4 rounded-lg">
                    <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                      Error Details
                    </summary>
                    <pre className="text-xs overflow-auto text-red-600">
                      {this.state.error.toString()}
                    </pre>
                    {this.state.errorInfo && (
                      <pre className="text-xs overflow-auto mt-2 text-gray-600">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </details>
                )}
              </div>
              <div className="mt-6 space-x-4">
                <button
                  onClick={this.handleReset}
                  className="btn-primary"
                  aria-label="Try again"
                >
                  Try Again
                </button>
                <button
                  onClick={this.handleGoHome}
                  className="btn-secondary"
                  aria-label="Go to home page"
                >
                  Go to Home
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
