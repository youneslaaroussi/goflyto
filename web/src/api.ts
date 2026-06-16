import type { SearchConstraints, SearchResult } from './types';

export async function searchStructured(constraints: SearchConstraints): Promise<SearchResult> {
  const res = await fetch('/search/structured', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(constraints),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}

export async function searchNatural(message: string): Promise<SearchResult> {
  const res = await fetch('/search/natural', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) throw new Error(`Search failed: ${res.statusText}`);
  return res.json();
}
