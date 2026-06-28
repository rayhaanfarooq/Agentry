from __future__ import annotations

import os
from functools import lru_cache
from pathlib import Path

from dotenv import load_dotenv
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator

PROJECT_ROOT = Path(__file__).resolve().parents[2]
load_dotenv(PROJECT_ROOT / ".env")


class Settings(BaseModel):
    model_config = ConfigDict(extra="ignore", populate_by_name=True)

    gemini_api_key: str = Field(alias="GEMINI_API_KEY")
    agentry_api_url: HttpUrl = Field(alias="AGENTRY_API_URL")
    agentry_api_key: str = Field(alias="AGENTRY_API_KEY")
    gemini_model: str = "gemini-2.5-flash"

    @field_validator("gemini_api_key", "agentry_api_key", mode="before")
    @classmethod
    def validate_api_keys(cls, value: str) -> str:
        normalized_value = value.strip()

        if not normalized_value:
            raise ValueError("API keys cannot be empty.")

        placeholder_values = {
            "your-gemini-api-key",
            "your-agentry-api-key",
        }
        if normalized_value in placeholder_values:
            raise ValueError("API keys still contain placeholder values.")

        return normalized_value

    @field_validator("gemini_model", mode="before")
    @classmethod
    def validate_gemini_model(cls, value: str) -> str:
        normalized_value = value.strip()

        if not normalized_value:
            raise ValueError("Gemini model cannot be empty.")

        return normalized_value


@lru_cache
def get_settings() -> Settings:
    return Settings.model_validate(os.environ)
