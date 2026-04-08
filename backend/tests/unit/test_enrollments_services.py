"""Unit tests for enrollments.services — valores inválidos y excepciones."""
import pytest
from unittest.mock import MagicMock

from app.enrollments.services import create_enrollment, get_enrollment
from app.enrollments.schemas import EnrollmentCreate
from app.core.errors import ConflictError, NotFoundError


def _mock_user(user_id: int, role_names: list[str]):
    user = MagicMock()
    user.id = user_id
    user.roles = [MagicMock(name=n) for n in role_names]
    for r, n in zip(user.roles, role_names):
        r.name = n
    return user


@pytest.mark.unit
class TestCreateEnrollment:
    """Pruebas de create_enrollment: éxito, usuario no encontrado, materia inactiva, duplicado."""

    def test_create_enrollment_success_as_admin(self):
        """Admin crea inscripción para otro usuario."""
        mock_db = MagicMock()
        mock_db.get.side_effect = [
            MagicMock(is_active=True),
            MagicMock(is_active=True),
            MagicMock(is_active=True),
        ]
        mock_db.scalar.return_value = None
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None
        actor = _mock_user(1, ["Administrador"])
        data = EnrollmentCreate(user_id=2, subject_id=1, period_id=1)

        result = create_enrollment(mock_db, data, actor)

        assert result.user_id == 2
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_enrollment_user_not_found_raises_not_found(self):
        """Usuario no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        actor = _mock_user(1, ["Administrador"])
        data = EnrollmentCreate(user_id=999, subject_id=1, period_id=1)
        with pytest.raises(NotFoundError, match="Usuario no encontrado"):
            create_enrollment(mock_db, data, actor)

    def test_create_enrollment_user_inactive_raises_conflict(self):
        """Usuario inactivo → ConflictError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.is_active = False
        mock_db.get.return_value = mock_user
        actor = _mock_user(1, ["Administrador"])
        data = EnrollmentCreate(user_id=2, subject_id=1, period_id=1)
        with pytest.raises(ConflictError, match="Usuario inactivo"):
            create_enrollment(mock_db, data, actor)

    def test_create_enrollment_subject_not_found_raises_not_found(self):
        """Materia no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.side_effect = [MagicMock(is_active=True), None]
        actor = _mock_user(1, ["Administrador"])
        data = EnrollmentCreate(user_id=2, subject_id=999, period_id=1)
        with pytest.raises(NotFoundError, match="Materia no encontrada"):
            create_enrollment(mock_db, data, actor)

    def test_create_enrollment_duplicate_raises_conflict(self):
        """Inscripción ya existe (mismo user, subject, period) → ConflictError."""
        mock_db = MagicMock()
        mock_db.get.side_effect = [
            MagicMock(is_active=True),
            MagicMock(is_active=True),
            MagicMock(is_active=True),
        ]
        mock_db.scalar.return_value = MagicMock()
        actor = _mock_user(1, ["Administrador"])
        data = EnrollmentCreate(user_id=2, subject_id=1, period_id=1)
        with pytest.raises(ConflictError, match="La inscripción ya existe"):
            create_enrollment(mock_db, data, actor)

    def test_create_enrollment_student_cannot_enroll_other_raises_conflict(self):
        """Estudiante intenta inscribir a otro usuario → ConflictError."""
        mock_db = MagicMock()
        actor = _mock_user(1, ["Estudiante"])
        data = EnrollmentCreate(user_id=2, subject_id=1, period_id=1)
        with pytest.raises(ConflictError, match="Acceso no permitido"):
            create_enrollment(mock_db, data, actor)


@pytest.mark.unit
class TestGetEnrollment:
    """Pruebas de get_enrollment: no encontrado, estudiante sin acceso."""

    def test_get_enrollment_not_found_raises_not_found(self):
        """Inscripción no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        user = _mock_user(1, ["Administrador"])
        with pytest.raises(NotFoundError, match="Inscripción no encontrada"):
            get_enrollment(mock_db, 999, user)

    def test_get_enrollment_student_access_denied_raises_conflict(self):
        """Estudiante pide inscripción de otro → ConflictError."""
        mock_db = MagicMock()
        mock_enrollment = MagicMock()
        mock_enrollment.user_id = 999
        mock_db.get.return_value = mock_enrollment
        user = _mock_user(1, ["Estudiante"])
        with pytest.raises(ConflictError, match="Acceso no permitido"):
            get_enrollment(mock_db, 1, user)
