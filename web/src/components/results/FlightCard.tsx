import { useState } from 'react';
import { PlaneTakeoff, PlaneLanding, ChevronDown, ChevronUp } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FlightLeg } from './FlightLeg';
import type { FlightOffer } from '@/types';
import { formatDate, formatTime } from '@/utils';
import { cn } from '@/lib/utils';

interface Props {
  offer: FlightOffer;
  rank: number;
  cheapest: number;
}

export function FlightCard({ offer, rank, cheapest }: Props) {
  const [open, setOpen] = useState(false);
  const isNonstop = offer.stops_out === 0 && offer.stops_return === 0;
  const isBest = rank === 0;
  const diff = offer.price_usd - cheapest;

  return (
    <div className={cn(
      'relative rounded-2xl border bg-white transition-all duration-150',
      isBest ? 'border-primary shadow-[0_4px_16px_rgba(7,112,227,0.15)]' : 'border-border hover:border-primary hover:shadow-[0_4px_16px_rgba(7,112,227,0.10)] hover:-translate-y-px',
    )}>
      {isBest && (
        <span className="absolute top-0 left-5 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-0.5 rounded-b-md">
          Best price
        </span>
      )}

      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={cn('w-full text-left px-4 pb-4', isBest ? 'pt-6' : 'pt-4')}
      >
        <div className="flex items-center gap-4">
          {/* Legs */}
          <div className="flex-1 flex gap-4 items-center flex-wrap">
            <FlightLeg Icon={PlaneTakeoff} label="Out" route={offer.outbound_route} departure={offer.outbound_departure} stops={offer.stops_out} />
            <Separator orientation="vertical" className="hidden sm:block h-10 mx-1" />
            <FlightLeg Icon={PlaneLanding} label="Return" route={offer.return_route} departure={offer.return_departure} stops={offer.stops_return} />
          </div>

          {/* Price */}
          <div className="text-right shrink-0 min-w-[80px]">
            <div className="text-[28px] font-bold leading-none tracking-tight">${offer.price_usd.toFixed(0)}</div>
            {diff > 0 && <div className="text-[11px] text-muted-foreground">+${diff.toFixed(0)}</div>}
            <div className="text-xs text-muted-foreground mt-1 truncate max-w-[90px]">{offer.airlines[0]}</div>
            {isNonstop && <Badge variant="secondary" className="mt-1 h-5 text-[11px]">Nonstop</Badge>}
          </div>

          {open
            ? <ChevronUp className="size-4 text-muted-foreground shrink-0" />
            : <ChevronDown className="size-4 text-muted-foreground shrink-0" />
          }
        </div>
      </button>

      {open && (
        <>
          <Separator />
          <div className="px-4 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: 'Outbound', val: offer.outbound_route, sub: offer.outbound_departure ? `${formatDate(offer.outbound_departure)} at ${formatTime(offer.outbound_departure)}` : '' },
              { label: 'Return',   val: offer.return_route,   sub: offer.return_departure   ? `${formatDate(offer.return_departure)} at ${formatTime(offer.return_departure)}` : '' },
              { label: 'Airlines', val: offer.airlines.join(', '), sub: '' },
              { label: 'Offer ID', val: offer.offer_id, sub: '', mono: true },
            ].map(({ label, val, sub, mono }) => (
              <div key={label}>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{label}</p>
                <p className={cn('text-[13px] font-medium', mono && 'font-mono break-all text-muted-foreground')}>{val}</p>
                {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
