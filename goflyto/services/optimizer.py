import asyncio
import time
from datetime import date, timedelta
from itertools import combinations

import structlog

from goflyto.models.flight import FlightOffer, SearchResult, SearchConstraints
from goflyto.services.cache import CacheService
from goflyto.services.providers.base import FlightProvider, FlightQuery, OpenJawQuery

log = structlog.get_logger("goflyto.optimizer")

_MAX_CONCURRENT = 12
_DEP_STEP = 2
_RET_STEP = 2


class FlightOptimizer:
    def __init__(self, provider: FlightProvider, cache: CacheService):
        self._provider = provider
        self._cache = cache

    async def optimize(self, constraints: SearchConstraints) -> SearchResult:
        origins = _resolve_origins(constraints)
        destinations = _resolve_destinations(constraints)

        if not origins or not destinations:
            log.warning("optimizer_no_targets", origins=origins, destinations=destinations, constraints=constraints.model_dump())
            return SearchResult(constraints=constraints, offers=[], strategy_notes=[], visa_notes=[])

        dep_dates = _dep_date_range(constraints)
        log.info(
            "optimizer_start",
            origins=origins,
            destinations=destinations,
            dep_dates_count=len(dep_dates),
            dep_first=dep_dates[0] if dep_dates else None,
            dep_last=dep_dates[-1] if dep_dates else None,
            trip_min=constraints.trip_length_min_days,
            trip_max=constraints.trip_length_max_days,
        )

        sem = asyncio.Semaphore(_MAX_CONCURRENT)
        errors: list[str] = []

        async def fetch(query: FlightQuery | OpenJawQuery) -> list[FlightOffer]:
            label = (
                f"{query.origin}→{query.destination_in}/{query.destination_out}"
                if isinstance(query, OpenJawQuery)
                else f"{query.origin}→{query.destination}"
            )
            t0 = time.perf_counter()
            async with sem:
                try:
                    offers = await self._cache.get_or_fetch(self._provider, query)
                    ms = (time.perf_counter() - t0) * 1000
                    log.debug(
                        "query_ok",
                        route=label,
                        dep=query.departure_date,
                        ret=query.return_date,
                        offers=len(offers),
                        duration_ms=round(ms, 1),
                    )
                    return offers
                except Exception as exc:
                    ms = (time.perf_counter() - t0) * 1000
                    errors.append(f"{label} {query.departure_date}/{query.return_date}: {exc}")
                    log.warning(
                        "query_failed",
                        route=label,
                        dep=query.departure_date,
                        ret=query.return_date,
                        error=str(exc),
                        duration_ms=round(ms, 1),
                    )
                    return []

        tasks = []
        for origin in origins:
            for dest in destinations:
                for dep in dep_dates:
                    for ret in _ret_date_range(dep, constraints):
                        tasks.append(fetch(FlightQuery(
                            origin=origin, destination=dest,
                            departure_date=dep, return_date=ret,
                            passengers=constraints.passengers,
                        )))

            for dest_a, dest_b in combinations(destinations, 2):
                for dep in dep_dates:
                    for ret in _ret_date_range(dep, constraints):
                        tasks.append(fetch(OpenJawQuery(
                            origin=origin, destination_in=dest_a, destination_out=dest_b,
                            departure_date=dep, return_date=ret,
                            passengers=constraints.passengers,
                        )))
                        tasks.append(fetch(OpenJawQuery(
                            origin=origin, destination_in=dest_b, destination_out=dest_a,
                            departure_date=dep, return_date=ret,
                            passengers=constraints.passengers,
                        )))

        log.info("optimizer_queued", task_count=len(tasks))
        t_start = time.perf_counter()
        results = await asyncio.gather(*tasks)
        total_ms = (time.perf_counter() - t_start) * 1000

        all_offers: list[FlightOffer] = []
        for r in results:
            all_offers.extend(r)

        all_offers.sort(key=lambda o: o.price_usd)
        top = all_offers[:20]

        log.info(
            "optimizer_done",
            tasks=len(tasks),
            errors=len(errors),
            total_offers=len(all_offers),
            returned=len(top),
            cheapest=top[0].price_usd if top else None,
            duration_ms=round(total_ms, 1),
        )
        if errors:
            log.warning("optimizer_errors_summary", count=len(errors), sample=errors[:5])

        return SearchResult(
            constraints=constraints,
            offers=top,
            strategy_notes=_strategy_notes(top, constraints),
            visa_notes=[],
        )


def _dep_date_range(constraints: SearchConstraints) -> list[str]:
    today = date.today()
    start = date.fromisoformat(constraints.earliest_departure) if constraints.earliest_departure else today + timedelta(days=30)
    end_str = constraints.latest_departure or constraints.latest_return
    end = date.fromisoformat(end_str) if end_str else start + timedelta(days=7)
    if end < start:
        end = start
    return [(start + timedelta(days=i)).isoformat() for i in range(0, (end - start).days + 1, _DEP_STEP)]


def _ret_date_range(dep_date_str: str, constraints: SearchConstraints) -> list[str]:
    dep = date.fromisoformat(dep_date_str)
    min_d = constraints.trip_length_min_days or 7
    max_d = constraints.trip_length_max_days or 14
    start = dep + timedelta(days=min_d)
    end = dep + timedelta(days=max_d)
    return [(start + timedelta(days=i)).isoformat() for i in range(0, (end - start).days + 1, _RET_STEP)]


def _resolve_origins(constraints: SearchConstraints) -> list[str]:
    if constraints.origin:
        return [constraints.origin.upper()]
    return []


def _resolve_destinations(constraints: SearchConstraints) -> list[str]:
    origins = {o.upper() for o in _resolve_origins(constraints)}
    if constraints.destination_airports:
        return [d.upper() for d in constraints.destination_airports if d.upper() not in origins]
    if constraints.destination and constraints.destination.upper() not in origins:
        return [constraints.destination.upper()]
    return []


def _strategy_notes(offers: list[FlightOffer], constraints: SearchConstraints) -> list[str]:
    if not offers:
        return []
    notes = []
    cheapest = offers[0].price_usd

    nonstop = [o for o in offers if o.stops_out == 0 and o.stops_return == 0]
    if nonstop and nonstop[0].price_usd > cheapest:
        notes.append(
            f"Nonstop costs ${nonstop[0].price_usd - cheapest:.0f} more than the cheapest option (${cheapest:.0f})"
        )

    openjaw_count = sum(1 for o in offers[:10] if _is_openjaw(o.outbound_route, o.return_route))
    if openjaw_count:
        notes.append(
            f"{openjaw_count} of the top results use an open-jaw route (fly into one city, return from another)"
        )

    if constraints.budget_usd and cheapest > constraints.budget_usd:
        notes.append(
            f"Cheapest found (${cheapest:.0f}) exceeds your budget of ${constraints.budget_usd:.0f}"
        )

    return notes


def _is_openjaw(outbound_route: str, return_route: str) -> bool:
    out_segs = outbound_route.split(" → ")
    ret_segs = return_route.split(" → ")
    if not out_segs or not ret_segs:
        return False
    out_dest = out_segs[-1].split("-")[-1] if "-" in out_segs[-1] else out_segs[-1]
    ret_orig = ret_segs[0].split("-")[0] if "-" in ret_segs[0] else ret_segs[0]
    return out_dest.strip() != ret_orig.strip()
