from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, HTTPException, Query, status

from app.dependencies.traces import TraceServiceDependency
from app.schemas.error import ErrorResponse, ValidationErrorResponse
from app.schemas.traces import (
    SortOrder,
    TraceBatchIngestionRequest,
    TraceDetailResponse,
    TraceIngestionResponse,
    TraceListResponse,
    TraceSortField,
    TraceStatus,
)
from app.services.traces import TraceNotFoundError

router = APIRouter(prefix="/v1/traces", tags=["Traces"])


@router.post(
    "",
    response_model=TraceIngestionResponse,
    status_code=status.HTTP_202_ACCEPTED,
    responses={
        422: {
            "model": ValidationErrorResponse,
            "description": "Trace payload validation failed.",
        },
        500: {"model": ErrorResponse, "description": "Unexpected server error."},
    },
    summary="Validate and ingest a batch of traces",
    description=(
        "Receives one or more traces, validates nested spans, tool calls, and "
        "events, and stores them for later debugging and analysis."
    ),
)
async def ingest_trace_batch(
    payload: TraceBatchIngestionRequest,
    trace_service: TraceServiceDependency,
) -> TraceIngestionResponse:
    return await trace_service.ingest_traces(payload)


@router.get(
    "",
    response_model=TraceListResponse,
    responses={
        500: {"model": ErrorResponse, "description": "Unexpected server error."}
    },
    summary="List traces with pagination and filters",
    description=(
        "Returns paginated traces sorted by created time by default. Supports "
        "future-facing explorer filters including status, service name, project, "
        "search, and sort controls."
    ),
)
async def list_traces(
    trace_service: TraceServiceDependency,
    page: Annotated[int, Query(ge=1)] = 1,
    page_size: Annotated[int, Query(ge=1, le=100)] = 20,
    search: Annotated[
        str | None,
        Query(description="Search by trace, service, or model."),
    ] = None,
    status_filter: Annotated[
        TraceStatus | None,
        Query(alias="status", description="Optional execution status filter."),
    ] = None,
    service_name: Annotated[str | None, Query()] = None,
    environment: Annotated[str | None, Query()] = None,
    project_id: Annotated[UUID | None, Query()] = None,
    sort_by: Annotated[TraceSortField, Query()] = TraceSortField.CREATED_AT,
    sort_order: Annotated[SortOrder, Query()] = SortOrder.DESC,
) -> TraceListResponse:
    return await trace_service.list_traces(
        page=page,
        page_size=page_size,
        search=search,
        status=status_filter,
        service_name=service_name,
        environment=environment,
        project_id=project_id,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@router.get(
    "/{trace_id}",
    response_model=TraceDetailResponse,
    responses={
        404: {"model": ErrorResponse, "description": "Trace not found."},
        500: {"model": ErrorResponse, "description": "Unexpected server error."},
    },
    summary="Get a single trace by UUID",
    description=(
        "Returns the full trace payload including spans, tool calls, events, "
        "model metadata, token usage, and execution errors."
    ),
)
async def get_trace_detail(
    trace_id: UUID,
    trace_service: TraceServiceDependency,
) -> TraceDetailResponse:
    try:
        return await trace_service.get_trace_detail(trace_id)
    except TraceNotFoundError as error:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Trace {error.trace_id} was not found.",
        ) from error
