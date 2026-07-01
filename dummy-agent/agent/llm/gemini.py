from __future__ import annotations

from typing import Any

import httpx

from agent.config.settings import Settings
from agent.models.chat import FunctionCall, LLMResponse

GEMINI_API_BASE_URL = "https://generativelanguage.googleapis.com/v1beta"


class GeminiServiceError(RuntimeError):
    """Raised when the Gemini API returns an unusable response."""


class GeminiService:
    def __init__(
        self,
        settings: Settings,
        timeout_seconds: float = 30.0,
        client: httpx.Client | None = None,
    ) -> None:
        self.settings = settings
        self.timeout_seconds = timeout_seconds
        self._client = client

    def generate_response(
        self,
        *,
        user_prompt: str,
        system_prompt: str,
    ) -> LLMResponse:
        return self.generate_with_tools(
            system_prompt=system_prompt,
            contents=[{"role": "user", "parts": [{"text": user_prompt}]}],
            tool_declarations=[],
        )

    def generate_with_tools(
        self,
        *,
        system_prompt: str,
        contents: list[dict[str, Any]],
        tool_declarations: list[dict[str, Any]],
    ) -> LLMResponse:
        payload: dict[str, Any] = {
            "system_instruction": {
                "parts": [{"text": system_prompt}],
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.4,
            },
        }
        if tool_declarations:
            payload["tools"] = [{"functionDeclarations": tool_declarations}]

        response_payload = self._post_generate_content(payload)
        text, function_calls = self._extract_parts(response_payload)

        if not text and not function_calls:
            raise GeminiServiceError("Gemini returned neither text nor function calls.")

        return LLMResponse(
            model=self.settings.gemini_model,
            text=text,
            function_calls=function_calls,
            raw_response=response_payload,
        )

    def _post_generate_content(self, payload: dict[str, Any]) -> dict[str, Any]:
        request_url = (
            f"{GEMINI_API_BASE_URL}/models/"
            f"{self.settings.gemini_model}:generateContent"
        )

        try:
            if self._client is None:
                with httpx.Client(timeout=self.timeout_seconds) as client:
                    response = client.post(
                        request_url,
                        params={"key": self.settings.gemini_api_key},
                        json=payload,
                    )
            else:
                response = self._client.post(
                    request_url,
                    params={"key": self.settings.gemini_api_key},
                    json=payload,
                )

            response.raise_for_status()
        except httpx.HTTPStatusError as error:
            response_text = error.response.text.strip()
            message = (
                f"Gemini returned HTTP {error.response.status_code}."
                if not response_text
                else (
                    "Gemini returned HTTP "
                    f"{error.response.status_code}: {response_text}"
                )
            )
            raise GeminiServiceError(message) from error
        except httpx.HTTPError as error:
            raise GeminiServiceError(f"Gemini request failed: {error}") from error

        try:
            response_payload: dict[str, Any] = response.json()
        except ValueError as error:
            raise GeminiServiceError("Gemini returned invalid JSON.") from error

        return response_payload

    def _extract_parts(
        self, payload: dict[str, Any]
    ) -> tuple[str | None, list[FunctionCall]]:
        candidates = payload.get("candidates")
        if not isinstance(candidates, list) or not candidates:
            prompt_feedback = payload.get("promptFeedback", {})
            block_reason = prompt_feedback.get("blockReason")
            if isinstance(block_reason, str):
                raise GeminiServiceError(
                    f"Gemini blocked the prompt with reason: {block_reason}."
                )
            raise GeminiServiceError("Gemini response did not contain any candidates.")

        first_candidate = candidates[0]
        content = first_candidate.get("content", {})
        parts = content.get("parts")
        if not isinstance(parts, list):
            raise GeminiServiceError("Gemini response did not include content parts.")

        text_parts: list[str] = []
        function_calls: list[FunctionCall] = []

        for part in parts:
            if not isinstance(part, dict):
                continue
            if isinstance(part.get("text"), str):
                stripped = part["text"].strip()
                if stripped:
                    text_parts.append(stripped)
                continue
            function_call = part.get("functionCall")
            if isinstance(function_call, dict):
                name = function_call.get("name")
                if not isinstance(name, str) or not name.strip():
                    raise GeminiServiceError(
                        "Gemini function call did not include a tool name."
                    )
                raw_args = function_call.get("args", {})
                args = raw_args if isinstance(raw_args, dict) else {}
                function_calls.append(FunctionCall(name=name, args=args))

        combined_text = "\n".join(text_parts).strip() or None
        return combined_text, function_calls
