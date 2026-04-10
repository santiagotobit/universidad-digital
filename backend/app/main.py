from __future__ import annotations

import logging

from fastapi import FastAPI, Request
from sqlalchemy.exc import IntegrityError, OperationalError, ProgrammingError
from fastapi.exceptions import RequestValidationError, ResponseValidationError
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

logger = logging.getLogger(__name__)


@app.on_event("startup")
def on_startup() -> None:
    try:
        init_db()
        db = SessionLocal()
        try:
            ensure_default_roles(db)
        finally:
            db.close()
    except Exception:
        logger.exception(
            "No se pudo inicializar la base de datos al arrancar. "
            "Revisa APP_DATABASE_URL, red (Cloud SQL: IP autorizada o Auth Proxy) y opcional APP_DATABASE_SSL_MODE."
        )
        if settings.is_production:
            raise


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


@app.exception_handler(ValueError)
def value_error_handler(request: Request, exc: ValueError) -> JSONResponse:
    """p. ej. validadores SQLAlchemy (@validates) en modelos."""
    logger.warning("ValueError en request: %s", exc)
    return JSONResponse(status_code=400, content={"detail": str(exc)})


@app.exception_handler(ResponseValidationError)
def response_validation_error_handler(request: Request, exc: ResponseValidationError) -> JSONResponse:
    logger.exception("La respuesta no coincide con response_model: %s", exc)
    detail: str | list = (
        exc.errors() if not settings.is_production else "Respuesta inválida del servidor (revisa modelos vs base de datos)."
    )
    return JSONResponse(status_code=500, content={"detail": detail})


@app.exception_handler(ProgrammingError)
def database_schema_handler(request: Request, exc: ProgrammingError) -> JSONResponse:
    logger.exception("Error de esquema SQL: %s", exc)
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "La base de datos no coincide con el esquema esperado (tabla o columna faltante). "
                "Si al arrancar falló init_db, crea las tablas con Alembic o deja que el backend "
                "conecte bien a la BD y reinicia. Detalle técnico en logs del servidor."
            )
        },
    )


@app.exception_handler(IntegrityError)
def database_integrity_handler(request: Request, exc: IntegrityError) -> JSONResponse:
    logger.exception("Restricción de integridad: %s", exc)
    detail = (
        "No se pudo guardar por una restricción en la base de datos "
        "(dato duplicado, clave foránea inválida, etc.)."
    )
    if not settings.is_production:
        orig = getattr(exc, "orig", None)
        if orig is not None:
            detail = f"{detail} [{orig}]"[:900]
    return JSONResponse(status_code=409, content={"detail": detail})


@app.exception_handler(OperationalError)
def database_unavailable_handler(request: Request, exc: OperationalError) -> JSONResponse:
    logger.exception("Error de base de datos: %s", exc)
    return JSONResponse(
        status_code=503,
        content={
            "detail": (
                "No se pudo conectar a la base de datos. "
                "En Google Cloud SQL: añade tu IP pública en «Redes autorizadas», "
                "prueba APP_DATABASE_SSL_MODE=require, o usa Cloud SQL Auth Proxy en local."
            )
        },
    )


@app.exception_handler(Exception)
def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("Error no controlado: %s", exc)
    detail = "Error interno del servidor."
    if not settings.is_production:
        detail = f"{type(exc).__name__}: {exc}"[:800]
    return JSONResponse(status_code=500, content={"detail": detail})


app.include_router(auth_router)
app.include_router(users_router)
app.include_router(roles_router)
app.include_router(subjects_router)
app.include_router(periods_router)
app.include_router(enrollments_router)
app.include_router(grades_router)
app.include_router(admin_router)
app.include_router(tasks_router)
