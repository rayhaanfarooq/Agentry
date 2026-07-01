from __future__ import annotations

from typing import Any

from agent.tools.registry import ToolRegistry


def build_gemini_function_declarations(
    registry: ToolRegistry,
) -> list[dict[str, Any]]:
    return [
        {
            "name": tool.name,
            "description": tool.description,
            "parameters": tool.parameters,
        }
        for tool in registry.list_tools()
    ]
