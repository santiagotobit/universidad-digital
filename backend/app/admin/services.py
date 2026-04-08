from __future__ import annotations

from datetime import datetime, timezone

from sqlalchemy import and_, func, or_
from sqlalchemy.orm import Session

from app.users.models import User
from app.subjects.models import Subject
from app.periods.models import AcademicPeriod
from app.enrollments.models import Enrollment
from app.grades.models import Grade
from app.admin.schemas import DashboardStatsResponse


def get_dashboard_stats(db: Session) -> DashboardStatsResponse:
    """Obtiene las estadísticas del dashboard administrativo."""

    # Contar totales
    total_users = db.query(func.count(User.id)).scalar() or 0
    total_subjects = db.query(func.count(Subject.id)).scalar() or 0
    total_periods = db.query(func.count(AcademicPeriod.id)).scalar() or 0
    total_enrollments = db.query(func.count(Enrollment.id)).scalar() or 0
    total_grades = db.query(func.count(Grade.id)).scalar() or 0

    # Contar períodos activos (where today is between start_date and end_date)
    today = datetime.now(timezone.utc).date()
    active_periods = (
        db.query(func.count(AcademicPeriod.id))
        .filter(AcademicPeriod.start_date <= today, AcademicPeriod.end_date >= today)
        .scalar()
        or 0
    )

    # Obtener usuarios recientes (últimos 5)
    recent_users_query = (
        db.query(User)
        .order_by(User.created_at.desc())
        .limit(5)
        .all()
    )

    recent_users_list = [
        {
            "id": str(user.id),
            "email": user.email,
            "roles": [role.name for role in user.roles] if user.roles else []
        }
        for user in recent_users_query
    ]

    return DashboardStatsResponse(
        total_users=total_users,
        total_subjects=total_subjects,
        total_periods=total_periods,
        total_enrollments=total_enrollments,
        total_grades=total_grades,
        active_periods=active_periods,
        recent_users=recent_users_list,
    )


def get_student_stats(db: Session, user_id: int) -> dict:
    """Obtiene estadísticas personalizadas para un estudiante."""

    # Contar inscripciones
    enrollments = db.query(func.count(Enrollment.id)).filter(
        Enrollment.user_id == user_id
    ).scalar() or 0

    # Contar calificaciones
    grades = db.query(func.count(Grade.id)).filter(
        Grade.enrollment_id.in_(
            db.query(Enrollment.id).filter(Enrollment.user_id == user_id)
        )
    ).scalar() or 0

    # Promedio de calificaciones
    avg_grade = db.query(func.avg(Grade.value)).filter(
        Grade.enrollment_id.in_(
            db.query(Enrollment.id).filter(Enrollment.user_id == user_id)
        ),
        Grade.value.isnot(None)
    ).scalar()

    # Asignaturas actuales
    today = datetime.now(timezone.utc).date()
    current_subjects = db.query(func.count(Subject.id)).filter(
        Subject.id.in_(
            db.query(Enrollment.subject_id).filter(
                Enrollment.user_id == user_id,
                Enrollment.period_id.in_(
                    db.query(AcademicPeriod.id).filter(
                        AcademicPeriod.start_date <= today,
                        AcademicPeriod.end_date >= today
                    )
                )
            )
        )
    ).scalar() or 0

    return {
        "total_enrollments": enrollments,
        "total_grades": grades,
        "average_grade": round(float(avg_grade), 2) if avg_grade else 0,
        "current_subjects": current_subjects,
    }


def get_teacher_stats(db: Session, user_id: int) -> dict:
    """Obtiene estadísticas personalizadas para un docente."""
    
    # Contar estudiantes (a través de enrollments)
    students = db.query(func.count(func.distinct(Enrollment.user_id))).filter(
        Enrollment.subject_id.in_(
            db.query(Subject.id).filter(Subject.teacher_id == user_id)
        )
    ).scalar() or 0

    # Contar asignaturas
    subjects = db.query(func.count(Subject.id)).filter(
        Subject.teacher_id == user_id
    ).scalar() or 0

    # Calificaciones pendientes (sin enviar o sin value)
    pending_grades = db.query(func.count(Grade.id)).filter(
        Grade.enrollment_id.in_(
            db.query(Enrollment.id).filter(
                Enrollment.subject_id.in_(
                    db.query(Subject.id).filter(Subject.teacher_id == user_id)
                )
            )
        ),
        or_(Grade.value.is_(None), Grade.value == 0)
    ).scalar() or 0

    return {
        "total_students": students,
        "total_subjects": subjects,
        "pending_grades": pending_grades,
    }
