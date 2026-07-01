from agent.llm.gemini import GeminiService
from agent.models.chat import FunctionCall


def test_extract_parts_parses_text_response() -> None:
    service = GeminiService.__new__(GeminiService)
    payload = {
        "candidates": [
            {
                "content": {
                    "parts": [{"text": "Hello from Gemini"}],
                }
            }
        ]
    }

    text, function_calls = service._extract_parts(payload)

    assert text == "Hello from Gemini"
    assert function_calls == []


def test_extract_parts_parses_function_call() -> None:
    service = GeminiService.__new__(GeminiService)
    payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {
                            "functionCall": {
                                "name": "lookup",
                                "args": {"key": "pricing"},
                            }
                        }
                    ],
                }
            }
        ]
    }

    text, function_calls = service._extract_parts(payload)

    assert text is None
    assert function_calls == [
        FunctionCall(name="lookup", args={"key": "pricing"}),
    ]


def test_extract_parts_parses_mixed_text_and_function_call() -> None:
    service = GeminiService.__new__(GeminiService)
    payload = {
        "candidates": [
            {
                "content": {
                    "parts": [
                        {"text": "Checking pricing"},
                        {
                            "functionCall": {
                                "name": "compute",
                                "args": {"expression": "2 + 2"},
                            }
                        },
                    ],
                }
            }
        ]
    }

    text, function_calls = service._extract_parts(payload)

    assert text == "Checking pricing"
    assert function_calls[0].name == "compute"
