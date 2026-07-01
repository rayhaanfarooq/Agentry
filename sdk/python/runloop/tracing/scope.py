from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from types import TracebackType
from typing import Any, Literal

from runloop.context.state import SpanActivation, TraceActivation
from runloop.models import (
    ErrorInfo,
    ModelInfo,
    SpanRecord,
    ToolCallRecord,
    TraceRecord,
    TraceStatus,
)
from runloop.tracing.runtime import ActiveSpan, ActiveTrace
from runloop.utils.ids import generate_span_id, generate_tool_call_id, generate_trace_id
from runloop.utils.time import duration_ms, utc_now, utc_now_iso


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

    def set_inputs(self, inputs: dict[str, Any]) -> None:
        active_trace = self._require_active_trace()
        active_trace.inputs = dict(inputs)

    def set_outputs(self, outputs: dict[str, Any]) -> None:
        active_trace = self._require_active_trace()
        active_trace.outputs = dict(outputs)

    def set_model(
        self,
        *,
        name: str | None = None,
        provider: str | None = None,
        temperature: float | None = None,
    ) -> None:
        active_trace = self._require_active_trace()
        active_trace.model = ModelInfo(
            name=name,
            provider=provider,
            temperature=temperature,
        )

    def set_tool_call(
        self,
        *,
        arguments: dict[str, Any],
        result: Any,
        metadata: dict[str, Any] | None = None,
    ) -> None:
        if self._active_span is None:
            raise RuntimeError(
                "Cannot set tool call fields outside of an active span scope."
            )
        self._active_span.tool_call_arguments = dict(arguments)
        self._active_span.tool_call_result = result
        if metadata is not None:
            self._active_span.tool_call_metadata = dict(metadata)

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
        span_metadata = dict(self.metadata)
        span_type = span_metadata.pop("span_type", None)
        if isinstance(span_type, str):
            normalized_span_type = span_type.strip() or None
        else:
            normalized_span_type = None

        self._active_span = ActiveSpan(
            span_id=generate_span_id(),
            trace_id=current_trace.trace_id,
            parent_span_id=parent_span.span_id if parent_span else None,
            name=self.name,
            started_at=self._started_at,
            metadata=span_metadata,
            span_type=normalized_span_type,
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
                        parent_span_id=self._active_span.parent_span_id,
                        name=self._active_span.name,
                        span_type=self._active_span.span_type,
                        started_at=utc_now_iso(self._active_span.started_at),
                        ended_at=utc_now_iso(ended_at),
                        duration_ms=duration_ms(self._active_span.started_at, ended_at),
                        status=status,
                        metadata=self._active_span.metadata,
                        error=error,
                    )
                )
                if self._active_span.tool_call_arguments is not None:
                    tool_metadata = dict(self._active_span.metadata)
                    if self._active_span.tool_call_metadata is not None:
                        tool_metadata.update(self._active_span.tool_call_metadata)
                    current_trace.tool_calls.append(
                        ToolCallRecord(
                            tool_call_id=generate_tool_call_id(),
                            span_id=self._active_span.span_id,
                            name=self._active_span.name,
                            started_at=utc_now_iso(self._active_span.started_at),
                            ended_at=utc_now_iso(ended_at),
                            duration_ms=duration_ms(
                                self._active_span.started_at, ended_at
                            ),
                            status=status,
                            metadata=tool_metadata,
                            arguments=self._active_span.tool_call_arguments,
                            result=self._active_span.tool_call_result,
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
                inputs=self._active_trace.inputs,
                outputs=self._active_trace.outputs,
                model=self._active_trace.model,
                error=error,
                spans=list(self._active_trace.spans),
                tool_calls=list(self._active_trace.tool_calls),
            )
            self.monitor.record_trace(trace_record)

            if self._trace_activation is not None:
                self.monitor.context_store().deactivate_trace(self._trace_activation)

        return False

    def _require_active_trace(self) -> ActiveTrace:
        if self._active_trace is None:
            raise RuntimeError(
                "Cannot set trace fields outside of an active trace scope."
            )
        return self._active_trace

    def _build_error(self, exc: BaseException | None) -> ErrorInfo | None:
        if exc is None:
            return None

        return ErrorInfo(type=exc.__class__.__name__, message=str(exc))
