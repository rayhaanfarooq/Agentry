# Glossary

## Agent

- An AI-powered application or workflow that Agentry helps developers inspect and improve.

## Trace

- The top-level record of one agent execution.
- A trace may contain spans, tool calls, events, metadata, and token usage.

## Span

- A nested execution step inside a trace.
- Examples:
  - LLM call
  - retrieval step
  - orchestration block

## Tool Call

- A recorded invocation of an external or local tool during a trace.

## Trace Event

- A timestamped annotation emitted during a trace.
- Examples:
  - token usage update
  - checkpoint
  - custom marker

## Evaluation

- A future Agentry feature for scoring or validating agent behavior against defined expectations.

## Memory Analysis

- A future Agentry feature focused on understanding retrieved context, chunk relevance, and prompt context composition.

## Project

- A future logical grouping of traces and application activity.

## Organization

- A future top-level multi-team boundary above projects.

## SDK

- A developer-facing library used to instrument applications and send trace data to Agentry.

## Dummy Agent

- A small standalone reference AI application inside this repository used for local validation and future SDK testing.

## Repository Layer

- Backend code responsible for database reads and writes.

## Service Layer

- Backend code responsible for business workflows and response assembly.

## Environment

- The runtime tier where a service is running.
- Examples:
  - development
  - staging
  - production

## Supabase

- Agentry's infrastructure provider for managed PostgreSQL today and future Auth/Storage capabilities.

## Context System

- The `context/` folder and its focused documents.
- It is the canonical architectural onboarding layer for the repository.
