from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.errors import ConflictError, NotFoundError
from app.periods.models import AcademicPeriod
from app.periods.schemas import AcademicPeriodCreate, AcademicPeriodUpdate


def create_period(db: Session, data: AcademicPeriodCreate) -> AcademicPeriod:
    """Crea un periodo académico."""
    if db.scalar(select(AcademicPeriod).where(AcademicPeriod.code == data.code)):
        raise ConflictError("El código de periodo ya existe.")
    if data.end_date < data.start_date:
        raise ConflictError("La fecha de fin no puede ser anterior a la de inicio.")
    period = AcademicPeriod(
        code=data.code,
        name=data.name,
        start_date=data.start_date,
        end_date=data.end_date,
    )
    db.add(period)
    db.commit()
    db.refresh(period)
    return period


def list_periods(db: Session) -> list[AcademicPeriod]:
    """Lista periodos académicos."""
    return list(db.scalars(select(AcademicPeriod).order_by(AcademicPeriod.id)).all())


def get_period(db: Session, period_id: int) -> AcademicPeriod:
    """Obtiene un periodo académico por ID."""
    period = db.get(AcademicPeriod, period_id)
    if not period:
        raise NotFoundError("Periodo académico no encontrado.")
    return period


def update_period(db: Session, period_id: int, data: AcademicPeriodUpdate) -> AcademicPeriod:
    """Actualiza un periodo académico."""
    period = get_period(db, period_id)
    if data.start_date is not None and data.end_date is not None:
        if data.end_date < data.start_date:
            raise ConflictError("La fecha de fin no puede ser anterior a la de inicio.")
    if data.start_date is not None and data.end_date is None:
        if period.end_date < data.start_date:
            raise ConflictError("La fecha de fin no puede ser anterior a la de inicio.")
    if data.end_date is not None and data.start_date is None:
        if data.end_date < period.start_date:
            raise ConflictError("La fecha de fin no puede ser anterior a la de inicio.")
    if data.name is not None:
        period.name = data.name
    if data.start_date is not None:
        period.start_date = data.start_date
    if data.end_date is not None:
        period.end_date = data.end_date
    if data.is_active is not None:
        period.is_active = data.is_active
    db.commit()
    db.refresh(period)
    return period


def deactivate_period(db: Session, period_id: int) -> AcademicPeriod:
    """Desactiva un periodo académico (eliminación lógica)."""
    period = get_period(db, period_id)
    period.is_active = False
    db.commit()
    db.refresh(period)
    return period