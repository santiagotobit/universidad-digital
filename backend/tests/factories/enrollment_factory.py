import factory
from app.enrollments.models import Enrollment
from .user_factory import UserFactory
from .subject_factory import SubjectFactory
from .period_factory import AcademicPeriodFactory

class EnrollmentFactory(factory.Factory):
    class Meta:
        model = Enrollment

    user = factory.SubFactory(UserFactory)
    subject = factory.SubFactory(SubjectFactory)
    period = factory.SubFactory(AcademicPeriodFactory)
    is_active = True