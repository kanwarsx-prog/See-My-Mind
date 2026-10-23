export interface SupportProfile {
  id: string;
  child_id: string;
  primary_need?: string;
  secondary_need?: string;
  summary?: string;
  communication_preferences?: string;
  sensory_profile?: string;
  strengths_interests?: string;
  has_ehcp: boolean;
}

export interface Child {
  id: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  preferred_name?: string;
  date_of_birth: string;
  sex: string;
  year_group?: string;
  school_id?: string;
  active: boolean;
  support_profile?: SupportProfile;
}

export interface ObservationDetail {
  id: string;
  event_id: string;
  activity_context?: string;
  engagement_level?: string;
  strategy_used?: string;
  strategy_worked?: boolean;
  strengths_observed?: string;
  notes?: string;
}

export interface TransitionLogDetail {
  id: string;
  event_id: string;
  transition_type: string;
  sleep_quality?: string;
  morning_mood?: string;
  breakfast_eaten?: boolean;
  medication_given?: boolean;
  special_notes_for_day?: string;
  acknowledged_by_staff: boolean;
  acknowledged_at?: string;
}

export interface ChildCheckInDetail {
  id: string;
  event_id: string;
  mood_emoji: string;
  mood_label: string;
  energy_level?: number;
  self_regulation_need?: string;
  voice_note_text?: string;
}

export interface ChildEvent {
  id: string;
  child_id: string;
  school_id?: string;
  event_time: string;
  event_type: string;
  reporter_type: string;
  reporter_name?: string;
  title: string;
  summary: string;
  significance: string;
  visibility: string;
  status: string;
  observation?: ObservationDetail;
  transition_log?: TransitionLogDetail;
  child_check_in?: ChildCheckInDetail;
}

export interface EvidenceCitation {
  citation_text: string;
  snippet?: string;
  event_id?: string;
}

export interface MorningBriefing {
  child_id: string;
  child_name: string;
  briefing_date: string;
  summary_markdown: string;
  recommended_focus: string[];
  citations: EvidenceCitation[];
  confidence_level: string;
}

export interface AskNoyaResponse {
  question: string;
  answer_markdown: string;
  citations: EvidenceCitation[];
  model_used: string;
  latency_ms: number;
}

export interface IncidentDetail {
  id: string;
  event_id: string;
  child_id: string;
  event_time: string;
  reporter_name?: string;
  reporter_type: string;
  location?: string;
  severity: string;
  antecedent: string;
  behaviour: string;
  consequence: string;
  de_escalation_strategy_used?: string;
  recovery_time_minutes?: number;
  parent_notified: boolean;
  status: string;
}

export interface IncidentSubmission {
  child_id: string;
  reporter_name?: string;
  reporter_type?: string;
  location?: string;
  severity: string;
  antecedent: string;
  behaviour: string;
  consequence: string;
  de_escalation_strategy_used?: string;
  recovery_time_minutes?: number;
  parent_notified?: boolean;
  follow_up_action?: string;
}

export interface DocumentItem {
  id: string;
  child_id: string;
  school_id?: string;
  title: string;
  document_type: string;
  storage_path: string;
  file_size_bytes?: number;
  mime_type?: string;
  is_indexed: boolean;
  created_at: string;
}

export interface PathwayStep {
  number: number;
  title: string;
  description: string;
  status: 'done' | 'active' | 'next' | 'locked';
  badge: string;
}

export interface PeerAdaptation {
  initials: string;
  name: string;
  need: string;
  route: string;
  method: 'Auditory' | 'Kinesthetic' | 'Written';
  color: string;
}

export type RoleView = 'teacher' | 'senco' | 'parent' | 'child' | 'ta' | 'parentplus' | 'admin';

export interface EmailPreview {
  to_email: string;
  subject: string;
  html_content: string;
  preview_text?: string;
  activation_url: string;
  sent_at: string;
  delivery_channel?: 'resend' | 'smtp' | 'preview';
  external_id?: string;
  delivery_error?: string;
}

