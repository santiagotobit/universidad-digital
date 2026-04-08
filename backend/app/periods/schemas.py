from __future__ import annotations

from datetime import date, datetime

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AcademicPeriodCreate(BaseModel):
    """Datos requeridos para crear un periodo académico."""

    code: str = Field(min_length=2, max_length=20)
    name: str = Field(min_length=3, max_length=120)
    start_date: date
    end_date: date

    @model_validator(mode="after")
    def _validate_dates(self) -> "AcademicPeriodCreate":
        if self.end_date < self.start_date:
            raise ValueError("La fecha de fin no puede ser anterior a la de inicio.")
        return self


class AcademicPeriodUpdate(BaseModel):
    """Datos permitidos para actualizar un periodo académico."""

    name: str | None = Field(default=None, min_length=3, max_length=120)
    start_date: date | None = None
    end_date: date | None = None
    is_active: bool | None = None

    @model_validator(mode="after")
    def _validate_dates(self) -> "AcademicPeriodUpdate":
        if self.start_date and self.end_date and self.end_date < self.start_date:
            raise ValueError("La fecha de fin no puede ser anterior a la de inicio.")
        return self


class AcademicPeriodResponse(BaseModel):
    """Datos expuestos al cliente."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    start_date: date
    end_date: date
    is_active: bool
    created_at: datetime
