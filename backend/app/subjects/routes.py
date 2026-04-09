from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles_dep
from app.subjects.schemas import SubjectCreate, SubjectResponse, SubjectUpdate
from app.subjects.services import (
    create_subject,
    deactivate_subject,
    get_subject,
    list_subjects,
    update_subject,
)


router = APIRouter(prefix="/subjects", tags=["subjects"])


@router.post("", response_model=SubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject_endpoint(
    payload: SubjectCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> SubjectResponse:
    return create_subject(db, payload)


@router.get("", response_model=list[SubjectResponse])
def list_subjects_endpoint(
    db: Session = Depends(get_db),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> list[SubjectResponse]:
    return list_subjects(db)


@router.get("/{subject_id}", response_model=SubjectResponse)
def get_subject_endpoint(
    subject_id: int,
    db: Session = Depends(get_db),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> SubjectResponse:
    return get_subject(db, subject_id)


@router.put("/{subject_id}", response_model=SubjectResponse)
def update_subject_endpoint(
    subject_id: int,
    payload: SubjectUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> SubjectResponse:
    return update_subject(db, subject_id, payload)


@router.delete("/{subject_id}", response_model=SubjectResponse)
def delete_subject_endpoint(
    subject_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> SubjectResponse:
    return deactivate_subject(db, subject_id)
