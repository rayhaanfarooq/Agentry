from __future__ import annotations

import httpx

from app.core.config import Settings


class SupabaseProjectClient:
    """Lightweight infrastructure client for Supabase project checks."""

    def __init__(self, settings: Settings, timeout_seconds: float = 5.0) -> None:
        self.settings = settings
        self.timeout_seconds = timeout_seconds

    def _headers(self) -> dict[str, str]:
        anon_key = self.settings.supabase_anon_key.get_secret_value()
        service_role_key = self.settings.supabase_service_role_key.get_secret_value()
        return {
            "Accept": "application/json",
            "apikey": anon_key,
            "Authorization": f"Bearer {service_role_key}",
        }

    async def ping(self) -> bool:
        async with httpx.AsyncClient(timeout=self.timeout_seconds) as client:
            response = await client.get(
                self.settings.supabase_auth_settings_url,
                headers=self._headers(),
            )
            response.raise_for_status()

        return True
