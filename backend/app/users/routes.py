from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles_dep
from app.users.schemas import UserCreate, UserResponse, UserUpdate
from app.users.services import (
    assign_role,
    create_user,
    deactivate_user,
    get_user,
    list_users,
    remove_role,
    update_user,
)


router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user_endpoint(
    payload: UserCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> UserResponse:
    user = create_user(db, payload)
    return UserResponse.model_validate(user, from_attributes=True)


@router.get("/", response_model=list[UserResponse])
def list_users_endpoint(
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> list[UserResponse]:
    users = list_users(db)
    return [
        UserResponse.model_validate(user, from_attributes=True)
        for user in users
    ]


@router.get("/{user_id}", response_model=UserResponse)
def get_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> UserResponse:
    user = get_user(db, user_id)
    return UserResponse.model_validate(user, from_attributes=True)


@router.put("/{user_id}", response_model=UserResponse)
def update_user_endpoint(
    user_id: int,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> UserResponse:
    user = update_user(db, user_id, payload)
    return UserResponse.model_validate(user, from_attributes=True)


@router.delete("/{user_id}", response_model=UserResponse)
def deactivate_user_endpoint(
    user_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> UserResponse:
    user = deactivate_user(db, user_id)
    return UserResponse.model_validate(user, from_attributes=True)


@router.post("/{user_id}/roles/{role_id}", response_model=UserResponse)
def assign_role_endpoint(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> UserResponse:
    user = assign_role(db, user_id, role_id)
    return UserResponse.model_validate(user, from_attributes=True)


@router.delete("/{user_id}/roles/{role_id}", response_model=UserResponse)
def remove_role_endpoint(
    user_id: int,
    role_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> UserResponse:
    user = remove_role(db, user_id, role_id)
    return UserResponse.model_validate(user, from_attributes=True)
