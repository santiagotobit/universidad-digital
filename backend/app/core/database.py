from __future__ import annotations

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, Session, sessionmaker

from app.core.config import settings


class Base(DeclarativeBase):
    pass


def _connect_args() -> dict:
    args: dict = {"connect_timeout": 10}
    if settings.database_ssl_mode:
        args["sslmode"] = settings.database_ssl_mode
    return args


# Cloud SQL / redes "inestables" suelen cortar conexiones o colgar handshakes.
# Estos parámetros buscan: detectar conexiones muertas (pre_ping), reciclarlas,
# evitar esperas largas y mantener keepalives a nivel TCP.
engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_recycle=300,
    pool_size=5,
    max_overflow=10,
    pool_timeout=30,
    connect_args=_connect_args(),
)
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, class_=Session)


def init_db() -> None:
    """Crea tablas automáticamente si está habilitado."""

    if not settings.auto_create_tables:
        return
    # Importar modelos para registrar en metadata
    from app.auth import models as _auth  # noqa: F401
    from app.enrollments import models as _enrollments  # noqa: F401
    from app.grades import models as _grades  # noqa: F401
    from app.periods import models as _periods  # noqa: F401
    from app.roles import models as _roles  # noqa: F401
    from app.subjects import models as _subjects  # noqa: F401
    from app.users import models as _users  # noqa: F401
    from app.tasks import models as _tasks  # noqa: F401

    Base.metadata.create_all(bind=engine)
