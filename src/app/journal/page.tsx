'use client';

import React, { useState } from 'react';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Target
} from 'lucide-react';
import JournalEntryList from '../../components/journal/JournalEntryList';
import GrowthAnalytics from '../../components/journal/GrowthAnalytics';
import SelfReflectionAnalytics from '../../components/journal/SelfReflectionAnalytics';

type ViewMode = 'entries' | 'analytics' | 'reflection' | 'goals';

export default function JournalPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('entries');

  // Mock user ID - in real app this would come from auth context
  const userId = 'user-1';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <BookOpen className="w-8 h-8 text-blue-400" />
              <h1 className="text-3xl font-bold text-white">
                Personal Growth Journal
              </h1>
            </div>
          </div>
          <p className="text-gray-300 mt-2">
            Track your thoughts, reflect on your experiences, and monitor your personal growth journey.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 border-b border-white/20">
            <button
              onClick={() => setViewMode('entries')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                viewMode === 'entries'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Journal Entries</span>
            </button>
            <button
              onClick={() => setViewMode('analytics')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                viewMode === 'analytics'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Growth Analytics</span>
            </button>
            <button
              onClick={() => setViewMode('reflection')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                viewMode === 'reflection'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Self-Reflection</span>
            </button>
            <button
              onClick={() => setViewMode('goals')}
              className={`flex items-center space-x-2 pb-4 border-b-2 transition-colors ${
                viewMode === 'goals'
                  ? 'border-blue-400 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Goals</span>
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="min-h-[600px]">
          {viewMode === 'entries' && (
            <JournalEntryList
              userId={userId}
              showAnalytics={true}
              enableSearch={true}
              enableFilters={true}
              pageSize={10}
            />
          )}

          {viewMode === 'analytics' && (
            <GrowthAnalytics
              userId={userId}
              analytics={null}
              onRefresh={() => {}}
            />
          )}

          {viewMode === 'reflection' && (
            <SelfReflectionAnalytics
              userId={userId}
              analytics={null}
              onRefresh={() => {}}
            />
          )}

          {viewMode === 'goals' && (
            <div className="text-center py-12">
              <div className="bg-white/10 backdrop-blur-md rounded-lg border border-white/20 p-12 max-w-md mx-auto">
                <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-medium text-white mb-2">
                  Journal Goals
                </h3>
                <p className="text-gray-300 mb-6">
                  Goal management feature coming soon. Set and track your personal development objectives.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}