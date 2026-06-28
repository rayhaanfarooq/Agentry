from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.services.health import health_service

router = APIRouter(tags=["Health"])


@router.get("/health", summary="Check API and database health")
async def read_health() -> JSONResponse:
    health_response, http_status = await health_service.check()
    return JSONResponse(
        status_code=http_status,
        content=health_response.model_dump(),
    )
