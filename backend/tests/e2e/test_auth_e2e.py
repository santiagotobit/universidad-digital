import pytest
from app.users.services import create_user
from app.users.schemas import UserCreate

@pytest.mark.e2e
class TestAuthE2E:
    def test_login_flow(self, client, db_session):
        """Test complete login flow."""
        # Arrange: Create a user
        user_data = UserCreate(email="e2e@example.com", full_name="E2E User", password="password123")
        create_user(db_session, user_data)

        # Act: Login
        response = client.post("/auth/login", json={"email": "e2e@example.com", "password": "password123"})

        # Assert
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "Set-Cookie" in response.headers
        assert "access_token" in response.headers.get("Set-Cookie", "")

    def test_login_invalid_credentials(self, client):
        """Test login with invalid credentials."""
        # Act
        response = client.post("/auth/login", json={"email": "invalid@example.com", "password": "wrongpass"})

        # Assert
        assert response.status_code == 401