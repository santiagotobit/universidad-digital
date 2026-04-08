"""Unit tests for subjects.services — valores límite, inválidos y excepciones."""
import pytest
from unittest.mock import MagicMock

from app.subjects.services import create_subject, get_subject
from app.subjects.schemas import SubjectCreate
from app.core.errors import ConflictError, NotFoundError


@pytest.mark.unit
class TestCreateSubject:
    """Pruebas de create_subject: éxito, código duplicado."""

    def test_create_subject_success(self):
        """Crear materia con código nuevo."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = None
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None
        data = SubjectCreate(code="MAT01", name="Matemáticas", credits=4)

        result = create_subject(mock_db, data)

        assert result.code == "MAT01"
        assert result.name == "Matemáticas"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_subject_duplicate_code_raises_conflict(self):
        """Código de materia ya existe → ConflictError."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = MagicMock()
        data = SubjectCreate(code="MAT01", name="Otra", credits=3)
        with pytest.raises(ConflictError, match="El código de materia ya existe"):
            create_subject(mock_db, data)


@pytest.mark.unit
class TestGetSubject:
    """Pruebas de get_subject: encontrado y no encontrado."""

    def test_get_subject_success(self):
        """Materia existe."""
        mock_db = MagicMock()
        mock_subject = MagicMock()
        mock_subject.id = 1
        mock_subject.code = "MAT01"
        mock_db.get.return_value = mock_subject

        result = get_subject(mock_db, 1)
        assert result is mock_subject
        assert mock_db.get.call_count == 1

    def test_get_subject_not_found_raises_not_found(self):
        """Materia no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        with pytest.raises(NotFoundError, match="Materia no encontrada"):
            get_subject(mock_db, 999)
