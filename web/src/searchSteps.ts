import type { SearchResult } from './types';
import type { AppError } from './errors';
import { UNKNOWN_ERROR } from './errors';

interface SearchCtx {
  setResult: (r: SearchResult | null) => void;
  setLoading: (l: boolean) => void;
  setAppError: (e: AppError | null) => void;
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
  fetchFn: () => Promise<SearchResult>,
): Promise<void> {
  ctx.setAppError(null);
  ctx.setResult(null);
  ctx.setLoading(true);
  ctx.setSteps(STEPS.map(label => ({ label, done: false })));

  let elapsed = 0;
  const timers: ReturnType<typeof setTimeout>[] = [];
  STEP_DURATIONS.slice(0, -1).forEach((dur, i) => {
    elapsed += dur;
    timers.push(setTimeout(() => ctx.tickStep(i), elapsed));
  });

  try {
    const result = await fetchFn();
    timers.forEach(clearTimeout);
    for (let i = 0; i < STEPS.length - 1; i++) ctx.tickStep(i);
    await delay(300);
    ctx.tickStep(STEPS.length - 1);
    await delay(400);
    ctx.setResult(result);
  } catch (err) {
    timers.forEach(clearTimeout);
    const appErr = isAppError(err) ? err : UNKNOWN_ERROR;
    ctx.setAppError(appErr);
  } finally {
    ctx.setLoading(false);
  }
}

function isAppError(e: unknown): e is AppError {
  return typeof e === 'object' && e !== null && 'code' in e && 'message' in e && 'retryable' in e;
}

function delay(ms: number) {
  return new Promise(res => setTimeout(res, ms));
}
