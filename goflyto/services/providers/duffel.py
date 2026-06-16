import logging

import httpx
from goflyto.api.errors import invalid_route, search_timeout, service_unavailable
from goflyto.core.config import settings
from goflyto.models.flight import FlightOffer
from goflyto.services.providers.base import FlightProvider, FlightQuery, OpenJawQuery

log = logging.getLogger("goflyto")


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

        return await self._post(payload)

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
        return await self._post(payload)

    async def _post(self, payload: dict) -> list[FlightOffer]:
        try:
            async with httpx.AsyncClient(timeout=30) as client:
                resp = await client.post(
                    f"{settings.duffel_api_url}/air/offer_requests?return_offers=true",
                    headers=self._headers,
                    json=payload,
                )
        except httpx.TimeoutException as exc:
            log.warning("Duffel timeout: %s", exc)
            raise search_timeout() from exc
        except httpx.RequestError as exc:
            log.warning("Duffel network error: %s", exc)
            raise service_unavailable() from exc

        if resp.status_code == 422:
            log.warning("Duffel 422 — invalid route payload: %s", resp.text[:200])
            raise invalid_route()
        if resp.status_code in (502, 503, 504):
            log.warning("Duffel %d", resp.status_code)
            raise service_unavailable()

        try:
            resp.raise_for_status()
        except httpx.HTTPStatusError as exc:
            log.warning("Duffel HTTP %d: %s", resp.status_code, resp.text[:200])
            raise service_unavailable() from exc

        offers = resp.json().get("data", {}).get("offers", [])
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
