import pytest
from app.users.services import create_user
from app.users.schemas import UserCreate
from app.core.errors import ConflictError

@pytest.mark.integration
class TestCreateUserIntegration:
    def test_create_user_integration(self, db_session):
        """Test user creation with real database."""
        # Arrange
        data = UserCreate(email="integration@example.com", full_name="Integration User", password="password123")

        # Act
        user = create_user(db_session, data)

        # Assert
        assert user.id is not None
        assert user.email == "integration@example.com"
        assert user.full_name == "Integration User"
        assert user.is_active is True

    def test_create_user_duplicate_email_integration(self, db_session, valid_user):
        """Test duplicate email with real database."""
        # Arrange
        data = UserCreate(email=valid_user.email, full_name="Another User", password="password123")

        # Act & Assert
        with pytest.raises(ConflictError):
            create_user(db_session, data)