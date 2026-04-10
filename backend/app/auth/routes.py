from __future__ import annotations

from fastapi import APIRouter, Depends, Request, Response, status
from sqlalchemy.orm import Session

from app.auth.schemas import LoginRequest, TokenResponse
from app.auth.services import (
    authenticate_user,
    create_token_for_user,
    extract_token_data,
    revoke_token,
)
from app.core.config import settings
from app.core.deps import get_current_user_dep, get_db
from app.users.schemas import UserResponse


router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=TokenResponse)
def login_endpoint(
    payload: LoginRequest, response: Response, db: Session = Depends(get_db)
) -> TokenResponse:
    user = authenticate_user(db, payload.email, payload.password)
    token, jti, expires_at = create_token_for_user(user)
    # Sin domain: la cookie queda ligada al host real del navegador (localhost o 127.0.0.1).
    # domain="localhost" rompe el login si abres Vite en http://127.0.0.1:3000.
    response.set_cookie(
        key=settings.cookie_name,
        value=token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=settings.jwt_expiration_minutes * 60,
        path="/",
    )
    return TokenResponse(access_token=token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout_endpoint(
    request: Request,
    response: Response,
    db: Session = Depends(get_db),
) -> Response:
    token = request.cookies.get(settings.cookie_name)
    if token:
        try:
            jti, expires_at = extract_token_data(token)
            revoke_token(db, jti, expires_at)
        except Exception:  # noqa: BLE001
            pass
    response.delete_cookie(settings.cookie_name, path="/")
    # Ensure the response has an explicit status code (avoid None in ASGI send)
    response.status_code = status.HTTP_204_NO_CONTENT
    return response


@router.get("/me", response_model=UserResponse)
def me_endpoint(user=Depends(get_current_user_dep)) -> UserResponse:
    return UserResponse.model_validate(user, from_attributes=True)
