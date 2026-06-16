import { useState } from 'react';
import { SearchBar } from './components/SearchBar';
import { Results } from './components/Results';
import { NaturalSearch } from './components/NaturalSearch';
import type { SearchResult } from './types';
import styles from './App.module.css';

export default function App() {
  const [result, setResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'structured' | 'natural'>('structured');

  const handleResult = (r: SearchResult) => { setResult(r); setError(null); };
  const handleError = (e: string) => { setError(e); setResult(null); };

  return (
    <div className={styles.app}>
      <header className={styles.hero}>
        <div className={styles.heroInner}>
          <div className={styles.logoRow}>
            <span className={styles.logo}>✈ GoFlyTo</span>
            <div className={styles.modeTabs}>
              <button
                className={`${styles.modeTab} ${mode === 'structured' ? styles.modeTabActive : ''}`}
                onClick={() => setMode('structured')}
              >
                Search
              </button>
              <button
                className={`${styles.modeTab} ${mode === 'natural' ? styles.modeTabActive : ''}`}
                onClick={() => setMode('natural')}
              >
                ✨ Ask AI
              </button>
            </div>
          </div>

          <h1 className={styles.tagline}>
            {mode === 'natural'
              ? 'Just tell us where you want to go'
              : 'The cheapest way to get there'}
          </h1>
          <p className={styles.sub}>
            {mode === 'natural'
              ? "Describe your trip in plain English — we'll find the optimal route, dates and strategy."
              : "We sweep every date combo and open-jaw route so you don't have to."}
          </p>

          {mode === 'natural' ? (
            <NaturalSearch onResult={handleResult} onLoading={setLoading} onError={handleError} />
          ) : (
            <SearchBar onResult={handleResult} onLoading={setLoading} onError={handleError} />
          )}
        </div>
      </header>

      <main className={styles.main}>
        {error && (
          <div className={styles.errorBanner}>
            <span>⚠</span> {error}
          </div>
        )}
        {loading && <LoadingSkeleton />}
        {!loading && result && <Results result={result} />}
        {!loading && !result && !error && <EmptyState />}
      </main>

      <footer className={styles.footer}>
        Powered by Duffel · Prices in USD · {new Date().getFullYear()}
      </footer>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div style={{ padding: '32px 24px', maxWidth: 900, margin: '0 auto' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{
          height: 104, borderRadius: 12, marginBottom: 12,
          background: 'linear-gradient(90deg,#e5e7eb 25%,#f3f4f6 50%,#e5e7eb 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.4s infinite'
        }} />
      ))}
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>
    </div>
  );
}

function EmptyState() {
  return (
    <div style={{ textAlign: 'center', padding: '80px 24px', color: 'var(--gray-400)' }}>
      <div style={{ fontSize: 60, marginBottom: 16 }}>🌍</div>
      <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--gray-600)', marginBottom: 8 }}>
        Ready to find your flight
      </p>
      <p style={{ fontSize: 14, color: 'var(--gray-400)' }}>
        Enter your trip details and we'll sweep all date combos for the best deal.
      </p>
    </div>
  );
}
