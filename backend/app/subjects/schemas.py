from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class SubjectCreate(BaseModel):
    """Datos requeridos para crear una materia."""

    code: str = Field(min_length=2, max_length=20)
    name: str = Field(min_length=3, max_length=150)
    credits: int = Field(ge=1, le=30)


class SubjectUpdate(BaseModel):
    """Datos permitidos para actualizar una materia."""

    name: str | None = Field(default=None, min_length=3, max_length=150)
    credits: int | None = Field(default=None, ge=1, le=30)
    is_active: bool | None = None


class SubjectResponse(BaseModel):
    """Datos expuestos al cliente."""

    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    credits: int
    is_active: bool
    created_at: datetime
