'use client';

import React from 'react';
import { Button } from '../ui/Button';
import Card, { CardContent } from '../ui/Card';

interface JournalErrorStateProps {
  error: Error | string;
  onRetry?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
}

export default function JournalErrorState({ 
  error, 
  onRetry, 
  title = 'Something went wrong',
  description,
  showRetry = true 
}: JournalErrorStateProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  const defaultDescription = description || 'We encountered an error while loading your journal entries. Please try again.';
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center py-8">
        <div className="mb-4">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
          <p className="text-gray-300 mb-4">{defaultDescription}</p>
          
          {errorMessage && (
            <details className="text-left">
              <summary className="text-sm text-gray-400 cursor-pointer hover:text-gray-300 mb-2">
                Error details
              </summary>
              <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-300 font-mono">
                {errorMessage}
              </div>
            </details>
          )}
        </div>
        
        {showRetry && onRetry && (
          <Button onClick={onRetry} className="min-w-[120px]">
            Try Again
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

interface JournalEmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function JournalEmptyState({ 
  title = 'No journal entries yet',
  description = 'Start your journaling journey by creating your first entry. Reflect on your thoughts, experiences, and growth.',
  actionLabel = 'Create First Entry',
  onAction,
  icon = '📝'
}: JournalEmptyStateProps) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center py-12">
        <div className="text-6xl mb-4">{icon}</div>
        <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
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

interface JournalLoadingErrorProps {
  onRetry?: () => void;
  isRetrying?: boolean;
}

export function JournalLoadingError({ onRetry, isRetrying = false }: JournalLoadingErrorProps) {
  return (
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <div className="text-4xl mb-4">⚠️</div>
        <h3 className="text-lg font-medium text-white mb-2">Failed to load entries</h3>
        <p className="text-gray-400 mb-4">Check your connection and try again</p>
        
        {onRetry && (
          <Button 
            onClick={onRetry} 
            disabled={isRetrying}
            variant="outline"
            size="sm"
          >
            {isRetrying ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Retrying...
              </div>
            ) : (
              'Retry'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}