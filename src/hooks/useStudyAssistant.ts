'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  StudySession,
  StudyRecommendation,
  StudySessionOptimization,
  StudyAnalytics,
  SubjectArea,
  StudySessionType,
  DifficultyLevel
} from '@/types/study-assistant';

interface UseStudyAssistantReturn {
  // Current session
  currentSession: StudySession | null;
  startSession: (params: {
    subject: SubjectArea;
    sessionType: StudySessionType;
    title: string;
    description?: string;
  }) => Promise<StudySession>;
  endSession: (sessionId: string, effectiveness?: number, notes?: string) => Promise<void>;
  
  // Recommendations
  recommendations: StudyRecommendation[];
  loadingRecommendations: boolean;
  fetchRecommendations: () => Promise<void>;
  regenerateRecommendations: () => Promise<void>;
  markRecommendationComplete: (recommendationId: string) => Promise<void>;
  
  // Optimization
  optimization: StudySessionOptimization | null;
  loadingOptimization: boolean;
  fetchOptimization: () => Promise<void>;
  updateOptimization: (updates: Partial<StudySessionOptimization>) => Promise<void>;
  
  // Analytics
  analytics: StudyAnalytics | null;
  loadingAnalytics: boolean;
  fetchAnalytics: (dateRange?: { startDate: string; endDate: string }) => Promise<void>;
  
  // Recent sessions
  recentSessions: StudySession[];
  fetchRecentSessions: () => Promise<void>;
  
  // Loading states
  loading: boolean;
  error: string | null;
}

export function useStudyAssistant(userId: string): UseStudyAssistantReturn {
  const [currentSession, setCurrentSession] = useState<StudySession | null>(null);
  const [recommendations, setRecommendations] = useState<StudyRecommendation[]>([]);
  const [optimization, setOptimization] = useState<StudySessionOptimization | null>(null);
  const [analytics, setAnalytics] = useState<StudyAnalytics | null>(null);
  const [recentSessions, setRecentSessions] = useState<StudySession[]>([]);
  
  const [loading, setLoading] = useState(false);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingOptimization, setLoadingOptimization] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Start a new study session
  const startSession = useCallback(async (params: {
    subject: SubjectArea;
    sessionType: StudySessionType;
    title: string;
    description?: string;
  }): Promise<StudySession> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/study-assistant/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          ...params,
          learningObjectives: []
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start study session');
      }

      const session = await response.json();
      setCurrentSession(session);
      return session;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [userId]);

  // End current study session
  const endSession = useCallback(async (
    sessionId: string, 
    effectiveness?: number, 
    notes?: string
  ): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/study-assistant/sessions?id=${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endTime: new Date().toISOString(),
          effectiveness,
          notes
        })
      });

      if (!response.ok) {
        throw new Error('Failed to end study session');
      }

      setCurrentSession(null);
      await fetchRecentSessions(); // Refresh recent sessions
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to end session';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch study recommendations
  const fetchRecommendations = useCallback(async (): Promise<void> => {
    try {
      setLoadingRecommendations(true);
      setError(null);

      const response = await fetch(`/api/study-assistant/recommendations?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load recommendations';
      setError(errorMessage);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [userId]);

  // Regenerate recommendations
  const regenerateRecommendations = useCallback(async (): Promise<void> => {
    try {
      setLoadingRecommendations(true);
      setError(null);

      const response = await fetch('/api/study-assistant/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, forceRegenerate: true })
      });

      if (!response.ok) {
        throw new Error('Failed to regenerate recommendations');
      }

      const data = await response.json();
      setRecommendations(data.recommendations || []);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to regenerate recommendations';
      setError(errorMessage);
    } finally {
      setLoadingRecommendations(false);
    }
  }, [userId]);

  // Mark recommendation as complete
  const markRecommendationComplete = useCallback(async (recommendationId: string): Promise<void> => {
    try {
      const response = await fetch(`/api/study-assistant/recommendations?id=${recommendationId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isCompleted: true })
      });

      if (!response.ok) {
        throw new Error('Failed to update recommendation');
      }

      const updatedRecommendation = await response.json();
      setRecommendations(prev => 
        prev.map(rec => rec.id === recommendationId ? updatedRecommendation : rec)
      );
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update recommendation';
      setError(errorMessage);
    }
  }, []);

  // Fetch study session optimization
  const fetchOptimization = useCallback(async (): Promise<void> => {
    try {
      setLoadingOptimization(true);
      setError(null);

      const response = await fetch(`/api/study-assistant/optimization?userId=${userId}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch optimization');
      }

      const data = await response.json();
      setOptimization(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load optimization';
      setError(errorMessage);
    } finally {
      setLoadingOptimization(false);
    }
  }, [userId]);

  // Update optimization settings
  const updateOptimization = useCallback(async (updates: Partial<StudySessionOptimization>): Promise<void> => {
    try {
      setLoadingOptimization(true);
      setError(null);

      const response = await fetch(`/api/study-assistant/optimization?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update optimization');
      }

      const updatedOptimization = await response.json();
      setOptimization(updatedOptimization);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update optimization';
      setError(errorMessage);
    } finally {
      setLoadingOptimization(false);
    }
  }, [userId]);

  // Fetch study analytics
  const fetchAnalytics = useCallback(async (dateRange?: { startDate: string; endDate: string }): Promise<void> => {
    try {
      setLoadingAnalytics(true);
      setError(null);

      const params = new URLSearchParams({ userId });
      if (dateRange) {
        params.append('startDate', dateRange.startDate);
        params.append('endDate', dateRange.endDate);
      }

      const response = await fetch(`/api/study-assistant/analytics?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load analytics';
      setError(errorMessage);
    } finally {
      setLoadingAnalytics(false);
    }
  }, [userId]);

  // Fetch recent study sessions
  const fetchRecentSessions = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch(`/api/study-assistant/sessions?userId=${userId}&limit=10`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recent sessions');
      }

      const data = await response.json();
      setRecentSessions(data.sessions || []);
    } catch (err) {
      console.error('Error fetching recent sessions:', err);
    }
  }, [userId]);

  // Initialize data on mount
  useEffect(() => {
    if (userId) {
      fetchRecommendations();
      fetchOptimization();
      fetchRecentSessions();
    }
  }, [userId, fetchRecommendations, fetchOptimization, fetchRecentSessions]);

  return {
    currentSession,
    startSession,
    endSession,
    recommendations,
    loadingRecommendations,
    fetchRecommendations,
    regenerateRecommendations,
    markRecommendationComplete,
    optimization,
    loadingOptimization,
    fetchOptimization,
    updateOptimization,
    analytics,
    loadingAnalytics,
    fetchAnalytics,
    recentSessions,
    fetchRecentSessions,
    loading,
    error
  };
}