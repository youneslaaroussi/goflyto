import { createContext, useContext, useState, type ReactNode } from 'react';
import type { SearchResult } from '../types';
import type { AppError } from '../errors';

export interface LoadingStep {
  label: string;
  done: boolean;
}

interface SearchState {
  result: SearchResult | null;
  loading: boolean;
  appError: AppError | null;
  steps: LoadingStep[];
  setResult: (r: SearchResult | null) => void;
  setLoading: (l: boolean) => void;
  setAppError: (e: AppError | null) => void;
  setSteps: (s: LoadingStep[]) => void;
  tickStep: (index: number) => void;
}

const SearchContext = createContext<SearchState | null>(null);

export function SearchProvider({ children }: { children: ReactNode }) {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [appError, setAppError] = useState<AppError | null>(null);
  const [steps, setSteps] = useState<LoadingStep[]>([]);

  function tickStep(index: number) {
    setSteps(prev => prev.map((s, i) => i === index ? { ...s, done: true } : s));
  }

  return (
    <SearchContext.Provider value={{
      result, loading, appError, steps,
      setResult, setLoading, setAppError, setSteps, tickStep,
    }}>
      {children}
    </SearchContext.Provider>
  );
}

export function useSearch() {
  const ctx = useContext(SearchContext);
  if (!ctx) throw new Error('useSearch must be used within SearchProvider');
  return ctx;
}
