import React, { useState } from 'react';
import { BookOpen, CheckCircle2, ArrowRight, Lock, ExternalLink, Sparkles, ChevronDown } from 'lucide-react';
import { PathwayStep, PeerAdaptation } from '../types';

interface AdaptedPathwayCardProps {
  onOpenWorksheet: (worksheetKey: string) => void;
  onLogMilestone?: (milestoneTitle: string, note: string) => Promise<void>;
}

export const AdaptedPathwayCard: React.FC<AdaptedPathwayCardProps> = ({
  onOpenWorksheet,
  onLogMilestone,
}) => {
  const [isOpen, setIsOpen] = useState(true);
  const [loggingMilestone, setLoggingMilestone] = useState(false);
  const [milestoneLogged, setMilestoneLogged] = useState(false);

  const [steps, setSteps] = useState<PathwayStep[]>([
    {
      number: 1,
      title: '1. Real-world hook — the game level slope',
      description: '"A game character moves up a slope. How steep is it?" Draw on paper first.',
      status: 'done',
      badge: '✓ Completed',
    },
    {
      number: 2,
      title: '2. Draw it — plot the slope visually',
      description: 'Plot coordinates on visual grid. No algebra equation yet. Feel the slope geometry.',
      status: 'active',
      badge: '→ In progress now',
    },
    {
      number: 3,
      title: '3. Name the pattern — rise ÷ run',
      description: 'Label the triangle. Rise = how high (6). Run = how far (2). Gradient = 6 ÷ 2 = 3.',
      status: 'next',
      badge: 'Up next',
    },
    {
      number: 4,
      title: '4. The equation emerges — y = mx + c',
      description: 'Only once gradient is felt intuitively. Algebra labels what he already understands.',
      status: 'locked',
      badge: 'Unlocks after step 3',
    },
  ]);

  const peerAdaptations: PeerAdaptation[] = [
    {
      initials: 'AW',
      name: 'Archie Watson — Dyslexia & Processing',
      need: 'Auditory step-by-step verbal walkthrough · minimal visual clutter',
      route: 'Verbal instruction strip',
      method: 'Auditory',
      color: 'bg-purple-50 text-purple-800 border border-purple-200',
    },
    {
      initials: 'RP',
      name: 'Riya Patel — ADHD & Anxiety',
      need: 'Short 10-minute chunked tasks with scheduled movement break at step 2',
      route: 'Kinesthetic chunking',
      method: 'Kinesthetic',
      color: 'bg-rose-50 text-rose-800 border border-rose-200',
    },
    {
      initials: 'AM',
      name: 'Aisha Musa — Autism & Selective Mutism',
      need: 'Written prompt cards only · non-verbal partner pairing with Jake O\'Brien',
      route: 'Written & partner work',
      method: 'Written',
      color: 'bg-amber-50 text-amber-900 border border-amber-200',
    },
  ];

  const handleAdvanceStep = () => {
    setSteps((prev) => {
      const activeIdx = prev.findIndex((s) => s.status === 'active');
      if (activeIdx === -1 || activeIdx >= prev.length - 1) return prev;
      return prev.map((s, idx) => {
        if (idx === activeIdx) return { ...s, status: 'done', badge: '✓ Completed' };
        if (idx === activeIdx + 1) return { ...s, status: 'active', badge: '→ In progress now' };
        return s;
      });
    });
  };

  const handleLogBreakthrough = async () => {
    if (!onLogMilestone) return;
    setLoggingMilestone(true);
    try {
      await onLogMilestone(
        'Maths Breakthrough: Drew Gradient Triangle Independently',
        'Phoenix drew the gradient slope triangle (Rise 6, Run 2) unprompted during Lesson 2. Game design hook unlocked the concept.'
      );
      setMilestoneLogged(true);
      setTimeout(() => setMilestoneLogged(false), 5000);
    } catch (err) {
      console.error(err);
    } finally {
      setLoggingMilestone(false);
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="p-4 flex items-center justify-between cursor-pointer hover:bg-cardSubtle transition-colors border-b border-borderMain"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-mint-pale dark:bg-teal-950/60 flex items-center justify-center text-teal dark:text-teal-300 border border-teal/20">
            <BookOpen className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-navy dark:text-white">📚 Adapted Learning — This Lesson</h4>
              <span className="text-[10px] font-bold text-teal dark:text-teal-300 bg-mint-pale dark:bg-teal-950/60 border border-teal/20 px-2 py-0.5 rounded-md">
                Active Adaptation
              </span>
            </div>
            <p className="text-[10px] text-textDim dark:text-slate-400">Maths · Straight Line Graphs · Phoenix's visual-spatial route</p>
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-textDim dark:text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="p-4 space-y-4">
          {/* Spotlight Rationale */}
          <div className="p-3.5 bg-gradient-to-r from-mint-pale/40 via-mint-pale/20 to-transparent dark:from-teal-950/40 dark:via-cardBg dark:to-transparent border-l-3 border-teal rounded-xl text-xs space-y-1">
            <div className="text-[10px] font-bold uppercase tracking-wider text-teal dark:text-teal-300">
              Cognitive Profile & Rationale
            </div>
            <p className="text-textSub dark:text-slate-300 leading-relaxed text-[11.5px]">
              Phoenix is a <strong className="text-navy dark:text-white">visual-spatial learner</strong> with high pattern recognition capacity. Abstract notation ($y = mx + c$) triggers cognitive shutdown. Today's slope is framed as <em>"how fast does the game character move up a hill?"</em> before any equation appears. <strong>Draw first, equation second.</strong>
            </p>
          </div>

          {/* Interactive 4-Step Pathway */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-textDim dark:text-slate-400">
                Lesson Pathway — Straight Line Graphs
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAdvanceStep}
                  className="text-[10px] font-semibold text-teal dark:text-teal-300 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <span>Advance Step</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              {steps.map((st) => (
                <div
                  key={st.number}
                  className={`p-2.5 rounded-xl border flex items-start gap-3 transition-all ${
                    st.status === 'done'
                      ? 'bg-emerald-50/40 dark:bg-emerald-950/30 border-emerald-200/60 dark:border-emerald-800/40'
                      : st.status === 'active'
                      ? 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-300 dark:border-amber-700/50 ring-2 ring-amber-200/50 dark:ring-amber-900/40'
                      : st.status === 'next'
                      ? 'bg-cardSubtle border-borderMain'
                      : 'bg-cardSubtle/50 border-borderMain opacity-60'
                  }`}
                >
                  <div
                    className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] flex-shrink-0 mt-0.5 ${
                      st.status === 'done'
                        ? 'bg-emerald-600 text-white'
                        : st.status === 'active'
                        ? 'bg-amber-dark text-white animate-pulse'
                        : st.status === 'next'
                        ? 'bg-cardSubtle text-textMain border border-borderMain'
                        : 'bg-cardSubtle text-textDim border border-borderMain'
                    }`}
                  >
                    {st.status === 'done' ? (
                      <CheckCircle2 className="w-3 h-3" />
                    ) : st.status === 'active' ? (
                      '→'
                    ) : st.status === 'locked' ? (
                      <Lock className="w-2.5 h-2.5" />
                    ) : (
                      st.number
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-navy dark:text-white truncate">{st.title}</span>
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${
                          st.status === 'done'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/40'
                            : st.status === 'active'
                            ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200/60 dark:border-amber-800/40'
                            : 'bg-cardSubtle text-textDim border border-borderMain'
                        }`}
                      >
                        {st.badge}
                      </span>
                    </div>
                    <p className="text-[11px] text-textSub dark:text-slate-300 mt-0.5 leading-snug">{st.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-borderMain">
            <button
              onClick={() => onOpenWorksheet('graphs')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-teal hover:bg-teal-dark text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer active:scale-95 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Interactive Worksheet</span>
            </button>

            {onLogMilestone && (
              <button
                onClick={handleLogBreakthrough}
                disabled={loggingMilestone}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gold hover:bg-amber-500 text-navy dark:text-slate-900 rounded-xl text-xs font-bold shadow-xs cursor-pointer active:scale-95 transition-all"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{loggingMilestone ? 'Saving...' : '⭐ Log Milestone Breakthrough'}</span>
              </button>
            )}

            {milestoneLogged && (
              <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 animate-in fade-in">
                ✓ Milestone logged & shared to Mum's feed!
              </span>
            )}
          </div>

          {/* Parallel Peer Adaptations in Room 4 */}
          <div className="pt-2 border-t border-borderMain space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-textDim dark:text-slate-400 block">
              Other Room 4 Pupils — Parallel Adapted Routes
            </span>

            <div className="space-y-1.5">
              {peerAdaptations.map((p) => (
                <div
                  key={p.name}
                  className="p-2 bg-cardSubtle rounded-xl flex items-center justify-between gap-2 border border-borderMain text-xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[10px] flex-shrink-0 ${p.color}`}
                    >
                      {p.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-navy dark:text-white truncate text-[11px]">{p.name}</div>
                      <div className="text-[10px] text-textDim dark:text-slate-400 truncate">{p.need}</div>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-cardBg border border-borderMain text-textMain dark:text-white flex-shrink-0">
                    {p.method}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
