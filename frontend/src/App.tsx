import React, { useState, useEffect } from 'react';
import {
  RoleView,
  Child,
  ChildEvent,
  MorningBriefing,
  IncidentSubmission,
  TransitionLogDetail,
  EmailPreview,
  UserProfile,
} from './types';
import { api, setApiRole } from './api';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { ObservationModal } from './components/ObservationModal';
import { IncidentModal } from './components/IncidentModal';
import { DocumentUploadModal } from './components/DocumentUploadModal';
import { WorksheetModal } from './components/WorksheetModal';
import { RegisterChildModal } from './components/RegisterChildModal';
import { ParentOnboardingModal } from './components/ParentOnboardingModal';
import { InvitationNotificationBanner } from './components/InvitationNotificationBanner';
import { LoginView } from './views/LoginView';
import { TeacherView } from './views/TeacherView';
import { ParentView } from './views/ParentView';
import { SencoView } from './views/SencoView';
import { ChildView } from './views/ChildView';
import { TaView } from './views/TaView';
import { ParentPlusView } from './views/ParentPlusView';
import { Plus } from 'lucide-react';

export const App: React.FC = () => {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [authChecking, setAuthChecking] = useState<boolean>(true);

  // Active Persona View (Locked to currentUser.role)
  const [activeView, setActiveView] = useState<RoleView>('senco');
  const [pupils, setPupils] = useState<Child[]>([]);
  const [child, setChild] = useState<Child | null>(null);
  const [timeline, setTimeline] = useState<ChildEvent[]>([]);
  const [briefing, setBriefing] = useState<MorningBriefing | null>(null);
  const [latestHandover, setLatestHandover] = useState<TransitionLogDetail | null>(null);
  const [loading, setLoading] = useState(false);

  // Modals state
  const [isObsModalOpen, setIsObsModalOpen] = useState(false);
  const [isIncidentModalOpen, setIsIncidentModalOpen] = useState(false);
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isWorksheetModalOpen, setIsWorksheetModalOpen] = useState(false);
  const [activeWorksheet, setActiveWorksheet] = useState('graphs');

  // Registration & Onboarding state
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isParentOnboardingOpen, setIsParentOnboardingOpen] = useState(false);
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [latestInvitation, setLatestInvitation] = useState<EmailPreview | null>(null);

  // Check existing session token on startup
  useEffect(() => {
    async function checkSession() {
      try {
        const user = await api.getCurrentUser();
        if (user) {
          setCurrentUser(user);
          setActiveView(user.role as RoleView);
          setApiRole(user.role === 'parentplus' ? 'parent' : user.role);
        }
      } catch (err) {
        console.error('Session check failed:', err);
      } finally {
        setAuthChecking(false);
      }
    }
    checkSession();
  }, []);

  // Sync API role when active view changes
  const handleViewChange = (view: RoleView) => {
    setActiveView(view);
    const backendRole = view === 'parentplus' ? 'parent' : view;
    setApiRole(backendRole);
  };

  // Switch active pupil
  const handleChildSelect = async (childId: string) => {
    const selected = pupils.find((p) => p.id === childId);
    if (!selected) return;
    setChild(selected);
    try {
      const [events, brief, handover] = await Promise.all([
        api.getTimeline(selected.id),
        api.getMorningBriefing(selected.id).catch(() => null),
        api.getLatestHandover(selected.id).catch(() => null),
      ]);
      setTimeline(events);
      setBriefing(brief);
      setLatestHandover(handover);
    } catch (err) {
      console.error('Error fetching child data:', err);
    }
  };

  // Load pupil, timeline, and morning handover when authenticated
  useEffect(() => {
    if (!currentUser) return;

    async function loadData() {
      try {
        setLoading(true);
        const pupilList = await api.getPupils();
        setPupils(pupilList);
        if (pupilList.length > 0) {
          let selected = pupilList[0];
          // If logged in as parent or pupil with linked child_id, select their child
          if (currentUser?.child_id) {
            const linked = pupilList.find((p) => p.id === currentUser.child_id);
            if (linked) selected = linked;
          }
          setChild(selected);

          const [events, brief, handover, recentInvites] = await Promise.all([
            api.getTimeline(selected.id),
            api.getMorningBriefing(selected.id).catch(() => null),
            api.getLatestHandover(selected.id).catch(() => null),
            api.getRecentInvitations().catch(() => []),
          ]);
          setTimeline(events);
          setBriefing(brief);
          setLatestHandover(handover);
          if (recentInvites && recentInvites.length > 0) {
            setLatestInvitation(recentInvites[0]);
          }
        }
      } catch (err) {
        console.error('Error connecting to backend:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentUser]);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    handleViewChange(user.role as RoleView);
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setChild(null);
  };

  const handleChildRegistered = async (newChildId: string) => {
    try {
      const pupilList = await api.getPupils();
      setPupils(pupilList);
      const recentInvites = await api.getRecentInvitations().catch(() => []);
      if (recentInvites && recentInvites.length > 0) {
        setLatestInvitation(recentInvites[0]);
      }
      if (newChildId) {
        await handleChildSelect(newChildId);
      }
    } catch (err) {
      console.error('Error refreshing after registration:', err);
    }
  };

  const handleOpenParentOnboarding = (token: string) => {
    setOnboardingToken(token);
    setIsParentOnboardingOpen(true);
  };

  const handleOnboardingCompleted = async (childId?: string, activatedRole?: string) => {
    if (childId) {
      await handleChildSelect(childId);
    }
    if (activatedRole) {
      handleViewChange(activatedRole as RoleView);
    }
  };

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
    const newEvent = await api.submitMorningHandover(child.id, handoverData, currentUser?.full_name || 'Dana Carter');
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

  const handleOpenWorksheet = (key: string) => {
    setActiveWorksheet(key);
    setIsWorksheetModalOpen(true);
  };

  const handleLogMilestone = async (title: string, summary: string) => {
    if (!child) return;
    const newEvent = await api.logEvent({
      child_id: child.id,
      school_id: child.school_id,
      event_type: 'Observation',
      reporter_type: currentUser?.role === 'ta' ? 'Teaching Assistant' : 'Teacher',
      reporter_name: currentUser?.full_name || 'Ms Johnson',
      title: title,
      summary: summary,
      significance: 'Notable Win',
      visibility: 'Shared',
      observation: {
        activity_context: 'Maths Adaptation',
        strategy_used: 'Visual-Spatial Learning Pathway',
        strategy_worked: true,
        strengths_observed: 'Spatial reasoning, gradient geometry, independent task completion',
      },
    });
    setTimeline([newEvent, ...timeline]);
  };

  const handleUploadDocument = async (title: string, docType: string, file: File) => {
    if (!child) return;
    await api.uploadDocument(child.id, title, docType, file);
  };

  const handleLogDeEscalation = async (data: {
    strategyName: string;
    category: string;
    worked: boolean;
    notes: string;
  }) => {
    if (!child) return;
    const newEvent = await api.logEvent({
      child_id: child.id,
      school_id: child.school_id,
      event_type: 'Observation',
      reporter_type: 'Teacher',
      reporter_name: currentUser?.full_name || 'Ms Clara Johnson',
      title: `In-the-Moment De-Escalation: ${data.strategyName}`,
      summary: data.notes,
      significance: data.worked ? 'Notable Win' : 'Routine Note',
      visibility: 'Shared',
      observation: {
        activity_context: 'Classroom Support (Room 4)',
        strategy_used: data.strategyName,
        strategy_worked: data.worked,
        notes: data.notes,
      },
    });
    setTimeline([newEvent, ...timeline]);
  };

  // 1. Initial Auth Check Spinner
  if (authChecking) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center space-y-3 text-white">
        <div className="w-10 h-10 rounded-full border-3 border-teal border-t-transparent animate-spin" />
        <div className="text-sm font-semibold text-slate-300">Checking See My Mind session...</div>
      </div>
    );
  }

  // 2. Unauthenticated: Render Login Layer
  if (!currentUser) {
    return (
      <>
        <LoginView
          onLoginSuccess={handleLoginSuccess}
          onOpenInvitation={handleOpenParentOnboarding}
        />
        <ParentOnboardingModal
          isOpen={isParentOnboardingOpen}
          token={onboardingToken}
          onClose={() => setIsParentOnboardingOpen(false)}
          onCompleted={handleOnboardingCompleted}
        />
      </>
    );
  }

  // 3. Authenticated: Render Single-Persona View
  if (loading || !child) {
    return (
      <div className="min-h-screen bg-[#F7FAFB] flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-teal border-t-transparent animate-spin" />
        <div className="text-sm font-bold text-navy font-serif">Connecting to See My Mind & NOYA AI...</div>
        <div className="text-xs text-gray-400">Loading {currentUser.full_name}&apos;s Workspace</div>
      </div>
    );
  }

  const isHandoverAcknowledged = latestHandover?.acknowledged_by_staff;
  const isBreakfastSkipped = latestHandover?.breakfast_eaten === false;

  const topBarConfig = {
    teacher: {
      title: `Good morning, ${currentUser.full_name} 👋`,
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
      title: `Inclusion & SEND Caseload · ${currentUser.full_name}`,
      subtitle: 'St. Jude’s Inclusive Academy · Autumn Term 2026',
      pills: [
        { label: `${pupils.length} Pupils on Caseload`, color: 'teal' as const },
        { label: '12 Active EHCPs', color: 'purple' as const },
      ],
      actionButton: {
        label: '+ Register SEND Pupil',
        onClick: () => setIsRegisterModalOpen(true),
        icon: <Plus className="w-4 h-4" />,
      },
    },
    parent: {
      title: `${child.preferred_name || child.first_name} ${child.last_name} · Parent Hub`,
      subtitle: `${currentUser.full_name} · St. Jude’s Inclusive Academy`,
      pills: [
        isHandoverAcknowledged
          ? { label: '✓ Read by Ms Johnson', color: 'green' as const }
          : { label: '⏳ Handover Sent · Awaiting Check-In', color: 'amber' as const },
        { label: '🎧 Noise Defenders in Bag', color: 'teal' as const },
      ],
    },
    child: {
      title: `My Day · ${child.preferred_name || child.first_name} ⭐`,
      subtitle: 'St. Jude’s Inclusive Academy · Pupil Voice',
      pills: [{ label: '😊 Feeling Great', color: 'green' as const }],
    },
    ta: {
      title: `Teaching Assistant View · ${currentUser.full_name}`,
      subtitle: `1-to-1 Support Focus · ${child.preferred_name || child.first_name}`,
      pills: [
        { label: `⚡ ${child.preferred_name || child.first_name}: High Priority`, color: 'red' as const },
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
      <Sidebar
        activeView={activeView}
        currentUser={currentUser}
        onLogout={handleLogout}
        onSwitchPersona={handleLogout}
        onRegisterChild={() => setIsRegisterModalOpen(true)}
      />

      <main className="ml-64 min-h-screen flex flex-col flex-1">
        <InvitationNotificationBanner
          onOpenInvitation={handleOpenParentOnboarding}
          latestInvitation={latestInvitation}
        />

        <TopBar
          title={topBarConfig.title}
          subtitle={topBarConfig.subtitle}
          pills={topBarConfig.pills}
          actionButton={topBarConfig.actionButton}
          pupils={currentUser.role === 'senco' || currentUser.role === 'teacher' ? pupils : undefined}
          selectedChildId={child.id}
          onSelectChild={handleChildSelect}
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
              onOpenWorksheet={handleOpenWorksheet}
              onLogMilestone={handleLogMilestone}
              onLogDeEscalation={handleLogDeEscalation}
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
              onRegisterChild={() => setIsRegisterModalOpen(true)}
            />
          )}

          {activeView === 'child' && (
            <ChildView
              child={child}
              onCheckIn={handleChildCheckIn}
              onOpenWorksheet={handleOpenWorksheet}
            />
          )}

          {activeView === 'ta' && (
            <TaView
              child={child}
              timeline={timeline}
              onOpenObservationModal={() => setIsObsModalOpen(true)}
              onDirectLog={handleDirectLog}
              onOpenWorksheet={handleOpenWorksheet}
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

      <WorksheetModal
        isOpen={isWorksheetModalOpen}
        onClose={() => setIsWorksheetModalOpen(false)}
        initialWorksheet={activeWorksheet}
        onCompleteStep={handleLogMilestone}
      />

      <RegisterChildModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onRegistered={handleChildRegistered}
        onOpenParentOnboarding={handleOpenParentOnboarding}
      />

      <ParentOnboardingModal
        isOpen={isParentOnboardingOpen}
        token={onboardingToken}
        onClose={() => setIsParentOnboardingOpen(false)}
        onCompleted={handleOnboardingCompleted}
      />
    </div>
  );
};

export default App;
