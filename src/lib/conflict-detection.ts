// Comprehensive Conflict Detection System

// Generic type for data that can be in conflict
export type ConflictableData = Record<string, unknown> | unknown[] | string | number | boolean | null;

export interface ConflictData {
  id: string;
  type: 'version' | 'concurrent_edit' | 'duplicate' | 'constraint' | 'permission';
  severity: 'low' | 'medium' | 'high' | 'critical';
  resource: string;
  resourceId: string;
  conflictingData: ConflictableData;
  currentData: ConflictableData;
  timestamp: string;
  userId?: string;
  description: string;
  suggestedResolution?: string;
  autoResolvable: boolean;
}

export interface ConflictResolution {
  action: 'merge' | 'overwrite' | 'reject' | 'manual' | 'retry';
  data?: ConflictableData;
  reason: string;
}

export class ConflictDetector {
  private conflicts: Map<string, ConflictData> = new Map();
  private listeners: ((conflict: ConflictData) => void)[] = [];

  // Version conflict detection
  detectVersionConflict(
    resourceId: string,
    currentVersion: number,
    serverVersion: number,
    currentData: ConflictableData,
    serverData: ConflictableData
  ): ConflictData | null {
    if (currentVersion !== serverVersion) {
      const conflict: ConflictData = {
        id: `version_${resourceId}_${Date.now()}`,
        type: 'version',
        severity: 'high',
        resource: 'document',
        resourceId,
        conflictingData: serverData,
        currentData,
        timestamp: new Date().toISOString(),
        description: `Version mismatch: local version ${currentVersion}, server version ${serverVersion}`,
        suggestedResolution: 'Review changes and merge manually',
        autoResolvable: false
      };

      this.addConflict(conflict);
      return conflict;
    }
    return null;
  }

  // Concurrent edit detection
  detectConcurrentEdit(
    resourceId: string,
    field: string,
    localValue: ConflictableData,
    serverValue: ConflictableData,
    lastSyncTime: string
  ): ConflictData | null {
    const timeDiff = Date.now() - new Date(lastSyncTime).getTime();
    
    // If changes happened within 30 seconds and values differ
    if (timeDiff < 30000 && localValue !== serverValue) {
      const conflict: ConflictData = {
        id: `concurrent_${resourceId}_${field}_${Date.now()}`,
        type: 'concurrent_edit',
        severity: 'medium',
        resource: field,
        resourceId,
        conflictingData: { [field]: serverValue },
        currentData: { [field]: localValue },
        timestamp: new Date().toISOString(),
        description: `Concurrent edit detected on field "${field}"`,
        suggestedResolution: 'Choose which version to keep',
        autoResolvable: false
      };

      this.addConflict(conflict);
      return conflict;
    }
    return null;
  }

  // Duplicate detection
  detectDuplicate(
    resource: string,
    newData: Record<string, unknown>,
    existingRecords: Record<string, unknown>[],
    uniqueFields: string[]
  ): ConflictData | null {
    const duplicates = existingRecords.filter(record => {
      return uniqueFields.some(field => 
        record[field] && newData[field] && 
        record[field].toString().toLowerCase() === newData[field].toString().toLowerCase()
      );
    });

    if (duplicates.length > 0) {
      const conflict: ConflictData = {
        id: `duplicate_${resource}_${Date.now()}`,
        type: 'duplicate',
        severity: 'medium',
        resource,
        resourceId: String(newData.id) || 'new',
        conflictingData: duplicates,
        currentData: newData,
        timestamp: new Date().toISOString(),
        description: `Duplicate ${resource} detected based on ${uniqueFields.join(', ')}`,
        suggestedResolution: 'Update existing record or modify unique fields',
        autoResolvable: false
      };

      this.addConflict(conflict);
      return conflict;
    }
    return null;
  }

