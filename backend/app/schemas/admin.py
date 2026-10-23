from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


class AdminSchoolCreate(BaseModel):
    school_name: str = Field(..., min_length=2, max_length=140)
    urn_number: str = Field(..., min_length=4, max_length=20, description="UK DfE Unique Reference Number")
    phase: str = Field(default="Primary", description="Primary, Secondary, All-through, Special")
    local_authority: str = Field(default="Southwark", max_length=100)
    lead_senco_name: str | None = None
    school_reference: str | None = None
    town_city: str | None = "London"
    postcode: str | None = "SE1 7PB"
    main_email: EmailStr | None = None
    main_telephone: str | None = None


class AdminSchoolResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    school_name: str
    urn_number: str | None
    phase: str | None
    local_authority: str | None
    lead_senco_name: str | None
    school_reference: str | None
    town_city: str | None
    postcode: str | None
    main_email: str | None
    main_telephone: str | None
    active: bool
    pupil_count: int = 0
    staff_count: int = 0
    created_at: datetime


class StaffProvisionRequest(BaseModel):
    first_name: str = Field(..., min_length=1, max_length=140)
    last_name: str = Field(..., min_length=1, max_length=140)
    email: EmailStr
    role: str = Field(..., description="Role to provision: senco, teacher, ta, admin")
    school_id: UUID = Field(..., description="Target school tenant ID")
    job_title: str | None = None
    password: str | None = Field(default=None, description="Optional custom initial password")


class StaffProvisionResponse(BaseModel):
    user_id: UUID
    staff_id: UUID | None
    email: str
    full_name: str
    role: str
    school_id: UUID
    school_name: str
    job_title: str | None
    temporary_credentials: str
    invitation_token: str | None = None
    message: str


class AuditLogResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    timestamp: datetime
    actor_id: UUID | None
    actor_name: str
    actor_role: str
    school_id: UUID | None
    school_name: str | None = None
    action: str
    target_type: str
    target_id: UUID | None
    target_name: str | None
    details: str
    ip_address: str | None = None


class TrustGovernanceStats(BaseModel):
    total_schools: int
    total_staff: int
    total_pupils: int
    ehcp_pupils: int
    compliance_score: str
    audit_events_count: int
    lead_trust_admin: str


class DelegationMatrixItem(BaseModel):
    role_key: str
    role_title: str
    tier: str
    authorities: list[str]
    delegated_responsibilities: list[str]
    safeguarding_scope: str
    data_boundary: str
