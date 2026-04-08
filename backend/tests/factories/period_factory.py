import factory
from faker import Faker
from datetime import date, timedelta
from app.periods.models import AcademicPeriod

fake = Faker()

class AcademicPeriodFactory(factory.Factory):
    class Meta:
        model = AcademicPeriod

    code = factory.LazyAttribute(lambda _: fake.unique.bothify(text='????-####').upper())
    name = factory.LazyAttribute(lambda _: f"Periodo {fake.year()}")
    start_date = factory.LazyAttribute(lambda _: fake.date_this_year())
    end_date = factory.LazyAttribute(lambda obj: obj.start_date + timedelta(days=120))
    is_active = True