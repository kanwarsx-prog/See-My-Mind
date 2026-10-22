import React from 'react';
import { Database, UserCheck } from 'lucide-react';
import { Child } from '../types';

interface TopBarProps {
  title: string;
  subtitle: string;
  pills?: { label: string; color: 'red' | 'amber' | 'gold' | 'green' | 'teal' | 'purple' }[];
  actionButton?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  pupils?: Child[];
  selectedChildId?: string;
  onSelectChild?: (childId: string) => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  title,
  subtitle,
  pills = [],
  actionButton,
  pupils,
  selectedChildId,
  onSelectChild,
}) => {
  const pillColors = {
    red: 'bg-coral-light text-coral-dark',
    amber: 'bg-amber-light text-amber-dark',
    gold: 'bg-gold-light text-[#7A5A00]',
    green: 'bg-green-light text-[#1f6040]',
    teal: 'bg-mint-pale text-teal',
    purple: 'bg-purple-light text-purple-dark',
  };

  return (
    <header className="sticky top-0 z-20 bg-white border-b border-[#EDF2F4] px-7 py-3.5 flex flex-wrap items-center justify-between gap-3 shadow-sm">
      <div className="flex items-center gap-4">
        <div>
          <h1 className="text-base font-semibold text-navy tracking-tight">{title}</h1>
          <p className="text-xs text-gray-500 font-normal">{subtitle}</p>
        </div>

        {pupils && pupils.length > 1 && onSelectChild && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-teal" />
            <select
              value={selectedChildId}
              onChange={(e) => onSelectChild(e.target.value)}
              className="text-xs font-semibold text-navy bg-transparent border-none focus:outline-none cursor-pointer"
            >
              {pupils.map((p) => (
                <option key={p.id} value={p.id}>
                  Pupil: {p.full_name || `${p.first_name} ${p.last_name}`} ({p.year_group || 'SEND'})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2.5">
        {/* Render/Supabase cloud status badge */}
        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-medium mr-2">
          <Database className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
          <span>Live · Supabase EU-West-1</span>
        </div>

        {pills.map((p, idx) => (
          <span
            key={idx}
            className={`text-[11px] font-semibold px-3 py-1 rounded-full whitespace-nowrap shadow-2xs ${
              pillColors[p.color]
            }`}
          >
            {p.label}
          </span>
        ))}

        {actionButton && (
          <button
            onClick={actionButton.onClick}
            className="flex items-center gap-1.5 bg-teal hover:bg-teal-medium text-white px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all ml-1 cursor-pointer active:scale-95"
          >
            {actionButton.icon}
            <span>{actionButton.label}</span>
          </button>
        )}
      </div>
    </header>
  );
};
