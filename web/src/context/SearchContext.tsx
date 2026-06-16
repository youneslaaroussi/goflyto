import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SearchResult } from '../types';

export interface LoadingStep {
  label: string;
  done: boolean;
}

interface SearchState {
  result: SearchResult | null;
  loading: boolean;
  error: string | null;
  steps: LoadingStep[];
  setResult: (r: SearchResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  setSteps: (s: LoadingStep[]) => void;
  tickStep: (index: number) => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<LoadingStep[]>([]);

  function tickStep(index: number) {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, done: true } : s));
  }

  return (
    <SearchContext.Provider value={{ result, loading, error, steps, setResult, setLoading, setError, setSteps, tickStep }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
