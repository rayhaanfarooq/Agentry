from __future__ import annotations

from agent.models.tool import ToolResult
from agent.tools.base import Tool


class WeatherTool(Tool):
    name = "weather"
    description = "Return a mock weather report for a city."

    def run(self, arguments: str | None = None) -> ToolResult:
        location = (arguments or "Toronto").strip()
        forecast = f"Mock forecast for {location}: 72F, light wind, clear skies."
        return ToolResult(tool_name=self.name, output=forecast)
