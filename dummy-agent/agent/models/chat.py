from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class FunctionCall(BaseModel):
    name: str
    args: dict[str, Any] = Field(default_factory=dict)


class LLMResponse(BaseModel):
    model: str
    text: str | None = None
    function_calls: list[FunctionCall] = Field(default_factory=list)
    raw_response: dict[str, Any]


class AgentReply(BaseModel):
    prompt: str
    response: str
    model: str
    available_tools: list[str] = Field(default_factory=list)
    tools_used: list[str] = Field(default_factory=list)
