from __future__ import annotations

from dataclasses import dataclass
from typing import Annotated

from fastapi import Depends, HTTPException, status


@dataclass(frozen=True)
class AuthenticatedUser:
    id: str
    email: str | None = None
    role: str | None = None


async def get_current_user() -> AuthenticatedUser:
    raise HTTPException(
        status_code=status.HTTP_501_NOT_IMPLEMENTED,
        detail="Supabase Auth integration has not been implemented yet.",
    )


CurrentUserDependency = Annotated[AuthenticatedUser, Depends(get_current_user)]

__all__ = ["AuthenticatedUser", "CurrentUserDependency", "get_current_user"]
