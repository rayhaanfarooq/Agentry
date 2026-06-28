from fastapi import APIRouter, Response

from app.dependencies.health import HealthServiceDependency
from app.schemas.error import ErrorResponse
from app.schemas.health import HealthResponse

router = APIRouter(tags=["Health"])


@router.get(
    "/health",
    response_model=HealthResponse,
    responses={
        500: {"model": ErrorResponse, "description": "Unexpected server error."},
        503: {
            "model": HealthResponse,
            "description": "Database or Supabase infrastructure unavailable.",
        },
    },
    summary="Check API, PostgreSQL, and Supabase health",
    description=(
        "Verifies the FastAPI application is live, performs a PostgreSQL ping, "
        "and checks Supabase project connectivity."
    ),
)
async def read_health(
    response: Response,
    health_service: HealthServiceDependency,
) -> HealthResponse:
    health_response, status_code = await health_service.check()
    response.status_code = status_code
    return health_response
