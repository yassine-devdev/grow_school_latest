'use client';

import React from 'react';
import { Skeleton } from './skeleton';
import Card, { CardContent, CardHeader } from './Card';

// Generic Loading Spinner
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6',
    lg: 'w-8 h-8'
  };
  
  return (
    <div className={`${sizeClasses[size]} border-2 border-white/30 border-t-white rounded-full animate-spin ${className}`} />
  );
}

// Page Loading State
export function PageLoadingState({ message = 'Loading...' }: { message?: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="text-center">
        <LoadingSpinner size="lg" className="mx-auto mb-4" />
        <p className="text-white text-lg">{message}</p>
      </div>
    </div>
  );
}

// Card Loading State
export function CardLoadingState({ 
  title = true, 
  subtitle = false, 
  content = true, 
  actions = false,
  className = ''
}: {
  title?: boolean;
  subtitle?: boolean;
  content?: boolean;
  actions?: boolean;
  className?: string;
}) {
  return (
    <Card className={className}>
      {(title || subtitle) && (
        <CardHeader>
          {title && <Skeleton className="h-6 w-48 mb-2" />}
          {subtitle && <Skeleton className="h-4 w-64" />}
        </CardHeader>
      )}
      
      {content && (
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </CardContent>
      )}
      
      {actions && (
        <div className="p-6 pt-0">
          <div className="flex gap-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      )}
    </Card>
  );
}

// List Loading State
export function ListLoadingState({ 
  count = 3, 
  showAvatar = false, 
  showActions = false 
}: { 
  count?: number; 
  showAvatar?: boolean; 
  showActions?: boolean; 
}) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex items-start gap-4">
              {showAvatar && <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />}
              
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                
                <div className="flex gap-2 mt-3">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                </div>
              </div>
              
              {showActions && (
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded" />
                  <Skeleton className="h-8 w-8 rounded" />
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// Form Loading State
export function FormLoadingState({ fields = 4 }: { fields?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        {Array.from({ length: fields }).map((_, index) => (
          <div key={index} className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full rounded-md" />
          </div>
        ))}
      </CardContent>
      
      <div className="p-6 pt-0">
        <div className="flex justify-end gap-2">
          <Skeleton className="h-10 w-20" />
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
    </Card>
  );
}

// Chart Loading State
export function ChartLoadingState({ title }: { title?: string }) {
  return (
    <Card>
      {title && (
        <CardHeader>
          <Skeleton className="h-6 w-32" />
        </CardHeader>
      )}
      
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-end gap-2 h-32">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton 
                key={index} 
                className="flex-1 rounded-sm" 
                style={{ height: `${Math.random() * 80 + 20}%` }}
              />
            ))}
          </div>
          
          <div className="flex justify-between">
            {Array.from({ length: 7 }).map((_, index) => (
              <Skeleton key={index} className="h-3 w-8" />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Inline Loading State
export function InlineLoadingState({ 
  message = 'Loading...', 
  size = 'sm' 
}: { 
  message?: string; 
  size?: 'sm' | 'md' | 'lg'; 
}) {
  return (
    <div className="flex items-center gap-2 text-gray-400">
      <LoadingSpinner size={size} />
      <span className="text-sm">{message}</span>
    </div>
  );
}

// Button Loading State
export function ButtonLoadingState({ 
  children, 
  isLoading = false, 
  loadingText = 'Loading...', 
  ...props 
}: {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingText?: string;
  [key: string]: any;
}) {
  return (
    <button {...props} disabled={isLoading || props.disabled}>
      {isLoading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          {loadingText}
        </div>
      ) : (
        children
      )}
    </button>
  );
}

// Overlay Loading State
export function OverlayLoadingState({ 
  message = 'Loading...', 
  isVisible = true 
}: { 
  message?: string; 
  isVisible?: boolean; 
}) {
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="p-6">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-white">{message}</p>
        </div>
      </Card>
    </div>
  );
}