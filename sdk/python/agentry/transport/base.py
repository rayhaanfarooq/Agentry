from __future__ import annotations

from typing import Protocol

from agentry.models import TraceBatch


class Transport(Protocol):
    def send(self, batch: TraceBatch) -> None:
        """Upload a batch of traces."""
