"""Unit tests for roles.services — valores límite, inválidos y excepciones."""
import pytest
from unittest.mock import MagicMock

from app.roles.services import create_role, get_role, update_role
from app.roles.schemas import RoleCreate, RoleUpdate
from app.core.errors import ConflictError, NotFoundError


@pytest.mark.unit
class TestCreateRole:
    """Pruebas de create_role: éxito, duplicado, excepciones."""

    def test_create_role_success(self):
        """Crear rol con nombre nuevo."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = None
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None
        data = RoleCreate(name="NuevoRol", description="Desc")

        result = create_role(mock_db, data)

        assert result.name == "NuevoRol"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_role_duplicate_name_raises_conflict(self):
        """Nombre de rol ya existe → ConflictError."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = MagicMock()
        data = RoleCreate(name="Existente", description=None)
        with pytest.raises(ConflictError, match="El nombre del rol ya existe"):
            create_role(mock_db, data)


@pytest.mark.unit
class TestGetRole:
    """Pruebas de get_role: encontrado y no encontrado."""

    def test_get_role_success(self):
        """Rol existe."""
        mock_db = MagicMock()
        mock_role = MagicMock()
        mock_role.id = 1
        mock_role.name = "Estudiante"
        mock_db.get.return_value = mock_role

        result = get_role(mock_db, 1)
        assert result is mock_role
        assert mock_db.get.call_count == 1

    def test_get_role_not_found_raises_not_found(self):
        """Rol no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            get_role(mock_db, 999)


@pytest.mark.unit
class TestUpdateRole:
    """Pruebas de update_role: éxito, nombre duplicado, excepciones."""

    def test_update_role_duplicate_name_raises_conflict(self):
        """Actualizar a un nombre que ya existe → ConflictError."""
        mock_db = MagicMock()
        mock_role = MagicMock()
        mock_role.name = "Actual"
        mock_db.get.return_value = mock_role
        mock_db.scalar.return_value = MagicMock()
        data = RoleUpdate(name="Existente", description=None)
        with pytest.raises(ConflictError, match="El nombre del rol ya existe"):
            update_role(mock_db, 1, data)

    def test_update_role_not_found_raises_not_found(self):
        """Actualizar rol inexistente → NotFoundError (vía get_role)."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        data = RoleUpdate(name="Nuevo", description="Desc")
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            update_role(mock_db, 999, data)