export interface ChildRegistrationRequest {
  first_name: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth: string;
  sex: string;
  year_group?: string;
  school_id?: string;
  primary_need?: string;
  secondary_need?: string;
  has_ehcp?: boolean;
  ehcp_status?: string;
  summary?: string;
  communication_preferences?: string;
  sensory_profile?: string;
  strengths_interests?: string;
  baseline_strategy?: string;
  guardian_first_name: string;
  guardian_last_name: string;
  guardian_email: string;
  guardian_mobile?: string;
  relationship_to_child?: string;
  send_invitation_immediately?: boolean;
}

export interface ChildRegistrationResponse {
  child_id: string;
  full_name: string;
  school_id: string;
  guardian_id: string;
  invitation_id?: string;
  invitation_token?: string;
  invitation_url?: string;
  email_preview?: EmailPreview;
  message: string;
}

export interface InvitationValidationResponse {
  token: string;
  valid: boolean;
  recipient_email: string;
  child_id?: string;
  child_name?: string;
  school_name?: string;
  role?: string;
  expires_at?: string;
}

export interface AcceptInvitationRequest {
  token: string;
  password: string;
  full_name?: string;
}

export interface ChildAccountSetupRequest {
  child_id: string;
  username: string;
  pin: string;
  avatar_emoji?: string;
}

export interface ChildAccountResponse {
  id: string;
  child_id: string;
  username: string;
  avatar_emoji: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  child_id?: string;
  username?: string;
  avatar_emoji?: string;
}

export interface ClassroomPupilSummary {
  id: string;
  name: string;
  preferred_name: string;
  year_group: string;
  primary_need: string;
  secondary_need?: string;
  has_ehcp: boolean;
  support_tier: string;
  readiness_status: string;
  readiness_level: 'green' | 'amber' | 'red';
  primary_triggers: string[];
  sensory_calming_tools: string[];
  buddy_pairing?: string;
  subject_accommodations: {
    maths?: string;
    english?: string;
    science?: string;
    assembly?: string;
    [key: string]: string | undefined;
  };
}

export interface ClassroomMatrixData {
  room_name: string;
  year_group: string;
  lead_teacher: string;
  assigned_ta: string;
  total_send_count: number;
  ehcp_count: number;
  cohort: ClassroomPupilSummary[];
}

export interface SectionAViews {
  child_views: string;
  child_aspirations: string;
  parent_views: string;
  parent_aspirations: string;
  co_production_notes: string;
}

export interface SectionBNeed {
  area_of_need: string;
  statutory_summary: string;
  observed_impact: string;
  evidence_count: number;
  citations: string[];
}

export interface SectionEOutcome {
  target_id: string;
  title: string;
  category: string;
  status: 'Met' | 'On Track' | 'Needs Review';
  evidence_summary: string;
  last_reviewed: string;
}

export interface SectionFProvision {
  provision_id: string;
  title: string;
  quantified_support: string;
  evidence_delivery_rate: string;
  strategies_used: string[];
  impact_notes: string;
}

export interface AnnualReviewMetrics {
  total_evidence_observations: number;
  de_escalation_win_rate: string;
  morning_handovers_received: number;
  safeguarding_incidents: number;
  active_ehcp_days: number;
}

export interface AnnualReviewPackResponse {
  child_id: string;
  child_name: string;
  date_of_birth: string;
  year_group: string;
  primary_need: string;
  school_name: string;
  senco_name: string;
  review_date: string;
  statutory_status: string;
  metrics: {
    total_evidence_observations: number;
    de_escalation_win_rate: string;
    morning_handovers_received: number;
    safeguarding_incidents: number;
    active_ehcp_days: number;
  };
  section_a: SectionAViews;
  section_b: SectionBNeed[];
  section_e: SectionEOutcome[];
  section_f: SectionFProvision[];
  senco_recommendations: string;
}

export interface ProvisionMapPupil {
  id: string;
  name: string;
  year_group: string;
  primary_need: string;
  support_tier: string;
  funding_band: string;
  allocated_ta_hours: number;
  assigned_ta: string;
  annual_review_due: string;
  days_until_review: number;
  review_status: 'overdue' | 'due_soon' | 'scheduled';
}

