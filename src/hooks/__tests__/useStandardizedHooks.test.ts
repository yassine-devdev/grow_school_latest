import { renderHook, act, waitFor } from '@testing-library/react';
import { useJournal } from '../useJournal';
import { useCreativeAssistant } from '../useCreativeAssistant';
import { useMoodTracking } from '../useMoodTracking';

// Mock dependencies
jest.mock('../useFetch');
jest.mock('../useToast');
jest.mock('../useOptimisticUpdatesEnhanced');
jest.mock('../../lib/api-client');
jest.mock('../../stores/applicationStore');

const mockUseFetch = require('../useFetch').useFetch as jest.MockedFunction<typeof import('../useFetch').useFetch>;
const mockUseToast = require('../useToast').useToast as jest.MockedFunction<typeof import('../useToast').useToast>;
const mockUseOptimisticMutationEnhanced = require('../useOptimisticUpdatesEnhanced').useOptimisticMutationEnhanced as jest.MockedFunction<typeof import('../useOptimisticUpdatesEnhanced').useOptimisticMutationEnhanced>;
const mockApi = require('../../lib/api-client').api as jest.Mocked<typeof import('../../lib/api-client').api>;

describe('Standardized Custom Hooks', () => {
  const mockToast = jest.fn();
  const mockMutate = jest.fn();
  const mockRollback = jest.fn();
  const mockRollbackAll = jest.fn();
  const mockResolveConflict = jest.fn();
  const mockGetConflictData = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockUseToast.mockReturnValue(mockToast);
    
    mockUseOptimisticMutationEnhanced.mockReturnValue({
      mutate: mockMutate,
      mutateAsync: mockMutate,
      isLoading: false,
      pendingUpdates: [],
      conflictedUpdates: [],
      rollback: mockRollback,
      rollbackAll: mockRollbackAll,
      retry: jest.fn(),
      resolveConflict: mockResolveConflict,
      getConflictData: mockGetConflictData
    });
    
    mockUseFetch.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
      refetch: jest.fn()
    });
  });

  describe('useJournal', () => {
    const mockJournalEntries = [
      {
        id: '1',
        userId: 'user1',
        title: 'Test Entry',
        content: 'Test content',
        mood: 'happy' as const,
        tags: ['test'],
        isPrivate: false,
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z'
      }
    ];

    const mockAnalytics = {
      totalEntries: 1,
      averageMood: 4,
      commonTags: ['test'],
      writingStreak: 1,
      growthInsights: ['Great progress!']
    };

    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useJournal({ userId: 'user1' }));

      expect(result.current.entries).toEqual([]);
      expect(result.current.analytics).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide CRUD operations', () => {
      const { result } = renderHook(() => useJournal({ userId: 'user1' }));

      expect(typeof result.current.createEntry).toBe('function');
      expect(typeof result.current.updateEntry).toBe('function');
      expect(typeof result.current.deleteEntry).toBe('function');
      expect(typeof result.current.searchEntries).toBe('function');
      expect(typeof result.current.getEntriesByDateRange).toBe('function');
    });

    it('should provide optimistic update controls', () => {
      const { result } = renderHook(() => useJournal({ userId: 'user1' }));

      expect(Array.isArray(result.current.pendingUpdates)).toBe(true);
      expect(Array.isArray(result.current.conflictedUpdates)).toBe(true);
      expect(typeof result.current.rollback).toBe('function');
      expect(typeof result.current.rollbackAll).toBe('function');
      expect(typeof result.current.resolveConflict).toBe('function');
      expect(typeof result.current.getConflictData).toBe('function');
    });

    it('should handle search entries', async () => {
      mockApi.get.mockResolvedValue(mockJournalEntries);
      
      const { result } = renderHook(() => useJournal({ userId: 'user1' }));

      await act(async () => {
        const searchResults = await result.current.searchEntries('test');
        expect(searchResults).toEqual(mockJournalEntries);
      });

      expect(mockApi.get).toHaveBeenCalledWith('/api/journal/search?userId=user1&query=test');
    });

    it('should handle date range queries', async () => {
      mockApi.get.mockResolvedValue(mockJournalEntries);
      
      const { result } = renderHook(() => useJournal({ userId: 'user1' }));

      await act(async () => {
        const entries = await result.current.getEntriesByDateRange('2024-01-01', '2024-01-31');
        expect(entries).toEqual(mockJournalEntries);
      });

      expect(mockApi.get).toHaveBeenCalledWith('/api/journal/entries/date-range?userId=user1&startDate=2024-01-01&endDate=2024-01-31');
    });
  });

  describe('useCreativeAssistant', () => {
    const mockSessions = [
      {
        id: '1',
        projectId: 'project1',
        userId: 'user1',
        type: 'brainstorm' as const,
        input: 'Test prompt',
        output: 'Test output',
        created: '2024-01-01T00:00:00Z'
      }
    ];

    const mockProjects = [
      {
        id: '1',
        userId: 'user1',
        title: 'Test Project',
        description: 'Test description',
        type: 'writing' as const,
        status: 'planning' as const,
        created: '2024-01-01T00:00:00Z',
        updated: '2024-01-01T00:00:00Z'
      }
    ];

    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useCreativeAssistant({ userId: 'user1' }));

      expect(result.current.sessions).toEqual([]);
      expect(result.current.projects).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide AI operations', () => {
      const { result } = renderHook(() => useCreativeAssistant({ userId: 'user1' }));

      expect(typeof result.current.brainstorm).toBe('function');
      expect(typeof result.current.generateFeedback).toBe('function');
      expect(typeof result.current.generateOutline).toBe('function');
      expect(typeof result.current.generateContent).toBe('function');
      expect(typeof result.current.generatePrompts).toBe('function');
    });

    it('should provide session and project management', () => {
      const { result } = renderHook(() => useCreativeAssistant({ userId: 'user1' }));

      expect(typeof result.current.createSession).toBe('function');
      expect(typeof result.current.getSession).toBe('function');
      expect(typeof result.current.getSessions).toBe('function');
      expect(typeof result.current.deleteSession).toBe('function');
      expect(typeof result.current.createProject).toBe('function');
      expect(typeof result.current.updateProject).toBe('function');
      expect(typeof result.current.deleteProject).toBe('function');
    });

    it('should handle brainstorming with caching', async () => {
      const mockIdeas = ['Idea 1', 'Idea 2', 'Idea 3'];
      mockApi.post.mockResolvedValue(mockIdeas);
      
      const { result } = renderHook(() => useCreativeAssistant({ 
        userId: 'user1',
        enableCaching: true 
      }));

      await act(async () => {
        const ideas = await result.current.brainstorm({
          prompt: 'Generate ideas for a writing project',
          projectType: 'writing'
        });
        expect(ideas).toEqual(mockIdeas);
      });

      expect(mockApi.post).toHaveBeenCalledWith('/api/creative-assistant/brainstorm', {
        prompt: 'Generate ideas for a writing project',
        projectType: 'writing'
      });
    });

    it('should handle feedback generation', async () => {
      const mockFeedback = 'Great work! Consider adding more details.';
      mockApi.post.mockResolvedValue(mockFeedback);
      
      const { result } = renderHook(() => useCreativeAssistant({ userId: 'user1' }));

      await act(async () => {
        const feedback = await result.current.generateFeedback({
          content: 'Test content',
          projectType: 'writing'
        });
        expect(feedback).toEqual(mockFeedback);
      });

      expect(mockApi.post).toHaveBeenCalledWith('/api/creative-assistant/feedback', {
        content: 'Test content',
        projectType: 'writing'
      });
    });
  });

  describe('useMoodTracking', () => {
    const mockEntries = [
      {
        id: '1',
        userId: 'user1',
        mood: 'high' as const,
        focus: 'high' as const,
        energy: 'medium' as const,
        stress: 'low' as const,
        notes: 'Feeling good today',
        created: '2024-01-01T00:00:00Z'
      }
    ];

    const mockAnalytics = {
      averageMood: 4,
      averageFocus: 4,
      averageEnergy: 3,
      averageStress: 2,
      totalEntries: 1,
      streakDays: 1,
      trends: {
        mood: [{ date: '2024-01-01', value: 4 }],
        focus: [{ date: '2024-01-01', value: 4 }],
        energy: [{ date: '2024-01-01', value: 3 }],
        stress: [{ date: '2024-01-01', value: 2 }]
      },
      insights: ['You are doing well!'],
      patterns: [],
      correlations: []
    };

    const mockRecommendations = [
      'Keep up the good work!',
      'Try meditation for better focus'
    ];

    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      expect(result.current.entries).toEqual([]);
      expect(result.current.analytics).toBeNull();
      expect(result.current.recommendations).toEqual([]);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should provide CRUD operations', () => {
      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      expect(typeof result.current.createEntry).toBe('function');
      expect(typeof result.current.updateEntry).toBe('function');
      expect(typeof result.current.deleteEntry).toBe('function');
    });

    it('should provide analytics operations', () => {
      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      expect(typeof result.current.getEntriesByDateRange).toBe('function');
      expect(typeof result.current.getTrends).toBe('function');
      expect(typeof result.current.getInsights).toBe('function');
      expect(typeof result.current.getRecommendations).toBe('function');
    });

    it('should provide visualization helpers', () => {
      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      expect(typeof result.current.getChartData).toBe('function');
      expect(typeof result.current.getCorrelationData).toBe('function');
      expect(typeof result.current.getPatternData).toBe('function');
    });

    it('should handle chart data generation', () => {
      mockUseFetch.mockReturnValueOnce({
        data: mockEntries,
        isLoading: false,
        error: null,
        refetch: jest.fn()
      });

      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      const chartData = result.current.getChartData('mood', 7);
      expect(Array.isArray(chartData)).toBe(true);
    });

    it('should handle date range queries', async () => {
      mockApi.get.mockResolvedValue(mockEntries);
      
      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      await act(async () => {
        const entries = await result.current.getEntriesByDateRange('2024-01-01', '2024-01-31');
        expect(entries).toEqual(mockEntries);
      });

      expect(mockApi.get).toHaveBeenCalledWith('/api/mood-focus-checkin/date-range?userId=user1&startDate=2024-01-01&endDate=2024-01-31');
    });

    it('should handle trends fetching', async () => {
      const mockTrends = {
        mood: [{ date: '2024-01-01', value: 4 }],
        focus: [{ date: '2024-01-01', value: 4 }],
        energy: [{ date: '2024-01-01', value: 3 }],
        stress: [{ date: '2024-01-01', value: 2 }]
      };
      mockApi.get.mockResolvedValue(mockTrends);
      
      const { result } = renderHook(() => useMoodTracking({ userId: 'user1' }));

      await act(async () => {
        const trends = await result.current.getTrends(30);
        expect(trends).toEqual(mockTrends);
      });

      expect(mockApi.get).toHaveBeenCalledWith('/api/mood-focus-checkin/trends?userId=user1&days=30');
    });
  });

  describe('Common Hook Patterns', () => {
    it('should all follow the same error handling pattern', () => {
      const journalHook = renderHook(() => useJournal({ userId: 'user1' }));
      const creativeHook = renderHook(() => useCreativeAssistant({ userId: 'user1' }));
      const moodHook = renderHook(() => useMoodTracking({ userId: 'user1' }));

      // All hooks should have error property
      expect(journalHook.result.current).toHaveProperty('error');
      expect(creativeHook.result.current).toHaveProperty('error');
      expect(moodHook.result.current).toHaveProperty('error');

      // All hooks should have loading states
      expect(journalHook.result.current).toHaveProperty('isLoading');
      expect(creativeHook.result.current).toHaveProperty('isLoading');
      expect(moodHook.result.current).toHaveProperty('isLoading');
    });

    it('should all provide optimistic update controls', () => {
      const journalHook = renderHook(() => useJournal({ userId: 'user1' }));
      const creativeHook = renderHook(() => useCreativeAssistant({ userId: 'user1' }));
      const moodHook = renderHook(() => useMoodTracking({ userId: 'user1' }));

      // All hooks should have optimistic update controls
      expect(journalHook.result.current).toHaveProperty('pendingUpdates');
      expect(journalHook.result.current).toHaveProperty('rollback');
      expect(journalHook.result.current).toHaveProperty('rollbackAll');

      expect(creativeHook.result.current).toHaveProperty('pendingUpdates');
      expect(creativeHook.result.current).toHaveProperty('rollback');
      expect(creativeHook.result.current).toHaveProperty('rollbackAll');

      expect(moodHook.result.current).toHaveProperty('pendingUpdates');
      expect(moodHook.result.current).toHaveProperty('rollback');
      expect(moodHook.result.current).toHaveProperty('rollbackAll');
    });

    it('should all use the same API client pattern', async () => {
      const journalHook = renderHook(() => useJournal({ userId: 'user1' }));
      const creativeHook = renderHook(() => useCreativeAssistant({ userId: 'user1' }));
      const moodHook = renderHook(() => useMoodTracking({ userId: 'user1' }));

      // All hooks should use the api client for operations
      expect(mockUseOptimisticMutationEnhanced).toHaveBeenCalledTimes(9); // 3 mutations per hook
    });
  });
});