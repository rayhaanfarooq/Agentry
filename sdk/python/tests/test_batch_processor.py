from datetime import UTC, datetime

from agentry.models import TraceBatch, TraceRecord
from agentry.transport import BatchProcessor


class FakeTransport:
    def __init__(self) -> None:
        self.batches: list[TraceBatch] = []

    def send(self, batch: TraceBatch) -> None:
        self.batches.append(batch)


def make_trace_record(name: str) -> TraceRecord:
    now = datetime.now(tz=UTC).isoformat()
    return TraceRecord(
        trace_id=f"trace-{name}",
        name=name,
        service_name="service",
        environment="test",
        started_at=now,
        ended_at=now,
        duration_ms=1.0,
        status="ok",
    )


def test_batch_processor_flushes_when_batch_size_is_reached() -> None:
    transport = FakeTransport()
    processor = BatchProcessor(
        transport=transport,
        batch_size=2,
        flush_interval_seconds=60.0,
        auto_start=False,
    )

    processor.enqueue(make_trace_record("one"))
    processor.enqueue(make_trace_record("two"))

    assert len(transport.batches) == 1
    assert [trace.name for trace in transport.batches[0].traces] == ["one", "two"]
