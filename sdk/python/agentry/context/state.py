from __future__ import annotations

from contextvars import ContextVar, Token
from dataclasses import dataclass

from agentry.tracing.runtime import ActiveSpan, ActiveTrace


@dataclass
class TraceActivation:
    trace_token: Token[ActiveTrace | None]
    span_stack_token: Token[tuple[ActiveSpan, ...]]


@dataclass
class SpanActivation:
    span_stack_token: Token[tuple[ActiveSpan, ...]]


class ContextStore:
    def __init__(self) -> None:
        self._current_trace: ContextVar[ActiveTrace | None] = ContextVar(
            "agentry_current_trace",
            default=None,
        )
        self._span_stack: ContextVar[tuple[ActiveSpan, ...]] = ContextVar(
            "agentry_span_stack",
            default=(),
        )

    def current_trace(self) -> ActiveTrace | None:
        return self._current_trace.get()

    def current_span(self) -> ActiveSpan | None:
        stack = self._span_stack.get()
        return stack[-1] if stack else None

    def activate_trace(self, trace: ActiveTrace) -> TraceActivation:
        trace_token = self._current_trace.set(trace)
        span_stack_token = self._span_stack.set(())
        return TraceActivation(
            trace_token=trace_token,
            span_stack_token=span_stack_token,
        )

    def deactivate_trace(self, activation: TraceActivation) -> None:
        self._span_stack.reset(activation.span_stack_token)
        self._current_trace.reset(activation.trace_token)

    def activate_span(self, span: ActiveSpan) -> SpanActivation:
        stack = self._span_stack.get()
        span_stack_token = self._span_stack.set((*stack, span))
        return SpanActivation(span_stack_token=span_stack_token)

    def deactivate_span(self, activation: SpanActivation) -> None:
        self._span_stack.reset(activation.span_stack_token)
