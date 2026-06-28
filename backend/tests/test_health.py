from collections.abc import Awaitable, Callable
from dataclasses import dataclass
from typing import cast

import httpx
from app.core.config import Settings
from app.integrations.supabase.client import SupabaseProjectClient
from app.repositories.health import HealthRepository
from app.services.health import HealthService
from sqlalchemy.exc import SQLAlchemyError


@dataclass
class StubHealthRepository:
    ping_callable: Callable[[], Awaitable[bool]]

    async def ping(self) -> bool:
        return await self.ping_callable()


@dataclass
class StubSupabaseProjectClient:
    ping_callable: Callable[[], Awaitable[bool]]

    async def ping(self) -> bool:
        return await self.ping_callable()


async def test_health_service_returns_healthy_when_all_checks_succeed(
    backend_settings: Settings,
) -> None:
    async def ping() -> bool:
        return True

    service = HealthService(
        repository=cast(
            HealthRepository,
            StubHealthRepository(ping_callable=ping),
        ),
        supabase_client=cast(
            SupabaseProjectClient,
            StubSupabaseProjectClient(ping_callable=ping),
        ),
        settings=backend_settings,
    )

    response, status_code = await service.check()

    assert response.status == "healthy"
    assert response.api == "healthy"
    assert response.database == "connected"
    assert response.supabase == "connected"
    assert response.version == backend_settings.app_version
    assert status_code == 200


async def test_health_service_returns_unhealthy_when_database_ping_is_false(
    backend_settings: Settings,
) -> None:
    async def database_ping() -> bool:
        return False

    async def supabase_ping() -> bool:
        return True

    service = HealthService(
        repository=cast(
            HealthRepository,
            StubHealthRepository(ping_callable=database_ping),
        ),
        supabase_client=cast(
            SupabaseProjectClient,
            StubSupabaseProjectClient(ping_callable=supabase_ping),
        ),
        settings=backend_settings,
    )

    response, status_code = await service.check()

    assert response.status == "unhealthy"
    assert response.api == "healthy"
    assert response.database == "disconnected"
    assert response.supabase == "connected"
    assert response.version == backend_settings.app_version
    assert status_code == 503


async def test_health_service_returns_unhealthy_on_database_exception(
    backend_settings: Settings,
) -> None:
    async def database_ping() -> bool:
        raise SQLAlchemyError("database unavailable")

    async def supabase_ping() -> bool:
        return True

    service = HealthService(
        repository=cast(
            HealthRepository,
            StubHealthRepository(ping_callable=database_ping),
        ),
        supabase_client=cast(
            SupabaseProjectClient,
            StubSupabaseProjectClient(ping_callable=supabase_ping),
        ),
        settings=backend_settings,
    )

    response, status_code = await service.check()

    assert response.status == "unhealthy"
    assert response.api == "healthy"
    assert response.database == "disconnected"
    assert response.supabase == "connected"
    assert response.version == backend_settings.app_version
    assert status_code == 503


async def test_health_service_returns_unhealthy_on_supabase_exception(
    backend_settings: Settings,
) -> None:
    async def database_ping() -> bool:
        return True

    async def supabase_ping() -> bool:
        raise httpx.ConnectError("supabase unavailable")

    service = HealthService(
        repository=cast(
            HealthRepository,
            StubHealthRepository(ping_callable=database_ping),
        ),
        supabase_client=cast(
            SupabaseProjectClient,
            StubSupabaseProjectClient(ping_callable=supabase_ping),
        ),
        settings=backend_settings,
    )

    response, status_code = await service.check()

    assert response.status == "unhealthy"
    assert response.api == "healthy"
    assert response.database == "connected"
    assert response.supabase == "disconnected"
    assert response.version == backend_settings.app_version
    assert status_code == 503
