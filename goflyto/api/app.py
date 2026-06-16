from fastapi import FastAPI
from goflyto.api.routes import search

app = FastAPI(title="GoFlyTo", description="Agentic flight optimizer", version="0.1.0")

app.include_router(search.router)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}
