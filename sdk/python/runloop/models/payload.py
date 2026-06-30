from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field

TraceStatus = Literal["ok", "error"]


class ErrorInfo(BaseModel):
    type: str
    message: str


class SpanRecord(BaseModel):
    span_id: str
    trace_id: str
    parent_span_id: str | None = None
    name: str
    started_at: str
    ended_at: str
    duration_ms: float
    status: TraceStatus
    metadata: dict[str, Any] = Field(default_factory=dict)
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
    error: ErrorInfo | None = None
    spans: list[SpanRecord] = Field(default_factory=list)


class SDKInfo(BaseModel):
    name: str = "runloop-python"
    version: str


class TraceBatch(BaseModel):
    sdk: SDKInfo
    traces: list[TraceRecord]
