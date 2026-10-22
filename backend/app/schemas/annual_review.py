from uuid import UUID

from pydantic import BaseModel, ConfigDict


class SectionAViews(BaseModel):
    child_views: str
    child_aspirations: str
    parent_views: str
    parent_aspirations: str
    co_production_notes: str


class SectionBNeed(BaseModel):
    area_of_need: str  # e.g. "Cognition & Learning", "Communication & Interaction", "SEMH", "Sensory & Physical"
    statutory_summary: str
    observed_impact: str
    evidence_count: int
    citations: list[str]


class SectionEOutcome(BaseModel):
    target_id: str
    title: str
    category: str
    status: str  # "Met", "On Track", "Needs Review"
    evidence_summary: str
    last_reviewed: str


class SectionFProvision(BaseModel):
    provision_id: str
    title: str
    quantified_support: str
    evidence_delivery_rate: str
    strategies_used: list[str]
    impact_notes: str


class AnnualReviewMetrics(BaseModel):
    total_evidence_observations: int
    de_escalation_win_rate: str
    morning_handovers_received: int
    safeguarding_incidents: int
    active_ehcp_days: int


class AnnualReviewPackResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    child_id: UUID
    child_name: str
    date_of_birth: str
    year_group: str
    primary_need: str
    school_name: str
    senco_name: str
    review_date: str
    statutory_status: str
    metrics: AnnualReviewMetrics
    section_a: SectionAViews
    section_b: list[SectionBNeed]
    section_e: list[SectionEOutcome]
    section_f: list[SectionFProvision]
    senco_recommendations: str


class ProvisionMapPupil(BaseModel):
    id: str
    name: str
    year_group: str
    primary_need: str
    support_tier: str
    funding_band: str
    allocated_ta_hours: float
    assigned_ta: str
    annual_review_due: str
    days_until_review: int
    review_status: str  # "overdue", "due_soon", "scheduled"


class SchoolProvisionMatrixResponse(BaseModel):
    school_name: str
    academic_year: str
    lead_senco: str
    total_send_count: int
    ehcp_count: int
    sen_support_count: int
    total_ta_hours_weekly: float
    high_needs_funding_total: str
    reviews_due_next_30_days: int
    pupils: list[ProvisionMapPupil]
