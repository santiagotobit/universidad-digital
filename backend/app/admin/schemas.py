from __future__ import annotations

from pydantic import BaseModel


class StudentStatsResponse(BaseModel):
    """Respuesta de estadísticas del estudiante."""

    total_enrollments: int
    total_grades: int
    average_grade: float
    current_subjects: int

    class Config:
        from_attributes = True


class TeacherStatsResponse(BaseModel):
    """Respuesta de estadísticas del docente."""

    total_students: int
    total_subjects: int
    pending_grades: int

    class Config:
        from_attributes = True


class DashboardStatsResponse(BaseModel):
    """Respuesta de estadísticas del dashboard."""

    total_users: int
    total_subjects: int
    total_periods: int
    total_enrollments: int
    total_grades: int
    active_periods: int
    recent_users: list[dict] = []

    class Config:
        from_attributes = True
