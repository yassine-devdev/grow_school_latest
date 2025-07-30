'use client';

import React from 'react';
import { Skeleton } from '../ui/skeleton';
import Card, { CardContent, CardHeader, CardFooter } from '../ui/Card';

interface JournalEntrySkeletonProps {
  compact?: boolean;
}

export default function JournalEntrySkeleton({ compact = false }: JournalEntrySkeletonProps) {
  return (
    <Card className={`w-full ${compact ? 'mb-4' : 'mb-6'}`}>
      <CardHeader className={compact ? 'pb-3' : 'pb-4'}>
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className={`${compact ? 'h-5 w-48' : 'h-6 w-64'}`} />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          </div>
          <Skeleton className="h-8 w-20 rounded-full" />
        </div>
      </CardHeader>
      
      <CardContent className={compact ? 'py-3' : 'py-4'}>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          {!compact && (
            <>
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </>
          )}
        </div>
        
        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-6 w-14 rounded-full" />
        </div>
      </CardContent>
      
      <CardFooter className={`flex items-center justify-between ${compact ? 'pt-3' : 'pt-4'}`}>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-16" />
        </div>
        <Skeleton className="h-8 w-16" />
      </CardFooter>
    </Card>
  );
}

interface JournalEntryListSkeletonProps {
  count?: number;
  compact?: boolean;
}

export function JournalEntryListSkeleton({ count = 3, compact = false }: JournalEntryListSkeletonProps) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, index) => (
        <JournalEntrySkeleton key={index} compact={compact} />
      ))}
    </div>
  );
}