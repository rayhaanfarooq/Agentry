from typing import Annotated

from fastapi import Depends

from app.dependencies.database import DatabaseSession
from app.repositories.traces import TraceRepository
from app.services.traces import TraceService


def get_trace_repository(session: DatabaseSession) -> TraceRepository:
    return TraceRepository(session=session)


TraceRepositoryDependency = Annotated[TraceRepository, Depends(get_trace_repository)]


def get_trace_service(repository: TraceRepositoryDependency) -> TraceService:
    return TraceService(repository=repository)


TraceServiceDependency = Annotated[TraceService, Depends(get_trace_service)]

__all__ = [
    "TraceRepositoryDependency",
    "TraceServiceDependency",
    "get_trace_repository",
    "get_trace_service",
]
