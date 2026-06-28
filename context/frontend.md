# Frontend

## Purpose

- The dashboard is a React + TypeScript application.
- It is the authenticated product surface for Agentry workflows.
- Today it proves and exercises:
  - application shell
  - backend health checks
  - trace explorer list and detail views

## Frontend Structure

```text
frontend/src/
  app/
  components/
    common/
    layout/
    ui/
  features/
    dashboard/
    health/
    traces/
  lib/
  types/
  App.tsx
  main.tsx
```

## Boot Flow

1. `main.tsx` renders `App`.
2. `App.tsx` validates environment eagerly.
3. `AppProviders` configures TanStack Query.
4. `RouterProvider` mounts the route tree.
5. `AppShell` provides the sidebar, header, and content frame.
6. Route-owned feature pages render inside the shell.

## Route Ownership

- `/`
  - dashboard placeholder
- `/health`
  - infrastructure verification UI
- `/traces`
  - trace list with search, sorting, pagination, and filters
- `/traces/:traceId`
  - trace detail, timeline, prompts, tool calls, metadata, and raw JSON

## Architecture Principles

- Use feature slices for product surfaces.
- Keep route-specific logic inside `features/<name>/`.
- Use shared UI primitives from `components/ui/`.
- Use `components/common/` for cross-feature page building blocks.
- Use `lib/` for framework-agnostic helpers such as env parsing and the API client.

## State Management

- TanStack Query owns server state.
- URL search params own trace list filters and pagination.
- Local component state owns transient UI state such as active tabs and collapsible sections.
- There is no global client-state store yet.

## API Layer

- `lib/api.ts` provides the shared API client.
- Responsibilities:
  - base URL resolution
  - JSON parsing
  - latency measurement
  - typed errors
- Each feature exposes its own API helpers and schemas.
- Responses should be parsed near the feature boundary, usually with Zod.

## Feature Slice Pattern

- `api/`
  - fetch helpers
- `components/`
  - view-specific UI
- `lib/`
  - formatting or transformation helpers
- `pages/`
  - route components
- `types.ts`
  - Zod schemas and TypeScript types

## Styling Conventions

- TailwindCSS is the primary styling tool.
- Shared look-and-feel lives in:
  - `index.css`
  - `components/ui/*`
- UI should feel:
  - calm
  - data-first
  - infrastructure-grade
- Prefer:
  - thin borders
  - soft shadows
  - navy or slate accents
  - whitespace over decoration

## Component Ownership

- `layout/`
  - shell and navigation chrome
- `common/`
  - cross-feature content blocks like page headers and empty states
- `ui/`
  - primitive styling contracts such as buttons, cards, badges, alerts, inputs
- `features/traces/`
  - owns trace explorer UI and transformation logic

## Current Gaps

- No authentication yet
- No project switcher yet
- No frontend automated tests yet
- Trace Explorer is the flagship workflow; evals and settings are placeholders

## Coding Rules

- Do not fetch directly from random components when a feature API helper fits.
- Prefer route-owned pages over giant shared screens.
- Prefer explicit transformation helpers over formatting logic embedded everywhere.
- Keep design consistent with `design-system.md`.

## Read Next

- [design-system.md](./design-system.md)
- [repository-structure.md](./repository-structure.md)
- [decision-log.md](./decision-log.md)
