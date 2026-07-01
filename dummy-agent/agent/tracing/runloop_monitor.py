from __future__ import annotations

import os

from runloop import monitor

from agent.config.settings import Settings


def configure_monitor(settings: Settings) -> None:
    service_name = os.getenv("RUNLOOP_SERVICE_NAME", "dummy-agent").strip()
    environment = os.getenv("RUNLOOP_ENVIRONMENT", "development").strip()

    monitor.configure(
        api_url=str(settings.runloop_api_url),
        api_key=settings.runloop_api_key,
        service_name=service_name or "dummy-agent",
        environment=environment or "development",
    )


def flush_monitor() -> None:
    monitor.flush()
