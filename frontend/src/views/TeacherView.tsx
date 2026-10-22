import React, { useState } from 'react';
import { Child, ChildEvent, MorningBriefing, TransitionLogDetail } from '../types';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, Plus, Clock } from 'lucide-react';
import { AdaptedPathwayCard } from '../components/AdaptedPathwayCard';
import { DeEscalationPalette } from '../components/DeEscalationPalette';
import { ClassSendMatrix } from '../components/ClassSendMatrix';

interface TeacherViewProps {
  child: Child;
  timeline: ChildEvent[];
  briefing: MorningBriefing | null;
  latestHandover?: TransitionLogDetail | null;
  onRefreshBriefing: () => Promise<void>;
  onAcknowledgeHandover?: (transitionId: string) => Promise<void>;
  onOpenObservationModal: () => void;
  onOpenIncidentModal?: () => void;
  onOpenWorksheet: (worksheetKey: string) => void;
  onLogMilestone?: (milestoneTitle: string, note: string) => Promise<void>;
  onLogDeEscalation?: (data: {
    strategyName: string;
    category: string;
    worked: boolean;
    notes: string;
  }) => Promise<void>;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  child,
  timeline,
  briefing,
  latestHandover,
  onRefreshBriefing,
  onAcknowledgeHandover,
  onOpenObservationModal,
  onOpenIncidentModal,
  onOpenWorksheet,
  onLogMilestone,
  onLogDeEscalation,
}) => {
  const [activeTab, setActiveTab] = useState<'focused' | 'matrix'>('focused');
  const [refreshing, setRefreshing] = useState(false);
  const [acknowledging, setAcknowledging] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshBriefing();
    setRefreshing(false);
  };

  const handleLogStrategyResult = async (data: {
    strategyName: string;
    category: string;
    worked: boolean;
    notes: string;
  }) => {
    if (onLogDeEscalation) {
      await onLogDeEscalation(data);
    } else if (onLogMilestone && data.worked) {
      await onLogMilestone(`De-Escalation Success: ${data.strategyName}`, data.notes);
    }
  };

  // Resolve handover from prop or timeline
  const timelineHandover = timeline.find((e) => e.event_type === 'Transition')?.transition_log;
  const effectiveHandover = latestHandover || timelineHandover;

  const handleAcknowledge = async () => {
    if (!effectiveHandover || !onAcknowledgeHandover) return;
    setAcknowledging(true);
    try {
      await onAcknowledgeHandover(effectiveHandover.id);
    } catch (err) {
      console.error(err);
    } finally {
      setAcknowledging(false);
    }
  };

  const ackTimeFormatted = effectiveHandover?.acknowledged_at
    ? new Date(effectiveHandover.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '8:48am';

  return (
    <div className="space-y-6">
      {/* Top Level View Switcher: 1:1 Support Focus vs Room 4 SEND Matrix */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 bg-white p-2.5 rounded-2xl border border-gray-100 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('focused')}
            className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'focused'
                ? 'bg-teal text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:text-navy hover:bg-gray-100'
            }`}
          >
            <span>🧒</span>
            <span>{child.preferred_name || child.first_name || 'Phoenix'} Carter · 1:1 Focus</span>
          </button>

          <button
            onClick={() => setActiveTab('matrix')}
            className={`px-3.5 py-2.5 sm:py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === 'matrix'
                ? 'bg-navy text-white shadow-xs'
                : 'bg-gray-50 text-gray-600 hover:text-navy hover:bg-gray-100'
            }`}
          >
            <span>🏫</span>
            <span>Room 4 SEND Matrix (4 Pupils)</span>
          </button>
        </div>

        <div className="text-[11px] text-gray-400 font-medium px-2 hidden sm:block">
          {activeTab === 'focused' ? 'Personalized EHCP interventions' : 'Whole-class differentiated adaptations'}
        </div>
      </div>

      {activeTab === 'matrix' ? (
        <ClassSendMatrix onSelectPupil={() => setActiveTab('focused')} />
      ) : (
        <>
          {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="stat-card border-coral-dark">
          <div className="font-serif text-2xl font-bold text-coral-dark">
            {effectiveHandover?.morning_mood || 'Anxious'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Sleep: {effectiveHandover?.sleep_quality || 'Restless (woke at 4am)'}
          </div>
        </div>

        <div className="stat-card border-amber-dark">
          <div className="font-serif text-2xl font-bold text-amber-dark">3</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Active alerts needing attention today
          </div>
        </div>

        <div className="stat-card border-emerald-600">
          <div className="font-serif text-2xl font-bold text-emerald-700">92%</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Strategy effectiveness this week
          </div>
        </div>

        <div className="stat-card border-gold">
          <div className="font-serif text-2xl font-bold text-amber-600">Year 5</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            St. Jude's Inclusive Academy · Room 4
          </div>
        </div>
      </div>

      {/* Pupil Profile Banner */}
      <div className="card p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-l-4 border-l-purple-dark">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-coral-light/60 flex items-center justify-center text-2xl shadow-inner">
            🧒
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-serif font-bold text-navy">{child.full_name || 'Phoenix Carter'}</h2>
              <span className="bg-purple-light text-purple-dark text-[10px] font-bold px-2 py-0.5 rounded-full">
                EHCP Active
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-0.5">
              Year 5 · {child.support_profile?.primary_need || 'Autism Spectrum Condition'} · Communication: Visual Task Cards
            </p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Emergency Contact: Mum (Dana Carter) · 07700 900123
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-coral-light text-coral-dark">
            ⚡ Assembly Alert 9:05am
          </span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-mint-pale text-teal">
            🎧 Noise Defenders
          </span>
          <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-lg ${
            effectiveHandover?.breakfast_eaten === false
              ? 'bg-coral-light text-coral-dark'
              : 'bg-amber-light text-amber-dark'
          }`}>
            {effectiveHandover?.breakfast_eaten === false ? '🍽 Skipped Breakfast' : '🥣 Breakfast Eaten'}
          </span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-purple-light text-purple-dark">
            💊 Meds Taken (Week 1)
          </span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-gold-light text-[#7A5A00]">
            🎮 Goal: Game Designer
          </span>
          <button
            onClick={onOpenObservationModal}
            className="flex items-center gap-1.5 ml-2 bg-teal hover:bg-teal-medium text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Observation</span>
          </button>
        </div>
      </div>

      {/* ⭐ PRE-FLIGHT MORNING HANDOVER & OPERATIONAL RISK CARD */}
      <div className={`card p-5 border-l-4 transition-all ${
        effectiveHandover?.acknowledged_by_staff
          ? 'border-l-emerald-600 bg-white'
          : 'border-l-amber-dark bg-amber-50/25 border-amber-200'
      }`}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
              effectiveHandover?.acknowledged_by_staff ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-light text-amber-dark'
            }`}>
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-navy">Pre-Flight Morning Handover · Dana Carter (Mum)</h3>
                {effectiveHandover?.acknowledged_by_staff ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                    ✓ Read Receipt Delivered
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-light text-coral-dark animate-pulse">
                    🔔 Needs Teacher Acknowledgment
                  </span>
                )}
              </div>
              <p className="text-[11px] text-gray-500">Submitted at 8:47am · Direct home-to-classroom loop</p>
            </div>
          </div>

          {effectiveHandover && !effectiveHandover.acknowledged_by_staff ? (
            <button
              onClick={handleAcknowledge}
              disabled={acknowledging}
              className="w-full sm:w-auto px-4 py-2.5 sm:py-2 bg-teal hover:bg-teal-medium text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <CheckCircle2 className="w-4 h-4 text-mint" />
              <span>{acknowledging ? 'Acknowledging...' : '✓ Acknowledge Handover — Notify Mum'}</span>
            </button>
          ) : (
            <div className="w-full sm:w-auto text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-2 sm:py-1.5 rounded-xl border border-emerald-200 flex items-center justify-center sm:justify-start gap-1.5 flex-shrink-0">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Acknowledged by Ms Johnson at {ackTimeFormatted}</span>
            </div>
          )}
        </div>

        {/* Handover Data Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-3 border-b border-gray-100">
          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Sleep Quality</div>
            <div className="text-xs font-bold text-navy mt-0.5">
              {effectiveHandover?.sleep_quality || 'Restless (woke at 4am)'}
            </div>
          </div>
          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Morning Mood</div>
            <div className="text-xs font-bold text-navy mt-0.5">
              {effectiveHandover?.morning_mood || 'Anxious / Apprehensive'}
            </div>
          </div>
          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Breakfast Status</div>
            <div className={`text-xs font-bold mt-0.5 ${
              effectiveHandover?.breakfast_eaten === false ? 'text-coral-dark' : 'text-emerald-700'
            }`}>
              {effectiveHandover?.breakfast_eaten === false ? '⚠️ Skipped (Dip Risk)' : '🥣 Breakfast Eaten'}
            </div>
          </div>
          <div className="bg-gray-50/80 p-2.5 rounded-xl border border-gray-100">
            <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Medication</div>
            <div className="text-xs font-bold text-teal mt-0.5">
              {effectiveHandover?.medication_given ? '💊 Taken at 8:30am' : '⚠️ Not Taken'}
            </div>
          </div>
        </div>

        {/* Parent Notes & Status Note */}
        <div className="pt-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="text-gray-700">
            <span className="font-bold text-navy">Mum's Note: </span>
            <span className="italic">
              "{effectiveHandover?.special_notes_for_day || 'Worried about assembly noise. Noise defenders packed in his bag.'}"
            </span>
          </div>

          {!effectiveHandover?.acknowledged_by_staff ? (
            <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/60 flex-shrink-0">
              💡 Dana's app will update with a read receipt instantly when acknowledged
            </div>
          ) : (
            <div className="text-[11px] text-emerald-700 font-medium flex-shrink-0">
              ✓ Dana's app shows: "Read by Ms Johnson at {ackTimeFormatted}"
            </div>
          )}
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: NOYA AI & Alerts */}
        <div className="lg:col-span-7 space-y-5">
          {/* NOYA Intelligence Insight Block */}
          <div className="noya-block relative overflow-hidden">
            <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-mint/20 flex items-center justify-center">
                  <Sparkles className="w-3.5 h-3.5 text-mint" />
                </div>
                <span className="font-serif text-sm font-semibold text-white tracking-wide">
                  NOYA · Morning Transition Intelligence
                </span>
              </div>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="flex items-center gap-1.5 text-[11px] font-medium text-white/70 hover:text-white bg-white/10 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3 h-3 ${refreshing ? 'animate-spin' : ''}`} />
                <span>{refreshing ? 'Synthesizing...' : 'Re-generate'}</span>
              </button>
            </div>

            <div className="text-xs text-white/90 leading-relaxed space-y-2 whitespace-pre-line font-normal">
              {briefing ? (
                briefing.summary_markdown
              ) : (
                <p>Loading real-time arrival intelligence from Supabase...</p>
              )}
            </div>

            {briefing && briefing.citations && briefing.citations.length > 0 && (
              <div className="mt-3.5 pt-2.5 border-t border-white/10 flex items-center gap-2 text-[10px] text-white/50">
                <span className="font-bold uppercase tracking-wider text-white/70">Verified Citations:</span>
                <span className="truncate">{briefing.citations.map((c) => c.citation_text).join(' · ')}</span>
              </div>
            )}
          </div>

          {/* Today's Alerts Card */}
          <div className="card overflow-hidden">
            <div
              onClick={() => setAlertsOpen(!alertsOpen)}
              className="p-4 flex items-center justify-between cursor-pointer hover:bg-gray-50/50 transition-colors border-b border-gray-100"
            >
              <div className="flex items-center gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-dark" />
                <div>
                  <h4 className="text-xs font-bold text-navy">Today's Support Alerts</h4>
                  <p className="text-[10px] text-gray-500">Live signals synced from parent handover & sensory profile</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${alertsOpen ? 'rotate-180' : ''}`} />
            </div>

            {alertsOpen && (
              <div className="p-4 space-y-2.5 divide-y divide-gray-100 text-xs">
                <div className="pt-2 first:pt-0 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-coral-dark mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-navy">9:05am Whole-School Assembly:</span> Sensory load is peak in the main hall. Noise defenders should be offered at classroom door before moving to the hall. Buddy pairing with Jake O'Brien active.
                  </div>
                </div>
                <div className="pt-2.5 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-dark mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-navy">Restless Night (4:00am wake-up):</span> Dana reported disturbed sleep. Potential attention dip around 10:00am. Provide a 5-min movement pause if fidgeting escalates.
                  </div>
                </div>
                <div className="pt-2.5 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-emerald-600 mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-navy">Science Win Yesterday:</span> Demonstrated leadership in water density practical with Visual Task Cards. Strategy validated!
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-Time Sensory De-Escalation Palette */}
          <DeEscalationPalette
            pupilName={child.preferred_name || child.first_name || 'Phoenix'}
            onLogStrategyResult={handleLogStrategyResult}
          />

          {/* Adapted Learning Pathway — This Lesson */}
          <AdaptedPathwayCard
            onOpenWorksheet={onOpenWorksheet}
            onLogMilestone={onLogMilestone}
          />
        </div>

        {/* Right Column: Live Timeline of Events */}
        <div className="lg:col-span-5 space-y-4">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
              <h3 className="text-xs font-bold text-navy uppercase tracking-wider">Live Pupil Timeline</h3>
              <div className="flex items-center gap-2">
                {onOpenIncidentModal && (
                  <button
                    onClick={onOpenIncidentModal}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-bold bg-coral-light text-coral-dark rounded-lg hover:bg-coral-200 cursor-pointer transition-all"
                  >
                    <span>+ Log ABC</span>
                  </button>
                )}
                <span className="text-[10px] text-gray-400">Synced to Supabase</span>
              </div>
            </div>

            <div className="space-y-3.5 max-h-[500px] overflow-y-auto pr-1">
              {timeline.length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">No events logged yet.</p>
              ) : (
                timeline.map((evt) => (
                  <div key={evt.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-navy">{evt.title}</span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(evt.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{evt.summary}</p>
                    <div className="flex items-center justify-between text-[10px] text-gray-400 pt-1 border-t border-gray-200/60 mt-1.5">
                      <span>By {evt.reporter_name || evt.reporter_type}</span>
                      {evt.observation?.strategy_worked !== undefined && (
                        <span className="flex items-center gap-1 font-semibold text-emerald-700">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Strategy Worked</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
