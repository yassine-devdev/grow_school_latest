import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticMutationUtilities, optimisticMutationUtils } from '../useOptimisticMutationUtilities';
import { useApplicationStore } from '../../stores/applicationStore';

// Mock the application store
jest.mock('../../stores/applicationStore');
const mockUseApplicationStore = useApplicationStore as jest.MockedFunction<typeof useApplicationStore>;

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-123',
}));

describe('useOptimisticMutationUtilities', () => {
  const mockAddNotification = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    mockUseApplicationStore.mockReturnValue({
      addNotification: mockAddNotification,
      setLoading: mockSetLoading,
    } as any);
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe('Basic functionality', () => {
    it('should perform successful mutation with enhanced tracking', async () => {
      const mockMutationFn = jest.fn().mockResolvedValue('success');
      const mockOnSuccess = jest.fn();

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onSuccess: mockOnSuccess,
        })
      );

      await act(async () => {
        const response = await result.current.mutate('test-data');
        expect(response).toBe('success');
      });

      expect(mockMutationFn).toHaveBeenCalledWith('test-data');
      expect(mockOnSuccess).toHaveBeenCalledWith('success', 'test-data', undefined);
      expect(mockSetLoading).toHaveBeenCalledWith('optimistic-mutation', true);
      expect(mockSetLoading).toHaveBeenCalledWith('optimistic-mutation', false);
    });

    it('should track optimistic updates with enhanced metadata', async () => {
      const mockMutationFn = jest.fn().mockResolvedValue('server-result');
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          enableStateSnapshot: true,
          userFeedback: {
            showProgress: true,
            showSuccess: true,
            customMessages: {
              progress: 'Custom progress message',
              success: 'Custom success message',
            },
          },
        })
      );

      await act(async () => {
        await result.current.mutate('test-data');
      });

      expect(mockOnOptimisticUpdate).toHaveBeenCalledWith('test-data', undefined);
      expect(result.current.stateSnapshots).toHaveLength(0); // Should be cleaned up after success
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'info',
        title: 'Update in Progress',
        message: 'Custom progress message',
      });
      expect(mockAddNotification).toHaveBeenCalledWith({
        type: 'success',
        title: 'Update Successful',
        message: 'Custom success message',
      });
    });
  });

  describe('Conflict detection and resolution', () => {
    it('should detect conflicts and resolve with client-wins strategy', async () => {
      const clientData = { id: '1', name: 'Client Name', value: 100 };
      const serverData = { id: '1', name: 'Server Name', value: 200 };
      
      const mockMutationFn = jest.fn().mockResolvedValue(serverData);
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue(clientData);
      const mockOnConflictResolved = jest.fn();

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          onConflictResolved: mockOnConflictResolved,
          enableConflictDetection: true,
          conflictResolution: {
            strategy: 'client-wins',
          },
        })
      );

      let resolvedData;
      await act(async () => {
        resolvedData = await result.current.mutate('test-data');
      });

      expect(result.current.hasConflicts(clientData, serverData)).toBe(true);
      expect(mockOnConflictResolved).toHaveBeenCalled();
      expect(resolvedData).toEqual({ id: '1', name: 'Client Name', value: 100 });
    });

    it('should resolve conflicts with custom resolver', async () => {
      const clientData = { id: '1', name: 'Client Name', value: 100 };
      const serverData = { id: '1', name: 'Server Name', value: 200 };
      const expectedMerged = { id: '1', name: 'Merged Name', value: 150 };
      
      const mockMutationFn = jest.fn().mockResolvedValue(serverData);
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue(clientData);
      const mockCustomResolver = jest.fn().mockReturnValue(expectedMerged);

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          enableConflictDetection: true,
          conflictResolution: {
            strategy: 'custom',
            customResolver: mockCustomResolver,
          },
        })
      );

      let resolvedData;
      await act(async () => {
        resolvedData = await result.current.mutate('test-data');
      });

      expect(mockCustomResolver).toHaveBeenCalledWith(clientData, serverData);
      expect(resolvedData).toEqual(expectedMerged);
    });
  });

  describe('Enhanced retry mechanism', () => {
    it('should retry with exponential backoff', async () => {
      const mockMutationFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          maxRetries: 3,
        })
      );

      // Create a failed update
      await act(async () => {
        try {
          await result.current.mutate('test-data');
        } catch (error) {
          // Expected to fail
        }
      });

      const updateId = result.current.pendingUpdates[0].id;
      expect(result.current.pendingUpdates[0].status).toBe('failed');

      // Retry with exponential backoff
      act(() => {
        result.current.retry(updateId);
      });

      // Fast-forward through the exponential backoff delay
      act(() => {
        jest.advanceTimersByTime(1000); // First retry delay
      });

      await waitFor(() => {
        expect(result.current.pendingUpdates[0].status).toBe('confirmed');
      });

      expect(mockMutationFn).toHaveBeenCalledTimes(2);
    });

    it('should enable auto-retry for failed updates', async () => {
      const mockMutationFn = jest
        .fn()
        .mockRejectedValueOnce(new Error('First failure'))
        .mockResolvedValueOnce('success');
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          enableAutoRetry: true,
          maxRetries: 3,
        })
      );

      // Create a failed update
      await act(async () => {
        try {
          await result.current.mutate('test-data');
        } catch (error) {
          // Expected to fail
        }
      });

      expect(result.current.pendingUpdates[0].status).toBe('failed');

      // Auto-retry should be triggered after 2 seconds
      act(() => {
        jest.advanceTimersByTime(2000);
      });

      // Then the exponential backoff delay
      act(() => {
        jest.advanceTimersByTime(1000);
      });

      await waitFor(() => {
        expect(result.current.pendingUpdates[0].status).toBe('confirmed');
      });

      expect(mockMutationFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Batch processing', () => {
    it('should batch optimistic updates when enabled', async () => {
      const mockMutationFn = jest.fn().mockResolvedValue('success');
      const mockOnOptimisticUpdate = jest.fn()
        .mockReturnValueOnce('optimistic-1')
        .mockReturnValueOnce('optimistic-2');

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          enableOptimisticBatching: true,
          batchDelay: 100,
        })
      );

      // Make multiple mutations quickly
      act(() => {
        result.current.mutate('data-1');
        result.current.mutate('data-2');
      });

      expect(result.current.batchQueueLength).toBe(2);

      // Fast-forward through batch delay
      act(() => {
        jest.advanceTimersByTime(100);
      });

      await waitFor(() => {
        expect(result.current.batchQueueLength).toBe(0);
      });

      expect(mockMutationFn).toHaveBeenCalledTimes(2);
    });
  });

  describe('State snapshots', () => {
    it('should create and use state snapshots for rollback', async () => {
      const originalData = { id: '1', name: 'Original' };
      const optimisticData = { id: '1', name: 'Optimistic' };
      
      const mockMutationFn = jest.fn().mockRejectedValue(new Error('Failed'));
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue(optimisticData);
      const mockOnRollback = jest.fn();

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          onRollback: mockOnRollback,
          enableStateSnapshot: true,
          enableRollback: true,
        })
      );

      // Create a failed update
      await act(async () => {
        try {
          await result.current.mutate('test-data');
        } catch (error) {
          // Expected to fail
        }
      });

      const updateId = result.current.pendingUpdates[0].id;

      // Rollback using state snapshot
      act(() => {
        result.current.rollback(updateId);
      });

      expect(result.current.pendingUpdates[0].status).toBe('rolled_back');
      expect(mockOnRollback).toHaveBeenCalled();
    });
  });

  describe('Update statistics', () => {
    it('should provide accurate update statistics', async () => {
      const mockMutationFn = jest
        .fn()
        .mockResolvedValueOnce('success-1')
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce('success-2');
      const mockOnOptimisticUpdate = jest.fn()
        .mockReturnValueOnce('optimistic-1')
        .mockReturnValueOnce('optimistic-2')
        .mockReturnValueOnce('optimistic-3');

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
        })
      );

      // Create successful update
      await act(async () => {
        await result.current.mutate('data-1');
      });

      // Create failed update
      await act(async () => {
        try {
          await result.current.mutate('data-2');
        } catch (error) {
          // Expected to fail
        }
      });

      // Create another successful update
      await act(async () => {
        await result.current.mutate('data-3');
      });

      const stats = result.current.getUpdateStats();
      expect(stats.total).toBe(2); // One confirmed should be removed, one failed remains
      expect(stats.failed).toBe(1);
    });
  });

  describe('Custom user feedback', () => {
    it('should respect custom feedback configuration', async () => {
      const mockMutationFn = jest.fn().mockResolvedValue('success');
      const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic');

      const { result } = renderHook(() =>
        useOptimisticMutationUtilities({
          mutationFn: mockMutationFn,
          onOptimisticUpdate: mockOnOptimisticUpdate,
          userFeedback: {
            showProgress: false,
            showSuccess: false,
            showError: true,
          },
        })
      );

      await act(async () => {
        await result.current.mutate('test-data');
      });

      // Should not show progress or success notifications
      expect(mockAddNotification).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'info' })
      );
      expect(mockAddNotification).not.toHaveBeenCalledWith(
        expect.objectContaining({ type: 'success' })
      );
    });
  });
});

