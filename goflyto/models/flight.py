from pydantic import BaseModel
from typing import Optional


class SearchConstraints(BaseModel):
    origin: Optional[str] = None
    destination: Optional[str] = None
    destination_airports: list[str] = []
    earliest_departure: Optional[str] = None
    latest_departure: Optional[str] = None
    latest_return: Optional[str] = None
    trip_length_min_days: Optional[int] = None
    trip_length_max_days: Optional[int] = None
    budget_usd: Optional[float] = None
    nonstop_preferred: bool = False
    passengers: int = 1
    passport_nationality: Optional[str] = None


class FlightOffer(BaseModel):
    offer_id: str
    price_usd: float
    airlines: list[str]
    outbound_route: str
    return_route: str
    outbound_departure: str
    return_departure: str
    stops_out: int
    stops_return: int


class SearchResult(BaseModel):
    constraints: SearchConstraints
    offers: list[FlightOffer]
    strategy_notes: list[str]
    visa_notes: list[str]
