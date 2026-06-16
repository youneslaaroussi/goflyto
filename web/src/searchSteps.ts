import type { SearchResult } from './types';

interface SearchCtx {
  setResult: (r: SearchResult | null) => void;
  setLoading: (l: boolean) => void;
  setError: (e: string | null) => void;
  setSteps: (s: { label: string; done: boolean }[]) => void;
  tickStep: (i: number) => void;
}

const STEPS = [
  'Parsing your request',
  'Sweeping departure dates',
  'Checking open-jaw routes',
  'Ranking offers by price',
  'Finalizing results',
];

const STEP_DURATIONS = [800, 3000, 3000, 1200, 600];

export async function runWithSteps(
  ctx: SearchCtx,
  fetch: () => Promise<SearchResult>,
): Promise<void> {
  ctx.setError(null);
  ctx.setResult(null);
  ctx.setLoading(true);
  ctx.setSteps(STEPS.map(label => ({ label, done: false })));

  // Tick step 0 immediately (parse), rest on timers
  let elapsed = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  STEP_DURATIONS.slice(0, -1).forEach((dur, i) => {
    elapsed += dur;
    timers.push(setTimeout(() => ctx.tickStep(i), elapsed));
  });

  try {
    const result = await fetch();
    timers.forEach(clearTimeout);
    // Tick all remaining undone steps fast
    for (let i = 0; i < STEPS.length - 1; i++) ctx.tickStep(i);
    await delay(300);
    ctx.tickStep(STEPS.length - 1);
    await delay(400);
    ctx.setResult(result);
  } catch (err) {
    timers.forEach(clearTimeout);
    ctx.setError(err instanceof Error ? err.message : 'Search failed');
  } finally {
    ctx.setLoading(false);
  }
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
