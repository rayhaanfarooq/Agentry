from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from agentry.client import AgentryMonitor
    from agentry.client.monitor import monitor


def __getattr__(name: str) -> Any:
    if name == "AgentryMonitor":
        from agentry.client import AgentryMonitor

        return AgentryMonitor
    if name == "monitor":
        from agentry.client.monitor import monitor

        return monitor
    raise AttributeError(f"module 'agentry' has no attribute {name!r}")


__all__ = ["AgentryMonitor", "monitor"]
__version__ = "0.1.0"
