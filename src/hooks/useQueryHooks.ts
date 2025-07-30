/**
 * React Query hooks for API integration with caching
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys, cacheConfig } from '@/lib/query-client';
import { 
  authApi, 
  journalApi, 
  creativeApi, 
  wellnessApi, 
  aiApi 
} from '@/lib/api-client-enhanced';
import { useToast } from './useToast';

// Auth hooks
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.user.profile(),
    queryFn: authApi.getProfile,
    staleTime: cacheConfig.userProfile.staleTime,
    cacheTime: cacheConfig.userProfile.cacheTime,
    retry: false, // Don't retry auth failures
  });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: authApi.updateProfile,
    onSuccess: (data) => {
      // Update the cache with new profile data
      queryClient.setQueryData(queryKeys.user.profile(), data);
      toast({
        type: 'success',
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
      });
    },
  });
}

// Journal hooks
export function useJournalEntries(filters?: any) {
  return useQuery({
    queryKey: queryKeys.journal.entries(filters),
    queryFn: () => journalApi.getEntries(filters),
    staleTime: cacheConfig.journal.staleTime,
    cacheTime: cacheConfig.journal.cacheTime,
  });
}

export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: queryKeys.journal.entry(id),
    queryFn: () => journalApi.getEntry(id),
    staleTime: cacheConfig.journal.staleTime,
    cacheTime: cacheConfig.journal.cacheTime,
    enabled: !!id,
  });
}

export function useCreateJournalEntry() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: journalApi.createEntry,
    onSuccess: (newEntry) => {
      // Add to the entries list cache
      queryClient.setQueryData(
        queryKeys.journal.entries(),
        (oldData: any) => {
          if (!oldData) return [newEntry];
          return [newEntry, ...oldData];
        }
      );
      
      toast({
        type: 'success',
        title: 'Entry Created',
        description: 'Your journal entry has been saved.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Save Failed',
        description: error.message || 'Failed to save journal entry.',
      });
    },
  });
}

export function useUpdateJournalEntry() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: ({ id, entry }: { id: string; entry: any }) => 
      journalApi.updateEntry(id, entry),
    onSuccess: (updatedEntry, { id }) => {
      // Update the specific entry cache
      queryClient.setQueryData(queryKeys.journal.entry(id), updatedEntry);
      
      // Update the entries list cache
      queryClient.setQueryData(
        queryKeys.journal.entries(),
        (oldData: any[]) => {
          if (!oldData) return [updatedEntry];
          return oldData.map(entry => 
            entry.id === id ? updatedEntry : entry
          );
        }
      );
      
      toast({
        type: 'success',
        title: 'Entry Updated',
        description: 'Your journal entry has been updated.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: error.message || 'Failed to update journal entry.',
      });
    },
  });
}

export function useDeleteJournalEntry() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: journalApi.deleteEntry,
    onSuccess: (_, deletedId) => {
      // Remove from entries list cache
      queryClient.setQueryData(
        queryKeys.journal.entries(),
        (oldData: any[]) => {
          if (!oldData) return [];
          return oldData.filter(entry => entry.id !== deletedId);
        }
      );
      
      // Remove the specific entry cache
      queryClient.removeQueries({ queryKey: queryKeys.journal.entry(deletedId) });
      
      toast({
        type: 'success',
        title: 'Entry Deleted',
        description: 'Your journal entry has been deleted.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: error.message || 'Failed to delete journal entry.',
      });
    },
  });
}

export function useJournalAnalytics(userId: string, period?: string) {
  return useQuery({
    queryKey: queryKeys.journal.analytics(userId, period),
    queryFn: () => journalApi.getAnalytics(userId, period),
    staleTime: cacheConfig.analytics.staleTime,
    cacheTime: cacheConfig.analytics.cacheTime,
    enabled: !!userId,
  });
}

// Creative Assistant hooks
export function useCreativeSessions(userId: string) {
  return useQuery({
    queryKey: queryKeys.creative.sessions(userId),
    queryFn: () => creativeApi.getSessions(userId),
    staleTime: cacheConfig.ai.staleTime,
    cacheTime: cacheConfig.ai.cacheTime,
    enabled: !!userId,
  });
}

export function useCreativeSession(id: string) {
  return useQuery({
    queryKey: queryKeys.creative.session(id),
    queryFn: () => creativeApi.getSession(id),
    staleTime: cacheConfig.ai.staleTime,
    cacheTime: cacheConfig.ai.cacheTime,
    enabled: !!id,
  });
}

export function useCreateCreativeSession() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: creativeApi.createSession,
    onSuccess: (newSession) => {
      // Add to sessions list cache
      queryClient.setQueryData(
        queryKeys.creative.sessions(newSession.userId),
        (oldData: any) => {
          if (!oldData) return [newSession];
          return [newSession, ...oldData];
        }
      );
      
      toast({
        type: 'success',
        title: 'Session Created',
        description: 'New creative session started.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Session Failed',
        description: error.message || 'Failed to create creative session.',
      });
    },
  });
}

export function useGenerateContent() {
  const toast = useToast();
  
  return useMutation({
    mutationFn: ({ prompt, type }: { prompt: string; type: string }) =>
      creativeApi.generateContent(prompt, type),
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Generation Failed',
        description: error.message || 'Failed to generate content.',
      });
    },
  });
}

// Wellness hooks
export function useWellnessEntries(userId: string, period?: string) {
  return useQuery({
    queryKey: queryKeys.wellness.entries(userId, period),
    queryFn: () => wellnessApi.getEntries(userId, period),
    staleTime: cacheConfig.analytics.staleTime,
    cacheTime: cacheConfig.analytics.cacheTime,
    enabled: !!userId,
  });
}

export function useCreateWellnessEntry() {
  const queryClient = useQueryClient();
  const toast = useToast();
  
  return useMutation({
    mutationFn: wellnessApi.createEntry,
    onSuccess: (newEntry) => {
      // Add to entries list cache
      queryClient.setQueryData(
        queryKeys.wellness.entries(newEntry.userId),
        (oldData: any) => {
          if (!oldData) return [newEntry];
          return [newEntry, ...oldData];
        }
      );
      
      toast({
        type: 'success',
        title: 'Check-in Saved',
        description: 'Your wellness check-in has been recorded.',
      });
    },
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Save Failed',
        description: error.message || 'Failed to save wellness entry.',
      });
    },
  });
}

export function useWellnessTrends(userId: string, metric: string, period?: string) {
  return useQuery({
    queryKey: queryKeys.wellness.trends(userId, metric),
    queryFn: () => wellnessApi.getTrends(userId, metric, period),
    staleTime: cacheConfig.analytics.staleTime,
    cacheTime: cacheConfig.analytics.cacheTime,
    enabled: !!userId && !!metric,
  });
}

export function useWellnessInsights(userId: string) {
  return useQuery({
    queryKey: queryKeys.wellness.insights(userId),
    queryFn: () => wellnessApi.getInsights(userId),
    staleTime: cacheConfig.analytics.staleTime,
    cacheTime: cacheConfig.analytics.cacheTime,
    enabled: !!userId,
  });
}

// AI hooks
export function useAIChat() {
  const toast = useToast();
  
  return useMutation({
    mutationFn: ({ message, sessionId }: { message: string; sessionId?: string }) =>
      aiApi.chat(message, sessionId),
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'AI Chat Failed',
        description: error.message || 'Failed to get AI response.',
      });
    },
  });
}

export function useAIAnalysis() {
  const toast = useToast();
  
  return useMutation({
    mutationFn: ({ data, type }: { data: any; type: string }) =>
      aiApi.analyze(data, type),
    onError: (error: any) => {
      toast({
        type: 'error',
        title: 'Analysis Failed',
        description: error.message || 'Failed to analyze data.',
      });
    },
  });
}