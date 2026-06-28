from __future__ import annotations

import asyncio
from http import HTTPStatus
from typing import Literal

import httpx
from sqlalchemy.exc import SQLAlchemyError

from app.core.config import Settings
from app.core.logging import get_logger
from app.integrations.supabase.client import SupabaseProjectClient
from app.repositories.health import HealthRepository
from app.schemas.health import HealthResponse

logger = get_logger(__name__)


class HealthService:
    def __init__(
        self,
        repository: HealthRepository,
        supabase_client: SupabaseProjectClient,
        settings: Settings,
    ) -> None:
        self.repository = repository
        self.supabase_client = supabase_client
        self.settings = settings

    async def _check_database(self) -> bool:
        try:
            return await self.repository.ping()
        except SQLAlchemyError as error:
            logger.warning(
                "Database connectivity check failed with %s: %s.",
                error.__class__.__name__,
                error,
            )
            return False
        except Exception as error:
            logger.warning(
                "Database health check returned an unhealthy response due to %s: %s.",
                error.__class__.__name__,
                error,
            )
            return False

    async def _check_supabase(self) -> bool:
        try:
            return await self.supabase_client.ping()
        except httpx.HTTPError as error:
            logger.warning(
                "Supabase connectivity check failed with %s: %s.",
                error.__class__.__name__,
                error,
            )
            return False
        except Exception as error:
            logger.warning(
                "Supabase health check returned an unhealthy response due to %s: %s.",
                error.__class__.__name__,
                error,
            )
            return False

    def _build_response(
        self,
        *,
        database_is_connected: bool,
        supabase_is_connected: bool,
    ) -> tuple[HealthResponse, int]:
        overall_status: Literal["healthy", "unhealthy"] = (
            "healthy"
            if database_is_connected and supabase_is_connected
            else "unhealthy"
        )

        return (
            HealthResponse(
                status=overall_status,
                api="healthy",
                database="connected" if database_is_connected else "disconnected",
                supabase="connected" if supabase_is_connected else "disconnected",
                version=self.settings.app_version,
            ),
            (
                HTTPStatus.OK
                if overall_status == "healthy"
                else HTTPStatus.SERVICE_UNAVAILABLE
            ),
        )

    async def check(self) -> tuple[HealthResponse, int]:
        database_is_connected, supabase_is_connected = await asyncio.gather(
            self._check_database(),
            self._check_supabase(),
        )

        return self._build_response(
            database_is_connected=database_is_connected,
            supabase_is_connected=supabase_is_connected,
        )
