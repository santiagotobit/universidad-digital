from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_dep, get_db, require_roles_dep
from app.enrollments.schemas import EnrollmentCreate, EnrollmentResponse, EnrollmentUpdate
from app.enrollments.services import (
    create_enrollment,
    deactivate_enrollment,
    get_enrollment,
    list_enrollments,
    update_enrollment,
)


router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("/", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment_endpoint(
    payload: EnrollmentCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Estudiante")),
) -> EnrollmentResponse:
    return create_enrollment(db, payload, user)


@router.get("/", response_model=list[EnrollmentResponse])
def list_enrollments_endpoint(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> list[EnrollmentResponse]:
    return list_enrollments(db, user)


@router.get("/{enrollment_id}", response_model=EnrollmentResponse)
def get_enrollment_endpoint(
    enrollment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> EnrollmentResponse:
    return get_enrollment(db, enrollment_id, user)


@router.put("/{enrollment_id}", response_model=EnrollmentResponse)
def update_enrollment_endpoint(
    enrollment_id: int,
    payload: EnrollmentUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _admin=Depends(require_roles_dep("Administrador")),
) -> EnrollmentResponse:
    return update_enrollment(db, enrollment_id, payload, user)


@router.delete("/{enrollment_id}", response_model=EnrollmentResponse)
def deactivate_enrollment_endpoint(
    enrollment_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _admin=Depends(require_roles_dep("Administrador")),
) -> EnrollmentResponse:
    return deactivate_enrollment(db, enrollment_id, user)
