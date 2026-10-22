import {
  Child,
  ChildEvent,
  MorningBriefing,
  AskNoyaResponse,
  TransitionLogDetail,
  ChildRegistrationRequest,
  ChildRegistrationResponse,
  InvitationValidationResponse,
  AcceptInvitationRequest,
  ChildAccountSetupRequest,
  ChildAccountResponse,
  EmailPreview,
  UserProfile,
  ClassroomMatrixData,
  AnnualReviewPackResponse,
  SchoolProvisionMatrixResponse,
  DecompressionBridgeResponse,
  EveningCheckInCreate,
  EveningCheckInResponse,
  MedicationCorrelationResponse,
  ParentWinsGalleryItem,
} from './types';

const API_BASE =
  import.meta.env.VITE_API_BASE_URL ||
  (typeof window !== 'undefined' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1'
    ? '/api/v1'
    : 'https://see-my-mind.onrender.com/api/v1');

let activeRole = 'senco';
let activeToken: string | null = typeof window !== 'undefined' ? localStorage.getItem('smm_auth_token') : null;

export const setApiRole = (role: string) => {
  activeRole = role;
};

export const setAuthToken = (token: string | null) => {
  activeToken = token;
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem('smm_auth_token', token);
    } else {
      localStorage.removeItem('smm_auth_token');
    }
  }
};

const getHeaders = (extra: Record<string, string> = {}) => {
  const h: Record<string, string> = {
    'X-User-Role': activeRole,
    ...extra,
  };
  if (activeToken) {
    h['Authorization'] = `Bearer ${activeToken}`;
  }
  return h;
};

