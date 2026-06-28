from __future__ import annotations

from abc import ABC, abstractmethod

from agent.models.tool import ToolDefinition, ToolResult


class Tool(ABC):
    name: str
    description: str

    def definition(self) -> ToolDefinition:
        return ToolDefinition(name=self.name, description=self.description)

    @abstractmethod
    def run(self, arguments: str | None = None) -> ToolResult:
        """Execute the tool with an optional raw string argument."""
