from __future__ import annotations

from dataclasses import dataclass
from typing import cast
from uuid import UUID

from sqlalchemy import Select, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from sqlalchemy.sql.elements import ColumnElement

from app.models.traces import SpanModel, ToolCallModel, TraceEventModel, TraceModel
from app.schemas.traces import (
    SDKInfo,
    SortOrder,
    ToolCallUpsertRequest,
    TraceBatchIngestionRequest,
    TraceEventUpsertRequest,
    TraceListFilters,
    TraceSortField,
    TraceSpanUpsertRequest,
    TraceUpsertRequest,
)


@dataclass(frozen=True)
class TraceBatchStoreResult:
    stored_trace_ids: list[UUID]
    duplicate_trace_ids: list[UUID]


@dataclass(frozen=True)
class TraceListItemRecord:
    trace: TraceModel
    span_count: int
    tool_call_count: int
    event_count: int


@dataclass(frozen=True)
class TraceListPage:
    items: list[TraceListItemRecord]
    total: int


class TraceRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def ingest_batch(
        self,
        payload: TraceBatchIngestionRequest,
    ) -> TraceBatchStoreResult:
        trace_ids = [trace.trace_id for trace in payload.traces]
        existing_ids_result = await self.session.execute(
            select(TraceModel.trace_id).where(TraceModel.trace_id.in_(trace_ids))
        )
        existing_ids = set(existing_ids_result.scalars().all())

        stored_trace_ids: list[UUID] = []
        duplicate_trace_ids: list[UUID] = []

        for trace in payload.traces:
            if trace.trace_id in existing_ids:
                duplicate_trace_ids.append(trace.trace_id)
                continue

            self.session.add(self._build_trace_model(trace=trace, sdk=payload.sdk))
            stored_trace_ids.append(trace.trace_id)

        if stored_trace_ids:
            await self.session.commit()

        return TraceBatchStoreResult(
            stored_trace_ids=stored_trace_ids,
            duplicate_trace_ids=duplicate_trace_ids,
        )

    async def list_traces(self, filters: TraceListFilters) -> TraceListPage:
        base_query = self._build_list_query(filters)
        count_query = select(func.count()).select_from(base_query.subquery())
        total = cast(int, await self.session.scalar(count_query) or 0)

        paginated_query = (
            base_query.order_by(self._build_order_clause(filters))
            .offset((filters.page - 1) * filters.page_size)
            .limit(filters.page_size)
        )
        traces = list((await self.session.scalars(paginated_query)).all())

        if not traces:
            return TraceListPage(items=[], total=total)

        trace_ids = [trace.trace_id for trace in traces]
        span_counts = await self._fetch_count_map(
            select(SpanModel.trace_id, func.count())
            .where(SpanModel.trace_id.in_(trace_ids))
            .group_by(SpanModel.trace_id)
        )
        tool_call_counts = await self._fetch_count_map(
            select(ToolCallModel.trace_id, func.count())
            .where(ToolCallModel.trace_id.in_(trace_ids))
            .group_by(ToolCallModel.trace_id)
        )
        event_counts = await self._fetch_count_map(
            select(TraceEventModel.trace_id, func.count())
            .where(TraceEventModel.trace_id.in_(trace_ids))
            .group_by(TraceEventModel.trace_id)
        )

        return TraceListPage(
            items=[
                TraceListItemRecord(
                    trace=trace,
                    span_count=span_counts.get(trace.trace_id, 0),
                    tool_call_count=tool_call_counts.get(trace.trace_id, 0),
                    event_count=event_counts.get(trace.trace_id, 0),
                )
                for trace in traces
            ],
            total=total,
        )

    async def get_trace(self, trace_id: UUID) -> TraceModel | None:
        query = (
            select(TraceModel)
            .options(
                selectinload(TraceModel.spans),
                selectinload(TraceModel.tool_calls),
                selectinload(TraceModel.events),
            )
            .where(TraceModel.trace_id == trace_id)
        )
        result = await self.session.execute(query)
        return result.scalar_one_or_none()

    def _build_list_query(self, filters: TraceListFilters) -> Select[tuple[TraceModel]]:
        query = select(TraceModel)

        if filters.search is not None:
            pattern = f"%{filters.search}%"
            query = query.where(
                or_(
                    TraceModel.name.ilike(pattern),
                    TraceModel.service_name.ilike(pattern),
                    TraceModel.model_name.ilike(pattern),
                )
            )

        if filters.status is not None:
            query = query.where(TraceModel.status == filters.status.value)

        if filters.service_name is not None:
            query = query.where(TraceModel.service_name == filters.service_name)

        if filters.environment is not None:
            query = query.where(TraceModel.environment == filters.environment)

        if filters.project_id is not None:
            query = query.where(TraceModel.project_id == filters.project_id)

        return query

    def _build_order_clause(self, filters: TraceListFilters) -> ColumnElement[object]:
        sort_columns = {
            TraceSortField.CREATED_AT: TraceModel.created_at,
            TraceSortField.STARTED_AT: TraceModel.started_at,
            TraceSortField.DURATION_MS: TraceModel.duration_ms,
            TraceSortField.SERVICE_NAME: TraceModel.service_name,
            TraceSortField.MODEL_NAME: TraceModel.model_name,
            TraceSortField.STATUS: TraceModel.status,
        }
        sort_column = sort_columns[filters.sort_by]
        return (
            sort_column.asc()
            if filters.sort_order is SortOrder.ASC
            else sort_column.desc()
        )

    async def _fetch_count_map(
        self, query: Select[tuple[UUID, int]]
    ) -> dict[UUID, int]:
        rows = (await self.session.execute(query)).all()
        return {trace_id: count for trace_id, count in rows}

    def _build_trace_model(self, trace: TraceUpsertRequest, sdk: SDKInfo) -> TraceModel:
        return TraceModel(
            trace_id=trace.trace_id,
            project_id=trace.project_id,
            name=trace.name,
            service_name=trace.service_name,
            environment=trace.environment,
            status=trace.status.value,
            started_at=trace.started_at,
            ended_at=trace.ended_at,
            duration_ms=trace.duration_ms or 0.0,
            metadata_payload=trace.metadata,
            tags=trace.tags,
            inputs=trace.inputs,
            outputs=trace.outputs,
            model_name=trace.model.name if trace.model is not None else None,
            model_provider=trace.model.provider if trace.model is not None else None,
            temperature=trace.model.temperature if trace.model is not None else None,
            input_tokens=(
                trace.tokens.input_tokens if trace.tokens is not None else None
            ),
            output_tokens=(
                trace.tokens.output_tokens if trace.tokens is not None else None
            ),
            total_tokens=(
                trace.tokens.total_tokens if trace.tokens is not None else None
            ),
            error_type=trace.error.type if trace.error is not None else None,
            error_message=trace.error.message if trace.error is not None else None,
            sdk_name=sdk.name,
            sdk_version=sdk.version,
            spans=[
                self._build_span_model(trace.trace_id, span) for span in trace.spans
            ],
            tool_calls=[
                self._build_tool_call_model(trace.trace_id, tool_call)
                for tool_call in trace.tool_calls
            ],
            events=[
                self._build_trace_event_model(trace.trace_id, event)
                for event in trace.events
            ],
        )

    def _build_span_model(
        self, trace_id: UUID, span: TraceSpanUpsertRequest
    ) -> SpanModel:
        return SpanModel(
            span_id=span.span_id,
            trace_id=trace_id,
            parent_span_id=span.parent_span_id,
            name=span.name,
            span_type=span.span_type,
            status=span.status.value,
            started_at=span.started_at,
            ended_at=span.ended_at,
            duration_ms=span.duration_ms or 0.0,
            metadata_payload=span.metadata,
            inputs=span.inputs,
            outputs=span.outputs,
            model_name=span.model.name if span.model is not None else None,
            model_provider=span.model.provider if span.model is not None else None,
            temperature=span.model.temperature if span.model is not None else None,
            input_tokens=span.tokens.input_tokens if span.tokens is not None else None,
            output_tokens=(
                span.tokens.output_tokens if span.tokens is not None else None
            ),
            total_tokens=span.tokens.total_tokens if span.tokens is not None else None,
            error_type=span.error.type if span.error is not None else None,
            error_message=span.error.message if span.error is not None else None,
        )

    def _build_tool_call_model(
        self,
        trace_id: UUID,
        tool_call: ToolCallUpsertRequest,
    ) -> ToolCallModel:
        return ToolCallModel(
            tool_call_id=tool_call.tool_call_id,
            trace_id=trace_id,
            span_id=tool_call.span_id,
            name=tool_call.name,
            status=tool_call.status.value,
            started_at=tool_call.started_at,
            ended_at=tool_call.ended_at,
            duration_ms=tool_call.duration_ms or 0.0,
            metadata_payload=tool_call.metadata,
            arguments=tool_call.arguments,
            result=tool_call.result,
            error_type=tool_call.error.type if tool_call.error is not None else None,
            error_message=(
                tool_call.error.message if tool_call.error is not None else None
            ),
        )

    def _build_trace_event_model(
        self,
        trace_id: UUID,
        event: TraceEventUpsertRequest,
    ) -> TraceEventModel:
        return TraceEventModel(
            event_id=event.event_id,
            trace_id=trace_id,
            span_id=event.span_id,
            name=event.name,
            event_type=event.event_type,
            sequence=event.sequence,
            timestamp=event.timestamp,
            payload=event.payload,
            metadata_payload=event.metadata,
        )


__all__ = [
    "TraceBatchStoreResult",
    "TraceListItemRecord",
    "TraceListPage",
    "TraceRepository",
]
