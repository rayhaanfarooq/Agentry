# Runloop Dummy Agent

The dummy agent is a small standalone Python application used for local Runloop
development, demos, and SDK validation.

It is intentionally separate from the production platform. It communicates with
Runloop through the Python SDK and your local (or hosted) backend API.

## What It Does Today

- loads environment variables from `.env`
- validates required configuration immediately at startup
- reads a prompt from the terminal
- sends the prompt to Gemini
- displays Gemini's response
- emits one Runloop trace per prompt through the Python SDK
- keeps a simple local tool registry ready for future tool-calling demos

Each chat turn creates a trace named `dummy_agent_prompt` with:

- user prompt and model response (Prompt Viewer in Trace Explorer)
- nested `llm_call` span on the timeline
- latency captured automatically by the SDK
- model name and provider metadata

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
│   ├── tracing/
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
RUNLOOP_API_URL=http://localhost:8000
RUNLOOP_API_KEY=dev-test-key
RUNLOOP_SERVICE_NAME=dummy-agent
RUNLOOP_ENVIRONMENT=development
```

- `GEMINI_API_KEY` — your Google Gemini API key
- `RUNLOOP_API_URL` — Runloop backend base URL (local dev: `http://localhost:8000`)
- `RUNLOOP_API_KEY` — any non-placeholder string for now; backend auth is not enforced yet
- `RUNLOOP_SERVICE_NAME` — appears as the trace service name in Trace Explorer
- `RUNLOOP_ENVIRONMENT` — stored on each trace (for example `development`)

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
npm run dev:backend      # terminal 1
npm run dev:frontend     # terminal 2
npm run dev:dummy-agent  # terminal 3
```

## Verify Traces End-to-End

1. Confirm backend health: `curl http://localhost:8000/health`
2. Open Trace Explorer: http://localhost:5173/traces
3. Run the dummy agent and submit one prompt
4. Refresh `/traces` — filter by service name `dummy-agent` if needed

You should see:

- a trace named `dummy_agent_prompt`
- prompt + completion in Prompt Viewer
- an `llm_call` span on the timeline
- status `ok` and model `gemini-2.5-flash` (or your configured model)

API check:

```bash
curl -s "http://localhost:8000/v1/traces?service_name=dummy-agent" | python3 -m json.tool
```

## Tool Registry

The tool layer exists now so future Runloop features can produce realistic
local traces.

Registered tools:

- `current_time`
- `random_number`
- `weather` (mock)
- `calculator`

These tools are not invoked by the initial chat loop yet.

## Future Integration

This project is designed to make future additions straightforward, including:

- evaluation runs
- prompt version capture
- tool call tracing
- token usage capture from Gemini responses
