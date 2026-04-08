import factory
from faker import Faker
from app.roles.models import Role

fake = Faker()

class RoleFactory(factory.Factory):
    class Meta:
        model = Role

    name = factory.LazyAttribute(lambda _: fake.word())
    description = factory.LazyAttribute(lambda _: fake.sentence())
