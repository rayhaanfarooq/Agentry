from __future__ import annotations

from typing import Any

from agent.models.tool import ToolResult
from agent.tools.base import Tool


class EchoTool(Tool):
    name = "echo"
    description = "Return the provided message unchanged."

    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "message": {
                    "type": "string",
                    "description": "Text to echo back.",
                }
            },
            "required": ["message"],
        }

    def run(self, arguments: dict[str, Any]) -> ToolResult:
        message = str(arguments.get("message", "")).strip()
        return ToolResult(tool_name=self.name, output={"message": message})
