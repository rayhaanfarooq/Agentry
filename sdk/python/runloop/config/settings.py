from __future__ import annotations

import os
from functools import lru_cache

from pydantic import BaseModel, ConfigDict, Field, field_validator


class RunloopSettings(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    api_url: str | None = Field(default=None, alias="RUNLOOP_API_URL")
    api_key: str | None = Field(default=None, alias="RUNLOOP_API_KEY")
    service_name: str = Field(
        default="python-application",
        alias="RUNLOOP_SERVICE_NAME",
    )
    environment: str = Field(default="development", alias="RUNLOOP_ENVIRONMENT")
    endpoint_path: str = Field(default="/v1/traces", alias="RUNLOOP_ENDPOINT_PATH")
    enabled: bool = Field(default=True, alias="RUNLOOP_ENABLED")
    batch_size: int = Field(default=25, alias="RUNLOOP_BATCH_SIZE")
    flush_interval_seconds: float = Field(
        default=5.0,
        alias="RUNLOOP_FLUSH_INTERVAL_SECONDS",
    )
    request_timeout_seconds: float = Field(
        default=5.0,
        alias="RUNLOOP_REQUEST_TIMEOUT_SECONDS",
    )
    max_retries: int = Field(default=3, alias="RUNLOOP_MAX_RETRIES")
    initial_backoff_seconds: float = Field(
        default=0.5,
        alias="RUNLOOP_INITIAL_BACKOFF_SECONDS",
    )
    max_backoff_seconds: float = Field(
        default=5.0,
        alias="RUNLOOP_MAX_BACKOFF_SECONDS",
    )

    @field_validator("api_url", mode="before")
    @classmethod
    def normalize_api_url(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip().rstrip("/")
        return normalized_value or None

    @field_validator("api_key", mode="before")
    @classmethod
    def normalize_api_key(cls, value: str | None) -> str | None:
        if value is None:
            return None

        normalized_value = value.strip()
        return normalized_value or None

    @field_validator("service_name", "environment", mode="before")
    @classmethod
    def strip_required_strings(cls, value: str) -> str:
        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("Configuration values cannot be empty strings.")
        return normalized_value

    @field_validator("endpoint_path", mode="before")
    @classmethod
    def normalize_endpoint_path(cls, value: str) -> str:
        normalized_value = value.strip()
        if not normalized_value:
            raise ValueError("RUNLOOP_ENDPOINT_PATH cannot be empty.")
        if normalized_value.startswith("/"):
            return normalized_value
        return f"/{normalized_value}"

    @field_validator("batch_size")
    @classmethod
    def validate_batch_size(cls, value: int) -> int:
        if value <= 0:
            raise ValueError("RUNLOOP_BATCH_SIZE must be greater than zero.")
        return value

    @field_validator(
        "flush_interval_seconds",
        "request_timeout_seconds",
        "initial_backoff_seconds",
        "max_backoff_seconds",
    )
    @classmethod
    def validate_positive_floats(cls, value: float) -> float:
        if value <= 0:
            raise ValueError("Timing configuration values must be greater than zero.")
        return value

    @field_validator("max_retries")
    @classmethod
    def validate_max_retries(cls, value: int) -> int:
        if value < 1:
            raise ValueError("RUNLOOP_MAX_RETRIES must be at least 1.")
        return value

    @property
    def is_configured(self) -> bool:
        if not self.enabled:
            return False

        return bool(self.api_url and self.api_key)

    @property
    def traces_endpoint(self) -> str:
        if not self.api_url:
            raise ValueError("RUNLOOP_API_URL is not configured.")
        return f"{self.api_url}{self.endpoint_path}"


@lru_cache
def _cached_settings() -> RunloopSettings:
    return RunloopSettings.model_validate(os.environ)


def load_settings(*, force_reload: bool = False) -> RunloopSettings:
    if force_reload:
        _cached_settings.cache_clear()
    return _cached_settings()
