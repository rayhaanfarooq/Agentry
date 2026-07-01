import pytest
from app.core.config import Settings
from pydantic import ValidationError

HOSTED_DATABASE_URL = (
    "postgresql://postgres:password@db.test-project.supabase.co:5432/postgres"
)
HOSTED_SUPABASE_URL = "https://test-project.supabase.co"
HOSTED_SUPABASE_KEYS = {
    "SUPABASE_ANON_KEY": "sb_publishable_test_key",
    "SUPABASE_SERVICE_ROLE_KEY": "sb_secret_test_key",
}


def test_settings_reject_placeholder_database_url() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate(
            {
                "DATABASE_URL": "postgresql://postgres:password@db.example.supabase.co:5432/postgres",
                "SUPABASE_URL": HOSTED_SUPABASE_URL,
                **HOSTED_SUPABASE_KEYS,
            }
        )


def test_settings_reject_placeholder_supabase_url() -> None:
    with pytest.raises(ValidationError):
        Settings.model_validate(
            {
                "DATABASE_URL": HOSTED_DATABASE_URL,
                "SUPABASE_URL": "https://your-project.supabase.co",
                **HOSTED_SUPABASE_KEYS,
            }
        )


def test_settings_reject_local_supabase_database_url() -> None:
    with pytest.raises(ValidationError) as error:
        Settings.model_validate(
            {
                "DATABASE_URL": "postgresql://postgres:postgres@127.0.0.1:54322/postgres",
                "SUPABASE_URL": HOSTED_SUPABASE_URL,
                **HOSTED_SUPABASE_KEYS,
            }
        )

    assert "hosted Supabase only" in str(error.value)


def test_settings_reject_local_supabase_url() -> None:
    with pytest.raises(ValidationError) as error:
        Settings.model_validate(
            {
                "DATABASE_URL": HOSTED_DATABASE_URL,
                "SUPABASE_URL": "http://127.0.0.1:54321",
                **HOSTED_SUPABASE_KEYS,
            }
        )

    assert "hosted Supabase only" in str(error.value)


def test_settings_require_https_supabase_url() -> None:
    with pytest.raises(ValidationError) as error:
        Settings.model_validate(
            {
                "DATABASE_URL": HOSTED_DATABASE_URL,
                "SUPABASE_URL": "http://test-project.supabase.co",
                **HOSTED_SUPABASE_KEYS,
            }
        )

    assert "hosted HTTPS URL" in str(error.value)


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
        "DATABASE_URL": HOSTED_DATABASE_URL,
        "SUPABASE_URL": HOSTED_SUPABASE_URL,
        **HOSTED_SUPABASE_KEYS,
    }
    settings_input[field_name] = value

    with pytest.raises(ValidationError):
        Settings.model_validate(settings_input)


def test_settings_build_async_database_url_from_standard_postgres_url() -> None:
    settings = Settings.model_validate(
        {
            "DATABASE_URL": HOSTED_DATABASE_URL,
            "SUPABASE_URL": HOSTED_SUPABASE_URL,
            **HOSTED_SUPABASE_KEYS,
        }
    )

    assert settings.async_database_url == (
        "postgresql+asyncpg://postgres:password@db.test-project.supabase.co:5432/postgres"
    )
