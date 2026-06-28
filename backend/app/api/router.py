from fastapi import APIRouter

from app.api.routes import health_router, traces_router

api_router = APIRouter()
api_router.include_router(health_router)
api_router.include_router(traces_router)

__all__ = ["api_router"]
