import React, { useState } from 'react';
import { DecompressionBridgeResponse } from '../types';
import {
  Battery,
  BatteryWarning,
  BatteryCharging,
  Eye,
  Sparkles,
  VolumeX,
  Coffee,
  Gamepad2,
  Copy,
  Check,
  AlertTriangle,
  HeartHandshake,
  Clock,
  ShieldCheck,
} from 'lucide-react';

interface DecompressionBridgeCardProps {
  bridge: DecompressionBridgeResponse;
  childName?: string;
}

export const DecompressionBridgeCard: React.FC<DecompressionBridgeCardProps> = ({
  bridge,
  childName = 'Phoenix',
}) => {
  const [copied, setCopied] = useState(false);

  const getBatteryIcon = (pct: number) => {
    if (pct < 35) return <BatteryWarning className="w-6 h-6 text-rose-500 animate-pulse" />;
    if (pct < 65) return <Battery className="w-6 h-6 text-amber-500" />;
    return <BatteryCharging className="w-6 h-6 text-emerald-500" />;
  };

  const getBatteryGradient = (pct: number) => {
    if (pct < 35) return 'from-rose-500 via-rose-400 to-amber-400';
    if (pct < 65) return 'from-amber-500 via-yellow-400 to-emerald-400';
    return 'from-emerald-500 to-teal-400';
  };

  const getStepIcon = (iconType: string) => {
    switch (iconType) {
      case 'Door':
        return <HeartHandshake className="w-5 h-5 text-indigo-500" />;
      case 'VolumeX':
        return <VolumeX className="w-5 h-5 text-purple-500" />;
      case 'Coffee':
        return <Coffee className="w-5 h-5 text-amber-500" />;
      case 'Gamepad2':
        return <Gamepad2 className="w-5 h-5 text-teal-600" />;
      default:
        return <Sparkles className="w-5 h-5 text-gold" />;
    }
  };

  const handleCopyRecipe = () => {
    const text = `Tonight's Home Decompression Recipe for ${childName} (${bridge.battery_percentage}% Sensory Battery - ${bridge.masking_level}):\n` +
      bridge.decompression_recipe.map(r => `• Step ${r.step} (${r.subtitle}): ${r.title} - ${r.description}`).join('\n') +
      `\n\nTips: ${bridge.recommended_evening_activities.join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 1. Sensory Battery & Masking Prediction Hero Banner */}
      <div className="card p-6 bg-gradient-to-br from-navy via-navy-light to-navy text-white rounded-2xl shadow-lg relative overflow-hidden">
        {/* Soft decorative glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-teal-300 bg-teal-500/20 px-2.5 py-1 rounded-full">
                3:15 PM Decompression Bridge
              </span>
              <span className="text-xs text-white/60">Adult Observation Prediction</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-white mt-1.5">
              {childName}'s Post-School Sensory Battery
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyRecipe}
              className="px-3.5 py-1.5 bg-white/10 hover:bg-white/20 active:scale-95 text-xs text-white rounded-xl flex items-center gap-1.5 transition-all cursor-pointer border border-white/10"
              title="Copy tonight's recipe to share with family"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Recipe!' : 'Share Recipe'}</span>
            </button>
          </div>
        </div>

        {/* Sensory Battery Visual Gauge */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-7 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2 text-white/90">
                {getBatteryIcon(bridge.battery_percentage)}
                <span className="font-bold text-sm tracking-wide">
                  {bridge.battery_status}
                </span>
              </div>
              <span className="text-lg font-bold text-white font-mono">
                {bridge.battery_percentage}%
              </span>
            </div>

            {/* Glowing Battery Progress Bar */}
            <div className="w-full bg-white/15 h-4 rounded-full overflow-hidden p-0.5 border border-white/20 shadow-inner">
              <div
                className={`h-full rounded-full bg-gradient-to-r ${getBatteryGradient(
                  bridge.battery_percentage
                )} transition-all duration-1000 shadow-md`}
                style={{ width: `${bridge.battery_percentage}%` }}
              />
            </div>

            <div className="flex justify-between text-[11px] text-white/50 pt-1 font-medium">
              <span>0% Empty (Meltdown Zone)</span>
              <span>50% Amber Reserve</span>
              <span>100% Regulated</span>
            </div>
          </div>

          {/* Masking Decoder pill badge */}
          <div className="md:col-span-5 bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10">
            <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertTriangle className="w-4 h-4 text-amber-300" />
              <span>{bridge.masking_level}</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed">
              Synthesized purely from adult logs (Teacher, TA, Morning check-in). Zero recording pressure placed on {childName}.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Hidden Classroom Masking Decoder (Empathy Banner) */}
      <div className="card p-5 bg-gradient-to-r from-amber-50 via-white to-amber-50/20 border-l-4 border-l-amber-500 shadow-xs">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0 mt-0.5">
            <Eye className="w-5 h-5 text-amber-700" />
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-bold text-navy flex items-center gap-2">
              <span>Understanding Today's Masking at St. Jude's</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                Restraint Collapse Decoder
              </span>
            </h3>
            <p className="text-xs text-gray-700 mt-1.5 leading-relaxed">
              {bridge.masking_explanation}
            </p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-2 border-t border-amber-200/50">
              <div className="bg-rose-50/70 p-2.5 rounded-xl border border-rose-100">
                <div className="text-[11px] font-bold text-rose-800 flex items-center gap-1.5 mb-1">
                  <span>⚡ Draining Sensory Demands</span>
                </div>
                <ul className="space-y-1 text-[11px] text-rose-700 list-disc list-inside">
                  {bridge.draining_factors.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                <div className="text-[11px] font-bold text-emerald-800 flex items-center gap-1.5 mb-1">
                  <span>🌱 Protective School Anchors</span>
                </div>
                <ul className="space-y-1 text-[11px] text-emerald-700 list-disc list-inside">
                  {bridge.recharging_factors.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Adult Observation Clues (What Staff & Parents Noticed) */}
      <div className="card p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-teal" />
            <h3 className="text-sm font-bold text-navy">Adult Observation Ring (Today's Evidence)</h3>
          </div>
          <span className="text-[10px] font-semibold text-gray-400">Adult proxy synthesis · No child app demand</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {bridge.adult_observation_clues.map((clue, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl bg-gray-50 hover:bg-gray-100/80 transition-colors border border-gray-100 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-bold text-navy">{clue.source}</span>
                  <div className="flex items-center gap-1.5 text-gray-400 text-[10px]">
                    <Clock className="w-3 h-3" />
                    <span>{clue.time}</span>
                  </div>
                </div>
                <div className="text-[10px] uppercase font-bold text-teal tracking-wide mb-1">
                  {clue.role} · {clue.marker_type}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed italic">
                  "{clue.observation}"
                </p>
              </div>
              <div className="mt-2.5 pt-2 border-t border-gray-200/60 flex items-center justify-between text-[11px]">
                <span className="text-gray-400 text-[10px]">Significance:</span>
                <span className="font-semibold text-navy text-[11px]">{clue.significance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Tonight's Step-by-Step Home Decompression Recipe */}
      <div className="card p-5 space-y-4 border border-teal/20 bg-gradient-to-b from-white to-mint/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-dark" />
              <h3 className="text-sm font-bold text-navy">Tonight's Step-by-Step Decompression Recipe</h3>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Targeted arrival sequence for {childName} based on today's acoustic and cognitive load.
            </p>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-teal/10 text-teal-dark self-start sm:self-auto">
            Ready for 3:30 PM Pickup
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {bridge.decompression_recipe.map((step) => (
            <div
              key={step.step}
              className="p-4 rounded-xl bg-white border border-gray-100 shadow-xs hover:border-teal/40 transition-all flex items-start gap-3.5"
            >
              <div className="w-9 h-9 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                {getStepIcon(step.icon_type)}
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal">
                    Step {step.step} · {step.subtitle}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                    {step.tag}
                  </span>
                </div>
                <h4 className="text-xs font-bold text-navy">{step.title}</h4>
                <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calming evening activities */}
        <div className="p-3.5 rounded-xl bg-teal-50/60 border border-teal-100 text-xs space-y-2">
          <div className="font-bold text-teal-900 flex items-center gap-1.5">
            <span>✨ Recommended Screen-Free Recovery Ideas</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-teal-800 text-[11px]">
            {bridge.recommended_evening_activities.map((act, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500 flex-shrink-0" />
                <span>{act}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
