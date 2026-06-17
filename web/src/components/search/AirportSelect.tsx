import { useState } from 'react';
import { Check, ChevronsUpDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

export const AIRPORTS = [
  { code: 'YUL', city: 'Montreal' },
  { code: 'YYZ', city: 'Toronto' },
  { code: 'YVR', city: 'Vancouver' },
  { code: 'YYC', city: 'Calgary' },
  { code: 'YEG', city: 'Edmonton' },
  { code: 'YOW', city: 'Ottawa' },
  { code: 'JFK', city: 'New York (JFK)' },
  { code: 'EWR', city: 'New York (EWR)' },
  { code: 'LAX', city: 'Los Angeles' },
  { code: 'ORD', city: 'Chicago' },
  { code: 'MIA', city: 'Miami' },
  { code: 'LHR', city: 'London (LHR)' },
  { code: 'LGW', city: 'London (LGW)' },
  { code: 'CDG', city: 'Paris' },
  { code: 'AMS', city: 'Amsterdam' },
  { code: 'MAD', city: 'Madrid' },
  { code: 'BCN', city: 'Barcelona' },
  { code: 'FCO', city: 'Rome' },
  { code: 'MXP', city: 'Milan' },
  { code: 'FRA', city: 'Frankfurt' },
  { code: 'DXB', city: 'Dubai' },
  { code: 'IST', city: 'Istanbul' },
  { code: 'BKK', city: 'Bangkok' },
  { code: 'NRT', city: 'Tokyo' },
  { code: 'SYD', city: 'Sydney' },
  { code: 'CMN', city: 'Casablanca' },
  { code: 'RAK', city: 'Marrakech' },
  { code: 'TNG', city: 'Tangier' },
  { code: 'FEZ', city: 'Fez' },
  { code: 'AGA', city: 'Agadir' },
  { code: 'GRU', city: 'São Paulo' },
  { code: 'MEX', city: 'Mexico City' },
  { code: 'BOG', city: 'Bogotá' },
];

interface SingleProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiple?: false;
}

interface MultiProps {
  label: string;
  value: string[];
  onChange: (v: string[]) => void;
  multiple: true;
}

type Props = SingleProps | MultiProps;

function AirportDropdown({
  label, open, onToggle, children, trigger
}: {
  label: string; open: boolean; onToggle: () => void; children: React.ReactNode; trigger: React.ReactNode;
}) {
  return (
    <div className="relative">
      <Label className="text-xs text-muted-foreground mb-1 block">{label}</Label>
      <Button
        type="button"
        variant="outline"
        role="combobox"
        onClick={onToggle}
        className="w-full justify-between font-normal h-9 text-sm"
      >
        {trigger}
        <ChevronsUpDown className="size-3.5 shrink-0 opacity-50 ml-1" />
      </Button>
      {open && (
        <div className="absolute z-50 mt-1 w-full min-w-[220px] rounded-lg border border-border bg-white shadow-lg overflow-hidden">
          <div className="max-h-60 overflow-y-auto py-1">
            {children}
          </div>
        </div>
      )}
    </div>
  );
}

function AirportOption({ code, city, selected, onClick }: {
  code: string; city: string; selected: boolean; onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors text-left',
        selected && 'bg-accent'
      )}
    >
      <Check className={cn('size-3.5 shrink-0 text-primary', !selected && 'invisible')} />
      <span className="font-semibold w-10 shrink-0">{code}</span>
      <span className="text-muted-foreground text-xs">{city}</span>
    </button>
  );
}

export function AirportSelect(props: Props) {
  const [open, setOpen] = useState(false);

  if (props.multiple) {
    const { label, value, onChange } = props;
    const toggle = (code: string) =>
      onChange(value.includes(code) ? value.filter(c => c !== code) : [...value, code]);

    return (
      <AirportDropdown
        label={label}
        open={open}
        onToggle={() => setOpen(o => !o)}
        trigger={
          value.length === 0 ? (
            <span className="text-muted-foreground">Select airports…</span>
          ) : (
            <div className="flex flex-wrap gap-1 flex-1 min-w-0">
              {value.map(code => (
                <Badge key={code} variant="secondary" className="h-5 text-[11px] px-1.5 gap-1">
                  {code}
                  <X
                    className="size-2.5 cursor-pointer hover:text-destructive"
                    onClick={e => { e.stopPropagation(); toggle(code); }}
                  />
                </Badge>
              ))}
            </div>
          )
        }
      >
        {AIRPORTS.map(a => (
          <AirportOption
            key={a.code} code={a.code} city={a.city}
            selected={value.includes(a.code)}
            onClick={() => toggle(a.code)}
          />
        ))}
      </AirportDropdown>
    );
  }

  const { label, value, onChange } = props;
  const selected = AIRPORTS.find(a => a.code === value);

  return (
    <AirportDropdown
      label={label}
      open={open}
      onToggle={() => setOpen(o => !o)}
      trigger={
        selected
          ? <span><span className="font-semibold mr-1">{selected.code}</span><span className="text-muted-foreground text-xs">{selected.city}</span></span>
          : <span className="text-muted-foreground">Select…</span>
      }
    >
      {AIRPORTS.map(a => (
        <AirportOption
          key={a.code} code={a.code} city={a.city}
          selected={a.code === value}
          onClick={() => { onChange(a.code); setOpen(false); }}
        />
      ))}
    </AirportDropdown>
  );
}
