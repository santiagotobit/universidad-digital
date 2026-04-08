from __future__ import annotations

from collections.abc import Generator
from typing import Callable

from fastapi import Depends, Request
from sqlalchemy.orm import Session

from app.auth.services import get_current_user, require_roles
from app.core.database import SessionLocal
from app.users.models import User


def get_db() -> Generator[Session, None, None]:
    """Provee una sesión de base de datos."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user_dep(
    request: Request, db: Session = Depends(get_db)
) -> User:
    """Resuelve el usuario autenticado para dependencias."""
    return get_current_user(db, request)


def require_roles_dep(*roles: str) -> Callable[[User], User]:
    """Crea una dependencia de verificación de roles."""
    allowed = set(roles)

    def _dependency(user: User = Depends(get_current_user_dep)) -> User:
        require_roles(user, allowed)
        return user

    return _dependency
