"""create audit logs table

Revision ID: b1c2d3e4f5a6
Revises: 0a7df7b22e4f
Create Date: 2026-09-12 16:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "b1c2d3e4f5a6"
down_revision: Union[str, Sequence[str], None] = "0a7df7b22e4f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("event_type", sa.String(length=100), nullable=False),
        sa.Column("severity", sa.String(length=20), nullable=False),
        sa.Column("risk_score", sa.Integer(), nullable=True),
        sa.Column("message", sa.String(length=1000), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.text("now()"), nullable=False),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"]),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_audit_logs_user_id"), "audit_logs", ["user_id"], unique=False)


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_index(op.f("ix_audit_logs_user_id"), table_name="audit_logs")
    op.drop_table("audit_logs")
