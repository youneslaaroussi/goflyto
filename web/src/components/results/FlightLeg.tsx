import { formatDate } from '@/utils';
import type { LucideIcon } from 'lucide-react';

interface Props {
  Icon: LucideIcon;
  label: string;
  route: string;
  departure: string;
  stops: number;
}

export function FlightLeg({ Icon, label, route, departure, stops }: Props) {
  const parts = route.split(' → ');
  const origin = parts[0]?.split('-')[0];
  const dest = parts[parts.length - 1]?.split('-')[1];

  return (
    <div className="flex-1 min-w-[160px]">
      <div className="flex items-center gap-1 mb-1">
        <Icon className="size-3 text-muted-foreground" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[22px] font-bold tracking-tight">{origin}</span>

        <div className="flex-1 px-1 text-center">
          <div className="relative h-px bg-border mx-1">
            <span className="absolute left-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-muted-foreground" />
            <span className="absolute right-0 top-1/2 -translate-y-1/2 size-1.5 rounded-full bg-muted-foreground" />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 font-medium">
            {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </p>
        </div>

        <span className="text-[22px] font-bold tracking-tight">{dest}</span>
      </div>

      {departure && (
        <p className="text-xs text-muted-foreground mt-0.5">{formatDate(departure)}</p>
      )}
    </div>
  );
}
