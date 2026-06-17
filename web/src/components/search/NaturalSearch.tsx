import { useState, type KeyboardEvent } from 'react';
import { Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { searchNatural } from '@/api';
import { useSearch } from '@/context/SearchContext';
import { useNavigate } from 'react-router-dom';
import { runWithSteps } from '@/searchSteps';

const EXAMPLES = [
  'Montreal to Morocco late July, 2 weeks',
  'Cheapest YYZ to Marrakech, mid-July, 10–15 days, nonstop',
  'YUL to CMN or RAK, depart July 19, back before Aug 10',
];

export function NaturalSearch() {
  const ctx = useSearch();
  const navigate = useNavigate();
  const [message, setMessage] = useState('');

  async function submit() {
    if (!message.trim()) return;
    navigate('/searching');
    await runWithSteps(ctx, () => searchNatural(message.trim()));
    navigate(ctx.appError ? '/ai' : '/results');
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submit(); }
  }

  return (
    <div className="space-y-3">
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <textarea
          autoFocus
          rows={3}
          placeholder="e.g. I want to fly from Montreal to Morocco in late July for about 2 weeks..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKey}
          className="w-full resize-none px-4 pt-4 pb-2 text-base outline-none bg-transparent placeholder:text-muted-foreground/50 font-sans text-foreground"
        />
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">Enter to search · Shift+Enter for new line</span>
          <Button onClick={submit} disabled={!message.trim()} size="sm">
            <Sparkles className="size-3.5 mr-1.5" />
            Find flights
          </Button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLES.map(ex => (
          <button
            key={ex}
            type="button"
            onClick={() => setMessage(ex)}
            className="inline-flex"
          >
            <Badge
              variant="outline"
              className="cursor-pointer text-[11px] font-normal text-muted-foreground border-border hover:border-primary/50 hover:text-foreground transition-colors"
            >
              {ex}
            </Badge>
          </button>
        ))}
      </div>
    </div>
  );
}
