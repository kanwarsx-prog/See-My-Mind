from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class SchoolBase(BaseModel):
    school_name: str
    school_reference: str | None = None
    town_city: str | None = None
    postcode: str | None = None
    main_email: EmailStr | None = None
    main_telephone: str | None = None
    active: bool = True


class SchoolCreate(SchoolBase):
    pass


class SchoolResponse(SchoolBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_at: datetime
    updated_at: datetime


class AcademicYearBase(BaseModel):
    label: str
    start_date: date
    end_date: date
    current: bool = False


class AcademicYearResponse(AcademicYearBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    school_id: UUID
    created_at: datetime
