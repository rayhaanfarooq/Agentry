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


def test_trace_scope_records_inputs_outputs_and_model() -> None:
    transport = FakeTransport()
    monitor = build_monitor(transport)

    with monitor.trace("dummy_agent_prompt") as trace:
        with monitor.span(
            "llm_call",
            metadata={"provider": "google", "span_type": "llm"},
        ):
            pass
        trace.set_inputs({"prompt": "Hello"})
        trace.set_outputs({"response": "Hi there"})
        trace.set_model(name="gemini-2.5-flash", provider="google")

    assert len(transport.batches) == 1
    exported = transport.batches[0].traces[0]
    assert exported.name == "dummy_agent_prompt"
    assert exported.inputs == {"prompt": "Hello"}
    assert exported.outputs == {"response": "Hi there"}
    assert exported.model is not None
    assert exported.model.name == "gemini-2.5-flash"
    assert exported.model.provider == "google"
    assert len(exported.spans) == 1
    assert exported.spans[0].name == "llm_call"
    assert exported.spans[0].span_type == "llm"
    assert exported.spans[0].metadata == {"provider": "google"}
    assert "trace_id" not in exported.spans[0].model_dump(mode="json")


def test_trace_scope_marks_error_when_exception_raised_inside_llm_span() -> None:
    transport = FakeTransport()
    monitor = build_monitor(transport)

    try:
        with monitor.trace("dummy_agent_prompt") as trace:
            with monitor.span("llm_call", metadata={"span_type": "llm"}):
                raise RuntimeError("gemini failed")
            trace.set_inputs({"prompt": "Hello"})
    except RuntimeError:
        pass

    assert len(transport.batches) == 1
    exported = transport.batches[0].traces[0]
    assert exported.status == "error"
    assert exported.error is not None
    assert exported.error.type == "RuntimeError"
    assert exported.spans[0].status == "error"
