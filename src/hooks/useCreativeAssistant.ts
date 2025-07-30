'use client';

import { useState, useCallback, useMemo } from 'react';
import { useOptimisticMutationEnhanced } from './useOptimisticUpdatesEnhanced';
import { useFetch } from './useFetch';
import { api } from '../lib/api-client';
import { useToast } from './useToast';

// Types
export interface CreativeProject {
  id: string;
  userId: string;
  title: string;
  description: string;
  type: 'writing' | 'design' | 'video' | 'music' | 'art' | 'presentation' | 'website' | 'app' | 'game' | 'other';
  status: 'planning' | 'in-progress' | 'completed' | 'paused';
  content?: string;
  created: string;
  updated: string;
}

export interface CreativeSession {
  id: string;
  projectId?: string;
  userId: string;
  type: 'brainstorm' | 'feedback' | 'outline' | 'generate';
  input: string;
  output: string;
  metadata?: {
    projectType?: string;
    style?: string;
    difficulty?: string;
    category?: string;
  };
  created: string;
}

export interface BrainstormRequest {
  prompt: string;
  projectType: string;
  projectId?: string;
}

export interface FeedbackRequest {
  content: string;
  projectType: string;
  projectId?: string;
}

export interface OutlineRequest {
  title: string;
  projectType: string;
  description: string;
  projectId?: string;
}

export interface ContentGenerationRequest {
  prompt: string;
  projectType: string;
  style?: string;
  projectId?: string;
}

export interface PromptsRequest {
  category: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
}

export interface UseCreativeAssistantOptions {
  userId: string;
  projectId?: string;
  enableCaching?: boolean;
  cacheTime?: number;
}

export interface UseCreativeAssistantResult {
  // Data
  sessions: CreativeSession[];
  projects: CreativeProject[];
  
  // Loading states
  isLoading: boolean;
  isBrainstorming: boolean;
  isGeneratingFeedback: boolean;
  isGeneratingOutline: boolean;
  isGeneratingContent: boolean;
  isGeneratingPrompts: boolean;
  
  // Error states
  error: Error | null;
  
  // AI Operations
  brainstorm: (request: BrainstormRequest) => Promise<string[]>;
  generateFeedback: (request: FeedbackRequest) => Promise<string>;
  generateOutline: (request: OutlineRequest) => Promise<string>;
  generateContent: (request: ContentGenerationRequest) => Promise<string>;
  generatePrompts: (request: PromptsRequest) => Promise<string[]>;
  
  // Session Management
  createSession: (session: Omit<CreativeSession, 'id' | 'created'>) => Promise<CreativeSession>;
  getSession: (id: string) => Promise<CreativeSession | null>;
  getSessions: (projectId?: string) => Promise<CreativeSession[]>;
  deleteSession: (id: string) => Promise<void>;
  
  // Project Management
  createProject: (project: Omit<CreativeProject, 'id' | 'created' | 'updated'>) => Promise<CreativeProject>;
  updateProject: (id: string, updates: Partial<CreativeProject>) => Promise<CreativeProject>;
  deleteProject: (id: string) => Promise<void>;
  
  // Utility operations
  refreshSessions: () => void;
  refreshProjects: () => void;
  
  // Optimistic updates
  pendingUpdates: any[];
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
}

