from __future__ import annotations

from typing import Any

from agent.models.tool import ToolResult
from agent.tools.base import Tool

_LOOKUP_DATA: dict[str, str] = {
    "pricing": "Pro plan starts at $49/month.",
    "support": "support@runloop.dev",
    "status": "All systems operational.",
}


class LookupTool(Tool):
    name = "lookup"
    description = "Retrieve a value for a known key from a local reference map."

    def parameters_schema(self) -> dict[str, Any]:
        return {
            "type": "object",
            "properties": {
                "key": {
                    "type": "string",
                    "description": "Lookup key such as pricing, support, or status.",
                }
            },
            "required": ["key"],
        }

    def run(self, arguments: dict[str, Any]) -> ToolResult:
        key = str(arguments.get("key", "")).strip().lower()
        value = _LOOKUP_DATA.get(key)
        if value is None:
            return ToolResult(
                tool_name=self.name,
                output={"found": False, "key": key},
            )
        return ToolResult(
            tool_name=self.name,
            output={"found": True, "key": key, "value": value},
        )
