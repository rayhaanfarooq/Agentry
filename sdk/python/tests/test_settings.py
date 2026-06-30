from pytest import MonkeyPatch
from runloop.config import RunloopSettings, load_settings


def test_settings_consider_env_configuration_optional() -> None:
    settings = RunloopSettings()

    assert settings.is_configured is False
    assert settings.endpoint_path == "/v1/traces"


def test_load_settings_reads_environment(monkeypatch: MonkeyPatch) -> None:
    monkeypatch.setenv("RUNLOOP_API_URL", "http://localhost:8000")
    monkeypatch.setenv("RUNLOOP_API_KEY", "secret")
    monkeypatch.setenv("RUNLOOP_SERVICE_NAME", "sdk-tests")

    settings = load_settings(force_reload=True)

    assert settings.api_url == "http://localhost:8000"
    assert settings.api_key == "secret"
    assert settings.service_name == "sdk-tests"
    assert settings.is_configured is True
