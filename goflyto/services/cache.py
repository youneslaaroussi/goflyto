import hashlib
import json
from datetime import date, datetime, timedelta, timezone

import redis.asyncio as aioredis
from sqlalchemy import select, delete
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker

from goflyto.core.config import settings
from goflyto.models.db import FlightSearch, FlightOffer as DBOffer, OfferPriceHistory
from goflyto.models.flight import FlightOffer
from goflyto.services.providers.base import FlightProvider, FlightQuery, OpenJawQuery


def _ttl(departure_date: date) -> timedelta:
    days_out = (departure_date - date.today()).days
    if days_out < 7:
        return timedelta(minutes=15)
    elif days_out < 30:
        return timedelta(hours=1)
    elif days_out < 90:
        return timedelta(hours=4)
    return timedelta(hours=12)


def _cache_key(origin: str, destination: str, departure_date: str, return_date: str,
               passengers: int, cabin_class: str | None, provider: str) -> str:
    raw = f"{origin}:{destination}:{departure_date}:{return_date}:{passengers}:{cabin_class or ''}:{provider}"
    return hashlib.sha256(raw.encode()).hexdigest()


class CacheService:
    def __init__(self, session_factory: async_sessionmaker[AsyncSession]):
        self._factory = session_factory
        self._redis = aioredis.from_url(settings.redis_url, decode_responses=True)

    async def get_or_fetch(
        self,
        provider: FlightProvider,
        query: FlightQuery | OpenJawQuery,
    ) -> list[FlightOffer]:
        is_openjaw = isinstance(query, OpenJawQuery)
        origin = query.origin
        destination = query.destination_in if is_openjaw else query.destination
        dest_key = f"{query.destination_in}/{query.destination_out}" if is_openjaw else query.destination

        key = _cache_key(
            origin, dest_key, query.departure_date, query.return_date,
            query.passengers, getattr(query, "cabin_class", None), provider.name,
        )

        # L1: Redis
        cached = await self._redis.get(f"goflyto:offers:{key}")
        if cached:
            return [FlightOffer(**o) for o in json.loads(cached)]

        # L2: Postgres
        now = datetime.now(timezone.utc)
        async with self._factory() as db:
            row = await db.scalar(
                select(FlightSearch).where(
                    FlightSearch.cache_key == key,
                    FlightSearch.expires_at > now,
                )
            )
            if row:
                offers = self._deserialize(row.raw_response)
                await self._warm_redis(key, offers, row.expires_at)
                return offers

        # Cache miss — hit the provider
        offers = await (
            provider.search_openjaw(query) if is_openjaw else provider.search(query)  # type: ignore[arg-type]
        )

        dep_date = date.fromisoformat(query.departure_date)
        ttl = _ttl(dep_date)
        expires_at = now + ttl

        await self._persist(key, origin, destination, query, provider.name, offers, expires_at)
        await self._warm_redis(key, offers, expires_at)
        await self._record_history(origin, dest_key, query.departure_date, query.return_date, provider.name, offers)

        return offers

    async def _persist(self, key: str, origin: str, destination: str,
                       query: FlightQuery | OpenJawQuery, provider: str,
                       offers: list[FlightOffer], expires_at: datetime) -> None:
        async with self._factory() as db:
            search = FlightSearch(
                cache_key=key,
                origin=origin,
                destination=destination,
                departure_date=date.fromisoformat(query.departure_date),
                return_date=date.fromisoformat(query.return_date),
                passengers=query.passengers,
                cabin_class=getattr(query, "cabin_class", None),
                provider=provider,
                raw_response=self._serialize(offers[:50]),
                expires_at=expires_at,
            )
            db.add(search)
            await db.flush()  # populate search.id before FK refs

            for o in offers[:50]:
                db.add(DBOffer(
                    search_id=search.id,
                    provider_offer_id=o.offer_id,
                    provider=provider,
                    price_amount=o.price_usd,
                    price_currency="USD",
                    airlines=o.airlines,
                    outbound_route=o.outbound_route,
                    return_route=o.return_route,
                    outbound_departure=datetime.fromisoformat(o.outbound_departure) if o.outbound_departure else None,
                    return_departure=datetime.fromisoformat(o.return_departure) if o.return_departure else None,
                    stops_outbound=o.stops_out,
                    stops_return=o.stops_return,
                    is_nonstop=(o.stops_out == 0 and o.stops_return == 0),
                ))

            await db.commit()

    async def _warm_redis(self, key: str, offers: list[FlightOffer], expires_at: datetime) -> None:
        ttl_secs = max(int((expires_at - datetime.now(timezone.utc)).total_seconds()), 60)
        await self._redis.setex(
            f"goflyto:offers:{key}",
            ttl_secs,
            json.dumps([o.model_dump() for o in offers]),
        )

    async def _record_history(self, origin: str, destination: str, dep: str, ret: str,
                               provider: str, offers: list[FlightOffer]) -> None:
        if not offers:
            return
        prices = [o.price_usd for o in offers]
        async with self._factory() as db:
            db.add(OfferPriceHistory(
                route_key=f"{origin}-{destination[:3]}",
                departure_date=date.fromisoformat(dep),
                return_date=date.fromisoformat(ret),
                provider=provider,
                min_price=min(prices),
                avg_price=sum(prices) / len(prices),
                sample_count=len(prices),
            ))
            await db.commit()

    async def invalidate(self, key: str) -> None:
        await self._redis.delete(f"goflyto:offers:{key}")
        async with self._factory() as db:
            await db.execute(delete(FlightSearch).where(FlightSearch.cache_key == key))
            await db.commit()

    def _serialize(self, offers: list[FlightOffer]) -> list[dict]:
        return [o.model_dump() for o in offers]

    def _deserialize(self, data: list[dict]) -> list[FlightOffer]:
        return [FlightOffer(**o) for o in data]
