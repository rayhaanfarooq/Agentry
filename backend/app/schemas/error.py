from pydantic import BaseModel, Field


class ErrorResponse(BaseModel):
    detail: str = Field(description="Human-readable error summary.")
    error_code: str = Field(description="Stable error identifier for clients.")


class ValidationErrorItem(BaseModel):
    location: str = Field(description="Request field or path that failed validation.")
    message: str = Field(description="Validation error message.")
    error_type: str = Field(description="Pydantic validation error type.")


class ValidationErrorResponse(ErrorResponse):
    errors: list[ValidationErrorItem] = Field(
        default_factory=list,
        description="Detailed validation errors.",
    )
