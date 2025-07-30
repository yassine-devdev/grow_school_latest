import { renderHook, act, waitFor } from '@testing-library/react';
import { useOptimisticMutation } from '../useOptimisticMutation';
import { useApplicationStore } from '../../stores/applicationStore';

// Mock the application store
jest.mock('../../stores/applicationStore');
const mockUseApplicationStore = useApplicationStore as jest.MockedFunction<typeof useApplicationStore>;

// Mock nanoid
jest.mock('nanoid', () => ({
  nanoid: () => 'test-id-123',
}));

describe('useOptimisticMutation', () => {
  const mockAddNotification = jest.fn();
  const mockSetLoading = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseApplicationStore.mockReturnValue({
      addNotification: mockAddNotification,
      setLoading: mockSetLoading,
    } as any);
  });

  it('should perform successful mutation without optimistic update', async () => {
    const mockMutationFn = jest.fn().mockResolvedValue('success');
    const mockOnSuccess = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockMutationFn,
        onSuccess: mockOnSuccess,
      })
    );

    await act(async () => {
      const response = await result.current.mutate('test-data');
      expect(response).toBe('success');
    });

    expect(mockMutationFn).toHaveBeenCalledWith('test-data');
    expect(mockOnSuccess).toHaveBeenCalledWith('success', 'test-data');
    expect(mockSetLoading).toHaveBeenCalledWith('optimistic-mutation', true);
    expect(mockSetLoading).toHaveBeenCalledWith('optimistic-mutation', false);
  });

  it('should perform optimistic update and confirm on success', async () => {
    const mockMutationFn = jest.fn().mockResolvedValue('server-result');
    const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');
    const mockOnSuccess = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockMutationFn,
        onOptimisticUpdate: mockOnOptimisticUpdate,
        onSuccess: mockOnSuccess,
      })
    );

    await act(async () => {
      await result.current.mutate('test-data');
    });

    expect(mockOnOptimisticUpdate).toHaveBeenCalledWith('test-data');
    expect(result.current.pendingUpdates).toHaveLength(0); // Should be removed after success
    expect(mockOnSuccess).toHaveBeenCalledWith('server-result', 'test-data');
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'info',
      title: 'Update in Progress',
      message: 'Your changes are being saved...',
    });
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'success',
      title: 'Update Successful',
      message: 'Your changes have been saved successfully.',
    });
  });

  it('should handle mutation failure with optimistic update', async () => {
    const mockError = new Error('Network error');
    const mockMutationFn = jest.fn().mockRejectedValue(mockError);
    const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');
    const mockOnError = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockMutationFn,
        onOptimisticUpdate: mockOnOptimisticUpdate,
        onError: mockOnError,
        enableRollback: true,
      })
    );

    await act(async () => {
      try {
        await result.current.mutate('test-data');
      } catch (error) {
        expect(error).toBe(mockError);
      }
    });

    expect(result.current.pendingUpdates).toHaveLength(1);
    expect(result.current.pendingUpdates[0].status).toBe('failed');
    expect(mockOnError).toHaveBeenCalledWith(mockError, 'test-data', undefined);
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'error',
      title: 'Update Failed',
      message: 'Network error. You can retry or rollback the changes.',
    });
  });

  it('should rollback optimistic update', async () => {
    const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');
    const mockOnRollback = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: jest.fn().mockRejectedValue(new Error('Failed')),
        onOptimisticUpdate: mockOnOptimisticUpdate,
        onRollback: mockOnRollback,
        enableRollback: true,
      })
    );

    // First, create a failed update
    await act(async () => {
      try {
        await result.current.mutate('test-data');
      } catch (error) {
        // Expected to fail
      }
    });

    const updateId = result.current.pendingUpdates[0].id;

    // Then rollback
    act(() => {
      result.current.rollback(updateId);
    });

    expect(result.current.pendingUpdates[0].status).toBe('rolled_back');
    expect(mockOnRollback).toHaveBeenCalledWith('optimistic-result', 'test-data');
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'info',
      title: 'Update Rolled Back',
      message: 'The optimistic update has been rolled back to its previous state.',
    });
  });

  it('should retry failed update', async () => {
    const mockMutationFn = jest
      .fn()
      .mockRejectedValueOnce(new Error('First failure'))
      .mockResolvedValueOnce('success');
    const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');
    const mockOnSuccess = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockMutationFn,
        onOptimisticUpdate: mockOnOptimisticUpdate,
        onSuccess: mockOnSuccess,
        maxRetries: 3,
      })
    );

    // First, create a failed update
    await act(async () => {
      try {
        await result.current.mutate('test-data');
      } catch (error) {
        // Expected to fail
      }
    });

    const updateId = result.current.pendingUpdates[0].id;
    expect(result.current.pendingUpdates[0].status).toBe('failed');

    // Then retry
    await act(async () => {
      await result.current.retry(updateId);
    });

    await waitFor(() => {
      expect(result.current.pendingUpdates[0].status).toBe('confirmed');
    });

    expect(mockMutationFn).toHaveBeenCalledTimes(2);
    expect(mockOnSuccess).toHaveBeenCalledWith('success', 'optimistic-result');
    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'success',
      title: 'Update Successful',
      message: 'The retry was successful.',
    });
  });

  it('should handle max retries reached', async () => {
    const mockMutationFn = jest.fn().mockRejectedValue(new Error('Always fails'));
    const mockOnOptimisticUpdate = jest.fn().mockReturnValue('optimistic-result');

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockMutationFn,
        onOptimisticUpdate: mockOnOptimisticUpdate,
        maxRetries: 1,
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

    // Retry once (should still fail)
    await act(async () => {
      await result.current.retry(updateId);
    });

    // Try to retry again (should be blocked)
    act(() => {
      result.current.retry(updateId);
    });

    expect(mockAddNotification).toHaveBeenCalledWith({
      type: 'error',
      title: 'Max Retries Reached',
      message: 'The update has failed too many times and cannot be retried.',
    });
  });

  it('should rollback all pending and failed updates', async () => {
    const mockOnOptimisticUpdate = jest.fn()
      .mockReturnValueOnce('optimistic-1')
      .mockReturnValueOnce('optimistic-2');
    const mockOnRollback = jest.fn();

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: jest.fn().mockRejectedValue(new Error('Failed')),
        onOptimisticUpdate: mockOnOptimisticUpdate,
        onRollback: mockOnRollback,
        enableRollback: true,
      })
    );

    // Create two failed updates
    await act(async () => {
      try {
        await result.current.mutate('test-data-1');
      } catch (error) {
        // Expected to fail
      }
    });

    await act(async () => {
      try {
        await result.current.mutate('test-data-2');
      } catch (error) {
        // Expected to fail
      }
    });

    expect(result.current.pendingUpdates).toHaveLength(2);

    // Rollback all
    act(() => {
      result.current.rollbackAll();
    });

    expect(result.current.pendingUpdates.every(u => u.status === 'rolled_back')).toBe(true);
    expect(mockOnRollback).toHaveBeenCalledTimes(2);
  });

  it('should track loading state correctly', async () => {
    const mockMutationFn = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve('success'), 100))
    );

    const { result } = renderHook(() =>
      useOptimisticMutation({
        mutationFn: mockMutationFn,
      })
    );

    expect(result.current.isLoading).toBe(false);

    act(() => {
      result.current.mutate('test-data');
    });

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });
  });
});