import { useState, type FormEvent } from 'react';
import { searchStructured } from '../api';
import type { SearchResult } from '../types';
import styles from './SearchBar.module.css';

interface Props {
  onResult: (r: SearchResult) => void;
  onLoading: (l: boolean) => void;
  onError: (e: string) => void;
}

const AIRPORTS = [
  { code: 'YUL', city: 'Montreal' },
  { code: 'YYZ', city: 'Toronto' },
  { code: 'YVR', city: 'Vancouver' },
  { code: 'YYC', city: 'Calgary' },
  { code: 'CMN', city: 'Casablanca' },
  { code: 'RAK', city: 'Marrakech' },
  { code: 'TNG', city: 'Tangier' },
  { code: 'FEZ', city: 'Fez' },
  { code: 'LHR', city: 'London' },
  { code: 'CDG', city: 'Paris' },
  { code: 'MAD', city: 'Madrid' },
  { code: 'JFK', city: 'New York' },
];

export function SearchBar({ onResult, onLoading, onError }: Props) {
  const [origin, setOrigin] = useState('YUL');
  const [destination, setDestination] = useState('CMN');
  const [depFrom, setDepFrom] = useState('2026-07-19');
  const [depTo, setDepTo] = useState('2026-07-26');
  const [minDays, setMinDays] = useState('10');
  const [maxDays, setMaxDays] = useState('21');
  const [passengers, setPassengers] = useState('1');
  const [nonstop, setNonstop] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onLoading(true);
    onError('');
    try {
      const result = await searchStructured({
        origin,
        destination,
        earliest_departure: depFrom,
        latest_return: depTo,
        trip_length_min_days: parseInt(minDays),
        trip_length_max_days: parseInt(maxDays),
        passengers: parseInt(passengers),
        nonstop_preferred: nonstop,
      });
      onResult(result);
    } catch (err) {
      onError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      onLoading(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <div className={styles.card}>
        {/* Row 1: Origin / Destination / Swap */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>From</label>
            <select className={styles.select} value={origin} onChange={e => setOrigin(e.target.value)}>
              {AIRPORTS.map(a => (
                <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            className={styles.swap}
            onClick={() => { setOrigin(destination); setDestination(origin); }}
            title="Swap"
          >
            ⇄
          </button>

          <div className={styles.field}>
            <label className={styles.label}>To</label>
            <select className={styles.select} value={destination} onChange={e => setDestination(e.target.value)}>
              {AIRPORTS.map(a => (
                <option key={a.code} value={a.code}>{a.code} — {a.city}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.divider} />

        {/* Row 2: Dates */}
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Depart from</label>
            <input className={styles.input} type="date" value={depFrom} onChange={e => setDepFrom(e.target.value)} />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Return by</label>
            <input className={styles.input} type="date" value={depTo} onChange={e => setDepTo(e.target.value)} />
          </div>
          <div className={styles.field} style={{ maxWidth: 100 }}>
            <label className={styles.label}>Min days</label>
            <input className={styles.input} type="number" min="3" max="60" value={minDays} onChange={e => setMinDays(e.target.value)} />
          </div>
          <div className={styles.field} style={{ maxWidth: 100 }}>
            <label className={styles.label}>Max days</label>
            <input className={styles.input} type="number" min="3" max="60" value={maxDays} onChange={e => setMaxDays(e.target.value)} />
          </div>
          <div className={styles.field} style={{ maxWidth: 100 }}>
            <label className={styles.label}>Passengers</label>
            <input className={styles.input} type="number" min="1" max="9" value={passengers} onChange={e => setPassengers(e.target.value)} />
          </div>
        </div>

        <div className={styles.divider} />

        {/* Row 3: Options + Search */}
        <div className={styles.row} style={{ alignItems: 'center' }}>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={nonstop} onChange={e => setNonstop(e.target.checked)} className={styles.checkbox} />
            Nonstop only
          </label>
          <div style={{ flex: 1 }} />
          <button className={styles.searchBtn} type="submit">
            Search flights
          </button>
        </div>
      </div>
    </form>
  );
}
