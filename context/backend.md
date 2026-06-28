# Backend

## Purpose

- The backend is a FastAPI application.
- It owns business logic, validation, persistence orchestration, and HTTP contracts.
- It is not a thin proxy around Supabase.

## Backend Structure

```text
backend/app/
  api/
  core/
  db/
  dependencies/
  integrations/
  models/
  repositories/
  schemas/
  services/
  main.py
```

## Directory Responsibilities

- `api/`
  - route registration
  - endpoint definitions
  - status codes and OpenAPI metadata
- `core/`
  - settings
  - logging
  - exception handling
- `db/`
  - SQLAlchemy base, engine, and session factory creation
- `dependencies/`
  - typed `Depends(...)` wrappers for routes and services
- `integrations/supabase/`
  - future-facing Supabase-specific infrastructure helpers
- `models/`
  - SQLAlchemy ORM models
- `repositories/`
  - database querying and persistence logic
- `schemas/`
  - strict request and response models
- `services/`
  - business workflows and response assembly

## Application Lifecycle

- `app/main.py` is the real application entrypoint.
- Startup creates:
  - validated settings
  - async SQLAlchemy engine
  - async session factory
- These are stored on `application.state`.
- Shutdown disposes the database engine cleanly.

## Request Flow

1. A route receives HTTP input.
2. FastAPI resolves dependencies from `dependencies/`.
3. A service is created with repository dependencies.
4. The service coordinates business logic.
5. The repository executes SQLAlchemy operations.
6. The service maps ORM results into response schemas.
7. FastAPI serializes the final response.

## Dependency Injection

- DI is explicit and typed.
- Each dependency module exposes:
  - factory functions such as `get_trace_service`
  - `Annotated[...]` aliases such as `TraceServiceDependency`
- Routes should depend on services, not repositories directly, unless there is a strong reason not to.

## Current Feature Areas

### Health

- Route: `GET /health`
- Verifies:
  - API runtime is up
  - PostgreSQL connectivity works
  - Supabase project endpoint is reachable

### Trace Ingestion and Retrieval

- Routes:
  - `POST /v1/traces`
  - `GET /v1/traces`
  - `GET /v1/traces/{trace_id}`
- Trace-related logic lives in:
  - `schemas/traces.py`
  - `models/traces.py`
  - `repositories/traces.py`
  - `services/traces.py`
  - `api/routes/traces.py`

## Configuration

- Settings use Pydantic Settings.
- Required infrastructure variables:
  - `DATABASE_URL`
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
- Validation fails early on:
  - empty values
  - placeholder Supabase values
  - malformed CORS configuration

## Database Philosophy

- SQLAlchemy is the application-facing persistence layer.
- Repositories are the only place where query construction should live.
- Services should reason in domain terms, not SQL terms.

## Logging And Errors

- Logging is configured centrally from `core/logging.py`.
- Exception handlers are registered centrally from `core/exceptions.py`.
- Prefer consistent JSON errors over route-specific ad hoc error payloads.

## Coding Rules

- Keep routes thin.
- Keep repositories focused on persistence only.
- Keep business decisions in services.
- Keep schemas strict with `extra="forbid"` where appropriate.
- Add tests for configuration changes, services, and API behavior.

## Future-Ready Areas

- `dependencies/auth.py`
  - reserved for Supabase Auth integration
- `integrations/supabase/storage.py`
  - reserved for storage integration
- current layering should survive additions such as:
  - organizations
  - projects
  - evaluations
  - API keys

## Read Next

- [architecture.md](./architecture.md)
- [database.md](./database.md)
- [decision-log.md](./decision-log.md)
