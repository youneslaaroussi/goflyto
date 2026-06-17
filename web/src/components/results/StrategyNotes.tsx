import { Lightbulb, BadgeInfo } from 'lucide-react';

interface Props {
  strategyNotes: string[];
  visaNotes: string[];
}

export function StrategyNotes({ strategyNotes, visaNotes }: Props) {
  if (strategyNotes.length === 0 && visaNotes.length === 0) return null;

  return (
    <div className="space-y-2 mb-5">
      {strategyNotes.map((n, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-card border border-border rounded-xl">
          <Lightbulb className="size-4 text-primary mt-0.5 shrink-0" />
          <p className="text-[13px] text-foreground">{n}</p>
        </div>
      ))}
      {visaNotes.map((n, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-card border border-border rounded-xl">
          <BadgeInfo className="size-4 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[13px] text-muted-foreground">{n}</p>
        </div>
      ))}
    </div>
  );
}
