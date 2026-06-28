from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.dependencies.config import SettingsDependency
from app.integrations.supabase.client import SupabaseProjectClient


def get_supabase_project_client(
    settings: SettingsDependency,
) -> SupabaseProjectClient:
    return SupabaseProjectClient(settings=settings)


SupabaseProjectClientDependency = Annotated[
    SupabaseProjectClient,
    Depends(get_supabase_project_client),
]

__all__ = [
    "SupabaseProjectClientDependency",
    "get_supabase_project_client",
]
