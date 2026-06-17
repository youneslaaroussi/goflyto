from goflyto.core.logging import configure as configure_logging
configure_logging()  # must be first — before any other import that logs

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from goflyto.api.errors import AppError, app_error_handler, unhandled_error_handler
from goflyto.api.middleware import LoggingMiddleware
from goflyto.api.routes import search

app = FastAPI(title="GoFlyTo", docs_url=None, redoc_url=None)

app.add_middleware(LoggingMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.add_exception_handler(AppError, app_error_handler)          # type: ignore[arg-type]
app.add_exception_handler(Exception, unhandled_error_handler)   # type: ignore[arg-type]

app.include_router(search.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
