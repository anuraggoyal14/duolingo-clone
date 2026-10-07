from fastapi import Request
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse


class AppError(Exception):
    """Domain error rendered as `{"error": {"code": ..., "message": ...}}`.

    `code` is a stable machine-readable identifier the frontend can branch on
    (e.g. `out_of_hearts` opens the "out of hearts" modal)."""

    def __init__(self, status_code: int, code: str, message: str):
        super().__init__(message)
        self.status_code = status_code
        self.code = code
        self.message = message


class NotFound(AppError):
    def __init__(self, what: str):
        super().__init__(404, "not_found", f"{what} not found")


async def app_error_handler(_request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": {"code": exc.code, "message": exc.message}},
    )


async def validation_error_handler(_request: Request, exc: RequestValidationError) -> JSONResponse:
    """Render request-validation failures in the same envelope as domain errors."""
    first = exc.errors()[0] if exc.errors() else {}
    location = ".".join(str(part) for part in first.get("loc", ()) if part != "body")
    message = f"{location}: {first.get('msg', 'invalid value')}" if location else "Invalid request"
    return JSONResponse(status_code=422, content={"error": {"code": "validation_error", "message": message}})
