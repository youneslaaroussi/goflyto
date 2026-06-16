"""
Central error handling. All exceptions funnel through here before reaching
the client. Internal details (stack traces, DB errors, provider messages)
are logged server-side and never forwarded to the browser.
"""
import logging
from enum import Enum

from fastapi import Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel

log = logging.getLogger("goflyto")


class ErrorCode(str, Enum):
    NO_FLIGHTS_FOUND = "NO_FLIGHTS_FOUND"
    SEARCH_TIMEOUT = "SEARCH_TIMEOUT"
    NETWORK_OFFLINE = "NETWORK_OFFLINE"
    AI_PARSE_FAILED = "AI_PARSE_FAILED"
    INVALID_ROUTE = "INVALID_ROUTE"
    SERVICE_UNAVAILABLE = "SERVICE_UNAVAILABLE"
    UNKNOWN = "UNKNOWN"


class ErrorBody(BaseModel):
    code: ErrorCode
    message: str
    hint: str
    retryable: bool


# ── Domain exceptions ────────────────────────────────────────────────────────

class AppError(Exception):
    """Raise this anywhere in the app to produce a clean client error."""
    def __init__(self, code: ErrorCode, message: str, hint: str, retryable: bool):
        super().__init__(message)
        self.body = ErrorBody(code=code, message=message, hint=hint, retryable=retryable)


# Convenience constructors
def no_flights_found() -> AppError:
    return AppError(
        ErrorCode.NO_FLIGHTS_FOUND,
        "No flights found for this route",
        "Try widening your date range, adjusting trip length, or searching a nearby airport.",
        retryable=False,
    )

def ai_parse_failed() -> AppError:
    return AppError(
        ErrorCode.AI_PARSE_FAILED,
        "We couldn't understand your request",
        "Try being more specific — include airports (e.g. YUL, CMN), dates, and trip length.",
        retryable=False,
    )

def invalid_route(detail: str = "") -> AppError:
    return AppError(
        ErrorCode.INVALID_ROUTE,
        "This route combination is not available",
        "Double-check the airport codes or try a nearby airport.",
        retryable=False,
    )

def service_unavailable() -> AppError:
    return AppError(
        ErrorCode.SERVICE_UNAVAILABLE,
        "Flight data is temporarily unavailable",
        "Our data provider is experiencing issues. Please try again shortly.",
        retryable=True,
    )

def search_timeout() -> AppError:
    return AppError(
        ErrorCode.SEARCH_TIMEOUT,
        "The search took too long",
        "Our servers are busy. Try again in a moment, or narrow your date range.",
        retryable=True,
    )


# ── FastAPI exception handlers ───────────────────────────────────────────────

def _error_response(body: ErrorBody, status: int = 400) -> JSONResponse:
    return JSONResponse(status_code=status, content=body.model_dump())


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    log.warning("AppError %s: %s", exc.body.code, exc.__cause__ or exc)
    return _error_response(exc.body)


async def unhandled_error_handler(request: Request, exc: Exception) -> JSONResponse:
    log.exception("Unhandled error on %s %s", request.method, request.url.path)
    body = ErrorBody(
        code=ErrorCode.UNKNOWN,
        message="Something went wrong",
        hint="Please try again. If the problem persists, check back later.",
        retryable=True,
    )
    return _error_response(body, status=500)
