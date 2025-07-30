'use client';

import { useState, useCallback, useMemo } from 'react';
import { useOptimisticMutationEnhanced } from './useOptimisticUpdatesEnhanced';
import { useFetch } from './useFetch';
import { api } from '../lib/api-client';
import { useToast } from './useToast';
import { MoodLevel } from '../types/base';

// Types
export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  mood?: MoodLevel;
  tags?: string[];
  isPrivate: boolean;
  created: string;
  updated: string;
}

export interface JournalAnalytics {
  totalEntries: number;
  averageMood: number;
  commonTags: string[];
  writingStreak: number;
  growthInsights: string[];
}

export interface CreateJournalEntryData {
  title: string;
  content: string;
  mood?: JournalEntry['mood'];
  tags?: string[];
  isPrivate: boolean;
}

export interface UpdateJournalEntryData extends Partial<CreateJournalEntryData> {
  id: string;
}

export interface UseJournalOptions {
  userId: string;
  enableRealTimeUpdates?: boolean;
  cacheTime?: number;
  refetchInterval?: number;
}

export interface UseJournalResult {
  // Data
  entries: JournalEntry[];
  analytics: JournalAnalytics | null;
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  
  // Error states
  error: Error | null;
  
  // CRUD operations
  createEntry: (data: CreateJournalEntryData) => Promise<JournalEntry>;
  updateEntry: (data: UpdateJournalEntryData) => Promise<JournalEntry>;
  deleteEntry: (id: string) => Promise<void>;
  
  // Utility operations
  searchEntries: (query: string) => Promise<JournalEntry[]>;
  getEntriesByDateRange: (startDate: string, endDate: string) => Promise<JournalEntry[]>;
  refreshEntries: () => void;
  refreshAnalytics: () => void;
  
  // Optimistic updates
  pendingUpdates: any[];
  conflictedUpdates: any[];
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
  resolveConflict: (updateId: string, resolution: any) => Promise<void>;
  getConflictData: (updateId: string) => any;
}

