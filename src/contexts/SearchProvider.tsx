import React, { createContext, useContext, useState, ReactNode } from 'react';

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: string;
  url?: string;
  metadata?: Record<string, any>;
}

export interface SearchContextType {
  query: string;
  results: SearchResult[];
  isSearching: boolean;
  isOpen: boolean;
  setQuery: (query: string) => void;
  setResults: (results: SearchResult[]) => void;
  setIsSearching: (isSearching: boolean) => void;
  openSearch: () => void;
  closeSearch: () => void;
  clearSearch: () => void;
  search: (query: string) => Promise<void>;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

export interface SearchProviderProps {
  children: ReactNode;
}

export function SearchProvider({ children }: SearchProviderProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const openSearch = () => setIsOpen(true);
  const closeSearch = () => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
  };

  const search = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      if (response.ok) {
        const data = await response.json();
        setResults(data.results || []);
      } else {
        setResults([]);
      }
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const value: SearchContextType = {
    query,
    results,
    isSearching,
    isOpen,
    setQuery,
    setResults,
    setIsSearching,
    openSearch,
    closeSearch,
    clearSearch,
    search,
  };

  return (
    <SearchContext.Provider value={value}>
      {children}
    </SearchContext.Provider>
  );
}

export { SearchContext };

export function useSearch() {
  const context = useContext(SearchContext);
  if (context === undefined) {
    throw new Error('useSearch must be used within a SearchProvider');
  }
  return context;
}