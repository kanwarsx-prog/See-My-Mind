from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


class GraduatedResponseItem(BaseModel):
    pupil_id: UUID
    name: str
    preferred_name: str
    support_tier: str  # "Statutory EHCP" | "SEN Support (K)"
    primary_need: str
    assigned_ta: str
    weekly_ta_hours: float
    assess_notes: str
    plan_targets: list[str]
    do_provisions: list[str]
    review_efficacy: str
    review_outcome: str  # "Target Met" | "Significant Progress" | "Needs Revision" | "Escalate to EHCP"
    breakthrough_milestones: list[str]
    recommended_next_steps: str


class ClassroomProvisionSummary(BaseModel):
    room_name: str
    year_group: str
    class_teacher_name: str
    primary_ta_name: str
    review_period: str
    total_send_pupils: int
    ehcp_count: int
    sen_support_count: int
    total_weekly_ta_hours: float
    overall_class_win_rate: float
    graduated_responses: list[GraduatedResponseItem]
    statutory_declaration: str
    generated_at: datetime
    school_name: str | None = None
