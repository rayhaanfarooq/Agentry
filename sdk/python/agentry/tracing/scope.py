from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from types import TracebackType
from typing import Any, Literal

from agentry.context.state import SpanActivation, TraceActivation
from agentry.models import ErrorInfo, SpanRecord, TraceRecord, TraceStatus
from agentry.tracing.runtime import ActiveSpan, ActiveTrace
from agentry.utils.ids import generate_span_id, generate_trace_id
from agentry.utils.time import duration_ms, utc_now, utc_now_iso


@dataclass
class ManagedScope:
    monitor: Any
    kind: str
    name: str
    metadata: dict[str, Any]
    _started_at: datetime | None = None
    _active_trace: ActiveTrace | None = None
    _active_span: ActiveSpan | None = None
    _trace_activation: TraceActivation | None = None
    _span_activation: SpanActivation | None = None
    _effective_kind: str | None = None

    def __enter__(self) -> ManagedScope:
        self._started_at = utc_now()
        current_trace = self.monitor.context_store().current_trace()

        if self.kind == "span" and current_trace is None:
            self._effective_kind = "trace"
        else:
            self._effective_kind = self.kind

        if self._effective_kind == "trace":
            self._active_trace = ActiveTrace(
                trace_id=generate_trace_id(),
                name=self.name,
                started_at=self._started_at,
                metadata=dict(self.metadata),
            )
            self._trace_activation = self.monitor.context_store().activate_trace(
                self._active_trace
            )
            return self

        if current_trace is None:
            raise RuntimeError("Cannot create a span without an active trace.")

        parent_span = self.monitor.context_store().current_span()
        self._active_span = ActiveSpan(
            span_id=generate_span_id(),
            trace_id=current_trace.trace_id,
            parent_span_id=parent_span.span_id if parent_span else None,
            name=self.name,
            started_at=self._started_at,
            metadata=dict(self.metadata),
        )
        self._span_activation = self.monitor.context_store().activate_span(
            self._active_span
        )
        return self

    def __exit__(
        self,
        exc_type: type[BaseException] | None,
        exc: BaseException | None,
        tb: TracebackType | None,
    ) -> Literal[False]:
        ended_at = utc_now()
        error = self._build_error(exc)
        status: TraceStatus = "error" if error is not None else "ok"

        if self._effective_kind == "span" and self._active_span is not None:
            current_trace = self.monitor.context_store().current_trace()
            if current_trace is not None:
                current_trace.spans.append(
                    SpanRecord(
                        span_id=self._active_span.span_id,
                        trace_id=self._active_span.trace_id,
                        parent_span_id=self._active_span.parent_span_id,
                        name=self._active_span.name,
                        started_at=utc_now_iso(self._active_span.started_at),
                        ended_at=utc_now_iso(ended_at),
                        duration_ms=duration_ms(self._active_span.started_at, ended_at),
                        status=status,
                        metadata=self._active_span.metadata,
                        error=error,
                    )
                )

            if self._span_activation is not None:
                self.monitor.context_store().deactivate_span(self._span_activation)

            return False

        if self._active_trace is not None:
            trace_record = TraceRecord(
                trace_id=self._active_trace.trace_id,
                name=self._active_trace.name,
                service_name=self.monitor.settings.service_name,
                environment=self.monitor.settings.environment,
                started_at=utc_now_iso(self._active_trace.started_at),
                ended_at=utc_now_iso(ended_at),
                duration_ms=duration_ms(self._active_trace.started_at, ended_at),
                status=status,
                metadata=self._active_trace.metadata,
                error=error,
                spans=list(self._active_trace.spans),
            )
            self.monitor.record_trace(trace_record)

            if self._trace_activation is not None:
                self.monitor.context_store().deactivate_trace(self._trace_activation)

        return False

    def _build_error(self, exc: BaseException | None) -> ErrorInfo | None:
        if exc is None:
            return None

        return ErrorInfo(type=exc.__class__.__name__, message=str(exc))
