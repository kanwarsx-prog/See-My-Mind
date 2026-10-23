from datetime import UTC, datetime

from sqlalchemy import Column, DateTime, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID

from app.models.base import TimestampedUUIDModel


class AuditLog(TimestampedUUIDModel):
    """Immutable audit trail for governance, compliance, and tenant boundary tracking.
    Complies with UK Data Protection Act 2018 / GDPR and KCSIE access logging.
    """

    __tablename__ = "audit_logs"

    actor_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    actor_name = Column(String(140), nullable=False)
    actor_role = Column(String(50), nullable=False, index=True)

    school_id = Column(
        UUID(as_uuid=True),
        ForeignKey("schools.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )

    action = Column(
        String(80), nullable=False, index=True
    )  # e.g. "ONBOARD_SCHOOL", "APPOINT_SENCO", "PROVISION_STAFF", "REGISTER_PUPIL", "REVOKE_ACCESS"
    target_type = Column(
        String(50), nullable=False, index=True
    )  # e.g. "school", "user", "pupil", "invitation", "auth"
    target_id = Column(UUID(as_uuid=True), nullable=True)
    target_name = Column(String(140), nullable=True)

    details = Column(Text, nullable=False)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(UTC),
        nullable=False,
        index=True,
    )
