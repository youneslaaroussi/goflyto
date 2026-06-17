import { PlaneTakeoff, WifiOff, SearchX, HelpCircle, CloudOff, BrainCircuit, TimerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppError, AppErrorCode } from '@/errors';
import type { LucideIcon } from 'lucide-react';

interface Props {
  error: AppError;
  onRetry?: () => void;
  onBack?: () => void;
}

const CONFIG: Record<AppErrorCode, { Icon: LucideIcon; color: string; bg: string }> = {
  NO_FLIGHTS_FOUND:    { Icon: PlaneTakeoff,  color: 'text-primary',     bg: 'bg-accent' },
  NETWORK_OFFLINE:     { Icon: WifiOff,        color: 'text-amber-600',   bg: 'bg-amber-50' },
  SEARCH_TIMEOUT:      { Icon: TimerOff,       color: 'text-violet-600',  bg: 'bg-violet-50' },
  AI_PARSE_FAILED:     { Icon: BrainCircuit,   color: 'text-primary',     bg: 'bg-accent' },
  INVALID_ROUTE:       { Icon: SearchX,        color: 'text-amber-600',   bg: 'bg-amber-50' },
  SERVICE_UNAVAILABLE: { Icon: CloudOff,       color: 'text-destructive', bg: 'bg-red-50' },
  UNKNOWN:             { Icon: HelpCircle,     color: 'text-muted-foreground', bg: 'bg-muted' },
};

export function ErrorScreen({ error, onRetry, onBack }: Props) {
  const { Icon, color, bg } = CONFIG[error.code] ?? CONFIG.UNKNOWN;

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-sm w-full px-4 text-center">
        <div className={`size-20 rounded-full ${bg} flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`size-9 ${color}`} />
        </div>
        <h2 className="font-bold text-lg mb-2">{error.message}</h2>
        <p className="text-sm text-muted-foreground mb-8 leading-relaxed">{error.hint}</p>
        <div className="flex justify-center gap-3 flex-wrap">
          {error.retryable && onRetry && (
            <Button onClick={onRetry}>Try again</Button>
          )}
          {onBack && (
            <Button variant="outline" onClick={onBack}>Edit search</Button>
          )}
        </div>
      </div>
    </div>
  );
}