  // Constraint violation detection
  detectConstraintViolation(
    resource: string,
    resourceId: string,
    data: Record<string, unknown>,
    constraints: Record<string, unknown>
  ): ConflictData | null {
    const violations: string[] = [];

    // Check capacity constraints
    if (typeof constraints.capacity === 'number' &&
        Array.isArray(data.enrollments) &&
        data.enrollments.length > constraints.capacity) {
      violations.push(`Enrollment count (${data.enrollments.length}) exceeds capacity (${constraints.capacity})`);
    }

    // Check date constraints
    if (typeof constraints.startDate === 'string' && typeof constraints.endDate === 'string') {
      const start = new Date(constraints.startDate);
      const end = new Date(constraints.endDate);
      if (start >= end) {
        violations.push('Start date must be before end date');
      }
    }

    // Check permission constraints
    if (constraints.requiredRole && data.userRole !== constraints.requiredRole) {
      violations.push(`User role "${data.userRole}" does not meet required role "${constraints.requiredRole}"`);
    }

    if (violations.length > 0) {
      const conflict: ConflictData = {
        id: `constraint_${resourceId}_${Date.now()}`,
        type: 'constraint',
        severity: 'high',
        resource,
        resourceId,
        conflictingData: constraints,
        currentData: data,
        timestamp: new Date().toISOString(),
        description: violations.join('; '),
        suggestedResolution: 'Fix constraint violations before proceeding',
        autoResolvable: false
      };

      this.addConflict(conflict);
      return conflict;
    }
    return null;
  }

  // Permission conflict detection
  detectPermissionConflict(
    resource: string,
    resourceId: string,
    action: string,
    userPermissions: string[],
    requiredPermissions: string[]
  ): ConflictData | null {
    const missingPermissions = requiredPermissions.filter(
      perm => !userPermissions.includes(perm)
    );

    if (missingPermissions.length > 0) {
      const conflict: ConflictData = {
        id: `permission_${resourceId}_${Date.now()}`,
        type: 'permission',
        severity: 'critical',
        resource,
        resourceId,
        conflictingData: { requiredPermissions },
        currentData: { userPermissions },
        timestamp: new Date().toISOString(),
        description: `Missing permissions for ${action}: ${missingPermissions.join(', ')}`,
        suggestedResolution: 'Contact administrator for required permissions',
        autoResolvable: false
      };

      this.addConflict(conflict);
      return conflict;
    }
    return null;
  }

  // Add conflict to tracking
  private addConflict(conflict: ConflictData): void {
    this.conflicts.set(conflict.id, conflict);
    this.notifyListeners(conflict);
  }

  // Get all conflicts
  getConflicts(): ConflictData[] {
    return Array.from(this.conflicts.values());
  }

  // Get conflicts by type
  getConflictsByType(type: ConflictData['type']): ConflictData[] {
    return this.getConflicts().filter(conflict => conflict.type === type);
  }

  // Get conflicts by severity
  getConflictsBySeverity(severity: ConflictData['severity']): ConflictData[] {
    return this.getConflicts().filter(conflict => conflict.severity === severity);
  }

  // Resolve conflict
  resolveConflict(conflictId: string, resolution: ConflictResolution): boolean {
    const conflict = this.conflicts.get(conflictId);
    if (!conflict) return false;

    // Log resolution (only in non-test environments)
    if (process.env.NODE_ENV !== 'test') {
      console.log(`Resolving conflict ${conflictId} with action: ${resolution.action}`);
    }
    
    // Remove from active conflicts
    this.conflicts.delete(conflictId);
    
    return true;
  }

  // Auto-resolve conflicts where possible
  autoResolveConflicts(): ConflictData[] {
    const autoResolvable = this.getConflicts().filter(c => c.autoResolvable);
    
    autoResolvable.forEach(conflict => {
      this.resolveConflict(conflict.id, {
        action: 'merge',
        reason: 'Auto-resolved based on conflict type'
      });
    });

    return autoResolvable;
  }

  // Subscribe to conflict notifications
  onConflict(listener: (conflict: ConflictData) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  // Notify listeners
  private notifyListeners(conflict: ConflictData): void {
    this.listeners.forEach(listener => {
      try {
        listener(conflict);
      } catch (error) {
        console.error('Error in conflict listener:', error);
      }
    });
  }

  // Clear all conflicts
  clearConflicts(): void {
    this.conflicts.clear();
  }

  // Get conflict statistics
  getConflictStats(): {
    total: number;
    byType: Record<string, number>;
    bySeverity: Record<string, number>;
  } {
    const conflicts = this.getConflicts();
    
    return {
      total: conflicts.length,
      byType: conflicts.reduce((acc, c) => {
        acc[c.type] = (acc[c.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      bySeverity: conflicts.reduce((acc, c) => {
        acc[c.severity] = (acc[c.severity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }
}

// Global conflict detector instance
export const conflictDetector = new ConflictDetector();
