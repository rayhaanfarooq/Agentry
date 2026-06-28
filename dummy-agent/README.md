# Agentry Dummy Agent

The dummy agent is a small standalone Python application used for local Agentry
development, demos, and future SDK validation.

It is intentionally separate from the production platform. It does not depend
on FastAPI and communicates with Agentry only through HTTP-facing configuration.

## What It Does Today

- loads environment variables from `.env`
- validates required configuration immediately at startup
- reads a prompt from the terminal
- sends the prompt to Gemini
- displays Gemini's response
- keeps a simple local tool registry ready for future tracing and demo flows

Phase 1 intentionally does not implement tracing, persistence, orchestration,
memory, retries, or tool calling.

## Project Structure

```text
dummy-agent/
├── agent/
│   ├── config/
│   ├── llm/
│   ├── models/
│   ├── prompts/
│   ├── services/
│   ├── tools/
│   └── utils/
├── tests/
├── .env.example
├── main.py
├── pyproject.toml
├── requirements-dev.txt
└── requirements.txt
```

## Environment

Copy `.env.example` to `.env` and fill in:

```bash
GEMINI_API_KEY=
AGENTRY_API_URL=
AGENTRY_API_KEY=
```

`AGENTRY_API_URL` and `AGENTRY_API_KEY` are required even though they are not
used yet. They exist now so future trace and SDK integration can be added
without restructuring the project.

## Run Locally

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env
python main.py
```

From the monorepo root you can also use:

```bash
npm install
npm run dev:dummy-agent
```

## Tool Registry

The tool layer exists now so future Agentry features can produce realistic
local traces.

Registered tools:

- `current_time`
- `random_number`
- `weather` (mock)
- `calculator`

These tools are not invoked by the initial chat loop yet.

## Future Integration

This project is designed to make future additions straightforward, including:

- Agentry trace instrumentation
- evaluation runs
- prompt version capture
- tool call tracing
- latency measurement
- SDK validation
