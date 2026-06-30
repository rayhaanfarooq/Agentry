from __future__ import annotations

from uuid import UUID

from app.api.routes.traces import router as traces_router
from app.core.exceptions import register_exception_handlers
from app.dependencies.traces import get_trace_service
from app.schemas.traces import (
    SDKInfo,
    SortOrder,
    TraceBatchIngestionRequest,
    TraceDetailResponse,
    TraceIngestionResponse,
    TraceListResponse,
    TraceSortField,
    TraceStatus,
)
from app.services.traces import TraceNotFoundError
from fastapi import FastAPI
from fastapi.testclient import TestClient


class StubTraceService:
    def __init__(self) -> None:
        self.list_calls: list[dict[str, object]] = []

    async def ingest_traces(
        self,
        payload: TraceBatchIngestionRequest,
    ) -> TraceIngestionResponse:
        return TraceIngestionResponse.model_validate(
            {
                "received": len(payload.traces),
                "stored": len(payload.traces),
                "duplicates": 0,
                "results": [
                    {"trace_id": str(trace.trace_id), "status": "stored"}
                    for trace in payload.traces
                ],
            }
        )

    async def list_traces(
        self,
        *,
        page: int,
        page_size: int,
        search: str | None,
        status: TraceStatus | None,
        service_name: str | None,
        environment: str | None,
        project_id: UUID | None,
        sort_by: TraceSortField,
        sort_order: SortOrder,
    ) -> TraceListResponse:
        self.list_calls.append(
            {
                "page": page,
                "page_size": page_size,
                "search": search,
                "status": status,
                "service_name": service_name,
                "environment": environment,
                "project_id": project_id,
                "sort_by": sort_by,
                "sort_order": sort_order,
            }
        )
        return TraceListResponse.model_validate(
            {
                "items": [],
                "page": page,
                "page_size": page_size,
                "total_items": 0,
                "total_pages": 0,
            }
        )

    async def get_trace_detail(self, trace_id: UUID) -> TraceDetailResponse:
        if trace_id == UUID("99999999-9999-4999-8999-999999999999"):
            raise TraceNotFoundError(trace_id)

        return TraceDetailResponse.model_validate(
            {
                "trace_id": str(trace_id),
                "project_id": None,
                "name": "demo trace",
                "service_name": "dummy-agent",
                "environment": "development",
                "status": "ok",
                "started_at": "2026-06-28T10:00:00+00:00",
                "ended_at": "2026-06-28T10:00:01+00:00",
                "duration_ms": 1000,
                "metadata": {},
                "tags": [],
                "inputs": {"prompt": "hello"},
                "outputs": {"completion": "world"},
                "model": {"name": "gemini-2.5-pro", "provider": "google"},
                "tokens": {"input_tokens": 1, "output_tokens": 2, "total_tokens": 3},
                "error": None,
                "sdk": SDKInfo(name="runloop-python", version="0.1.0").model_dump(),
                "created_at": "2026-06-28T10:00:02+00:00",
                "updated_at": "2026-06-28T10:00:02+00:00",
                "spans": [],
                "tool_calls": [],
                "events": [],
            }
        )


def create_test_client(service: StubTraceService) -> TestClient:
    app = FastAPI()
    register_exception_handlers(app)
    app.include_router(traces_router)
    app.dependency_overrides[get_trace_service] = lambda: service
    return TestClient(app)


def test_trace_routes_ingest_and_list() -> None:
    service = StubTraceService()

    with create_test_client(service) as client:
        ingest_response = client.post(
            "/v1/traces",
            json={
                "sdk": {"name": "runloop-python", "version": "0.1.0"},
                "traces": [
                    {
                        "trace_id": "11111111-1111-4111-8111-111111111111",
                        "name": "demo",
                        "service_name": "dummy-agent",
                        "environment": "development",
                        "status": "ok",
                        "started_at": "2026-06-28T10:00:00+00:00",
                        "ended_at": "2026-06-28T10:00:01+00:00",
                    }
                ],
            },
        )

        assert ingest_response.status_code == 202
        assert ingest_response.json()["stored"] == 1

        list_response = client.get(
            "/v1/traces",
            params={
                "page": 2,
                "page_size": 5,
                "search": "demo",
                "status": "ok",
                "service_name": "dummy-agent",
                "environment": "development",
                "sort_by": "duration_ms",
                "sort_order": "asc",
            },
        )

        assert list_response.status_code == 200
        assert list_response.json()["page"] == 2
        assert service.list_calls[0]["status"] == TraceStatus.OK
        assert service.list_calls[0]["sort_by"] == TraceSortField.DURATION_MS
        assert service.list_calls[0]["sort_order"] == SortOrder.ASC


def test_trace_routes_return_404_for_missing_trace() -> None:
    service = StubTraceService()

    with create_test_client(service) as client:
        response = client.get("/v1/traces/99999999-9999-4999-8999-999999999999")

    assert response.status_code == 404
    assert response.json()["error_code"] == "http_error"


def test_trace_routes_return_validation_errors_for_bad_payloads() -> None:
    service = StubTraceService()

    with create_test_client(service) as client:
        response = client.post(
            "/v1/traces",
            json={
                "sdk": {"name": "runloop-python", "version": "0.1.0"},
                "traces": [
                    {
                        "trace_id": "not-a-uuid",
                        "name": "demo",
                        "service_name": "dummy-agent",
                        "environment": "development",
                        "status": "ok",
                        "started_at": "2026-06-28T10:00:00+00:00",
                        "ended_at": "2026-06-28T10:00:01+00:00",
                    }
                ],
            },
        )

    assert response.status_code == 422
    assert response.json()["error_code"] == "validation_error"
    assert any("trace_id" in item["location"] for item in response.json()["errors"])
