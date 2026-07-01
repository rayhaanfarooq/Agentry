from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from runloop.models import ModelInfo, SpanRecord


@dataclass
class ActiveTrace:
    trace_id: str
    name: str
    started_at: datetime
    metadata: dict[str, Any]
    inputs: dict[str, Any] | None = None
    outputs: dict[str, Any] | None = None
    model: ModelInfo | None = None
    spans: list[SpanRecord] = field(default_factory=list)


@dataclass
class ActiveSpan:
    span_id: str
    trace_id: str
    parent_span_id: str | None
    name: str
    started_at: datetime
    metadata: dict[str, Any]
    span_type: str | None = None
