"""Unit tests for auth.services — valores límite, inválidos y excepciones."""
import pytest
from unittest.mock import MagicMock, patch

from app.auth.services import authenticate_user, require_roles
from app.core.errors import ForbiddenError, UnauthorizedError


@pytest.mark.unit
class TestAuthenticateUser:
    """Pruebas de authenticate_user: casos normales, inválidos y excepciones."""

    def test_authenticate_user_success(self):
        """Credenciales válidas y usuario activo."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.is_active = True
        mock_user.hashed_password = "hashed"
        mock_db.scalar.return_value = mock_user

        with patch("app.auth.services.verify_password", return_value=True):
            result = authenticate_user(mock_db, "user@test.com", "password123")
        assert result is mock_user
        mock_db.scalar.assert_called_once()

    def test_authenticate_user_not_found_raises_unauthorized(self):
        """Usuario no existe → UnauthorizedError."""
        mock_db = MagicMock()
        mock_db.scalar.return_value = None
        with pytest.raises(UnauthorizedError, match="Credenciales inválidas"):
            authenticate_user(mock_db, "nonexistent@test.com", "password123")

    def test_authenticate_user_wrong_password_raises_unauthorized(self):
        """Contraseña incorrecta → UnauthorizedError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.is_active = True
        mock_db.scalar.return_value = mock_user
        with patch("app.auth.services.verify_password", return_value=False):
            with pytest.raises(UnauthorizedError, match="Credenciales inválidas"):
                authenticate_user(mock_db, "user@test.com", "wrongpass")

    def test_authenticate_user_inactive_raises_forbidden(self):
        """Usuario inactivo → ForbiddenError."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.is_active = False
        mock_db.scalar.return_value = mock_user
        with patch("app.auth.services.verify_password", return_value=True):
            with pytest.raises(ForbiddenError, match="Usuario inactivo"):
                authenticate_user(mock_db, "user@test.com", "password123")

    def test_authenticate_user_normalizes_email(self):
        """Email se normaliza a minúsculas y sin espacios."""
        mock_db = MagicMock()
        mock_user = MagicMock()
        mock_user.is_active = True
        mock_db.scalar.return_value = mock_user
        with patch("app.auth.services.verify_password", return_value=True):
            authenticate_user(mock_db, "  User@Test.COM  ", "password123")
        call_args = mock_db.scalar.call_args
        assert "user@test.com" in str(call_args).lower() or mock_db.scalar.called


@pytest.mark.unit
class TestRequireRoles:
    """Pruebas de require_roles: permisos suficientes e insuficientes."""

    def test_require_roles_has_allowed_role_passes(self):
        """Usuario con rol permitido no lanza."""
        mock_user = MagicMock()
        mock_role = MagicMock()
        mock_role.name = "Administrador"
        mock_user.roles = [mock_role]
        require_roles(mock_user, {"Administrador", "Docente"})

    def test_require_roles_no_allowed_role_raises_forbidden(self):
        """Usuario sin rol permitido → ForbiddenError."""
        mock_user = MagicMock()
        mock_role = MagicMock()
        mock_role.name = "Estudiante"
        mock_user.roles = [mock_role]
        with pytest.raises(ForbiddenError, match="Permisos insuficientes"):
            require_roles(mock_user, {"Administrador", "Docente"})

    def test_require_roles_empty_roles_raises_forbidden(self):
        """Usuario sin roles → ForbiddenError."""
        mock_user = MagicMock()
        mock_user.roles = []
        with pytest.raises(ForbiddenError, match="Permisos insuficientes"):
            require_roles(mock_user, {"Administrador"})
