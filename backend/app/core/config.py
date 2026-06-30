from __future__ import annotations

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import AliasChoices, Field, SecretStr, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

DEFAULT_CORS_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:4173",
    "http://127.0.0.1:4173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    app_name: str = Field(
        default="Runloop",
        validation_alias=AliasChoices("APP_NAME"),
    )
    app_version: str = Field(
        default="0.0.1",
        validation_alias=AliasChoices("APP_VERSION"),
    )
    environment: Literal["development", "staging", "production"] = Field(
        default="development",
        validation_alias=AliasChoices("ENVIRONMENT", "APP_ENV"),
    )
    log_level: Literal["DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"] = Field(
        default="INFO",
        validation_alias=AliasChoices("LOG_LEVEL"),
    )
    cors_origins: Annotated[list[str], NoDecode] = Field(
        default_factory=lambda: DEFAULT_CORS_ORIGINS.copy(),
        validation_alias=AliasChoices("CORS_ORIGINS"),
    )

    database_url: str = Field(validation_alias=AliasChoices("DATABASE_URL"))
    supabase_url: str = Field(validation_alias=AliasChoices("SUPABASE_URL"))
    supabase_anon_key: SecretStr = Field(
        validation_alias=AliasChoices("SUPABASE_ANON_KEY"),
    )
    supabase_service_role_key: SecretStr = Field(
        validation_alias=AliasChoices("SUPABASE_SERVICE_ROLE_KEY"),
    )

    @field_validator("cors_origins", mode="before")
    @classmethod
    def parse_cors_origins(cls, value: str | list[str]) -> list[str]:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @field_validator("environment", mode="before")
    @classmethod
    def normalize_environment(cls, value: str) -> str:
        return value.lower()

    @field_validator("log_level", mode="before")
    @classmethod
    def normalize_log_level(cls, value: str) -> str:
        return value.upper()

    @field_validator("database_url", mode="before")
    @classmethod
    def validate_database_url(cls, value: str) -> str:
        normalized_value = value.strip()

        if not normalized_value:
            raise ValueError("DATABASE_URL cannot be empty.")

        if "db.example.supabase.co" in normalized_value:
            raise ValueError(
                "DATABASE_URL is still using the placeholder Supabase host "
                "from .env.example."
            )

        return normalized_value

    @field_validator("supabase_url", mode="before")
    @classmethod
    def validate_supabase_url(cls, value: str) -> str:
        normalized_value = value.strip().rstrip("/")

        if not normalized_value:
            raise ValueError("SUPABASE_URL cannot be empty.")

        if "your-project.supabase.co" in normalized_value:
            raise ValueError(
                "SUPABASE_URL is still using the placeholder host from .env.example."
            )

        return normalized_value

    @field_validator("supabase_anon_key", "supabase_service_role_key", mode="before")
    @classmethod
    def validate_supabase_keys(cls, value: str | SecretStr) -> str:
        normalized_value = (
            value.get_secret_value() if isinstance(value, SecretStr) else value
        ).strip()

        if not normalized_value:
            raise ValueError("Supabase API keys cannot be empty.")

        if normalized_value in {"your-anon-key", "your-service-role-key"}:
            raise ValueError(
                "Supabase API keys are still using placeholder values from "
                ".env.example."
            )

        return normalized_value

    @property
    def async_database_url(self) -> str:
        if self.database_url.startswith("postgresql+asyncpg://"):
            return self.database_url
        if self.database_url.startswith("postgres://"):
            return self.database_url.replace("postgres://", "postgresql+asyncpg://", 1)
        if self.database_url.startswith("postgresql://"):
            return self.database_url.replace(
                "postgresql://",
                "postgresql+asyncpg://",
                1,
            )
        return self.database_url

    @property
    def supabase_auth_settings_url(self) -> str:
        return f"{self.supabase_url}/auth/v1/settings"

    @property
    def is_production(self) -> bool:
        return self.environment == "production"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]
