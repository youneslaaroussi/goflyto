import { useState } from 'react';
import { Globe, Sparkles } from 'lucide-react';
import { SearchForm } from '@/components/search/SearchForm';
import { NaturalSearch } from '@/components/search/NaturalSearch';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useSearch } from '@/context/SearchContext';
import { cn } from '@/lib/utils';

export function SearchScreen() {
  const { appError, setAppError } = useSearch();
  const [mode, setMode] = useState<'structured' | 'natural'>('structured');

  if (appError) return (
    <ErrorScreen error={appError} onRetry={() => setAppError(null)} onBack={() => setAppError(null)} />
  );

  return (
    <div className="flex-1">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#0558b8] via-[#0770e3] to-[#1a8fef] pb-12">
        <div className="max-w-3xl mx-auto px-4 pt-10">
          {/* Mode toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex bg-white/15 rounded-xl p-1 gap-1">
              {(['structured', 'natural'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium transition-colors',
                    mode === m
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  )}
                >
                  {m === 'natural' && <Sparkles className="size-3.5" />}
                  {m === 'structured' ? 'Search' : 'Ask AI'}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-[clamp(26px,5vw,40px)] font-bold text-white tracking-tight mb-3 leading-tight">
            {mode === 'natural' ? 'Just tell us where you want to go' : 'The cheapest way to get there'}
          </h1>
          <p className="text-white/80 text-base mb-8 max-w-lg">
            {mode === 'natural'
              ? "Describe your trip in plain English — we'll find the optimal route, dates and strategy."
              : "We sweep every date combo and open-jaw route so you don't have to."}
          </p>

          {mode === 'natural' ? <NaturalSearch /> : <SearchForm />}
        </div>
      </div>

      {/* Empty state */}
      <div className="max-w-3xl mx-auto px-4 py-10">
        <div className="flex flex-col items-center text-center py-12">
          <Globe className="size-12 text-primary/30 mb-4" />
          <p className="font-semibold text-[16px] mb-1">Ready to find your flight</p>
          <p className="text-sm text-muted-foreground">Enter your trip details above. Results will appear in the Results screen.</p>
        </div>
      </div>
    </div>
  );
}
