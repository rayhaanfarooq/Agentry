from __future__ import annotations

from collections.abc import Sequence
from datetime import datetime
from enum import StrEnum
from math import ceil
from typing import Any, Self
from uuid import UUID, uuid4

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class StrictSchema(BaseModel):
    model_config = ConfigDict(extra="forbid")


class TraceStatus(StrEnum):
    OK = "ok"
    ERROR = "error"


class IngestionResultStatus(StrEnum):
    STORED = "stored"
    DUPLICATE = "duplicate"


class TraceSortField(StrEnum):
    CREATED_AT = "created_at"
    STARTED_AT = "started_at"
    DURATION_MS = "duration_ms"
    SERVICE_NAME = "service_name"
    MODEL_NAME = "model_name"
    STATUS = "status"


class SortOrder(StrEnum):
    ASC = "asc"
    DESC = "desc"


class ErrorPayload(StrictSchema):
    type: str = Field(description="Machine-readable error type or exception name.")
    message: str = Field(description="Human-readable error summary.")


class SDKInfo(StrictSchema):
    name: str = Field(description="SDK or client name that submitted the trace batch.")
    version: str = Field(description="SDK or client version that submitted the batch.")


class ModelInfo(StrictSchema):
    name: str | None = Field(default=None, description="Model name used for the run.")
    provider: str | None = Field(
        default=None,
        description="Optional model provider such as OpenAI, Anthropic, or Gemini.",
    )
    temperature: float | None = Field(
        default=None,
        description="Optional temperature setting used by the model invocation.",
    )


class TokenUsage(StrictSchema):
    input_tokens: int | None = Field(default=None, ge=0)
    output_tokens: int | None = Field(default=None, ge=0)
    total_tokens: int | None = Field(default=None, ge=0)

    @model_validator(mode="after")
    def populate_total_tokens(self) -> Self:
        if (
            self.total_tokens is None
            and self.input_tokens is not None
            and self.output_tokens is not None
        ):
            self.total_tokens = self.input_tokens + self.output_tokens
        return self


