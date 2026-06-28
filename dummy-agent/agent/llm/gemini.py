from __future__ import annotations

from typing import Any

import httpx

from agent.config.settings import Settings
from agent.models.chat import LLMResponse

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
        payload = {
            "system_instruction": {
                "parts": [{"text": system_prompt}],
            },
            "contents": [
                {
                    "role": "user",
                    "parts": [{"text": user_prompt}],
                }
            ],
            "generationConfig": {
                "temperature": 0.4,
            },
        }

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
            response_payload = response.json()
        except ValueError as error:
            raise GeminiServiceError("Gemini returned invalid JSON.") from error

        response_text = self._extract_text(response_payload)
        if not response_text:
            raise GeminiServiceError("Gemini returned an empty response.")

        return LLMResponse(
            model=self.settings.gemini_model,
            text=response_text,
            raw_response=response_payload,
        )

    def _extract_text(self, payload: dict[str, Any]) -> str:
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

        text_parts = [
            part.get("text", "").strip()
            for part in parts
            if isinstance(part, dict) and isinstance(part.get("text"), str)
        ]
        return "\n".join(part for part in text_parts if part)
