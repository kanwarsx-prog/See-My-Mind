from typing import Any
from pydantic import BaseModel, ConfigDict


class StatutorySchoolHeader(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    school_name: str
    urn: str
    dfe_number: str
    academic_year: str
    lead_senco: str
    senco_qualifications: str
    headteacher: str
    send_governor: str
    publication_date: str


class CaseloadNeedCategory(BaseModel):
    code_of_practice_area: str
    primary_diagnoses: list[str]
    pupil_count: int
    percentage_of_send: float
    key_adaptations_provided: list[str]


class CaseloadDemographics(BaseModel):
    total_pupils_in_school: int
    total_send_count: int
    send_percentage_school: float
    ehcp_count: int
    ehcp_percentage_school: float
    sen_support_count: int
    needs_distribution: list[CaseloadNeedCategory]


class StatutoryProvisionAuditSummary(BaseModel):
    total_high_needs_funding: str
    weekly_ta_hours_allocated: float
    weekly_ta_hours_delivered: float
    statutory_delivery_compliance_rate: float
    band_breakdown: list[dict[str, Any]]
    deployment_model: str


class EmpiricalEfficacyAudit(BaseModel):
    de_escalation_win_rate: float
    total_interventions_recorded: int
    fixed_term_exclusions: int
    permanent_exclusions: int
    average_attendance_rate: float
    breakthrough_milestones_logged: int
    top_effective_strategies: list[str]
    statutory_evaluation_narrative: str


class CoProductionAudit(BaseModel):
    daily_morning_handovers_active: int
    pupil_voice_checkins_this_term: int
    parent_satisfaction_percentage: float
    multi_agency_partners: list[str]


class StatutoryReviewComplianceAudit(BaseModel):
    annual_reviews_due_this_year: int
    annual_reviews_completed_or_on_track: int
    overdue_reviews: int
    statutory_compliance_rate: float


class SenInformationReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    header: StatutorySchoolHeader
    demographics: CaseloadDemographics
    provision_audit: StatutoryProvisionAuditSummary
    efficacy: EmpiricalEfficacyAudit
    co_production: CoProductionAudit
    annual_review_compliance: StatutoryReviewComplianceAudit
    senco_strategic_commentary: str
    priorities_for_next_year: list[str]
    governance_declaration: str
