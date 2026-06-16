import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { searchNatural } from '../api';
import type { SearchResult } from '../types';
import styles from './NaturalSearch.module.css';

interface Props {
  onResult: (r: SearchResult) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string) => void;
}

const EXAMPLES = [
  "I want to fly from Montreal to Morocco in late July for about 2 weeks",
  "Cheapest way from Toronto to Marrakech, mid-July, 10-15 days, nonstop preferred",
  "YUL to CMN or RAK, departing July 19, back before August 10",
];

export function NaturalSearch({ onResult, onLoading, onError }: Props) {
  const [message, setMessage] = useState('');

  async function submit() {
    if (!message.trim()) return;
    onLoading(true);
    onError('');
    try {
      const result = await searchNatural(message.trim());
      onResult(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      onLoading(false);
    }
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.card}>
        <textarea
          className={styles.textarea}
          placeholder="e.g. I want to fly from Montreal to Morocco in late July for about 2 weeks..."
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={handleKey}
          rows={3}
          autoFocus
        />
        <div className={styles.footer}>
          <span className={styles.hint}>Press Enter to search · Shift+Enter for new line</span>
          <button className={styles.btn} onClick={submit} disabled={!message.trim()}>
            ✨ Find flights
          </button>
        </div>
      </div>
      <div className={styles.examples}>
        {EXAMPLES.map((ex) => (
          <button key={ex} className={styles.example} onClick={() => setMessage(ex)}>
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
}
