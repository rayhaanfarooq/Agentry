from collections.abc import AsyncIterator

import pytest
import pytest_asyncio
from app.core.config import Settings
from app.db import Base
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.pool import StaticPool


@pytest.fixture
def backend_settings() -> Settings:
    return Settings.model_validate(
        {
            "DATABASE_URL": "postgresql://postgres:password@localhost:5432/agentry",
            "SUPABASE_URL": "http://127.0.0.1:54321",
            "SUPABASE_ANON_KEY": "local-anon-key",
            "SUPABASE_SERVICE_ROLE_KEY": "local-service-role-key",
            "APP_VERSION": "0.0.1",
        }
    )


@pytest_asyncio.fixture
async def db_session() -> AsyncIterator[AsyncSession]:
    # Import models before create_all so the test metadata contains the trace tables.
    from app.models import SpanModel, ToolCallModel, TraceEventModel, TraceModel

    _ = (SpanModel, ToolCallModel, TraceEventModel, TraceModel)

    engine = create_async_engine(
        "sqlite+aiosqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)

    session_factory = async_sessionmaker(
        bind=engine,
        class_=AsyncSession,
        autoflush=False,
        expire_on_commit=False,
    )

    async with session_factory() as session:
        yield session

    await engine.dispose()
