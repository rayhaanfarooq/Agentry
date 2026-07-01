from __future__ import annotations

from pathlib import Path
from typing import Protocol

from runloop import monitor

from agent.config.settings import Settings, get_settings
from agent.llm.gemini import GeminiService
from agent.models.chat import AgentReply, LLMResponse
from agent.services.prompts import PromptLoader
from agent.tools import ToolRegistry, build_default_tool_registry


class LLMService(Protocol):
    def generate_response(
        self,
        *,
        user_prompt: str,
        system_prompt: str,
    ) -> LLMResponse: ...


class DummyAgentService:
    def __init__(
        self,
        *,
        llm_service: LLMService,
        prompt_loader: PromptLoader,
        tool_registry: ToolRegistry,
    ) -> None:
        self.llm_service = llm_service
        self.prompt_loader = prompt_loader
        self.tool_registry = tool_registry

    def run_prompt(self, user_prompt: str) -> AgentReply:
        system_prompt = self.prompt_loader.load("system.txt")
        tool_catalog = self.tool_registry.list_tools()
        tool_lines = "\n".join(
            f"- {tool.name}: {tool.description}" for tool in tool_catalog
        )
        composed_prompt = (
            f"{system_prompt}\n\n"
            "Registered local tools exist for future tracing and demo flows, "
            "but do not invoke or simulate tool calls yet."
        )
        if tool_lines:
            composed_prompt = f"{composed_prompt}\n\nAvailable tools:\n{tool_lines}"

        with monitor.trace("dummy_agent_prompt") as trace:
            with monitor.span(
                "llm_call",
                metadata={"provider": "google", "span_type": "llm"},
            ):
                llm_response = self.llm_service.generate_response(
                    user_prompt=user_prompt,
                    system_prompt=composed_prompt,
                )

            trace.set_inputs({"prompt": user_prompt})
            trace.set_outputs({"response": llm_response.text})
            trace.set_model(name=llm_response.model, provider="google")

            return AgentReply(
                prompt=user_prompt,
                response=llm_response.text,
                model=llm_response.model,
                available_tools=[tool.name for tool in tool_catalog],
            )


def build_dummy_agent_service(settings: Settings | None = None) -> DummyAgentService:
    resolved_settings = settings or get_settings()
    project_root = Path(__file__).resolve().parents[2]

    return DummyAgentService(
        llm_service=GeminiService(settings=resolved_settings),
        prompt_loader=PromptLoader(project_root / "agent" / "prompts"),
        tool_registry=build_default_tool_registry(),
    )
