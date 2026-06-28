from typing import cast

from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession


class HealthRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def ping(self) -> bool:
        result = await self.session.execute(text("SELECT 1"))
        scalar_value = cast(int, result.scalar_one())
        return scalar_value == 1
