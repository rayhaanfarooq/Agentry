from __future__ import annotations

from datetime import UTC, datetime


def utc_now() -> datetime:
    return datetime.now(tz=UTC)


def utc_now_iso(value: datetime | None = None) -> str:
    resolved_value = value or utc_now()
    return resolved_value.isoformat()


def duration_ms(started_at: datetime, ended_at: datetime) -> float:
    return round((ended_at - started_at).total_seconds() * 1000, 3)
