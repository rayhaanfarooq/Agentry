# Decision Log

## 1. Use A Monorepo With Independent Apps

- Decision
  - Keep backend, dashboard, landing page, dummy agent, SDK, and Supabase config in one repository.
- Reasoning
  - Shared workflow matters, but runtimes and deployment targets remain independent.
- Alternatives Considered
  - separate repositories per application
- Tradeoffs
  - easier coordination
  - more root-level tooling responsibility

## 2. Use FastAPI As The Application Layer

- Decision
  - FastAPI owns routing, validation, and business logic.
- Reasoning
  - The product needs typed infrastructure APIs and clean dependency injection.
- Alternatives Considered
  - Flask
  - Django
  - serverless-only handlers
- Tradeoffs
  - strong async and schema support
  - slightly more structure than minimal frameworks

## 3. Use Supabase As Infrastructure, Not As The App Runtime

- Decision
  - Use Supabase for PostgreSQL, migrations, and future Auth/Storage support.
- Reasoning
  - Runloop needs managed infrastructure without giving up backend architecture control.
- Alternatives Considered
  - plain hosted Postgres without Supabase
  - full Supabase SDK coupling
- Tradeoffs
  - faster infrastructure setup
  - requires discipline to keep business logic out of vendor-specific layers

## 4. Keep SQLAlchemy And A Repository Layer

- Decision
  - SQLAlchemy plus repositories remain the persistence contract.
- Reasoning
  - Keeps query logic explicit and business logic database-agnostic.
- Alternatives Considered
  - direct Supabase client CRUD
  - route-level session usage
- Tradeoffs
  - more structure
  - better long-term maintainability and testability

## 5. Use Feature-Based React Organization

- Decision
  - Organize the dashboard by features rather than by only technical file types.
- Reasoning
  - Product workflows such as health and traces should be easy to locate and extend.
- Alternatives Considered
  - pages/components/hooks-only structure
- Tradeoffs
  - slightly more nesting
  - clearer ownership as features grow

## 6. Use TanStack Query For Server State

- Decision
  - TanStack Query is the default async state layer.
- Reasoning
  - Dashboard surfaces are backend-driven and need caching plus request lifecycle handling.
- Alternatives Considered
  - raw `useEffect` fetch logic everywhere
  - global state store first
- Tradeoffs
  - extra library
  - less ad hoc async code

## 7. Keep The Landing Page Separate From The Dashboard

- Decision
  - The marketing site is its own React application.
- Reasoning
  - Public storytelling and authenticated product workflows have different deployment and UX needs.
- Alternatives Considered
  - one combined frontend app
- Tradeoffs
  - duplicated build tooling
  - cleaner separation of concerns

## 8. Keep A Dummy Agent In The Repo

- Decision
  - Maintain a tiny standalone AI agent outside the backend.
- Reasoning
  - The platform needs a controllable reference client for demos and SDK validation.
- Alternatives Considered
  - using only backend tests
  - building demos directly into the dashboard
- Tradeoffs
  - more repo surface area
  - better end-to-end validation path

## 9. Treat Context Docs As First-Class Assets

- Decision
  - Put focused architecture documents in `context/`.
- Reasoning
  - Large READMEs do not scale well for humans or AI coding agents.
- Alternatives Considered
  - only root and app-level READMEs
- Tradeoffs
  - more documentation files to maintain
  - much better retrieval and onboarding

## 10. Favor Calm Infrastructure Design

- Decision
  - UI should feel more like Linear, Stripe, or Vercel than an AI wrapper.
- Reasoning
  - Trust matters more than novelty for developer tooling.
- Alternatives Considered
  - louder startup-style design
- Tradeoffs
  - less visual spectacle
  - stronger long-term product credibility
