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
    total_grades = db.query(func.count(Grade.id)).filter(
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

    # Obtener asignaturas inscritas
    enrolled_subjects = (
        db.query(Subject)
        .join(Enrollment, Enrollment.subject_id == Subject.id)
        .filter(Enrollment.user_id == user_id)
        .all()
    )

    # Obtener calificaciones
    grade_records = (
        db.query(Grade, Subject)
        .join(Enrollment, Grade.enrollment_id == Enrollment.id)
        .join(Subject, Enrollment.subject_id == Subject.id)
        .filter(Enrollment.user_id == user_id)
        .order_by(Grade.id)
        .all()
    )

    return {
        "total_enrollments": enrollments,
        "total_grades": total_grades,
        "average_grade": round(float(avg_grade), 2) if avg_grade else 0,
        "current_subjects": current_subjects,
        "enrolled_subjects": [
            {
                "id": subject.id,
                "code": subject.code,
                "name": subject.name,
                "credits": subject.credits,
                "is_active": subject.is_active,
            }
            for subject in enrolled_subjects
        ],
        "grades": [
            {
                "id": grade.id,
                "subject_name": subject.name,
                "value": grade.value,
                "notes": grade.notes,
            }
            for grade, subject in grade_records
        ],
    }


def get_teacher_stats(db: Session, user_id: int) -> dict:
    """Obtiene estadísticas personalizadas para un docente."""
    
    subject_ids_query = db.query(Subject.id).filter(Subject.teacher_id == user_id)

    # Contar estudiantes (a través de enrollments)
    students = db.query(func.count(func.distinct(Enrollment.user_id))).filter(
        Enrollment.subject_id.in_(subject_ids_query)
    ).scalar() or 0

    # Contar asignaturas
    subjects = db.query(func.count(Subject.id)).filter(
        Subject.teacher_id == user_id
    ).scalar() or 0

    # Calificaciones pendientes (sin enviar o sin value)
    pending_grades = db.query(func.count(Grade.id)).filter(
        Grade.enrollment_id.in_(
            db.query(Enrollment.id).filter(
                Enrollment.subject_id.in_(subject_ids_query)
            )
        ),
        or_(Grade.value.is_(None), Grade.value == 0)
    ).scalar() or 0

    subject_records = db.query(Subject).filter(Subject.teacher_id == user_id).all()
    student_records = (
        db.query(User)
        .join(Enrollment, Enrollment.user_id == User.id)
        .filter(Enrollment.subject_id.in_(subject_ids_query))
        .distinct()
        .all()
    )
    grade_records = (
        db.query(Grade, Enrollment, Subject, User)
        .join(Enrollment, Grade.enrollment_id == Enrollment.id)
        .join(Subject, Enrollment.subject_id == Subject.id)
        .join(User, Enrollment.user_id == User.id)
        .filter(Subject.teacher_id == user_id)
        .order_by(Grade.id)
        .all()
    )

    assigned_subjects = [
        {
            "id": subject.id,
            "code": subject.code,
            "name": subject.name,
            "credits": subject.credits,
            "is_active": subject.is_active,
        }
        for subject in subject_records
    ]

    assigned_students = [
        {
            "id": student.id,
            "full_name": student.full_name,
            "email": student.email,
        }
        for student in student_records
    ]

    grades = [
        {
            "id": grade.id,
            "enrollment_id": enrollment.id,
            "student_id": student.id,
            "student_name": student.full_name,
            "subject_id": subject.id,
            "subject_name": subject.name,
            "value": grade.value,
            "notes": grade.notes,
        }
        for grade, enrollment, subject, student in grade_records
    ]

    return {
        "total_students": students,
        "total_subjects": subjects,
        "pending_grades": pending_grades,
        "assigned_subjects": assigned_subjects,
        "assigned_students": assigned_students,
        "grades": grades,
    }
