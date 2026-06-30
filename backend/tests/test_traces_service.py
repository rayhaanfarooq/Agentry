from __future__ import annotations

from uuid import UUID, uuid4

from app.repositories.traces import TraceRepository
from app.schemas.traces import (
    SortOrder,
    TraceBatchIngestionRequest,
    TraceSortField,
    TraceStatus,
)
from app.services.traces import TraceNotFoundError, TraceService
from sqlalchemy.ext.asyncio import AsyncSession


def build_trace_batch() -> TraceBatchIngestionRequest:
    trace_id = UUID("11111111-1111-4111-8111-111111111111")
    parent_span_id = UUID("22222222-2222-4222-8222-222222222222")
    child_span_id = UUID("33333333-3333-4333-8333-333333333333")

    return TraceBatchIngestionRequest.model_validate(
        {
            "sdk": {"name": "runloop-python", "version": "0.1.0"},
            "traces": [
                {
                    "trace_id": str(trace_id),
                    "project_id": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
                    "name": "Research Agent Trace",
                    "service_name": "dummy-agent",
                    "environment": "development",
                    "status": "ok",
                    "started_at": "2026-06-28T10:00:00+00:00",
                    "ended_at": "2026-06-28T10:00:02+00:00",
                    "metadata": {"route": "/chat"},
                    "tags": ["research", "demo", "research"],
                    "inputs": {"prompt": "Explain vector search"},
                    "outputs": {
                        "completion": "Vector search finds similar embeddings."
                    },
                    "model": {
                        "name": "gemini-2.5-pro",
                        "provider": "google",
                        "temperature": 0.2,
                    },
                    "tokens": {"input_tokens": 10, "output_tokens": 5},
                    "spans": [
                        {
                            "span_id": str(parent_span_id),
                            "name": "llm_call",
                            "span_type": "llm",
                            "status": "ok",
                            "started_at": "2026-06-28T10:00:00+00:00",
                            "ended_at": "2026-06-28T10:00:01+00:00",
                            "metadata": {"model": "gemini-2.5-pro"},
                            "tokens": {"input_tokens": 10, "output_tokens": 5},
                        },
                        {
                            "span_id": str(child_span_id),
                            "parent_span_id": str(parent_span_id),
                            "name": "tool_execution",
                            "span_type": "tool",
                            "status": "ok",
                            "started_at": "2026-06-28T10:00:01+00:00",
                            "ended_at": "2026-06-28T10:00:01.500000+00:00",
                            "metadata": {"tool": "search_docs"},
                        },
                    ],
                    "tool_calls": [
                        {
                            "tool_call_id": "44444444-4444-4444-8444-444444444444",
                            "span_id": str(child_span_id),
                            "name": "search_docs",
                            "status": "ok",
                            "started_at": "2026-06-28T10:00:01+00:00",
                            "ended_at": "2026-06-28T10:00:01.250000+00:00",
                            "arguments": {"query": "vector search"},
                            "result": {"documents": 3},
                            "metadata": {"cache": False},
                        }
                    ],
                    "events": [
                        {
                            "event_id": "55555555-5555-4555-8555-555555555555",
                            "span_id": str(parent_span_id),
                            "name": "token_usage",
                            "event_type": "metric",
                            "timestamp": "2026-06-28T10:00:01+00:00",
                            "sequence": 0,
                            "payload": {"prompt_tokens": 10, "completion_tokens": 5},
                            "metadata": {"source": "sdk"},
                        }
                    ],
                }
            ],
        }
    )


async def test_trace_service_ingests_lists_and_fetches_traces(
    db_session: AsyncSession,
) -> None:
    service = TraceService(repository=TraceRepository(db_session))
    payload = build_trace_batch()

    ingestion_response = await service.ingest_traces(payload)

    assert ingestion_response.received == 1
    assert ingestion_response.stored == 1
    assert ingestion_response.duplicates == 0
    assert ingestion_response.results[0].trace_id == payload.traces[0].trace_id

    duplicate_response = await service.ingest_traces(payload)

    assert duplicate_response.received == 1
    assert duplicate_response.stored == 0
    assert duplicate_response.duplicates == 1

    list_response = await service.list_traces(
        page=1,
        page_size=10,
        search="Research",
        status=TraceStatus.OK,
        service_name="dummy-agent",
        environment="development",
        project_id=payload.traces[0].project_id,
        sort_by=TraceSortField.CREATED_AT,
        sort_order=SortOrder.DESC,
    )

    assert list_response.total_items == 1
    assert list_response.total_pages == 1
    assert list_response.items[0].trace_id == payload.traces[0].trace_id
    assert list_response.items[0].span_count == 2
    assert list_response.items[0].tool_call_count == 1
    assert list_response.items[0].event_count == 1
    assert list_response.items[0].tokens is not None
    assert list_response.items[0].tokens.total_tokens == 15

    detail_response = await service.get_trace_detail(payload.traces[0].trace_id)

    assert detail_response.trace_id == payload.traces[0].trace_id
    assert detail_response.sdk.version == "0.1.0"
    assert detail_response.model is not None
    assert detail_response.model.name == "gemini-2.5-pro"
    assert detail_response.tokens is not None
    assert detail_response.tokens.total_tokens == 15
    assert detail_response.tags == ["research", "demo"]
    assert len(detail_response.spans) == 2
    assert detail_response.spans[1].parent_span_id == detail_response.spans[0].span_id
    assert detail_response.tool_calls[0].arguments == {"query": "vector search"}
    assert detail_response.tool_calls[0].result == {"documents": 3}
    assert detail_response.events[0].payload["prompt_tokens"] == 10


async def test_trace_service_raises_not_found_for_unknown_trace(
    db_session: AsyncSession,
) -> None:
    service = TraceService(repository=TraceRepository(db_session))

    missing_trace_id = uuid4()

    try:
        await service.get_trace_detail(missing_trace_id)
    except TraceNotFoundError as error:
        assert error.trace_id == missing_trace_id
    else:
        raise AssertionError("Expected TraceNotFoundError for a missing trace.")
