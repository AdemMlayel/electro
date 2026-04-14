"""add is_active column to users

Revision ID: add_user_is_active
Revises: add_ticket_fields
Create Date: 2026-01-18 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_user_is_active'
down_revision: Union[str, None] = 'add_ticket_fields'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add is_active column to users table with default True
    op.add_column('users', sa.Column('is_active', sa.Boolean(), nullable=False, server_default='true'))


def downgrade() -> None:
    # Remove the column
    op.drop_column('users', 'is_active')
