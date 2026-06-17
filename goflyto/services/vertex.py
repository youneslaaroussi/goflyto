import os
import httpx
import google.auth
import google.auth.transport.requests
from google.oauth2 import service_account
from goflyto.core.config import settings

_SCOPES = ["https://www.googleapis.com/auth/cloud-platform"]


class VertexAIClient:
    def __init__(self):
        self._endpoint = (
            f"https://{settings.gcp_location}-aiplatform.googleapis.com/v1"
            f"/projects/{settings.gcp_project}/locations/{settings.gcp_location}"
            f"/publishers/google/models/{settings.vertex_model}:generateContent"
        )
        sa_path = settings.google_application_credentials or os.getenv("GOOGLE_APPLICATION_CREDENTIALS", "")
        if sa_path and os.path.exists(sa_path):
            self._credentials = service_account.Credentials.from_service_account_file(
                sa_path, scopes=_SCOPES
            )
        else:
            self._credentials, _ = google.auth.default(scopes=_SCOPES)

    def _get_token(self) -> str:
        try:
            request = google.auth.transport.requests.Request()
            self._credentials.refresh(request)
            if self._credentials.token:
                return self._credentials.token
        except Exception:
            pass
        # Fallback to gcloud CLI token (dev environments)
        import subprocess
        result = subprocess.run(["gcloud", "auth", "print-access-token"], capture_output=True, text=True)
        return result.stdout.strip()

    async def chat(self, messages: list[dict]) -> str:
        contents = [
            {"role": m["role"], "parts": [{"text": m["content"]}]}
            for m in messages
        ]
        payload = {"contents": contents}

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                self._endpoint,
                headers={
                    "Authorization": f"Bearer {self._get_token()}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            resp.raise_for_status()

        return resp.json()["candidates"][0]["content"]["parts"][0]["text"]

    _CONSTRAINTS_SCHEMA = {
        "type": "OBJECT",
        "properties": {
            "origin_iata": {"type": "STRING"},
            "destination_iata_options": {"type": "ARRAY", "items": {"type": "STRING"}},
            "earliest_departure_date": {"type": "STRING"},
            "latest_departure_date": {"type": "STRING"},
            "min_trip_days": {"type": "INTEGER"},
            "max_trip_days": {"type": "INTEGER"},
            "budget_usd": {"type": "NUMBER"},
            "nonstop_preferred": {"type": "BOOLEAN"},
            "passport_nationality": {"type": "STRING"},
        },
    }

    async def extract_constraints(self, user_message: str) -> dict:
        import json
        from datetime import date

        system = (
            f"You are a flight search assistant. Extract travel constraints from the user's message. "
            f"Today is {date.today().isoformat()}. "
            "For destination_iata_options include all airport codes the user mentioned or implied. "
            "Use ISO 3166-1 alpha-2 for passport_nationality (e.g. CA, US, GB)."
        )
        contents = [
            {"role": "user", "parts": [{"text": f"{system}\n\nUser said: {user_message}"}]}
        ]
        payload = {
            "contents": contents,
            "generationConfig": {
                "response_mime_type": "application/json",
                "response_schema": self._CONSTRAINTS_SCHEMA,
            },
        }

        async with httpx.AsyncClient(timeout=60) as client:
            resp = await client.post(
                self._endpoint,
                headers={
                    "Authorization": f"Bearer {self._get_token()}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
            resp.raise_for_status()

        text = resp.json()["candidates"][0]["content"]["parts"][0]["text"]
        return json.loads(text)
