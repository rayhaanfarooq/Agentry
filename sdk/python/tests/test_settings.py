from agentry.config import AgentrySettings, load_settings
from pytest import MonkeyPatch


def test_settings_consider_env_configuration_optional() -> None:
    settings = AgentrySettings()

    assert settings.is_configured is False
    assert settings.endpoint_path == "/v1/traces"


def test_load_settings_reads_environment(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setenv("AGENTRY_API_URL", "http://localhost:8000")
    monkeypatch.setenv("AGENTRY_API_KEY", "secret")
    monkeypatch.setenv("AGENTRY_SERVICE_NAME", "sdk-tests")

    settings = load_settings(force_reload=True)

    assert settings.api_url == "http://localhost:8000"
    assert settings.api_key == "secret"
    assert settings.service_name == "sdk-tests"
    assert settings.is_configured is True
