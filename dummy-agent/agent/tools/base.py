from __future__ import annotations

from abc import ABC, abstractmethod
from typing import Any

from agent.models.tool import ToolDefinition, ToolResult


class Tool(ABC):
    name: str
    description: str

    @abstractmethod
    def parameters_schema(self) -> dict[str, Any]:
        """Return a Gemini-compatible JSON Schema object for tool arguments."""

    def definition(self) -> ToolDefinition:
        return ToolDefinition(
            name=self.name,
            description=self.description,
            parameters=self.parameters_schema(),
        )

    @abstractmethod
    def run(self, arguments: dict[str, Any]) -> ToolResult:
        """Execute the tool with structured JSON arguments."""
