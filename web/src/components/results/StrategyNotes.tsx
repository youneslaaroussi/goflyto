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
        <div key={i} className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <Lightbulb className="size-4 text-amber-600 mt-0.5 shrink-0" />
          <p className="text-[13px] text-amber-900">{n}</p>
        </div>
      ))}
      {visaNotes.map((n, i) => (
        <div key={i} className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-xl">
          <BadgeInfo className="size-4 text-sky-600 mt-0.5 shrink-0" />
          <p className="text-[13px] text-sky-900">{n}</p>
        </div>
      ))}
    </div>
  );
}
