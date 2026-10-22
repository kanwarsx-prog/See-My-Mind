import { Child, ChildEvent, MorningBriefing, AskNoyaResponse } from './types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'https://see-my-mind.onrender.com/api/v1';

export const api = {
  // Pupils
  async getPupils(): Promise<Child[]> {
    const res = await fetch(`${API_BASE}/pupils/`);
    if (!res.ok) throw new Error('Failed to fetch pupils');
    return res.json();
  },

  async getChild(childId: string): Promise<Child> {
    const res = await fetch(`${API_BASE}/pupils/${childId}`);
    if (!res.ok) throw new Error('Failed to fetch child details');
    return res.json();
  },

  // Timeline / Events
  async getTimeline(childId: string): Promise<ChildEvent[]> {
    const res = await fetch(`${API_BASE}/timeline/children/${childId}/events`);
    if (!res.ok) throw new Error('Failed to fetch timeline');
    return res.json();
  },

  async logEvent(eventData: any): Promise<ChildEvent> {
    const res = await fetch(`${API_BASE}/timeline/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(handoverData),
      }
    );
    if (!res.ok) throw new Error('Failed to submit morning handover');
    return res.json();
  },

  async acknowledgeTransition(transitionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/transitions/transitions/${transitionId}/acknowledge`, {
      method: 'PATCH',
    });
    if (!res.ok) throw new Error('Failed to acknowledge transition');
    return res.json();
  },

  // NOYA AI Engine
  async getMorningBriefing(childId: string): Promise<MorningBriefing> {
    const res = await fetch(`${API_BASE}/noya/morning-briefing/${childId}`, {
      method: 'POST',
    });
    if (!res.ok) throw new Error('Failed to generate NOYA briefing');
    return res.json();
  },

  async askNoya(childId: string, question: string): Promise<AskNoyaResponse> {
    const res = await fetch(`${API_BASE}/noya/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ child_id: childId, question }),
    });
    if (!res.ok) throw new Error('Failed to query NOYA');
    return res.json();
  },
};
