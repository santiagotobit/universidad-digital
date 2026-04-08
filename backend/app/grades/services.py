from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.enrollments.models import Enrollment
from app.grades.models import Grade
from app.grades.schemas import GradeCreate, GradeUpdate
from app.users.models import User


def create_grade(db: Session, data: GradeCreate) -> Grade:
    """Registra una calificación."""
    enrollment = db.get(Enrollment, data.enrollment_id)
    if not enrollment:
        raise NotFoundError("Inscripción no encontrada.")
    if not enrollment.is_active:
        raise ConflictError("Inscripción inactiva.")
    grade = Grade(
        enrollment_id=data.enrollment_id,
        value=data.value,
        notes=data.notes,
    )
    db.add(grade)
    db.commit()
    db.refresh(grade)
    return grade


def list_grades(db: Session, user: User) -> list[Grade]:
    """Lista calificaciones respetando ownership."""
    stmt = select(Grade).order_by(Grade.id)
    if any(role.name == "Estudiante" for role in user.roles):
        stmt = stmt.join(Enrollment).where(Enrollment.user_id == user.id)
    return list(db.scalars(stmt).all())


def get_grade(db: Session, grade_id: int, user: User) -> Grade:
    """Obtiene una calificación por ID respetando ownership."""
    grade = db.get(Grade, grade_id)
    if not grade:
        raise NotFoundError("Calificación no encontrada.")
    if any(role.name == "Estudiante" for role in user.roles):
        enrollment = db.get(Enrollment, grade.enrollment_id)
        if not enrollment or enrollment.user_id != user.id:
            raise ConflictError("Acceso no permitido.")
    return grade


def update_grade(db: Session, grade_id: int, data: GradeUpdate, user: User) -> Grade:
    """Actualiza una calificación."""
    grade = get_grade(db, grade_id, user)
    if data.value is not None:
        grade.value = data.value
    if data.notes is not None:
        grade.notes = data.notes
    db.commit()
    db.refresh(grade)
    return grade


def delete_grade(db: Session, grade_id: int, user: User) -> None:
    """Elimina una calificación."""
    grade = get_grade(db, grade_id, user)
    db.delete(grade)
    db.commit()
