'use client';

import React from 'react';
import { Skeleton } from '../ui/skeleton';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';

export default function MoodFocusCheckInSkeleton() {
  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <div className="flex bg-white/10 rounded-lg p-1">
            <Skeleton className="h-8 w-16 rounded" />
            <Skeleton className="h-8 w-20 rounded" />
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-8">
        {/* Core Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-3 w-48" />
              <div className="grid grid-cols-5 gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 p-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-3 w-12" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* Notes */}
        <div>
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-20 w-full rounded-md" />
          <Skeleton className="h-3 w-24 mt-1" />
        </div>
        
        {/* Tags and Activities */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index}>
              <Skeleton className="h-4 w-16 mb-2" />
              <div className="flex flex-wrap gap-2 mb-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-16 rounded-full" />
                ))}
              </div>
              <div className="flex gap-2">
                <Skeleton className="h-8 flex-1" />
                <Skeleton className="h-8 w-12" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      
      <CardFooter className="flex items-center justify-between">
        <Skeleton className="h-4 w-48" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-16" />
          <Skeleton className="h-10 w-32" />
        </div>
      </CardFooter>
    </Card>
  );
}

export function MoodFocusCheckInErrorState({ 
  error, 
  onRetry 
}: { 
  error: Error | string; 
  onRetry?: () => void; 
}) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center py-8">
        <div className="mb-4">
          <div className="text-6xl mb-4">😔</div>
          <h3 className="text-xl font-semibold text-white mb-2">Check-in Unavailable</h3>
          <p className="text-gray-300 mb-4">
            We're having trouble loading your wellness check-in. Please try again.
          </p>
          
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
        
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        )}
      </CardContent>
    </Card>
  );
}

export function MoodFocusCheckInCompletedState({ 
  entry,
  onNewCheckIn 
}: { 
  entry: any;
  onNewCheckIn?: () => void; 
}) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center py-8">
        <div className="text-6xl mb-4">✅</div>
        <h3 className="text-xl font-medium text-white mb-2">
          Check-in Complete!
        </h3>
        <p className="text-gray-300 mb-6">
          Thank you for taking time to reflect on your wellness today. 
          Come back tomorrow for your next check-in.
        </p>
        
        <div className="bg-white/5 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Mood:</span>
              <div className="text-white font-medium">{entry?.mood || 'N/A'}</div>
            </div>
            <div>
              <span className="text-gray-400">Focus:</span>
              <div className="text-white font-medium">{entry?.focus || 'N/A'}</div>
            </div>
            <div>
              <span className="text-gray-400">Energy:</span>
              <div className="text-white font-medium">{entry?.energy || 'N/A'}</div>
            </div>
            <div>
              <span className="text-gray-400">Stress:</span>
              <div className="text-white font-medium">{entry?.stress || 'N/A'}</div>
            </div>
          </div>
        </div>
        
        {onNewCheckIn && (
          <button
            onClick={onNewCheckIn}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            View Trends
          </button>
        )}
      </CardContent>
    </Card>
  );
}