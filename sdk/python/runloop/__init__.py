from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from runloop.client import RunloopMonitor
    from runloop.client.monitor import monitor


def __getattr__(name: str) -> Any:
    if name == "RunloopMonitor":
        from runloop.client import RunloopMonitor

        return RunloopMonitor
    if name == "monitor":
        from runloop.client.monitor import monitor

        return monitor
    raise AttributeError(f"module 'runloop' has no attribute {name!r}")


__all__ = ["RunloopMonitor", "monitor"]
__version__ = "0.1.0"