export interface SchoolProvisionMatrixResponse {
  school_name: string;
  academic_year: string;
  lead_senco: string;
  total_send_count: number;
  ehcp_count: number;
  sen_support_count: number;
  total_ta_hours_weekly: number;
  high_needs_funding_total: string;
  reviews_due_next_30_days: number;
  pupils: ProvisionMapPupil[];
}

// Parent Decompression & Masking Hub
export interface AdultClue {
  source: string;
  role: string;
  time: string;
  observation: string;
  significance: string;
  marker_type: string;
}

export interface DecompressionStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon_type: string;
  tag: string;
}

export interface DecompressionBridgeResponse {
  child_id: string;
  child_name: string;
  battery_percentage: number;
  battery_status: string;
  battery_color: string;
  masking_level: string;
  masking_explanation: string;
  draining_factors: string[];
  recharging_factors: string[];
  adult_observation_clues: AdultClue[];
  decompression_recipe: DecompressionStep[];
  recommended_evening_activities: string[];
  generated_at: string;
}

export interface EveningCheckInCreate {
  child_id?: string;
  parent_name?: string;
  after_school_decompression: string;
  evening_mood: string;
  dinner_eaten: boolean;
  screen_free_downtime_minutes: number;
  notes_for_tomorrow?: string;
}

export interface EveningCheckInResponse {
  id: string;
  event_id: string;
  child_id: string;
  parent_name: string;
  after_school_decompression: string;
  evening_mood: string;
  dinner_eaten: boolean;
  screen_free_downtime_minutes: number;
  notes_for_tomorrow?: string;
  logged_at: string;
}

export interface CorrelationInsightItem {
  factor: string;
  incident_rate: string;
  effect: string;
  confidence: string;
  status: 'positive' | 'warning' | 'neutral';
}

export interface MedicationCorrelationResponse {
  child_id: string;
  child_name: string;
  medication_name: string;
  morning_window: string;
  dip_window: string;
  total_days_analyzed: number;
  optimal_conditions: string[];
  correlation_insights: CorrelationInsightItem[];
  pediatrician_summary: string;
  generated_at: string;
}

export interface ParentWinsGalleryItem {
  id: string;
  child_id: string;
  title: string;
  date: string;
  category: string;
  description: string;
  teacher_quote: string;
  celebration_badge: string;
  tags: string[];
}

// Trust & Multi-School Governance Types
export interface SchoolTenant {
  id: string;
  school_name: string;
  urn_number?: string;
  phase?: string;
  local_authority?: string;
  lead_senco_name?: string;
  school_reference?: string;
  town_city?: string;
  postcode?: string;
  main_email?: string;
  main_telephone?: string;
  active: boolean;
  pupil_count: number;
  staff_count: number;
  created_at: string;
}

export interface AdminSchoolCreate {
  school_name: string;
  urn_number: string;
  phase?: string;
  local_authority?: string;
  lead_senco_name?: string;
  school_reference?: string;
  town_city?: string;
  postcode?: string;
  main_email?: string;
  main_telephone?: string;
}

export interface AdminUserItem {
  id: string;
  email: string;
  full_name: string;
  role: string;
  school_id?: string;
  school_name: string;
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
}

export interface StaffProvisionRequest {
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  school_id?: string;
  job_title?: string;
  password?: string;
}

export interface StaffProvisionResponse {
  user_id: string;
  staff_id?: string;
  email: string;
  full_name: string;
  role: string;
  school_id: string;
  school_name: string;
  job_title?: string;
  temporary_credentials: string;
  invitation_token?: string;
  message: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor_id?: string;
  actor_name: string;
  actor_role: string;
  school_id?: string;
  school_name?: string;
  action: string;
  target_type: string;
  target_id?: string;
  target_name?: string;
  details: string;
  ip_address?: string;
}

export interface TrustGovernanceStats {
  total_schools: number;
  total_staff: number;
  total_pupils: number;
  ehcp_pupils: number;
  compliance_score: string;
  audit_events_count: number;
  lead_trust_admin: string;
}

export interface DelegationMatrixItem {
  role_key: string;
  role_title: string;
  tier: string;
  authorities: string[];
  delegated_responsibilities: string[];
  safeguarding_scope: string;
  data_boundary: string;
}

