# Repository Structure

## Why A Monorepo

- Agentry has multiple independent applications that still need a shared developer workflow.
- The monorepo keeps:
  - backend
  - dashboard
  - landing page
  - SDK
  - dummy agent
  - Supabase config
  - context docs
  in one place without forcing them into one runtime or package manager.

## Root Directories

- `backend/`
  - FastAPI application
- `frontend/`
  - authenticated dashboard
- `landingpage/`
  - public marketing site
- `dummy-agent/`
  - standalone reference AI agent
- `sdk/python/`
  - Python instrumentation SDK
- `scripts/`
  - root development commands and setup automation
- `supabase/`
  - CLI config, migrations, and seed data
- `context/`
  - canonical architecture and workflow docs
- `.githooks/`
  - shared Git hooks

## Placement Rules

### Put Code In `backend/` When

- you are adding API routes
- you are changing business logic
- you are changing repository behavior
- you are adding schemas or database-backed services

### Put Code In `frontend/` When

- you are building authenticated product UI
- you are adding dashboard routes
- you are creating product-facing React feature slices

### Put Code In `landingpage/` When

- you are changing public marketing content
- you are adding demos, pricing, or product storytelling sections

### Put Code In `dummy-agent/` When

- you need a small local reference application
- you are validating SDK behavior or developer workflows
- you want a simple AI client without backend coupling

### Put Code In `sdk/python/` When

- you are changing developer instrumentation behavior
- you are modifying transport, batching, tracing, decorators, or configuration

### Put Code In `supabase/` When

- you are adding or updating tracked database migrations
- you are changing Supabase local configuration

### Put Docs In `context/` When

- the change affects architecture
- the change affects workflow
- the change changes terminology
- the change introduces a new long-lived subsystem

## Frontend Substructure

- add product code under `features/<feature>/`
- use `components/ui/` for shared primitives
- use `components/common/` when multiple features share the same page block

## Backend Substructure

- routes in `api/routes/`
- DI in `dependencies/`
- logic in `services/`
- persistence in `repositories/`
- contracts in `schemas/`

## Where New Code Should Usually Live

- New trace backend endpoint
  - `backend/app/api/routes/`
  - `backend/app/services/`
  - `backend/app/repositories/`
  - `backend/app/schemas/`
- New dashboard page
  - `frontend/src/features/<feature>/`
- New migration
  - `supabase/migrations/`
- New long-lived architecture explanation
  - `context/`

## Anti-Patterns

- Do not mix landing page code into the dashboard.
- Do not put backend business logic in SQL migration files.
- Do not place shared repository-wide docs only inside one app folder.
- Do not create overlapping architecture docs outside `context/` without a clear need.

## Read Next

- [architecture.md](./architecture.md)
- [developer-workflow.md](./developer-workflow.md)
