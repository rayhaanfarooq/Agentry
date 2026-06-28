# Agentry

Agentry is a monorepo for the Phase 1 MVP foundation of an AI developer
platform focused on reliable AI agent development.

This milestone is intentionally narrow: build a production-ready foundation for
the backend, dashboard, landing page, local tooling, and Supabase-backed
infrastructure so future tracing, evaluations, and observability work has a
clean place to live.

## Architecture

- `backend/`: FastAPI, SQLAlchemy, AsyncPG, and Supabase-backed PostgreSQL connectivity
- `frontend/`: React dashboard scaffold with a health page wired to backend and Supabase checks
- `landingpage/`: Separate React marketing site with infrastructure-focused positioning
- `dummy-agent/`: Standalone Gemini-powered reference agent for demos, local validation, and future SDK testing
- `sdk/python/`: Official Python SDK for lightweight tracing instrumentation
- `context/`: Focused architecture and workflow documents for human and AI onboarding
- `scripts/`: Root developer workflow commands for install, dev, lint, format, typecheck, and test
- `supabase/`: Supabase CLI project configuration, migrations, and local development settings

Each application remains independent, with its own dependencies, environment
file, and build process. The root of the repo exists to orchestrate them
cleanly.

## Repository Structure

```text
agentry/
├── backend/
├── frontend/
├── landingpage/
├── dummy-agent/
├── context/
├── sdk/
├── scripts/
├── supabase/
├── .githooks/
├── .gitignore
├── package.json
└── README.md
```

## Technology Stack

- Backend: Python 3.12+, FastAPI, SQLAlchemy 2.x, Pydantic Settings, Uvicorn, AsyncPG, HTTPX
- Frontend dashboard: React, TypeScript, Vite, React Router, TanStack Query, TailwindCSS, shadcn-style UI primitives
- Landing page: React, TypeScript, Vite
- Dummy agent: Python 3.12+, Pydantic, python-dotenv, HTTPX, Rich
- Python SDK: Python 3.12+, Pydantic, HTTPX, contextvars, background batching
- Database and infrastructure: Supabase PostgreSQL, Supabase CLI, and local Supabase services

## Context Docs

- Canonical architecture and workflow docs live in [`context/`](./context/README.md).
- New contributors should start there when they need:
  - system architecture
  - repository structure
  - backend or frontend editing guidance
  - design rules
  - current roadmap and major decisions

## Prerequisites

- Node.js 20+
- Python 3.12+
- Docker Desktop or another Docker runtime if you plan to use local Supabase

## Quick Start

1. Install everything from the repository root:

   ```bash
   npm install
   ```

   This command:

   - installs the Supabase CLI as a root development dependency
   - creates `dummy-agent/.venv`
   - installs dummy-agent development dependencies
   - creates `sdk/python/.venv`
   - installs Python SDK development dependencies
   - installs frontend dependencies
   - installs landing page dependencies
   - creates `backend/.venv`
   - installs backend development dependencies
   - copies missing `.env` files from their `.env.example` templates
   - configures the Git pre-commit hook path

2. Choose a database workflow:

   Local Supabase:

   ```bash
   npm run supabase:start
   npm run supabase:status:env
   ```

   Copy the reported values into `backend/.env`.

   Hosted Supabase:

   Update `backend/.env` with your project `DATABASE_URL`, `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

3. Start the entire platform:

   ```bash
   npm run dev
   ```

4. Open the local apps:

   - Backend: `http://localhost:8000`
   - Dashboard: `http://localhost:5173`
   - Landing page: `http://localhost:3000`

5. Start the reference agent when needed:

   ```bash
   npm run dev:dummy-agent
   ```

## Environment

Every app has its own `.env.example`.

### Backend

```bash
DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PORT=8000
ENVIRONMENT=development
LOG_LEVEL=INFO
APP_NAME=Agentry
APP_VERSION=0.0.1
```

`DATABASE_URL` remains the only database connection string used by SQLAlchemy.
The Supabase URL and keys support infrastructure checks now and future
Auth/Storage integration later.

### Frontend

```bash
VITE_API_URL=http://localhost:8000
PORT=5173
HOST=0.0.0.0
PREVIEW_PORT=4173
```

### Landing Page

```bash
VITE_API_URL=http://localhost:8000
PORT=3000
HOST=0.0.0.0
PREVIEW_PORT=4000
```

### Dummy Agent

```bash
GEMINI_API_KEY=
AGENTRY_API_URL=http://localhost:8000
AGENTRY_API_KEY=
```

Each app validates the environment it depends on and fails early when required
values are missing or invalid.

## Root Commands

Run all commands from `/Users/rayhaanfarooq/Desktop/Agentry`.

