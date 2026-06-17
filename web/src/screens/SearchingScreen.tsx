import { Plane, CheckCircle2, Circle, Loader2 } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { useSearch } from '@/context/SearchContext';
import { cn } from '@/lib/utils';

export function SearchingScreen() {
  const { steps } = useSearch();
  const doneCount = steps.filter(s => s.done).length;
  const progress = steps.length > 0 ? (doneCount / steps.length) * 100 : 0;
  const currentStep = steps.find(s => !s.done);

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gradient-to-b from-[#f0f6ff] to-background">
      <div className="max-w-xs w-full px-4 text-center">
        {/* Pulsing plane */}
        <div className="relative mx-auto size-20 mb-6">
          <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
          <div className="relative size-20 rounded-full bg-accent flex items-center justify-center">
            <Plane className="size-9 text-primary" />
          </div>
        </div>

        <h2 className="font-bold text-lg mb-1">Searching flights</h2>
        <p className="text-sm text-muted-foreground mb-6">
          {currentStep ? currentStep.label : 'Wrapping up…'}
        </p>

        <Progress value={progress} className="h-1.5 mb-6" />

        {steps.length > 0 && (
          <div className="text-left inline-block min-w-[260px] space-y-3">
            {steps.map((step, i) => {
              const isActive = !step.done && steps.slice(0, i).every(s => s.done);
              return (
                <div
                  key={i}
                  className={cn('flex items-center gap-3 transition-opacity', !(step.done || isActive) && 'opacity-35')}
                >
                  {step.done ? (
                    <CheckCircle2 className="size-5 text-primary shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="size-5 text-primary shrink-0 animate-spin" />
                  ) : (
                    <Circle className="size-5 text-muted-foreground shrink-0" />
                  )}
                  <span className={cn('text-sm', step.done ? 'line-through text-muted-foreground' : '', isActive && 'font-semibold')}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        )}

        {steps.length === 0 && (
          <p className="text-xs text-muted-foreground">Connecting to flight data…</p>
        )}
      </div>
    </div>
  );
}
