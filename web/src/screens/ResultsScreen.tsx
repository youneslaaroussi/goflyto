import { useState } from 'react';
import { ArrowLeft, Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '@/context/SearchContext';
import { ResultsSummary } from '@/components/results/ResultsSummary';
import { ResultsFilters } from '@/components/results/ResultsFilters';
import { FlightCard } from '@/components/results/FlightCard';
import { StrategyNotes } from '@/components/results/StrategyNotes';
import { ErrorScreen } from '@/components/errors/ErrorScreen';

export function ResultsScreen() {
  const { result, loading, appError } = useSearch();
  const navigate = useNavigate();
  const [filter, setFilter] = useState<'all' | 'nonstop'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'stops'>('price');

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-3">
      <Skeleton className="h-10 rounded-xl" />
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-[104px] rounded-2xl" />
      ))}
    </div>
  );

  if (appError) return (
    <ErrorScreen error={appError} onRetry={() => navigate('/')} onBack={() => navigate('/')} />
  );

  if (!result) return (
    <div className="max-w-3xl mx-auto px-4 py-10 text-center">
      <Ticket className="size-12 text-muted-foreground/30 mx-auto mb-4" />
      <p className="font-semibold text-base mb-1">No results yet</p>
      <p className="text-sm text-muted-foreground mb-6">Run a search first to see flights here.</p>
      <Button onClick={() => navigate('/')}>Go to search</Button>
    </div>
  );

  const filtered = result.offers.filter(o =>
    filter === 'all' || (o.stops_out === 0 && o.stops_return === 0)
  );
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'price'
      ? a.price_usd - b.price_usd
      : (a.stops_out + a.stops_return) - (b.stops_out + b.stops_return)
  );
  const cheapest = sorted[0]?.price_usd ?? 0;

  return (
    <div className="flex-1">
      {/* Sticky top bar */}
      <div className="sticky top-16 z-40 bg-background border-b border-border px-4 py-2.5">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="text-muted-foreground gap-1.5 -ml-2">
            <ArrowLeft className="size-4" /> New search
          </Button>
          <ResultsSummary result={result} />
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-5">
        <StrategyNotes strategyNotes={result.strategy_notes} visaNotes={result.visa_notes} />
        <ResultsFilters filter={filter} sortBy={sortBy} onFilterChange={setFilter} onSortChange={setSortBy} />

        {sorted.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground text-sm">No flights match this filter.</div>
        ) : (
          <div className="space-y-3">
            {sorted.map((offer, i) => (
              <FlightCard key={offer.offer_id} offer={offer} rank={i} cheapest={cheapest} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
