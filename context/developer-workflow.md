# Developer Workflow

## First-Time Setup

1. Run `npm install` at the repository root.
2. Choose a database mode:
   - local Supabase
   - hosted Supabase
3. Copy or update each app's `.env` file from its `.env.example`.
4. Start development services with `npm run dev`.

## Daily Commands

- Start everything
  - `npm run dev`
- Start only backend
  - `npm run dev:backend`
- Start only dashboard
  - `npm run dev:frontend`
- Start only landing page
  - `npm run dev:landing`
- Start dummy agent
  - `npm run dev:dummy-agent`

## Quality Commands

- Lint all apps
  - `npm run lint`
- Format all apps
  - `npm run format`
- Run static type checks
  - `npm run typecheck`
- Run tests
  - `npm run test`

## What The Root Scripts Do

- `scripts/dev.mjs`
  - starts long-running services with prefixed logs
- `scripts/run-task.mjs`
  - runs lint, format, typecheck, and test across every registered app
- `scripts/setup.mjs`
  - installs dependencies and prepares local environments
- `scripts/setup-hooks.mjs`
  - configures Git hooks

## Pre-Commit Behavior

- `.githooks/pre-commit` runs:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run test`
- Expect commits to fail if a shared check is broken.

## Supabase Workflow

### Local

- `npm run supabase:start`
- `npm run supabase:status:env`
- `npm run supabase:db:reset`
- `npm run supabase:migration:up`

### Schema Changes

- create a migration shell
  - `npm run supabase:migration:new -- <name>`
- diff local schema into SQL
  - `npm run supabase:db:diff -- --local -f <name>`

### Hosted Project

- `npm run supabase:login`
- `npm run supabase:link -- --project-ref <ref>`
- `npm run supabase:db:pull -- <name>`
- `npm run supabase:db:push`

## Change Expectations

- Keep changes focused.
- Prefer feature-local edits over broad cross-cutting churn.
- Run the smallest meaningful verification locally, then run root checks before shipping.
- Update `context/` whenever architecture or workflow changes.

## Review Philosophy

- Prioritize:
  - regressions
  - correctness
  - architectural consistency
  - missing tests
- Prefer direct, actionable feedback over vague style commentary.

## Documentation Rule

- A feature is not complete if it changes architecture and leaves context stale.

## Where To Start For Common Tasks

- New backend feature
  - read [backend.md](./backend.md)
- New dashboard feature
  - read [frontend.md](./frontend.md)
- Schema change
  - read [database.md](./database.md)
- Product-level positioning or UX change
  - read [project-vision.md](./project-vision.md) and [design-system.md](./design-system.md)
