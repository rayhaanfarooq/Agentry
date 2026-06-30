from __future__ import annotations

import time
from collections.abc import Callable
from dataclasses import dataclass
from typing import TypeVar

from runloop.config import RunloopSettings
from runloop.utils.logging import get_logger

logger = get_logger(__name__)
T = TypeVar("T")


@dataclass(frozen=True)
class RetryPolicy:
    max_attempts: int
    initial_backoff_seconds: float
    max_backoff_seconds: float

    @classmethod
    def from_settings(cls, settings: RunloopSettings) -> RetryPolicy:
        return cls(
            max_attempts=settings.max_retries,
            initial_backoff_seconds=settings.initial_backoff_seconds,
            max_backoff_seconds=settings.max_backoff_seconds,
        )

    def execute(self, operation: Callable[[], T]) -> T:
        last_error: Exception | None = None

        for attempt in range(1, self.max_attempts + 1):
            try:
                return operation()
            except Exception as error:
                last_error = error
                if attempt >= self.max_attempts:
                    break

                delay = self._delay_for_attempt(attempt)
                logger.debug(
                    "Runloop transport attempt %s failed: %s. Retrying in %.2fs.",
                    attempt,
                    error,
                    delay,
                )
                time.sleep(delay)

        if last_error is None:
            raise RuntimeError("Retry policy failed without capturing an exception.")

        raise last_error

    def _delay_for_attempt(self, attempt: int) -> float:
        backoff = self.initial_backoff_seconds * (2.0 ** (attempt - 1))
        if backoff <= self.max_backoff_seconds:
            return backoff
        return self.max_backoff_seconds
