"""SQLAlchemy ORM models mirroring the AlignSpace DBML schema.

Tables are created/managed via Alembic migrations (see as-ai-server/alembic),
not by calling Base.metadata.create_all() directly in application code.
"""

from datetime import datetime

from sqlalchemy import (
    JSON,
    Boolean,
    Date,
    DateTime,
    Float,
    ForeignKey,
    Integer,
    Numeric,
    String,
    Text,
    UniqueConstraint,
    func,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


class Firm(Base):
    __tablename__ = "firms"

    firm_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    firm_name: Mapped[str] = mapped_column(String, nullable=False)
    firm_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    firm_updatedAt: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now())


class User(Base):
    __tablename__ = "users"

    user_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    user_firstName: Mapped[str | None] = mapped_column(String)
    user_lastName: Mapped[str | None] = mapped_column(String)
    user_email: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    user_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    user_updatedAt: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now())


class FirmUser(Base):
    __tablename__ = "firm_users"
    __table_args__ = (UniqueConstraint("firm_id", "user_id"),)

    firmUser_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.firm_id"), nullable=False)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    # owner, admin, designer, client
    firmUser_role: Mapped[str] = mapped_column(String, nullable=False)
    firmUser_joinedAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class RoomType(Base):
    __tablename__ = "room_types"

    roomType_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    roomType_name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    roomType_description: Mapped[str | None] = mapped_column(Text)


class Budget(Base):
    __tablename__ = "budgets"
    __table_args__ = (UniqueConstraint("roomType_id", "bud_label"),)

    bud_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    roomType_id: Mapped[int | None] = mapped_column(ForeignKey("room_types.roomType_id"))
    # low, medium, high, luxury
    bud_label: Mapped[str] = mapped_column(String, nullable=False)
    bud_minAmount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    bud_maxAmount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False)
    bud_description: Mapped[str | None] = mapped_column(Text)


class Style(Base):
    __tablename__ = "styles"

    sty_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    sty_name: Mapped[str] = mapped_column(String, nullable=False, unique=True)
    sty_description: Mapped[str | None] = mapped_column(Text)


class Project(Base):
    __tablename__ = "projects"

    proj_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.firm_id"), nullable=False)

    user_id_client: Mapped[int] = mapped_column(ForeignKey("users.user_id"), nullable=False)
    user_id_assignedDesigner: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"))

    bud_id: Mapped[int | None] = mapped_column(ForeignKey("budgets.bud_id"))

    proj_budgetMinOverride: Mapped[float | None] = mapped_column(Numeric(12, 2))
    proj_budgetMaxOverride: Mapped[float | None] = mapped_column(Numeric(12, 2))
    proj_budgetNotes: Mapped[str | None] = mapped_column(Text)

    proj_title: Mapped[str] = mapped_column(String, nullable=False)

    # draft, active, review, completed
    proj_status: Mapped[str] = mapped_column(String, nullable=False, default="draft")

    proj_timeline: Mapped[str | None] = mapped_column(String)
    proj_scope: Mapped[str | None] = mapped_column(String)
    proj_goal: Mapped[str | None] = mapped_column(Text)

    proj_matchPercent: Mapped[float] = mapped_column(Float, nullable=False, default=0)
    proj_completionPercent: Mapped[float] = mapped_column(Float, nullable=False, default=0)

    proj_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    proj_updatedAt: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now())


class ProjectStyle(Base):
    __tablename__ = "project_styles"
    __table_args__ = (UniqueConstraint("proj_id", "sty_id"),)

    projSty_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    proj_id: Mapped[int] = mapped_column(ForeignKey("projects.proj_id"), nullable=False)
    sty_id: Mapped[int] = mapped_column(ForeignKey("styles.sty_id"), nullable=False)


class Preset(Base):
    __tablename__ = "presets"

    preset_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    firm_id: Mapped[int] = mapped_column(ForeignKey("firms.firm_id"), nullable=False)

    roomType_id: Mapped[int] = mapped_column(ForeignKey("room_types.roomType_id"), nullable=False)
    bud_id: Mapped[int] = mapped_column(ForeignKey("budgets.bud_id"), nullable=False)

    preset_name: Mapped[str] = mapped_column(String, nullable=False)
    preset_description: Mapped[str | None] = mapped_column(Text)

    preset_estimatedTotal: Mapped[float | None] = mapped_column(Numeric(12, 2))

    # draft, active, archived
    preset_status: Mapped[str] = mapped_column(String, nullable=False, default="draft")

    preset_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    preset_updatedAt: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now())


class PresetStyle(Base):
    __tablename__ = "preset_styles"
    __table_args__ = (UniqueConstraint("preset_id", "sty_id"),)

    presetSty_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    preset_id: Mapped[int] = mapped_column(ForeignKey("presets.preset_id"), nullable=False)
    sty_id: Mapped[int] = mapped_column(ForeignKey("styles.sty_id"), nullable=False)


class Room(Base):
    __tablename__ = "rooms"

    room_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    proj_id: Mapped[int] = mapped_column(ForeignKey("projects.proj_id"), nullable=False)
    roomType_id: Mapped[int] = mapped_column(ForeignKey("room_types.roomType_id"), nullable=False)
    preset_id: Mapped[int | None] = mapped_column(ForeignKey("presets.preset_id"))

    room_name: Mapped[str | None] = mapped_column(String)
    room_notes: Mapped[str | None] = mapped_column(Text)

    room_budgetMinOverride: Mapped[float | None] = mapped_column(Numeric(12, 2))
    room_budgetMaxOverride: Mapped[float | None] = mapped_column(Numeric(12, 2))


