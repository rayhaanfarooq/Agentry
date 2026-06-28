from __future__ import annotations

from app.core.config import Settings


class SupabaseStorageGateway:
    """Future integration point for Supabase Storage-backed uploads."""

    def __init__(self, settings: Settings) -> None:
        self.settings = settings

    @property
    def base_url(self) -> str:
        return f"{self.settings.supabase_url}/storage/v1"

    @property
    def service_role_token(self) -> str:
        return self.settings.supabase_service_role_key.get_secret_value()
