import React from 'react';
import { RoleView, UserProfile } from '../types';
import {
  Sparkles,
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  User,
  Users,
  LogOut,
  Repeat,
  FileText,
  Clock,
  BookOpen,
  Award,
  Sun,
  Layers,
  BatteryCharging,
  Pill,
  X,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  icon: any;
  action?: () => void;
}

interface PersonaInfo {
  av: string;
  name: string;
  roleTitle: string;
  sub: string;
  bg: string;
  icon: any;
  navItems: NavItem[];
}

interface SidebarProps {
  activeView: RoleView;
  currentUser?: UserProfile | null;
  activeNavId?: string;
  onSelectNav?: (navId: string) => void;
  onLogout: () => void;
  onSwitchPersona: () => void;
  onRegisterChild?: () => void;
  onOpenWorksheet?: (key: string) => void;
  onOpenObservationModal?: () => void;
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  currentUser,
  activeNavId,
  onSelectNav,
  onLogout,
  onSwitchPersona,
  onRegisterChild,
  onOpenWorksheet,
  onOpenObservationModal,
  isMobileOpen = false,
  onCloseMobile,
}) => {
  const scrollTo = (id: string) => {
    setTimeout(() => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
  };

  const personaDict: Record<RoleView, PersonaInfo> = {
    teacher: {
      av: 'MJ',
      name: currentUser?.full_name || 'Ms Clara Johnson',
      roleTitle: 'Classroom Teacher',
      sub: 'Year 5 · Room 4',
      bg: '#5E4D9A',
      icon: GraduationCap,
      navItems: [
        {
          id: 'room4-matrix',
          label: 'Room 4 Classroom Hub',
          icon: Layers,
          action: () => {
            onSelectNav?.('room4-matrix');
          },
        },
        {
          id: 'preflight-handover',
          label: 'Pre-Flight Handovers',
          icon: Sun,
          action: () => {
            onSelectNav?.('preflight-handover');
            scrollTo('preflight-handover');
          },
        },
        {
          id: 'lesson-pathways',
          label: 'Adapted Lesson Pathways',
          icon: BookOpen,
          action: () => {
            onSelectNav?.('lesson-pathways');
            if (onOpenWorksheet) {
              onOpenWorksheet('graphs');
            } else {
              scrollTo('adapted-pathway');
            }
          },
        },
        {
          id: 'evidence-logs',
          label: 'Daily Evidence Logs',
          icon: FileText,
          action: () => {
            onSelectNav?.('evidence-logs');
            if (onOpenObservationModal) {
              onOpenObservationModal();
            } else {
              scrollTo('daily-evidence-timeline');
            }
          },
        },
      ],
    },
    senco: {
      av: 'MO',
      name: currentUser?.full_name || 'Amara Okafor',
      roleTitle: 'SENCO & Inclusion Lead',
      sub: 'Whole School SEND',
      bg: '#2A6B62',
      icon: ShieldCheck,
      navItems: [
        {
          id: 'provision_map',
          label: 'Inclusion & Caseload',
          icon: Layers,
          action: () => {
            onSelectNav?.('provision_map');
          },
        },
        {
          id: 'register_pupil',
          label: '+ Register SEND Pupil',
          icon: FileText,
          action: () => {
            onSelectNav?.('register_pupil');
            onRegisterChild?.();
          },
        },
        {
          id: 'review_pack',
          label: 'Statutory EHCP Plans',
          icon: BookOpen,
          action: () => {
            onSelectNav?.('review_pack');
          },
        },
        {
          id: 'assistant',
          label: 'NOYA Longitudinal Query',
          icon: Sparkles,
          action: () => {
            onSelectNav?.('assistant');
          },
        },
      ],
    },
    parent: {
      av: 'DC',
      name: currentUser?.full_name || 'Dana Carter',
      roleTitle: 'Parent & Guardian',
      sub: "Phoenix's Home Hub",
      bg: '#B87A2A',
      icon: HeartHandshake,
      navItems: [
        {
          id: 'bridge',
          label: '3:15 PM Decompression Bridge',
          icon: BatteryCharging,
          action: () => {
            onSelectNav?.('bridge');
          },
        },
        {
          id: 'handover',
          label: '24-Hour Handover Loop',
          icon: Clock,
          action: () => {
            onSelectNav?.('handover');
          },
        },
        {
          id: 'correlation',
          label: 'Medication & Routine Digest',
          icon: Pill,
          action: () => {
            onSelectNav?.('correlation');
          },
        },
        {
          id: 'wins',
          label: 'Wins & Strengths Space',
          icon: Award,
          action: () => {
            onSelectNav?.('wins');
          },
        },
      ],
    },
    child: {
      av: currentUser?.avatar_emoji || '🧒',
      name: currentUser?.full_name || 'Phoenix Carter',
      roleTitle: 'Pupil Voice',
      sub: 'Year 5 · St. Jude’s',
      bg: '#C5503E',
      icon: User,
      navItems: [
        {
          id: 'child-checkin',
          label: 'My Mood Check-In',
          icon: Sun,
          action: () => {
            onSelectNav?.('child-checkin');
            scrollTo('child-mood-checkin');
          },
        },
        {
          id: 'child-wins',
          label: 'My Star Wins',
          icon: Award,
          action: () => {
            onSelectNav?.('child-wins');
            scrollTo('child-star-wins');
          },
        },
        {
          id: 'child-worksheets',
          label: 'Interactive Worksheets',
          icon: BookOpen,
          action: () => {
            onSelectNav?.('child-worksheets');
            onOpenWorksheet?.('graphs');
          },
        },
      ],
    },
    ta: {
      av: 'MG',
      name: currentUser?.full_name || 'Melissa Grant',
      roleTitle: 'Teaching Assistant',
      sub: '1-to-1 Support Focus',
      bg: '#4CAF82',
      icon: Users,
      navItems: [
        {
          id: 'ta-hub',
          label: '1-to-1 Support Hub',
          icon: Layers,
          action: () => {
            onSelectNav?.('ta-hub');
            scrollTo('ta-support-hub');
          },
        },
        {
          id: 'ta-schedule',
          label: 'High-Risk Schedule',
          icon: Clock,
          action: () => {
            onSelectNav?.('ta-schedule');
            scrollTo('ta-high-risk-schedule');
          },
        },
        {
          id: 'ta-micrologs',
          label: 'Rapid Micro-Logs',
          icon: FileText,
          action: () => {
            onSelectNav?.('ta-micrologs');
            if (onOpenObservationModal) {
              onOpenObservationModal();
            } else {
              scrollTo('ta-quick-log');
            }
          },
        },
      ],
    },
    parentplus: {
      av: 'DC',
      name: currentUser?.full_name || 'Dana Carter',
      roleTitle: 'Parent Plus (Post-16)',
      sub: 'Longitudinal Pathways',
      bg: '#E8B84B',
      icon: Award,
      navItems: [
        {
          id: 'post16-hub',
          label: 'Post-16 Careers Hub',
          icon: Layers,
          action: () => {
            onSelectNav?.('post16-hub');
          },
        },
      ],
    },
  };

  const personaMeta = personaDict[activeView] || personaDict.teacher;
  const RoleIcon = personaMeta.icon;

  // Active check helper
  const isItemActive = (item: NavItem, idx: number) => {
    if (activeNavId) {
      return activeNavId === item.id;
    }
    return idx === 0;
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 lg:w-64 bg-navy text-white min-h-screen flex flex-col justify-between border-r border-white/10 shadow-2xl select-none transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:z-30 ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Brand header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-coral via-amber to-mint flex items-center justify-center p-0.5 shadow-sm">
                <div className="w-full h-full bg-navy rounded-[14px] flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-mint" />
                </div>
              </div>
              <div>
                <div className="font-serif font-bold text-base tracking-wide text-white">See My Mind</div>
                <div className="text-[10px] text-white/40 tracking-wider uppercase font-medium">
                  St. Jude&apos;s Academy
                </div>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="lg:hidden w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
                title="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Current Authenticated Persona Banner */}
          <div className="p-3.5 mx-3 mt-4 rounded-2xl bg-white/5 border border-white/10">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs text-white shadow-sm flex-shrink-0"
                style={{ backgroundColor: personaMeta.bg }}
              >
                {personaMeta.av}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate">{personaMeta.name}</div>
                <div className="text-[10px] text-teal flex items-center gap-1 font-semibold truncate">
                  <RoleIcon className="w-3 h-3 flex-shrink-0" />
                  <span>{personaMeta.roleTitle}</span>
                </div>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/50">
              <span>{personaMeta.sub}</span>
              <span className="px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[9px]">
                Active Role
              </span>
            </div>
          </div>

          {/* Platform Spine Status */}
          <div className="px-3 py-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-white/70 bg-white/5 text-[11px] font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>NOYA Intelligence Engine</span>
              <span className="ml-auto bg-mint/20 text-mint text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                v2.0
              </span>
            </div>
          </div>

          {/* Role-Locked Navigation Items */}
          <div className="px-3 py-2">
            <div className="text-[9px] font-bold tracking-widest text-white/30 uppercase px-3 mb-2">
              {personaMeta.roleTitle} Workspace
            </div>

            <div className="space-y-1">
              {personaMeta.navItems.map((item, idx) => {
                const ItemIcon = item.icon;
                const active = isItemActive(item, idx);
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      item.action?.();
                      onCloseMobile?.();
                    }}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all cursor-pointer ${
                      active
                        ? 'bg-teal text-white shadow-sm font-bold'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <ItemIcon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-white' : 'text-mint/80'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer: User Profile & Session Logout */}
        <div className="p-3 border-t border-white/10 bg-black/20 space-y-2">
          <button
            onClick={() => {
              onSwitchPersona();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/80 hover:text-white text-xs font-semibold transition-all cursor-pointer border border-white/5"
            title="Switch to another persona for testing"
          >
            <Repeat className="w-3.5 h-3.5 text-amber flex-shrink-0" />
            <span>Switch Account (Demo)</span>
          </button>

          <button
            onClick={() => {
              onLogout();
              onCloseMobile?.();
            }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold transition-all cursor-pointer border border-rose-500/20"
          >
            <LogOut className="w-3.5 h-3.5 text-rose-400 flex-shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
};
