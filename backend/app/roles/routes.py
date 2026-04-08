from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles_dep
from app.roles.schemas import RoleCreate, RoleResponse, RoleUpdate
from app.roles.services import create_role, delete_role, get_role, list_roles, update_role


router = APIRouter(prefix="/roles", tags=["roles"])


@router.post("/", response_model=RoleResponse, status_code=status.HTTP_201_CREATED)
def create_role_endpoint(
    payload: RoleCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> RoleResponse:
    return create_role(db, payload)


@router.get("/", response_model=list[RoleResponse])
def list_roles_endpoint(
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> list[RoleResponse]:
    return list_roles(db)


@router.get("/{role_id}", response_model=RoleResponse)
def get_role_endpoint(
    role_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> RoleResponse:
    return get_role(db, role_id)


@router.put("/{role_id}", response_model=RoleResponse)
def update_role_endpoint(
    role_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> RoleResponse:
    return update_role(db, role_id, payload)


@router.delete("/{role_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_role_endpoint(
    role_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> Response:
    delete_role(db, role_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
