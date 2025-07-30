'use client';

import { useCallback, useRef, useState, useEffect } from 'react';
import { nanoid } from 'nanoid';
import { useApplicationStore } from '../stores/applicationStore';
import { conflictDetector, ConflictData, ConflictResolution } from '../lib/conflict-detection';

// Enhanced types for optimistic updates
export interface OptimisticUpdate<TData = any> {
  id: string;
  type: string;
  data: TData;
  originalData?: TData;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed' | 'rolled_back' | 'conflicted';
  retryCount: number;
  maxRetries: number;
  version?: number;
  lastSyncTime?: string;
  conflictId?: string;
}

export interface OptimisticMutationConfig<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onOptimisticUpdate?: (variables: TVariables) => TData;
  onSuccess?: (data: TData, variables: TVariables) => void;
  onError?: (error: Error, variables: TVariables, rollbackData?: TData) => void;
  onRollback?: (rollbackData: TData, variables: TVariables) => void;
  onConflict?: (conflict: ConflictData, variables: TVariables) => ConflictResolution | null;
  maxRetries?: number;
  retryDelay?: number;
  enableRollback?: boolean;
  conflictResolution?: 'client-wins' | 'server-wins' | 'merge' | 'prompt-user';
  enableConflictDetection?: boolean;
  resourceType?: string;
  uniqueFields?: string[];
}

export interface OptimisticMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => Promise<TData>;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  pendingUpdates: OptimisticUpdate<TData>[];
  conflictedUpdates: OptimisticUpdate<TData>[];
  rollback: (updateId: string) => void;
  rollbackAll: () => void;
  retry: (updateId: string) => Promise<void>;
  resolveConflict: (updateId: string, resolution: ConflictResolution) => Promise<void>;
  getConflictData: (updateId: string) => ConflictData | null;
}

