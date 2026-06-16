from datetime import datetime
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean,
    DateTime, Date, ForeignKey, Text, JSON, Index,
)
from sqlalchemy.dialects.postgresql import UUID, ARRAY
from sqlalchemy.orm import DeclarativeBase
import uuid


class Base(DeclarativeBase):
    pass


class Provider(Base):
    __tablename__ = "providers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(50), unique=True, nullable=False)   # "duffel", "amadeus"
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)


class FlightSearch(Base):
    """One row per unique (search params + provider). Stores raw response."""
    __tablename__ = "flight_searches"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cache_key = Column(String(64), unique=True, nullable=False, index=True)
    origin = Column(String(3), nullable=False)
    destination = Column(String(3), nullable=False)
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=False)
    passengers = Column(Integer, nullable=False, default=1)
    cabin_class = Column(String(20), nullable=True)
    provider = Column(String(50), nullable=False)
    raw_response = Column(JSON, nullable=False)
    fetched_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime(timezone=True), nullable=False)

    __table_args__ = (
        Index("ix_flight_searches_route_dates", "origin", "destination", "departure_date", "return_date"),
    )


class FlightOffer(Base):
    """Normalized, queryable offers extracted from a search."""
    __tablename__ = "flight_offers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    search_id = Column(UUID(as_uuid=True), ForeignKey("flight_searches.id", ondelete="CASCADE"), nullable=False)
    provider_offer_id = Column(String(200), nullable=True)
    provider = Column(String(50), nullable=False)
    price_amount = Column(Numeric(10, 2), nullable=False)
    price_currency = Column(String(3), nullable=False, default="USD")
    airlines = Column(ARRAY(Text), nullable=False)
    outbound_route = Column(Text, nullable=False)
    return_route = Column(Text, nullable=False)
    outbound_departure = Column(DateTime(timezone=True), nullable=True)
    return_departure = Column(DateTime(timezone=True), nullable=True)
    stops_outbound = Column(Integer, nullable=False)
    stops_return = Column(Integer, nullable=False)
    is_nonstop = Column(Boolean, nullable=False)
    captured_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_flight_offers_search_id", "search_id"),
        Index("ix_flight_offers_price", "price_amount"),
    )


class OfferPriceHistory(Base):
    """Periodic snapshots of min/avg price per route — powers future 'is this a good deal?' logic."""
    __tablename__ = "offer_price_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    route_key = Column(String(7), nullable=False)     # "YUL-CMN"
    departure_date = Column(Date, nullable=False)
    return_date = Column(Date, nullable=False)
    provider = Column(String(50), nullable=False)
    min_price = Column(Numeric(10, 2), nullable=False)
    avg_price = Column(Numeric(10, 2), nullable=False)
    sample_count = Column(Integer, nullable=False)
    recorded_at = Column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)

    __table_args__ = (
        Index("ix_price_history_route_date", "route_key", "departure_date"),
    )
