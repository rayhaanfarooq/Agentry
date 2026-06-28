from typing import Literal

from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Response payload for backend, database, and Supabase health checks."""

    status: Literal["healthy", "unhealthy"]
    api: Literal["healthy", "unhealthy"]
    database: Literal["connected", "disconnected"]
    supabase: Literal["connected", "disconnected"]
    version: str = Field(description="Currently deployed backend version.")
