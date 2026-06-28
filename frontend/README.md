# Agentry Frontend

Phase 1 dashboard scaffold for Agentry.

## Highlights

- React + TypeScript + Vite foundation
- Feature-based folder structure
- React Router application shell with sidebar and header
- TanStack Query for server state
- TailwindCSS + shadcn-style UI primitives
- Zod-backed environment validation
- Centralized API client for future endpoints
- Dashboard placeholder page
- Health page that verifies backend and database connectivity
- Trace Explorer list and detail pages for browsing stored executions

## Structure

```text
frontend/
├── src/
│   ├── app/
│   ├── components/
│   │   ├── common/
│   │   ├── layout/
│   │   └── ui/
│   ├── features/
│   │   ├── dashboard/
│   │   └── health/
│   ├── lib/
│   ├── types/
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── package.json
├── tailwind.config.ts
├── tsconfig.json
└── vite.config.ts
```

## Environment

Copy `.env.example` to `.env` and set:

```bash
VITE_API_URL=http://localhost:8000
PORT=5173
HOST=0.0.0.0
```

The app validates `VITE_API_URL` with Zod and fails clearly if it is missing or invalid.

## Development

```bash
npm install
npm run dev
```

From the repository root you can also run:

```bash
npm install
npm run dev:frontend
```

## Quality Checks

```bash
npm run lint
npm run typecheck
npm run build
npm run format:check
```

## Current Scope

This frontend currently includes:

- App shell
- Dashboard placeholder
- Backend health page
- Trace Explorer list page
- Trace Explorer detail page
- Shared frontend foundation for future features

Authentication, evals, billing, and project management are still intentionally out of scope for the current milestone set.
