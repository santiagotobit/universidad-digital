import factory
from decimal import Decimal
from app.grades.models import Grade

class GradeFactory(factory.Factory):
    class Meta:
        model = Grade

    enrollment = factory.SubFactory("tests.factories.enrollment_factory.EnrollmentFactory")
    value = factory.LazyAttribute(lambda _: Decimal("75.00"))
    notes = None
