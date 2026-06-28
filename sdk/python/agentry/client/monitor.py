from __future__ import annotations

import atexit
import threading
from collections.abc import Mapping
from typing import Any

from agentry.config import AgentrySettings, load_settings
from agentry.context import ContextStore
from agentry.decorators import TraceHandle
from agentry.models import TraceRecord
from agentry.transport import BatchProcessor, HTTPTransport
from agentry.utils.logging import get_logger

logger = get_logger(__name__)

Metadata = Mapping[str, Any]


class AgentryMonitor:
    def __init__(self, settings: AgentrySettings | None = None) -> None:
        self._lock = threading.RLock()
        self._context_store = ContextStore()
        self._settings = settings or load_settings()
        self._batch_processor: BatchProcessor | None = None
        self._configuration_warning_emitted = False
        self._build_transport()
        atexit.register(self.shutdown)

    @property
    def settings(self) -> AgentrySettings:
        return self._settings

    @property
    def is_configured(self) -> bool:
        return self._settings.is_configured

    def configure(self, **overrides: Any) -> AgentryMonitor:
        with self._lock:
            updated_settings = AgentrySettings.model_validate(
                {
                    **self._settings.model_dump(),
                    **overrides,
                }
            )
            self._replace_settings(updated_settings)
        return self

    def configure_from_env(self) -> AgentryMonitor:
        with self._lock:
            self._replace_settings(load_settings(force_reload=True))
        return self

    def trace(
        self,
        name: str | None = None,
        *,
        metadata: Metadata | None = None,
    ) -> TraceHandle:
        return TraceHandle(
            monitor=self,
            kind="trace",
            name=name,
            metadata=dict(metadata or {}),
        )

    def span(
        self,
        name: str | None = None,
        *,
        metadata: Metadata | None = None,
    ) -> TraceHandle:
        return TraceHandle(
            monitor=self,
            kind="span",
            name=name,
            metadata=dict(metadata or {}),
        )

    def flush(self) -> None:
        if self._batch_processor is None:
            return

        self._batch_processor.flush()

    def shutdown(self) -> None:
        with self._lock:
            if self._batch_processor is None:
                return

            self._batch_processor.shutdown()
            self._batch_processor = None

    def current_trace_id(self) -> str | None:
        current_trace = self._context_store.current_trace()
        return current_trace.trace_id if current_trace else None

    def has_active_trace(self) -> bool:
        return self._context_store.current_trace() is not None

    def context_store(self) -> ContextStore:
        return self._context_store

    def record_trace(self, trace: TraceRecord) -> None:
        if self._batch_processor is None:
            self._warn_not_configured()
            return

        self._batch_processor.enqueue(trace)

    def _replace_settings(self, settings: AgentrySettings) -> None:
        self._settings = settings
        self._configuration_warning_emitted = False
        self.shutdown()
        self._build_transport()

    def _build_transport(self) -> None:
        if not self._settings.is_configured:
            self._batch_processor = None
            return

        transport = HTTPTransport(settings=self._settings)
        self._batch_processor = BatchProcessor(
            transport=transport,
            batch_size=self._settings.batch_size,
            flush_interval_seconds=self._settings.flush_interval_seconds,
            enabled=self._settings.enabled,
        )

    def _warn_not_configured(self) -> None:
        if self._configuration_warning_emitted:
            return

        self._configuration_warning_emitted = True
        logger.warning(
            "Agentry SDK is not configured. Set AGENTRY_API_URL and "
            "AGENTRY_API_KEY or call monitor.configure(...). Traces will be dropped."
        )


monitor = AgentryMonitor()

__all__ = ["AgentryMonitor", "monitor"]
