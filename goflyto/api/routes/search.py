from fastapi import APIRouter
from pydantic import BaseModel

from goflyto.api.errors import ai_parse_failed, no_flights_found
from goflyto.core.database import AsyncSessionLocal
from goflyto.models.flight import SearchConstraints, SearchResult
from goflyto.services.cache import CacheService
from goflyto.services.providers.duffel import DuffelProvider
from goflyto.services.vertex import VertexAIClient
from goflyto.services.optimizer import FlightOptimizer

router = APIRouter(prefix="/search", tags=["search"])

_vertex = VertexAIClient()
_duffel = DuffelProvider()
_cache = CacheService(AsyncSessionLocal)
_optimizer = FlightOptimizer(provider=_duffel, cache=_cache)


class NaturalQuery(BaseModel):
    message: str


@router.post("/natural", response_model=SearchResult)
async def search_natural(query: NaturalQuery) -> SearchResult:
    raw = await _vertex.extract_constraints(query.message)
    if not raw:
        raise ai_parse_failed()

    constraints = SearchConstraints(
        origin=raw.get("origin_iata") or raw.get("origin_city"),
        destination=raw.get("destination_iata_options", [None])[0] or raw.get("destination_city"),
        earliest_departure=raw.get("earliest_departure_date"),
        latest_return=raw.get("latest_departure_date"),
        trip_length_min_days=raw.get("min_trip_days"),
        trip_length_max_days=raw.get("max_trip_days"),
        budget_usd=raw.get("budget_usd"),
        nonstop_preferred=raw.get("nonstop_preferred", False),
        passengers=raw.get("passengers", 1),
        passport_nationality=raw.get("passport_nationality"),
    )

    result = await _optimizer.optimize(constraints)

    if not result.offers:
        raise no_flights_found()

    return result


@router.post("/structured", response_model=SearchResult)
async def search_structured(constraints: SearchConstraints) -> SearchResult:
    result = await _optimizer.optimize(constraints)

    if not result.offers:
        raise no_flights_found()

    return result
