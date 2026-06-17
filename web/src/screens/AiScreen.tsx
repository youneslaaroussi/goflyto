import { Sparkles } from 'lucide-react';
import { NaturalSearch } from '@/components/search/NaturalSearch';
import { ErrorScreen } from '@/components/errors/ErrorScreen';
import { useSearch } from '@/context/SearchContext';

export function AiScreen() {
  const { appError, setAppError } = useSearch();

  if (appError) return (
    <ErrorScreen error={appError} onRetry={() => setAppError(null)} onBack={() => setAppError(null)} />
  );

  return (
    <div className="flex-1">
      <div className="border-b border-border pb-8">
        <div className="max-w-3xl mx-auto px-4 pt-8">
          <div className="flex items-center gap-2.5 mb-2">
            <Sparkles className="size-5 text-primary" />
            <h1 className="text-[clamp(22px,4vw,32px)] font-semibold tracking-tight">Ask AI</h1>
          </div>
          <p className="text-muted-foreground text-sm mb-7 max-w-lg">
            Describe your trip in plain English. Gemini extracts your constraints
            and we sweep every route and date combo to find the best deal.
          </p>
          <NaturalSearch />
        </div>
      </div>
    </div>
  );
}
