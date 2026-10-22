from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict


class IncidentSubmission(BaseModel):
    child_id: UUID
    reporter_name: str | None = "Classroom Staff"
    reporter_type: str = "Teacher"  # Teacher, SENCO, TA
    location: str = "Classroom"
    severity: str = "Moderate"  # Low, Moderate, High, Safeguarding Incident

    # ABC Chain
    antecedent: str
    behaviour: str
    consequence: str

    de_escalation_strategy_used: str | None = None
    recovery_time_minutes: int | None = None
    parent_notified: bool = False
    follow_up_action: str | None = None


class IncidentDetailResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    event_id: UUID
    child_id: UUID
    event_time: datetime
    reporter_name: str | None = None
    reporter_type: str
    location: str | None = None
    severity: str
    antecedent: str
    behaviour: str
    consequence: str
    de_escalation_strategy_used: str | None = None
    recovery_time_minutes: int | None = None
    parent_notified: bool
    status: str
