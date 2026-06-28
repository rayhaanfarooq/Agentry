# Agentry

Agentry is a monorepo for the Phase 1 MVP foundation of an AI developer platform focused on reliable AI agent development.

## Applications

- `backend/`: FastAPI + SQLAlchemy + Alembic + PostgreSQL
- `frontend/`: React dashboard scaffold for internal product surfaces
- `landingpage/`: Separate React landing page scaffold

Each application is intentionally independent, with its own dependencies, environment variables, and build process.

## Repository Layout

```text
agentry/
├── backend/
├── frontend/
├── landingpage/
├── .gitignore
└── README.md
```

## Quick Start

### Backend

1. Copy `backend/.env.example` to `backend/.env`.
2. Install dependencies:

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   ```

3. Run migrations when models are added:

   ```bash
   alembic upgrade head
   ```

4. Start the API:

   ```bash
   uvicorn main:app --reload
   ```

### Frontend

1. Copy `frontend/.env.example` to `frontend/.env`.
2. Install dependencies and start the dashboard:

   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Landing Page

1. Copy `landingpage/.env.example` to `landingpage/.env`.
2. Install dependencies and start the app:

   ```bash
   cd landingpage
   npm install
   npm run dev
   ```

## Environment Variables

### Backend

```bash
DATABASE_URL=
SUPABASE_URL=
SUPABASE_ANON_KEY=
```

### Frontend

```bash
VITE_API_URL=
```

### Landing Page

```bash
VITE_API_URL=
```

## Phase 1 Scope

This milestone includes:

- Backend scaffold
- Frontend scaffold
- Landing page scaffold
- Environment configuration
- SQLAlchemy setup
- Alembic setup
- Supabase PostgreSQL connectivity via `DATABASE_URL`
- A database-backed `/health` endpoint
- A frontend health page that calls the backend

This milestone intentionally excludes authentication, observability, tracing, and evaluations.
