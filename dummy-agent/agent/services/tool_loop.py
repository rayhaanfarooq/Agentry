from __future__ import annotations

from typing import Any

from agent.llm.gemini import GeminiServiceError
from agent.models.chat import FunctionCall
from agent.models.tool import ToolResult
from agent.tools.registry import ToolRegistry

MAX_TOOL_ITERATIONS = 5


def normalize_tool_result(output: dict[str, Any] | str) -> dict[str, Any]:
    if isinstance(output, dict):
        return output
    return {"output": output}


def execute_tool_call(
    *,
    registry: ToolRegistry,
    function_call: FunctionCall,
) -> tuple[dict[str, Any], bool]:
    tool = registry.get(function_call.name)
    if tool is None:
        return {"error": f"Unknown tool: {function_call.name}"}, False

    try:
        tool_result: ToolResult = tool.run(function_call.args)
        return normalize_tool_result(tool_result.output), True
    except Exception as exc:
        return {"error": str(exc)}, False


def append_function_exchange(
    *,
    contents: list[dict[str, Any]],
    function_calls: list[FunctionCall],
    responses: list[dict[str, Any]],
) -> None:
    contents.append(
        {
            "role": "model",
            "parts": [
                {"functionCall": {"name": call.name, "args": call.args}}
                for call in function_calls
            ],
        }
    )
    contents.append(
        {
            "role": "user",
            "parts": [
                {
                    "functionResponse": {
                        "name": call.name,
                        "response": response,
                    }
                }
                for call, response in zip(function_calls, responses, strict=True)
            ],
        }
    )


class ToolLoopExhaustedError(GeminiServiceError):
    """Raised when the agent exceeds the maximum tool loop iterations."""


class ToolLoopNoResponseError(GeminiServiceError):
    """Raised when Gemini returns neither text nor function calls."""
