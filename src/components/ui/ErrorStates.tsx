'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import Card, { CardContent, CardHeader } from './Card';

interface BaseErrorProps {
  error?: Error | string | null;
  onRetry?: () => void;
  onDismiss?: () => void;
  className?: string;
}

// Generic Error State
export function ErrorState({ 
  error, 
  onRetry, 
  onDismiss,
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again.',
  icon = '😔',
  showDetails = true,
  className = ''
}: BaseErrorProps & {
  title?: string;
  description?: string;
  icon?: string;
  showDetails?: boolean;
}) {
  const errorMessage = error ? (typeof error === 'string' ? error : error.message) : null;
  
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="text-center py-8">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-4">{description}</p>
        
        {showDetails && errorMessage && (
          <details className="text-left mb-4">
            <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 mb-2">
              Error details
            </summary>
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300 font-mono">
              {errorMessage}
            </div>
          </details>
        )}
        
        <div className="flex gap-2 justify-center">
          {onDismiss && (
            <Button variant="outline" onClick={onDismiss}>
              Dismiss
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Network Error State
export function NetworkErrorState({ error, onRetry, className = '' }: BaseErrorProps) {
  return (
    <ErrorState
      error={error}
      onRetry={onRetry}
      title="Connection Problem"
      description="We're having trouble connecting to our servers. Please check your internet connection and try again."
      icon="🌐"
      className={className}
    />
  );
}

// Not Found Error State
export function NotFoundErrorState({ 
  onRetry, 
  onGoHome,
  resource = 'page',
  className = '' 
}: BaseErrorProps & {
  onGoHome?: () => void;
  resource?: string;
}) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="text-center py-8">
        <div className="text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-semibold text-white mb-2">
          {resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found
        </h3>
        <p className="text-gray-300 mb-6">
          The {resource} you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex gap-2 justify-center">
          {onGoHome && (
            <Button variant="outline" onClick={onGoHome}>
              Go Home
            </Button>
          )}
          {onRetry && (
            <Button onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Permission Error State
export function PermissionErrorState({ onRetry, onLogin, className = '' }: BaseErrorProps & {
  onLogin?: () => void;
}) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="text-center py-8">
        <div className="text-6xl mb-4">🔒</div>
        <h3 className="text-xl font-semibold text-white mb-2">Access Denied</h3>
        <p className="text-gray-300 mb-6">
          You don't have permission to access this resource. Please log in or contact support.
        </p>
        
        <div className="flex gap-2 justify-center">
          {onLogin && (
            <Button onClick={onLogin}>
              Log In
            </Button>
          )}
          {onRetry && (
            <Button variant="outline" onClick={onRetry}>
              Try Again
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Empty State
export function EmptyState({ 
  title = 'Nothing here yet',
  description = 'Get started by creating your first item.',
  icon = '📭',
  actionLabel = 'Get Started',
  onAction,
  className = ''
}: {
  title?: string;
  description?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="text-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-medium text-white mb-2">{title}</h3>
        <p className="text-gray-300 mb-6">{description}</p>
        
        {onAction && (
          <Button onClick={onAction} size="lg">
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

// Inline Error State
export function InlineErrorState({ 
  error, 
  onRetry, 
  onDismiss,
  size = 'md',
  className = ''
}: BaseErrorProps & {
  size?: 'sm' | 'md' | 'lg';
}) {
  const errorMessage = error ? (typeof error === 'string' ? error : error.message) : 'An error occurred';
  
  const sizeClasses = {
    sm: 'text-sm p-2',
    md: 'text-sm p-3',
    lg: 'text-base p-4'
  };
  
  return (
    <div className={`bg-red-500/10 border border-red-500/20 rounded-lg ${sizeClasses[size]} ${className}`}>
      <div className="flex items-start gap-3">
        <span className="text-red-400 flex-shrink-0">⚠️</span>
        <div className="flex-1">
          <p className="text-red-300">{errorMessage}</p>
        </div>
        
        <div className="flex gap-1 flex-shrink-0">
          {onRetry && (
            <button
              onClick={onRetry}
              className="text-red-300 hover:text-red-200 text-sm underline"
            >
              Retry
            </button>
          )}
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-red-300 hover:text-red-200 ml-2"
            >
              ×
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Toast Error State
export function ToastErrorState({ 
  error, 
  onRetry, 
  onDismiss,
  isVisible = true,
  autoHide = true,
  duration = 5000
}: BaseErrorProps & {
  isVisible?: boolean;
  autoHide?: boolean;
  duration?: number;
}) {
  const [visible, setVisible] = React.useState(isVisible);
  const errorMessage = error ? (typeof error === 'string' ? error : error.message) : 'An error occurred';
  
  React.useEffect(() => {
    if (autoHide && visible) {
      const timer = setTimeout(() => {
        setVisible(false);
        onDismiss?.();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [autoHide, visible, duration, onDismiss]);
  
  if (!visible) return null;
  
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <div className="bg-red-500/90 backdrop-blur-sm border border-red-500/20 rounded-lg p-4 text-white shadow-lg">
        <div className="flex items-start gap-3">
          <span className="text-red-200 flex-shrink-0">⚠️</span>
          <div className="flex-1">
            <p className="text-sm">{errorMessage}</p>
          </div>
          
          <div className="flex gap-1 flex-shrink-0">
            {onRetry && (
              <button
                onClick={onRetry}
                className="text-red-200 hover:text-white text-sm underline"
              >
                Retry
              </button>
            )}
            <button
              onClick={() => {
                setVisible(false);
                onDismiss?.();
              }}
              className="text-red-200 hover:text-white ml-2"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Page Error State
export function PageErrorState({ 
  error, 
  onRetry, 
  onGoHome,
  className = ''
}: BaseErrorProps & {
  onGoHome?: () => void;
}) {
  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 ${className}`}>
      <ErrorState
        error={error}
        onRetry={onRetry}
        title="Oops! Something went wrong"
        description="We encountered an unexpected error. Our team has been notified."
        icon="💥"
      />
    </div>
  );
}

// Maintenance State
export function MaintenanceState({ 
  estimatedTime,
  onRefresh,
  className = ''
}: {
  estimatedTime?: string;
  onRefresh?: () => void;
  className?: string;
}) {
  return (
    <Card className={`w-full max-w-md mx-auto ${className}`}>
      <CardContent className="text-center py-12">
        <div className="text-6xl mb-4">🔧</div>
        <h3 className="text-xl font-medium text-white mb-2">
          Under Maintenance
        </h3>
        <p className="text-gray-300 mb-6">
          We're currently performing scheduled maintenance to improve your experience.
          {estimatedTime && ` We'll be back in ${estimatedTime}.`}
        </p>
        
        {onRefresh && (
          <Button onClick={onRefresh} variant="outline">
            Check Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}