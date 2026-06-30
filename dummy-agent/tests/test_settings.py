import pytest
from agent.config.settings import Settings
from pydantic import ValidationError


def test_settings_require_all_environment_values() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate({})


def test_settings_reject_placeholder_keys() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate(
            {
                "GEMINI_API_KEY": "your-gemini-api-key",
                "RUNLOOP_API_URL": "http://localhost:8000",
                "RUNLOOP_API_KEY": "your-runloop-api-key",
            }
        )


def test_settings_accept_valid_values() -> None:
    settings = Settings.model_validate(
        {
            "GEMINI_API_KEY": "real-gemini-key",
            "RUNLOOP_API_URL": "http://localhost:8000",
            "RUNLOOP_API_KEY": "real-runloop-key",
        }
    )

    assert settings.gemini_model == "gemini-2.5-flash"
