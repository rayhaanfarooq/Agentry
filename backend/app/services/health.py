from __future__ import annotations

from http import HTTPStatus

from sqlalchemy import text

from app.db.session import engine
from app.schemas.health import HealthResponse


class HealthService:
    async def check(self) -> tuple[HealthResponse, int]:
        try:
            async with engine.connect() as connection:
                await connection.execute(text("SELECT 1"))
        except Exception:
            return (
                HealthResponse(status="unhealthy", database="disconnected"),
                HTTPStatus.SERVICE_UNAVAILABLE,
            )

        return (
            HealthResponse(status="healthy", database="connected"),
            HTTPStatus.OK,
        )


health_service = HealthService()
