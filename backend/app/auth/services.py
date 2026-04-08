from __future__ import annotations

from datetime import datetime, timezone
from uuid import uuid4

from fastapi import Request
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.auth.models import RevokedToken
from app.core.config import settings
from app.core.errors import ForbiddenError, NotFoundError, UnauthorizedError
from app.core.security import create_access_token, decode_access_token, is_jwt_error, verify_password
from app.users.models import User


def authenticate_user(db: Session, email: str, password: str) -> User:
    """Valida credenciales y estado del usuario."""
    user = db.scalar(select(User).where(User.email == email.lower().strip()))
    if not user or not verify_password(password, user.hashed_password):
        raise UnauthorizedError("Credenciales inválidas.")
    if not user.is_active:
        raise ForbiddenError("Usuario inactivo.")
    return user


def create_token_for_user(user: User) -> tuple[str, str, datetime]:
    """Genera token JWT y retorna token, jti y expiración."""
    jti = uuid4().hex
    token = create_access_token(subject=str(user.id), jti=jti)
    payload = decode_access_token(token)
    exp = datetime.fromtimestamp(payload["exp"], tz=timezone.utc)
    return token, jti, exp


def revoke_token(db: Session, jti: str, expires_at: datetime) -> None:
    """Guarda un token revocado."""
    revoked = RevokedToken(jti=jti, expires_at=expires_at)
    db.add(revoked)
    db.commit()


def is_token_revoked(db: Session, jti: str) -> bool:
    """Verifica si un token fue revocado."""
    return bool(db.scalar(select(RevokedToken).where(RevokedToken.jti == jti)))


def get_token_from_request(request: Request) -> str | None:
    """Obtiene token desde Authorization o cookie."""
    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.lower().startswith("bearer "):
        return auth_header.split(" ", 1)[1].strip()
    return request.cookies.get(settings.cookie_name)


def get_current_user(db: Session, request: Request) -> User:
    """Resuelve el usuario autenticado desde la request."""
    token = get_token_from_request(request)
    if not token:
        raise UnauthorizedError("Token no proporcionado.")

    try:
        payload = decode_access_token(token)
    except Exception as exc:  # noqa: BLE001
        if is_jwt_error(exc):
            raise UnauthorizedError("Token inválido.") from exc
        raise

    jti = payload.get("jti")
    sub = payload.get("sub")
    if not jti or not sub:
        raise UnauthorizedError("Token inválido.")
    if is_token_revoked(db, jti):
        raise UnauthorizedError("Token revocado.")

    user = db.get(User, int(sub))
    if not user:
        raise NotFoundError("Usuario no encontrado.")
    if not user.is_active:
        raise ForbiddenError("Usuario inactivo.")
    return user


def require_roles(user: User, allowed_roles: set[str]) -> None:
    """Valida que el usuario tenga roles permitidos."""
    user_roles = {role.name for role in user.roles}
    if not user_roles.intersection(allowed_roles):
        raise ForbiddenError("Permisos insuficientes.")


def extract_token_data(token: str) -> tuple[str, datetime]:
    """Extrae jti y expiración desde el JWT."""
    try:
        payload = decode_access_token(token)
    except Exception as exc:  # noqa: BLE001
        if is_jwt_error(exc):
            raise UnauthorizedError("Token inválido.") from exc
        raise
    jti = payload.get("jti")
    exp = payload.get("exp")
    if not jti or not exp:
        raise UnauthorizedError("Token inválido.")
    expires_at = datetime.fromtimestamp(exp, tz=timezone.utc)
    return jti, expires_at
