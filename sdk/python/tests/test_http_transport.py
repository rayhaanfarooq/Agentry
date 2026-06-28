from __future__ import annotations

import json

import httpx
from agentry.config import AgentrySettings
from agentry.models import SDKInfo, TraceBatch, TraceRecord
from agentry.transport import HTTPTransport


def make_trace_batch() -> TraceBatch:
    trace = TraceRecord(
        trace_id="trace-1",
        name="demo",
        service_name="service",
        environment="test",
        started_at="2026-01-01T00:00:00+00:00",
        ended_at="2026-01-01T00:00:01+00:00",
        duration_ms=1000.0,
        status="ok",
    )
    return TraceBatch(sdk=SDKInfo(version="0.1.0"), traces=[trace])


def test_http_transport_retries_retryable_failures() -> None:
    requests: list[httpx.Request] = []
    attempts = {"count": 0}

    def handler(request: httpx.Request) -> httpx.Response:
        requests.append(request)
        attempts["count"] += 1

        if attempts["count"] == 1:
            return httpx.Response(status_code=503, json={"error": "temporary"})

        return httpx.Response(status_code=202, json={"accepted": True})

    client = httpx.Client(transport=httpx.MockTransport(handler))
    settings = AgentrySettings.model_validate(
        {
            "api_url": "http://localhost:8000",
            "api_key": "secret-key",
            "max_retries": 2,
            "initial_backoff_seconds": 0.001,
            "max_backoff_seconds": 0.001,
        }
    )
    transport = HTTPTransport(settings=settings, client=client)

    transport.send(make_trace_batch())

    assert attempts["count"] == 2
    assert requests[0].headers["authorization"] == "Bearer secret-key"
    payload = json.loads(requests[1].content.decode("utf-8"))
    assert payload["traces"][0]["name"] == "demo"
