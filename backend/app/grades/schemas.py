from __future__ import annotations

from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field, condecimal


class GradeCreate(BaseModel):
    """Datos requeridos para registrar una calificación."""

    enrollment_id: int = Field(ge=1)
    value: condecimal(ge=0, le=100, max_digits=5, decimal_places=2)
    notes: str | None = Field(default=None, max_length=255)


class GradeUpdate(BaseModel):
    """Datos permitidos para actualizar una calificación."""

    value: condecimal(ge=0, le=100, max_digits=5, decimal_places=2) | None = None
    notes: str | None = Field(default=None, max_length=255)


class GradeResponse(BaseModel):
    """Datos expuestos al cliente."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    enrollment_id: int
    value: Decimal
    notes: str | None
    created_at: datetime
