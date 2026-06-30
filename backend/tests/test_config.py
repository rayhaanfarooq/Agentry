import pytest
from app.core.config import Settings
from pydantic import ValidationError


def test_settings_reject_placeholder_database_url() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate(
            {
                "DATABASE_URL": "postgresql://postgres:password@db.example.supabase.co:5432/postgres",
                "SUPABASE_URL": "http://127.0.0.1:54321",
                "SUPABASE_ANON_KEY": "local-anon-key",
                "SUPABASE_SERVICE_ROLE_KEY": "local-service-role-key",
            }
        )


def test_settings_reject_placeholder_supabase_url() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate(
            {
                "DATABASE_URL": "postgresql://postgres:password@localhost:5432/runloop",
                "SUPABASE_URL": "https://your-project.supabase.co",
                "SUPABASE_ANON_KEY": "local-anon-key",
                "SUPABASE_SERVICE_ROLE_KEY": "local-service-role-key",
            }
        )


@pytest.mark.parametrize(
    ("field_name", "value"),
    [
        ("SUPABASE_ANON_KEY", "your-anon-key"),
        ("SUPABASE_SERVICE_ROLE_KEY", "your-service-role-key"),
    ],
)
def test_settings_reject_placeholder_supabase_keys(
    field_name: str,
    value: str,
) -> None:
    settings_input = {
        "DATABASE_URL": "postgresql://postgres:password@localhost:5432/runloop",
        "SUPABASE_URL": "http://127.0.0.1:54321",
        "SUPABASE_ANON_KEY": "local-anon-key",
        "SUPABASE_SERVICE_ROLE_KEY": "local-service-role-key",
    }
    settings_input[field_name] = value

    with pytest.raises(ValidationError):
        Settings.model_validate(settings_input)


def test_settings_build_async_database_url_from_standard_postgres_url() -> None:
    settings = Settings.model_validate(
        {
            "DATABASE_URL": "postgresql://postgres:password@localhost:5432/runloop",
            "SUPABASE_URL": "http://127.0.0.1:54321",
            "SUPABASE_ANON_KEY": "local-anon-key",
            "SUPABASE_SERVICE_ROLE_KEY": "local-service-role-key",
        }
    )

    assert settings.async_database_url == (
        "postgresql+asyncpg://postgres:password@localhost:5432/runloop"
    )
