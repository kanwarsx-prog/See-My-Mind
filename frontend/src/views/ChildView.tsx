import React, { useState } from 'react';
import { Child } from '../types';
import { VolumeX, Coffee, Compass, CheckCircle2 } from 'lucide-react';

interface ChildViewProps {
  child: Child;
}

export const ChildView: React.FC<ChildViewProps> = ({ child }) => {
  const [selectedMood, setSelectedMood] = useState<string | null>('😊');
  const [breakRequested, setBreakRequested] = useState<string | null>(null);

  const moods = [
    { emoji: '😊', label: 'Great', bg: 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800' },
    { emoji: '😐', label: 'Okay', bg: 'bg-amber-100 hover:bg-amber-200 text-amber-800' },
    { emoji: '😟', label: 'Worried', bg: 'bg-coral-100 hover:bg-coral-200 text-coral-800' },
    { emoji: '😴', label: 'Tired', bg: 'bg-purple-100 hover:bg-purple-200 text-purple-800' },
  ];

  const handleSupportClick = (item: string) => {
    setBreakRequested(item);
    setTimeout(() => setBreakRequested(null), 4000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Friendly greeting */}
      <div className="p-6 bg-gradient-to-r from-coral-light via-gold-light to-mint-light rounded-3xl text-center shadow-xs">
        <div className="text-4xl mb-2">⭐</div>
        <h2 className="text-2xl font-serif font-bold text-navy">Hi, {child.preferred_name || 'Phoenix'}!</h2>
        <p className="text-xs text-navy/70 mt-1 font-medium">How are you feeling right now?</p>
      </div>

      {/* Mood Selector Buttons */}
      <div className="card p-6 text-center space-y-4">
        <h3 className="text-sm font-bold text-navy">My Mood Check-in</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {moods.map((m) => (
            <button
              key={m.label}
              onClick={() => setSelectedMood(m.emoji)}
              className={`p-4 rounded-2xl flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                m.bg
              } ${selectedMood === m.emoji ? 'ring-4 ring-navy ring-offset-2 scale-105 shadow-md' : 'opacity-80'}`}
            >
              <span className="text-3xl">{m.emoji}</span>
              <span className="text-xs font-bold">{m.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Quick Help / Regulation Action Buttons */}
      <div className="card p-6 space-y-4">
        <h3 className="text-sm font-bold text-navy">Need Something? Tap Below</h3>

        {breakRequested ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-800 text-xs font-bold animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>Ms Johnson has been notified: "{breakRequested}"</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              onClick={() => handleSupportClick('5-minute movement break')}
              className="p-4 rounded-2xl bg-mint-pale border border-mint/40 hover:bg-mint-light text-teal flex items-center gap-3 transition-all cursor-pointer active:scale-95"
            >
              <Compass className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-bold">Movement Break</div>
                <div className="text-[10px] text-teal/70">5 minutes in quiet corner</div>
              </div>
            </button>

            <button
              onClick={() => handleSupportClick('Noise defenders requested')}
              className="p-4 rounded-2xl bg-purple-light/40 border border-purple-light hover:bg-purple-light/60 text-purple-dark flex items-center gap-3 transition-all cursor-pointer active:scale-95"
            >
              <VolumeX className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-bold">Noise Defenders</div>
                <div className="text-[10px] text-purple-dark/70">Quiet for assembly</div>
              </div>
            </button>

            <button
              onClick={() => handleSupportClick('Drink of water break')}
              className="p-4 rounded-2xl bg-amber-light/30 border border-amber/40 hover:bg-amber-light/50 text-amber-dark flex items-center gap-3 transition-all cursor-pointer active:scale-95"
            >
              <Coffee className="w-5 h-5" />
              <div className="text-left">
                <div className="text-xs font-bold">Drink of Water</div>
                <div className="text-[10px] text-amber-dark/70">Hydration pause</div>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Visual Schedule */}
      <div className="card p-6 space-y-3">
        <h3 className="text-sm font-bold text-navy">My Visual Schedule Today</h3>
        <div className="space-y-2 text-xs">
          <div className="p-3 bg-emerald-50 rounded-xl flex items-center justify-between border border-emerald-200/60 font-medium">
            <span>9:00am · Registration & Morning Welcome</span>
            <span className="text-emerald-700 font-bold">✓ Done</span>
          </div>
          <div className="p-3 bg-white rounded-xl flex items-center justify-between border border-gray-200 font-semibold text-navy">
            <span>9:30am · Maths (Straight Line Graphs)</span>
            <span className="bg-amber-100 text-amber-800 text-[10px] px-2 py-0.5 rounded-full">Now</span>
          </div>
          <div className="p-3 bg-gray-50 rounded-xl flex items-center justify-between border border-gray-100 text-gray-500">
            <span>10:30am · Breaktime (Playground / Quiet Hub)</span>
            <span>Up Next</span>
          </div>
        </div>
      </div>
    </div>
  );
};
