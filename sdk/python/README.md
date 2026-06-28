# Agentry Python SDK

The Agentry Python SDK is the primary developer-facing package for instrumenting
AI applications with lightweight tracing.

## Installation

```bash
pip install agentry
```

For local development inside this monorepo:

```bash
cd /Users/rayhaanfarooq/Desktop/Agentry/sdk/python
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
```

## Configuration

Set environment variables:

```bash
export AGENTRY_API_URL=http://localhost:8000
export AGENTRY_API_KEY=your-api-key
export AGENTRY_SERVICE_NAME=my-agent
```

If the SDK is imported before configuration exists, instrumentation still runs
locally but export is skipped and a warning is emitted once.

You can also configure explicitly:

```python
from agentry import monitor

monitor.configure(
    api_url="http://localhost:8000",
    api_key="your-api-key",
    service_name="my-agent",
)
```

## Public API

Decorator-based tracing:

```python
from agentry import monitor

@monitor.trace()
def answer() -> str:
    return "hello"
```

Named trace scopes:

```python
from agentry import monitor

with monitor.trace("Generate Response"):
    ...
```

Nested spans:

```python
from agentry import monitor

with monitor.trace("request"):
    with monitor.span("retrieve_context"):
        ...
```

Async functions are supported:

```python
from agentry import monitor

@monitor.trace("async_answer")
async def answer() -> str:
    return "hello"
```

## Behavior

- creates a trace for each instrumented root scope
- captures timestamps, duration, metadata, and errors
- supports nested spans through `monitor.span(...)`
- batches traces in memory before upload
- retries failed uploads with exponential backoff
- flushes pending batches on process exit

## Current Transport Contract

The SDK posts JSON batches to:

```text
{AGENTRY_API_URL}/v1/traces
```

The backend ingestion endpoint is expected to be implemented separately from the
SDK itself.

## Testing

```bash
pytest
ruff check .
black --check .
mypy .
```
