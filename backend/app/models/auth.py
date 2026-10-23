from sqlalchemy import Boolean, Column, DateTime, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import TimestampedUUIDModel


class User(TimestampedUUIDModel):
    __tablename__ = "users"

    email = Column(String(140), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(140), nullable=False)
    role = Column(
        String(50), nullable=False, default="parent"
    )  # "senco", "teacher", "ta", "parent", "child", "admin"
    is_active = Column(Boolean, default=True, nullable=False)
    is_verified = Column(Boolean, default=False, nullable=False)
    theme_preference = Column(String(20), default="system", nullable=False)  # "light", "dark", "system"

    # Optional foreign keys linking to specific persona identities
    staff_id = Column(
        UUID(as_uuid=True), ForeignKey("staff_members.id", ondelete="SET NULL"), nullable=True
    )
    guardian_id = Column(
        UUID(as_uuid=True), ForeignKey("guardians.id", ondelete="SET NULL"), nullable=True
    )
    child_id = Column(
        UUID(as_uuid=True), ForeignKey("children.id", ondelete="SET NULL"), nullable=True
    )
    school_id = Column(
        UUID(as_uuid=True), ForeignKey("schools.id", ondelete="SET NULL"), nullable=True
    )

    staff_member = relationship("StaffMember", foreign_keys=[staff_id])
    guardian = relationship("Guardian", foreign_keys=[guardian_id])
    child = relationship("Child", foreign_keys=[child_id])
    school = relationship("School", foreign_keys=[school_id])


class Invitation(TimestampedUUIDModel):
    __tablename__ = "invitations"

    email = Column(String(140), nullable=False, index=True)
    token = Column(String(100), unique=True, nullable=False, index=True)
    role = Column(String(50), default="parent", nullable=False)
    child_id = Column(
        UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), nullable=True
    )
    school_id = Column(
        UUID(as_uuid=True), ForeignKey("schools.id", ondelete="CASCADE"), nullable=True
    )
    status = Column(
        String(50), default="pending", nullable=False
    )  # "pending", "accepted", "expired", "revoked"
    expires_at = Column(DateTime(timezone=True), nullable=False)
    accepted_at = Column(DateTime(timezone=True), nullable=True)

    child = relationship("Child", foreign_keys=[child_id])
    school = relationship("School", foreign_keys=[school_id])


class ChildAccount(TimestampedUUIDModel):
    __tablename__ = "child_accounts"

    child_id = Column(
        UUID(as_uuid=True), ForeignKey("children.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    username = Column(String(100), unique=True, nullable=False, index=True)
    pin_hash = Column(String(255), nullable=True)
    avatar_emoji = Column(String(20), default="⭐", nullable=False)

    child = relationship("Child", foreign_keys=[child_id])
