import React, { useState } from 'react';
import { Child } from '../types';
import { VolumeX, Compass, CheckCircle2, Headphones, Sparkles, BookOpen, Heart } from 'lucide-react';

interface ChildViewProps {
  child: Child;
  onCheckIn?: (checkIn: {
    mood_emoji: string;
    mood_label: string;
    energy_level?: number;
    self_regulation_need?: string;
  }) => Promise<void>;
  onOpenWorksheet: (worksheetKey: string) => void;
}

export const ChildView: React.FC<ChildViewProps> = ({ child, onCheckIn, onOpenWorksheet }) => {
  const [selectedMood, setSelectedMood] = useState<string>('🙂');
  const [breakRequested, setBreakRequested] = useState<string | null>(null);

  const emojis = [
    { emoji: '😄', label: 'Great' },
    { emoji: '🙂', label: 'Good' },
    { emoji: '😐', label: 'Okay' },
    { emoji: '😟', label: 'Wobbly' },
    { emoji: '😰', label: 'Overwhelmed' },
  ];

  const handleMoodSelect = async (emoji: string, label: string) => {
    setSelectedMood(emoji);
    if (onCheckIn) {
      await onCheckIn({
        mood_emoji: emoji,
        mood_label: label,
        energy_level: label === 'Great' ? 5 : label === 'Good' ? 4 : label === 'Okay' ? 3 : 2,
      });
    }
  };

  const handleSupportClick = async (item: string) => {
    setBreakRequested(item);
    if (onCheckIn) {
      await onCheckIn({
        mood_emoji: '✋',
        mood_label: 'Break Requested',
        self_regulation_need: item,
      });
    }
    setTimeout(() => setBreakRequested(null), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* CHILD HERO GREETING & EMOJI CHECK-IN */}
      <div className="card p-6 bg-gradient-to-br from-[#1A3A4A] via-[#2D5A6E] to-[#1A3A4A] text-white rounded-3xl text-center shadow-lg relative overflow-hidden">
        <div className="absolute right-4 top-2 text-7xl opacity-5 select-none pointer-events-none">⭐</div>
        <div className="font-serif text-2xl font-bold mb-1">
          How are you feeling right now, {child.preferred_name || 'Phoenix'}?
        </div>
        <p className="text-xs text-white/60 mb-5 max-w-md mx-auto">
          Tap the face that feels right today. Nobody judges — this is just for you.
        </p>

        {/* Emoji Selector Row */}
        <div className="flex justify-center items-center gap-3 sm:gap-4 mb-4">
          {emojis.map((em) => (
            <button
              key={em.label}
              type="button"
              onClick={() => handleMoodSelect(em.emoji, em.label)}
              className={`w-13 h-13 sm:w-16 sm:h-16 rounded-2xl flex flex-col items-center justify-center transition-all cursor-pointer ${
                selectedMood === em.emoji
                  ? 'bg-white text-navy scale-110 shadow-xl ring-4 ring-mint'
                  : 'bg-white/10 hover:bg-white/20 text-white opacity-85'
              }`}
            >
              <span className="text-2xl sm:text-3xl">{em.emoji}</span>
              <span className="text-[9px] font-bold mt-0.5">{em.label}</span>
            </button>
          ))}
        </div>

        <div className="text-[11px] text-mint flex items-center justify-center gap-1.5 font-medium">
          <Headphones className="w-3.5 h-3.5" />
          <span>Your noise defenders are in your tray if you need them. No asking needed.</span>
        </div>
      </div>

      {/* QUICK HELP STRIP */}
      {breakRequested ? (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>Ms Johnson has been notified quietly: "{breakRequested}"</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={() => handleSupportClick('Calm corner break')}
            className="p-3 bg-mint-pale hover:bg-mint-light/60 border border-mint/40 rounded-2xl flex items-center gap-3 text-teal font-bold text-xs transition-all cursor-pointer active:scale-95"
          >
            <Compass className="w-4 h-4" />
            <div className="text-left">
              <div>Go to Calm Corner</div>
              <div className="text-[10px] text-teal/70 font-normal">By the window in Room 4</div>
            </div>
          </button>

          <button
            onClick={() => handleSupportClick('Noise defenders needed')}
            className="p-3 bg-purple-light/40 hover:bg-purple-light/70 border border-purple-light rounded-2xl flex items-center gap-3 text-purple-dark font-bold text-xs transition-all cursor-pointer active:scale-95"
          >
            <VolumeX className="w-4 h-4" />
            <div className="text-left">
              <div>Put on Headphones</div>
              <div className="text-[10px] text-purple-dark/70 font-normal">Quiet focus mode</div>
            </div>
          </button>

          <button
            onClick={() => handleSupportClick('Drink of water & cracker')}
            className="p-3 bg-amber-light/30 hover:bg-amber-light/60 border border-amber/40 rounded-2xl flex items-center gap-3 text-amber-dark font-bold text-xs transition-all cursor-pointer active:scale-95"
          >
            <Heart className="w-4 h-4" />
            <div className="text-left">
              <div>Water & Snack</div>
              <div className="text-[10px] text-amber-dark/70 font-normal">Melissa has snacks ready</div>
            </div>
          </button>
        </div>
      )}

      {/* TWO COLUMNS: WINS & WORKSHEETS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Today's Wins & Toolkit */}
        <div className="lg:col-span-6 space-y-5">
          {/* Today's Wins Card */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-base">⭐</span>
                <h3 className="text-sm font-bold text-navy">Today's Wins</h3>
              </div>
              <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                4 Celebrations
              </span>
            </div>

            <div className="noya-block">
              <div className="text-[10px] font-bold text-mint uppercase tracking-wider mb-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                <span>✦ Noya says:</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed font-normal">
                You drew a gradient triangle in maths today — completely on your own! Ms Johnson noticed. You know how a game character moves up a slope? That is literally what gradient means. You just did real game design maths without even knowing it! 🎮
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-2.5 border border-gray-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="text-navy font-medium">Used headphones in assembly — and it worked brilliantly!</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-2.5 border border-gray-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="text-navy font-medium">Stayed in class even when you felt wobbly at 10:00am</span>
              </div>
              <div className="p-2.5 bg-amber-50/60 rounded-xl flex items-center gap-2.5 border border-amber-200/50">
                <span className="w-5 h-5 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-bold text-[10px]">
                  ⭐
                </span>
                <span className="text-navy font-bold">Drew the gradient triangle independently (Rise 6 ÷ Run 2 = 3)</span>
              </div>
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-2.5 border border-gray-100">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-[10px]">
                  ✓
                </span>
                <span className="text-navy font-medium">Rated your day honestly — that's strong self-awareness</span>
              </div>
            </div>
          </div>

          {/* My Toolkit Today */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <Compass className="w-4 h-4 text-teal" />
              <h3 className="text-sm font-bold text-navy">My Toolkit Today</h3>
            </div>
            <p className="text-[11px] text-gray-500">Things that help — ready whenever you need them</p>

            <div className="space-y-2 text-xs">
              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
                <span className="text-xl">🎧</span>
                <div>
                  <div className="font-bold text-navy">Noise-Cancelling Headphones</div>
                  <div className="text-[10px] text-gray-500">In your tray. Use them whenever you want. No permission needed.</div>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
                <span className="text-xl">🧘</span>
                <div>
                  <div className="font-bold text-navy">Calm Corner</div>
                  <div className="text-[10px] text-gray-500">Room 4, by the window with cushions and sensory timer.</div>
                </div>
              </div>

              <div className="p-2.5 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-100">
                <span className="text-xl">👫</span>
                <div>
                  <div className="font-bold text-navy">Buddy: Jake O'Brien</div>
                  <div className="text-[10px] text-gray-500">Sit with Jake in hall assembly. You two work well together.</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Interactive Worksheets & Game Designer Goal */}
        <div className="lg:col-span-6 space-y-5">
          {/* ⭐ MY WORKSHEETS CARD */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-teal" />
                <h3 className="text-sm font-bold text-navy">📚 My Worksheets</h3>
              </div>
              <span className="text-[10px] text-gray-400">Your work · your way · tap to open</span>
            </div>

            {/* Maths Worksheet Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-teal to-[#1A3A4A] text-white space-y-2.5 relative overflow-hidden shadow-xs">
              <div className="absolute right-3 top-2 text-5xl opacity-10 select-none">📐</div>
              <div className="font-serif text-sm font-bold">Maths — Straight Line Graphs</div>
              <p className="text-[11px] text-white/70">
                Draw first. Understand second. The algebra equation comes last.
              </p>

              <div className="flex flex-wrap gap-1.5 py-1">
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[9px] font-semibold">
                  ✓ Step 1 Done
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-teal text-[9px] font-bold">
                  → Step 2 Now
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[9px]">
                  Step 3
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[9px]">
                  Step 4
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-white/70">
                  Today you drew the gradient triangle on your own ⭐
                </span>
                <button
                  type="button"
                  onClick={() => onOpenWorksheet('graphs')}
                  className="px-3 py-1.5 bg-white hover:bg-mint text-navy font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Open →</span>
                </button>
              </div>
            </div>

            {/* English Worksheet Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-dark to-[#1A3A4A] text-white space-y-2.5 relative overflow-hidden shadow-xs">
              <div className="absolute right-3 top-2 text-5xl opacity-10 select-none">📖</div>
              <div className="font-serif text-sm font-bold">English — The Highwayman</div>
              <p className="text-[11px] text-white/70">
                The detective method — find the clue, draw it, write what it means.
              </p>

              <div className="flex flex-wrap gap-1.5 py-1">
                <span className="px-2 py-0.5 rounded-md bg-white/20 text-white text-[9px] font-semibold">
                  ✓ Section 1
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white text-purple-dark text-[9px] font-bold">
                  → Section 2
                </span>
                <span className="px-2 py-0.5 rounded-md bg-white/10 text-white/60 text-[9px]">
                  Section 3+
                </span>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-white/70">
                  Draw the ghostly galleon scene before writing
                </span>
                <button
                  type="button"
                  onClick={() => onOpenWorksheet('highwayman')}
                  className="px-3 py-1.5 bg-white hover:bg-purple-light text-navy font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Open →</span>
                </button>
              </div>
            </div>

            {/* Fractions Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-dark to-[#1A3A4A] text-white space-y-2.5 relative overflow-hidden shadow-xs">
              <div className="absolute right-3 top-2 text-5xl opacity-10 select-none">🍕</div>
              <div className="font-serif text-sm font-bold">Maths — Fractions Visual Mastery</div>
              <p className="text-[11px] text-white/70">
                Home practice with Mum · Pizzas, cakes, bars — draw every answer.
              </p>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-white/70">
                  12 visual challenges · you can do this with Mum
                </span>
                <button
                  type="button"
                  onClick={() => onOpenWorksheet('fractions')}
                  className="px-3 py-1.5 bg-white hover:bg-amber-light text-navy font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer flex items-center gap-1 active:scale-95"
                >
                  <span>Open →</span>
                </button>
              </div>
            </div>
          </div>

          {/* My Path — Game Designer */}
          <div className="card p-5 space-y-3">
            <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
              <span className="text-base">🎮</span>
              <h3 className="text-sm font-bold text-navy">My Path — Game Designer</h3>
            </div>

            <div className="p-3 bg-gold-light/60 rounded-xl border border-gold/40 text-xs">
              <div className="text-[10px] font-bold text-[#7A5A00] uppercase tracking-wider mb-1">
                ✦ Goal Check
              </div>
              <p className="text-navy leading-relaxed">
                You want to make games. Game designers need spatial thinking, maths, code logic, and storytelling. You're already building 3 of those 4!
              </p>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="font-medium text-navy">🧩 Spatial reasoning (shapes & movement)</span>
                <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">✓ Strong</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100">
                <span className="font-medium text-navy">🔍 Pattern recognition (spotting rules)</span>
                <span className="text-emerald-700 font-bold text-[10px] bg-emerald-100 px-2 py-0.5 rounded-full">✓ Strong</span>
              </div>
              <div className="p-2 bg-amber-50/60 rounded-xl flex items-center justify-between border border-amber-200/50">
                <span className="font-bold text-navy">📐 Maths foundations (graphs & slopes)</span>
                <span className="text-amber-800 font-bold text-[10px] bg-amber-200 px-2 py-0.5 rounded-full">→ Step 2 of 4</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100 opacity-60">
                <span className="text-gray-600">💻 Code logic (Scratch & Python)</span>
                <span className="text-gray-500 text-[10px]">Next Term</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
