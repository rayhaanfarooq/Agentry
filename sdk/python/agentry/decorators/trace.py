from __future__ import annotations

import asyncio
import functools
from collections.abc import Awaitable, Callable, Coroutine
from typing import Any, Literal, ParamSpec, TypeVar, cast, overload

from agentry.tracing.scope import ManagedScope

P = ParamSpec("P")
R = TypeVar("R")


class TraceHandle:
    def __init__(
        self,
        *,
        monitor: Any,
        kind: str,
        name: str | None,
        metadata: dict[str, Any],
    ) -> None:
        self.monitor = monitor
        self.kind = kind
        self.name = name
        self.metadata = metadata
        self._scope: ManagedScope | None = None

    @overload
    def __call__(self, func: Callable[P, R]) -> Callable[P, R]: ...

    @overload
    def __call__(
        self,
        func: Callable[P, Awaitable[R]],
    ) -> Callable[P, Awaitable[R]]: ...

    def __call__(
        self,
        func: Callable[P, Any],
    ) -> Callable[P, Any]:
        if asyncio.iscoroutinefunction(func):
            async_func = cast(Callable[P, Coroutine[Any, Any, R]], func)

            @functools.wraps(func)
            async def async_wrapper(*args: P.args, **kwargs: P.kwargs) -> Any:
                scope = self._create_scope(default_name=func.__qualname__)
                with scope:
                    return await async_func(*args, **kwargs)

            return async_wrapper

        sync_func = cast(Callable[P, R], func)

        @functools.wraps(func)
        def sync_wrapper(*args: P.args, **kwargs: P.kwargs) -> Any:
            scope = self._create_scope(default_name=func.__qualname__)
            with scope:
                return sync_func(*args, **kwargs)

        return sync_wrapper

    def __enter__(self) -> ManagedScope:
        scope = self._create_scope(default_name="trace")
        self._scope = scope
        return scope.__enter__()

    def __exit__(
        self,
        exc_type: Any,
        exc: Any,
        tb: Any,
    ) -> Literal[False]:
        if self._scope is None:
            return False
        return self._scope.__exit__(exc_type, exc, tb)

    async def __aenter__(self) -> ManagedScope:
        return self.__enter__()

    async def __aexit__(
        self,
        exc_type: Any,
        exc: Any,
        tb: Any,
    ) -> Literal[False]:
        return self.__exit__(exc_type, exc, tb)

    def _create_scope(self, *, default_name: str) -> ManagedScope:
        scope_name = self.name or default_name
        return ManagedScope(
            monitor=self.monitor,
            kind=self.kind,
            name=scope_name,
            metadata=self.metadata,
        )
