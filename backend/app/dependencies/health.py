from typing import Annotated

from fastapi import Depends

from app.dependencies.config import SettingsDependency
from app.dependencies.database import DatabaseSession
from app.dependencies.supabase import SupabaseProjectClientDependency
from app.repositories.health import HealthRepository
from app.services.health import HealthService


def get_health_repository(session: DatabaseSession) -> HealthRepository:
    return HealthRepository(session=session)


HealthRepositoryDependency = Annotated[HealthRepository, Depends(get_health_repository)]


def get_health_service(
    settings: SettingsDependency,
    repository: HealthRepositoryDependency,
    supabase_client: SupabaseProjectClientDependency,
) -> HealthService:
    return HealthService(
        repository=repository,
        supabase_client=supabase_client,
        settings=settings,
    )


HealthServiceDependency = Annotated[HealthService, Depends(get_health_service)]

__all__ = [
    "HealthRepositoryDependency",
    "HealthServiceDependency",
    "get_health_repository",
    "get_health_service",
]