class Message(Base):
    __tablename__ = "messages"

    mess_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    proj_id: Mapped[int] = mapped_column(ForeignKey("projects.proj_id"), nullable=False)
    user_id_sender: Mapped[int | None] = mapped_column(ForeignKey("users.user_id"))

    # client, chatbot, designer, system
    mess_senderType: Mapped[str] = mapped_column(String, nullable=False)
    # text, system, recommendation
    mess_messageType: Mapped[str] = mapped_column(String, nullable=False, default="text")

    mess_body: Mapped[str | None] = mapped_column(Text)
    mess_metadata: Mapped[dict | None] = mapped_column(JSON)

    mess_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class Image(Base):
    __tablename__ = "images"

    img_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    roomType_id: Mapped[int] = mapped_column(ForeignKey("room_types.roomType_id"), nullable=False)

    img_filename: Mapped[str | None] = mapped_column(String)
    img_url: Mapped[str | None] = mapped_column(String)
    img_title: Mapped[str | None] = mapped_column(String)
    img_description: Mapped[str | None] = mapped_column(Text)

    img_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class ImageStyle(Base):
    __tablename__ = "images_styles"
    __table_args__ = (UniqueConstraint("img_id", "sty_id"),)

    imgSty_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    img_id: Mapped[int] = mapped_column(ForeignKey("images.img_id"), nullable=False)
    sty_id: Mapped[int] = mapped_column(ForeignKey("styles.sty_id"), nullable=False)


class RoomImage(Base):
    __tablename__ = "rooms_images"
    __table_args__ = (UniqueConstraint("room_id", "img_id"),)

    roomImg_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    room_id: Mapped[int] = mapped_column(ForeignKey("rooms.room_id"), nullable=False)
    img_id: Mapped[int] = mapped_column(ForeignKey("images.img_id"), nullable=False)

    roomImg_rank: Mapped[int | None] = mapped_column(Integer)
    roomImg_selected: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    roomImg_reason: Mapped[str | None] = mapped_column(Text)

    roomImg_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())


class Material(Base):
    __tablename__ = "materials"

    mat_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    mat_name: Mapped[str | None] = mapped_column(String)
    # wood, stone, metal, fabric
    mat_category: Mapped[str | None] = mapped_column(String)
    # oak, marble, brass
    mat_type: Mapped[str | None] = mapped_column(String)
    mat_color: Mapped[str | None] = mapped_column(String)
    mat_finish: Mapped[str | None] = mapped_column(String)


class Item(Base):
    __tablename__ = "items"

    item_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    item_name: Mapped[str] = mapped_column(String, nullable=False)
    item_brand: Mapped[str | None] = mapped_column(String)
    # sink, sofa, tile, light fixture
    item_category: Mapped[str | None] = mapped_column(String)
    item_model: Mapped[str | None] = mapped_column(String)
    item_cost: Mapped[float | None] = mapped_column(Numeric(12, 2))


class ItemMaterial(Base):
    __tablename__ = "items_materials"
    __table_args__ = (UniqueConstraint("item_id", "mat_id"),)

    itemMat_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.item_id"), nullable=False)
    mat_id: Mapped[int] = mapped_column(ForeignKey("materials.mat_id"), nullable=False)
    itemMat_isPrimary: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)


class PresetItem(Base):
    __tablename__ = "preset_items"
    __table_args__ = (UniqueConstraint("preset_id", "item_id"),)

    presetItem_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    preset_id: Mapped[int] = mapped_column(ForeignKey("presets.preset_id"), nullable=False)
    item_id: Mapped[int] = mapped_column(ForeignKey("items.item_id"), nullable=False)

    presetItem_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    presetItem_unitCost: Mapped[float | None] = mapped_column(Numeric(12, 2))

    presetItem_notes: Mapped[str | None] = mapped_column(Text)

    presetItem_isRequired: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    presetItem_rank: Mapped[int | None] = mapped_column(Integer)


class ProjectItem(Base):
    __tablename__ = "project_items"

    projItem_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    proj_id: Mapped[int] = mapped_column(ForeignKey("projects.proj_id"), nullable=False)
    room_id: Mapped[int | None] = mapped_column(ForeignKey("rooms.room_id"))

    item_id: Mapped[int] = mapped_column(ForeignKey("items.item_id"), nullable=False)

    presetItem_id: Mapped[int | None] = mapped_column(ForeignKey("preset_items.presetItem_id"))

    projItem_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)

    projItem_unitCost: Mapped[float | None] = mapped_column(Numeric(12, 2))

    projItem_notes: Mapped[str | None] = mapped_column(Text)

    # preset, ai, designer, client
    projItem_source: Mapped[str | None] = mapped_column(String)

    # pending, approved, rejected, swapped
    projItem_status: Mapped[str] = mapped_column(String, nullable=False, default="pending")

    projItem_confidenceScore: Mapped[float | None] = mapped_column(Float)

    projItem_createdAt: Mapped[datetime | None] = mapped_column(DateTime, server_default=func.now())
    projItem_updatedAt: Mapped[datetime | None] = mapped_column(DateTime, onupdate=func.now())


class ItemAlternative(Base):
    __tablename__ = "item_alternatives"
    __table_args__ = (UniqueConstraint("projItem_id", "alternative_item_id"),)

    alt_id: Mapped[int] = mapped_column(Integer, primary_key=True)
    projItem_id: Mapped[int] = mapped_column(ForeignKey("project_items.projItem_id"), nullable=False)
    alternative_item_id: Mapped[int] = mapped_column(ForeignKey("items.item_id"), nullable=False)

    alt_reason: Mapped[str | None] = mapped_column(Text)
    alt_rank: Mapped[int | None] = mapped_column(Integer)
