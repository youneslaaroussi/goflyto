import { PlaneTakeoff, WifiOff, SearchX, HelpCircle, CloudOff, BrainCircuit, TimerOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { AppError, AppErrorCode } from '@/errors';
import type { LucideIcon } from 'lucide-react';

interface Props {
  error: AppError;
  onRetry?: () => void;
  onBack?: () => void;
}

const CONFIG: Record<AppErrorCode, { Icon: LucideIcon; color: string }> = {
  NO_FLIGHTS_FOUND:    { Icon: PlaneTakeoff,  color: 'text-primary' },
  NETWORK_OFFLINE:     { Icon: WifiOff,        color: 'text-muted-foreground' },
  SEARCH_TIMEOUT:      { Icon: TimerOff,       color: 'text-primary' },
  AI_PARSE_FAILED:     { Icon: BrainCircuit,   color: 'text-primary' },
  INVALID_ROUTE:       { Icon: SearchX,        color: 'text-muted-foreground' },
  SERVICE_UNAVAILABLE: { Icon: CloudOff,       color: 'text-destructive' },
  UNKNOWN:             { Icon: HelpCircle,     color: 'text-muted-foreground' },
};

export function ErrorScreen({ error, onRetry, onBack }: Props) {
  const { Icon, color } = CONFIG[error.code] ?? CONFIG.UNKNOWN;

  return (
    <div className="flex-1 flex items-center justify-center min-h-[calc(100vh-4rem)] bg-background">
      <div className="max-w-sm w-full px-4 text-center">
        <div className="size-16 rounded-2xl bg-card border border-border flex items-center justify-center mx-auto mb-6">
          <Icon className={`size-7 ${color}`} />
        </div>
        <h2 className="font-semibold text-lg mb-2">{error.message}</h2>
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
