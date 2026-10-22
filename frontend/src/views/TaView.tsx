import React, { useState } from 'react';
import { Child, ChildEvent } from '../types';
import { Plus, Sparkles, Clock, CheckCircle2, MessageSquare } from 'lucide-react';

interface TaViewProps {
  child: Child;
  timeline: ChildEvent[];
  onOpenObservationModal: () => void;
  onDirectLog?: (data: any) => Promise<void>;
  onOpenWorksheet?: (worksheetKey: string) => void;
}

export const TaView: React.FC<TaViewProps> = ({ child, timeline, onOpenObservationModal, onDirectLog, onOpenWorksheet }) => {
  const [selectedPupil, setSelectedPupil] = useState('Phoenix');
  const [logType, setLogType] = useState('⭐ Learning win');
  const [logNotes, setLogNotes] = useState('');
  const [logging, setLogging] = useState(false);
  const [loggedSuccess, setLoggedSuccess] = useState(false);

  const handleQuickLog = async () => {
    if (!logNotes.trim()) return;
    setLogging(true);
    try {
      if (onDirectLog) {
        await onDirectLog({
          title: `TA Note (${selectedPupil}): ${logType}`,
          summary: logNotes,
          event_type: 'Observation',
          reporter_type: 'Teaching Assistant',
          reporter_name: 'Melissa Grant',
          significance: logType.includes('Learning') ? 'Notable Win' : 'Routine Note',
          visibility: 'Shared',
          observation: {
            activity_context: 'Classroom Support',
            strategy_used: '1-to-1 Support Protocol',
            strategy_worked: !logType.includes('Struggling') && !logType.includes('Incident'),
            notes: logNotes,
          },
        });
        setLogNotes('');
        setLoggedSuccess(true);
        setTimeout(() => setLoggedSuccess(false), 4000);
      } else {
        onOpenObservationModal();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLogging(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* TA Header */}
      <div id="ta-support-hub" className="card p-5 border-l-4 border-l-green bg-white scroll-mt-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-green-light flex items-center justify-center font-bold text-green text-base shadow-xs">
              MG
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-navy">Melissa Grant · Teaching Assistant Support</h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-light text-emerald-800">
                  Year 5 Room 4
                </span>
              </div>
              <p className="text-xs text-gray-500">1-to-1 Key Worker for {child.full_name || 'Phoenix Carter'} · St. Jude's Academy</p>
            </div>
          </div>
          <button
            onClick={onOpenObservationModal}
            className="flex items-center gap-1.5 bg-green hover:bg-emerald-600 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Detailed Observation</span>
          </button>
        </div>
      </div>

      {/* NOYA Briefing for TA */}
      <div className="noya-block">
        <div className="flex items-center gap-2 mb-2 pb-1.5 border-b border-white/10">
          <Sparkles className="w-3.5 h-3.5 text-mint" />
          <span className="font-serif text-xs font-semibold text-white tracking-wide">
            NOYA · Your Morning Briefing for Phoenix
          </span>
        </div>
        <p className="text-xs text-white/90 leading-relaxed font-normal">
          Phoenix: skipped breakfast at home, took methylphenidate at 8:30am. <strong className="text-mint">Position yourself near the classroom door for arrival at 8:55am</strong>. Offer noise defenders before he reaches the main corridor. Dip window is 10:00–10:30am — water and crackers need to be ready. Today's maths uses a game design hook for gradient slopes — he should engage strongly once it clicks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Assigned Pupils & Quick Log */}
        <div className="lg:col-span-6 space-y-5">
          {/* Today's Assigned Pupils */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-navy">Today's Assigned Pupils</h3>
                <p className="text-[10px] text-gray-500">Priority order · with immediate operational actions</p>
              </div>
              <span className="text-[10px] font-bold text-coral-dark bg-coral-light px-2 py-0.5 rounded-md">
                3 Pupils
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-coral-50/50 border border-coral-200/60 rounded-xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-coral-dark text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    PC
                  </div>
                  <div>
                    <div className="font-bold text-navy">Phoenix Carter — High Priority</div>
                    <div className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      Skipped breakfast · medication dip 10–10:30am · headphones at door · game design maths today
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-coral-dark bg-coral-light px-2 py-1 rounded-md flex-shrink-0">
                  Act Now
                </span>
              </div>

              <div className="p-3 bg-amber-50/30 border border-amber-200/50 rounded-xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-dark text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    RP
                  </div>
                  <div>
                    <div className="font-bold text-navy">Riya Patel — Watch</div>
                    <div className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      Movement break at step 2 of maths pathway · monitor lunch transition for masking
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-dark bg-amber-light px-2 py-1 rounded-md flex-shrink-0">
                  Watch
                </span>
              </div>

              <div className="p-3 bg-emerald-50/30 border border-emerald-200/50 rounded-xl flex items-start justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5">
                    JO
                  </div>
                  <div>
                    <div className="font-bold text-navy">Jake O'Brien — Stable</div>
                    <div className="text-[11px] text-gray-600 mt-0.5 leading-snug">
                      Buddy pairing with Phoenix in assembly · settled this week · 82% maths pathway progress
                    </div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-1 rounded-md flex-shrink-0">
                  Stable
                </span>
              </div>
            </div>
          </div>

          {/* Quick Log (<45 seconds) */}
          <div id="ta-quick-log" className="card p-5 space-y-3.5 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <h3 className="text-sm font-bold text-navy">Fast Micro-Log (&lt; 45s)</h3>
                <p className="text-[10px] text-gray-500">Syncs immediately to Ms Johnson & SENCO timeline</p>
              </div>
              <span className="text-[10px] font-bold text-teal bg-mint-pale px-2 py-0.5 rounded-md">
                Live Sync
              </span>
            </div>

            {loggedSuccess && (
              <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-emerald-800 text-xs animate-in zoom-in-95">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Micro-log saved to timeline and synced with Ms Johnson!</span>
              </div>
            )}

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                Select Pupil
              </label>
              <div className="flex gap-2">
                {['Phoenix', 'Riya', 'Jake'].map((name) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedPupil(name)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      selectedPupil === name
                        ? 'bg-navy text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                What happened?
              </label>
              <div className="flex flex-wrap gap-1.5">
                {['😄 Positive', '😐 Mixed', '😟 Struggling', '⭐ Learning win', '🔴 Incident'].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setLogType(tag)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      logType === tag
                        ? 'bg-teal text-white shadow-xs'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                rows={2}
                value={logNotes}
                onChange={(e) => setLogNotes(e.target.value)}
                placeholder="e.g. Phoenix drew gradient triangle independently at 10:45 — unprompted. Game design framing worked."
                className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-teal"
              />
            </div>

            <button
              onClick={handleQuickLog}
              disabled={logging || !logNotes.trim()}
              className="w-full py-2 px-4 bg-teal hover:bg-teal-medium disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{logging ? 'Saving...' : 'Log Now'}</span>
            </button>
          </div>

          {/* Recent Classroom Notes */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-green" />
                <h3 className="text-sm font-bold text-navy">Recent Classroom Notes for {child.preferred_name || 'Phoenix'}</h3>
              </div>
              <span className="text-[10px] text-gray-400">Classroom Feed</span>
            </div>

            <div className="space-y-2.5 max-h-[220px] overflow-y-auto pr-1">
              {timeline.slice(0, 3).map((evt) => (
                <div key={evt.id} className="p-2.5 bg-gray-50 rounded-xl text-xs space-y-1 border border-gray-100">
                  <div className="flex justify-between font-bold text-navy">
                    <span>{evt.title}</span>
                    <span className="text-gray-400 text-[10px]">
                      {new Date(evt.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">{evt.summary}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: High-Risk Schedule Flagged */}
        <div className="lg:col-span-6 space-y-5">
          {/* Today's Schedule — High-Risk Moments Flagged (Prototype v2) */}
          <div id="ta-high-risk-schedule" className="card p-5 space-y-3 scroll-mt-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-coral-dark" />
                <div>
                  <h3 className="text-sm font-bold text-navy">Today's Schedule — High-Risk Moments</h3>
                  <p className="text-[10px] text-gray-500">What to watch · When · What to do</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-coral-dark bg-coral-light px-2 py-0.5 rounded-md">
                SEND Protocol
              </span>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-coral-50/40 border border-coral-200/60 flex items-start gap-3">
                <span className="font-mono font-bold text-coral-dark text-xs bg-white px-2 py-1 rounded-lg shadow-2xs flex-shrink-0">
                  8:55am
                </span>
                <div>
                  <div className="font-bold text-navy flex items-center gap-1.5">
                    <span>⚡ Door Arrival</span>
                    <span className="text-[10px] text-coral-dark font-semibold bg-coral-light px-1.5 py-0.2 rounded">Critical</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">
                    Position at classroom door. Offer Phoenix headphones <em>before</em> he reaches the hall. Don't wait until he is already in the crowd noise.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/40 border border-amber-200/60 flex items-start gap-3">
                <span className="font-mono font-bold text-amber-dark text-xs bg-white px-2 py-1 rounded-lg shadow-2xs flex-shrink-0">
                  9:05am
                </span>
                <div>
                  <div className="font-bold text-navy">Assembly</div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">
                    Stay close to Phoenix. Watch for covering ears, rocking. Exit route: quiet corridor, chair outside room 4. Jake O'Brien is his buddy — keep them seated together.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-mint-pale/50 border border-mint/40 flex items-start gap-3">
                <span className="font-mono font-bold text-teal text-xs bg-white px-2 py-1 rounded-lg shadow-2xs flex-shrink-0">
                  9:45am
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div className="font-bold text-navy">Maths — Adapted Visual Path Active</div>
                    {onOpenWorksheet && (
                      <button
                        type="button"
                        onClick={() => onOpenWorksheet('graphs')}
                        className="text-[10px] font-bold text-teal hover:underline cursor-pointer"
                      >
                        Open Worksheet →
                      </button>
                    )}
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">
                    Phoenix doing visual-spatial gradient route (game design hook). Riya needs movement break at step 2. Archie needs verbal walkthrough support.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-coral-50/40 border border-coral-200/60 flex items-start gap-3">
                <span className="font-mono font-bold text-coral-dark text-xs bg-white px-2 py-1 rounded-lg shadow-2xs flex-shrink-0">
                  10:00am
                </span>
                <div>
                  <div className="font-bold text-navy flex items-center gap-1.5">
                    <span>⚡ Medication Dip Window</span>
                    <span className="text-[10px] text-coral-dark font-semibold bg-coral-light px-1.5 py-0.2 rounded">Risk</span>
                  </div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">
                    Have crackers and water ready for Phoenix before 10am. Do not wait for him to ask. Signs: sweating, fidgeting, tummy pain. Do not interpret restlessness as defiance.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-3">
                <span className="font-mono font-bold text-gray-600 text-xs bg-white px-2 py-1 rounded-lg shadow-2xs flex-shrink-0">
                  12:00pm
                </span>
                <div>
                  <div className="font-bold text-navy">Lunch Transition</div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">
                    Monitor Riya at transition — 2 incidents at lunch this week. Watch for masking in classroom vs distress at unstructured times.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/30 border border-emerald-200/50 flex items-start gap-3">
                <span className="font-mono font-bold text-emerald-700 text-xs bg-white px-2 py-1 rounded-lg shadow-2xs flex-shrink-0">
                  3:20pm
                </span>
                <div>
                  <div className="font-bold text-navy">Home Time & Parent Sync</div>
                  <p className="text-gray-600 mt-1 leading-relaxed text-[11px]">
                    Brief parent handover for Phoenix. Day summary auto-sent to Dana Carter. Confirm any wins from maths practical.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
