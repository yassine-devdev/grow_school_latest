'use client';

import { useState, useCallback, useMemo } from 'react';
import { useOptimisticMutationEnhanced } from './useOptimisticUpdatesEnhanced';
import { useFetch } from './useFetch';
import { api } from '../lib/api-client';
import { useToast } from './useToast';
import { MoodLevel, FocusLevel, EnergyLevel, StressLevel } from '../types/base';

// Types
export interface MoodFocusEntry {
  id: string;
  userId: string;
  mood: MoodLevel;
  focus: FocusLevel;
  energy: EnergyLevel;
  stress: StressLevel;
  notes?: string;
  tags?: string[];
  activities?: string[];
  sleepHours?: number;
  exerciseMinutes?: number;
  waterIntake?: number;
  screenTime?: number;
  socialInteraction?: number;
  productivity?: number;
  gratitude?: string[];
  challenges?: string[];
  created: string;
}

export interface MoodFocusAnalytics {
  averageMood: number;
  averageFocus: number;
  averageEnergy: number;
  averageStress: number;
  totalEntries: number;
  streakDays: number;
  trends: {
    mood: TrendDataPoint[];
    focus: TrendDataPoint[];
    energy: TrendDataPoint[];
    stress: TrendDataPoint[];
  };
  insights: string[];
  patterns: WellnessPattern[];
  correlations: WellnessCorrelation[];
}

export interface TrendDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface WellnessPattern {
  id: string;
  type: 'daily' | 'weekly' | 'monthly' | 'seasonal';
  description: string;
  confidence: number;
  impact: 'positive' | 'negative' | 'neutral';
  recommendations: string[];
}

export interface WellnessCorrelation {
  factor1: string;
  factor2: string;
  correlation: number;
  significance: number;
  description: string;
}

export interface CreateMoodEntryData {
  mood: MoodLevel;
  focus: FocusLevel;
  energy: EnergyLevel;
  stress: StressLevel;
  notes?: string;
  tags?: string[];
  activities?: string[];
  sleepHours?: number;
  exerciseMinutes?: number;
  waterIntake?: number;
  screenTime?: number;
  socialInteraction?: number;
  productivity?: number;
  gratitude?: string[];
  challenges?: string[];
}

export interface UpdateMoodEntryData extends Partial<CreateMoodEntryData> {
  id: string;
}

export interface UseMoodTrackingOptions {
  userId: string;
  enableRealTimeUpdates?: boolean;
  analyticsTimeframe?: number; // days
  cacheTime?: number;
}

export interface UseMoodTrackingResult {
  // Data
  entries: MoodFocusEntry[];
  analytics: MoodFocusAnalytics | null;
  recommendations: string[];
  
  // Loading states
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isLoadingRecommendations: boolean;
  
  // Error states
  error: Error | null;
  
  // CRUD operations
  createEntry: (data: CreateMoodEntryData) => Promise<MoodFocusEntry>;
  updateEntry: (data: UpdateMoodEntryData) => Promise<MoodFocusEntry>;
  deleteEntry: (id: string) => Promise<void>;
  
  // Analytics operations
  getEntriesByDateRange: (startDate: string, endDate: string) => Promise<MoodFocusEntry[]>;
  getTrends: (days?: number) => Promise<MoodFocusAnalytics['trends']>;
  getInsights: () => Promise<string[]>;
  getRecommendations: () => Promise<string[]>;
  
  // Visualization helpers
  getChartData: (metric: 'mood' | 'focus' | 'energy' | 'stress', days?: number) => TrendDataPoint[];
  getCorrelationData: () => WellnessCorrelation[];
  getPatternData: () => WellnessPattern[];
  
  // Utility operations
  refreshEntries: () => void;
  refreshAnalytics: () => void;
  refreshRecommendations: () => void;
  
  // Optimistic updates
  pendingUpdates: any[];
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
}

