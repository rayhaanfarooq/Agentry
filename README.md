# Runloop

Runloop is an AI eval system for teams building agentic applications. This
monorepo contains the Phase 1 MVP foundation: backend, dashboard, landing
page, local tooling, and Supabase-backed infrastructure for tracing,
evaluations, and observability.

## Architecture

- `backend/`: FastAPI, SQLAlchemy, AsyncPG, and Supabase-backed PostgreSQL connectivity
- `frontend/`: React dashboard scaffold with a health page wired to backend and Supabase checks
- `landingpage/`: Separate React marketing site with infrastructure-focused positioning
- `dummy-agent/`: Standalone Gemini-powered reference agent for demos, local validation, and future SDK testing
- `sdk/python/`: Official Python SDK for lightweight tracing instrumentation
- `context/`: Focused architecture and workflow documents for human and AI onboarding
- `skills/`: Cursor Agent Skills you can add from online or author for this repo
- `scripts/`: Root developer workflow commands for install, dev, lint, format, typecheck, and test
- `supabase/`: Supabase CLI migrations and hosted project linkage

Each application remains independent, with its own dependencies, environment
file, and build process. The root of the repo exists to orchestrate them
cleanly.

## Repository Structure

```text
runloop/
├── backend/
├── frontend/
├── landingpage/
├── dummy-agent/
├── context/
├── skills/
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
- Database and infrastructure: hosted Supabase PostgreSQL and Supabase CLI migrations

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
- A hosted Supabase project (free tier is fine)

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

2. Configure hosted Supabase in `backend/.env`:

   - Create a project at [supabase.com](https://supabase.com)
   - Copy `DATABASE_URL`, `SUPABASE_URL`, publishable key, and secret key from the dashboard
   - See `backend/.env.example` for the expected format

3. Link the repo and apply migrations:

   ```bash
   npm run supabase:login
   npm run supabase:link -- --project-ref your-project-ref
   npm run supabase:db:push
   ```

4. Start the entire platform:

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
DATABASE_URL=postgresql://postgres:YOUR_DB_PASSWORD@db.YOUR_PROJECT_REF.supabase.co:5432/postgres
SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
PORT=8000
ENVIRONMENT=development
LOG_LEVEL=INFO
APP_NAME=Runloop
APP_VERSION=0.0.1
```

`DATABASE_URL` remains the only database connection string used by SQLAlchemy.
`SUPABASE_URL` must be a hosted HTTPS project URL. Local Supabase URLs are rejected.
The publishable and secret API keys support infrastructure checks now and future
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
RUNLOOP_API_URL=http://localhost:8000
RUNLOOP_API_KEY=
```

Each app validates the environment it depends on and fails early when required
values are missing or invalid.

## Root Commands

Run all commands from `/Users/rayhaanfarooq/Desktop/Runloop`.

- `npm install`: first-time setup for all applications
- `npm run setup`: rerun the shared setup flow manually
- `npm run dev`: start backend, dashboard, and landing page together with prefixed logs
- `npm run dev:backend`: start only FastAPI on port `8000`
- `npm run dev:frontend`: start only the dashboard on port `5173`
- `npm run dev:landing`: start only the landing page on port `3000`
- `npm run dev:dummy-agent`: start the interactive Gemini reference agent
- `npm run supabase:login`: authenticate the Supabase CLI
- `npm run supabase:link -- --project-ref <ref>`: link this repo to your hosted Supabase project
- `npm run supabase:migration:list`: list migration history for the linked project
- `npm run supabase:migration:new -- <name>`: create an empty migration
- `npm run supabase:db:diff -- -f <name>`: generate a migration from linked project schema changes
- `npm run supabase:db:pull -- <name>`: pull schema changes from the linked project into a migration
- `npm run supabase:db:push`: apply local migrations to the linked hosted project
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

Runloop uses **hosted Supabase only**. Migrations live in `supabase/migrations/`.

```bash
npm run supabase:login
npm run supabase:link -- --project-ref your-project-ref
npm run supabase:migration:new -- add_projects
npm run supabase:db:diff -- -f add_projects
npm run supabase:db:push
```

## Development Workflow

1. Run `npm install` after cloning.
2. Point `backend/.env` at your hosted Supabase project and run `npm run supabase:db:push`.
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
- Stays intentionally small so new Runloop features can be exercised without extra application complexity

### Python SDK

- Installable `runloop` package under `sdk/python`
- Exposes `from runloop import monitor` as the primary instrumentation API
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
