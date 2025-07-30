'use client';

import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/useToast';
import { cacheUtils } from '@/lib/query-client';
import { useServiceWorker } from '@/lib/service-worker';

interface CacheManagerProps {
  className?: string;
}

export function CacheManager({ className }: CacheManagerProps) {
  const queryClient = useQueryClient();
  const toast = useToast();
  const { invalidateCache, prefetchData, isOnline } = useServiceWorker();
  const [isClearing, setIsClearing] = React.useState(false);

  const handleClearCache = async () => {
    setIsClearing(true);
    try {
      // Clear React Query cache
      queryClient.clear();
      
      // Clear Service Worker cache
      invalidateCache();
      
      toast({
        type: 'success',
        title: 'Cache Cleared',
        description: 'All cached data has been cleared successfully.',
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Clear Failed',
        description: 'Failed to clear cache. Please try again.',
      });
    } finally {
      setIsClearing(false);
    }
  };

  const handleRefreshCache = async () => {
    try {
      // Invalidate and refetch all queries
      await queryClient.invalidateQueries();
      
      toast({
        type: 'success',
        title: 'Cache Refreshed',
        description: 'All data has been refreshed from the server.',
      });
    } catch (error) {
      toast({
        type: 'error',
        title: 'Refresh Failed',
        description: 'Failed to refresh cache. Please try again.',
      });
    }
  };

  const handlePrefetchData = () => {
    const urlsToPrefetch = [
      '/api/auth/profile',
      '/api/journal/entries',
      '/api/wellness/entries',
    ];
    
    prefetchData(urlsToPrefetch);
    
    toast({
      type: 'success',
      title: 'Prefetch Started',
      description: 'Essential data is being cached for offline use.',
    });
  };

  const getCacheStats = () => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(query => query.isStale()).length,
      errorQueries: queries.filter(query => query.state.status === 'error').length,
    };
  };

  const stats = getCacheStats();

  return (
    <div className={`space-y-4 p-4 border rounded-lg ${className}`}>
      <div>
        <h3 className="text-lg font-semibold mb-2">Cache Management</h3>
        <div className="text-sm text-gray-600 space-y-1">
          <div>Total cached queries: {stats.totalQueries}</div>
          <div>Stale queries: {stats.staleQueries}</div>
          <div>Error queries: {stats.errorQueries}</div>
          <div>Network status: {isOnline ? '🟢 Online' : '🔴 Offline'}</div>
        </div>
      </div>
      
      <div className="flex flex-wrap gap-2">
        <Button
          onClick={handleRefreshCache}
          variant="outline"
          size="sm"
          disabled={!isOnline}
        >
          Refresh Cache
        </Button>
        
        <Button
          onClick={handlePrefetchData}
          variant="outline"
          size="sm"
          disabled={!isOnline}
        >
          Prefetch Data
        </Button>
        
        <Button
          onClick={handleClearCache}
          variant="destructive"
          size="sm"
          disabled={isClearing}
        >
          {isClearing ? 'Clearing...' : 'Clear Cache'}
        </Button>
      </div>
    </div>
  );
}

// Development-only cache inspector
export function CacheInspector() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = React.useState(false);

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const queries = queryClient.getQueryCache().getAll();

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        Cache Inspector ({queries.length})
      </Button>
      
      {isOpen && (
        <div className="bg-white border rounded-lg shadow-lg p-4 max-w-md max-h-96 overflow-auto">
          <h4 className="font-semibold mb-2">Query Cache</h4>
          <div className="space-y-2 text-xs">
            {queries.map((query, index) => (
              <div key={index} className="border-b pb-2">
                <div className="font-mono text-xs">
                  {JSON.stringify(query.queryKey)}
                </div>
                <div className="flex gap-2 text-xs">
                  <span className={`px-1 rounded ${
                    query.state.status === 'success' ? 'bg-green-100 text-green-800' :
                    query.state.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {query.state.status}
                  </span>
                  {query.isStale() && (
                    <span className="px-1 rounded bg-orange-100 text-orange-800">
                      stale
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}