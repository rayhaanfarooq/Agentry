# Technology

## Selection Philosophy

- Every major technology should support:
  - clear architecture
  - fast iteration
  - long-term maintainability
  - AI-agent-friendly retrieval and modification

## Backend

### FastAPI

- Chosen for:
  - typed request and response handling
  - async support
  - clean dependency injection
  - strong OpenAPI generation
- Why it fits Runloop:
  - the product needs many infrastructure-style APIs
  - service boundaries stay explicit

### SQLAlchemy 2.x

- Chosen for:
  - strong Python ORM support
  - explicit query construction
  - async session support
  - portability beyond a single hosted provider
- Why it fits Runloop:
  - business logic stays in Python instead of moving into vendor SDKs

### Pydantic Settings

- Chosen for:
  - strict environment validation
  - typed config
  - fail-fast startup behavior
- Why it fits Runloop:
  - infrastructure-heavy products need configuration errors to be obvious immediately

## Infrastructure

### Supabase

- Chosen for:
  - managed PostgreSQL
  - local development tooling
  - future Auth and Storage support
- Why it fits Runloop:
  - it accelerates infrastructure setup without replacing application architecture

### Supabase CLI

- Chosen for:
  - local stack management
  - versioned SQL migrations
  - remote project linking
- Why it fits Runloop:
  - it creates a native Supabase workflow without giving up SQLAlchemy

## Frontend

### React

- Chosen for:
  - mature component model
  - broad ecosystem
  - fit for product dashboards and marketing sites

### TypeScript

- Chosen for:
  - reliable contracts
  - better refactors
  - stronger agent and human comprehension across UI code

### Vite

- Chosen for:
  - fast local startup
  - simple build pipeline
  - low ceremony for separate frontend apps

### React Router

- Chosen for:
  - clear route ownership
  - lightweight structure
  - good fit for feature-based screens

### TanStack Query

- Chosen for:
  - server-state caching
  - request lifecycle management
  - background refetch support
- Why it fits Runloop:
  - dashboard workflows are backend-driven and benefit from explicit async state handling

### TailwindCSS

- Chosen for:
  - fast UI construction
  - consistent utility vocabulary
  - easy alignment with a constrained design language

## SDK And Reference App

### Python SDK

- Chosen because:
  - many AI applications are Python-first
  - tracing decorators and context managers feel natural in Python
  - backend ingestion already speaks JSON over HTTP

### Dummy Agent + Gemini

- Chosen because:
  - the repo needs a small, independent AI client for validation
  - Gemini is sufficient for a simple reference loop
  - the dummy agent stays decoupled from backend internals

## Tooling

### Ruff, Black, Mypy, pytest

- Chosen for:
  - fast Python feedback loops
  - consistent formatting
  - type enforcement
  - automated backend and SDK verification

### ESLint and Prettier

- Chosen for:
  - predictable frontend formatting
  - fast lint feedback
  - lower style churn in reviews

## Technologies Intentionally Not Used For Core CRUD

- Supabase Python client
  - not used for normal backend persistence
- Alembic
  - not used because Supabase CLI is the migration system of record
- Global frontend state store
  - not added yet because TanStack Query plus route state covers current needs

## Read Next

- [decision-log.md](./decision-log.md)
- [database.md](./database.md)