export function useJournal(options: UseJournalOptions): UseJournalResult {
  const { userId, enableRealTimeUpdates = false, cacheTime = 5 * 60 * 1000 } = options;
  const toast = useToast();
  
  // Fetch journal entries
  const {
    data: entries,
    isLoading: isLoadingEntries,
    error: entriesError,
    refetch: refetchEntries
  } = useFetch<JournalEntry[]>(`/api/journal?userId=${userId}`);
  
  // Fetch analytics
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useFetch<JournalAnalytics>(`/api/journal/analytics?userId=${userId}`);
  
  // Local state for search results
  const [searchResults, setSearchResults] = useState<JournalEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Create entry mutation
  const createMutation = useOptimisticMutationEnhanced<JournalEntry, CreateJournalEntryData>({
    mutationFn: async (data) => {
      const response = await api.post('/api/journal/entries', {
        ...data,
        userId
      });
      return response;
    },
    onOptimisticUpdate: (data) => {
      // Create optimistic entry
      const optimisticEntry: JournalEntry = {
        id: `temp-${Date.now()}`,
        userId,
        title: data.title,
        content: data.content,
        mood: data.mood,
        tags: data.tags || [],
        isPrivate: data.isPrivate,
        created: new Date().toISOString(),
        updated: new Date().toISOString()
      };
      return optimisticEntry;
    },
    onSuccess: (data) => {
      toast({
        type: 'success',
        title: 'Entry Created',
        description: 'Your journal entry has been saved successfully.'
      });
      refetchEntries();
      refetchAnalytics();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Failed to Create Entry',
        description: error.message || 'An error occurred while creating your journal entry.'
      });
    },
    enableRollback: true,
    maxRetries: 3,
    enableConflictDetection: true,
    resourceType: 'journal_entry',
    conflictResolution: 'prompt-user'
  });
  
  // Update entry mutation
  const updateMutation = useOptimisticMutationEnhanced<JournalEntry, UpdateJournalEntryData>({
    mutationFn: async (data) => {
      const { id, ...updateData } = data;
      const response = await api.put(`/api/journal/entries/${id}`, updateData);
      return response;
    },
    onOptimisticUpdate: (data) => {
      // Find and update the existing entry optimistically
      const existingEntry = entries?.find(entry => entry.id === data.id);
      if (existingEntry) {
        return {
          ...existingEntry,
          ...data,
          updated: new Date().toISOString()
        };
      }
      return data as JournalEntry;
    },
    onSuccess: (data) => {
      toast({
        type: 'success',
        title: 'Entry Updated',
        description: 'Your journal entry has been updated successfully.'
      });
      refetchEntries();
      refetchAnalytics();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Failed to Update Entry',
        description: error.message || 'An error occurred while updating your journal entry.'
      });
    },
    enableRollback: true,
    maxRetries: 3,
    enableConflictDetection: true,
    resourceType: 'journal_entry',
    conflictResolution: 'prompt-user'
  });
  
  // Delete entry mutation
  const deleteMutation = useOptimisticMutationEnhanced<void, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/journal/entries/${id}`);
    },
    onOptimisticUpdate: (id) => {
      // Remove entry optimistically
      return undefined;
    },
    onSuccess: () => {
      toast({
        type: 'success',
        title: 'Entry Deleted',
        description: 'Your journal entry has been deleted successfully.'
      });
      refetchEntries();
      refetchAnalytics();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Failed to Delete Entry',
        description: error.message || 'An error occurred while deleting your journal entry.'
      });
    },
    enableRollback: true,
    maxRetries: 2,
    enableConflictDetection: true,
    resourceType: 'journal_entry',
    conflictResolution: 'prompt-user'
  });
  
  // Search entries
  const searchEntries = useCallback(async (query: string): Promise<JournalEntry[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    
    setIsSearching(true);
    try {
      const response = await api.get(`/api/journal/search?userId=${userId}&query=${encodeURIComponent(query)}`);
      setSearchResults(response);
      return response;
    } catch (error) {
      console.error('Search error:', error);
      toast({
        type: 'error',
        title: 'Search Failed',
        description: 'An error occurred while searching your journal entries.'
      });
      return [];
    } finally {
      setIsSearching(false);
    }
  }, [userId, toast]);
  
  // Get entries by date range
  const getEntriesByDateRange = useCallback(async (startDate: string, endDate: string): Promise<JournalEntry[]> => {
    try {
      const response = await api.get(
        `/api/journal/entries/date-range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
      );
      return response;
    } catch (error) {
      console.error('Date range fetch error:', error);
      toast({
        type: 'error',
        title: 'Failed to Fetch Entries',
        description: 'An error occurred while fetching entries for the specified date range.'
      });
      return [];
    }
  }, [userId, toast]);
  
  // Memoized computed values
  const isLoading = useMemo(() => 
    isLoadingEntries || isLoadingAnalytics,
    [isLoadingEntries, isLoadingAnalytics]
  );
  
  const error = useMemo(() => 
    entriesError || analyticsError,
    [entriesError, analyticsError]
  );
  
  const allPendingUpdates = useMemo(() => [
    ...createMutation.pendingUpdates,
    ...updateMutation.pendingUpdates,
    ...deleteMutation.pendingUpdates
  ], [createMutation.pendingUpdates, updateMutation.pendingUpdates, deleteMutation.pendingUpdates]);
  
  const allConflictedUpdates = useMemo(() => [
    ...createMutation.conflictedUpdates,
    ...updateMutation.conflictedUpdates,
    ...deleteMutation.conflictedUpdates
  ], [createMutation.conflictedUpdates, updateMutation.conflictedUpdates, deleteMutation.conflictedUpdates]);
  
  // Rollback functions
  const rollback = useCallback((updateId: string) => {
    createMutation.rollback(updateId);
    updateMutation.rollback(updateId);
    deleteMutation.rollback(updateId);
  }, [createMutation, updateMutation, deleteMutation]);
  
  const rollbackAll = useCallback(() => {
    createMutation.rollbackAll();
    updateMutation.rollbackAll();
    deleteMutation.rollbackAll();
  }, [createMutation, updateMutation, deleteMutation]);
  
  // Conflict resolution functions
  const resolveConflict = useCallback(async (updateId: string, resolution: any) => {
    // Try to resolve in each mutation
    try {
      await createMutation.resolveConflict(updateId, resolution);
    } catch (e) {
      try {
        await updateMutation.resolveConflict(updateId, resolution);
      } catch (e) {
        await deleteMutation.resolveConflict(updateId, resolution);
      }
    }
  }, [createMutation, updateMutation, deleteMutation]);
  
  const getConflictData = useCallback((updateId: string) => {
    return createMutation.getConflictData(updateId) ||
           updateMutation.getConflictData(updateId) ||
           deleteMutation.getConflictData(updateId);
  }, [createMutation, updateMutation, deleteMutation]);
  
  return {
    // Data
    entries: entries || [],
    analytics,
    
    // Loading states
    isLoading,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    
    // Error states
    error,
    
    // CRUD operations
    createEntry: createMutation.mutate,
    updateEntry: updateMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    
    // Utility operations
    searchEntries,
    getEntriesByDateRange,
    refreshEntries: refetchEntries,
    refreshAnalytics: refetchAnalytics,
    
    // Optimistic updates
    pendingUpdates: allPendingUpdates,
    conflictedUpdates: allConflictedUpdates,
    rollback,
    rollbackAll,
    resolveConflict,
    getConflictData
  };
}