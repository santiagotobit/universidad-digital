from __future__ import annotations

import sys
from logging.config import fileConfig

from alembic import context

sys.path.append(".")

from app.core.config import settings  # noqa: E402
from app.core.database import Base  # noqa: E402
from app.auth import models as _auth  # noqa: F401, E402
from app.enrollments import models as _enrollments  # noqa: F401, E402
from app.grades import models as _grades  # noqa: F401, E402
from app.periods import models as _periods  # noqa: F401, E402
from app.roles import models as _roles  # noqa: F401, E402
from app.subjects import models as _subjects  # noqa: F401, E402
from app.users import models as _users  # noqa: F401, E402

config = context.config
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

config.set_main_option("sqlalchemy.url", settings.database_url)

target_metadata = Base.metadata


def run_migrations_offline() -> None:
    context.configure(
        url=settings.database_url,
        target_metadata=target_metadata,
        literal_binds=True,
        dialect_opts={"paramstyle": "named"},
    )
    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    connectable = context.config.attributes.get("connection", None)
    if connectable is None:
        from sqlalchemy import create_engine

        connectable = create_engine(settings.database_url, pool_pre_ping=True)

    with connectable.connect() as connection:
        context.configure(connection=connection, target_metadata=target_metadata)
        with context.begin_transaction():
            context.run_migrations()


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
