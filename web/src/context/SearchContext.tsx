import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SearchResult } from '../types';

interface SearchState {
  result: SearchResult | null;
  loading: boolean;
  error: string | null;
  setResult: (r: SearchResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  return (
    <SearchContext.Provider value={{ result, loading, error, setResult, setLoading, setError }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
