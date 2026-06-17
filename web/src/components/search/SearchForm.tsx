import { useState, type FormEvent } from 'react';
import { Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { AirportSelect } from './AirportSelect';
import { searchStructured } from '@/api';
import { useSearch } from '@/context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { runWithSteps } from '@/searchSteps';

export function SearchForm() {
  const ctx = useSearch();
  const navigate = useNavigate();

  const [origin, setOrigin] = useState('YUL');
  const [destinations, setDestinations] = useState<string[]>(['CMN']);
  const [depFrom, setDepFrom] = useState('2026-07-19');
  const [depTo, setDepTo] = useState('2026-07-26');
  const [minDays, setMinDays] = useState('10');
  const [maxDays, setMaxDays] = useState('21');
  const [passengers, setPassengers] = useState('1');
  const [nonstop, setNonstop] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!destinations.length) return;
    navigate('/searching');
    await runWithSteps(ctx, () => searchStructured({
      origin,
      destination: destinations[0],
      destination_airports: destinations,
      earliest_departure: depFrom,
      latest_departure: depTo,
      latest_return: depTo,
      trip_length_min_days: parseInt(minDays),
      trip_length_max_days: parseInt(maxDays),
      passengers: parseInt(passengers),
      nonstop_preferred: nonstop,
    }));
    navigate(ctx.appError ? '/' : '/results');
  }

  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Origin / Destination */}
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_2fr] gap-3">
          <AirportSelect label="From" value={origin} onChange={setOrigin} />
          <AirportSelect label="To (one or more)" value={destinations} onChange={setDestinations} multiple />
        </div>

        {destinations.length > 1 && (
          <p className="text-xs text-muted-foreground -mt-2">
            We'll sweep all selected airports and open-jaw combinations.
          </p>
        )}

        <Separator />

        {/* Date / trip length row */}
        <div className="grid grid-cols-2 sm:grid-cols-[1fr_1fr_auto_auto_auto] gap-3 items-end">
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Depart from</Label>
            <Input type="date" value={depFrom} onChange={e => setDepFrom(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Depart by</Label>
            <Input type="date" value={depTo} onChange={e => setDepTo(e.target.value)} className="h-9 text-sm" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Min days</Label>
            <Input type="number" min={3} max={60} value={minDays} onChange={e => setMinDays(e.target.value)} className="h-9 text-sm w-20" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Max days</Label>
            <Input type="number" min={3} max={60} value={maxDays} onChange={e => setMaxDays(e.target.value)} className="h-9 text-sm w-20" />
          </div>
          <div className="space-y-1">
            <Label className="text-xs text-muted-foreground">Pax</Label>
            <Input type="number" min={1} max={9} value={passengers} onChange={e => setPassengers(e.target.value)} className="h-9 text-sm w-16" />
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Switch id="nonstop" checked={nonstop} onCheckedChange={setNonstop} />
            <Label htmlFor="nonstop" className="text-sm font-medium cursor-pointer">Nonstop only</Label>
          </div>
          <Button type="submit" size="lg" disabled={!destinations.length} className="px-8">
            <Search className="size-4 mr-2" />
            Search flights
          </Button>
        </div>
      </form>
    </div>
  );
}