export function useMoodTracking(options: UseMoodTrackingOptions): UseMoodTrackingResult {
  const { 
    userId, 
    enableRealTimeUpdates = false, 
    analyticsTimeframe = 30,
    cacheTime = 5 * 60 * 1000 
  } = options;
  const toast = useToast();
  
  // Fetch mood entries
  const {
    data: entries,
    isLoading: isLoadingEntries,
    error: entriesError,
    refetch: refetchEntries
  } = useFetch<MoodFocusEntry[]>(`/api/mood-focus-checkin?userId=${userId}`);
  
  // Fetch analytics
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    error: analyticsError,
    refetch: refetchAnalytics
  } = useFetch<MoodFocusAnalytics>(`/api/mood-focus-checkin?userId=${userId}&analytics=true&days=${analyticsTimeframe}`);
  
  // Fetch recommendations
  const {
    data: recommendations,
    isLoading: isLoadingRecommendations,
    error: recommendationsError,
    refetch: refetchRecommendations
  } = useFetch<string[]>(`/api/mood-focus-checkin?userId=${userId}&recommendations=true`);
  
  // Create entry mutation
  const createMutation = useOptimisticMutationEnhanced<MoodFocusEntry, CreateMoodEntryData>({
    mutationFn: async (data) => {
      const response = await api.post('/api/mood-focus-checkin', {
        ...data,
        userId
      });
      return response;
    },
    onOptimisticUpdate: (data) => {
      // Create optimistic entry
      const optimisticEntry: MoodFocusEntry = {
        id: `temp-${Date.now()}`,
        userId,
        ...data,
        created: new Date().toISOString()
      };
      return optimisticEntry;
    },
    onSuccess: (data) => {
      toast({
        type: 'success',
        title: 'Check-in Recorded',
        description: 'Your mood and focus check-in has been saved successfully.'
      });
      refetchEntries();
      refetchAnalytics();
      refetchRecommendations();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Failed to Record Check-in',
        description: error.message || 'An error occurred while saving your check-in.'
      });
    },
    enableRollback: true,
    maxRetries: 3
  });
  
  // Update entry mutation
  const updateMutation = useOptimisticMutationEnhanced<MoodFocusEntry, UpdateMoodEntryData>({
    mutationFn: async (data) => {
      const { id, ...updateData } = data;
      const response = await api.put(`/api/mood-focus-checkin?id=${id}`, updateData);
      return response;
    },
    onOptimisticUpdate: (data) => {
      // Find and update the existing entry optimistically
      const existingEntry = entries?.find(entry => entry.id === data.id);
      if (existingEntry) {
        return {
          ...existingEntry,
          ...data
        };
      }
      return data as MoodFocusEntry;
    },
    onSuccess: (data) => {
      toast({
        type: 'success',
        title: 'Check-in Updated',
        description: 'Your mood and focus check-in has been updated successfully.'
      });
      refetchEntries();
      refetchAnalytics();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Failed to Update Check-in',
        description: error.message || 'An error occurred while updating your check-in.'
      });
    },
    enableRollback: true,
    maxRetries: 3
  });
  
  // Delete entry mutation
  const deleteMutation = useOptimisticMutationEnhanced<void, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/mood-focus-checkin?id=${id}`);
    },
    onOptimisticUpdate: (id) => {
      // Remove entry optimistically
      return undefined;
    },
    onSuccess: () => {
      toast({
        type: 'success',
        title: 'Check-in Deleted',
        description: 'Your mood and focus check-in has been deleted successfully.'
      });
      refetchEntries();
      refetchAnalytics();
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Failed to Delete Check-in',
        description: error.message || 'An error occurred while deleting your check-in.'
      });
    },
    enableRollback: true,
    maxRetries: 2
  });
  
  // Utility functions
  const getEntriesByDateRange = useCallback(async (startDate: string, endDate: string): Promise<MoodFocusEntry[]> => {
    try {
      const response = await api.get(
        `/api/mood-focus-checkin/date-range?userId=${userId}&startDate=${startDate}&endDate=${endDate}`
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
  
  const getTrends = useCallback(async (days: number = 30): Promise<MoodFocusAnalytics['trends']> => {
    try {
      const response = await api.get(`/api/mood-focus-checkin/trends?userId=${userId}&days=${days}`);
      return response;
    } catch (error) {
      console.error('Trends fetch error:', error);
      return {
        mood: [],
        focus: [],
        energy: [],
        stress: []
      };
    }
  }, [userId]);
  
  const getInsights = useCallback(async (): Promise<string[]> => {
    try {
      const response = await api.get(`/api/mood-focus-checkin/insights?userId=${userId}`);
      return response;
    } catch (error) {
      console.error('Insights fetch error:', error);
      return [];
    }
  }, [userId]);
  
  const getRecommendations = useCallback(async (): Promise<string[]> => {
    try {
      const response = await api.get(`/api/mood-focus-checkin?userId=${userId}&recommendations=true`);
      return response;
    } catch (error) {
      console.error('Recommendations fetch error:', error);
      return [];
    }
  }, [userId]);
  
  // Visualization helpers
  const getChartData = useCallback((metric: 'mood' | 'focus' | 'energy' | 'stress', days: number = 7): TrendDataPoint[] => {
    if (!entries || entries.length === 0) return [];
    
    const now = new Date();
    const startDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    const filteredEntries = entries.filter(entry => 
      new Date(entry.created) >= startDate
    ).sort((a, b) => new Date(a.created).getTime() - new Date(b.created).getTime());
    
    return filteredEntries.map(entry => ({
      date: entry.created.split('T')[0],
      value: levelToNumber(entry[metric]),
      label: entry[metric]
    }));
  }, [entries]);
  
  const getCorrelationData = useCallback((): WellnessCorrelation[] => {
    return analytics?.correlations || [];
  }, [analytics]);
  
  const getPatternData = useCallback((): WellnessPattern[] => {
    return analytics?.patterns || [];
  }, [analytics]);
  
  // Helper function to convert level to number
  const levelToNumber = (level: string): number => {
    const levelMap: Record<string, number> = {
      'very-low': 1,
      'low': 2,
      'medium': 3,
      'high': 4,
      'very-high': 5
    };
    return levelMap[level] || 3;
  };
  
  // Memoized computed values
  const isLoading = useMemo(() => 
    isLoadingEntries || isLoadingAnalytics,
    [isLoadingEntries, isLoadingAnalytics]
  );
  
  const error = useMemo(() => 
    entriesError || analyticsError || recommendationsError,
    [entriesError, analyticsError, recommendationsError]
  );
  
  const allPendingUpdates = useMemo(() => [
    ...createMutation.pendingUpdates,
    ...updateMutation.pendingUpdates,
    ...deleteMutation.pendingUpdates
  ], [createMutation.pendingUpdates, updateMutation.pendingUpdates, deleteMutation.pendingUpdates]);
  
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
  
  return {
    // Data
    entries: entries || [],
    analytics,
    recommendations: recommendations || [],
    
    // Loading states
    isLoading,
    isCreating: createMutation.isLoading,
    isUpdating: updateMutation.isLoading,
    isDeleting: deleteMutation.isLoading,
    isLoadingRecommendations,
    
    // Error states
    error,
    
    // CRUD operations
    createEntry: createMutation.mutate,
    updateEntry: updateMutation.mutate,
    deleteEntry: deleteMutation.mutate,
    
    // Analytics operations
    getEntriesByDateRange,
    getTrends,
    getInsights,
    getRecommendations,
    
    // Visualization helpers
    getChartData,
    getCorrelationData,
    getPatternData,
    
    // Utility operations
    refreshEntries: refetchEntries,
    refreshAnalytics: refetchAnalytics,
    refreshRecommendations: refetchRecommendations,
    
    // Optimistic updates
    pendingUpdates: allPendingUpdates,
    rollback,
    rollbackAll
  };
}