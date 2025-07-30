/**
 * React Query client configuration with caching strategies
 */

import { QueryClient } from '@tanstack/react-query';

// Cache configuration based on data types
export const cacheConfig = {
  // User profile data - changes infrequently
  userProfile: {
    staleTime: 60 * 60 * 1000, // 1 hour
    cacheTime: 24 * 60 * 60 * 1000, // 24 hours
  },
  // Journal entries - moderate update frequency
  journal: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  },
  // Analytics data - can be slightly stale
  analytics: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  },
  // Real-time data - very short cache
  realtime: {
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 2 * 60 * 1000, // 2 minutes
  },
  // Static content - long cache
  static: {
    staleTime: 24 * 60 * 60 * 1000, // 24 hours
    cacheTime: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
  // AI responses - medium cache for performance
  ai: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    cacheTime: 60 * 60 * 1000, // 1 hour
  }
};

// Create query client with optimized defaults
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default cache settings
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 30 * 60 * 1000, // 30 minutes
      
      // Retry configuration
      retry: (failureCount, error: any) => {
        // Don't retry on 4xx errors (client errors)
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetch settings
      refetchOnWindowFocus: true,
      refetchOnReconnect: true,
      refetchOnMount: true,
      
      // Network mode for offline support
      networkMode: 'offlineFirst',
    },
    mutations: {
      // Retry mutations once on network errors
      retry: (failureCount, error: any) => {
        if (error?.status >= 400 && error?.status < 500) {
          return false;
        }
        return failureCount < 1;
      },
      networkMode: 'offlineFirst',
    },
  },
});

// Query key factories for consistent cache keys
export const queryKeys = {
  // User-related queries
  user: {
    all: ['user'] as const,
    profile: () => [...queryKeys.user.all, 'profile'] as const,
    settings: () => [...queryKeys.user.all, 'settings'] as const,
  },
  
  // Journal-related queries
  journal: {
    all: ['journal'] as const,
    entries: (filters?: any) => [...queryKeys.journal.all, 'entries', filters] as const,
    entry: (id: string) => [...queryKeys.journal.all, 'entry', id] as const,
    analytics: (userId: string, period?: string) => 
      [...queryKeys.journal.all, 'analytics', userId, period] as const,
  },
  
  // Creative assistant queries
  creative: {
    all: ['creative'] as const,
    sessions: (userId: string) => [...queryKeys.creative.all, 'sessions', userId] as const,
    session: (id: string) => [...queryKeys.creative.all, 'session', id] as const,
    projects: (userId: string) => [...queryKeys.creative.all, 'projects', userId] as const,
  },
  
  // Wellness/mood tracking queries
  wellness: {
    all: ['wellness'] as const,
    entries: (userId: string, period?: string) => 
      [...queryKeys.wellness.all, 'entries', userId, period] as const,
    trends: (userId: string, metric: string) => 
      [...queryKeys.wellness.all, 'trends', userId, metric] as const,
    insights: (userId: string) => [...queryKeys.wellness.all, 'insights', userId] as const,
  },
  
  // AI-related queries
  ai: {
    all: ['ai'] as const,
    chat: (sessionId: string) => [...queryKeys.ai.all, 'chat', sessionId] as const,
    analysis: (type: string, data: any) => [...queryKeys.ai.all, 'analysis', type, data] as const,
  },
};

// Cache invalidation utilities
export const cacheUtils = {
  // Invalidate all user-related data
  invalidateUser: () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.user.all });
  },
  
  // Invalidate journal data
  invalidateJournal: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.journal.all });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.journal.analytics(userId) });
    }
  },
  
  // Invalidate wellness data
  invalidateWellness: (userId?: string) => {
    queryClient.invalidateQueries({ queryKey: queryKeys.wellness.all });
    if (userId) {
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.entries(userId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.wellness.trends(userId, '') });
    }
  },
  
  // Clear all cache
  clearAll: () => {
    queryClient.clear();
  },
  
  // Remove specific cache entry
  removeQuery: (queryKey: any[]) => {
    queryClient.removeQueries({ queryKey });
  },
};

// Prefetch utilities for performance
export const prefetchUtils = {
  // Prefetch user profile on login
  prefetchUserProfile: async () => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.user.profile(),
      queryFn: () => fetch('/api/auth/profile').then(res => res.json()),
      staleTime: cacheConfig.userProfile.staleTime,
    });
  },
  
  // Prefetch journal entries
  prefetchJournalEntries: async (filters?: any) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.journal.entries(filters),
      queryFn: () => fetch('/api/journal/entries').then(res => res.json()),
      staleTime: cacheConfig.journal.staleTime,
    });
  },
  
  // Prefetch wellness data
  prefetchWellnessData: async (userId: string) => {
    await queryClient.prefetchQuery({
      queryKey: queryKeys.wellness.entries(userId),
      queryFn: () => fetch(`/api/wellness/entries?userId=${userId}`).then(res => res.json()),
      staleTime: cacheConfig.analytics.staleTime,
    });
  },
};