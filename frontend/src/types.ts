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

export type RoleView = 'teacher' | 'senco' | 'parent' | 'child' | 'ta' | 'parentplus';

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
