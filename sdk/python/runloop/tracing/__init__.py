from __future__ import annotations

from typing import TYPE_CHECKING, Any

if TYPE_CHECKING:
    from runloop.tracing.runtime import ActiveSpan, ActiveTrace
    from runloop.tracing.scope import ManagedScope


def __getattr__(name: str) -> Any:
    if name in {"ActiveSpan", "ActiveTrace"}:
        from runloop.tracing.runtime import ActiveSpan, ActiveTrace

        exports = {
            "ActiveSpan": ActiveSpan,
            "ActiveTrace": ActiveTrace,
        }
        return exports[name]
    if name == "ManagedScope":
        from runloop.tracing.scope import ManagedScope

        return ManagedScope
    raise AttributeError(f"module 'runloop.tracing' has no attribute {name!r}")


__all__ = ["ActiveSpan", "ActiveTrace", "ManagedScope"]
