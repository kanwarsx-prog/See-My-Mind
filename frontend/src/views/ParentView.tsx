import React, { useState } from 'react';
import { Child, ChildEvent, TransitionLogDetail } from '../types';
import { Heart, Send, CheckCircle2, Clock, Sparkles } from 'lucide-react';

interface ParentViewProps {
  child: Child;
  timeline: ChildEvent[];
  latestHandover?: TransitionLogDetail | null;
  onSubmitHandover: (data: any) => Promise<void>;
}

export const ParentView: React.FC<ParentViewProps> = ({
  child,
  timeline,
  latestHandover,
  onSubmitHandover,
}) => {
  const [sleep, setSleep] = useState('Restless (woke in night)');
  const [mood, setMood] = useState('Anxious');
  const [breakfast, setBreakfast] = useState(false);
  const [meds, setMeds] = useState(true);
  const [notes, setNotes] = useState('Worried about assembly noise. Noise defenders packed in his bag.');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fallback to timeline if latestHandover prop is null
  const timelineHandover = timeline.find((e) => e.event_type === 'Transition')?.transition_log;
  const effectiveHandover = latestHandover || timelineHandover;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmitHandover({
        sleep_quality: sleep,
        morning_mood: mood,
        breakfast_eaten: breakfast,
        medication_given: meds,
        special_notes_for_day: notes,
      });
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 6000);
    } catch (err) {
      console.error(err);
      alert('Failed to send handover to school.');
    } finally {
      setLoading(false);
    }
  };

  const ackTime = effectiveHandover?.acknowledged_at
    ? new Date(effectiveHandover.acknowledged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    : '8:48am';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Welcome & Live Status Header */}
      <div className="card p-6 bg-gradient-to-r from-amber-light/30 via-white to-mint/20 border-l-4 border-l-amber-dark">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">👩‍👦</span>
              <h2 className="text-xl font-serif font-bold text-navy">Welcome, Dana Carter</h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Direct connection with Ms Johnson & St. Jude's Academy for {child.full_name || 'Phoenix'}
            </p>
          </div>
          <div className="text-left sm:text-right text-xs text-gray-500">
            <span className="font-semibold text-navy">Today: </span>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      {/* ⭐ LIVE HANDOVER RECEIPT / STATUS BANNER */}
      {effectiveHandover?.acknowledged_by_staff ? (
        <div className="card p-5 bg-gradient-to-r from-emerald-50 via-white to-mint-pale border-l-4 border-l-emerald-600 shadow-xs animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-700 flex-shrink-0 mt-0.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-navy">
                  Handover Read by Ms Johnson at {ackTime}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  ✓ Phoenix Welcomed in Room 4
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Ms Johnson has acknowledged your morning notes. Noise defenders are on Phoenix's desk for the 9:05am assembly, and TA Melissa Grant has crackers and water ready for his 10:00am medication window.
              </p>
            </div>
          </div>
        </div>
      ) : effectiveHandover ? (
        <div className="card p-5 bg-gradient-to-r from-amber-50 via-white to-amber-50/30 border-l-4 border-l-amber-dark shadow-xs animate-in fade-in duration-300">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-light flex items-center justify-center text-amber-dark flex-shrink-0 mt-0.5">
              <Clock className="w-5 h-5 text-amber-dark" />
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-bold text-navy">
                  Handover Sent · Awaiting Teacher Registration Check-In
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-coral-light text-coral-dark animate-pulse">
                  Transmitted to School
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-1 leading-relaxed">
                Your notes about sleep, breakfast, and assembly noise have been delivered to Room 4. You will see an instant confirmation receipt here the second Ms Johnson opens her morning briefing.
              </p>
            </div>
          </div>
        </div>
      ) : null}

      {/* 4-STAGE MOOD ARC (PROTOTYPE DESIGN) */}
      <div className="card p-5 bg-gradient-to-br from-navy via-navy-light to-navy text-white rounded-2xl overflow-hidden relative shadow-md">
        <div className="absolute right-4 top-2 text-6xl opacity-5 select-none">🧒</div>
        <div className="font-serif text-base font-bold text-white mb-1">Phoenix's Day at a Glance</div>
        <p className="text-[11px] text-white/60 mb-4">Real-time emotional progression · St. Jude's Academy</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl text-center border border-white/10">
            <div className="text-2xl mb-1">😐</div>
            <div className="text-[10px] text-white/60 uppercase font-semibold">Morning</div>
            <div className="text-xs font-bold text-coral-light">Tricky Start</div>
            <div className="text-[10px] text-white/50 mt-0.5">Restless sleep</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl text-center border border-white/10">
            <div className="text-2xl mb-1">🙂</div>
            <div className="text-[10px] text-white/60 uppercase font-semibold">Assembly (9:05)</div>
            <div className="text-xs font-bold text-amber-light">Headphones Helped</div>
            <div className="text-[10px] text-white/50 mt-0.5">Buddy with Jake</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl text-center border border-white/10">
            <div className="text-2xl mb-1">⭐</div>
            <div className="text-[10px] text-white/60 uppercase font-semibold">Maths (10:45)</div>
            <div className="text-xs font-bold text-mint">Breakthrough!</div>
            <div className="text-[10px] text-white/50 mt-0.5">Gradient slope win</div>
          </div>

          <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl text-center border border-white/10">
            <div className="text-2xl mb-1">😄</div>
            <div className="text-[10px] text-white/60 uppercase font-semibold">Afternoon (3:20)</div>
            <div className="text-xs font-bold text-emerald-300">Great Finish</div>
            <div className="text-[10px] text-white/50 mt-0.5">Rated day 4/5</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Morning Handover Check-In Form & Tips */}
        <div className="md:col-span-6 space-y-5">
          {/* Handover Form */}
          <div className="card p-5 border border-amber/30">
            <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
              <Clock className="w-4 h-4 text-amber-dark" />
              <h3 className="text-sm font-bold text-navy">Submit / Update Morning Handover</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Help Ms Johnson and TA Melissa prepare before registration. Takes under 30 seconds.
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs animate-in zoom-in-95">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Handover Sent to Room 4!</div>
                  <div className="text-[11px] text-emerald-700">Ms Johnson and TA Melissa have received Phoenix's updated morning signals.</div>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">How did Phoenix sleep?</label>
                  <select
                    value={sleep}
                    onChange={(e) => setSleep(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-dark"
                  >
                    <option>Good (8+ hours restful)</option>
                    <option>Restless (woke in night at 4am)</option>
                    <option>Poor (&lt; 6 hours / troubled)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">Morning mood at breakfast</label>
                  <select
                    value={mood}
                    onChange={(e) => setMood(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 bg-white focus:outline-none focus:border-amber-dark"
                  >
                    <option>Calm & Happy</option>
                    <option>Anxious / Apprehensive</option>
                    <option>Frustrated / Overwhelmed</option>
                    <option>Tired & Low Energy</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3 py-1">
                  <label className="flex items-center gap-2 text-xs text-navy p-2 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakfast}
                      onChange={(e) => setBreakfast(e.target.checked)}
                      className="rounded text-amber-dark focus:ring-amber-dark"
                    />
                    <span className="font-medium">Breakfast Eaten</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-navy p-2 bg-gray-50 rounded-xl border border-gray-100 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={meds}
                      onChange={(e) => setMeds(e.target.checked)}
                      className="rounded text-amber-dark focus:ring-amber-dark"
                    />
                    <span className="font-medium">Medication Taken</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Special notes for today (sensory alerts, changes)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Nervous about assembly; noise defenders in his bag..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-dark"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-teal hover:bg-teal-medium text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending Handover...' : 'Send Morning Handover to School'}</span>
                </button>
              </form>
            )}
          </div>

          {/* Tonight's Support Tips */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Sparkles className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-bold text-navy">Tonight's Home Support Tips</h3>
            </div>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <div>
                  <div className="font-bold text-navy">Breakfast tomorrow — even something small before medication</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Today's dip was manageable with crackers, but breakfast made a huge difference last week.</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/60 border border-amber-200/50 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-800 flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  !
                </span>
                <div>
                  <div className="font-bold text-navy">Ask him about maths today — he had a big breakthrough!</div>
                  <div className="text-[11px] text-gray-600 mt-0.5">He drew a gradient triangle independently for the first time. Remind him that's real game design maths!</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-gray-50 border border-gray-100 flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-purple-light text-purple-dark flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5">
                  →
                </span>
                <div>
                  <div className="font-bold text-navy">Downtime before dinner — full sensory day</div>
                  <div className="text-[11px] text-gray-500 mt-0.5">Headphones or quiet drawing time for 20 minutes after school helps him regulate after the assembly.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Shared School Timeline */}
        <div className="md:col-span-6 space-y-4">
          <div className="card p-5">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2 mb-3">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-coral-dark" />
                <h3 className="text-sm font-bold text-navy">Phoenix's Day at School</h3>
              </div>
              <span className="text-[10px] text-gray-400">Live feed from Room 4</span>
            </div>

            <div className="space-y-3">
              {timeline.filter(e => e.visibility === 'Shared').length === 0 ? (
                <p className="text-xs text-gray-400 italic py-4 text-center">No shared notes logged yet.</p>
              ) : (
                timeline.filter(e => e.visibility === 'Shared').map((evt) => (
                  <div key={evt.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-navy">{evt.title}</span>
                      <span className="text-gray-400 text-[10px]">
                        {new Date(evt.event_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed">{evt.summary}</p>
                    {evt.observation?.strengths_observed && (
                      <div className="text-[11px] text-teal font-medium pt-1">
                        🌟 Strengths noticed: {evt.observation.strengths_observed}
                      </div>
                    )}
                    <div className="text-[10px] text-gray-400 pt-1 flex items-center justify-between">
                      <span>Logged by {evt.reporter_name || evt.reporter_type}</span>
                      {evt.status === 'Acknowledged' && (
                        <span className="text-emerald-700 font-semibold text-[10px]">✓ Acknowledged</span>
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
