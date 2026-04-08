import pytest
from unittest.mock import MagicMock
from app.users.services import create_user, get_user, update_user, assign_role, remove_role
from app.users.schemas import UserCreate, UserUpdate
from app.core.errors import ConflictError, NotFoundError


@pytest.mark.unit
class TestCreateUser:
    def test_create_user_success(self, mocker):
        """Test successful user creation."""
        # Arrange
        mock_db = MagicMock()
        mock_db.scalar.return_value = None  # No existing user
        mock_role = MagicMock()
        mock_role.name = "Estudiante"
        mock_db.scalars.return_value = [mock_role]
        mock_user = MagicMock()
        mock_db.add.return_value = None
        mock_db.commit.return_value = None
        mock_db.refresh.return_value = None

        data = UserCreate(email="test@example.com", full_name="Test User", password="password123", role_ids=None)

        # Act
        result = create_user(mock_db, data)

        # Assert
        assert result.email == "test@example.com"
        mock_db.add.assert_called_once()
        mock_db.commit.assert_called_once()

    def test_create_user_email_exists(self, mocker):
        """Test user creation with existing email."""
        # Arrange
        mock_db = MagicMock()
        mock_db.scalar.return_value = MagicMock()  # Existing user

        data = UserCreate(email="test@example.com", full_name="Test User", password="password123")

        # Act & Assert
        with pytest.raises(ConflictError, match="El email ya está registrado."):
            create_user(mock_db, data)

    @pytest.mark.parametrize("password,role_names,expected_min_length", [
        ("validpass", ["Estudiante"], 8),  # 9 chars, should succeed
        ("shortadmin", ["Administrador"], 12),  # 10 chars, should fail
        ("shortdoc", ["Docente"], 12),  # 8 chars, should fail
    ])
    def test_create_user_password_validation(self, mocker, password, role_names, expected_min_length):
        """Test password length validation based on roles."""
        # Arrange
        mock_db = MagicMock()
        mock_db.scalar.return_value = None
        mock_roles = [MagicMock() for name in role_names]
        for mock_role, name in zip(mock_roles, role_names):
            mock_role.name = name
        mock_scalars_result = MagicMock()
        mock_scalars_result.all.return_value = mock_roles
        mock_db.scalars.return_value = mock_scalars_result

        data = UserCreate(email="test@example.com", full_name="Test User", password=password, role_ids=[1])

        # Act & Assert
        if len(password) < expected_min_length:
            with pytest.raises(ConflictError, match=f"La contraseña debe tener al menos {expected_min_length} caracteres."):
                create_user(mock_db, data)
        else:
            mock_db.add.return_value = None
            result = create_user(mock_db, data)
            assert result is not None


@pytest.mark.unit
class TestGetUser:
    """Pruebas de get_user: éxito y usuario no encontrado."""

    def test_get_user_success(self):
        """Usuario existe."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.id = 1
        mock_user.email = "user@test.com"
        mock_db.get.return_value = mock_user
        result = get_user(mock_db, 1)
        assert result is mock_user
        assert mock_db.get.call_count == 1

    def test_get_user_not_found_raises_not_found(self):
        """Usuario no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_db.get.return_value = None
        with pytest.raises(NotFoundError, match="Usuario no encontrado"):
            get_user(mock_db, 999)


@pytest.mark.unit
class TestUpdateUser:
    """Pruebas de update_user: excepciones (rol no encontrado, contraseña corta)."""

    def test_update_user_role_not_found_raises_not_found(self):
        """Actualizar con role_ids que no existen → NotFoundError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.roles = [MagicMock(name="Estudiante")]
        mock_user.roles[0].name = "Estudiante"
        mock_db.get.return_value = mock_user
        mock_scalars_result = MagicMock()
        mock_scalars_result.all.return_value = []
        mock_db.scalars.return_value = mock_scalars_result
        data = UserUpdate(role_ids=[999])
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            update_user(mock_db, 1, data)

    def test_update_user_password_too_short_for_admin_raises_conflict(self):
        """Actualizar contraseña de admin con menos de 12 caracteres → ConflictError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_role = MagicMock()
        mock_role.name = "Administrador"
        mock_user.roles = [mock_role]
        mock_db.get.return_value = mock_user
        data = UserUpdate(password="only9chars")
        with pytest.raises(ConflictError, match="al menos 12 caracteres"):
            update_user(mock_db, 1, data)


@pytest.mark.unit
class TestAssignRole:
    """Pruebas de assign_role: rol no encontrado."""

    def test_assign_role_role_not_found_raises_not_found(self):
        """Rol no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.roles = []
        mock_db.get.side_effect = [mock_user, None]
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            assign_role(mock_db, 1, 999)


@pytest.mark.unit
class TestRemoveRole:
    """Pruebas de remove_role: rol no encontrado."""

    def test_remove_role_role_not_found_raises_not_found(self):
        """Rol no existe → NotFoundError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.roles = []
        mock_db.get.side_effect = [mock_user, None]
        with pytest.raises(NotFoundError, match="Rol no encontrado"):
            remove_role(mock_db, 1, 999)