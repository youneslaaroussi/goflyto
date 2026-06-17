export interface SearchConstraints {
  origin?: string;
  destination?: string;
  destination_airports?: string[];
  earliest_departure?: string;
  latest_departure?: string;
  latest_return?: string;
  trip_length_min_days?: number;
  trip_length_max_days?: number;
  budget_usd?: number;
  nonstop_preferred?: boolean;
  passengers?: number;
  passport_nationality?: string;
}

export interface FlightOffer {
  offer_id: string;
  price_usd: number;
  airlines: string[];
  outbound_route: string;
  return_route: string;
  outbound_departure: string;
  return_departure: string;
  stops_out: number;
  stops_return: number;
}

export interface SearchResult {
  constraints: SearchConstraints;
  offers: FlightOffer[];
  strategy_notes: string[];
  visa_notes: string[];
}
