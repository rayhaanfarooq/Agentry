# Database

## Purpose

- Supabase provides Runloop's managed PostgreSQL infrastructure.
- SQLAlchemy remains the application-facing persistence layer.
- Database architecture should support long-term observability and evaluation workflows without coupling business logic to Supabase SDKs.

## Ownership Model

- Supabase owns:
  - hosted PostgreSQL
  - migration workflow
  - future Auth and Storage infrastructure
- FastAPI owns:
  - validation
  - business logic
  - repositories
  - API contracts

## Current Access Pattern

- Only `DATABASE_URL` is used for SQLAlchemy CRUD access.
- Repositories talk to the database through async SQLAlchemy sessions.
- Services depend on repositories, not raw sessions.
- The backend rejects local Supabase URLs and requires a hosted HTTPS `SUPABASE_URL`.

## Current Schema Focus

- `traces`
  - root execution records
- `spans`
  - nested execution steps
- `tool_calls`
  - tool invocation metadata
- `trace_events`
  - ordered annotations and event payloads

## Relationships

- A trace has many spans.
- A trace has many tool calls.
- A trace has many events.
- A span may reference a parent span.
- Tool calls may reference the span they belong to.
- Trace events may reference the span they belong to.

## Migration Workflow

- Migrations live in `supabase/migrations/`.
- Supabase CLI is the migration system of record against a linked hosted project.
- Alembic is intentionally not used.
- Common commands:
  - `npm run supabase:login`
  - `npm run supabase:link -- --project-ref <ref>`
  - `npm run supabase:migration:new -- <name>`
  - `npm run supabase:db:diff -- -f <name>`
  - `npm run supabase:db:pull -- <name>`
  - `npm run supabase:db:push`

## Hosted Setup

1. Create a Supabase project.
2. Copy `DATABASE_URL`, `SUPABASE_URL`, publishable key, and secret key into `backend/.env`.
3. Link the repo with `npm run supabase:link`.
4. Apply migrations with `npm run supabase:db:push`.

## Modeling Principles

- ORM models define storage structure.
- Pydantic schemas define API contracts.
- Repositories translate between schemas and models.
- Supabase-specific concepts should not leak into domain logic unless the feature is truly infrastructure-specific.

## Future Schema Areas

- organizations
- projects
- evaluations
- prompt versions
- memory / retrieval artifacts
- API keys
- storage metadata
- access control data tied to future Auth

## What To Avoid

- Do not put business logic into ad hoc SQL functions unless there is a strong reason.
- Do not couple frontend code to Supabase database primitives.
- Do not bypass repositories from services or routes.
- Do not configure local Supabase endpoints in application env files.

## Read Next

- [backend.md](./backend.md)
- [technology.md](./technology.md)
- [roadmap.md](./roadmap.md)
