import factory
from faker import Faker
from app.subjects.models import Subject

fake = Faker()

class SubjectFactory(factory.Factory):
    class Meta:
        model = Subject

    code = factory.LazyAttribute(lambda _: fake.unique.bothify(text='???###').upper())
    name = factory.LazyAttribute(lambda _: fake.sentence(nb_words=3)[:-1])  # Remove trailing dot
    credits = factory.LazyAttribute(lambda _: fake.random_int(min=1, max=6))
    teacher_id = None  # Opcional: puede ser asignado al crear
    is_active = True