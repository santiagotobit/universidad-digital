from __future__ import annotations

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import settings
from app.core.database import SessionLocal, init_db
from app.core.errors import AppError, ConflictError, ForbiddenError, NotFoundError, UnauthorizedError
from app.roles.services import ensure_default_roles
from app.auth.routes import router as auth_router
from app.enrollments.routes import router as enrollments_router
from app.grades.routes import router as grades_router
from app.periods.routes import router as periods_router
from app.roles.routes import router as roles_router
from app.subjects.routes import router as subjects_router
from app.users.routes import router as users_router
from app.admin.routes import router as admin_router
from app.tasks.routes import router as tasks_router


app = FastAPI(title=settings.api_title, version=settings.api_version)

if settings.is_production:
    if not settings.jwt_secret:
        raise RuntimeError("APP_JWT_SECRET es obligatorio en producción.")
    if not settings.cors_origins:
        raise RuntimeError("APP_CORS_ORIGINS es obligatorio en producción.")
    settings.cookie_secure = True

allowed_origins = settings.cors_origins or ["http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)

@app.on_event("startup")
def on_startup() -> None:
    init_db()
    db = SessionLocal()
    try:
        ensure_default_roles(db)
    finally:
        db.close()


@app.exception_handler(NotFoundError)
def not_found_handler(request: Request, exc: NotFoundError) -> JSONResponse:
    return JSONResponse(status_code=404, content={"detail": exc.message})


@app.exception_handler(ConflictError)
def conflict_handler(request: Request, exc: ConflictError) -> JSONResponse:
    return JSONResponse(status_code=409, content={"detail": exc.message})


@app.exception_handler(UnauthorizedError)
def unauthorized_handler(request: Request, exc: UnauthorizedError) -> JSONResponse:
    return JSONResponse(status_code=401, content={"detail": exc.message})


@app.exception_handler(ForbiddenError)
def forbidden_handler(request: Request, exc: ForbiddenError) -> JSONResponse:
    return JSONResponse(status_code=403, content={"detail": exc.message})


@app.exception_handler(AppError)
def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(status_code=400, content={"detail": exc.message})


@app.exception_handler(RequestValidationError)
def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    return JSONResponse(status_code=422, content={"detail": exc.errors()})


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)
app.include_router(subjects_router)
app.include_router(periods_router)
app.include_router(enrollments_router)
app.include_router(grades_router)
app.include_router(admin_router)
app.include_router(tasks_router)
