from __future__ import annotations

from datetime import UTC, datetime
from uuid import UUID

from app.models.traces import SpanModel, ToolCallModel, TraceEventModel, TraceModel
from app.repositories.traces import (
    TraceBatchStoreResult,
    TraceListItemRecord,
    TraceRepository,
)
from app.schemas.traces import (
    ErrorPayload,
    IngestionResultItem,
    IngestionResultStatus,
    ModelInfo,
    SDKInfo,
    SortOrder,
    SpanResponse,
    TokenUsage,
    ToolCallResponse,
    TraceBatchIngestionRequest,
    TraceDetailResponse,
    TraceEventResponse,
    TraceIngestionResponse,
    TraceListFilters,
    TraceListResponse,
    TraceSortField,
    TraceStatus,
    TraceSummaryResponse,
    build_total_pages,
)


class TraceNotFoundError(Exception):
    def __init__(self, trace_id: UUID) -> None:
        super().__init__(f"Trace {trace_id} was not found.")
        self.trace_id = trace_id


class TraceService:
    def __init__(self, repository: TraceRepository) -> None:
        self.repository = repository

    async def ingest_traces(
        self,
        payload: TraceBatchIngestionRequest,
    ) -> TraceIngestionResponse:
        result = await self.repository.ingest_batch(payload)
        return self._build_ingestion_response(
            result=result, received=len(payload.traces)
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
        filters = TraceListFilters(
            page=page,
            page_size=page_size,
            search=search,
            status=status,
            service_name=service_name,
            environment=environment,
            project_id=project_id,
            sort_by=sort_by,
            sort_order=sort_order,
        )
        page_result = await self.repository.list_traces(filters)
        return TraceListResponse(
            items=[self._build_summary_response(item) for item in page_result.items],
            page=filters.page,
            page_size=filters.page_size,
            total_items=page_result.total,
            total_pages=build_total_pages(
                total_items=page_result.total,
                page_size=filters.page_size,
            ),
        )

    async def get_trace_detail(self, trace_id: UUID) -> TraceDetailResponse:
        trace = await self.repository.get_trace(trace_id)
        if trace is None:
            raise TraceNotFoundError(trace_id)
        return self._build_detail_response(trace)

    def _build_ingestion_response(
        self,
        *,
        result: TraceBatchStoreResult,
        received: int,
    ) -> TraceIngestionResponse:
        stored_results = [
            IngestionResultItem(
                trace_id=trace_id,
                status=IngestionResultStatus.STORED,
            )
            for trace_id in result.stored_trace_ids
        ]
        duplicate_results = [
            IngestionResultItem(
                trace_id=trace_id,
                status=IngestionResultStatus.DUPLICATE,
            )
            for trace_id in result.duplicate_trace_ids
        ]
        return TraceIngestionResponse(
            received=received,
            stored=len(result.stored_trace_ids),
            duplicates=len(result.duplicate_trace_ids),
            results=[*stored_results, *duplicate_results],
        )

    def _build_summary_response(
        self, record: TraceListItemRecord
    ) -> TraceSummaryResponse:
        trace = record.trace
        return TraceSummaryResponse(
            trace_id=trace.trace_id,
            project_id=trace.project_id,
            name=trace.name,
            service_name=trace.service_name,
            environment=trace.environment,
            status=TraceStatus(trace.status),
            started_at=self._normalize_datetime(trace.started_at),
            ended_at=self._normalize_datetime(trace.ended_at),
            duration_ms=trace.duration_ms,
            created_at=self._normalize_datetime(trace.created_at),
            sdk=SDKInfo(name=trace.sdk_name, version=trace.sdk_version),
            model=self._build_model_info(trace),
            tokens=self._build_token_usage(trace),
            error=self._build_error(trace.error_type, trace.error_message),
            span_count=record.span_count,
            tool_call_count=record.tool_call_count,
            event_count=record.event_count,
            tags=trace.tags,
        )

    def _build_detail_response(self, trace: TraceModel) -> TraceDetailResponse:
        return TraceDetailResponse(
            trace_id=trace.trace_id,
            project_id=trace.project_id,
            name=trace.name,
            service_name=trace.service_name,
            environment=trace.environment,
            status=TraceStatus(trace.status),
            started_at=self._normalize_datetime(trace.started_at),
            ended_at=self._normalize_datetime(trace.ended_at),
            duration_ms=trace.duration_ms,
            metadata=trace.metadata_payload,
            tags=trace.tags,
            inputs=trace.inputs,
            outputs=trace.outputs,
            model=self._build_model_info(trace),
            tokens=self._build_token_usage(trace),
            error=self._build_error(trace.error_type, trace.error_message),
            sdk=SDKInfo(name=trace.sdk_name, version=trace.sdk_version),
            created_at=self._normalize_datetime(trace.created_at),
            updated_at=self._normalize_datetime(trace.updated_at),
            spans=[self._build_span_response(span) for span in trace.spans],
            tool_calls=[
                self._build_tool_call_response(tool_call)
                for tool_call in trace.tool_calls
            ],
            events=[self._build_event_response(event) for event in trace.events],
        )

    def _build_span_response(self, span: SpanModel) -> SpanResponse:
        return SpanResponse(
            trace_id=span.trace_id,
            span_id=span.span_id,
            parent_span_id=span.parent_span_id,
            name=span.name,
            span_type=span.span_type,
            status=TraceStatus(span.status),
            started_at=self._normalize_datetime(span.started_at),
            ended_at=self._normalize_datetime(span.ended_at),
            duration_ms=span.duration_ms,
            metadata=span.metadata_payload,
            inputs=span.inputs,
            outputs=span.outputs,
            model=self._build_model_info(span),
            tokens=self._build_token_usage(span),
            error=self._build_error(span.error_type, span.error_message),
            created_at=self._normalize_datetime(span.created_at),
            updated_at=self._normalize_datetime(span.updated_at),
        )

    def _build_tool_call_response(self, tool_call: ToolCallModel) -> ToolCallResponse:
        return ToolCallResponse(
            trace_id=tool_call.trace_id,
            tool_call_id=tool_call.tool_call_id,
            span_id=tool_call.span_id,
            name=tool_call.name,
            status=TraceStatus(tool_call.status),
            started_at=self._normalize_datetime(tool_call.started_at),
            ended_at=self._normalize_datetime(tool_call.ended_at),
            duration_ms=tool_call.duration_ms,
            metadata=tool_call.metadata_payload,
            arguments=tool_call.arguments,
            result=tool_call.result,
            error=self._build_error(tool_call.error_type, tool_call.error_message),
            created_at=self._normalize_datetime(tool_call.created_at),
            updated_at=self._normalize_datetime(tool_call.updated_at),
        )

    def _build_event_response(self, event: TraceEventModel) -> TraceEventResponse:
        return TraceEventResponse(
            trace_id=event.trace_id,
            event_id=event.event_id,
            span_id=event.span_id,
            name=event.name,
            event_type=event.event_type,
            timestamp=self._normalize_datetime(event.timestamp),
            sequence=event.sequence,
            payload=event.payload,
            metadata=event.metadata_payload,
            created_at=self._normalize_datetime(event.created_at),
            updated_at=self._normalize_datetime(event.updated_at),
        )

    def _build_model_info(self, record: TraceModel | SpanModel) -> ModelInfo | None:
        if (
            record.model_name is None
            and record.model_provider is None
            and record.temperature is None
        ):
            return None

        return ModelInfo(
            name=record.model_name,
            provider=record.model_provider,
            temperature=record.temperature,
        )

    def _build_token_usage(self, record: TraceModel | SpanModel) -> TokenUsage | None:
        if (
            record.input_tokens is None
            and record.output_tokens is None
            and record.total_tokens is None
        ):
            return None

        return TokenUsage(
            input_tokens=record.input_tokens,
            output_tokens=record.output_tokens,
            total_tokens=record.total_tokens,
        )

    def _build_error(
        self,
        error_type: str | None,
        error_message: str | None,
    ) -> ErrorPayload | None:
        if error_type is None or error_message is None:
            return None

        return ErrorPayload(type=error_type, message=error_message)

    def _normalize_datetime(self, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            return value.replace(tzinfo=UTC)
        return value


__all__ = ["TraceNotFoundError", "TraceService"]
