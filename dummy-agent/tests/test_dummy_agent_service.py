from pathlib import Path
from unittest.mock import patch

import pytest
from agent.config.settings import Settings
from agent.models.chat import FunctionCall, LLMResponse
from agent.services.dummy_agent import DummyAgentService
from agent.services.prompts import PromptLoader
from agent.tools import build_default_tool_registry
from agent.tracing.runloop_monitor import configure_monitor
from runloop.client.monitor import RunloopMonitor
from runloop.config import RunloopSettings
from runloop.models import TraceBatch
from runloop.transport import BatchProcessor


class StubGeminiService:
    def __init__(self) -> None:
        self._call_count = 0

    def generate_with_tools(
        self,
        *,
        system_prompt: str,
        contents: list[dict],
        tool_declarations: list[dict],
    ) -> LLMResponse:
        del system_prompt, tool_declarations
        self._call_count += 1

        if self._call_count == 1:
            return LLMResponse(
                model="stub-model",
                text=None,
                function_calls=[
                    FunctionCall(name="echo", args={"message": "Hello, Gemini"}),
                ],
                raw_response={"call": 1},
            )

        return LLMResponse(
            model="stub-model",
            text="Echo: Hello, Gemini",
            raw_response={"call": 2, "contents_length": len(contents)},
        )


class FakeTransport:
    def __init__(self) -> None:
        self.batches: list[TraceBatch] = []

    def send(self, batch: TraceBatch) -> None:
        self.batches.append(batch)


def build_test_monitor(transport: FakeTransport) -> RunloopMonitor:
    monitor = RunloopMonitor(
        settings=RunloopSettings.model_validate(
            {
                "api_url": None,
                "api_key": None,
                "enabled": True,
            }
        )
    )
    monitor._settings = RunloopSettings.model_validate(
        {
            "api_url": "http://localhost:8000",
            "api_key": "secret-key",
            "service_name": "dummy-agent",
            "environment": "development",
            "batch_size": 1,
            "flush_interval_seconds": 60.0,
        }
    )
    monitor._batch_processor = BatchProcessor(
        transport=transport,
        batch_size=1,
        flush_interval_seconds=60.0,
        auto_start=False,
    )
    return monitor


def test_dummy_agent_service_returns_model_reply(tmp_path: Path) -> None:
    prompts_dir = tmp_path / "prompts"
    prompts_dir.mkdir()
    (prompts_dir / "system.txt").write_text("System prompt", encoding="utf-8")

    transport = FakeTransport()
    test_monitor = build_test_monitor(transport)

    service = DummyAgentService(
        llm_service=StubGeminiService(),
        prompt_loader=PromptLoader(prompts_dir),
        tool_registry=build_default_tool_registry(),
    )

    with patch("agent.services.dummy_agent.monitor", test_monitor):
        reply = service.run_prompt("Hello, Gemini")
        test_monitor.flush()

    assert reply.prompt == "Hello, Gemini"
    assert reply.response == "Echo: Hello, Gemini"
    assert reply.model == "stub-model"
    assert reply.tools_used == ["echo"]
    assert "echo" in reply.available_tools

    assert len(transport.batches) == 1
    trace = transport.batches[0].traces[0]
    assert trace.name == "dummy_agent_prompt"
    assert trace.service_name == "dummy-agent"
    assert trace.inputs == {"prompt": "Hello, Gemini"}
    assert trace.outputs == {"response": "Echo: Hello, Gemini"}
    assert trace.model is not None
    assert trace.model.name == "stub-model"
    assert trace.model.provider == "google"
    assert len(trace.spans) == 3
    assert trace.spans[0].name == "llm_call"
    assert trace.spans[0].span_type == "llm"
    assert trace.spans[1].name == "echo"
    assert trace.spans[1].span_type == "tool"
    assert trace.spans[2].name == "llm_call"
    assert len(trace.tool_calls) == 1
    assert trace.tool_calls[0].name == "echo"
    assert trace.tool_calls[0].span_id == trace.spans[1].span_id
    assert trace.tool_calls[0].arguments == {"message": "Hello, Gemini"}
    assert trace.tool_calls[0].result == {"message": "Hello, Gemini"}


def test_configure_monitor_uses_settings_and_env(
    monkeypatch: pytest.MonkeyPatch,
) -> None:
    monkeypatch.setenv("RUNLOOP_SERVICE_NAME", "custom-agent")
    monkeypatch.setenv("RUNLOOP_ENVIRONMENT", "staging")

    settings = Settings.model_validate(
        {
            "GEMINI_API_KEY": "gemini-key",
            "RUNLOOP_API_URL": "http://localhost:8000",
            "RUNLOOP_API_KEY": "runloop-key",
        }
    )

    with patch("agent.tracing.runloop_monitor.monitor.configure") as configure:
        configure_monitor(settings)

    configure.assert_called_once_with(
        api_url="http://localhost:8000/",
        api_key="runloop-key",
        service_name="custom-agent",
        environment="staging",
    )