export function useCreativeAssistant(options: UseCreativeAssistantOptions): UseCreativeAssistantResult {
  const { userId, projectId, enableCaching = true, cacheTime = 15 * 60 * 1000 } = options;
  const toast = useToast();
  
  // Local state for AI operations
  const [isBrainstorming, setIsBrainstorming] = useState(false);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [isGeneratingOutline, setIsGeneratingOutline] = useState(false);
  const [isGeneratingContent, setIsGeneratingContent] = useState(false);
  const [isGeneratingPrompts, setIsGeneratingPrompts] = useState(false);
  
  // Cache for AI responses
  const [responseCache, setResponseCache] = useState<Map<string, { data: any; timestamp: number }>>(new Map());
  
  // Fetch sessions
  const sessionsUrl = projectId 
    ? `/api/creative-sessions?userId=${userId}&projectId=${projectId}`
    : `/api/creative-sessions?userId=${userId}`;
    
  const {
    data: sessions,
    isLoading: isLoadingSessions,
    error: sessionsError,
    refetch: refetchSessions
  } = useFetch<CreativeSession[]>(sessionsUrl);
  
  // Fetch projects
  const {
    data: projects,
    isLoading: isLoadingProjects,
    error: projectsError,
    refetch: refetchProjects
  } = useFetch<CreativeProject[]>(`/api/creative-projects?userId=${userId}`);
  
  // Cache helper functions
  const getCachedResponse = useCallback((key: string) => {
    if (!enableCaching) return null;
    
    const cached = responseCache.get(key);
    if (cached && Date.now() - cached.timestamp < cacheTime) {
      return cached.data;
    }
    return null;
  }, [responseCache, enableCaching, cacheTime]);
  
  const setCachedResponse = useCallback((key: string, data: any) => {
    if (!enableCaching) return;
    
    setResponseCache(prev => new Map(prev.set(key, {
      data,
      timestamp: Date.now()
    })));
  }, [enableCaching]);
  
  // AI Operations
  const brainstorm = useCallback(async (request: BrainstormRequest): Promise<string[]> => {
    const cacheKey = `brainstorm-${JSON.stringify(request)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
    
    setIsBrainstorming(true);
    try {
      const response = await api.post('/api/creative-assistant/brainstorm', request);
      const ideas = response.success ? response.ideas : [];
      setCachedResponse(cacheKey, ideas);
      
      // Create session record
      await createSession({
        projectId: request.projectId,
        userId,
        type: 'brainstorm',
        input: request.prompt,
        output: JSON.stringify(ideas),
        metadata: {
          projectType: request.projectType
        }
      });
      
      toast({
        type: 'success',
        title: 'Ideas Generated',
        description: 'Your brainstorming session has generated new ideas!'
      });
      
      return ideas;
    } catch (error: any) {
      console.error('Brainstorm error:', error);
      toast({
        type: 'error',
        title: 'Brainstorming Failed',
        description: error.message || 'Failed to generate brainstorming ideas. Please try again.'
      });
      throw error;
    } finally {
      setIsBrainstorming(false);
    }
  }, [userId, getCachedResponse, setCachedResponse, toast]);
  
  const generateFeedback = useCallback(async (request: FeedbackRequest): Promise<string> => {
    const cacheKey = `feedback-${JSON.stringify(request)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
    
    setIsGeneratingFeedback(true);
    try {
      const response = await api.post('/api/creative-assistant/feedback', request);
      const feedback = response.success ? response.feedback : '';
      setCachedResponse(cacheKey, feedback);
      
      // Create session record
      await createSession({
        projectId: request.projectId,
        userId,
        type: 'feedback',
        input: request.content,
        output: feedback,
        metadata: {
          projectType: request.projectType
        }
      });
      
      toast({
        type: 'success',
        title: 'Feedback Generated',
        description: 'Your content has been analyzed and feedback is ready!'
      });
      
      return feedback;
    } catch (error: any) {
      console.error('Feedback error:', error);
      toast({
        type: 'error',
        title: 'Feedback Generation Failed',
        description: error.message || 'Failed to generate feedback. Please try again.'
      });
      throw error;
    } finally {
      setIsGeneratingFeedback(false);
    }
  }, [userId, getCachedResponse, setCachedResponse, toast]);
  
  const generateOutline = useCallback(async (request: OutlineRequest): Promise<string> => {
    const cacheKey = `outline-${JSON.stringify(request)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
    
    setIsGeneratingOutline(true);
    try {
      const response = await api.post('/api/creative-assistant/outline', request);
      const outline = response.success ? response.outline : '';
      setCachedResponse(cacheKey, outline);
      
      // Create session record
      await createSession({
        projectId: request.projectId,
        userId,
        type: 'outline',
        input: `${request.title}: ${request.description}`,
        output: outline,
        metadata: {
          projectType: request.projectType
        }
      });
      
      toast({
        type: 'success',
        title: 'Outline Generated',
        description: 'Your project outline has been created successfully!'
      });
      
      return outline;
    } catch (error: any) {
      console.error('Outline error:', error);
      toast({
        type: 'error',
        title: 'Outline Generation Failed',
        description: error.message || 'Failed to generate outline. Please try again.'
      });
      throw error;
    } finally {
      setIsGeneratingOutline(false);
    }
  }, [userId, getCachedResponse, setCachedResponse, toast]);
  
  const generateContent = useCallback(async (request: ContentGenerationRequest): Promise<string> => {
    const cacheKey = `content-${JSON.stringify(request)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
    
    setIsGeneratingContent(true);
    try {
      const response = await api.post('/api/creative-assistant/generate', request);
      const content = response.success ? response.content : '';
      setCachedResponse(cacheKey, content);
      
      // Create session record
      await createSession({
        projectId: request.projectId,
        userId,
        type: 'generate',
        input: request.prompt,
        output: content,
        metadata: {
          projectType: request.projectType,
          style: request.style
        }
      });
      
      toast({
        type: 'success',
        title: 'Content Generated',
        description: 'Your creative content has been generated successfully!'
      });
      
      return content;
    } catch (error: any) {
      console.error('Content generation error:', error);
      toast({
        type: 'error',
        title: 'Content Generation Failed',
        description: error.message || 'Failed to generate content. Please try again.'
      });
      throw error;
    } finally {
      setIsGeneratingContent(false);
    }
  }, [userId, getCachedResponse, setCachedResponse, toast]);
  
  const generatePrompts = useCallback(async (request: PromptsRequest): Promise<string[]> => {
    const cacheKey = `prompts-${JSON.stringify(request)}`;
    const cached = getCachedResponse(cacheKey);
    if (cached) return cached;
    
    setIsGeneratingPrompts(true);
    try {
      const response = await api.post('/api/creative-assistant/prompts', request);
      const prompts = response.success ? response.prompts : [];
      setCachedResponse(cacheKey, prompts);
      
      toast({
        type: 'success',
        title: 'Prompts Generated',
        description: 'Creative prompts have been generated for your category!'
      });
      
      return prompts;
    } catch (error: any) {
      console.error('Prompts generation error:', error);
      toast({
        type: 'error',
        title: 'Prompts Generation Failed',
        description: error.message || 'Failed to generate prompts. Please try again.'
      });
      throw error;
    } finally {
      setIsGeneratingPrompts(false);
    }
  }, [getCachedResponse, setCachedResponse, toast]);
  
  // Session Management Mutations
  const createSessionMutation = useOptimisticMutationEnhanced<CreativeSession, Omit<CreativeSession, 'id' | 'created'>>({
    mutationFn: async (data) => {
      const response = await api.post('/api/creative-sessions', {
        ...data,
        created: new Date().toISOString()
      });
      return response;
    },
    onSuccess: () => {
      refetchSessions();
    },
    onError: (error) => {
      console.error('Session creation error:', error);
    },
    enableRollback: false
  });
  
  const deleteSessionMutation = useOptimisticMutationEnhanced<void, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/creative-sessions/${id}`);
    },
    onSuccess: () => {
      refetchSessions();
      toast({
        type: 'success',
        title: 'Session Deleted',
        description: 'Creative session has been deleted successfully.'
      });
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: error.message || 'Failed to delete session.'
      });
    },
    enableRollback: true
  });
  
  // Project Management Mutations
  const createProjectMutation = useOptimisticMutationEnhanced<CreativeProject, Omit<CreativeProject, 'id' | 'created' | 'updated'>>({
    mutationFn: async (data) => {
      const now = new Date().toISOString();
      const response = await api.post('/api/creative-projects', {
        ...data,
        userId,
        created: now,
        updated: now
      });
      return response;
    },
    onSuccess: () => {
      refetchProjects();
      toast({
        type: 'success',
        title: 'Project Created',
        description: 'Your creative project has been created successfully!'
      });
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Project Creation Failed',
        description: error.message || 'Failed to create project.'
      });
    },
    enableRollback: true
  });
  
  const updateProjectMutation = useOptimisticMutationEnhanced<CreativeProject, { id: string; updates: Partial<CreativeProject> }>({
    mutationFn: async ({ id, updates }) => {
      const response = await api.put(`/api/creative-projects/${id}`, {
        ...updates,
        updated: new Date().toISOString()
      });
      return response;
    },
    onSuccess: () => {
      refetchProjects();
      toast({
        type: 'success',
        title: 'Project Updated',
        description: 'Your project has been updated successfully!'
      });
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Update Failed',
        description: error.message || 'Failed to update project.'
      });
    },
    enableRollback: true
  });
  
  const deleteProjectMutation = useOptimisticMutationEnhanced<void, string>({
    mutationFn: async (id) => {
      await api.delete(`/api/creative-projects/${id}`);
    },
    onSuccess: () => {
      refetchProjects();
      toast({
        type: 'success',
        title: 'Project Deleted',
        description: 'Your project has been deleted successfully.'
      });
    },
    onError: (error) => {
      toast({
        type: 'error',
        title: 'Delete Failed',
        description: error.message || 'Failed to delete project.'
      });
    },
    enableRollback: true
  });
  
  // Utility functions
  const getSession = useCallback(async (id: string): Promise<CreativeSession | null> => {
    try {
      const response = await api.get(`/api/creative-sessions/${id}`);
      return response;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  }, []);
  
  const getSessions = useCallback(async (projectId?: string): Promise<CreativeSession[]> => {
    try {
      const url = projectId 
        ? `/api/creative-sessions?userId=${userId}&projectId=${projectId}`
        : `/api/creative-sessions?userId=${userId}`;
      const response = await api.get(url);
      return response;
    } catch (error) {
      console.error('Get sessions error:', error);
      return [];
    }
  }, [userId]);
  
  // Memoized computed values
  const isLoading = useMemo(() => 
    isLoadingSessions || isLoadingProjects,
    [isLoadingSessions, isLoadingProjects]
  );
  
  const error = useMemo(() => 
    sessionsError || projectsError,
    [sessionsError, projectsError]
  );
  
  const allPendingUpdates = useMemo(() => [
    ...createSessionMutation.pendingUpdates,
    ...deleteSessionMutation.pendingUpdates,
    ...createProjectMutation.pendingUpdates,
    ...updateProjectMutation.pendingUpdates,
    ...deleteProjectMutation.pendingUpdates
  ], [
    createSessionMutation.pendingUpdates,
    deleteSessionMutation.pendingUpdates,
    createProjectMutation.pendingUpdates,
    updateProjectMutation.pendingUpdates,
    deleteProjectMutation.pendingUpdates
  ]);
  
  // Rollback functions
  const rollback = useCallback((updateId: string) => {
    createSessionMutation.rollback(updateId);
    deleteSessionMutation.rollback(updateId);
    createProjectMutation.rollback(updateId);
    updateProjectMutation.rollback(updateId);
    deleteProjectMutation.rollback(updateId);
  }, [createSessionMutation, deleteSessionMutation, createProjectMutation, updateProjectMutation, deleteProjectMutation]);
  
  const rollbackAll = useCallback(() => {
    createSessionMutation.rollbackAll();
    deleteSessionMutation.rollbackAll();
    createProjectMutation.rollbackAll();
    updateProjectMutation.rollbackAll();
    deleteProjectMutation.rollbackAll();
  }, [createSessionMutation, deleteSessionMutation, createProjectMutation, updateProjectMutation, deleteProjectMutation]);
  
  return {
    // Data
    sessions: sessions || [],
    projects: projects || [],
    
    // Loading states
    isLoading,
    isBrainstorming,
    isGeneratingFeedback,
    isGeneratingOutline,
    isGeneratingContent,
    isGeneratingPrompts,
    
    // Error states
    error,
    
    // AI Operations
    brainstorm,
    generateFeedback,
    generateOutline,
    generateContent,
    generatePrompts,
    
    // Session Management
    createSession: createSessionMutation.mutate,
    getSession,
    getSessions,
    deleteSession: deleteSessionMutation.mutate,
    
    // Project Management
    createProject: createProjectMutation.mutate,
    updateProject: (id: string, updates: Partial<CreativeProject>) => 
      updateProjectMutation.mutate({ id, updates }),
    deleteProject: deleteProjectMutation.mutate,
    
    // Utility operations
    refreshSessions: refetchSessions,
    refreshProjects: refetchProjects,
    
    // Optimistic updates
    pendingUpdates: allPendingUpdates,
    rollback,
    rollbackAll
  };
}