export const api = {
  // Pupils
  async getPupils(): Promise<Child[]> {
    const res = await fetch(`${API_BASE}/pupils/`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch pupils');
    return res.json();
  },

  async getChild(childId: string): Promise<Child> {
    const res = await fetch(`${API_BASE}/pupils/${childId}`, { headers: getHeaders() });
    if (!res.ok) throw new Error('Failed to fetch child details');
    return res.json();
  },

  // Registration & Onboarding
  async registerChild(payload: ChildRegistrationRequest): Promise<ChildRegistrationResponse> {
    const res = await fetch(`${API_BASE}/registration/children`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to register pupil');
    }
    return res.json();
  },

  async validateInvitation(token: string): Promise<InvitationValidationResponse> {
    const res = await fetch(`${API_BASE}/registration/invitations/${encodeURIComponent(token)}`, {
      headers: getHeaders(),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to validate invitation');
    }
    return res.json();
  },

  async acceptInvitation(payload: AcceptInvitationRequest): Promise<{
    message: string;
    access_token: string;
    token_type: string;
    user: UserProfile;
  }> {
    const res = await fetch(`${API_BASE}/registration/accept-invitation`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to accept invitation');
    }
    const data = await res.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
    }
    return data;
  },

  async setupChildAccount(
    childId: string,
    payload: ChildAccountSetupRequest
  ): Promise<ChildAccountResponse> {
    const res = await fetch(`${API_BASE}/registration/children/${childId}/setup-child-account`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Failed to set up child voice account');
    }
    return res.json();
  },

  async getRecentInvitations(): Promise<EmailPreview[]> {
    const res = await fetch(`${API_BASE}/registration/recent-invitations`, {
      headers: getHeaders(),
    });
    if (!res.ok) return [];
    return res.json();
  },

  // Authentication & Identity
  async login(
    emailOrUsername: string,
    passwordOrPin: string
  ): Promise<{
    access_token: string;
    token_type: string;
    user: UserProfile;
  }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email_or_username: emailOrUsername,
        password_or_pin: passwordOrPin,
      }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Login failed. Please check your credentials.');
    }
    const data = await res.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
      setApiRole(data.user.role);
    }
    return data;
  },

  async demoLogin(role: string): Promise<{
    access_token: string;
    token_type: string;
    user: UserProfile;
  }> {
    const res = await fetch(`${API_BASE}/auth/demo-login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.detail || 'Demo login failed.');
    }
    const data = await res.json();
    if (data.access_token) {
      setAuthToken(data.access_token);
      setApiRole(data.user.role);
    }
    return data;
  },

  logout() {
    setAuthToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('smm_auth_token');
      localStorage.removeItem('smm_user_profile');
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    if (!activeToken) return null;
    try {
      const res = await fetch(`${API_BASE}/auth/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) {
        setAuthToken(null);
        return null;
      }
      return await res.json();
    } catch {
      return null;
    }
  },

  // Timeline / Events
  async getTimeline(childId: string): Promise<ChildEvent[]> {
    const res = await fetch(`${API_BASE}/timeline/children/${childId}/events`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async logEvent(eventData: any): Promise<ChildEvent> {
    const res = await fetch(`${API_BASE}/timeline/events`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(eventData),
    });
    if (!res.ok) throw new Error('Failed to log event');
    return res.json();
  },

  // Transitions
  async submitMorningHandover(
    childId: string,
    handoverData: {
      sleep_quality: string;
      morning_mood: string;
      breakfast_eaten: boolean;
      medication_given: boolean;
      special_notes_for_day: string;
    },
    parentName: string = 'Dana Carter'
  ): Promise<ChildEvent> {
    const res = await fetch(
      `${API_BASE}/transitions/morning-handover/${childId}?parent_name=${encodeURIComponent(parentName)}`,
      {
        method: 'POST',
        headers: getHeaders({ 'Content-Type': 'application/json' }),
        body: JSON.stringify(handoverData),
      }
    );
    if (!res.ok) throw new Error('Failed to submit morning handover');
    return res.json();
  },

  async acknowledgeTransition(transitionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/transitions/transitions/${transitionId}/acknowledge`, {
      method: 'PATCH',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to acknowledge transition');
    return res.json();
  },

  async getLatestHandover(childId: string): Promise<TransitionLogDetail | null> {
    const res = await fetch(`${API_BASE}/transitions/children/${childId}/latest`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch latest handover');
    return res.json();
  },

  async getDecompressionBridge(childId: string): Promise<DecompressionBridgeResponse> {
    const res = await fetch(`${API_BASE}/transitions/children/${childId}/decompression-bridge`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch decompression bridge');
    return res.json();
  },

  async submitEveningHandover(
    childId: string,
    data: EveningCheckInCreate
  ): Promise<EveningCheckInResponse> {
    const res = await fetch(`${API_BASE}/transitions/evening-handover/${childId}`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error('Failed to submit evening handover');
    return res.json();
  },

  async getMedicationCorrelation(childId: string): Promise<MedicationCorrelationResponse> {
    const res = await fetch(`${API_BASE}/transitions/children/${childId}/correlation-digest`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch medication correlation digest');
    return res.json();
  },

  async getWinsGallery(childId: string): Promise<ParentWinsGalleryItem[]> {
    const res = await fetch(`${API_BASE}/transitions/children/${childId}/wins-gallery`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch wins gallery');
    return res.json();
  },

  // NOYA AI Engine
  async getMorningBriefing(childId: string): Promise<MorningBriefing> {
    const res = await fetch(`${API_BASE}/noya/morning-briefing/${childId}`, {
      method: 'POST',
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to generate NOYA briefing');
    return res.json();
  },

  async askNoya(childId: string, question: string): Promise<AskNoyaResponse> {
    const res = await fetch(`${API_BASE}/noya/ask`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ child_id: childId, question }),
    });
    if (!res.ok) throw new Error('Failed to query NOYA');
    return res.json();
  },

  // Pupil Voice Check-In
  async logCheckIn(
    childId: string,
    checkIn: { mood_emoji: string; mood_label: string; energy_level?: number; self_regulation_need?: string }
  ): Promise<ChildEvent> {
    const res = await fetch(`${API_BASE}/timeline/children/${childId}/check-in`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(checkIn),
    });
    if (!res.ok) throw new Error('Failed to submit pupil check-in');
    return res.json();
  },

  // ABC Incidents & Safeguarding
  async logIncident(incident: any): Promise<any> {
    const res = await fetch(`${API_BASE}/incidents/`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(incident),
    });
    if (!res.ok) throw new Error('Failed to submit ABC incident');
    return res.json();
  },

  async getIncidents(childId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/incidents/children/${childId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch incidents');
    return res.json();
  },

  // EHCP Documents & Storage
  async uploadDocument(
    childId: string,
    title: string,
    documentType: string,
    file: File
  ): Promise<any> {
    const formData = new FormData();
    formData.append('child_id', childId);
    formData.append('title', title);
    formData.append('document_type', documentType);
    formData.append('file', file);

    const headers = getHeaders();
    delete headers['Content-Type']; // let browser set multipart boundary

    const res = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error('Failed to upload document');
    return res.json();
  },

  async getDocuments(childId: string): Promise<any[]> {
    const res = await fetch(`${API_BASE}/documents/children/${childId}`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch documents');
    return res.json();
  },

  async getClassMatrix(roomName: string = 'room-4'): Promise<ClassroomMatrixData> {
    const res = await fetch(`${API_BASE}/pupils/classrooms/${roomName}/matrix`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch classroom matrix');
    return res.json();
  },

  async getAnnualReviewPack(childId: string): Promise<AnnualReviewPackResponse> {
    const res = await fetch(`${API_BASE}/pupils/${childId}/annual-review-pack`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch annual review pack');
    return res.json();
  },

  async getSchoolProvisionMatrix(): Promise<SchoolProvisionMatrixResponse> {
    const res = await fetch(`${API_BASE}/pupils/school/provision-matrix`, {
      headers: getHeaders(),
    });
    if (!res.ok) throw new Error('Failed to fetch school provision matrix');
    return res.json();
  },
};

