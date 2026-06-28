from __future__ import annotations

import random

from agent.models.tool import ToolResult
from agent.tools.base import Tool


class RandomNumberTool(Tool):
    name = "random_number"
    description = "Generate a random integer between 1 and 100."

    def run(self, arguments: str | None = None) -> ToolResult:
        value = random.randint(1, 100)
        return ToolResult(tool_name=self.name, output=str(value))
