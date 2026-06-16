import { useState } from 'react';
import type { SearchResult, FlightOffer } from '../types';
import { formatDate, formatTime, formatDuration } from '../utils';
import styles from './Results.module.css';

interface Props { result: SearchResult; }

export function Results({ result }: Props) {
  const { offers, strategy_notes, visa_notes, constraints } = result;
  const [filter, setFilter] = useState<'all' | 'nonstop'>('all');
  const [sortBy, setSortBy] = useState<'price' | 'duration'>('price');

  const filtered = offers.filter(o => filter === 'all' || (o.stops_out === 0 && o.stops_return === 0));
  const sorted = [...filtered].sort((a, b) =>
    sortBy === 'price' ? a.price_usd - b.price_usd : (a.stops_out + a.stops_return) - (b.stops_out + b.stops_return)
  );

  const cheapest = sorted[0]?.price_usd ?? 0;
  const nonstopOffers = offers.filter(o => o.stops_out === 0 && o.stops_return === 0);
  const cheapestNonstop = nonstopOffers[0]?.price_usd;

  return (
    <div className={styles.wrap}>
      {/* Summary bar */}
      <div className={styles.summary}>
        <div className={styles.summaryLeft}>
          <span className={styles.count}>{offers.length} flights found</span>
          {constraints.origin && constraints.destination && (
            <span className={styles.route}>
              {constraints.origin} → {constraints.destination}
            </span>
          )}
        </div>
        <div className={styles.summaryRight}>
          {cheapestNonstop && cheapestNonstop > cheapest && (
            <span className={styles.nonstopPill}>
              Nonstop from <strong>${cheapestNonstop.toFixed(0)}</strong>
            </span>
          )}
          <span className={styles.fromPrice}>
            From <strong>${cheapest.toFixed(0)}</strong>
          </span>
        </div>
      </div>

      {/* Strategy / visa notes */}
      {(strategy_notes.length > 0 || visa_notes.length > 0) && (
        <div className={styles.notesRow}>
          {strategy_notes.map((n, i) => (
            <div key={i} className={styles.noteChip} data-type="strategy">
              💡 {n}
            </div>
          ))}
          {visa_notes.map((n, i) => (
            <div key={i} className={styles.noteChip} data-type="visa">
              🛂 {n}
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className={styles.controls}>
        <div className={styles.filterGroup}>
          <button
            className={`${styles.filterBtn} ${filter === 'all' ? styles.active : ''}`}
            onClick={() => setFilter('all')}
          >
            All stops
          </button>
          <button
            className={`${styles.filterBtn} ${filter === 'nonstop' ? styles.active : ''}`}
            onClick={() => setFilter('nonstop')}
          >
            Nonstop only
          </button>
        </div>
        <div className={styles.sortGroup}>
          <span className={styles.sortLabel}>Sort:</span>
          <button
            className={`${styles.sortBtn} ${sortBy === 'price' ? styles.active : ''}`}
            onClick={() => setSortBy('price')}
          >
            Price
          </button>
          <button
            className={`${styles.sortBtn} ${sortBy === 'duration' ? styles.active : ''}`}
            onClick={() => setSortBy('duration')}
          >
            Stops
          </button>
        </div>
      </div>

      {/* Flight cards */}
      <div className={styles.list}>
        {sorted.length === 0 ? (
          <div className={styles.empty}>No flights match this filter.</div>
        ) : (
          sorted.map((offer, i) => (
            <FlightCard key={offer.offer_id} offer={offer} rank={i} cheapest={cheapest} />
          ))
        )}
      </div>
    </div>
  );
}

function FlightCard({ offer, rank, cheapest }: { offer: FlightOffer; rank: number; cheapest: number }) {
  const [expanded, setExpanded] = useState(false);
  const isNonstop = offer.stops_out === 0 && offer.stops_return === 0;
  const isCheapest = rank === 0;
  const priceDiff = offer.price_usd - cheapest;

  return (
    <div className={`${styles.card} ${isCheapest ? styles.cardBest : ''}`} onClick={() => setExpanded(!expanded)}>
      {isCheapest && <div className={styles.bestBadge}>Best price</div>}

      <div className={styles.cardMain}>
        {/* Outbound leg */}
        <div className={styles.legs}>
          <FlightLeg
            route={offer.outbound_route}
            departure={offer.outbound_departure}
            stops={offer.stops_out}
            label="Out"
          />
          <div className={styles.legDivider}>↩</div>
          <FlightLeg
            route={offer.return_route}
            departure={offer.return_departure}
            stops={offer.stops_return}
            label="Return"
          />
        </div>

        {/* Price + airline */}
        <div className={styles.priceCol}>
          <div className={styles.price}>${offer.price_usd.toFixed(0)}</div>
          {priceDiff > 0 && (
            <div className={styles.priceDiff}>+${priceDiff.toFixed(0)}</div>
          )}
          <div className={styles.airline}>
            {offer.airlines.slice(0, 2).join(', ')}
          </div>
          {isNonstop && <div className={styles.nonstopTag}>Nonstop</div>}
        </div>
      </div>

      {expanded && (
        <div className={styles.expanded}>
          <div className={styles.expandedGrid}>
            <div>
              <p className={styles.expandedLabel}>Outbound route</p>
              <p className={styles.expandedVal}>{offer.outbound_route}</p>
              {offer.outbound_departure && (
                <p className={styles.expandedSub}>{formatDate(offer.outbound_departure)} at {formatTime(offer.outbound_departure)}</p>
              )}
            </div>
            <div>
              <p className={styles.expandedLabel}>Return route</p>
              <p className={styles.expandedVal}>{offer.return_route}</p>
              {offer.return_departure && (
                <p className={styles.expandedSub}>{formatDate(offer.return_departure)} at {formatTime(offer.return_departure)}</p>
              )}
            </div>
            <div>
              <p className={styles.expandedLabel}>Airlines</p>
              <p className={styles.expandedVal}>{offer.airlines.join(', ')}</p>
            </div>
            <div>
              <p className={styles.expandedLabel}>Offer ID</p>
              <p className={styles.expandedVal} style={{ fontSize: 11, fontFamily: 'monospace', wordBreak: 'break-all' }}>
                {offer.offer_id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FlightLeg({ route, departure, stops, label }: {
  route: string; departure: string; stops: number; label: string;
}) {
  const parts = route.split(' → ');
  const origin = parts[0]?.split('-')[0];
  const dest = parts[parts.length - 1]?.split('-')[1];

  return (
    <div className={styles.leg}>
      <span className={styles.legLabel}>{label}</span>
      <div className={styles.legRoute}>
        <span className={styles.iata}>{origin}</span>
        <div className={styles.legLine}>
          <div className={styles.legLineTrack} />
          <span className={styles.legStops}>
            {stops === 0 ? 'Nonstop' : `${stops} stop${stops > 1 ? 's' : ''}`}
          </span>
        </div>
        <span className={styles.iata}>{dest}</span>
      </div>
      {departure && (
        <span className={styles.legTime}>{formatDate(departure)}</span>
      )}
    </div>
  );
}
