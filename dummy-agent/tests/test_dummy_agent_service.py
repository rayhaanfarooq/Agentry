from pathlib import Path

from agent.models.chat import LLMResponse
from agent.services.dummy_agent import DummyAgentService
from agent.services.prompts import PromptLoader
from agent.tools import build_default_tool_registry


class StubGeminiService:
    def generate_response(
        self,
        *,
        user_prompt: str,
        system_prompt: str,
    ) -> LLMResponse:
        return LLMResponse(
            model="stub-model",
            text=f"Echo: {user_prompt}",
            raw_response={"system_prompt_length": len(system_prompt)},
        )


def test_dummy_agent_service_returns_model_reply(tmp_path: Path) -> None:
    prompts_dir = tmp_path / "prompts"
    prompts_dir.mkdir()
    (prompts_dir / "system.txt").write_text("System prompt", encoding="utf-8")

    service = DummyAgentService(
        llm_service=StubGeminiService(),
        prompt_loader=PromptLoader(prompts_dir),
        tool_registry=build_default_tool_registry(),
    )

    reply = service.run_prompt("Hello, Gemini")

    assert reply.prompt == "Hello, Gemini"
    assert reply.response == "Echo: Hello, Gemini"
    assert reply.model == "stub-model"
    assert "calculator" in reply.available_tools
