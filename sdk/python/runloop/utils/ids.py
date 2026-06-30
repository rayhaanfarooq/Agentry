from __future__ import annotations

from uuid import uuid4


def generate_trace_id() -> str:
    return uuid4().hex


def generate_span_id() -> str:
    return uuid4().hex
