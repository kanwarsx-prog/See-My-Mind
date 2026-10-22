from datetime import date, datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class ChildRegistrationRequest(BaseModel):
    # Pupil Demographics
    first_name: str = Field(..., min_length=1, max_length=140)
    last_name: str = Field(..., min_length=1, max_length=140)
    preferred_name: str | None = None
    date_of_birth: date
    sex: str = "Prefer not to say"
    year_group: str = "Year 5"
    school_id: UUID | None = None

    # SEND Support Profile
    primary_need: str = "Autism Spectrum Condition"
    secondary_need: str | None = None
    has_ehcp: bool = True
    ehcp_status: str = "Active"  # "Active", "Pending", "SEN Support"
    summary: str | None = None
    communication_preferences: str | None = "Visual task cards, direct 1-step prompts"
    sensory_profile: str | None = "Sensitive to loud noises (assemblies, bells)"
    strengths_interests: str | None = "Visual-spatial reasoning, game design, systems"
    baseline_strategy: str | None = "Visual task strip on desk, noise defenders at door"

    # Guardian / Parent Contact
    guardian_first_name: str = Field(..., min_length=1, max_length=140)
    guardian_last_name: str = Field(..., min_length=1, max_length=140)
    guardian_email: EmailStr
    guardian_mobile: str | None = None
    relationship_to_child: str = "Mother"  # "Mother", "Father", "Carer", "Guardian"
    send_invitation_immediately: bool = True


class DispatchedEmailPreview(BaseModel):
    id: str
    to_email: str
    recipient_name: str
    subject: str
    html_content: str
    sent_at: datetime
    activation_url: str


class ChildRegistrationResponse(BaseModel):
    child_id: UUID
    full_name: str
    school_id: UUID | None
    guardian_id: UUID
    invitation_id: UUID | None = None
    invitation_token: str | None = None
    invitation_url: str | None = None
    email_preview: DispatchedEmailPreview | None = None
    message: str


class InvitationValidationResponse(BaseModel):
    token: str
    valid: bool
    recipient_email: str
    child_id: UUID | None = None
    child_name: str | None = None
    school_name: str | None = None
    role: str = "parent"
    expires_at: datetime | None = None


class AcceptInvitationRequest(BaseModel):
    token: str
    password: str = Field(..., min_length=8)
    full_name: str | None = None


class ChildAccountSetupRequest(BaseModel):
    child_id: UUID
    username: str = Field(..., min_length=3, max_length=50)
    pin: str = Field(..., min_length=4, max_length=6)
    avatar_emoji: str = "⭐"


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    is_active: bool
    is_verified: bool
    child_id: UUID | None = None
    guardian_id: UUID | None = None
    school_id: UUID | None = None
    created_at: datetime
