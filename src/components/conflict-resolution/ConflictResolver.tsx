'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, CheckCircle, XCircle, RefreshCw, Eye, GitMerge } from 'lucide-react';
import { ConflictData, ConflictResolution, conflictDetector } from '@/lib/conflict-detection';

interface ConflictResolverProps {
  onResolve?: (conflictId: string, resolution: ConflictResolution) => void;
  autoResolve?: boolean;
  showStats?: boolean;
}

export const ConflictResolver: React.FC<ConflictResolverProps> = ({
  onResolve,
  autoResolve = false,
  showStats = true
}) => {
  const [conflicts, setConflicts] = useState<ConflictData[]>([]);
  const [selectedConflict, setSelectedConflict] = useState<ConflictData | null>(null);
  const [isResolving, setIsResolving] = useState(false);

  useEffect(() => {
    // Load initial conflicts
    setConflicts(conflictDetector.getConflicts());

    // Subscribe to new conflicts
    const unsubscribe = conflictDetector.onConflict((conflict) => {
      setConflicts(prev => [...prev, conflict]);
    });

    // Auto-resolve if enabled
    if (autoResolve) {
      const autoResolved = conflictDetector.autoResolveConflicts();
      if (autoResolved.length > 0) {
        setConflicts(prev => prev.filter(c => !autoResolved.some(ar => ar.id === c.id)));
      }
    }

    return unsubscribe;
  }, [autoResolve]);

  const handleResolve = async (conflict: ConflictData, resolution: ConflictResolution) => {
    setIsResolving(true);
    
    try {
      const success = conflictDetector.resolveConflict(conflict.id, resolution);
      
      if (success) {
        setConflicts(prev => prev.filter(c => c.id !== conflict.id));
        setSelectedConflict(null);
        
        if (onResolve) {
          onResolve(conflict.id, resolution);
        }
      }
    } catch (error) {
      console.error('Failed to resolve conflict:', error);
    } finally {
      setIsResolving(false);
    }
  };

  const getSeverityColor = (severity: ConflictData['severity']) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-50 border-red-200';
      case 'high': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'medium': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'low': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getTypeIcon = (type: ConflictData['type']) => {
    switch (type) {
      case 'version': return <RefreshCw className="w-4 h-4" />;
      case 'concurrent_edit': return <GitMerge className="w-4 h-4" />;
      case 'duplicate': return <Eye className="w-4 h-4" />;
      case 'constraint': return <XCircle className="w-4 h-4" />;
      case 'permission': return <AlertTriangle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  if (conflicts.length === 0) {
    return showStats ? (
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <span className="text-sm font-medium text-green-800">No conflicts detected</span>
        </div>
      </div>
    ) : null;
  }

  return (
    <div className="space-y-4">
      {showStats && (
        <ConflictStats conflicts={conflicts} />
      )}

      <div className="space-y-3">
        {conflicts.map((conflict) => (
          <ConflictCard
            key={conflict.id}
            conflict={conflict}
            isSelected={selectedConflict?.id === conflict.id}
            isResolving={isResolving}
            onSelect={() => setSelectedConflict(conflict)}
            onResolve={(resolution) => handleResolve(conflict, resolution)}
            getSeverityColor={getSeverityColor}
            getTypeIcon={getTypeIcon}
          />
        ))}
      </div>

      {selectedConflict && (
        <ConflictDetails
          conflict={selectedConflict}
          onClose={() => setSelectedConflict(null)}
          onResolve={(resolution) => handleResolve(selectedConflict, resolution)}
          isResolving={isResolving}
        />
      )}
    </div>
  );
};

const ConflictStats: React.FC<{ conflicts: ConflictData[] }> = ({ conflicts }) => {
  const stats = conflictDetector.getConflictStats();

  // Calculate additional stats from the conflicts prop
  const conflictsByType = conflicts.reduce((acc, conflict) => {
    acc[conflict.type] = (acc[conflict.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-semibold text-gray-800 mb-3">
        Conflict Summary ({conflicts.length} total)
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-600">Total</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</div>
          <div className="text-xs text-gray-600">Critical</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.bySeverity.high || 0}</div>
          <div className="text-xs text-gray-600">High</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-600">{stats.bySeverity.medium || 0}</div>
          <div className="text-xs text-gray-600">Medium</div>
        </div>
      </div>

      {/* Show conflict types breakdown */}
      {Object.keys(conflictsByType).length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <h4 className="text-xs font-medium text-gray-700 mb-2">By Type:</h4>
          <div className="flex flex-wrap gap-2">
            {Object.entries(conflictsByType).map(([type, count]) => (
              <span key={type} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-800">
                {type}: {count}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

interface ConflictCardProps {
  conflict: ConflictData;
  isSelected: boolean;
  isResolving: boolean;
  onSelect: () => void;
  onResolve: (resolution: ConflictResolution) => void;
  getSeverityColor: (severity: ConflictData['severity']) => string;
  getTypeIcon: (type: ConflictData['type']) => React.ReactNode;
}

const ConflictCard: React.FC<ConflictCardProps> = ({
  conflict,
  isSelected,
  isResolving,
  onSelect,
  onResolve,
  getSeverityColor,
  getTypeIcon
}) => {
  const quickResolve = (action: ConflictResolution['action']) => {
    onResolve({
      action,
      reason: `Quick resolution: ${action}`
    });
  };

  return (
    <div className={`border rounded-lg p-4 cursor-pointer transition-all ${
      isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
    } ${getSeverityColor(conflict.severity)}`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1" onClick={onSelect}>
          {getTypeIcon(conflict.type)}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-semibold">{conflict.type.replace('_', ' ')}</h4>
              <span className={`text-xs px-2 py-1 rounded-full ${getSeverityColor(conflict.severity)}`}>
                {conflict.severity}
              </span>
            </div>
            <p className="text-sm text-gray-700 mb-2">{conflict.description}</p>
            <div className="text-xs text-gray-500">
              Resource: {conflict.resource} • {new Date(conflict.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>

        {!conflict.autoResolvable && (
          <div className="flex gap-2 ml-4">
            <button
              onClick={() => quickResolve('retry')}
              disabled={isResolving}
              className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              Retry
            </button>
            <button
              onClick={() => quickResolve('reject')}
              disabled={isResolving}
              className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded transition-colors disabled:opacity-50"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

interface ConflictDetailsProps {
  conflict: ConflictData;
  onClose: () => void;
  onResolve: (resolution: ConflictResolution) => void;
  isResolving: boolean;
}

const ConflictDetails: React.FC<ConflictDetailsProps> = ({
  conflict,
  onClose,
  onResolve,
  isResolving
}) => {
  const [selectedAction, setSelectedAction] = useState<ConflictResolution['action']>('manual');
  const [reason, setReason] = useState('');

  const handleResolve = () => {
    onResolve({
      action: selectedAction,
      reason: reason || `Resolved with ${selectedAction} action`
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Conflict Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Description</h3>
              <p className="text-sm text-gray-600">{conflict.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Current Data</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(conflict.currentData, null, 2)}
                </pre>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-gray-700 mb-2">Conflicting Data</h3>
                <pre className="text-xs bg-gray-100 p-2 rounded overflow-auto">
                  {JSON.stringify(conflict.conflictingData, null, 2)}
                </pre>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Resolution Action</h3>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value as ConflictResolution['action'])}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="manual">Manual Review</option>
                <option value="merge">Merge Changes</option>
                <option value="overwrite">Use Current Data</option>
                <option value="reject">Use Server Data</option>
                <option value="retry">Retry Operation</option>
              </select>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-2">Reason</h3>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Explain the resolution..."
                className="w-full p-2 border border-gray-300 rounded text-sm h-20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors disabled:opacity-50"
              >
                {isResolving ? 'Resolving...' : 'Resolve Conflict'}
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictResolver;
