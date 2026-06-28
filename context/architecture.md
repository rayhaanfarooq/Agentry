# Architecture

## System Shape

- Agentry is a monorepo with independent applications plus shared workflow tooling.
- The current platform has five major product surfaces:
  - `backend/`: FastAPI application and persistence layer
  - `frontend/`: authenticated dashboard
  - `landingpage/`: public marketing site
  - `dummy-agent/`: standalone reference AI agent
  - `sdk/python/`: developer instrumentation SDK
- `supabase/` holds infrastructure configuration and migrations.
- `context/` documents how all of the above fit together.

## Core Principles

- Supabase is infrastructure, not the application layer.
- FastAPI owns business logic, validation, and API contracts.
- SQLAlchemy remains the database access layer.
- Each root app is deployable independently.
- Context and architecture docs are treated as product assets.

## Current Runtime Topology

- Landing page
  - Public React app
  - Independent deploy target
  - Primarily communicates product positioning
- Dashboard
  - React app for authenticated product workflows
  - Calls backend over HTTP through a typed API client
- Backend
  - Async FastAPI service
  - Owns validation, services, repositories, and persistence
- Database
  - Supabase-managed PostgreSQL
  - Accessed by SQLAlchemy only
- SDK
  - Runs inside customer or internal Python applications
  - Batches trace payloads and uploads them to the backend
- Dummy agent
  - Runs locally in the terminal
  - Talks directly to Gemini today
  - Exists to validate future SDK and backend behavior

## Current Product Flow

### Dashboard Trace Explorer

1. A browser loads the React dashboard.
2. The dashboard routes to `/traces` or `/traces/:traceId`.
3. Feature API helpers call the backend through the shared API client.
4. FastAPI routes resolve dependencies and invoke services.
5. Services call repositories.
6. Repositories query Supabase PostgreSQL through SQLAlchemy.
7. The backend returns typed JSON payloads.
8. TanStack Query caches the response and the UI renders cards, tables, and inspectors.

### SDK Trace Ingestion

1. A Python application instruments work with `monitor.trace(...)` or `monitor.span(...)`.
2. The SDK collects execution metadata in memory.
3. The batch processor groups traces and retries failed uploads.
4. The SDK posts trace batches to `POST /v1/traces`.
5. The backend validates nested trace payloads and stores them in PostgreSQL.
6. The dashboard later reads those traces through list and detail endpoints.

### Dummy Agent Validation Loop

1. A developer runs `python main.py` or `npm run dev:dummy-agent`.
2. The dummy agent loads environment and prompt context.
3. It sends a user prompt to Gemini over HTTP.
4. It returns the model response in the terminal.
5. Future SDK instrumentation can be added without restructuring the app.

## Backend Layering

- `api/`
  - HTTP routes only
- `dependencies/`
  - FastAPI dependency wiring
- `services/`
  - business logic and response shaping
- `repositories/`
  - database reads and writes
- `models/`
  - SQLAlchemy ORM models
- `schemas/`
  - Pydantic request and response contracts
- `integrations/`
  - infrastructure-specific adapters such as Supabase helpers

## Frontend Layering

- `app/`
  - providers and router
- `components/common/`
  - reusable page-level building blocks
- `components/layout/`
  - shell and top-level structure
- `components/ui/`
  - styling primitives
- `features/*`
  - route-owned vertical slices
- `lib/`
  - shared API and environment utilities

## Database Boundary

- Repositories know SQLAlchemy and model structure.
- Services do not know SQL syntax.
- Frontend does not know Supabase internals.
- Supabase-specific details stay in configuration, infrastructure docs, and workflow commands.

## Expansion Path

- Current architecture is designed to grow into:
  - evaluations
  - memory analysis
  - authentication
  - projects and organizations
  - storage
  - realtime collaboration
  - API key management

## Read Next

- [backend.md](./backend.md)
- [frontend.md](./frontend.md)
- [database.md](./database.md)
