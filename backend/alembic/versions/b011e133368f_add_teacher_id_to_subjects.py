"""add teacher_id to subjects

Revision ID: b011e133368f
Revises:
Create Date: 2024-01-01 12:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b011e133368f'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add teacher_id column to subjects table
    op.add_column('subjects', sa.Column('teacher_id', sa.Integer(), nullable=True))
    op.create_index(op.f('ix_subjects_teacher_id'), 'subjects', ['teacher_id'], unique=False)
    op.create_foreign_key(None, 'subjects', 'users', ['teacher_id'], ['id'])


def downgrade() -> None:
    # Remove teacher_id column from subjects table
    op.drop_constraint(None, 'subjects', type_='foreignkey')
    op.drop_index(op.f('ix_subjects_teacher_id'), table_name='subjects')
    op.drop_column('subjects', 'teacher_id')