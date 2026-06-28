from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class LLMResponse(BaseModel):
    model: str
    text: str
    raw_response: dict[str, Any]


class AgentReply(BaseModel):
    prompt: str
    response: str
    model: str
    available_tools: list[str] = Field(default_factory=list)
