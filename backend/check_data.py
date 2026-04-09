import sys
import os
sys.path.append(os.path.dirname(__file__))

from app.core.database import SessionLocal
from app.users.models import User
from app.roles.models import Role, UserRole
from app.periods.models import AcademicPeriod
from app.enrollments.models import Enrollment
from app.grades.models import Grade
from app.subjects.models import Subject

db = SessionLocal()
student = db.query(User).filter(User.email == 'estudiante@ud.edu').first()
if student:
    print(f'Estudiante encontrado: {student.id} - {student.email}')

    enrollments = db.query(Enrollment).filter(Enrollment.user_id == student.id).all()
    print(f'Inscripciones: {len(enrollments)}')
    for e in enrollments:
        subject = db.query(Subject).filter(Subject.id == e.subject_id).first()
        print(f'  - Asignatura: {subject.name if subject else "N/A"}')

    grades = db.query(Grade).join(Enrollment, Grade.enrollment_id == Enrollment.id).filter(Enrollment.user_id == student.id).all()
    print(f'Calificaciones: {len(grades)}')
    for g in grades:
        enrollment = db.query(Enrollment).filter(Enrollment.id == g.enrollment_id).first()
        subject = db.query(Subject).filter(Subject.id == enrollment.subject_id).first() if enrollment else None
        print(f'  - Asignatura: {subject.name if subject else "N/A"}, Nota: {g.value}')
else:
    print('Estudiante no encontrado')

db.close()