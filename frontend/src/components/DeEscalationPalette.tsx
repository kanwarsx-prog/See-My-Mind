import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertTriangle, Clock, X, ChevronRight } from 'lucide-react';

export interface DeEscalationStrategyItem {
  id: string;
  title: string;
  category: string;
  icon: string;
  durationMinutes: number;
  efficacy: number;
  description: string;
  actionProtocol: string;
  buddyAssistance?: string;
}

interface DeEscalationPaletteProps {
  pupilName?: string;
  onLogStrategyResult: (data: {
    strategyName: string;
    category: string;
    worked: boolean;
    notes: string;
  }) => Promise<void>;
}

export const DeEscalationPalette: React.FC<DeEscalationPaletteProps> = ({
  pupilName = 'Phoenix',
  onLogStrategyResult,
}) => {
  const [dysregulationLevel, setDysregulationLevel] = useState<'steady' | 'escalating' | 'overload'>('escalating');
  const [activeStrategy, setActiveStrategy] = useState<DeEscalationStrategyItem | null>(null);
  const [timerSecondsLeft, setTimerSecondsLeft] = useState<number>(180);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [loggingOutcome, setLoggingOutcome] = useState<boolean>(false);
  const [lastLoggedMessage, setLastLoggedMessage] = useState<string | null>(null);

  const strategies: DeEscalationStrategyItem[] = [
    {
      id: 'strat-movement',
      title: 'Purposeful Movement / Register Errand',
      category: 'Vestibular Reset',
      icon: '🏃',
      durationMinutes: 2,
      efficacy: 94,
      description: 'Discreet vestibular reset avoiding peer attention or classroom disruption.',
      actionProtocol: 'Hand Phoenix the Room 4 library return folder. Pair with trusted buddy Jake O\'Brien to walk to the main library and back.',
      buddyAssistance: 'Jake O\'Brien',
    },
    {
      id: 'strat-headphones',
      title: 'Acoustic Shelter + 5-Min Visual Timer',
      category: 'Auditory Isolation',
      icon: '🎧',
      durationMinutes: 5,
      efficacy: 92,
      description: 'Rapid reduction of sensory auditory overload before assembly or noisy practicals.',
      actionProtocol: 'Offer noise defenders from desk pouch. Flip blue visual 5-min sand timer. Cease all verbal questioning until timer empties.',
    },
    {
      id: 'strat-putty',
      title: 'Under-Desk Tactile Compression Putty',
      category: 'Proprioceptive Calming',
      icon: '🧱',
      durationMinutes: 3,
      efficacy: 88,
      description: 'Deep sensory pressure input to discharge physiological anxiety in-seat.',
      actionProtocol: 'Hand green high-resistance therapy putty from top drawer. Encourage bilateral rhythmic squeezing below desk level.',
    },
    {
      id: 'strat-task-shift',
      title: 'Visual-Spatial Low-Demand Task Shift',
      category: 'Cognitive Load Reduction',
      icon: '🎮',
      durationMinutes: 5,
      efficacy: 89,
      description: 'Bypasses abstract working memory freeze by pivoting to visual game mechanics.',
      actionProtocol: 'Switch from abstract algebra worksheet to the interactive Game Slope coordinate card. Allow him to manipulate the visual slider.',
    },
  ];

  // Timer countdown hook
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSecondsLeft > 0) {
      interval = setInterval(() => {
        setTimerSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (timerSecondsLeft === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSecondsLeft]);

  const handleStartStrategy = (strategy: DeEscalationStrategyItem) => {
    setActiveStrategy(strategy);
    setTimerSecondsLeft(strategy.durationMinutes * 60);
    setIsTimerRunning(true);
  };

  const handleOutcome = async (worked: boolean) => {
    if (!activeStrategy) return;
    setLoggingOutcome(true);
    try {
      const outcomeNotes = worked
        ? `De-escalation successful within ${Math.ceil((activeStrategy.durationMinutes * 60 - timerSecondsLeft) / 60)}m. Pupil regulated and re-engaged.`
        : 'Strategy attempted but sensory agitation persisted. TA assistance or quiet corner recommended.';

      await onLogStrategyResult({
        strategyName: activeStrategy.title,
        category: activeStrategy.category,
        worked,
        notes: outcomeNotes,
      });

      setLastLoggedMessage(
        worked
          ? `✓ Logged win: "${activeStrategy.title}" worked for ${pupilName}!`
          : `⚠️ Logged: Secondary strategy recommended for ${pupilName}.`
      );
      setTimeout(() => setLastLoggedMessage(null), 5000);

      // Reset active strategy state
      setIsTimerRunning(false);
      setActiveStrategy(null);
      if (worked) {
        setDysregulationLevel('steady');
      }
    } catch (err) {
      console.error('Failed to log de-escalation result:', err);
    } finally {
      setLoggingOutcome(false);
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="card p-5 border-l-4 border-l-teal bg-white space-y-4">
      {/* Header & Pupil State Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-gray-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-navy flex items-center gap-1.5">
              <span>⚡ Real-Time De-Escalation Palette</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal/10 text-teal font-semibold">
                Room 4 Rapid Action
              </span>
            </h3>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            Ranked strategies with proven 88%+ efficacy for {pupilName} Carter during dysregulation.
          </p>
        </div>

        {/* Regulation Gauge Chips */}
        <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-xl border border-gray-100 text-[11px]">
          <button
            onClick={() => setDysregulationLevel('steady')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              dysregulationLevel === 'steady'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            <span>🟢</span>
            <span>Steady</span>
          </button>
          <button
            onClick={() => setDysregulationLevel('escalating')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              dysregulationLevel === 'escalating'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            <span>🟡</span>
            <span>Escalating</span>
          </button>
          <button
            onClick={() => setDysregulationLevel('overload')}
            className={`px-2.5 py-1 rounded-lg font-semibold transition-all cursor-pointer flex items-center gap-1 ${
              dysregulationLevel === 'overload'
                ? 'bg-coral-dark text-white shadow-xs'
                : 'text-gray-500 hover:text-navy'
            }`}
          >
            <span>🔴</span>
            <span>Overload Risk</span>
          </button>
        </div>
      </div>

      {/* Confirmation Toast */}
      {lastLoggedMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-800 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{lastLoggedMessage}</span>
        </div>
      )}

      {/* Active In-Progress De-Escalation Mode */}
      {activeStrategy ? (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-teal-50 via-teal-50/50 to-white border-2 border-teal space-y-3.5 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{activeStrategy.icon}</span>
              <div>
                <div className="text-xs font-bold text-navy flex items-center gap-2">
                  <span>Strategy Active: {activeStrategy.title}</span>
                  <span className="text-[10px] bg-teal text-white px-2 py-0.5 rounded-full font-semibold">
                    {activeStrategy.category}
                  </span>
                </div>
                <div className="text-[11px] text-gray-600 mt-0.5">{activeStrategy.actionProtocol}</div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsTimerRunning(false);
                setActiveStrategy(null);
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-lg cursor-pointer"
              title="Cancel strategy timer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Active Timer Bar */}
          <div className="bg-white p-3 rounded-xl border border-teal/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-14 h-10 rounded-xl bg-teal/10 flex items-center justify-center font-mono font-bold text-teal text-sm flex-shrink-0">
                <Clock className="w-4 h-4 animate-pulse mr-1" />
                {formatTimer(timerSecondsLeft)}
              </div>
              <div>
                <div className="text-xs font-bold text-navy">Allowing time for nervous system regulation</div>
                <div className="text-[11px] text-gray-500">Observe posture, breathing, and eye contact quietly.</div>
              </div>
            </div>

            {/* 2-Button Feedback Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
              <button
                onClick={() => handleOutcome(true)}
                disabled={loggingOutcome}
                className="px-3.5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>{loggingOutcome ? 'Logging...' : '✓ Calmed & Re-engaged'}</span>
              </button>
              <button
                onClick={() => handleOutcome(false)}
                disabled={loggingOutcome}
                className="px-3 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                <span>⚠️ Still Escalating</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Strategy Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {strategies.map((strat) => (
            <div
              key={strat.id}
              className="p-3.5 rounded-2xl bg-gray-50/70 hover:bg-teal-50/30 border border-gray-100 hover:border-teal/40 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl p-1.5 bg-white rounded-xl shadow-xs border border-gray-100">
                      {strat.icon}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-navy group-hover:text-teal transition-colors">
                        {strat.title}
                      </h4>
                      <div className="text-[10px] text-gray-500 font-medium">{strat.category}</div>
                    </div>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
                    {strat.efficacy}% win
                  </span>
                </div>

                <p className="text-[11px] text-gray-600 mt-2.5 leading-relaxed">
                  {strat.actionProtocol}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>~{strat.durationMinutes} mins protocol</span>
                </span>

                <button
                  onClick={() => handleStartStrategy(strat)}
                  className="px-3 py-1.5 rounded-xl bg-teal hover:bg-teal-medium text-white text-[11px] font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                >
                  <span>▶ Activate</span>
                  <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
