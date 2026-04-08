"""Unit tests for grades.services — valores límite, inválidos y excepciones."""
from decimal import Decimal

import pytest
from unittest.mock import MagicMock

from app.grades.services import create_grade, get_grade
from app.grades.schemas import GradeCreate
from app.core.errors import ConflictError, NotFoundError


@pytest.mark.unit
class TestCreateGrade:
    """Pruebas de create_grade: éxito, inscripción no encontrada, inscripción inactiva."""

    def test_create_grade_success(self):
        """Registrar calificación con inscripción válida y activa."""
        mock_db = MagicMock()
        mock_enrollment = MagicMock()
        mock_enrollment.is_active = True
        mock_db.get.return_value = mock_enrollment
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None
        data = GradeCreate(enrollment_id=1, value=Decimal("85.50"), notes="Bien")

        result = create_grade(mock_db, data)

        assert result.enrollment_id == 1
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_grade_enrollment_not_found_raises_not_found(self):
        """Inscripción no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        data = GradeCreate(enrollment_id=999, value=Decimal("80"), notes=None)
        with pytest.raises(NotFoundError, match="Inscripción no encontrada"):
            create_grade(mock_db, data)

    def test_create_grade_inactive_enrollment_raises_conflict(self):
        """Inscripción inactiva → ConflictError."""
        mock_db = MagicMock()
        mock_enrollment = MagicMock()
        mock_enrollment.is_active = False
        mock_db.get.return_value = mock_enrollment
        data = GradeCreate(enrollment_id=1, value=Decimal("70"), notes=None)
        with pytest.raises(ConflictError, match="Inscripción inactiva"):
            create_grade(mock_db, data)


@pytest.mark.unit
class TestGetGrade:
    """Pruebas de get_grade: encontrado, no encontrado, estudiante sin acceso."""

    def test_get_grade_success_admin(self):
        """Docente/admin obtiene calificación."""
        mock_db = MagicMock()
        mock_grade = MagicMock()
        mock_grade.id = 1
        mock_user = MagicMock()
        mock_role = MagicMock()
        mock_role.name = "Docente"
        mock_user.roles = [mock_role]
        mock_db.get.return_value = mock_grade

        result = get_grade(mock_db, 1, mock_user)
        assert result is mock_grade

    def test_get_grade_not_found_raises_not_found(self):
        """Calificación no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        mock_user = MagicMock()
        mock_user.roles = []
        with pytest.raises(NotFoundError, match="Calificación no encontrada"):
            get_grade(mock_db, 999, mock_user)

    def test_get_grade_student_access_denied_raises_conflict(self):
        """Estudiante accede a calificación de otro → ConflictError."""
        mock_db = MagicMock()
        mock_grade = MagicMock()
        mock_grade.id = 1
        mock_grade.enrollment_id = 10
        mock_enrollment = MagicMock()
        mock_enrollment.user_id = 999
        mock_db.get.side_effect = [mock_grade, mock_enrollment]
        mock_user = MagicMock()
        mock_user.id = 1
        mock_role = MagicMock()
        mock_role.name = "Estudiante"
        mock_user.roles = [mock_role]

        with pytest.raises(ConflictError, match="Acceso no permitido"):
            get_grade(mock_db, 1, mock_user)
