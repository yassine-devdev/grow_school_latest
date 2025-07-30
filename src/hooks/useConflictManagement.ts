'use client';

import { useState, useEffect, useCallback } from 'react';
import { ConflictData, ConflictResolution, conflictDetector } from '@/lib/conflict-detection';

export interface ConflictManagementOptions {
  autoResolve?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export const useConflictManagement = (options: ConflictManagementOptions = {}) => {
  const {
    autoResolve = false,
    maxRetries = 3,
    retryDelay = 1000
  } = options;

  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [isResolving, setIsResolving] = useState(false);
  const [resolutionHistory, setResolutionHistory] = useState<Array<{
    conflictId: string;
    resolution: ConflictResolution;
    timestamp: string;
    success: boolean;
  }>>([]);

  // Load initial conflicts and subscribe to new ones
  useEffect(() => {
    setConflicts(conflictDetector.getConflicts());

    const unsubscribe = conflictDetector.onConflict((conflict) => {
      setConflicts(prev => {
        // Avoid duplicates
        if (prev.some(c => c.id === conflict.id)) {
          return prev;
        }
        return [...prev, conflict];
      });

      // Auto-resolve if enabled and conflict is auto-resolvable
      if (autoResolve && conflict.autoResolvable) {
        resolveConflict(conflict.id, {
          action: 'merge',
          reason: 'Auto-resolved based on conflict type'
        });
      }
    });

    return unsubscribe;
  }, [autoResolve]);

  // Resolve a specific conflict
  const resolveConflict = useCallback(async (
    conflictId: string,
    resolution: ConflictResolution
  ): Promise<boolean> => {
    setIsResolving(true);
    
    try {
      const success = conflictDetector.resolveConflict(conflictId, resolution);
      
      if (success) {
        setConflicts(prev => prev.filter(c => c.id !== conflictId));
        
        // Add to resolution history
        setResolutionHistory(prev => [...prev, {
          conflictId,
          resolution,
          timestamp: new Date().toISOString(),
          success: true
        }]);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
      
      // Add failed resolution to history
      setResolutionHistory(prev => [...prev, {
        conflictId,
        resolution,
        timestamp: new Date().toISOString(),
        success: false
      }]);
      
      return false;
    } finally {
      setIsResolving(false);
    }
  }, []);

  // Resolve multiple conflicts
  const resolveConflicts = useCallback(async (
    resolutions: Array<{ conflictId: string; resolution: ConflictResolution }>
  ): Promise<{ successful: string[]; failed: string[] }> => {
    setIsResolving(true);
    
    const successful: string[] = [];
    const failed: string[] = [];
    
    try {
      for (const { conflictId, resolution } of resolutions) {
        const success = await resolveConflict(conflictId, resolution);
        if (success) {
          successful.push(conflictId);
        } else {
          failed.push(conflictId);
        }
      }
    } finally {
      setIsResolving(false);
    }
    
    return { successful, failed };
  }, [resolveConflict]);

  // Auto-resolve all resolvable conflicts
  const autoResolveAll = useCallback(async (): Promise<number> => {
    const autoResolvable = conflicts.filter(c => c.autoResolvable);
    
    if (autoResolvable.length === 0) {
      return 0;
    }
    
    const resolutions = autoResolvable.map(conflict => ({
      conflictId: conflict.id,
      resolution: {
        action: 'merge' as const,
        reason: 'Auto-resolved all resolvable conflicts'
      }
    }));
    
    const result = await resolveConflicts(resolutions);
    return result.successful.length;
  }, [conflicts, resolveConflicts]);

  // Retry failed operations with exponential backoff
  const retryWithBackoff = useCallback(async (
    operation: () => Promise<any>,
    retries: number = maxRetries
  ): Promise<any> => {
    try {
      return await operation();
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, retryDelay * (maxRetries - retries + 1)));
        return retryWithBackoff(operation, retries - 1);
      }
      throw error;
    }
  }, [maxRetries, retryDelay]);

  // Get conflicts by type
  const getConflictsByType = useCallback((type: ConflictData['type']) => {
    return conflicts.filter(conflict => conflict.type === type);
  }, [conflicts]);

  // Get conflicts by severity
  const getConflictsBySeverity = useCallback((severity: ConflictData['severity']) => {
    return conflicts.filter(conflict => conflict.severity === severity);
  }, [conflicts]);

  // Get conflict statistics
  const getStats = useCallback(() => {
    return {
      total: conflicts.length,
      byType: conflicts.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: conflicts.reduce((acc, c) => {
        acc[c.severity] = (acc[c.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      autoResolvable: conflicts.filter(c => c.autoResolvable).length,
      resolutionHistory: resolutionHistory.length,
      successRate: resolutionHistory.length > 0 
        ? resolutionHistory.filter(r => r.success).length / resolutionHistory.length 
        : 0
    };
  }, [conflicts, resolutionHistory]);

  // Clear all conflicts (for testing/reset)
  const clearAllConflicts = useCallback(() => {
    conflictDetector.clearConflicts();
    setConflicts([]);
  }, []);

  // Check for specific conflict patterns
  const hasConflictPattern = useCallback((pattern: {
    type?: ConflictData['type'];
    severity?: ConflictData['severity'];
    resource?: string;
  }) => {
    return conflicts.some(conflict => {
      if (pattern.type && conflict.type !== pattern.type) return false;
      if (pattern.severity && conflict.severity !== pattern.severity) return false;
      if (pattern.resource && conflict.resource !== pattern.resource) return false;
      return true;
    });
  }, [conflicts]);

  // Get recommended actions for conflicts
  const getRecommendedActions = useCallback(() => {
    const recommendations = [];
    
    const criticalConflicts = getConflictsBySeverity('critical');
    if (criticalConflicts.length > 0) {
      recommendations.push({
        priority: 'critical',
        message: `${criticalConflicts.length} critical conflicts require immediate attention`,
        action: 'Review and resolve critical conflicts manually'
      });
    }
    
    const autoResolvable = conflicts.filter(c => c.autoResolvable);
    if (autoResolvable.length > 0) {
      recommendations.push({
        priority: 'medium',
        message: `${autoResolvable.length} conflicts can be auto-resolved`,
        action: 'Run auto-resolution for eligible conflicts'
      });
    }
    
    const versionConflicts = getConflictsByType('version');
    if (versionConflicts.length > 2) {
      recommendations.push({
        priority: 'high',
        message: 'Multiple version conflicts detected',
        action: 'Consider implementing optimistic locking'
      });
    }
    
    return recommendations;
  }, [conflicts, getConflictsBySeverity, getConflictsByType]);

  return {
    // State
    conflicts,
    isResolving,
    resolutionHistory,
    
    // Actions
    resolveConflict,
    resolveConflicts,
    autoResolveAll,
    retryWithBackoff,
    clearAllConflicts,
    
    // Queries
    getConflictsByType,
    getConflictsBySeverity,
    getStats,
    hasConflictPattern,
    getRecommendedActions,
    
    // Computed values
    hasConflicts: conflicts.length > 0,
    hasCriticalConflicts: conflicts.some(c => c.severity === 'critical'),
    autoResolvableCount: conflicts.filter(c => c.autoResolvable).length
  };
};

export default useConflictManagement;
