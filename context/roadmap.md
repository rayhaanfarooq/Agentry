# Roadmap

## Current State

- Agentry already has the core repository foundation in place.
- The current milestone adds an AI-native context system so new contributors and coding agents can understand the repo quickly.

## Completed Milestones

- Monorepo foundation with independent root applications
- Root developer workflow scripts
- Supabase-first local and hosted database workflow
- FastAPI backend scaffold
- Health endpoint with PostgreSQL and Supabase checks
- Landing page scaffold and design system direction
- Dummy agent reference application
- Python SDK scaffold with batching and retry
- Trace ingestion backend
- Trace Explorer frontend

## Current Focus

- Keep architecture legible through focused context documents.
- Preserve consistency between code, workflow, and documentation.

## Near-Term Next

- richer trace explorer polish
- explicit projects and organizations model
- authentication architecture for Supabase Auth
- storage abstraction for future uploads
- additional trace ingestion APIs for spans and events if split ingestion becomes necessary
- stronger frontend empty, loading, and filtering workflows as data volume grows

## Product Work After That

- evaluations
- benchmarking workflows
- memory analysis
- prompt versioning
- observability surfaces
- API keys
- team collaboration

## Long-Term Platform Direction

- provider-agnostic developer infrastructure layer for AI applications
- SDKs across more runtimes
- durable debugging workflows
- regression detection and release confidence tooling

## Known Gaps And Technical Debt

- frontend automated tests are still minimal
- authentication is intentionally not implemented yet
- landing page demos are present, but public product claims should keep following real product capability
- context docs need to evolve with each architectural change
- organizations, projects, and retention policies are not modeled yet

## Update Rule

- If a milestone ships and this file still describes the old state, update this file immediately.

## Read Next

- [project-vision.md](./project-vision.md)
- [decision-log.md](./decision-log.md)
