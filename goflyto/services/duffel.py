import httpx
from goflyto.core.config import settings
from goflyto.models.flight import FlightOffer


class DuffelClient:
    def __init__(self):
        self._base = settings.duffel_api_url
        self._headers = {
            "Authorization": f"Bearer {settings.duffel_api_key}",
            "Duffel-Version": settings.duffel_version,
            "Content-Type": "application/json",
        }

    async def search(
        self,
        origin: str,
        destination: str,
        departure_date: str,
        return_date: str,
        passengers: int = 1,
        cabin_class: str | None = None,
    ) -> list[FlightOffer]:
        payload: dict = {
            "data": {
                "slices": [
                    {"origin": origin, "destination": destination, "departure_date": departure_date},
                    {"origin": destination, "destination": origin, "departure_date": return_date},
                ],
                "passengers": [{"type": "adult"}] * passengers,
            }
        }
        if cabin_class:
            payload["data"]["cabin_class"] = cabin_class

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self._base}/air/offer_requests?return_offers=true",
                headers=self._headers,
                json=payload,
            )
            resp.raise_for_status()

        offers = resp.json().get("data", {}).get("offers", [])
        return [self._parse_offer(o) for o in offers]

    async def search_openjaw(
        self,
        origin: str,
        destination_in: str,
        destination_out: str,
        departure_date: str,
        return_date: str,
        passengers: int = 1,
    ) -> list[FlightOffer]:
        payload = {
            "data": {
                "slices": [
                    {"origin": origin, "destination": destination_in, "departure_date": departure_date},
                    {"origin": destination_out, "destination": origin, "departure_date": return_date},
                ],
                "passengers": [{"type": "adult"}] * passengers,
            }
        }

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.post(
                f"{self._base}/air/offer_requests?return_offers=true",
                headers=self._headers,
                json=payload,
            )
            resp.raise_for_status()

        offers = resp.json().get("data", {}).get("offers", [])
        return [self._parse_offer(o) for o in offers]

    def _parse_offer(self, o: dict) -> FlightOffer:
        slices = o.get("slices", [{}, {}])
        out_segs = slices[0].get("segments", [])
        ret_segs = slices[1].get("segments", []) if len(slices) > 1 else []

        def route(segs: list) -> str:
            return " → ".join(
                f"{s['origin']['iata_code']}-{s['destination']['iata_code']}" for s in segs
            )

        airlines = list({
            s["operating_carrier"]["name"]
            for sl in slices for s in sl.get("segments", [])
        })

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
