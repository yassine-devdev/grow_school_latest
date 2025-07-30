'use client';

import React, { useState } from 'react';
import { AlertTriangle, CheckCircle, RefreshCw, Bug } from 'lucide-react';
import { conflictDetector } from '@/lib/conflict-detection';
import { ComponentErrorBoundary } from '@/components/error-boundaries/ErrorBoundary';
import ConflictResolver from '@/components/conflict-resolution/ConflictResolver';
import useConflictManagement from '@/hooks/useConflictManagement';

// Component that intentionally throws errors for testing
const ErrorProneComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  if (shouldError) {
    throw new Error('This is a test error to demonstrate error boundaries!');
  }
  
  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
      <div className="flex items-center gap-2">
        <CheckCircle className="w-5 h-5 text-green-600" />
        <span className="text-green-800 font-medium">Component working normally</span>
      </div>
    </div>
  );
};

// Component that simulates async errors
const AsyncErrorComponent: React.FC<{ shouldError: boolean }> = ({ shouldError }) => {
  const [loading, setLoading] = useState(false);
  
  const simulateAsyncOperation = async () => {
    setLoading(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (shouldError) {
        throw new Error('Simulated network error');
      }
      
      alert('Async operation completed successfully!');
    } catch (error) {
      // This will be caught by AsyncErrorBoundary
      Promise.reject(error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <button
        onClick={simulateAsyncOperation}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2 transition-colors disabled:opacity-50"
      >
        {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Bug className="w-4 h-4" />}
        {loading ? 'Processing...' : 'Simulate Async Error'}
      </button>
    </div>
  );
};

export const ConflictDemo: React.FC = () => {
  const [showError, setShowError] = useState(false);
  const [showAsyncError, setShowAsyncError] = useState(false);
  const { conflicts, resolveConflict, hasConflicts, getStats } = useConflictManagement();

  const createTestConflicts = () => {
    // Create some test conflicts
    conflictDetector.detectVersionConflict(
      'demo-doc-1',
      1,
      3,
      { title: 'Local Version' },
      { title: 'Server Version' }
    );

    conflictDetector.detectDuplicate(
      'users',
      { name: 'John Doe', email: 'john@test.com' },
      [{ name: 'john doe', email: 'existing@test.com' }],
      ['name']
    );

    conflictDetector.detectConstraintViolation(
      'class',
      'demo-class',
      { enrollments: new Array(25).fill({}), capacity: 20 },
      { capacity: 20 }
    );
  };

  const clearAllConflicts = () => {
    conflictDetector.clearConflicts();
  };

  const stats = getStats();

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          🛡️ Conflict Detection & Error Boundary Demo
        </h1>
        <p className="text-gray-600">
          Test the robust error handling and conflict detection systems
        </p>
      </div>

      {/* Conflict Management Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🔍 Conflict Detection System
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
            <div className="text-sm text-gray-600">Total Conflicts</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.bySeverity.critical || 0}</div>
            <div className="text-sm text-gray-600">Critical</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.autoResolvableCount}</div>
            <div className="text-sm text-gray-600">Auto-Resolvable</div>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={createTestConflicts}
            className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
          >
            Create Test Conflicts
          </button>
          <button
            onClick={clearAllConflicts}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
          >
            Clear All Conflicts
          </button>
        </div>

        {hasConflicts && (
          <div className="border-t pt-4">
            <ConflictResolver autoResolve={false} showStats={true} />
          </div>
        )}
      </div>

      {/* Error Boundary Testing Section */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          🚨 Error Boundary Testing
        </h2>
        
        <div className="space-y-4">
          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Component Error Boundary</h3>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setShowError(!showError)}
                className={`px-4 py-2 rounded transition-colors ${
                  showError 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {showError ? 'Fix Component' : 'Break Component'}
              </button>
            </div>
            
            <ComponentErrorBoundary>
              <ErrorProneComponent shouldError={showError} />
            </ComponentErrorBoundary>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Async Error Handling</h3>
            <div className="flex gap-3 mb-3">
              <button
                onClick={() => setShowAsyncError(!showAsyncError)}
                className={`px-4 py-2 rounded transition-colors ${
                  showAsyncError 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                {showAsyncError ? 'Disable Async Errors' : 'Enable Async Errors'}
              </button>
            </div>
            
            <AsyncErrorComponent shouldError={showAsyncError} />
          </div>
        </div>
      </div>

      {/* Status Summary */}
      <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">
          ✅ System Status
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Conflict Detection: Active</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Error Boundaries: Protected</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Async Error Handling: Enabled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-gray-700">Auto-Resolution: Available</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConflictDemo;
