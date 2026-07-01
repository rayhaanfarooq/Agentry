from __future__ import annotations

from collections.abc import Iterable

from agent.models.tool import ToolDefinition
from agent.tools.base import Tool
from agent.tools.compute import ComputeTool
from agent.tools.echo import EchoTool
from agent.tools.lookup import LookupTool


class ToolRegistry:
    def __init__(self, tools: Iterable[Tool]) -> None:
        self._tools = {tool.name: tool for tool in tools}

    def get(self, name: str) -> Tool | None:
        return self._tools.get(name)

    def list_tools(self) -> list[ToolDefinition]:
        return [tool.definition() for tool in self._tools.values()]


def build_default_tool_registry() -> ToolRegistry:
    return ToolRegistry(
        [
            EchoTool(),
            LookupTool(),
            ComputeTool(),
        ]
    )
