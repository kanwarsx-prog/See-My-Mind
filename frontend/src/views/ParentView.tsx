import React, { useState } from 'react';
import { Child, ChildEvent } from '../types';
import { Heart, Send, CheckCircle2, Clock } from 'lucide-react';

interface ParentViewProps {
  child: Child;
  timeline: ChildEvent[];
  onSubmitHandover: (data: any) => Promise<void>;
}

export const ParentView: React.FC<ParentViewProps> = ({ child, timeline, onSubmitHandover }) => {
  const [sleep, setSleep] = useState('Restless');
  const [mood, setMood] = useState('Anxious');
  const [breakfast, setBreakfast] = useState(true);
  const [meds, setMeds] = useState(true);
  const [notes, setNotes] = useState('Worried about assembly noise. Noise defenders packed in his bag.');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
      setTimeout(() => setSubmitted(false), 5000);
    } catch (err) {
      console.error(err);
      alert('Failed to send handover to school.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Welcome Banner */}
      <div className="card p-6 bg-gradient-to-r from-amber-light/30 via-white to-mint/20 border-l-4 border-l-amber-dark">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">👩‍👦</span>
              <h2 className="text-lg font-serif font-bold text-navy">Welcome, Dana Carter</h2>
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Direct connection with Ms Johnson & St. Jude's Academy for {child.full_name || 'Phoenix'}
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            <span className="font-semibold text-navy">Today: </span>
            {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Morning Handover Check-In Form */}
        <div className="md:col-span-6 space-y-4">
          <div className="card p-5 border border-amber/30">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Clock className="w-4 h-4 text-amber-dark" />
              <h3 className="text-sm font-bold text-navy">Morning Home Handover</h3>
            </div>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Help Ms Johnson prepare for Phoenix's arrival. This automatically briefs his teacher before registration.
            </p>

            {submitted ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-emerald-800 text-xs">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <div className="font-bold">Handover Sent to Ms Johnson!</div>
                  <div className="text-[11px] text-emerald-700">NOYA has briefed classroom staff with your notes.</div>
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
                    <option>Good (8+ hours)</option>
                    <option>Restless (woke in night)</option>
                    <option>Poor (&lt; 6 hours)</option>
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
                    <option>Anxious</option>
                    <option>Frustrated / Overwhelmed</option>
                    <option>Tired & Low Energy</option>
                  </select>
                </div>

                <div className="flex items-center gap-6 py-1">
                  <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breakfast}
                      onChange={(e) => setBreakfast(e.target.checked)}
                      className="rounded text-amber-dark focus:ring-amber-dark"
                    />
                    <span>Breakfast Eaten</span>
                  </label>

                  <label className="flex items-center gap-2 text-xs text-navy cursor-pointer">
                    <input
                      type="checkbox"
                      checked={meds}
                      onChange={(e) => setMeds(e.target.checked)}
                      className="rounded text-amber-dark focus:ring-amber-dark"
                    />
                    <span>Medication Taken</span>
                  </label>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy mb-1">
                    Special notes for today (optional)
                  </label>
                  <textarea
                    rows={2}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. Nervous about assembly; noise defenders are in his bag..."
                    className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:border-amber-dark"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 bg-amber-dark hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{loading ? 'Sending to School...' : 'Send Morning Handover'}</span>
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Shared Daily Timeline */}
        <div className="md:col-span-6 space-y-4">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
              <Heart className="w-4 h-4 text-coral-dark" />
              <h3 className="text-sm font-bold text-navy">Phoenix's Day at School</h3>
            </div>

            <div className="space-y-3">
              {timeline.filter(e => e.visibility === 'Shared').map((evt) => (
                <div key={evt.id} className="p-3.5 rounded-xl bg-gray-50 border border-gray-100 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-navy">{evt.title}</span>
                    <span className="text-gray-400 text-[10px]">
                      {new Date(evt.event_time).toLocaleDateString([], { day: 'numeric', month: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">{evt.summary}</p>
                  {evt.observation?.strengths_observed && (
                    <div className="text-[11px] text-teal font-medium pt-1">
                      🌟 Strengths noticed: {evt.observation.strengths_observed}
                    </div>
                  )}
                  <div className="text-[10px] text-gray-400 pt-1">
                    Logged by {evt.reporter_name || evt.reporter_type}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