class TimeRangePayload(StrictSchema):
    started_at: datetime = Field(
        description="Trace or span start time in ISO-8601 format."
    )
    ended_at: datetime = Field(description="Trace or span end time in ISO-8601 format.")
    duration_ms: float | None = Field(
        default=None,
        ge=0,
        description="Duration in milliseconds. Calculated automatically when omitted.",
    )

    @field_validator("started_at", "ended_at")
    @classmethod
    def require_timezone_aware_timestamps(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("Timestamps must include timezone information.")
        return value

    @model_validator(mode="after")
    def validate_time_window(self) -> Self:
        if self.ended_at < self.started_at:
            raise ValueError("ended_at must be greater than or equal to started_at.")

        if self.duration_ms is None:
            self.duration_ms = (
                self.ended_at - self.started_at
            ).total_seconds() * 1000.0

        return self


class ErrorAwarePayload(StrictSchema):
    status: TraceStatus = Field(description="Execution outcome for the record.")
    error: ErrorPayload | None = Field(
        default=None,
        description="Error payload present when the trace, span, or tool call failed.",
    )

    @model_validator(mode="after")
    def validate_error_state(self) -> Self:
        if self.status is TraceStatus.ERROR and self.error is None:
            raise ValueError("error must be provided when status is 'error'.")

        if self.status is TraceStatus.OK and self.error is not None:
            raise ValueError("error must be omitted when status is 'ok'.")

        return self


class ToolCallUpsertRequest(TimeRangePayload, ErrorAwarePayload):
    tool_call_id: UUID = Field(
        default_factory=uuid4,
        description="Stable UUID for the tool call event.",
    )
    span_id: UUID | None = Field(
        default=None,
        description="Optional span UUID associated with this tool call.",
    )
    name: str = Field(description="Tool name or identifier.")
    metadata: dict[str, Any] = Field(default_factory=dict)
    arguments: dict[str, Any] | None = Field(
        default=None,
        description="Structured tool arguments when available.",
    )
    result: Any | None = Field(
        default=None,
        description="Structured tool result when available.",
    )


class TraceEventUpsertRequest(StrictSchema):
    event_id: UUID = Field(
        default_factory=uuid4,
        description="Stable UUID for the trace event.",
    )
    span_id: UUID | None = Field(
        default=None,
        description="Optional span UUID associated with this event.",
    )
    name: str = Field(description="Human-readable event name.")
    event_type: str = Field(
        description="Event category such as token_usage or annotation."
    )
    timestamp: datetime = Field(description="ISO-8601 timestamp for the event.")
    sequence: int | None = Field(
        default=None,
        ge=0,
        description="Optional ordering hint for events emitted at similar times.",
    )
    payload: dict[str, Any] = Field(default_factory=dict)
    metadata: dict[str, Any] = Field(default_factory=dict)

    @field_validator("timestamp")
    @classmethod
    def require_timezone_aware_timestamp(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("timestamp must include timezone information.")
        return value


class TraceSpanUpsertRequest(TimeRangePayload, ErrorAwarePayload):
    span_id: UUID = Field(
        default_factory=uuid4, description="Stable UUID for the span."
    )
    parent_span_id: UUID | None = Field(
        default=None,
        description="Optional parent span UUID when this span is nested.",
    )
    name: str = Field(description="Span name displayed in the trace timeline.")
    span_type: str | None = Field(
        default=None,
        description=(
            "Optional span category such as llm, tool, retrieval, or orchestration."
        ),
    )
    metadata: dict[str, Any] = Field(default_factory=dict)
    inputs: dict[str, Any] | None = Field(
        default=None,
        description="Structured inputs captured for the span.",
    )
    outputs: dict[str, Any] | None = Field(
        default=None,
        description="Structured outputs captured for the span.",
    )
    model: ModelInfo | None = Field(default=None)
    tokens: TokenUsage | None = Field(default=None)


class TraceUpsertRequest(TimeRangePayload, ErrorAwarePayload):
    trace_id: UUID = Field(
        default_factory=uuid4, description="Stable UUID for the trace."
    )
    project_id: UUID | None = Field(
        default=None,
        description="Optional project UUID for future multi-project support.",
    )
    name: str = Field(description="Trace name shown in list and detail views.")
    service_name: str = Field(
        description="Agent or service name that emitted the trace."
    )
    environment: str = Field(
        description="Environment such as development or production."
    )
    metadata: dict[str, Any] = Field(default_factory=dict)
    tags: list[str] = Field(default_factory=list)
    inputs: dict[str, Any] | None = Field(
        default=None,
        description="Structured trace inputs such as user prompts or request context.",
    )
    outputs: dict[str, Any] | None = Field(
        default=None,
        description=(
            "Structured trace outputs such as final completions or agent responses."
        ),
    )
    model: ModelInfo | None = Field(default=None)
    tokens: TokenUsage | None = Field(default=None)
    spans: Sequence[TraceSpanUpsertRequest] = Field(default_factory=list)
    tool_calls: Sequence[ToolCallUpsertRequest] = Field(default_factory=list)
    events: Sequence[TraceEventUpsertRequest] = Field(default_factory=list)

    @field_validator("tags")
    @classmethod
    def normalize_tags(cls, value: list[str]) -> list[str]:
        normalized_tags: list[str] = []
        for item in value:
            normalized_item = item.strip()
            if normalized_item and normalized_item not in normalized_tags:
                normalized_tags.append(normalized_item)
        return normalized_tags

    @model_validator(mode="after")
    def validate_nested_relationships(self) -> Self:
        span_ids = {span.span_id for span in self.spans}

        if len(span_ids) != len(self.spans):
            raise ValueError("span_id values must be unique within a trace.")

        for span in self.spans:
            if span.parent_span_id == span.span_id:
                raise ValueError("A span cannot reference itself as parent_span_id.")
            if span.parent_span_id is not None and span.parent_span_id not in span_ids:
                raise ValueError(
                    "parent_span_id must reference another span within the same trace."
                )

        tool_call_ids = {tool_call.tool_call_id for tool_call in self.tool_calls}
        if len(tool_call_ids) != len(self.tool_calls):
            raise ValueError("tool_call_id values must be unique within a trace.")

        for tool_call in self.tool_calls:
            if tool_call.span_id is not None and tool_call.span_id not in span_ids:
                raise ValueError(
                    "Tool calls referencing span_id must point to a span in the "
                    "same trace."
                )

        event_ids = {event.event_id for event in self.events}
        if len(event_ids) != len(self.events):
            raise ValueError("event_id values must be unique within a trace.")

        for event in self.events:
            if event.span_id is not None and event.span_id not in span_ids:
                raise ValueError(
                    "Trace events referencing span_id must point to a span in the "
                    "same trace."
                )

        return self


class TraceBatchIngestionRequest(StrictSchema):
    sdk: SDKInfo
    traces: list[TraceUpsertRequest] = Field(
        min_length=1,
        description="One or more traces to validate and store in a single batch.",
    )

    @model_validator(mode="after")
    def validate_unique_trace_ids(self) -> Self:
        trace_ids = [trace.trace_id for trace in self.traces]
        if len(set(trace_ids)) != len(trace_ids):
            raise ValueError("trace_id values must be unique within a batch.")
        return self


class TraceListFilters(StrictSchema):
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    search: str | None = Field(default=None)
    status: TraceStatus | None = Field(default=None)
    service_name: str | None = Field(default=None)
    environment: str | None = Field(default=None)
    project_id: UUID | None = Field(default=None)
    sort_by: TraceSortField = Field(default=TraceSortField.CREATED_AT)
    sort_order: SortOrder = Field(default=SortOrder.DESC)

    @field_validator("search", "service_name", "environment", mode="before")
    @classmethod
    def normalize_optional_strings(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized_value = value.strip()
        return normalized_value or None


class IngestionResultItem(StrictSchema):
    trace_id: UUID
    status: IngestionResultStatus


class TraceSummaryResponse(StrictSchema):
    trace_id: UUID
    project_id: UUID | None = None
    name: str
    service_name: str
    environment: str
    status: TraceStatus
    started_at: datetime
    ended_at: datetime
    duration_ms: float
    created_at: datetime
    sdk: SDKInfo
    model: ModelInfo | None = None
    tokens: TokenUsage | None = None
    error: ErrorPayload | None = None
    span_count: int = Field(ge=0)
    tool_call_count: int = Field(ge=0)
    event_count: int = Field(ge=0)
    tags: list[str] = Field(default_factory=list)


class ToolCallResponse(ToolCallUpsertRequest):
    trace_id: UUID
    created_at: datetime
    updated_at: datetime


class TraceEventResponse(TraceEventUpsertRequest):
    trace_id: UUID
    created_at: datetime
    updated_at: datetime


class SpanResponse(TraceSpanUpsertRequest):
    trace_id: UUID
    created_at: datetime
    updated_at: datetime


class TraceDetailResponse(TraceUpsertRequest):
    sdk: SDKInfo
    created_at: datetime
    updated_at: datetime
    spans: list[SpanResponse] = Field(default_factory=list)
    tool_calls: list[ToolCallResponse] = Field(default_factory=list)
    events: list[TraceEventResponse] = Field(default_factory=list)


class TraceListResponse(StrictSchema):
    items: list[TraceSummaryResponse] = Field(default_factory=list)
    page: int = Field(ge=1)
    page_size: int = Field(ge=1)
    total_items: int = Field(ge=0)
    total_pages: int = Field(ge=0)


class TraceIngestionResponse(StrictSchema):
    received: int = Field(ge=0)
    stored: int = Field(ge=0)
    duplicates: int = Field(ge=0)
    results: list[IngestionResultItem] = Field(default_factory=list)


def build_total_pages(*, total_items: int, page_size: int) -> int:
    if total_items == 0:
        return 0
    return ceil(total_items / page_size)


__all__ = [
    "ErrorPayload",
    "IngestionResultItem",
    "IngestionResultStatus",
    "ModelInfo",
    "SDKInfo",
    "SortOrder",
    "SpanResponse",
    "TokenUsage",
    "ToolCallResponse",
    "ToolCallUpsertRequest",
    "TraceBatchIngestionRequest",
    "TraceDetailResponse",
    "TraceEventResponse",
    "TraceEventUpsertRequest",
    "TraceIngestionResponse",
    "TraceListFilters",
    "TraceListResponse",
    "TraceSortField",
    "TraceSpanUpsertRequest",
    "TraceStatus",
    "TraceSummaryResponse",
    "TraceUpsertRequest",
    "build_total_pages",
]
