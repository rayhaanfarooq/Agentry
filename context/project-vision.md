# Project Vision

## What Agentry Is

- Agentry is developer infrastructure for AI agents.
- It helps engineering teams inspect, evaluate, benchmark, and improve agent behavior.
- The product direction centers on execution visibility and confidence, not on being another model wrapper.

## Who It Serves

- AI application engineers
- platform teams
- developer tooling teams
- engineering organizations running agentic systems in production

## Product Thesis

- AI applications need the same seriousness that software teams already expect from infrastructure tools.
- Agent behavior should be inspectable, testable, and debuggable.
- Teams should be able to move faster by making invisible execution visible.

## Long-Term Vision

- Become the infrastructure layer for AI-native applications.
- Support:
  - tracing
  - evaluations
  - benchmarking
  - memory analysis
  - observability
  - SDK-driven instrumentation
  - eventually auth, orgs, storage, and API keys

## Current Scope

- The repository already includes:
  - backend platform foundation
  - Supabase-first database workflow
  - dashboard shell
  - trace ingestion backend
  - trace explorer frontend
  - landing page
  - dummy agent
  - Python SDK scaffold
- The current documentation milestone makes that architecture legible to new contributors and AI agents.

## Product Philosophy

- Serious engineering product first
- Real application architecture over hype
- Clear boundaries between infrastructure and application logic
- Product surfaces should teach the product through real workflows

## Design Philosophy

- Calm
- minimal
- technical
- premium
- trustworthy

## Non-Goals

- Do not become a thin wrapper around model vendors.
- Do not hard-couple product logic to Supabase SDKs.
- Do not optimize for flashy marketing over useful workflows.
- Do not hide architecture behind vague abstractions.

## Engineering Implications

- Business logic stays inside application code.
- Developer experience is a product surface, not an afterthought.
- Documentation must scale with the codebase.
- SDKs and demo apps are first-class parts of the platform strategy.

## Read Next

- [architecture.md](./architecture.md)
- [roadmap.md](./roadmap.md)
- [decision-log.md](./decision-log.md)
