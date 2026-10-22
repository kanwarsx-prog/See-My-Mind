from sqlalchemy import Boolean, Column, Date, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.models.base import TimestampedUUIDModel


class School(TimestampedUUIDModel):
    __tablename__ = "schools"

    school_name = Column(String(140), nullable=False, index=True)
    school_reference = Column(String(140), nullable=True, unique=True, index=True)
    address_line_1 = Column(String(140), nullable=True)
    address_line_2 = Column(String(140), nullable=True)
    town_city = Column(String(140), nullable=True)
    county = Column(String(140), nullable=True)
    postcode = Column(String(20), nullable=True)
    main_email = Column(String(140), nullable=True)
    main_telephone = Column(String(50), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    # Relationships
    academic_years = relationship(
        "AcademicYear", back_populates="school", cascade="all, delete-orphan"
    )
    staff_assignments = relationship(
        "StaffSchoolAssignment", back_populates="school", cascade="all, delete-orphan"
    )
    pupils = relationship("Child", back_populates="school")


class AcademicYear(TimestampedUUIDModel):
    __tablename__ = "academic_years"

    school_id = Column(
        UUID(as_uuid=True), ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True
    )
    label = Column(String(50), nullable=False)  # e.g. "2026/2027"
    start_date = Column(Date, nullable=False)
    end_date = Column(Date, nullable=False)
    current = Column(Boolean, default=False, nullable=False)

    school = relationship("School", back_populates="academic_years")


class StaffMember(TimestampedUUIDModel):
    __tablename__ = "staff_members"

    first_name = Column(String(140), nullable=False)
    last_name = Column(String(140), nullable=False)
    email = Column(String(140), unique=True, nullable=False, index=True)
    telephone = Column(String(50), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    assignments = relationship(
        "StaffSchoolAssignment", back_populates="staff_member", cascade="all, delete-orphan"
    )


class StaffSchoolAssignment(TimestampedUUIDModel):
    __tablename__ = "staff_school_assignments"

    staff_id = Column(
        UUID(as_uuid=True),
        ForeignKey("staff_members.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    school_id = Column(
        UUID(as_uuid=True), ForeignKey("schools.id", ondelete="CASCADE"), nullable=False, index=True
    )
    role = Column(String(50), nullable=False)  # e.g. "Teacher", "SENCO", "TA", "Headteacher", "DSL"
    job_title = Column(String(140), nullable=True)
    active = Column(Boolean, default=True, nullable=False)

    staff_member = relationship("StaffMember", back_populates="assignments")
    school = relationship("School", back_populates="staff_assignments")
