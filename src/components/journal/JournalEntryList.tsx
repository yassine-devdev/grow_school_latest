'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/input';
import JournalEntry from './JournalEntry';
import JournalEntryForm from './JournalEntryForm';
import { JournalEntryListSkeleton } from './JournalEntrySkeleton';
import JournalErrorState, { JournalEmptyState, JournalLoadingError } from './JournalErrorState';
import { useJournal, JournalEntry as JournalEntryType } from '../../hooks/useJournal';
import { MoodLevel } from '../../types/base';

interface JournalEntryListProps {
  userId: string;
  compact?: boolean;
  showAnalytics?: boolean;
  enableSearch?: boolean;
  enableFilters?: boolean;
  pageSize?: number;
}

type SortOption = 'newest' | 'oldest' | 'title' | 'mood';
type FilterOption = 'all' | 'private' | 'public' | MoodLevel;

export default function JournalEntryList({ 
  userId,
  compact = false,
  showAnalytics = false,
  enableSearch = true,
  enableFilters = true,
  pageSize = 10
}: JournalEntryListProps) {
  const { 
    entries, 
    isLoading, 
    error, 
    refreshEntries, 
    deleteEntry,
    searchEntries 
  } = useJournal({ userId });
  
  // Local state
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState<JournalEntryType | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<JournalEntryType[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterBy, setFilterBy] = useState<FilterOption>('all');
  const [currentPage, setCurrentPage] = useState(1);
  
  // Handle search
  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    setIsSearching(true);
    try {
      const results = await searchEntries(query);
      setSearchResults(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };
  
  // Filter and sort entries
  const filteredAndSortedEntries = useMemo(() => {
    let entriesToProcess = searchQuery ? searchResults : entries;
    
    // Apply filters
    if (filterBy !== 'all') {
      entriesToProcess = entriesToProcess.filter(entry => {
        switch (filterBy) {
          case 'private':
            return entry.isPrivate;
          case 'public':
            return !entry.isPrivate;
          default:
            return entry.mood === filterBy;
        }
      });
    }
    
    // Apply sorting
    const sorted = [...entriesToProcess].sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.created).getTime() - new Date(a.created).getTime();
        case 'oldest':
          return new Date(a.created).getTime() - new Date(b.created).getTime();
        case 'title':
          return a.title.localeCompare(b.title);
        case 'mood':
          const moodOrder = { 'very-low': 1, 'low': 2, 'medium': 3, 'high': 4, 'very-high': 5 };
          const aMood = a.mood ? moodOrder[a.mood] : 0;
          const bMood = b.mood ? moodOrder[b.mood] : 0;
          return bMood - aMood;
        default:
          return 0;
      }
    });
    
    return sorted;
  }, [entries, searchResults, searchQuery, filterBy, sortBy]);
  
  // Pagination
  const totalPages = Math.ceil(filteredAndSortedEntries.length / pageSize);
  const paginatedEntries = filteredAndSortedEntries.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );
  
  // Handle entry actions
  const handleEdit = (entry: JournalEntryType) => {
    setEditingEntry(entry);
    setShowForm(true);
  };
  
  const handleDelete = async (id: string) => {
    await deleteEntry(id);
    refreshEntries();
  };
  
  const handleFormSave = (entry: JournalEntryType) => {
    setShowForm(false);
    setEditingEntry(null);
    refreshEntries();
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingEntry(null);
  };
  
  // Loading state
  if (isLoading && entries.length === 0) {
    return <JournalEntryListSkeleton count={pageSize} compact={compact} />;
  }
  
  // Error state
  if (error && entries.length === 0) {
    return (
      <JournalErrorState
        error={error}
        onRetry={refreshEntries}
        title="Failed to load journal entries"
        description="We couldn't load your journal entries. Please check your connection and try again."
      />
    );
  }
  
  // Show form
  if (showForm) {
    return (
      <JournalEntryForm
        entry={editingEntry || undefined}
        onSave={handleFormSave}
        onCancel={handleFormCancel}
        userId={userId}
        autoSave={true}
      />
    );
  }
  
  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Journal Entries</h2>
          <p className="text-gray-400">
            {filteredAndSortedEntries.length} {filteredAndSortedEntries.length === 1 ? 'entry' : 'entries'}
            {searchQuery && ` matching "${searchQuery}"`}
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="lg">
          ✏️ New Entry
        </Button>
      </div>
      
      {/* Search and Filters */}
      {(enableSearch || enableFilters) && (
        <div className="flex flex-col sm:flex-row gap-4 p-4 bg-white/5 rounded-lg border border-white/10">
          {enableSearch && (
            <div className="flex-1">
              <Input
                type="text"
                placeholder="Search entries..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full bg-white/5 border-white/20 text-white placeholder-gray-400"
              />
              {isSearching && (
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Searching...
                </div>
              )}
            </div>
          )}
          
          {enableFilters && (
            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="title">Title A-Z</option>
                <option value="mood">By Mood</option>
              </select>
              
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as FilterOption)}
                className="px-3 py-2 bg-white/5 border border-white/20 rounded-md text-white text-sm"
              >
                <option value="all">All Entries</option>
                <option value="private">Private Only</option>
                <option value="public">Public Only</option>
                <option value="very-high">😄 Very High</option>
                <option value="high">😊 High</option>
                <option value="medium">😐 Medium</option>
                <option value="low">😔 Low</option>
                <option value="very-low">😢 Very Low</option>
              </select>
            </div>
          )}
        </div>
      )}
      
      {/* Entries List */}
      {filteredAndSortedEntries.length === 0 ? (
        searchQuery ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
            <p className="text-gray-400 mb-4">
              No entries match your search for "{searchQuery}"
            </p>
            <Button 
              variant="outline" 
              onClick={() => handleSearch('')}
            >
              Clear Search
            </Button>
          </div>
        ) : (
          <JournalEmptyState
            title="No journal entries yet"
            description="Start your journaling journey by creating your first entry. Reflect on your thoughts, experiences, and growth."
            actionLabel="Create First Entry"
            onAction={() => setShowForm(true)}
          />
        )
      ) : (
        <>
          <div className="space-y-4">
            {paginatedEntries.map((entry) => (
              <JournalEntry
                key={entry.id}
                entry={entry}
                onEdit={handleEdit}
                onDelete={handleDelete}
                compact={compact}
                showAnalytics={showAnalytics}
              />
            ))}
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = i + 1;
                  const isActive = page === currentPage;
                  
                  return (
                    <Button
                      key={page}
                      variant={isActive ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={isActive ? "bg-blue-600" : ""}
                    >
                      {page}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="text-gray-400 px-2">...</span>
                    <Button
                      variant={currentPage === totalPages ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setCurrentPage(totalPages)}
                      className={currentPage === totalPages ? "bg-blue-600" : ""}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
      
      {/* Loading overlay for additional operations */}
      {isLoading && entries.length > 0 && (
        <JournalLoadingError />
      )}
    </div>
  );
}