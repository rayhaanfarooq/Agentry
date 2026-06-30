# Runloop Context

## Purpose

- `context/` is the canonical onboarding layer for Runloop.
- It exists for both human engineers and autonomous coding agents.
- The goal is fast retrieval, not long-form prose.

## When To Read This Folder

- Read this folder before making architectural changes.
- Read it when you are new to the repository.
- Read the focused file for the question you need answered.
- Update the relevant file whenever a major decision changes.

## How To Use It

- Start with [project-vision.md](./project-vision.md) for product intent.
- Read [repository-structure.md](./repository-structure.md) to place new code.
- Read [architecture.md](./architecture.md) for system-level data flow.
- Read app-specific files before editing a subsystem.

## Document Index

- [architecture.md](./architecture.md)
  - Answers: "How does Runloop work end to end?"
- [backend.md](./backend.md)
  - Answers: "How is the FastAPI backend organized?"
- [frontend.md](./frontend.md)
  - Answers: "How is the dashboard organized?"
- [database.md](./database.md)
  - Answers: "How does persistence work?"
- [design-system.md](./design-system.md)
  - Answers: "How should UI look and feel?"
- [developer-workflow.md](./developer-workflow.md)
  - Answers: "How do I run, lint, test, and ship changes?"
- [project-vision.md](./project-vision.md)
  - Answers: "What is Runloop trying to become?"
- [repository-structure.md](./repository-structure.md)
  - Answers: "Where should new code live?"
- [technology.md](./technology.md)
  - Answers: "Why was each major technology chosen?"
- [roadmap.md](./roadmap.md)
  - Answers: "What is done, current, and next?"
- [decision-log.md](./decision-log.md)
  - Answers: "Why were key architecture decisions made?"
- [glossary.md](./glossary.md)
  - Answers: "What do project terms mean?"

## Maintenance Rules

- Keep each document focused on one category of questions.
- Avoid duplicating the same decision in multiple files.
- Prefer updating an existing file over creating a near-duplicate.
- Treat stale context as a bug.
