'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Wifi, WifiOff } from 'lucide-react';

interface AsyncErrorBoundaryProps {
  children: ReactNode;
  fallback?: (error: Error, retry: () => void) => ReactNode;
  onError?: (error: Error) => void;
}

interface AsyncError {
  error: Error;
  timestamp: number;
  retryCount: number;
}

export const AsyncErrorBoundary: React.FC<AsyncErrorBoundaryProps> = ({
  children,
  fallback,
  onError
}) => {
  const [asyncError, setAsyncError] = useState<AsyncError | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
      
      setAsyncError({
        error,
        timestamp: Date.now(),
        retryCount: 0
      });

      if (onError) {
        onError(error);
      }

      // Prevent the error from being logged to console
      event.preventDefault();
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, [onError]);

  const retry = () => {
    if (asyncError) {
      setAsyncError({
        ...asyncError,
        retryCount: asyncError.retryCount + 1
      });
      
      // Clear error after a short delay to allow retry
      setTimeout(() => {
        setAsyncError(null);
      }, 100);
    }
  };

  const clearError = () => {
    setAsyncError(null);
  };

  if (asyncError) {
    if (fallback) {
      return <>{fallback(asyncError.error, retry)}</>;
    }

    return (
      <AsyncErrorFallback
        error={asyncError.error}
        retryCount={asyncError.retryCount}
        isOnline={isOnline}
        onRetry={retry}
        onClear={clearError}
      />
    );
  }

  return <>{children}</>;
};

interface AsyncErrorFallbackProps {
  error: Error;
  retryCount: number;
  isOnline: boolean;
  onRetry: () => void;
  onClear: () => void;
}

const AsyncErrorFallback: React.FC<AsyncErrorFallbackProps> = ({
  error,
  retryCount,
  isOnline,
  onRetry,
  onClear
}) => {
  const getErrorType = (error: Error) => {
    if (!isOnline) return 'offline';
    if (error.message.includes('fetch') || error.message.includes('network')) return 'network';
    if (error.message.includes('timeout')) return 'timeout';
    if (error.message.includes('401') || error.message.includes('unauthorized')) return 'auth';
    if (error.message.includes('403') || error.message.includes('forbidden')) return 'permission';
    if (error.message.includes('404') || error.message.includes('not found')) return 'notfound';
    if (error.message.includes('500') || error.message.includes('server')) return 'server';
    return 'unknown';
  };

  const errorType = getErrorType(error);

  const getErrorMessage = () => {
    switch (errorType) {
      case 'offline':
        return 'You appear to be offline. Please check your internet connection.';
      case 'network':
        return 'Network error occurred. Please check your connection and try again.';
      case 'timeout':
        return 'Request timed out. The server might be busy, please try again.';
      case 'auth':
        return 'Authentication failed. Please log in again.';
      case 'permission':
        return 'You don\'t have permission to perform this action.';
      case 'notfound':
        return 'The requested resource was not found.';
      case 'server':
        return 'Server error occurred. Please try again later.';
      default:
        return 'An unexpected error occurred. Please try again.';
    }
  };

  const getErrorIcon = () => {
    switch (errorType) {
      case 'offline':
        return <WifiOff className="w-6 h-6 text-red-500" />;
      case 'network':
        return <Wifi className="w-6 h-6 text-red-500" />;
      default:
        return <AlertCircle className="w-6 h-6 text-red-500" />;
    }
  };

  const shouldShowRetry = () => {
    return errorType !== 'auth' && errorType !== 'permission' && retryCount < 3;
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-2">
      <div className="flex items-start gap-3">
        {getErrorIcon()}
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-red-800 mb-1">
            {errorType === 'offline' ? 'Connection Lost' : 'Request Failed'}
          </h3>
          <p className="text-sm text-red-700 mb-3">
            {getErrorMessage()}
          </p>

          {retryCount > 0 && (
            <p className="text-xs text-red-600 mb-3">
              Retry attempt {retryCount} of 3
            </p>
          )}

          <div className="flex gap-2">
            {shouldShowRetry() && (
              <button
                onClick={onRetry}
                className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded flex items-center gap-1 transition-colors"
                disabled={!isOnline && errorType === 'offline'}
              >
                <RefreshCw className="w-3 h-3" />
                {errorType === 'offline' ? 'Retry when online' : 'Try Again'}
              </button>
            )}
            
            <button
              onClick={onClear}
              className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded transition-colors"
            >
              Dismiss
            </button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="mt-3">
              <summary className="text-xs text-red-600 cursor-pointer hover:text-red-800">
                Technical details
              </summary>
              <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono text-red-800 break-all">
                {error.message}
                {error.stack && (
                  <pre className="mt-2 text-xs overflow-auto">
                    {error.stack}
                  </pre>
                )}
              </div>
            </details>
          )}
        </div>
      </div>
    </div>
  );
};

// Hook for handling async errors in components
export const useAsyncError = () => {
  const [error, setError] = useState<Error | null>(null);

  const throwError = (error: Error) => {
    setError(error);
    // Trigger unhandled rejection to be caught by AsyncErrorBoundary
    Promise.reject(error);
  };

  const clearError = () => {
    setError(null);
  };

  return { error, throwError, clearError };
};

// HOC for wrapping components with async error handling
export const withAsyncErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: (error: Error, retry: () => void) => ReactNode
) => {
  const WrappedComponent = (props: P) => (
    <AsyncErrorBoundary fallback={fallback}>
      <Component {...props} />
    </AsyncErrorBoundary>
  );

  WrappedComponent.displayName = `withAsyncErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default AsyncErrorBoundary;
