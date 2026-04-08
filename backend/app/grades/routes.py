from __future__ import annotations

from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_dep, get_db, require_roles_dep
from app.grades.schemas import GradeCreate, GradeResponse, GradeUpdate
from app.grades.services import create_grade, delete_grade, get_grade, list_grades, update_grade


router = APIRouter(prefix="/grades", tags=["grades"])


@router.post("/", response_model=GradeResponse, status_code=status.HTTP_201_CREATED)
def create_grade_endpoint(
    payload: GradeCreate,
    db: Session = Depends(get_db),
    _user=Depends(require_roles_dep("Administrador", "Docente")),
) -> GradeResponse:
    return create_grade(db, payload)


@router.get("/", response_model=list[GradeResponse])
def list_grades_endpoint(
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> list[GradeResponse]:
    return list_grades(db, user)


@router.get("/{grade_id}", response_model=GradeResponse)
def get_grade_endpoint(
    grade_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> GradeResponse:
    return get_grade(db, grade_id, user)


@router.put("/{grade_id}", response_model=GradeResponse)
def update_grade_endpoint(
    grade_id: int,
    payload: GradeUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Docente")),
) -> GradeResponse:
    return update_grade(db, grade_id, payload, user)


@router.delete("/{grade_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_grade_endpoint(
    grade_id: int,
    db: Session = Depends(get_db),
    user=Depends(get_current_user_dep),
    _user=Depends(require_roles_dep("Administrador", "Docente")),
) -> Response:
    delete_grade(db, grade_id, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
