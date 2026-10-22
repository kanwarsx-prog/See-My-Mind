import React, { useState, useEffect } from 'react';
import { ClassroomMatrixData } from '../types';
import { api } from '../api';
import { Sparkles, AlertTriangle, CheckCircle2, Printer, X, BookOpen, HeartHandshake } from 'lucide-react';

interface ClassSendMatrixProps {
  onSelectPupil?: (pupilId: string) => void;
}

export const ClassSendMatrix: React.FC<ClassSendMatrixProps> = ({ onSelectPupil }) => {
  const [matrixData, setMatrixData] = useState<ClassroomMatrixData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSubject, setSelectedSubject] = useState<'all' | 'maths' | 'english' | 'science' | 'assembly'>('all');
  const [showSupplyModal, setShowSupplyModal] = useState<boolean>(false);

  useEffect(() => {
    api.getClassMatrix('room-4')
      .then((data) => {
        setMatrixData(data);
      })
      .catch((err) => {
        console.error('Failed to load classroom matrix:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const subjects = [
    { key: 'all', label: 'All-Day General' },
    { key: 'maths', label: '📐 Maths (Slopes & Numbers)' },
    { key: 'english', label: '📖 English (Inference & Reading)' },
    { key: 'science', label: '🔬 Science (Practicals & Labs)' },
    { key: 'assembly', label: '⚡ Assembly & PE (High Acoustic)' },
  ];

  if (loading) {
    return (
      <div className="card p-12 text-center text-gray-500 space-y-3">
        <div className="w-8 h-8 rounded-full border-2 border-teal border-t-transparent animate-spin mx-auto" />
        <div className="text-xs font-semibold">Loading Room 4 SEND Matrix...</div>
      </div>
    );
  }

  const cohort = matrixData?.cohort || [];

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-navy flex items-center gap-2">
              <span>🏫 Room 4 SEND Classroom Matrix</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal/10 text-teal font-semibold">
                Year 5 · Ms Clara Johnson
              </span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-1">
            Whole-class overview of differentiated adaptations, sensory triggers, and today&apos;s readiness signals for all 4 SEND pupils.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowSupplyModal(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-navy to-slate-800 hover:from-slate-800 hover:to-navy text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer flex-shrink-0"
          >
            <Printer className="w-4 h-4 text-mint" />
            <span>60s Supply Teacher Briefing</span>
          </button>
        </div>
      </div>

      {/* Cohort Stats Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="stat-card border-teal">
          <div className="font-serif text-2xl font-bold text-teal">4</div>
          <div className="text-[11px] text-gray-500 mt-0.5">SEND Learners in Room 4</div>
        </div>
        <div className="stat-card border-purple-dark">
          <div className="font-serif text-2xl font-bold text-purple-dark">2</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Statutory EHCPs Active</div>
        </div>
        <div className="stat-card border-amber-dark">
          <div className="font-serif text-2xl font-bold text-amber-dark">1</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Arrival Amber Alert (Phoenix ⚠️)</div>
        </div>
        <div className="stat-card border-emerald-600">
          <div className="font-serif text-2xl font-bold text-emerald-700">1-to-1 TA</div>
          <div className="text-[11px] text-gray-500 mt-0.5">Melissa Grant Assigned</div>
        </div>
      </div>

      {/* Subject Filter Bar */}
      <div className="card p-3 flex flex-wrap items-center justify-between gap-2 bg-white">
        <span className="text-xs font-bold text-navy px-2 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4 text-teal" />
          <span>Lesson Focus Filter:</span>
        </span>
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          {subjects.map((s) => (
            <button
              key={s.key}
              onClick={() => setSelectedSubject(s.key as any)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                selectedSubject === s.key
                  ? 'bg-teal text-white shadow-xs'
                  : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-navy'
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Matrix Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cohort.map((pupil) => {
          const subjectAccommodation =
            selectedSubject !== 'all'
              ? pupil.subject_accommodations[selectedSubject] || pupil.subject_accommodations.maths
              : null;

          return (
            <div
              key={pupil.id}
              className={`card p-5 border-l-4 transition-all space-y-4 ${
                pupil.readiness_level === 'amber'
                  ? 'border-l-amber-500 bg-amber-50/15'
                  : 'border-l-teal bg-white'
              }`}
            >
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-2xl bg-teal/10 flex items-center justify-center font-bold text-teal text-base">
                    {pupil.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-navy">{pupil.name}</h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        pupil.has_ehcp
                          ? 'bg-purple-light text-purple-dark'
                          : 'bg-teal/10 text-teal'
                      }`}>
                        {pupil.support_tier}
                      </span>
                    </div>
                    <div className="text-[11px] text-gray-500 mt-0.5">
                      {pupil.primary_need} · {pupil.year_group}
                    </div>
                  </div>
                </div>

                {onSelectPupil && pupil.name.includes('Phoenix') && (
                  <button
                    onClick={() => onSelectPupil(pupil.id)}
                    className="text-[11px] font-bold text-teal hover:underline cursor-pointer"
                  >
                    Focus View →
                  </button>
                )}
              </div>

              {/* Today's Readiness Banner */}
              <div className={`p-2.5 rounded-xl border text-xs flex items-center gap-2 ${
                pupil.readiness_level === 'amber'
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-900'
              }`}>
                {pupil.readiness_level === 'amber' ? (
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                )}
                <div>
                  <span className="font-bold">Today&apos;s Readiness: </span>
                  <span>{pupil.readiness_status}</span>
                </div>
              </div>

              {/* Dynamic Subject Accommodation (when filtered) */}
              {subjectAccommodation && (
                <div className="p-3 rounded-xl bg-teal-50/50 border border-teal/20 text-xs space-y-1">
                  <div className="font-bold text-teal flex items-center gap-1.5 uppercase text-[10px] tracking-wider">
                    <Sparkles className="w-3.5 h-3.5 text-teal" />
                    <span>{selectedSubject.toUpperCase()} Adaptation Active:</span>
                  </div>
                  <p className="text-gray-700 leading-relaxed">{subjectAccommodation}</p>
                </div>
              )}

              {/* Triggers & Calming Tools */}
              <div className="space-y-2 text-xs">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Primary Triggers to Avoid
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pupil.primary_triggers.map((t, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-coral-50 border border-coral-200/60 text-coral-dark text-[11px] font-medium"
                      >
                        ⚡ {t}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">
                    Validated Calming Equipment & Strategies
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {pupil.sensory_calming_tools.map((tool, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded-lg bg-teal/5 border border-teal/20 text-navy text-[11px] font-medium"
                      >
                        ✓ {tool}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Buddy & TA Note */}
              <div className="pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <span className="flex items-center gap-1">
                  <HeartHandshake className="w-3.5 h-3.5 text-teal" />
                  <span>Peer Buddy: <strong className="text-navy">{pupil.buddy_pairing || 'Jake'}</strong></span>
                </span>
                <span className="text-[10px] text-gray-400">
                  {pupil.has_ehcp ? 'TA Support Active' : 'Universal Support'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Supply Teacher 60-Second Briefing Modal */}
      {showSupplyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-light text-amber-dark">
                  Emergency Cover Protocol
                </span>
                <h3 className="text-lg font-serif font-bold text-navy mt-1">
                  Room 4 SEND: 60-Second Cover Briefing Sheet
                </h3>
                <p className="text-xs text-gray-500">
                  St. Jude&apos;s Academy · Year 5 · Lead Teacher: Ms Clara Johnson · TA: Melissa Grant
                </p>
              </div>
              <button
                onClick={() => setShowSupplyModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Important note for supply / cover teachers:</strong>
                SEND pupils in Room 4 thrive on predictable routines. Please follow the individual de-escalation tips below before calling on-call behavior support.
              </div>
            </div>

            {/* Print Grid of 4 pupils */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {cohort.map((pupil) => (
                <div key={pupil.id} className="p-4 rounded-2xl border border-gray-200 bg-gray-50/50 space-y-2 text-xs">
                  <div className="flex items-center justify-between border-b border-gray-200 pb-2">
                    <span className="font-bold text-navy text-sm">{pupil.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-gray-200 font-bold">
                      {pupil.support_tier}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-coral-dark uppercase tracking-wider block">
                      ⚠️ Never do:
                    </span>
                    <span className="text-gray-700">
                      {pupil.primary_triggers.join(', ')}
                    </span>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider block">
                      ✓ Immediate de-escalation:
                    </span>
                    <span className="text-gray-700">
                      {pupil.sensory_calming_tools.slice(0, 2).join(' · ')}
                    </span>
                  </div>

                  <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-200">
                    Trusted classmate: <strong className="text-navy">{pupil.buddy_pairing}</strong>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowSupplyModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-teal hover:bg-teal-medium text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
