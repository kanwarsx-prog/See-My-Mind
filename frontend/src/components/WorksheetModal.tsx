import React, { useState } from 'react';
import { X, Printer, CheckCircle2, Sparkles, Sliders } from 'lucide-react';

interface WorksheetModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialWorksheet?: string;
  onCompleteStep?: (worksheetTitle: string, details: string) => Promise<void>;
}

export const WorksheetModal: React.FC<WorksheetModalProps> = ({
  isOpen,
  onClose,
  initialWorksheet = 'graphs',
  onCompleteStep,
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialWorksheet);

  // Maths Graphs state
  const [rise, setRise] = useState<number>(6);
  const [run, setRun] = useState<number>(2);
  const [savedNote, setSavedNote] = useState<string>('For every 1 step right, the game character jumps 3 blocks up! Gradient = 3.');
  const [stepCompleted, setStepCompleted] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // Fractions state
  const [fractionDenominator, setFractionDenominator] = useState<number>(4);
  const [fractionNumerator, setFractionNumerator] = useState<number>(3);

  if (!isOpen) return null;

  const gradient = run > 0 ? (rise / run).toFixed(1).replace(/\.0$/, '') : '0';

  const handleSaveProgress = async () => {
    if (!onCompleteStep) return;
    setSaving(true);
    try {
      if (activeTab === 'graphs') {
        await onCompleteStep(
          'Maths Worksheet Milestone: Visual Gradient Calculated',
          `Phoenix calculated gradient = ${gradient} (Rise ${rise} ÷ Run ${run}) independently using the game slope simulation.`
        );
      } else if (activeTab === 'highwayman') {
        await onCompleteStep(
          'English Worksheet Milestone: Visual Inference Completed',
          'Phoenix completed the Ghost Galleon visual scene deduction for The Highwayman.'
        );
      } else {
        await onCompleteStep(
          'Fractions Milestone: Bar Model Visualisation',
          `Phoenix matched ${fractionNumerator}/${fractionDenominator} using the interactive fraction bar.`
        );
      }
      setStepCompleted(true);
      setTimeout(() => setStepCompleted(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-navy/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col shadow-2xl border border-gray-100">
        {/* Modal Top Bar */}
        <div className="bg-navy px-6 py-4 flex items-center justify-between text-white flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl">📚</span>
              <h2 className="font-serif text-lg font-bold text-white">
                {activeTab === 'graphs'
                  ? 'Maths — Straight Line Graphs'
                  : activeTab === 'highwayman'
                  ? 'English — The Highwayman Inference'
                  : 'Maths — Fractions Visual Mastery'}
              </h2>
            </div>
            <p className="text-xs text-white/60 mt-0.5">
              Adapted visual-spatial route · St. Jude's Inclusive Academy
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-semibold cursor-pointer transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Print / Save PDF</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tab Strip */}
        <div className="px-6 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center gap-2 flex-shrink-0 overflow-x-auto">
          <button
            onClick={() => setActiveTab('graphs')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'graphs'
                ? 'bg-teal text-white shadow-xs'
                : 'text-gray-600 hover:text-navy hover:bg-gray-200/60'
            }`}
          >
            📐 Maths: Straight Line Graphs
          </button>
          <button
            onClick={() => setActiveTab('highwayman')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'highwayman'
                ? 'bg-purple-dark text-white shadow-xs'
                : 'text-gray-600 hover:text-navy hover:bg-gray-200/60'
            }`}
          >
            📖 English: The Highwayman
          </button>
          <button
            onClick={() => setActiveTab('fractions')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'fractions'
                ? 'bg-amber-dark text-white shadow-xs'
                : 'text-gray-600 hover:text-navy hover:bg-gray-200/60'
            }`}
          >
            🍕 Home Maths: Fractions
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'graphs' && (
            <div className="space-y-5">
              {/* Adaptation Note */}
              <div className="p-3 bg-mint-pale/60 border border-mint rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-teal flex-shrink-0 mt-0.5" />
                <div className="text-xs text-navy/80 leading-relaxed">
                  <span className="font-bold text-teal">Adapted Methodology: </span>
                  Rather than starting with abstract $y = mx + c$, Phoenix interacts with a game slope. He visualizes the character ascending a platform. <strong>Draw first, equation second.</strong>
                </div>
              </div>

              {/* Interactive Game Level Slope Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* SVG Visual Canvas */}
                <div className="md:col-span-7 bg-[#1A2E3B] rounded-2xl p-4 flex flex-col items-center justify-center text-white relative shadow-inner min-h-[260px]">
                  <div className="absolute top-3 left-3 text-[10px] text-white/50 uppercase tracking-widest font-mono">
                    Game Level Slope Simulator · Grid (X, Y)
                  </div>

                  {/* SVG Coordinate Grid & Character Slope */}
                  <svg viewBox="0 0 300 200" className="w-full h-48 max-w-[340px]">
                    {/* Grid Lines */}
                    <defs>
                      <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
                      </pattern>
                    </defs>
                    <rect width="300" height="200" fill="url(#grid)" />

                    {/* Axes */}
                    <line x1="40" y1="170" x2="280" y2="170" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
                    <line x1="40" y1="170" x2="40" y2="20" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />

                    {/* Slope Triangle */}
                    {/* (40, 170) to (40 + run*25, 170) to (40 + run*25, 170 - rise*15) */}
                    {(() => {
                      const startX = 40;
                      const startY = 170;
                      const endX = Math.min(270, startX + run * 30);
                      const endY = Math.max(30, startY - rise * 15);
                      return (
                        <g>
                          {/* Triangle Area */}
                          <polygon
                            points={`${startX},${startY} ${endX},${startY} ${endX},${endY}`}
                            fill="rgba(158, 207, 196, 0.2)"
                            stroke="rgba(158, 207, 196, 0.4)"
                            strokeDasharray="4 2"
                          />
                          {/* Run line (horizontal) */}
                          <line x1={startX} y1={startY} x2={endX} y2={startY} stroke="#F5C77E" strokeWidth="3" />
                          <text x={(startX + endX) / 2} y={startY + 15} fill="#F5C77E" fontSize="11" textAnchor="middle" fontWeight="bold">
                            Run: {run}
                          </text>

                          {/* Rise line (vertical) */}
                          <line x1={endX} y1={startY} x2={endX} y2={endY} stroke="#F4A89A" strokeWidth="3" />
                          <text x={endX + 15} y={(startY + endY) / 2 + 4} fill="#F4A89A" fontSize="11" textAnchor="start" fontWeight="bold">
                            Rise: {rise}
                          </text>

                          {/* Hypotenuse / Slope */}
                          <line x1={startX} y1={startY} x2={endX} y2={endY} stroke="#9ECFC4" strokeWidth="4" strokeLinecap="round" />

                          {/* Game Character Emoji at Top of Slope */}
                          <text x={endX - 8} y={endY - 6} fontSize="18">
                            🧗
                          </text>
                          <text x={startX - 10} y={startY + 4} fontSize="12" fill="white">
                            (0,0)
                          </text>
                        </g>
                      );
                    })()}
                  </svg>

                  <div className="mt-2 text-center text-xs font-mono text-mint">
                    Gradient = Rise ÷ Run = {rise} ÷ {run} = <strong className="text-white text-sm">{gradient}</strong>
                  </div>
                </div>

                {/* Controls & Math Breakdown */}
                <div className="md:col-span-5 space-y-4">
                  <div className="card p-4 space-y-3 bg-gray-50 border border-gray-200">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-navy">
                      <Sliders className="w-3.5 h-3.5 text-teal" />
                      <span>Adjust Game Slope Parameters</span>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Rise (Vertical Height): <strong>{rise} blocks</strong></span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="8"
                        value={rise}
                        onChange={(e) => setRise(Number(e.target.value))}
                        className="w-full accent-teal cursor-pointer"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-gray-600 mb-1">
                        <span>Run (Horizontal Distance): <strong>{run} blocks</strong></span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="6"
                        value={run}
                        onChange={(e) => setRun(Number(e.target.value))}
                        className="w-full accent-amber-dark cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* Mathematical Emergence Box */}
                  <div className="card p-4 space-y-2 border-l-4 border-l-teal bg-white">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-teal">
                      The Algebraic Rule Emerges
                    </div>
                    <div className="text-sm font-bold text-navy">
                      Formula: y = {gradient}x
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Because the line starts at (0,0) and rises by {gradient} for every 1 step along, we write <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-teal">y = {gradient}x</code>.
                    </p>
                  </div>
                </div>
              </div>

              {/* Pupil Response / Notes Field */}
              <div className="card p-4 space-y-2">
                <label className="text-xs font-bold text-navy block">
                  Phoenix's Visual Explanation in His Own Words:
                </label>
                <textarea
                  rows={2}
                  value={savedNote}
                  onChange={(e) => setSavedNote(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:border-teal"
                />
              </div>
            </div>
          )}

          {activeTab === 'highwayman' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-light/30 border border-purple-light rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-purple-dark flex-shrink-0 mt-0.5" />
                <div className="text-xs text-navy/80 leading-relaxed">
                  <span className="font-bold text-purple-dark">Detective Method: </span>
                  Instead of writing long paragraphs, draw the metaphor scene first to unlock inference.
                </div>
              </div>

              {/* Text Clue Excerpt */}
              <div className="p-4 bg-gray-900 text-white rounded-2xl space-y-2 font-serif italic text-sm">
                <p>"The wind was a torrent of darkness among the gusty trees,</p>
                <p>The moon was a ghostly galleon tossed upon cloudy seas..."</p>
                <div className="text-[10px] text-white/50 font-sans not-italic pt-1">— Alfred Noyes, The Highwayman</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="card p-4 space-y-2 border-dashed border-2 border-gray-300 bg-gray-50/50 flex flex-col items-center justify-center text-center min-h-[160px]">
                  <span className="text-3xl">⛵☁️</span>
                  <div className="text-xs font-bold text-navy">Visual Scene Anchor</div>
                  <p className="text-[11px] text-gray-500">
                    A ship bouncing on stormy waves of dark clouds in the night sky.
                  </p>
                </div>

                <div className="card p-4 space-y-2">
                  <div className="text-xs font-bold text-navy">Detective Deduction:</div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    <strong>Question:</strong> What mood does the poet create?
                  </p>
                  <p className="text-xs text-teal font-medium bg-mint-pale/50 p-2.5 rounded-xl border border-mint/40">
                    "Ominous, eerie, and restless — the clouds look like turbulent sea waves, making the scene feel dangerous before the highwayman arrives."
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'fractions' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-light/30 border border-amber/50 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-amber-dark flex-shrink-0 mt-0.5" />
                <div className="text-xs text-navy/80 leading-relaxed">
                  <span className="font-bold text-amber-dark">Home Practice (Visual Mastery): </span>
                  Bar models and pizza slices help visualize fractions without numerical confusion.
                </div>
              </div>

              <div className="card p-5 space-y-4 bg-gray-50 border border-gray-200">
                <div className="text-xs font-bold text-navy">Visual Fraction Bar ({fractionNumerator}/{fractionDenominator})</div>

                {/* Interactive Bar */}
                <div className="h-10 w-full bg-white rounded-xl border border-gray-300 overflow-hidden flex">
                  {Array.from({ length: fractionDenominator }).map((_, i) => (
                    <div
                      key={i}
                      onClick={() => setFractionNumerator(i + 1)}
                      className={`flex-1 border-r border-gray-200 last:border-r-0 flex items-center justify-center text-xs font-bold cursor-pointer transition-colors ${
                        i < fractionNumerator
                          ? 'bg-amber-dark text-white'
                          : 'bg-white text-gray-400 hover:bg-amber-50'
                      }`}
                    >
                      1/{fractionDenominator}
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>Change Parts:</span>
                  {[2, 3, 4, 6, 8].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => {
                        setFractionDenominator(d);
                        setFractionNumerator(Math.min(fractionNumerator, d));
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold ${
                        fractionDenominator === d ? 'bg-navy text-white' : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      {d}ths
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Bottom Bar */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="text-xs text-gray-500">
            {stepCompleted ? (
              <span className="text-emerald-700 font-bold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Progress saved to Phoenix's timeline & shared with Dana!</span>
              </span>
            ) : (
              <span>Completing steps automatically updates Phoenix's strengths profile.</span>
            )}
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2 border border-gray-300 hover:bg-gray-100 rounded-xl text-xs font-semibold text-gray-700 cursor-pointer"
            >
              Close
            </button>
            <button
              onClick={handleSaveProgress}
              disabled={saving}
              className="flex-1 sm:flex-none px-4 py-2 bg-teal hover:bg-teal-medium text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer transition-all active:scale-95 flex items-center justify-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4 text-mint" />
              <span>{saving ? 'Saving...' : 'Mark Step Complete & Log Win'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
