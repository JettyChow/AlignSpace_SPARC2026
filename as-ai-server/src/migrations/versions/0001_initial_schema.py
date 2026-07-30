"""initial schema

Revision ID: 0001
Revises:
Create Date: 2026-07-29

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "0001"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "firms",
        sa.Column("firm_id", sa.Integer(), primary_key=True),
        sa.Column("firm_name", sa.String(), nullable=False),
        sa.Column("firm_createdAt", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("firm_updatedAt", sa.DateTime()),
    )

    op.create_table(
        "users",
        sa.Column("user_id", sa.Integer(), primary_key=True),
        sa.Column("user_firstName", sa.String()),
        sa.Column("user_lastName", sa.String()),
        sa.Column("user_email", sa.String(), nullable=False, unique=True),
        sa.Column("user_createdAt", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("user_updatedAt", sa.DateTime()),
    )

    op.create_table(
        "firm_users",
        sa.Column("firmUser_id", sa.Integer(), primary_key=True),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firms.firm_id"), nullable=False),
        sa.Column("user_id", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=False),
        sa.Column("firmUser_role", sa.String(), nullable=False),
        sa.Column("firmUser_joinedAt", sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint("firm_id", "user_id"),
    )

    op.create_table(
        "room_types",
        sa.Column("roomType_id", sa.Integer(), primary_key=True),
        sa.Column("roomType_name", sa.String(), nullable=False, unique=True),
        sa.Column("roomType_description", sa.Text()),
    )

    op.create_table(
        "budgets",
        sa.Column("bud_id", sa.Integer(), primary_key=True),
        sa.Column("roomType_id", sa.Integer(), sa.ForeignKey("room_types.roomType_id")),
        sa.Column("bud_label", sa.String(), nullable=False),
        sa.Column("bud_minAmount", sa.Numeric(12, 2), nullable=False),
        sa.Column("bud_maxAmount", sa.Numeric(12, 2), nullable=False),
        sa.Column("bud_description", sa.Text()),
        sa.UniqueConstraint("roomType_id", "bud_label"),
    )

    op.create_table(
        "styles",
        sa.Column("sty_id", sa.Integer(), primary_key=True),
        sa.Column("sty_name", sa.String(), nullable=False, unique=True),
        sa.Column("sty_description", sa.Text()),
    )

    op.create_table(
        "projects",
        sa.Column("proj_id", sa.Integer(), primary_key=True),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firms.firm_id"), nullable=False),
        sa.Column("user_id_client", sa.Integer(), sa.ForeignKey("users.user_id"), nullable=False),
        sa.Column("user_id_assignedDesigner", sa.Integer(), sa.ForeignKey("users.user_id")),
        sa.Column("bud_id", sa.Integer(), sa.ForeignKey("budgets.bud_id")),
        sa.Column("proj_budgetMinOverride", sa.Numeric(12, 2)),
        sa.Column("proj_budgetMaxOverride", sa.Numeric(12, 2)),
        sa.Column("proj_budgetNotes", sa.Text()),
        sa.Column("proj_title", sa.String(), nullable=False),
        sa.Column("proj_status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("proj_timeline", sa.String()),
        sa.Column("proj_scope", sa.String()),
        sa.Column("proj_goal", sa.Text()),
        sa.Column("proj_matchPercent", sa.Float(), nullable=False, server_default="0"),
        sa.Column("proj_completionPercent", sa.Float(), nullable=False, server_default="0"),
        sa.Column("proj_createdAt", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("proj_updatedAt", sa.DateTime()),
    )

    op.create_table(
        "project_styles",
        sa.Column("projSty_id", sa.Integer(), primary_key=True),
        sa.Column("proj_id", sa.Integer(), sa.ForeignKey("projects.proj_id"), nullable=False),
        sa.Column("sty_id", sa.Integer(), sa.ForeignKey("styles.sty_id"), nullable=False),
        sa.UniqueConstraint("proj_id", "sty_id"),
    )

    op.create_table(
        "presets",
        sa.Column("preset_id", sa.Integer(), primary_key=True),
        sa.Column("firm_id", sa.Integer(), sa.ForeignKey("firms.firm_id"), nullable=False),
        sa.Column("roomType_id", sa.Integer(), sa.ForeignKey("room_types.roomType_id"), nullable=False),
        sa.Column("bud_id", sa.Integer(), sa.ForeignKey("budgets.bud_id"), nullable=False),
        sa.Column("preset_name", sa.String(), nullable=False),
        sa.Column("preset_description", sa.Text()),
        sa.Column("preset_estimatedTotal", sa.Numeric(12, 2)),
        sa.Column("preset_status", sa.String(), nullable=False, server_default="draft"),
        sa.Column("preset_createdAt", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("preset_updatedAt", sa.DateTime()),
    )

    op.create_table(
        "preset_styles",
        sa.Column("presetSty_id", sa.Integer(), primary_key=True),
        sa.Column("preset_id", sa.Integer(), sa.ForeignKey("presets.preset_id"), nullable=False),
        sa.Column("sty_id", sa.Integer(), sa.ForeignKey("styles.sty_id"), nullable=False),
        sa.UniqueConstraint("preset_id", "sty_id"),
    )

    op.create_table(
        "rooms",
        sa.Column("room_id", sa.Integer(), primary_key=True),
        sa.Column("proj_id", sa.Integer(), sa.ForeignKey("projects.proj_id"), nullable=False),
        sa.Column("roomType_id", sa.Integer(), sa.ForeignKey("room_types.roomType_id"), nullable=False),
        sa.Column("preset_id", sa.Integer(), sa.ForeignKey("presets.preset_id")),
        sa.Column("room_name", sa.String()),
        sa.Column("room_notes", sa.Text()),
        sa.Column("room_budgetMinOverride", sa.Numeric(12, 2)),
        sa.Column("room_budgetMaxOverride", sa.Numeric(12, 2)),
    )

    op.create_table(
        "messages",
        sa.Column("mess_id", sa.Integer(), primary_key=True),
        sa.Column("proj_id", sa.Integer(), sa.ForeignKey("projects.proj_id"), nullable=False),
        sa.Column("user_id_sender", sa.Integer(), sa.ForeignKey("users.user_id")),
        sa.Column("mess_senderType", sa.String(), nullable=False),
        sa.Column("mess_messageType", sa.String(), nullable=False, server_default="text"),
        sa.Column("mess_body", sa.Text()),
        sa.Column("mess_metadata", sa.JSON()),
        sa.Column("mess_createdAt", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "images",
        sa.Column("img_id", sa.Integer(), primary_key=True),
        sa.Column("roomType_id", sa.Integer(), sa.ForeignKey("room_types.roomType_id"), nullable=False),
        sa.Column("img_filename", sa.String()),
        sa.Column("img_url", sa.String()),
        sa.Column("img_title", sa.String()),
        sa.Column("img_description", sa.Text()),
        sa.Column("img_createdAt", sa.DateTime(), server_default=sa.func.now()),
    )

    op.create_table(
        "images_styles",
        sa.Column("imgSty_id", sa.Integer(), primary_key=True),
        sa.Column("img_id", sa.Integer(), sa.ForeignKey("images.img_id"), nullable=False),
        sa.Column("sty_id", sa.Integer(), sa.ForeignKey("styles.sty_id"), nullable=False),
        sa.UniqueConstraint("img_id", "sty_id"),
    )

    op.create_table(
        "rooms_images",
        sa.Column("roomImg_id", sa.Integer(), primary_key=True),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.room_id"), nullable=False),
        sa.Column("img_id", sa.Integer(), sa.ForeignKey("images.img_id"), nullable=False),
        sa.Column("roomImg_rank", sa.Integer()),
        sa.Column("roomImg_selected", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.Column("roomImg_reason", sa.Text()),
        sa.Column("roomImg_createdAt", sa.DateTime(), server_default=sa.func.now()),
        sa.UniqueConstraint("room_id", "img_id"),
    )

    op.create_table(
        "materials",
        sa.Column("mat_id", sa.Integer(), primary_key=True),
        sa.Column("mat_name", sa.String()),
        sa.Column("mat_category", sa.String()),
        sa.Column("mat_type", sa.String()),
        sa.Column("mat_color", sa.String()),
        sa.Column("mat_finish", sa.String()),
    )

    op.create_table(
        "items",
        sa.Column("item_id", sa.Integer(), primary_key=True),
        sa.Column("item_name", sa.String(), nullable=False),
        sa.Column("item_brand", sa.String()),
        sa.Column("item_category", sa.String()),
        sa.Column("item_model", sa.String()),
        sa.Column("item_cost", sa.Numeric(12, 2)),
    )

    op.create_table(
        "items_materials",
        sa.Column("itemMat_id", sa.Integer(), primary_key=True),
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("items.item_id"), nullable=False),
        sa.Column("mat_id", sa.Integer(), sa.ForeignKey("materials.mat_id"), nullable=False),
        sa.Column("itemMat_isPrimary", sa.Boolean(), nullable=False, server_default=sa.false()),
        sa.UniqueConstraint("item_id", "mat_id"),
    )

    op.create_table(
        "preset_items",
        sa.Column("presetItem_id", sa.Integer(), primary_key=True),
        sa.Column("preset_id", sa.Integer(), sa.ForeignKey("presets.preset_id"), nullable=False),
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("items.item_id"), nullable=False),
        sa.Column("presetItem_quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("presetItem_unitCost", sa.Numeric(12, 2)),
        sa.Column("presetItem_notes", sa.Text()),
        sa.Column("presetItem_isRequired", sa.Boolean(), nullable=False, server_default=sa.true()),
        sa.Column("presetItem_rank", sa.Integer()),
        sa.UniqueConstraint("preset_id", "item_id"),
    )

    op.create_table(
        "project_items",
        sa.Column("projItem_id", sa.Integer(), primary_key=True),
        sa.Column("proj_id", sa.Integer(), sa.ForeignKey("projects.proj_id"), nullable=False),
        sa.Column("room_id", sa.Integer(), sa.ForeignKey("rooms.room_id")),
        sa.Column("item_id", sa.Integer(), sa.ForeignKey("items.item_id"), nullable=False),
        sa.Column("presetItem_id", sa.Integer(), sa.ForeignKey("preset_items.presetItem_id")),
        sa.Column("projItem_quantity", sa.Integer(), nullable=False, server_default="1"),
        sa.Column("projItem_unitCost", sa.Numeric(12, 2)),
        sa.Column("projItem_notes", sa.Text()),
        sa.Column("projItem_source", sa.String()),
        sa.Column("projItem_status", sa.String(), nullable=False, server_default="pending"),
        sa.Column("projItem_confidenceScore", sa.Float()),
        sa.Column("projItem_createdAt", sa.DateTime(), server_default=sa.func.now()),
        sa.Column("projItem_updatedAt", sa.DateTime()),
    )

    op.create_table(
        "item_alternatives",
        sa.Column("alt_id", sa.Integer(), primary_key=True),
        sa.Column("projItem_id", sa.Integer(), sa.ForeignKey("project_items.projItem_id"), nullable=False),
        sa.Column("alternative_item_id", sa.Integer(), sa.ForeignKey("items.item_id"), nullable=False),
        sa.Column("alt_reason", sa.Text()),
        sa.Column("alt_rank", sa.Integer()),
        sa.UniqueConstraint("projItem_id", "alternative_item_id"),
    )


def downgrade() -> None:
    op.drop_table("item_alternatives")
    op.drop_table("project_items")
    op.drop_table("preset_items")
    op.drop_table("items_materials")
    op.drop_table("items")
    op.drop_table("materials")
    op.drop_table("rooms_images")
    op.drop_table("images_styles")
    op.drop_table("images")
    op.drop_table("messages")
    op.drop_table("rooms")
    op.drop_table("preset_styles")
    op.drop_table("presets")
    op.drop_table("project_styles")
    op.drop_table("projects")
    op.drop_table("styles")
    op.drop_table("budgets")
    op.drop_table("room_types")
    op.drop_table("firm_users")
    op.drop_table("users")
    op.drop_table("firms")
