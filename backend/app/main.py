from __future__ import annotations

from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.router import api_router
from app.core.config import get_settings
from app.core.exceptions import register_exception_handlers
from app.core.logging import configure_logging, get_logger
from app.db.database import create_database_engine, create_session_factory

settings = get_settings()
configure_logging(settings.log_level)
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(application: FastAPI) -> AsyncIterator[None]:
    engine = create_database_engine(settings)
    session_factory = create_session_factory(engine)

    application.state.settings = settings
    application.state.db_engine = engine
    application.state.session_factory = session_factory

    logger.info(
        "Application startup complete.",
        extra={
            "environment": settings.environment,
            "version": settings.app_version,
        },
    )
    try:
        yield
    finally:
        await engine.dispose()
        logger.info("Application shutdown complete.")


def create_application() -> FastAPI:
    application = FastAPI(
        title=settings.app_name,
        version=settings.app_version,
        summary="Backend foundation for the Runloop platform.",
        description=(
            "Production-ready FastAPI scaffold for Runloop, designed to support "
            "future tracing, evaluations, debugging, and "
            "developer infrastructure features."
        ),
        lifespan=lifespan,
    )

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    register_exception_handlers(application)
    application.include_router(api_router)

    return application


app = create_application()

__all__ = ["app", "create_application"]
