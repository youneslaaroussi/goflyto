from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from goflyto.api.errors import AppError, app_error_handler, unhandled_error_handler
from goflyto.api.routes import search

app = FastAPI(title="GoFlyTo", docs_url=None, redoc_url=None)  # hide docs in prod

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # tightened to Vite dev server only
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)

app.add_exception_handler(AppError, app_error_handler)          # type: ignore[arg-type]
app.add_exception_handler(Exception, unhandled_error_handler)   # type: ignore[arg-type]

app.include_router(search.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