// Enhanced optimistic mutation hook with conflict detection
export function useOptimisticMutationEnhanced<TData = any, TVariables = TData>(
  config: OptimisticMutationConfig<TData, TVariables>
): OptimisticMutationResult<TData, TVariables> {
  const [isLoading, setIsLoading] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<TData>[]>([]);
  const { addNotification, setLoading } = useApplicationStore();
  
  // Use ref to store the latest config to avoid stale closures
  const configRef = useRef(config);
  configRef.current = config;
  
  // Track conflicts
  const [conflicts, setConflicts] = useState<Map<string, ConflictData>>(new Map());
  
  // Subscribe to conflict detector
  useEffect(() => {
    if (!configRef.current.enableConflictDetection) return;
    
    const unsubscribe = conflictDetector.onConflict((conflict) => {
      // Find the update that caused this conflict
      const relatedUpdate = pendingUpdates.find(update => 
        update.conflictId === conflict.id || 
        (conflict.resourceId && update.data && 
         typeof update.data === 'object' && 
         'id' in update.data && 
         update.data.id === conflict.resourceId)
      );
      
      if (relatedUpdate) {
        setConflicts(prev => new Map(prev.set(conflict.id, conflict)));
        updatePendingUpdate(relatedUpdate.id, { 
          status: 'conflicted',
          conflictId: conflict.id 
        });
      }
    });
    
    return unsubscribe;
  }, [pendingUpdates]);
  
  // Track pending updates
  const addPendingUpdate = useCallback((update: OptimisticUpdate<TData>) => {
    setPendingUpdates(prev => [...prev, update]);
  }, []);
  
  const updatePendingUpdate = useCallback((id: string, updates: Partial<OptimisticUpdate<TData>>) => {
    setPendingUpdates(prev => 
      prev.map(update => 
        update.id === id ? { ...update, ...updates } : update
      )
    );
  }, []);
  
  const removePendingUpdate = useCallback((id: string) => {
    setPendingUpdates(prev => prev.filter(update => update.id !== id));
  }, []);
  
  // Conflict detection helpers
  const detectConflicts = useCallback(async (
    variables: TVariables, 
    serverResponse: TData,
    updateId: string
  ) => {
    if (!configRef.current.enableConflictDetection) return;
    
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update) return;
    
    // Version conflict detection
    if (update.version && serverResponse && typeof serverResponse === 'object' && 'version' in serverResponse) {
      const serverVersion = (serverResponse as any).version;
      if (update.version !== serverVersion) {
        conflictDetector.detectVersionConflict(
          String((serverResponse as any).id || updateId),
          update.version,
          serverVersion,
          update.data,
          serverResponse
        );
      }
    }
    
    // Concurrent edit detection
    if (update.lastSyncTime && serverResponse && typeof serverResponse === 'object') {
      Object.keys(serverResponse).forEach(field => {
        if (update.data && typeof update.data === 'object' && field in update.data) {
          const localValue = (update.data as any)[field];
          const serverValue = (serverResponse as any)[field];
          
          conflictDetector.detectConcurrentEdit(
            String((serverResponse as any).id || updateId),
            field,
            localValue,
            serverValue,
            update.lastSyncTime!
          );
        }
      });
    }
    
    // Duplicate detection
    if (configRef.current.uniqueFields && configRef.current.resourceType) {
      // This would require additional context about existing records
      // Implementation depends on specific use case
    }
  }, [pendingUpdates]);
  
  // Rollback functionality
  const rollback = useCallback((updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || !configRef.current.enableRollback) return;
    
    try {
      if (update.originalData && configRef.current.onRollback) {
        configRef.current.onRollback(update.originalData, update.data);
      }
      
      updatePendingUpdate(updateId, { status: 'rolled_back' });
      
      addNotification({
        type: 'info',
        title: 'Update Rolled Back',
        message: 'The optimistic update has been rolled back to its previous state.',
      });
      
      // Remove after a delay to allow UI to show rollback state
      setTimeout(() => removePendingUpdate(updateId), 1000);
    } catch (error) {
      console.error('Failed to rollback update:', error);
      addNotification({
        type: 'error',
        title: 'Rollback Failed',
        message: 'Failed to rollback the update. Please refresh the page.',
      });
    }
  }, [pendingUpdates, updatePendingUpdate, removePendingUpdate, addNotification]);
  
  // Rollback all pending updates
  const rollbackAll = useCallback(() => {
    const rollbackableUpdates = pendingUpdates.filter(
      update => update.status === 'pending' || update.status === 'failed' || update.status === 'conflicted'
    );
    
    rollbackableUpdates.forEach(update => rollback(update.id));
  }, [pendingUpdates, rollback]);
  
  // Retry failed update
  const retry = useCallback(async (updateId: string) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || (update.status !== 'failed' && update.status !== 'conflicted')) return;
    
    if (update.retryCount >= update.maxRetries) {
      addNotification({
        type: 'error',
        title: 'Max Retries Reached',
        message: 'The update has failed too many times and cannot be retried.',
      });
      return;
    }
    
    try {
      updatePendingUpdate(updateId, { 
        status: 'pending', 
        retryCount: update.retryCount + 1 
      });
      
      const result = await configRef.current.mutationFn(update.data);
      
      // Check for conflicts
      await detectConflicts(update.data, result, updateId);
      
      const currentUpdate = pendingUpdates.find(u => u.id === updateId);
      if (currentUpdate?.status !== 'conflicted') {
        updatePendingUpdate(updateId, { status: 'confirmed' });
        
        if (configRef.current.onSuccess) {
          configRef.current.onSuccess(result, update.data);
        }
        
        addNotification({
          type: 'success',
          title: 'Update Successful',
          message: 'The retry was successful.',
        });
        
        // Remove confirmed update after delay
        setTimeout(() => removePendingUpdate(updateId), 2000);
      }
    } catch (error) {
      updatePendingUpdate(updateId, { status: 'failed' });
      
      addNotification({
        type: 'error',
        title: 'Retry Failed',
        message: `Retry attempt ${update.retryCount + 1} failed. ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }, [pendingUpdates, updatePendingUpdate, removePendingUpdate, addNotification, detectConflicts]);
  
  // Resolve conflict
  const resolveConflict = useCallback(async (updateId: string, resolution: ConflictResolution) => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || update.status !== 'conflicted' || !update.conflictId) return;
    
    const conflict = conflicts.get(update.conflictId);
    if (!conflict) return;
    
    try {
      // Apply resolution based on action
      switch (resolution.action) {
        case 'overwrite':
          // Use client data, ignore server changes
          updatePendingUpdate(updateId, { status: 'confirmed' });
          break;
          
        case 'merge':
          // Merge client and server data
          if (resolution.data) {
            updatePendingUpdate(updateId, { 
              data: resolution.data as TData,
              status: 'confirmed' 
            });
          }
          break;
          
        case 'reject':
          // Reject client changes, use server data
          if (conflict.conflictingData) {
            updatePendingUpdate(updateId, { 
              data: conflict.conflictingData as TData,
              status: 'confirmed' 
            });
          }
          break;
          
        case 'retry':
          // Retry the operation
          await retry(updateId);
          return;
          
        case 'manual':
          // Keep in conflicted state for manual resolution
          return;
      }
      
      // Mark conflict as resolved
      conflictDetector.resolveConflict(update.conflictId, resolution);
      setConflicts(prev => {
        const newConflicts = new Map(prev);
        newConflicts.delete(update.conflictId!);
        return newConflicts;
      });
      
      addNotification({
        type: 'success',
        title: 'Conflict Resolved',
        message: `Conflict resolved using ${resolution.action} strategy.`,
      });
      
      // Remove resolved update after delay
      setTimeout(() => removePendingUpdate(updateId), 2000);
      
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      addNotification({
        type: 'error',
        title: 'Conflict Resolution Failed',
        message: 'Failed to resolve the conflict. Please try again.',
      });
    }
  }, [pendingUpdates, conflicts, updatePendingUpdate, removePendingUpdate, addNotification, retry]);
  
  // Get conflict data for an update
  const getConflictData = useCallback((updateId: string): ConflictData | null => {
    const update = pendingUpdates.find(u => u.id === updateId);
    if (!update || !update.conflictId) return null;
    
    return conflicts.get(update.conflictId) || null;
  }, [pendingUpdates, conflicts]);
  
  // Main mutation function
  const mutate = useCallback(async (variables: TVariables): Promise<TData> => {
    const updateId = nanoid();
    const timestamp = Date.now();
    const maxRetries = configRef.current.maxRetries ?? 3;
    
    setIsLoading(true);
    setLoading({ isLoading: true, operation: 'optimistic-mutation' });
    
    let optimisticData: TData | undefined;
    let originalData: TData | undefined;
    
    try {
      // Apply optimistic update if provided
      if (configRef.current.onOptimisticUpdate) {
        optimisticData = configRef.current.onOptimisticUpdate(variables);
        
        // Store the optimistic update
        const update: OptimisticUpdate<TData> = {
          id: updateId,
          type: 'mutation',
          data: optimisticData,
          originalData,
          timestamp,
          status: 'pending',
          retryCount: 0,
          maxRetries,
          lastSyncTime: new Date().toISOString()
        };
        
        addPendingUpdate(update);
        
        // Show optimistic feedback
        addNotification({
          type: 'info',
          title: 'Update in Progress',
          message: 'Your changes are being saved...',
        });
      }
      
      // Perform the actual mutation
      const result = await configRef.current.mutationFn(variables);
      
      // Check for conflicts
      await detectConflicts(variables, result, updateId);
      
      // Check if update is still pending (not conflicted)
      const currentUpdate = pendingUpdates.find(u => u.id === updateId);
      if (!currentUpdate || currentUpdate.status !== 'conflicted') {
        // Update status to confirmed
        if (optimisticData) {
          updatePendingUpdate(updateId, { status: 'confirmed' });
        }
        
        // Call success callback
        if (configRef.current.onSuccess) {
          configRef.current.onSuccess(result, variables);
        }
        
        // Show success notification
        addNotification({
          type: 'success',
          title: 'Update Successful',
          message: 'Your changes have been saved successfully.',
        });
        
        // Remove confirmed update after delay
        if (optimisticData) {
          setTimeout(() => removePendingUpdate(updateId), 2000);
        }
      }
      
      return result;
    } catch (error) {
      // Handle mutation failure
      if (optimisticData) {
        updatePendingUpdate(updateId, { status: 'failed' });
      }
      
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      
      // Call error callback
      if (configRef.current.onError) {
        configRef.current.onError(error as Error, variables, originalData);
      }
      
      // Show error notification with retry option
      addNotification({
        type: 'error',
        title: 'Update Failed',
        message: `${errorMessage}. You can retry or rollback the changes.`,
      });
      
      // Handle conflict resolution
      if (configRef.current.conflictResolution === 'prompt-user') {
        // This would typically open a modal for user decision
        console.log('Conflict detected, user intervention required');
      } else if (configRef.current.conflictResolution === 'client-wins' && optimisticData) {
        // Keep optimistic update
        console.log('Conflict resolved: client wins');
      } else if (configRef.current.conflictResolution === 'server-wins') {
        // Rollback optimistic update
        if (optimisticData && configRef.current.enableRollback) {
          rollback(updateId);
        }
      }
      
      throw error;
    } finally {
      setIsLoading(false);
      setLoading({ isLoading: false });
    }
  }, [addPendingUpdate, updatePendingUpdate, removePendingUpdate, addNotification, setLoading, rollback, detectConflicts, pendingUpdates]);
  
  // Async version of mutate
  const mutateAsync = useCallback(async (variables: TVariables): Promise<TData> => {
    return mutate(variables);
  }, [mutate]);
  
  // Get conflicted updates
  const conflictedUpdates = pendingUpdates.filter(update => update.status === 'conflicted');
  
  return {
    mutate,
    mutateAsync,
    isLoading,
    pendingUpdates,
    conflictedUpdates,
    rollback,
    rollbackAll,
    retry,
    resolveConflict,
    getConflictData,
  };
}

// Utility hook for tracking optimistic updates across the app
export function useOptimisticUpdatesGlobal() {
  const [globalUpdates, setGlobalUpdates] = useState<OptimisticUpdate[]>([]);
  const [globalConflicts, setGlobalConflicts] = useState<ConflictData[]>([]);
  
  // Subscribe to conflict detector
  useEffect(() => {
    const unsubscribe = conflictDetector.onConflict((conflict) => {
      setGlobalConflicts(prev => [...prev, conflict]);
    });
    
    return unsubscribe;
  }, []);
  
  const addGlobalUpdate = useCallback((update: OptimisticUpdate) => {
    setGlobalUpdates(prev => [...prev, update]);
  }, []);
  
  const removeGlobalUpdate = useCallback((id: string) => {
    setGlobalUpdates(prev => prev.filter(update => update.id !== id));
  }, []);
  
  const getPendingUpdatesCount = useCallback(() => {
    return globalUpdates.filter(update => update.status === 'pending').length;
  }, [globalUpdates]);
  
  const getFailedUpdatesCount = useCallback(() => {
    return globalUpdates.filter(update => update.status === 'failed').length;
  }, [globalUpdates]);
  
  const getConflictedUpdatesCount = useCallback(() => {
    return globalUpdates.filter(update => update.status === 'conflicted').length;
  }, [globalUpdates]);
  
  const getConflictsCount = useCallback(() => {
    return globalConflicts.length;
  }, [globalConflicts]);
  
  const resolveAllConflicts = useCallback((resolution: ConflictResolution) => {
    globalConflicts.forEach(conflict => {
      conflictDetector.resolveConflict(conflict.id, resolution);
    });
    setGlobalConflicts([]);
  }, [globalConflicts]);
  
  return {
    globalUpdates,
    globalConflicts,
    addGlobalUpdate,
    removeGlobalUpdate,
    getPendingUpdatesCount,
    getFailedUpdatesCount,
    getConflictedUpdatesCount,
    getConflictsCount,
    resolveAllConflicts,
  };
}