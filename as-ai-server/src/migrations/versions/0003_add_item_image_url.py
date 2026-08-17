"""add items.item_imageUrl column

Revision ID: 0003
Revises: 0002
Create Date: 2026-08-12

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column("items", sa.Column("item_imageUrl", sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column("items", "item_imageUrl")