describe('optimisticMutationUtils', () => {
  describe('createDebouncedUpdate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should debounce update calls', () => {
      const mockUpdateFn = jest.fn();
      const debouncedUpdate = optimisticMutationUtils.createDebouncedUpdate(mockUpdateFn, 300);

      debouncedUpdate('data-1');
      debouncedUpdate('data-2');
      debouncedUpdate('data-3');

      expect(mockUpdateFn).not.toHaveBeenCalled();

      act(() => {
        jest.advanceTimersByTime(300);
      });

      expect(mockUpdateFn).toHaveBeenCalledTimes(1);
      expect(mockUpdateFn).toHaveBeenCalledWith('data-3');
    });
  });

  describe('createThrottledUpdate', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should throttle update calls', () => {
      const mockUpdateFn = jest.fn();
      const throttledUpdate = optimisticMutationUtils.createThrottledUpdate(mockUpdateFn, 300);

      throttledUpdate('data-1');
      expect(mockUpdateFn).toHaveBeenCalledWith('data-1');

      throttledUpdate('data-2');
      expect(mockUpdateFn).toHaveBeenCalledTimes(1); // Should not call again

      act(() => {
        jest.advanceTimersByTime(300);
      });

      throttledUpdate('data-3');
      expect(mockUpdateFn).toHaveBeenCalledTimes(2);
      expect(mockUpdateFn).toHaveBeenCalledWith('data-3');
    });
  });

  describe('validateOptimisticData', () => {
    it('should validate data and return it if valid', () => {
      const data = { id: '1', name: 'Test' };
      const validator = (d: any) => d.id && d.name;

      const result = optimisticMutationUtils.validateOptimisticData(data, validator);
      expect(result).toBe(data);
    });

    it('should return fallback data if validation fails', () => {
      const data = { id: '1' }; // Missing name
      const fallback = { id: '1', name: 'Default' };
      const validator = (d: any) => d.id && d.name;

      const result = optimisticMutationUtils.validateOptimisticData(data, validator, fallback);
      expect(result).toBe(fallback);
    });

    it('should throw error if validation fails and no fallback', () => {
      const data = { id: '1' }; // Missing name
      const validator = (d: any) => d.id && d.name;

      expect(() => {
        optimisticMutationUtils.validateOptimisticData(data, validator);
      }).toThrow('Invalid optimistic update data');
    });
  });

  describe('createConflictFreeMerge', () => {
    it('should merge data with priority keys taking precedence', () => {
      const clientData = { id: '1', name: 'Client', value: 100, priority: 'high' };
      const serverData = { id: '1', name: 'Server', value: 200, timestamp: '2023-01-01' };
      
      const merge = optimisticMutationUtils.createConflictFreeMerge(['name', 'priority']);
      const result = merge(clientData, serverData);

      expect(result).toEqual({
        id: '1',
        name: 'Client', // Client wins for priority key
        value: 200, // Server wins for non-priority key
        timestamp: '2023-01-01', // Server data preserved
        priority: 'high', // Client wins for priority key
      });
    });
  });
});