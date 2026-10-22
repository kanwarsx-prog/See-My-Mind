import React, { useState, useEffect } from 'react';
import { RoleView, Child, ChildEvent, MorningBriefing, IncidentSubmission, TransitionLogDetail } from './types';
import { api } from './api';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ObservationModal } from './components/ObservationModal';
import { IncidentModal } from './components/IncidentModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { TeacherView } from './views/TeacherView';
import { ParentView } from './views/ParentView';
import { SencoView } from './views/SencoView';
import { ChildView } from './views/ChildView';
import { TaView } from './views/TaView';
import { ParentPlusView } from './views/ParentPlusView';
import { Plus } from 'lucide-react';

export const App: React.FC = () => {
  const [activeView, setActiveView] = useState<RoleView>('teacher');
  const [child, setChild] = useState<Child | null>(null);
  const [timeline, setTimeline] = useState<ChildEvent[]>([]);
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [latestHandover, setLatestHandover] = useState<TransitionLogDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Load pupil, timeline, and morning handover from live backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const pupils = await api.getPupils();
        if (pupils.length > 0) {
          const selected = pupils[0]; // Phoenix Carter
          setChild(selected);

          const [events, brief, handover] = await Promise.all([
            api.getTimeline(selected.id),
            api.getMorningBriefing(selected.id).catch(() => null),
            api.getLatestHandover(selected.id).catch(() => null),
          ]);
          setTimeline(events);
          setBriefing(brief);
          setLatestHandover(handover);
        }
      } catch (err) {
        console.error('Error connecting to backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleRefreshBriefing = async () => {
    if (!child) return;
    try {
      const brief = await api.getMorningBriefing(child.id);
      setBriefing(brief);
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogObservation = async (eventData: any) => {
    if (!child) return;
    const newEvent = await api.logEvent({
      ...eventData,
      child_id: child.id,
      school_id: child.school_id,
    });
    setTimeline([newEvent, ...timeline]);
  };

  const handleAcknowledgeHandover = async (transitionId: string) => {
    try {
      const updated = await api.acknowledgeTransition(transitionId);
      setLatestHandover((prev) =>
        prev
          ? {
              ...prev,
              acknowledged_by_staff: true,
              acknowledged_at: updated.acknowledged_at || new Date().toISOString(),
            }
          : null
      );

      setTimeline((prev) =>
        prev.map((evt) => {
          if (evt.transition_log && evt.transition_log.id === transitionId) {
            return {
              ...evt,
              status: 'Acknowledged',
              transition_log: {
                ...evt.transition_log,
                acknowledged_by_staff: true,
                acknowledged_at: updated.acknowledged_at || new Date().toISOString(),
              },
            };
          }
          return evt;
        })
      );
    } catch (err) {
      console.error('Failed to acknowledge transition handover:', err);
    }
  };

  const handleSubmitHandover = async (handoverData: any) => {
    if (!child) return;
    const newEvent = await api.submitMorningHandover(child.id, handoverData);
    setTimeline([newEvent, ...timeline]);
    const freshHandover = await api.getLatestHandover(child.id).catch(() => null);
    setLatestHandover(freshHandover);
    await handleRefreshBriefing();
  };

  const handleChildCheckIn = async (checkInData: any) => {
    if (!child) return;
    const newEvent = await api.logCheckIn(child.id, checkInData);
    setTimeline([newEvent, ...timeline]);
  };

  const handleDirectLog = async (eventData: any) => {
    if (!child) return;
    const newEvent = await api.logEvent({
      ...eventData,
      child_id: child.id,
      school_id: child.school_id,
    });
    setTimeline([newEvent, ...timeline]);
  };

  const handleLogIncident = async (incident: IncidentSubmission) => {
    if (!child) return;
    await api.logIncident(incident);
    const refreshed = await api.getTimeline(child.id);
    setTimeline(refreshed);
  };

  const handleUploadDocument = async (title: string, docType: string, file: File) => {
    if (!child) return;
    await api.uploadDocument(child.id, title, docType, file);
  };

  if (loading || !child) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-teal border-t-transparent animate-spin" />
        <div className="text-sm font-bold text-navy font-serif">Connecting to See My Mind & NOYA AI...</div>
        <div className="text-xs text-gray-400">Fetching live data from Supabase & Render</div>
      </div>
    );
  }

  const isHandoverAcknowledged = latestHandover?.acknowledged_by_staff;
  const isBreakfastSkipped = latestHandover?.breakfast_eaten === false;

  const topBarConfig = {
    teacher: {
      title: 'Good morning, Ms Johnson 👋',
      subtitle: 'Wednesday 22 October 2026 · Year 5 · Room 4',
      pills: [
        latestHandover && !isHandoverAcknowledged
          ? { label: '🔔 Handover Needs Ack', color: 'red' as const }
          : { label: '✓ Handover Acknowledged', color: 'green' as const },
        isBreakfastSkipped
          ? { label: '🍽 Skipped Breakfast', color: 'amber' as const }
          : { label: '🥣 Breakfast Eaten', color: 'teal' as const },
        { label: '⚡ Assembly 9:05am', color: 'red' as const },
        { label: '📚 Maths: Straight Lines', color: 'gold' as const },
      ],
      actionButton: {
        label: '+ Log Observation',
        onClick: () => setIsObsModalOpen(true),
        icon: <Plus className="w-4 h-4" />,
      },
    },
    senco: {
      title: 'Inclusion & SEND Dashboard · Ms Okafor',
      subtitle: 'St. Jude’s Inclusive Academy · Autumn Term 2026',
      pills: [
        { label: '34 Pupils on Caseload', color: 'teal' as const },
        { label: '12 Active EHCPs', color: 'purple' as const },
      ],
    },
    parent: {
      title: 'Phoenix Carter · Parent Hub',
      subtitle: 'Dana Carter · Year 5 St. Jude’s Inclusive Academy',
      pills: [
        isHandoverAcknowledged
          ? { label: '✓ Read by Ms Johnson', color: 'green' as const }
          : { label: '⏳ Handover Sent · Awaiting Check-In', color: 'amber' as const },
        { label: '🎧 Noise Defenders in Bag', color: 'teal' as const },
      ],
    },
    child: {
      title: 'My Day · Phoenix Carter ⭐',
      subtitle: 'St. Jude’s Inclusive Academy · Year 5',
      pills: [{ label: '😊 Feeling Great', color: 'green' as const }],
    },
    ta: {
      title: 'Teaching Assistant View · Melissa Grant',
      subtitle: '1-to-1 Support Focus · Phoenix Carter',
      pills: [
        { label: '⚡ Phoenix: High Priority', color: 'red' as const },
        { label: '🎧 Headphones at Door (8:55am)', color: 'amber' as const },
      ],
      actionButton: {
        label: '+ Log Note',
        onClick: () => setIsObsModalOpen(true),
        icon: <Plus className="w-4 h-4" />,
      },
    },
    parentplus: {
      title: 'Parent Plus · Post-16 Pathways',
      subtitle: 'Longitudinal Strengths & Careers · Year 10+',
      pills: [{ label: 'Top Match: Game Design (92%)', color: 'gold' as const }],
    },
  }[activeView];

  return (
    <div className="min-h-screen bg-[#F7FAFB] text-[#1A3A4A] flex font-sans">
      <Sidebar activeView={activeView} onViewChange={setActiveView} />

      <main className="ml-64 min-h-screen flex flex-col">
        <TopBar
          title={topBarConfig.title}
          subtitle={topBarConfig.subtitle}
          pills={topBarConfig.pills}
          actionButton={topBarConfig.actionButton}
        />

        <div className="p-7 max-w-7xl w-full mx-auto flex-1 animate-in fade-in duration-200">
          {activeView === 'teacher' && (
            <TeacherView
              child={child}
              timeline={timeline}
              briefing={briefing}
              latestHandover={latestHandover}
              onRefreshBriefing={handleRefreshBriefing}
              onAcknowledgeHandover={handleAcknowledgeHandover}
              onOpenObservationModal={() => setIsObsModalOpen(true)}
              onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
            />
          )}

          {activeView === 'parent' && (
            <ParentView
              child={child}
              timeline={timeline}
              latestHandover={latestHandover}
              onSubmitHandover={handleSubmitHandover}
            />
          )}

          {activeView === 'senco' && (
            <SencoView
              child={child}
              timeline={timeline}
              onOpenDocModal={() => setIsDocModalOpen(true)}
              onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
            />
          )}

          {activeView === 'child' && (
            <ChildView
              child={child}
              onCheckIn={handleChildCheckIn}
            />
          )}

          {activeView === 'ta' && (
            <TaView
              child={child}
              timeline={timeline}
              onOpenObservationModal={() => setIsObsModalOpen(true)}
              onDirectLog={handleDirectLog}
            />
          )}

          {activeView === 'parentplus' && <ParentPlusView child={child} />}
        </div>
      </main>

      <ObservationModal
        isOpen={isObsModalOpen}
        onClose={() => setIsObsModalOpen(false)}
        onSubmit={handleLogObservation}
        childName={child.preferred_name || child.first_name}
      />

      <IncidentModal
        isOpen={isIncidentModalOpen}
        onClose={() => setIsIncidentModalOpen(false)}
        onSubmit={handleLogIncident}
        childName={child.preferred_name || child.first_name}
        childId={child.id}
      />

      <DocumentUploadModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        onSubmit={handleUploadDocument}
        childName={child.preferred_name || child.first_name}
      />
    </div>
  );
};

export default App;
