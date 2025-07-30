'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  level?: 'page' | 'component' | 'critical';
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log error details
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Call custom error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      level: this.props.level || 'component',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    };

    // In production, send to error monitoring service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to Sentry, LogRocket, etc.
      console.log('Error report:', errorReport);
    }
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: ''
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI based on level
      return this.renderErrorUI();
    }

    return this.props.children;
  }

  private renderErrorUI() {
    const { level = 'component', showDetails = false } = this.props;
    const { error, errorInfo, errorId } = this.state;

    if (level === 'critical') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-900 to-red-800 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Critical Error</h1>
            <p className="text-red-200 mb-6">
              The application encountered a critical error and needs to be restarted.
            </p>
            <div className="space-y-3">
              <button
                onClick={this.handleReload}
                className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Restart Application
              </button>
              <p className="text-xs text-red-300">Error ID: {errorId}</p>
            </div>
          </div>
        </div>
      );
    }

    if (level === 'page') {
      return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-4">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-lg w-full">
            <div className="text-center mb-6">
              <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-white mb-2">Page Error</h1>
              <p className="text-gray-300">
                This page encountered an error and couldn't load properly.
              </p>
            </div>

            {showDetails && error && (
              <div className="bg-black/20 rounded-lg p-4 mb-6">
                <h3 className="text-sm font-semibold text-red-400 mb-2">Error Details:</h3>
                <p className="text-xs text-gray-300 font-mono break-all">
                  {error.message}
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleRetry}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
              >
                <Home className="w-4 h-4" />
                Go Home
              </button>
            </div>

            <p className="text-xs text-gray-400 text-center mt-4">
              Error ID: {errorId}
            </p>
          </div>
        </div>
      );
    }

    // Component level error
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-red-800 mb-1">
              Component Error
            </h3>
            <p className="text-sm text-red-700 mb-3">
              This component encountered an error and couldn't render properly.
            </p>

            {showDetails && error && (
              <details className="mb-3">
                <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                  Show technical details
                </summary>
                <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 break-all">
                  {error.message}
                </div>
              </details>
            )}

            <div className="flex gap-2">
              <button
                onClick={this.handleRetry}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
              >
                <RefreshCw className="w-3 h-3" />
                Retry
              </button>
              {process.env.NODE_ENV === 'development' && (
                <button
                  onClick={() => console.log('Error details:', { error, errorInfo })}
                  className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                >
                  <Bug className="w-3 h-3" />
                  Debug
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
}

// Specialized error boundaries for different use cases
export const PageErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="page" showDetails={process.env.NODE_ENV === 'development'}>
    {children}
  </ErrorBoundary>
);

export const ComponentErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="component" showDetails={false}>
    {children}
  </ErrorBoundary>
);

export const CriticalErrorBoundary: React.FC<{ children: ReactNode }> = ({ children }) => (
  <ErrorBoundary level="critical" showDetails={true}>
    {children}
  </ErrorBoundary>
);

export default ErrorBoundary;
