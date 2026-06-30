from __future__ import annotations

import asyncio

from runloop.client.monitor import RunloopMonitor
from runloop.config import RunloopSettings
from runloop.models import TraceBatch
from runloop.transport import BatchProcessor


class FakeTransport:
    def __init__(self) -> None:
        self.batches: list[TraceBatch] = []

    def send(self, batch: TraceBatch) -> None:
        self.batches.append(batch)


def build_monitor(transport: FakeTransport) -> RunloopMonitor:
    monitor = RunloopMonitor(
        settings=RunloopSettings.model_validate(
            {
                "api_url": None,
                "api_key": None,
                "enabled": True,
            }
        )
    )
    monitor._settings = RunloopSettings.model_validate(
        {
            "api_url": "http://localhost:8000",
            "api_key": "secret-key",
            "service_name": "test-service",
            "environment": "test",
            "batch_size": 1,
            "flush_interval_seconds": 60.0,
        }
    )
    monitor._batch_processor = BatchProcessor(
        transport=transport,
        batch_size=1,
        flush_interval_seconds=60.0,
        auto_start=False,
    )
    return monitor


def test_trace_decorator_records_sync_function() -> None:
    transport = FakeTransport()
    monitor = build_monitor(transport)

    @monitor.trace()
    def answer() -> str:
        return "hello"

    result = answer()

    assert result == "hello"
    assert len(transport.batches) == 1
    trace = transport.batches[0].traces[0]
    assert trace.name.endswith("answer")
    assert trace.status == "ok"
    assert trace.service_name == "test-service"


def test_trace_decorator_records_async_function() -> None:
    transport = FakeTransport()
    monitor = build_monitor(transport)

    @monitor.trace("async_answer")
    async def answer() -> str:
        return "hello"

    result = asyncio.run(answer())

    assert result == "hello"
    assert len(transport.batches) == 1
    trace = transport.batches[0].traces[0]
    assert trace.name == "async_answer"
    assert trace.status == "ok"


def test_trace_context_manager_captures_nested_span_and_error() -> None:
    transport = FakeTransport()
    monitor = build_monitor(transport)

    try:
        with monitor.trace("request", metadata={"route": "/chat"}):
            with monitor.span("retrieve_context"):
                pass
            raise ValueError("boom")
    except ValueError:
        pass

    assert len(transport.batches) == 1
    trace = transport.batches[0].traces[0]
    assert trace.name == "request"
    assert trace.status == "error"
    assert trace.metadata["route"] == "/chat"
    assert trace.error is not None
    assert trace.error.type == "ValueError"
    assert len(trace.spans) == 1
    assert trace.spans[0].name == "retrieve_context"
