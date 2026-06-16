import type { SearchConstraints, SearchResult } from './types';
import type { AppError } from './errors';
import { NETWORK_ERROR, UNKNOWN_ERROR } from './errors';

async function post<T>(path: string, body: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    // fetch() itself threw — no network
    throw NETWORK_ERROR;
  }

  if (res.ok) return res.json() as Promise<T>;

  // Server returned a structured AppError — use it directly
  try {
    const err: AppError = await res.json();
    if (err.code && err.message) throw err;
  } catch (inner) {
    if ((inner as AppError).code) throw inner; // rethrow parsed error
  }

  // Non-JSON or unexpected shape — fall back to generic
  throw UNKNOWN_ERROR;
}

export function searchStructured(constraints: SearchConstraints): Promise<SearchResult> {
  return post('/search/structured', constraints);
}

export function searchNatural(message: string): Promise<SearchResult> {
  return post('/search/natural', { message });
}
