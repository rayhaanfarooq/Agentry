from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

TraceStatus = Literal["ok", "error"]


class ErrorInfo(BaseModel):
    type: str
    message: str


class ModelInfo(BaseModel):
    name: str | None = None
    provider: str | None = None
    temperature: float | None = None


class SpanRecord(BaseModel):
    span_id: str
    parent_span_id: str | None = None
    name: str
    span_type: str | None = None
    started_at: str
    ended_at: str
    duration_ms: float
    status: TraceStatus
    metadata: dict[str, Any] = Field(default_factory=dict)
    error: ErrorInfo | None = None


class ToolCallRecord(BaseModel):
    tool_call_id: str
    span_id: str | None = None
    name: str
    started_at: str
    ended_at: str
    duration_ms: float
    status: TraceStatus
    metadata: dict[str, Any] = Field(default_factory=dict)
    arguments: dict[str, Any] | None = None
    result: Any | None = None
    error: ErrorInfo | None = None


class TraceRecord(BaseModel):
    trace_id: str
    name: str
    service_name: str
    environment: str
    started_at: str
    ended_at: str
    duration_ms: float
    status: TraceStatus
    metadata: dict[str, Any] = Field(default_factory=dict)
    inputs: dict[str, Any] | None = None
    outputs: dict[str, Any] | None = None
    model: ModelInfo | None = None
    error: ErrorInfo | None = None
    spans: list[SpanRecord] = Field(default_factory=list)
    tool_calls: list[ToolCallRecord] = Field(default_factory=list)


class SDKInfo(BaseModel):
    name: str = "runloop-python"
    version: str


class TraceBatch(BaseModel):
    sdk: SDKInfo
    traces: list[TraceRecord]
