import factory
from faker import Faker
from app.users.models import User
from app.core.security import hash_password

fake = Faker()

class UserFactory(factory.Factory):
    class Meta:
        model = User

    email = factory.LazyAttribute(lambda _: fake.email())
    full_name = factory.LazyAttribute(lambda _: fake.name())
    hashed_password = factory.LazyFunction(lambda: hash_password("password123"))
    is_active = True