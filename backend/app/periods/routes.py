from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.deps import get_db, require_roles_dep
from app.periods.schemas import (
    AcademicPeriodCreate,
    AcademicPeriodResponse,
    AcademicPeriodUpdate,
)
from app.periods.services import (
    create_period,
    deactivate_period,
    get_period,
    list_periods,
    update_period,
)


router = APIRouter(prefix="/periods", tags=["periods"])


@router.post("/", response_model=AcademicPeriodResponse, status_code=status.HTTP_201_CREATED)
def create_period_endpoint(
    payload: AcademicPeriodCreate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> AcademicPeriodResponse:
    return create_period(db, payload)


@router.get("/", response_model=list[AcademicPeriodResponse])
def list_periods_endpoint(
    db: Session = Depends(get_db),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> list[AcademicPeriodResponse]:
    return list_periods(db)


@router.get("/{period_id}", response_model=AcademicPeriodResponse)
def get_period_endpoint(
    period_id: int,
    db: Session = Depends(get_db),
    _user=Depends(require_roles_dep("Administrador", "Docente", "Estudiante")),
) -> AcademicPeriodResponse:
    return get_period(db, period_id)


@router.put("/{period_id}", response_model=AcademicPeriodResponse)
def update_period_endpoint(
    period_id: int,
    payload: AcademicPeriodUpdate,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> AcademicPeriodResponse:
    return update_period(db, period_id, payload)


@router.delete("/{period_id}", response_model=AcademicPeriodResponse)
def delete_period_endpoint(
    period_id: int,
    db: Session = Depends(get_db),
    _admin=Depends(require_roles_dep("Administrador")),
) -> AcademicPeriodResponse:
    return deactivate_period(db, period_id)
