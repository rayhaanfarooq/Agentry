from __future__ import annotations

from datetime import UTC, datetime

from agent.models.tool import ToolResult
from agent.tools.base import Tool


class CurrentTimeTool(Tool):
    name = "current_time"
    description = "Return the current UTC timestamp."

    def run(self, arguments: str | None = None) -> ToolResult:
        timestamp = datetime.now(tz=UTC).isoformat()
        return ToolResult(tool_name=self.name, output=timestamp)
