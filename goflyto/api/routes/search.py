import structlog
from fastapi import APIRouter
from pydantic import BaseModel

from goflyto.api.errors import ai_parse_failed, no_flights_found
from goflyto.core.database import AsyncSessionLocal
from goflyto.models.flight import SearchConstraints, SearchResult
from goflyto.services.cache import CacheService
from goflyto.services.providers.duffel import DuffelProvider
from goflyto.services.vertex import VertexAIClient
from goflyto.services.optimizer import FlightOptimizer

log = structlog.get_logger("goflyto.search")

router = APIRouter(prefix="/search", tags=["search"])

_vertex = VertexAIClient()
_duffel = DuffelProvider()
_cache = CacheService(AsyncSessionLocal)
_optimizer = FlightOptimizer(provider=_duffel, cache=_cache)


class NaturalQuery(BaseModel):
    message: str


@router.post("/natural", response_model=SearchResult)
async def search_natural(query: NaturalQuery) -> SearchResult:
    log.info("natural_query", message=query.message)

    raw = await _vertex.extract_constraints(query.message)
    log.info("ai_constraints", raw=raw)

    if not raw:
        log.warning("ai_parse_empty", message=query.message)
        raise ai_parse_failed()

    dest_airports = raw.get("destination_iata_options") or []
    constraints = SearchConstraints(
        origin=raw.get("origin_iata"),
        destination=dest_airports[0] if dest_airports else None,
        destination_airports=dest_airports,
        earliest_departure=raw.get("earliest_departure_date"),
        latest_departure=raw.get("latest_departure_date"),
        latest_return=raw.get("latest_departure_date"),
        trip_length_min_days=raw.get("min_trip_days"),
        trip_length_max_days=raw.get("max_trip_days"),
        budget_usd=raw.get("budget_usd"),
        nonstop_preferred=raw.get("nonstop_preferred", False),
        passengers=raw.get("passengers", 1),
        passport_nationality=raw.get("passport_nationality"),
    )
    log.info("constraints_built", constraints=constraints.model_dump())

    result = await _optimizer.optimize(constraints)

    if not result.offers:
        log.warning("no_flights_found", constraints=constraints.model_dump())
        raise no_flights_found()

    log.info("search_success", offer_count=len(result.offers), cheapest=result.offers[0].price_usd)
    return result


@router.post("/structured", response_model=SearchResult)
async def search_structured(constraints: SearchConstraints) -> SearchResult:
    log.info("structured_query", constraints=constraints.model_dump())

    result = await _optimizer.optimize(constraints)

    if not result.offers:
        log.warning("no_flights_found", constraints=constraints.model_dump())
        raise no_flights_found()

    log.info("search_success", offer_count=len(result.offers), cheapest=result.offers[0].price_usd)
    return result
