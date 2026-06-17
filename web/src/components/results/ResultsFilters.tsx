import { cn } from '@/lib/utils';

interface Props {
  filter: 'all' | 'nonstop';
  sortBy: 'price' | 'stops';
  onFilterChange: (v: 'all' | 'nonstop') => void;
  onSortChange: (v: 'price' | 'stops') => void;
}

function ToggleGroup<T extends string>({ value, options, onChange }: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex rounded-lg border border-border overflow-hidden">
      {options.map(opt => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={cn(
            'px-3 py-1.5 text-[13px] font-medium transition-colors',
            value === opt.value
              ? 'bg-primary text-primary-foreground'
              : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-muted',
            'not-first:border-l border-border',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

export function ResultsFilters({ filter, sortBy, onFilterChange, onSortChange }: Props) {
  return (
    <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
      <ToggleGroup
        value={filter}
        options={[{ value: 'all', label: 'All stops' }, { value: 'nonstop', label: 'Nonstop only' }]}
        onChange={onFilterChange}
      />
      <div className="flex items-center gap-2">
        <span className="text-sm text-muted-foreground">Sort:</span>
        <ToggleGroup
          value={sortBy}
          options={[{ value: 'price', label: 'Price' }, { value: 'stops', label: 'Stops' }]}
          onChange={onSortChange}
        />
      </div>
    </div>
  );
}
