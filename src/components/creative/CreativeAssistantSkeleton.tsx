'use client';

import React from 'react';
import { Skeleton } from '../ui/skeleton';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';

export default function CreativeAssistantSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-4 w-96" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-10 w-32" />
              <Skeleton className="h-10 w-24" />
            </div>
          </div>
        </CardHeader>
      </Card>
      
      {/* Mode Selection */}
      <Card>
        <CardContent className="py-4">
          <div className="flex gap-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-24 rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Main Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input Panel */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Project Type Selector */}
              <div>
                <Skeleton className="h-4 w-24 mb-2" />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {Array.from({ length: 6 }).map((_, index) => (
                    <Skeleton key={index} className="h-10 rounded-lg" />
                  ))}
                </div>
              </div>
              
              {/* Input Area */}
              <div>
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-32 w-full rounded-md" />
                <Skeleton className="h-3 w-24 mt-1" />
              </div>
            </CardContent>
            
            <CardFooter>
              <Skeleton className="h-12 w-full" />
            </CardFooter>
          </Card>
        </div>
        
        {/* Session History */}
        <div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, index) => (
                  <div key={index} className="p-3 bg-white/5 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      <Skeleton className="h-5 w-16 rounded-full" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-4 w-full" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export function CreativeAssistantErrorState({ 
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
          <div className="text-6xl mb-4">🤖💔</div>
          <h3 className="text-xl font-semibold text-white mb-2">AI Assistant Unavailable</h3>
          <p className="text-gray-300 mb-4">
            We're having trouble connecting to the creative assistant. Please try again.
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

export function CreativeAssistantEmptyState({ 
  onStartCreating 
}: { 
  onStartCreating?: () => void; 
}) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="text-center py-12">
        <div className="text-6xl mb-4">✨</div>
        <h3 className="text-xl font-medium text-white mb-2">
          Ready to Create?
        </h3>
        <p className="text-gray-300 mb-6">
          Let's start your creative journey! Choose a mode above and begin brainstorming, 
          getting feedback, or generating content.
        </p>
        
        {onStartCreating && (
          <button
            onClick={onStartCreating}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Start Creating
          </button>
        )}
      </CardContent>
    </Card>
  );
}