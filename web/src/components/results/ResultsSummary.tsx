import { Badge } from '@/components/ui/badge';
import type { SearchResult } from '@/types';

interface Props { result: SearchResult; }

export function ResultsSummary({ result }: Props) {
  const { offers, constraints } = result;
  const cheapest = offers[0]?.price_usd ?? 0;
  const nonstopOffers = offers.filter(o => o.stops_out === 0 && o.stops_return === 0);
  const cheapestNonstop = nonstopOffers[0]?.price_usd;

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
      <div className="flex items-center gap-3">
        <span className="font-bold text-base">{offers.length} flights found</span>
        {constraints.origin && constraints.destination && (
          <Badge variant="outline">{constraints.origin} → {constraints.destination}</Badge>
        )}
      </div>
      <div className="flex items-center gap-3">
        {cheapestNonstop && cheapestNonstop > cheapest && (
          <Badge variant="secondary">Nonstop from ${cheapestNonstop.toFixed(0)}</Badge>
        )}
        <span className="text-sm text-muted-foreground font-medium">
          From <span className="font-bold text-primary text-lg">${cheapest.toFixed(0)}</span>
        </span>
      </div>
    </div>
  );
}
