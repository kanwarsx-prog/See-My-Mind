import React, { useState, useEffect } from 'react';
import { RoleView, Child, ChildEvent, MorningBriefing, IncidentSubmission } from './types';
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
  const [loading, setLoading] = useState(true);
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);

  // Load pupil and timeline from live backend
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const pupils = await api.getPupils();
        if (pupils.length > 0) {
          const selected = pupils[0]; // Phoenix Carter
          setChild(selected);

          const [events, brief] = await Promise.all([
            api.getTimeline(selected.id),
            api.getMorningBriefing(selected.id).catch(() => null),
          ]);
          setTimeline(events);
          setBriefing(brief);
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

  const handleSubmitHandover = async (handoverData: any) => {
    if (!child) return;
    const newEvent = await api.submitMorningHandover(child.id, handoverData);
    setTimeline([newEvent, ...timeline]);
    await handleRefreshBriefing();
  };

  const handleChildCheckIn = async (checkInData: any) => {
    if (!child) return;
    const newEvent = await api.logCheckIn(child.id, checkInData);
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

  const topBarConfig = {
    teacher: {
      title: 'Good morning, Ms Johnson 👋',
      subtitle: 'Wednesday 22 October 2026 · Year 5 · Room 4',
      pills: [
        { label: '⚡ Assembly 10:00am', color: 'red' as const },
        { label: '⏰ Medication Taken', color: 'amber' as const },
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
        { label: '✓ Handover Sent (7:45am)', color: 'green' as const },
        { label: 'Noise Defenders in Bag', color: 'teal' as const },
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
      pills: [{ label: 'Noise Defenders Prepared', color: 'amber' as const }],
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
              onRefreshBriefing={handleRefreshBriefing}
              onOpenObservationModal={() => setIsObsModalOpen(true)}
              onOpenIncidentModal={() => setIsIncidentModalOpen(true)}
            />
          )}

          {activeView === 'parent' && (
            <ParentView
              child={child}
              timeline={timeline}
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
