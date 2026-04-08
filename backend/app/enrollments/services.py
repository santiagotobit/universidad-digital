from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.enrollments.models import Enrollment
from app.enrollments.schemas import EnrollmentCreate, EnrollmentUpdate
from app.periods.models import AcademicPeriod
from app.subjects.models import Subject
from app.users.models import User


def create_enrollment(db: Session, data: EnrollmentCreate, actor: User) -> Enrollment:
    """Crea una inscripción respetando ownership."""
    if any(role.name == "Estudiante" for role in actor.roles):
        if data.user_id != actor.id:
            raise ConflictError("Acceso no permitido.")
    user = db.get(User, data.user_id)
    if not user:
        raise NotFoundError("Usuario no encontrado.")
    if not user.is_active:
        raise ConflictError("Usuario inactivo.")

    subject = db.get(Subject, data.subject_id)
    if not subject:
        raise NotFoundError("Materia no encontrada.")
    if not subject.is_active:
        raise ConflictError("Materia inactiva.")

    period = db.get(AcademicPeriod, data.period_id)
    if not period:
        raise NotFoundError("Periodo académico no encontrado.")
    if not period.is_active:
        raise ConflictError("Periodo académico inactivo.")

    exists = db.scalar(
        select(Enrollment).where(
            Enrollment.user_id == data.user_id,
            Enrollment.subject_id == data.subject_id,
            Enrollment.period_id == data.period_id,
        )
    )
    if exists:
        raise ConflictError("La inscripción ya existe.")

    enrollment = Enrollment(
        user_id=data.user_id,
        subject_id=data.subject_id,
        period_id=data.period_id,
    )
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


def list_enrollments(db: Session, user: User) -> list[Enrollment]:
    """Lista inscripciones respetando ownership."""
    stmt = select(Enrollment).order_by(Enrollment.id)
    if any(role.name == "Estudiante" for role in user.roles):
        stmt = stmt.where(Enrollment.user_id == user.id)
    return list(db.scalars(stmt).all())


def get_enrollment(db: Session, enrollment_id: int, user: User) -> Enrollment:
    """Obtiene una inscripción por ID respetando ownership."""
    enrollment = db.get(Enrollment, enrollment_id)
    if not enrollment:
        raise NotFoundError("Inscripción no encontrada.")
    if any(role.name == "Estudiante" for role in user.roles):
        if enrollment.user_id != user.id:
            raise ConflictError("Acceso no permitido.")
    return enrollment


def update_enrollment(db: Session, enrollment_id: int, data: EnrollmentUpdate, user: User) -> Enrollment:
    """Actualiza una inscripción."""
    enrollment = get_enrollment(db, enrollment_id, user)
    if data.is_active is not None:
        enrollment.is_active = data.is_active
    db.commit()
    db.refresh(enrollment)
    return enrollment


def deactivate_enrollment(db: Session, enrollment_id: int, user: User) -> Enrollment:
    """Desactiva una inscripción (eliminación lógica)."""
    enrollment = get_enrollment(db, enrollment_id, user)
    enrollment.is_active = False
    db.commit()
    db.refresh(enrollment)
    return enrollment
