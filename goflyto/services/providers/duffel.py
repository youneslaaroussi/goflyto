import asyncio
import time

import httpx
import structlog

from goflyto.api.errors import invalid_route, search_timeout, service_unavailable
from goflyto.core.config import settings
from goflyto.models.flight import FlightOffer
from goflyto.services.providers.base import FlightProvider, FlightQuery, OpenJawQuery

log = structlog.get_logger("goflyto.duffel")

_MAX_RETRIES = 3


class DuffelProvider(FlightProvider):

    @property
    def name(self) -> str:
        return "duffel"

    @property
    def _headers(self) -> dict:
        return {
            "Authorization": f"Bearer {settings.duffel_api_key}",
            "Duffel-Version": settings.duffel_version,
            "Content-Type": "application/json",
        }

    async def search(self, query: FlightQuery) -> list[FlightOffer]:
        payload: dict = {
            "data": {
                "slices": [
                    {"origin": query.origin, "destination": query.destination, "departure_date": query.departure_date},
                    {"origin": query.destination, "destination": query.origin, "departure_date": query.return_date},
                ],
                "passengers": [{"type": "adult"}] * query.passengers,
            }
        }
        if query.cabin_class:
            payload["data"]["cabin_class"] = query.cabin_class
        return await self._post(payload, query.origin, query.destination, query.departure_date, query.return_date)

    async def search_openjaw(self, query: OpenJawQuery) -> list[FlightOffer]:
        payload = {
            "data": {
                "slices": [
                    {"origin": query.origin, "destination": query.destination_in, "departure_date": query.departure_date},
                    {"origin": query.destination_out, "destination": query.origin, "departure_date": query.return_date},
                ],
                "passengers": [{"type": "adult"}] * query.passengers,
            }
        }
        label = f"{query.origin}→{query.destination_in}/{query.destination_out}"
        return await self._post(payload, query.origin, label, query.departure_date, query.return_date)

    async def _post(self, payload: dict, origin: str, dest: str, dep: str, ret: str) -> list[FlightOffer]:
        t0 = time.perf_counter()
        for attempt in range(_MAX_RETRIES):
            try:
                async with httpx.AsyncClient(timeout=30) as client:
                    resp = await client.post(
                        f"{settings.duffel_api_url}/air/offer_requests?return_offers=true",
                        headers=self._headers,
                        json=payload,
                    )
            except httpx.TimeoutException as exc:
                log.warning("duffel_timeout", origin=origin, dest=dest, dep=dep, ret=ret, error=str(exc))
                raise search_timeout() from exc
            except httpx.RequestError as exc:
                log.warning("duffel_network_error", origin=origin, dest=dest, error=str(exc))
                raise service_unavailable() from exc

            if resp.status_code == 429:
                reset_in = float(resp.headers.get("ratelimit-reset", "2"))
                wait = min(reset_in, 10.0)
                log.warning("duffel_rate_limited", origin=origin, dest=dest, dep=dep, ret=ret,
                            attempt=attempt + 1, retry_after=wait)
                await asyncio.sleep(wait)
                continue

            break
        else:
            raise service_unavailable()

        ms = (time.perf_counter() - t0) * 1000

        if resp.status_code == 422:
            body = resp.text[:300]
            log.warning("duffel_invalid_route", origin=origin, dest=dest, dep=dep, ret=ret, response=body, duration_ms=round(ms, 1))
            raise invalid_route()

        if resp.status_code in (502, 503, 504):
            log.warning("duffel_upstream_error", status=resp.status_code, origin=origin, dest=dest)
            raise service_unavailable()

        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            log.warning("duffel_http_error", status=resp.status_code, origin=origin, dest=dest, response=resp.text[:300])
            raise service_unavailable() from exc

        offers = resp.json().get("data", {}).get("offers", [])
        log.debug("duffel_response", origin=origin, dest=dest, dep=dep, ret=ret, offers=len(offers), duration_ms=round(ms, 1))
        return [self._parse(o) for o in offers]

    def _parse(self, o: dict) -> FlightOffer:
        slices = o.get("slices", [{}, {}])
        out_segs = slices[0].get("segments", [])
        ret_segs = slices[1].get("segments", []) if len(slices) > 1 else []

        def route(segs: list) -> str:
            return " → ".join(f"{s['origin']['iata_code']}-{s['destination']['iata_code']}" for s in segs)

        airlines = list({s["operating_carrier"]["name"] for sl in slices for s in sl.get("segments", [])})

        return FlightOffer(
            offer_id=o["id"],
            price_usd=float(o["total_amount"]),
            airlines=airlines,
            outbound_route=route(out_segs),
            return_route=route(ret_segs),
            outbound_departure=out_segs[0]["departing_at"] if out_segs else "",
            return_departure=ret_segs[0]["departing_at"] if ret_segs else "",
            stops_out=len(out_segs) - 1,
            stops_return=len(ret_segs) - 1,
        )
