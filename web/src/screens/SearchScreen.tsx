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
      {/* Header */}
      <div className="border-b border-border pb-8">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          {/* Mode toggle */}
          <div className="flex justify-end mb-6">
            <div className="flex bg-muted rounded-lg p-0.5 gap-0.5">
              {(['structured', 'natural'] as const).map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    'flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-[13px] font-medium transition-colors',
                    mode === m
                      ? 'bg-accent text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m === 'natural' && <Sparkles className="size-3.5" />}
                  {m === 'structured' ? 'Search' : 'Ask AI'}
                </button>
              ))}
            </div>
          </div>

          <h1 className="text-[clamp(22px,4vw,32px)] font-semibold tracking-tight mb-2 leading-tight">
            {mode === 'natural' ? 'Just tell us where you want to go' : 'The cheapest way to get there'}
          </h1>
          <p className="text-muted-foreground text-sm mb-7 max-w-lg">
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
          <Globe className="size-10 text-muted-foreground/20 mb-4" />
          <p className="font-medium text-[15px] mb-1">Ready to find your flight</p>
          <p className="text-sm text-muted-foreground">Enter your trip details above. Results will appear in the Results screen.</p>
        </div>
      </div>
    </div>
  );
}
