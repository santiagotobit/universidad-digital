from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.deps import get_current_user_dep, get_db
from app.core.errors import ForbiddenError
from app.admin.schemas import (
    DashboardStatsResponse,
    StudentStatsResponse,
    TeacherStatsResponse,
)
from app.admin.services import (
    get_dashboard_stats,
    get_student_stats,
    get_teacher_stats,
)


router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/stats", response_model=DashboardStatsResponse)
def get_stats_endpoint(
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
) -> DashboardStatsResponse:
    """Obtiene las estadísticas del dashboard.
    
    Solo accesible para administradores.
    """
    # Verificar que el usuario tiene rol Administrador
    role_names = [role.name for role in user.roles] if user.roles else []
    if "Administrador" not in role_names:
        raise ForbiddenError("Solo los administradores pueden acceder a las estadísticas.")
    
    return get_dashboard_stats(db)


@router.get("/student/stats", response_model=StudentStatsResponse)
def get_student_stats_endpoint(
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
) -> StudentStatsResponse:
    """Obtiene las estadísticas del estudiante autenticado.
    
    Solo accesible para estudiantes.
    """
    # Verificar que el usuario tiene rol Estudiante
    role_names = [role.name for role in user.roles] if user.roles else []
    if "Estudiante" not in role_names:
        raise ForbiddenError("Solo los estudiantes pueden acceder a sus estadísticas.")
    
    stats = get_student_stats(db, user.id)
    return StudentStatsResponse(**stats)


@router.get("/teacher/stats", response_model=TeacherStatsResponse)
def get_teacher_stats_endpoint(
    user=Depends(get_current_user_dep),
    db: Session = Depends(get_db),
) -> TeacherStatsResponse:
    """Obtiene las estadísticas del docente autenticado.
    
    Solo accesible para docentes.
    """
    # Verificar que el usuario tiene rol Docente
    role_names = [role.name for role in user.roles] if user.roles else []
    if "Docente" not in role_names:
        raise ForbiddenError("Solo los docentes pueden acceder a sus estadísticas.")
    
    stats = get_teacher_stats(db, user.id)
    return TeacherStatsResponse(**stats)
