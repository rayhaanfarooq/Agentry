from __future__ import annotations

from pathlib import Path
from typing import Any, Protocol

from runloop import monitor

from agent.config.settings import Settings, get_settings
from agent.llm.gemini import GeminiService
from agent.models.chat import AgentReply, LLMResponse
from agent.services.prompts import PromptLoader
from agent.services.tool_loop import (
    MAX_TOOL_ITERATIONS,
    ToolLoopExhaustedError,
    ToolLoopNoResponseError,
    append_function_exchange,
    execute_tool_call,
)
from agent.tools import ToolRegistry, build_default_tool_registry
from agent.tools.schema import build_gemini_function_declarations


class LLMService(Protocol):
    def generate_with_tools(
        self,
        *,
        system_prompt: str,
        contents: list[dict[str, Any]],
        tool_declarations: list[dict[str, Any]],
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
        tool_declarations = build_gemini_function_declarations(self.tool_registry)
        composed_prompt = (
            f"{system_prompt}\n\n"
            "You have access to local tools. Use them when they help answer "
            "the user accurately."
        )
        contents: list[dict[str, Any]] = [
            {"role": "user", "parts": [{"text": user_prompt}]}
        ]
        tools_used: list[str] = []
        final_text: str | None = None
        model_name = ""

        with monitor.trace("dummy_agent_prompt") as trace:
            for _ in range(MAX_TOOL_ITERATIONS):
                with monitor.span(
                    "llm_call",
                    metadata={"provider": "google", "span_type": "llm"},
                ):
                    llm_response = self.llm_service.generate_with_tools(
                        system_prompt=composed_prompt,
                        contents=contents,
                        tool_declarations=tool_declarations,
                    )
                model_name = llm_response.model

                if llm_response.function_calls:
                    responses: list[dict[str, Any]] = []
                    for function_call in llm_response.function_calls:
                        with monitor.span(
                            function_call.name,
                            metadata={"span_type": "tool"},
                        ) as tool_span:
                            result, succeeded = execute_tool_call(
                                registry=self.tool_registry,
                                function_call=function_call,
                            )
                            tool_span.set_tool_call(
                                arguments=function_call.args,
                                result=result,
                            )
                            if succeeded:
                                tools_used.append(function_call.name)
                        responses.append(result)

                    append_function_exchange(
                        contents=contents,
                        function_calls=llm_response.function_calls,
                        responses=responses,
                    )
                    continue

                if llm_response.text:
                    final_text = llm_response.text
                    break

                raise ToolLoopNoResponseError(
                    "Gemini returned neither text nor function calls."
                )

            if final_text is None:
                raise ToolLoopExhaustedError(
                    "Tool loop exceeded maximum iterations without a final answer."
                )

            trace.set_inputs({"prompt": user_prompt})
            trace.set_outputs({"response": final_text})
            trace.set_model(name=model_name, provider="google")

            tool_catalog = self.tool_registry.list_tools()
            return AgentReply(
                prompt=user_prompt,
                response=final_text,
                model=model_name,
                available_tools=[tool.name for tool in tool_catalog],
                tools_used=tools_used,
            )


def build_dummy_agent_service(settings: Settings | None = None) -> DummyAgentService:
    resolved_settings = settings or get_settings()
    project_root = Path(__file__).resolve().parents[2]

    return DummyAgentService(
        llm_service=GeminiService(settings=resolved_settings),
        prompt_loader=PromptLoader(project_root / "agent" / "prompts"),
        tool_registry=build_default_tool_registry(),
    )
