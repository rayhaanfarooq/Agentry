from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any

from agentry.models import SpanRecord


@dataclass
class ActiveTrace:
    trace_id: str
    name: str
    started_at: datetime
    metadata: dict[str, Any]
    spans: list[SpanRecord] = field(default_factory=list)


@dataclass
class ActiveSpan:
    span_id: str
    trace_id: str
    parent_span_id: str | None
    name: str
    started_at: datetime
    metadata: dict[str, Any]
