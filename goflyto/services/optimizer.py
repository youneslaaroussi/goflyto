import asyncio
from datetime import date, timedelta

from goflyto.models.flight import FlightOffer, SearchResult, SearchConstraints
from goflyto.services.cache import CacheService
from goflyto.services.providers.base import FlightProvider, FlightQuery, OpenJawQuery


MOROCCAN_AIRPORTS = ["CMN", "RAK", "FEZ", "AGA", "TNG"]
OPENJAW_PAIRS = [("TNG", "RAK"), ("RAK", "CMN"), ("FEZ", "CMN")]


class FlightOptimizer:
    def __init__(self, provider: FlightProvider, cache: CacheService):
        self._provider = provider
        self._cache = cache

    async def optimize(self, constraints: SearchConstraints) -> SearchResult:
        dep_dates = _date_range(constraints.earliest_departure, constraints.latest_return)
        ret_dates = _return_range(dep_dates, constraints.trip_length_min_days, constraints.trip_length_max_days)
        destinations = _resolve_destinations(constraints.destination)
        origins = _resolve_origins(constraints.origin)

        tasks: list = []

        for origin in origins:
            for dest in destinations:
                for dep in dep_dates:
                    for ret in ret_dates:
                        if ret <= dep:
                            continue
                        tasks.append(self._cache.get_or_fetch(
                            self._provider,
                            FlightQuery(origin=origin, destination=dest, departure_date=dep, return_date=ret, passengers=constraints.passengers),
                        ))

            for dest_in, dest_out in OPENJAW_PAIRS:
                if dest_in in destinations or dest_out in destinations:
                    for dep in dep_dates:
                        for ret in ret_dates:
                            if ret <= dep:
                                continue
                            tasks.append(self._cache.get_or_fetch(
                                self._provider,
                                OpenJawQuery(origin=origin, destination_in=dest_in, destination_out=dest_out,
                                             departure_date=dep, return_date=ret, passengers=constraints.passengers),
                            ))

        results = await asyncio.gather(*tasks, return_exceptions=True)

        all_offers: list[FlightOffer] = []
        strategy_notes: list[str] = []

        for offers in results:
            if isinstance(offers, Exception):
                continue
            all_offers.extend(offers or [])

        all_offers.sort(key=lambda o: o.price_usd)
        top = all_offers[:20]

        if top:
            cheapest = top[0].price_usd
            nonstop = [o for o in top if o.stops_out == 0 and o.stops_return == 0]
            if nonstop and nonstop[0].price_usd > cheapest:
                strategy_notes.append(
                    f"Nonstop costs ${nonstop[0].price_usd - cheapest:.0f} more than cheapest (${cheapest:.0f})"
                )

        return SearchResult(
            constraints=constraints,
            offers=top,
            strategy_notes=strategy_notes,
            visa_notes=_visa_notes(constraints),
        )


def _visa_notes(constraints: SearchConstraints) -> list[str]:
    notes = []
    nat = (constraints.passport_nationality or "").lower()
    if "morocc" in nat:
        notes.append("UK airside transit: generally no visa needed if staying airside.")
        notes.append("Schengen (Madrid) airside transit: exempt with valid Canadian PR/visa.")
        notes.append("Direct YUL→CMN avoids all transit visa questions.")
    return notes


def _date_range(earliest: str | None, latest: str | None) -> list[str]:
    start = date.fromisoformat(earliest) if earliest else date(2026, 7, 19)
    end = date.fromisoformat(latest) if latest else date(2026, 7, 26)
    days = (end - start).days + 1
    return [(start + timedelta(days=i)).isoformat() for i in range(0, days, 2)]


def _return_range(dep_dates: list[str], min_days: int | None, max_days: int | None) -> list[str]:
    min_d = min_days or 10
    max_d = max_days or 21
    earliest_dep = date.fromisoformat(dep_dates[0])
    start = earliest_dep + timedelta(days=min_d)
    end = earliest_dep + timedelta(days=max_d)
    return [(start + timedelta(days=i)).isoformat() for i in range((end - start).days + 1)]


def _resolve_destinations(destination: str | None) -> list[str]:
    if not destination:
        return ["CMN", "RAK"]
    d = destination.upper()
    if d in MOROCCAN_AIRPORTS:
        return [d]
    if "MOROCCO" in d or "MAROC" in d:
        return ["CMN", "RAK"]
    return [d]


def _resolve_origins(origin: str | None) -> list[str]:
    if not origin:
        return ["YUL", "YYZ"]
    o = origin.upper()
    if len(o) == 3:
        return [o]
    if "TORONTO" in o:
        return ["YYZ"]
    if "MONTREAL" in o:
        return ["YUL"]
    if "VANCOUVER" in o:
        return ["YVR"]
    return ["YUL", "YYZ"]
