import os
import tempfile

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.database import Base
from app.core.deps import get_db
from app.core.config import settings

# Load fixtures
pytest_plugins = [
    "tests.fixtures.sample_data",
]

# BD efímera: fichero temporal fuera del proyecto (no test.db en repo, se borra al final)
_test_db_path = os.path.join(tempfile.gettempdir(), f"universidad_digital_test_{os.getpid()}.db")
TEST_DATABASE_URL = f"sqlite:///{_test_db_path}"
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL


@pytest.fixture(scope="session")
def engine():
    """Create a test database engine (ephemeral temp file, removed after run)."""
    test_engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
    )
    Base.metadata.create_all(bind=test_engine)
    yield test_engine
    Base.metadata.drop_all(bind=test_engine)
    try:
        os.remove(_test_db_path)
    except (PermissionError, OSError):
        pass

@pytest.fixture(scope="function")
def db_session(engine):
    """Create a new database session for each test."""
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    session = SessionLocal()
    try:
        yield session
    finally:
        session.rollback()
        session.close()

@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with overridden dependencies."""
    from fastapi.testclient import TestClient
    from app.main import app

    def override_get_db():
        return db_session

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()