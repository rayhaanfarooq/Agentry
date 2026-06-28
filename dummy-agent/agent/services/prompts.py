from __future__ import annotations

from pathlib import Path


class PromptLoader:
    def __init__(self, prompts_directory: Path) -> None:
        self.prompts_directory = prompts_directory

    def load(self, prompt_name: str) -> str:
        prompt_path = self.prompts_directory / prompt_name
        if not prompt_path.exists():
            raise FileNotFoundError(f"Prompt file not found: {prompt_path}")

        prompt_text = prompt_path.read_text(encoding="utf-8").strip()
        if not prompt_text:
            raise ValueError(f"Prompt file is empty: {prompt_path}")

        return prompt_text
