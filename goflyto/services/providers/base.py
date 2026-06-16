from abc import ABC, abstractmethod
from pydantic import BaseModel
from goflyto.models.flight import FlightOffer


class FlightQuery(BaseModel):
    origin: str
    destination: str
    departure_date: str
    return_date: str
    passengers: int = 1
    cabin_class: str | None = None


class OpenJawQuery(BaseModel):
    origin: str
    destination_in: str
    destination_out: str
    departure_date: str
    return_date: str
    passengers: int = 1


class FlightProvider(ABC):

    @property
    @abstractmethod
    def name(self) -> str: ...

    @abstractmethod
    async def search(self, query: FlightQuery) -> list[FlightOffer]: ...

    @abstractmethod
    async def search_openjaw(self, query: OpenJawQuery) -> list[FlightOffer]: ...
