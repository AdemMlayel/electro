"""add phone latitude longitude scheduled_date to tickets

Revision ID: add_ticket_fields
Revises: 
Create Date: 2024-01-01 00:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'add_ticket_fields'
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns to tickets table
    op.add_column('tickets', sa.Column('phone', sa.String(length=30), nullable=True))
    op.add_column('tickets', sa.Column('latitude', sa.Float(), nullable=True))
    op.add_column('tickets', sa.Column('longitude', sa.Float(), nullable=True))
    op.add_column('tickets', sa.Column('scheduled_date', sa.DateTime(), nullable=True))


def downgrade() -> None:
    # Remove the columns
    op.drop_column('tickets', 'scheduled_date')
    op.drop_column('tickets', 'longitude')
    op.drop_column('tickets', 'latitude')
    op.drop_column('tickets', 'phone')
