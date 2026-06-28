# Agentry Backend

Production-ready FastAPI backend scaffold for Agentry.

## Highlights

- FastAPI application factory with centralized router registration
- Async SQLAlchemy + AsyncPG session management
- Supabase-first environment validation and infrastructure wiring
- Pydantic Settings environment loading
- Dependency injection across routes, services, and repositories
- Centralized Python logging
- Global exception handling with consistent JSON error responses
- PostgreSQL + Supabase-backed `/health` endpoint
- CORS configured for local frontend development
- Tooling scaffold for Ruff, Black, Mypy, and pytest

## Project Structure

```text
backend/
├── app/
│   ├── api/
│   ├── core/
│   ├── db/
│   ├── dependencies/
│   ├── integrations/
│   ├── models/
│   ├── repositories/
│   ├── schemas/
│   ├── services/
│   └── main.py
├── tests/
├── .env.example
├── main.py
├── pyproject.toml
└── requirements.txt
```

Supabase CLI configuration and migrations live in the repository root under
`/Users/rayhaanfarooq/Desktop/Agentry/supabase`.

## Environment

Copy `.env.example` to `.env` and populate:

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
`SUPABASE_URL`, `SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` support
infrastructure checks today and future Auth/Storage integration later.

## Local Development

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
uvicorn main:app --reload
```

From the repository root you can also use the shared monorepo commands:

```bash
npm install
npm run dev:backend
```

## Supabase Workflow

```bash
npm run supabase:start
npm run supabase:status:env
npm run supabase:migration:new -- add_projects
npm run supabase:db:diff -- --local -f add_projects
npm run supabase:db:reset
npm run supabase:migration:up
```

To work against a hosted Supabase project:

```bash
npm run supabase:login
npm run supabase:link -- --project-ref your-project-ref
npm run supabase:db:pull -- baseline_remote
npm run supabase:db:push
```

## Quality Checks

```bash
ruff check .
black --check .
mypy .
pytest
```

## Health Endpoint

`GET /health`

Healthy response:

```json
{
  "status": "healthy",
  "api": "healthy",
  "database": "connected",
  "supabase": "connected",
  "version": "0.0.1"
}
```

If PostgreSQL or Supabase connectivity is unavailable, the endpoint returns HTTP
`503` with:

```json
{
  "status": "unhealthy",
  "api": "healthy",
  "database": "disconnected",
  "supabase": "disconnected",
  "version": "0.0.1"
}
```