- `npm install`: first-time setup for all applications
- `npm run setup`: rerun the shared setup flow manually
- `npm run dev`: start backend, dashboard, and landing page together with prefixed logs
- `npm run dev:backend`: start only FastAPI on port `8000`
- `npm run dev:frontend`: start only the dashboard on port `5173`
- `npm run dev:landing`: start only the landing page on port `3000`
- `npm run dev:dummy-agent`: start the interactive Gemini reference agent
- `npm run supabase:start`: start the local Supabase stack
- `npm run supabase:stop`: stop the local Supabase stack
- `npm run supabase:status`: inspect the local Supabase stack
- `npm run supabase:status:env`: print local Supabase URLs and keys as env vars
- `npm run supabase:migration:list`: list local and remote migration history
- `npm run supabase:migration:new -- <name>`: create an empty migration
- `npm run supabase:db:diff -- --local -f <name>`: generate a migration from local schema changes
- `npm run supabase:db:reset`: reset the local database and apply tracked migrations
- `npm run supabase:migration:up`: apply pending migrations to the local database
- `npm run supabase:login`: authenticate the CLI with Supabase
- `npm run supabase:link -- --project-ref <ref>`: link this repo to a hosted Supabase project
- `npm run supabase:db:pull -- <name>`: pull schema changes from the linked project into a migration
- `npm run supabase:db:push`: apply local migrations to the linked remote project
- `npm run lint`: run Ruff, ESLint, and other lint checks across the repo
- `npm run format`: run Python and Prettier formatting across the repo
- `npm run typecheck`: run Mypy and TypeScript checks
- `npm run test`: run the current automated test suite

The `dev` command prefixes output with `[backend]`, `[frontend]`, and
`[landing]` so it is obvious which process produced each line. If one process
exits unexpectedly, the root command stops the others and reports it clearly.
`dev:dummy-agent` is intentionally separate because it is an interactive CLI,
not a background service.

## Supabase Workflow

### Local Development

```bash
npm run supabase:start
npm run supabase:status:env
npm run supabase:migration:new -- add_projects
npm run supabase:db:diff -- --local -f add_projects
npm run supabase:db:reset
npm run supabase:migration:up
```

### Hosted Project Workflow

```bash
npm run supabase:login
npm run supabase:link -- --project-ref your-project-ref
npm run supabase:db:pull -- baseline_remote
npm run supabase:db:push
```

## Development Workflow

1. Run `npm install` after cloning.
2. Start local Supabase with `npm run supabase:start` or point `backend/.env` at a hosted project.
3. Use `npm run dev` for daily work.
4. Use `npm run dev:dummy-agent` when you want to validate agent behavior locally.
5. Create and apply schema changes through the Supabase CLI workflow in `supabase/migrations`.
6. Use `npm run lint`, `npm run typecheck`, and `npm run test` before shipping changes.
7. Commit normally. The configured pre-commit hook runs linting, type checks, and tests from the repo root.

## App Notes

### Backend

- FastAPI app factory with async lifespan wiring
- SQLAlchemy async engine and session management
- Supabase-first environment validation for database, Auth, and Storage credentials
- Supabase CLI project and migrations live in `/supabase`
- `/health` performs a real PostgreSQL ping and a lightweight Supabase connectivity check

### Frontend

- Typed API client ready for future endpoints
- Health page verifies backend reachability, database status, Supabase status, latency, and raw response data
- Trace Explorer includes trace list and detail workflows with timeline, prompts, tool calls, metadata, and raw JSON inspection
- React Router and TanStack Query foundation are in place for future product surfaces

### Landing Page

- Separate deployable React application
- Infrastructure-style marketing layout with product mockups, code examples, pricing, and FAQ sections
- Styled to feel calm, technical, and premium rather than like a generic AI startup

### Dummy Agent

- Standalone terminal chat client powered by Gemini over direct HTTP
- Keeps a simple local tool registry ready for future tracing and SDK validation
- Stays intentionally small so new Agentry features can be exercised without extra application complexity

### Python SDK

- Installable `agentry` package under `sdk/python`
- Exposes `from agentry import monitor` as the primary instrumentation API
- Supports decorator-based traces, context managers, async functions, batching, and retrying uploads

## Future Roadmap

- Authentication and Supabase Auth integration
- Supabase Storage-backed uploads
- Dummy-agent trace emission and SDK instrumentation
- Backend trace ingestion for SDK payloads
- Trace ingestion and observability surfaces
- Evaluation workflows and benchmarking
- Debugging and memory inspection product areas
- CI workflows and deployment automation

## Contributing

- Keep the three apps independent unless shared orchestration is clearly needed at the root.
- Prefer root commands over manually changing directories for common workflows.
- Use the backend virtual environment in `backend/.venv`.
- Treat Supabase as infrastructure, not as an application SDK replacement.
- Avoid introducing milestone-two features such as auth, tracing ingestion, or full observability unless explicitly requested.
