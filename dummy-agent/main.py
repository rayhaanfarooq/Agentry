from __future__ import annotations

import logging
import sys

from agent.config import get_settings
from agent.llm import GeminiServiceError
from agent.services import build_dummy_agent_service
from agent.utils import configure_logging
from pydantic import ValidationError
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.prompt import Prompt

logger = logging.getLogger(__name__)
console = Console()


def main() -> int:
    configure_logging()

    try:
        settings = get_settings()
        agent_service = build_dummy_agent_service(settings=settings)
    except ValidationError as error:
        logger.error("Environment validation failed: %s", error)
        console.print(
            Panel.fit(
                str(error),
                title="Invalid environment",
                border_style="red",
            )
        )
        return 1
    except Exception:
        logger.exception("Failed to initialize the dummy agent.")
        console.print(
            Panel.fit(
                "The dummy agent could not start. Check the logs above for details.",
                title="Startup error",
                border_style="red",
            )
        )
        return 1

    console.print(
        Panel.fit(
            (
                "Agentry Dummy Agent\n\n"
                f"Model: {settings.gemini_model}\n"
                "Type a prompt and press Enter. Type `exit` or `quit` to leave."
            ),
            title="Ready",
            border_style="blue",
        )
    )

    while True:
        try:
            user_prompt = Prompt.ask("[bold cyan]You[/]").strip()
        except (EOFError, KeyboardInterrupt):
            console.print("\n[bold yellow]Session ended.[/]")
            return 0

        if not user_prompt:
            console.print("[yellow]Enter a prompt to continue.[/]")
            continue

        if user_prompt.lower() in {"exit", "quit"}:
            console.print("[bold green]Goodbye.[/]")
            return 0

        try:
            reply = agent_service.run_prompt(user_prompt)
        except GeminiServiceError as error:
            logger.warning("Gemini request failed: %s", error)
            console.print(
                Panel.fit(
                    str(error),
                    title="Gemini error",
                    border_style="red",
                )
            )
            continue
        except Exception:
            logger.exception("Unexpected failure while processing prompt.")
            console.print(
                Panel.fit(
                    "An unexpected error occurred while processing your prompt.",
                    title="Unexpected error",
                    border_style="red",
                )
            )
            continue

        console.print(
            Panel(
                Markdown(reply.response),
                title=f"Gemini ({reply.model})",
                border_style="green",
            )
        )


if __name__ == "__main__":
    sys.exit(main())
