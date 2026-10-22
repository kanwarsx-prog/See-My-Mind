import React from 'react';
import { RoleView } from '../types';
import { Sparkles, GraduationCap, ShieldCheck, HeartHandshake, User, Users, Briefcase } from 'lucide-react';

interface SidebarProps {
  activeView: RoleView;
  onViewChange: (view: RoleView) => void;
  unreadCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeView, onViewChange, unreadCount = 3 }) => {
  const users = {
    teacher: { av: 'MJ', name: 'Ms Johnson', role: 'Year 5 Teacher · Room 4', bg: '#5E4D9A' },
    senco: { av: 'MO', name: 'Ms Okafor', role: 'SENCO · Inclusion Lead', bg: '#2A6B62' },
    parent: { av: 'DC', name: 'Dana Carter', role: "Phoenix's Mum", bg: '#B87A2A' },
    child: { av: '🧒', name: 'Phoenix Carter', role: 'Year 5 · St. Jude’s', bg: '#C5503E' },
    ta: { av: 'MG', name: 'Melissa Grant', role: 'Teaching Assistant', bg: '#4CAF82' },
    parentplus: { av: 'DC', name: 'Dana Carter', role: "Phoenix's Mum · Parent Plus", bg: '#E8B84B' },
  };

  const currentUser = users[activeView];

  return (
    <aside className="w-64 bg-navy text-white min-h-screen flex flex-col fixed left-0 top-0 z-30 shadow-lg select-none">
      {/* Brand header */}
      <div className="p-4 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-coral via-amber to-mint flex items-center justify-center p-0.5 shadow-sm">
          <div className="w-full h-full bg-navy rounded-full flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-mint" />
          </div>
        </div>
        <div>
          <div className="font-serif font-bold text-base tracking-wide text-white">See My Mind</div>
          <div className="text-[10px] text-white/40 tracking-wider uppercase font-medium">St. Jude's Academy</div>
        </div>
      </div>

      {/* Navigation section */}
      <div className="px-3 py-4">
        <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase px-3 mb-2">Platform Spine</div>
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/80 bg-white/5 text-xs font-medium mb-1">
          <Sparkles className="w-4 h-4 text-amber" />
          <span>NOYA Intelligence Engine</span>
          <span className="ml-auto bg-mint/20 text-mint text-[9px] font-bold px-1.5 py-0.5 rounded-full">v2.0</span>
        </div>
      </div>

      {/* Role View Switcher */}
      <div className="px-3 flex-1">
        <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase px-3 mb-2 flex items-center justify-between">
          <span>Persona Views</span>
          <span className="text-[9px] lowercase font-normal text-white/20">Click to switch</span>
        </div>

        <div className="space-y-1">
          <button
            onClick={() => onViewChange('teacher')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeView === 'teacher'
                ? 'bg-purple-dark text-white shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <GraduationCap className="w-4 h-4 text-purple-light" />
            <span>👩‍🏫 Teacher — Ms Johnson</span>
          </button>

          <button
            onClick={() => onViewChange('senco')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeView === 'senco'
                ? 'bg-teal text-white shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-mint" />
            <span>🗂 SENCO — Ms Okafor</span>
            <span className="ml-auto bg-coral text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">
              {unreadCount}
            </span>
          </button>

          <button
            onClick={() => onViewChange('parent')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeView === 'parent'
                ? 'bg-amber-dark text-white shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <HeartHandshake className="w-4 h-4 text-amber-light" />
            <span>👩‍👦 Parent — Dana Carter</span>
          </button>

          <button
            onClick={() => onViewChange('child')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeView === 'child'
                ? 'bg-coral-dark text-white shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <User className="w-4 h-4 text-coral-light" />
            <span>⭐ Phoenix's View (Pupil)</span>
          </button>

          <button
            onClick={() => onViewChange('ta')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeView === 'ta'
                ? 'bg-green text-white shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Users className="w-4 h-4 text-green-light" />
            <span>🧑‍🤝‍🧑 TA — Melissa Grant</span>
          </button>

          <button
            onClick={() => onViewChange('parentplus')}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
              activeView === 'parentplus'
                ? 'bg-gold text-navy shadow-md font-bold'
                : 'text-white/60 hover:text-white hover:bg-white/5'
            }`}
          >
            <Briefcase className="w-4 h-4 text-gold-light" />
            <span>🎯 Parent Plus (Year 10+)</span>
            <span className="ml-auto bg-white/20 text-[8px] font-extrabold px-1.5 py-0.5 rounded tracking-wider">PLUS</span>
          </button>
        </div>
      </div>

      {/* User profile card */}
      <div className="p-3 border-t border-white/10 bg-black/10 mt-auto">
        <div className="flex items-center gap-3 p-2 rounded-xl bg-white/5">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0"
            style={{ backgroundColor: currentUser.bg }}
          >
            {currentUser.av}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
            <div className="text-[10px] text-white/40 truncate">{currentUser.role}</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
