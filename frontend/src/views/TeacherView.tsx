import React, { useState } from 'react';
import { Child, ChildEvent, MorningBriefing } from '../types';
import { Sparkles, RefreshCw, AlertTriangle, CheckCircle2, ChevronDown, Plus } from 'lucide-react';

interface TeacherViewProps {
  child: Child;
  timeline: ChildEvent[];
  briefing: MorningBriefing | null;
  onRefreshBriefing: () => Promise<void>;
  onOpenObservationModal: () => void;
  onOpenIncidentModal?: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({
  child,
  timeline,
  briefing,
  onRefreshBriefing,
  onOpenObservationModal,
  onOpenIncidentModal,
}) => {
  const [refreshing, setRefreshing] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(true);

  const handleRefresh = async () => {
    setRefreshing(true);
    await onRefreshBriefing();
    setRefreshing(false);
  };

  const latestTransition = timeline.find((e) => e.event_type === 'Transition');

  return (
    <div className="space-y-6">
      {/* KPI Stats Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <div className="stat-card border-coral-dark">
          <div className="font-serif text-2xl font-bold text-coral-dark">
            {latestTransition?.transition_log?.morning_mood || 'Anxious'}
          </div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Morning Handover: {latestTransition?.transition_log?.sleep_quality || 'Restless'}
          </div>
        </div>

        <div className="stat-card border-amber-dark">
          <div className="font-serif text-2xl font-bold text-amber-dark">3</div>
          <div className="text-[11px] text-gray-500 mt-0.5 leading-snug">
            Sensory alerts needing attention today
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
            St. Jude's Inclusive Academy
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
            ⚡ Assembly Alert Today
          </span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-mint-pale text-teal">
            🎧 Noise Defenders
          </span>
          <span className="text-[10px] font-semibold px-2.5 py-1 rounded-lg bg-amber-light text-amber-dark">
            🥣 Breakfast Eaten
          </span>
          <button
            onClick={onOpenObservationModal}
            className="flex items-center gap-1.5 ml-2 bg-teal hover:bg-teal-medium text-white px-3 py-1.5 rounded-xl text-xs font-semibold shadow-xs transition-all active:scale-95"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Quick Observation</span>
          </button>
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

            {briefing && briefing.citations.length > 0 && (
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
                  <h4 className="text-xs font-bold text-navy">Proactive Support Alerts</h4>
                  <p className="text-[10px] text-gray-500">Live signals synced from parent handover</p>
                </div>
              </div>
              <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${alertsOpen ? 'rotate-180' : ''}`} />
            </div>

            {alertsOpen && (
              <div className="p-4 space-y-2.5 divide-y divide-gray-100 text-xs">
                <div className="pt-2 first:pt-0 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-coral-dark mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-navy">10:00am Whole-School Assembly:</span> Sensory load is high in the main hall. Noise defenders should be placed on Phoenix's desk beforehand.
                  </div>
                </div>
                <div className="pt-2.5 flex items-start gap-3">
                  <span className="w-2 h-2 rounded-full bg-amber-dark mt-1.5 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-navy">Restless Night:</span> Mother reported restless sleep (woke at 4:00am). Allow quiet recovery pauses if attention wanes in Lesson 2.
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
    </div>
  );
};
