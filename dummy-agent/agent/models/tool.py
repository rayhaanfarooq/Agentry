from __future__ import annotations

from pydantic import BaseModel


class ToolDefinition(BaseModel):
    name: str
    description: str


class ToolResult(BaseModel):
    tool_name: str
    output: str
