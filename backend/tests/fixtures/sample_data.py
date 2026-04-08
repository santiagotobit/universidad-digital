import pytest
from tests.factories import UserFactory, SubjectFactory, EnrollmentFactory, AcademicPeriodFactory

@pytest.fixture
def valid_user(db_session):
    """A valid user fixture."""
    user = UserFactory()
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def invalid_user():
    """An invalid user fixture (e.g., missing email)."""
    return {"full_name": "Test User", "hashed_password": "hashed"}

@pytest.fixture
def sample_subject(db_session):
    """A sample subject fixture."""
    subject = SubjectFactory()
    db_session.add(subject)
    db_session.commit()
    db_session.refresh(subject)
    return subject

@pytest.fixture
def sample_period(db_session):
    """A sample academic period fixture."""
    period = AcademicPeriodFactory()
    db_session.add(period)
    db_session.commit()
    db_session.refresh(period)
    return period

@pytest.fixture
def sample_enrollment(db_session, valid_user, sample_subject, sample_period):
    """A sample enrollment fixture."""
    enrollment = EnrollmentFactory(user=valid_user, subject=sample_subject, period=sample_period)
    db_session.add(enrollment)
    db_session.commit()
    db_session.refresh(enrollment)
    return enrollment