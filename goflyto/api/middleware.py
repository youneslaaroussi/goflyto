import time
import uuid

import structlog
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

log = structlog.get_logger("goflyto.http")


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        request_id = request.headers.get("x-request-id") or uuid.uuid4().hex[:12]
        structlog.contextvars.clear_contextvars()
        structlog.contextvars.bind_contextvars(request_id=request_id)

        t0 = time.perf_counter()
        log.info(
            "request_started",
            method=request.method,
            path=request.url.path,
        )

        response = await call_next(request)

        ms = (time.perf_counter() - t0) * 1000
        log.info(
            "request_finished",
            method=request.method,
            path=request.url.path,
            status=response.status_code,
            duration_ms=round(ms, 1),
        )
        response.headers["x-request-id"] = request_id
        return response
