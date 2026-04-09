from __future__ import annotations

from pydantic import BaseModel, EmailStr


class StudentSubjectResponse(BaseModel):
    id: int
    code: str
    name: str
    credits: int
    is_active: bool

    class Config:
        from_attributes = True


class StudentGradeResponse(BaseModel):
    id: int
    subject_name: str
    value: float | None = None
    notes: str | None = None

    class Config:
        from_attributes = True


class StudentStatsResponse(BaseModel):
    """Respuesta de estadísticas del estudiante."""

    total_enrollments: int
    total_grades: int
    average_grade: float
    current_subjects: int
    enrolled_subjects: list[StudentSubjectResponse] = []
    grades: list[StudentGradeResponse] = []

    class Config:
        from_attributes = True


class TeacherSubjectResponse(BaseModel):
    id: int
    code: str
    name: str
    credits: int
    is_active: bool

    class Config:
        from_attributes = True


class TeacherStudentResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr

    class Config:
        from_attributes = True


class TeacherGradeResponse(BaseModel):
    id: int
    enrollment_id: int
    student_id: int
    student_name: str
    subject_id: int
    subject_name: str
    value: float | None = None
    notes: str | None = None

    class Config:
        from_attributes = True


class TeacherStatsResponse(BaseModel):
    """Respuesta de estadísticas del docente."""

    total_students: int
    total_subjects: int
    pending_grades: int
    assigned_subjects: list[TeacherSubjectResponse] = []
    assigned_students: list[TeacherStudentResponse] = []
    grades: list[TeacherGradeResponse] = []

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
