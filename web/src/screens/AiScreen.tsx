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
      <div className="bg-gradient-to-br from-[#1a0533] via-[#3b0764] to-[#5b21b6] pb-12">
        <div className="max-w-3xl mx-auto px-4 pt-10 pb-1">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="size-8 text-purple-300" />
            <h1 className="text-[clamp(26px,5vw,40px)] font-bold text-white tracking-tight">Ask AI</h1>
          </div>
          <p className="text-white/75 text-base mb-8 max-w-lg">
            Describe your trip in plain English. Gemini extracts your constraints
            and we sweep every route and date combo to find the best deal.
          </p>
          <NaturalSearch />
        </div>
      </div>
    </div>
  );
}
