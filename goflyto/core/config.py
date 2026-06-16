from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    gcp_project: str = "vidovaai"
    gcp_location: str = "us-central1"
    vertex_model: str = "gemini-2.5-flash"

    duffel_api_key: str = ""
    duffel_api_url: str = "https://api.duffel.com"
    duffel_version: str = "v2"

    google_application_credentials: str = ""

    database_url: str = "postgresql+asyncpg://goflyto:goflyto@localhost:5432/goflyto"
    redis_url: str = "redis://localhost:6379/0"

    class Config:
        env_file = ".env"


settings = Settings()


settings = Settings()
