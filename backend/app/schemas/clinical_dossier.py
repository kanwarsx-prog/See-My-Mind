from datetime import datetime
from uuid import UUID
from pydantic import BaseModel, Field


class ClinicalPatientHeader(BaseModel):
    child_id: UUID
    full_name: str
    preferred_name: str
    date_of_birth: str
    chronological_age: str
    nhs_number: str
    school_name: str
    school_urn: str
    year_group: str
    primary_need: str
    lead_senco_name: str
    class_teacher_name: str
    primary_ta_name: str
    parent_carer_name: str
    referring_clinic: str
    reporting_window: str


class MedicationTitrationAudit(BaseModel):
    medication_name: str
    dosage: str
    formulation: str
    prescribed_schedule: str
    administration_time_logged: str
    peak_bioavailability_window: str
    mid_morning_dip_window: str
    caloric_co_ingestion_compliance: str
    fasted_vs_fed_incident_ratio: str
    clinical_observation: str


class CrossSettingConcordanceItem(BaseModel):
    domain: str
    home_presentation: str
    school_presentation: str
    concordance_level: str  # "High Concordance", "Pervasive Across Settings", "Masked at School"
    clinical_significance: str


class SensoryEnvironmentAudit(BaseModel):
    primary_sensory_triggers: list[str]
    acoustic_decibel_tolerance: str
    average_latency_to_de_escalate_minutes: float
    top_effective_accommodations: list[str]
    ineffective_or_escalating_actions: list[str]
    fixed_or_permanent_exclusions: int = 0


class RestraintCollapseAnalysis(BaseModel):
    masking_index_score: int = Field(ge=0, le=100)
    school_compliance_rating: str
    post_school_collapse_frequency: str
    autonomic_depletion_mechanism: str
    home_decompression_recommendation: str


class ClinicalRecommendationItem(BaseModel):
    category: str  # "Pharmacological / Nutrition", "School Environment (Section F)", "Home Decompression", "Multi-Agency"
    recommendation: str
    statutory_anchor: str


class CamhsClinicalDossierResponse(BaseModel):
    patient_header: ClinicalPatientHeader
    medication_audit: MedicationTitrationAudit
    cross_setting_concordance: list[CrossSettingConcordanceItem]
    sensory_environment_audit: SensoryEnvironmentAudit
    restraint_collapse_analysis: RestraintCollapseAnalysis
    clinical_recommendations: list[ClinicalRecommendationItem]
    nice_guideline_compliance: str
    compiled_at: datetime
