"""Asegura secuencia/default en subjects.id (PostgreSQL).

Si la tabla se creó sin SERIAL/IDENTITY, los INSERT dejan id NULL y fallan.

Revision ID: c012e4a1b2c3
Revises: b011e133368f
Create Date: 2026-04-09

"""
from typing import Sequence, Union

from alembic import op

revision: str = "c012e4a1b2c3"
down_revision: Union[str, None] = "b011e133368f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    conn = op.get_bind()
    if conn.dialect.name != "postgresql":
        return
    op.execute(
        """
        DO $fix$
        DECLARE
          max_id bigint;
        BEGIN
          IF pg_get_serial_sequence('public.subjects', 'id') IS NOT NULL THEN
            RETURN;
          END IF;
          CREATE SEQUENCE IF NOT EXISTS subjects_id_seq;
          ALTER TABLE public.subjects
            ALTER COLUMN id SET DEFAULT nextval('subjects_id_seq');
          SELECT COALESCE(MAX(id), 0) INTO max_id FROM public.subjects;
          IF max_id = 0 THEN
            PERFORM setval('subjects_id_seq', 1, false);
          ELSE
            PERFORM setval('subjects_id_seq', max_id);
          END IF;
          ALTER SEQUENCE subjects_id_seq OWNED BY public.subjects.id;
        END
        $fix$;
        """
    )
    op.execute(
        """
        DO $fix_tasks$
        DECLARE
          max_id bigint;
        BEGIN
          IF NOT EXISTS (
            SELECT 1 FROM information_schema.tables
            WHERE table_schema = 'public' AND table_name = 'tasks'
          ) THEN
            RETURN;
          END IF;
          IF pg_get_serial_sequence('public.tasks', 'id') IS NOT NULL THEN
            RETURN;
          END IF;
          CREATE SEQUENCE IF NOT EXISTS tasks_id_seq;
          ALTER TABLE public.tasks
            ALTER COLUMN id SET DEFAULT nextval('tasks_id_seq');
          SELECT COALESCE(MAX(id), 0) INTO max_id FROM public.tasks;
          IF max_id = 0 THEN
            PERFORM setval('tasks_id_seq', 1, false);
          ELSE
            PERFORM setval('tasks_id_seq', max_id);
          END IF;
          ALTER SEQUENCE tasks_id_seq OWNED BY public.tasks.id;
        END
        $fix_tasks$;
        """
    )


def downgrade() -> None:
    pass
