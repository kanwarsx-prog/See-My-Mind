import React, { useState, useEffect } from 'react';
import { RoleView } from '../types';
import {
  Sparkles,
  GraduationCap,
  ShieldCheck,
  HeartHandshake,
  User,
  Users,
  Play,
  Pause,
  ChevronRight,
  ChevronLeft,
  X,
  ArrowRight,
  CheckCircle2,
  Clock,
  BatteryCharging,
  Layers,
  Award,
} from 'lucide-react';

interface PersonaTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: RoleView) => void;
  initialRole?: RoleView;
}

interface PersonaSlide {
  role: RoleView;
  name: string;
  roleTitle: string;
  avatarEmoji: string;
  subtitle: string;
  color: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  icon: any;
  quote: string;
  realWorldChallenge: string;
  solution: string;
  loopSteps: {
    time: string;
    action: string;
    detail: string;
  }[];
  superpowers: {
    icon: any;
    title: string;
    description: string;
  }[];
  launchButtonText: string;
}

const PERSONA_SLIDES: PersonaSlide[] = [
  {
    role: 'teacher',
    name: 'Ms Clara Johnson',
    roleTitle: 'Classroom Teacher · Year 5',
    avatarEmoji: '👩‍🏫',
    subtitle: 'St. Jude’s Inclusive Academy · Room 4',
    color: '#5E4D9A',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-200',
    icon: GraduationCap,
    quote: '"I have 28 pupils and 4 with high-need EHCPs. I cannot spend 20 minutes reading disorganized notes before morning registration."',
    realWorldChallenge: 'Mornings are chaotic; teachers need transition context in under 15 seconds without administrative overload.',
    solution: 'See My Mind gives Ms Johnson a 1-click morning handover acknowledgment, instant alerts (assembly noise, skipped breakfast), and tailored curriculum differentiation.',
    loopSteps: [
      {
        time: '8:48 AM',
        action: 'Review Pre-Flight Handover',
        detail: 'Reads Dana’s note: Phoenix had restless sleep & skipped breakfast. Noise defenders are in his backpack.',
      },
      {
        time: '8:50 AM',
        action: '1-Click Acknowledge',
        detail: 'Clicks "✓ Acknowledge Handover" which sends an instant read receipt straight to Dana’s phone at home.',
      },
      {
        time: '9:45 AM',
        action: 'Differentiate Lesson Live',
        detail: 'Launches visual game design maths slopes on Phoenix’s desk while running whole-class algebra.',
      },
    ],
    superpowers: [
      {
        icon: Sun,
        title: 'Pre-Flight Morning Loop',
        description: 'Instant home-to-classroom handover with read receipts that relieve morning parent anxiety.',
      },
      {
        icon: Layers,
        title: 'Room 4 SEND Matrix',
        description: 'Cohort-level sensory adaptations, triggers to avoid, and 60-second supply teacher briefings.',
      },
      {
        icon: BookOpen,
        title: 'Adapted Lesson Pathways',
        description: 'Real-world visual worksheets (game slopes, fraction bars) that prevent cognitive dysregulation.',
      },
    ],
    launchButtonText: '🚀 Explore as Classroom Teacher (Ms Johnson)',
  },
  {
    role: 'parent',
    name: 'Dana Carter',
    roleTitle: 'Parent & Guardian',
    avatarEmoji: '👩',
    subtitle: "Phoenix's Home Hub · Zero Child Burden",
    color: '#B87A2A',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-900',
    badgeBorder: 'border-amber-200',
    icon: HeartHandshake,
    quote: '"Phoenix masks all day at school, then collapses in tears at home. I felt helpless until I could see his sensory battery and send 20-second handovers."',
    realWorldChallenge: 'Parents bear the brunt of after-school restraint collapse without knowing how their child’s day unfolded.',
    solution: 'Zero child logging burden: Dana logs morning context in 20 seconds, receives classroom read receipts, and gets a 3:15pm Decompression recipe for a peaceful evening.',
    loopSteps: [
      {
        time: '8:47 AM',
        action: 'Send 20-Second Handover',
        detail: 'Logs sleep disturbance and skipped breakfast on her phone while walking Phoenix to school.',
      },
      {
        time: '8:50 AM',
        action: 'Instant Read Receipt',
        detail: 'Phone updates: "✓ Read by Ms Johnson at 8:50am · Noise defenders ready at Room 4 door".',
      },
      {
        time: '3:15 PM',
        action: '3:15 PM Decompression Bridge',
        detail: 'Checks sensory battery gauge (48%) and follows the arrival recipe: low light, quiet snack, no interrogation.',
      },
    ],
    superpowers: [
      {
        icon: BatteryCharging,
        title: '3:15 PM Decompression Bridge',
        description: 'Sensory battery depletion gauge, restraint collapse decoder, and gentle after-school arrival recipes.',
      },
      {
        icon: Clock,
        title: '24-Hour Handover Loop',
        description: '2-way read receipts between home and school that keep both worlds calibrated.',
      },
      {
        icon: Pill,
        title: 'Medication & Routine Digest',
        description: '30-day pediatric evidence reports correlating sleep, meds, and attention dips for CAMHS reviews.',
      },
    ],
    launchButtonText: '🚀 Explore as Parent (Dana Carter)',
  },
  {
    role: 'ta',
    name: 'Melissa Grant',
    roleTitle: '1-to-1 Teaching Assistant',
    avatarEmoji: '🤝',
    subtitle: 'Operational Boots on the Ground · Year 5',
    color: '#2A6B62',
    badgeBg: 'bg-teal-50',
    badgeText: 'text-teal-900',
    badgeBorder: 'border-teal-200',
    icon: Users,
    quote: '"I need to know exactly what to do at high-risk transition moments before dysregulation escalates, and log quick wins without leaving the child."',
    realWorldChallenge: 'TAs are on the frontline during high-sensory transitions but often lack timely handover information or fast logging tools.',
    solution: 'A dedicated high-risk schedule with time-stamped alerts (door arrival, assembly buddy pairing, 10am med dip crackers) and rapid <45s micro-logging.',
    loopSteps: [
      {
        time: '8:55 AM',
        action: 'Classroom Door Arrival',
        detail: 'Positions at classroom door; hands Phoenix noise-cancelling headphones before he enters crowd noise.',
      },
      {
        time: '9:05 AM',
        action: 'Assembly Buddy Pairing',
        detail: 'Ensures Jake O’Brien sits alongside Phoenix near the quiet exit corridor.',
      },
      {
        time: '10:00 AM',
        action: 'Medication Dip Preemption',
        detail: 'Offers crackers and water during expected medication dip window, preventing hunger-induced anxiety.',
      },
    ],
    superpowers: [
      {
        icon: Clock,
        title: 'High-Risk Schedule',
        description: 'Flagged timetable identifying peak sensory triggers and exact de-escalation actions to take.',
      },
      {
        icon: FileText,
        title: 'Rapid Micro-Logs (<45s)',
        description: 'Fast ABC and strategy logs synced directly to Supabase without taking focus away from the child.',
      },
      {
        icon: Award,
        title: 'Breakthrough Recording',
        description: 'Instantly logs independent wins to boost pupil self-esteem and feed the longitudinal review pack.',
      },
    ],
    launchButtonText: '🚀 Explore as 1:1 TA (Melissa Grant)',
  },
  {
    role: 'senco',
    name: 'Amara Okafor',
    roleTitle: 'SENCO & Inclusion Lead',
    avatarEmoji: '🛡️',
    subtitle: 'Whole-School SEND · 34 Learners',
    color: '#1A3A4A',
    badgeBg: 'bg-indigo-50',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-200',
    icon: ShieldCheck,
    quote: '"Statutory EHCP annual reviews take hours of manual paper chasing across teachers and parents. I need a single source of longitudinal truth."',
    realWorldChallenge: 'Managing provision across 34 SEND learners and statutory legal deadlines under intense Ofsted scrutiny.',
    solution: 'Live 34-pupil caseload provision mapping, automated high-needs block funding tracking (£148k), and 1-click Section 44 Statutory Review Pack generation with verified citations.',
    loopSteps: [
      {
        time: 'Morning',
        action: 'Monitor Whole-School Caseload',
        detail: 'Reviews 34 SEND learners, high-needs block allocation, and upcoming 30-day statutory deadlines.',
      },
      {
        time: 'Midday',
        action: 'Generate Section 44 Review Pack',
        detail: 'Compiles 3 months of adult-verified observations, strategy success rates, and attendance for LA meetings.',
      },
      {
        time: 'Afternoon',
        action: 'NOYA Longitudinal RAG Query',
        detail: 'Asks AI: "What sensory accommodations produced the highest maths engagement for Phoenix this term?"',
      },
    ],
    superpowers: [
      {
        icon: Layers,
        title: 'Whole-School Provision Matrix',
        description: '34-pupil register with EHCP vs K-tier filters, TA hours tracking, and funding allocations.',
      },
      {
        icon: BookOpen,
        title: 'Section 44 Statutory Review Pack',
        description: 'Full legal pack generation combining Section B needs, Section E outcomes, and Section F provisions.',
      },
      {
        icon: Sparkles,
        title: 'NOYA Evidence Assistant',
        description: 'Evidence-grounded RAG intelligence querying months of timeline logs with exact source citations.',
      },
    ],
    launchButtonText: '🚀 Explore as SENCO (Amara Okafor)',
  },
  {
    role: 'child',
    name: 'Phoenix Carter',
    roleTitle: 'Pupil Voice · Year 5',
    avatarEmoji: '🧒',
    subtitle: 'Strengths-First Learner · St. Jude’s',
    color: '#C5503E',
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-900',
    badgeBorder: 'border-rose-200',
    icon: User,
    quote: '"I like building levels in my video game. Maths made no sense until Ms Johnson showed me gradients are just climbing hills!"',
    realWorldChallenge: 'SEND children are often alienated by clinical assessment forms or forced into tedious text-based self-reporting.',
    solution: 'Gentle, accessible agency: 5-emoji mood check-in, visual star wins, interactive game slope worksheets, and direct connection to his dream career (Game Designer).',
    loopSteps: [
      {
        time: 'Morning',
        action: '1-Tap Emoji Check-In',
        detail: 'Taps 🙂 (Good) or 😰 (Overwhelmed) on a giant visual card without forced typing or pressure.',
      },
      {
        time: 'Maths Slot',
        action: 'Interactive Game Slopes',
        detail: 'Moves Rise/Run sliders on the coordinate plane to help a climber scale the mountain.',
      },
      {
        time: 'Celebration',
        action: 'Star Wins & Superpowers',
        detail: 'Sees teacher praise and his progress towards his game design dream career unlocked on his dashboard.',
      },
    ],
    superpowers: [
      {
        icon: Sun,
        title: '1-Tap Emoji Check-In',
        description: 'Friendly, stress-free self-advocacy without tedious form-filling or cognitive load.',
      },
      {
        icon: BookOpen,
        title: 'Visual Game Design Worksheets',
        description: 'Interactive STEM learning tailored to special interests (gradient slopes, visual fraction models).',
      },
      {
        icon: Award,
        title: 'Star Superpower Celebrations',
        description: 'Visual evidence of daily wins that builds intrinsic confidence and self-regulation.',
      },
    ],
    launchButtonText: '🚀 Explore as Pupil (Phoenix Carter)',
  },
];

// Fallback helper icons
function Sun(props: any) {
  return <Clock {...props} />;
}
function BookOpen(props: any) {
  return <Award {...props} />;
}
function Pill(props: any) {
  return <HeartHandshake {...props} />;
}
function FileText(props: any) {
  return <Layers {...props} />;
}

export const PersonaTourModal: React.FC<PersonaTourModalProps> = ({
  isOpen,
  onClose,
  onSelectRole,
  initialRole = 'teacher',
}) => {
  const [currentIdx, setCurrentIdx] = useState<number>(() => {
    const found = PERSONA_SLIDES.findIndex((s) => s.role === initialRole);
    return found !== -1 ? found : 0;
  });
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen) {
      const found = PERSONA_SLIDES.findIndex((s) => s.role === initialRole);
      if (found !== -1) setCurrentIdx(found);
    }
  }, [isOpen, initialRole]);

  // Auto-play timer (rotates every 7 seconds)
  useEffect(() => {
    let timer: ReturnType<typeof setInterval>;
    if (isOpen && isAutoPlaying) {
      timer = setInterval(() => {
        setCurrentIdx((prev) => (prev + 1) % PERSONA_SLIDES.length);
      }, 7000);
    }
    return () => clearInterval(timer);
  }, [isOpen, isAutoPlaying]);

  if (!isOpen) return null;

  const currentSlide = PERSONA_SLIDES[currentIdx];

  const handleNext = () => {
    setCurrentIdx((prev) => (prev + 1) % PERSONA_SLIDES.length);
  };

  const handlePrev = () => {
    setCurrentIdx((prev) => (prev - 1 + PERSONA_SLIDES.length) % PERSONA_SLIDES.length);
  };

  const handleLaunch = () => {
    onSelectRole(currentSlide.role);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Header */}
        <div className="px-5 py-4 bg-navy text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber via-coral to-mint p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-navy rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-mint animate-pulse" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2 font-serif">
                <span>See My Mind · Interactive Persona Tour</span>
                <span className="text-[10px] bg-teal/30 text-mint px-2 py-0.5 rounded-full font-mono">
                  Live Demo Walkthrough
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                How our 5 connected roles communicate to eliminate SEND friction and child logging burden
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isAutoPlaying
                  ? 'bg-amber-400 text-navy font-bold'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isAutoPlaying ? 'Pause auto-rotation' : 'Auto-play tour demo'}
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAutoPlaying ? 'Pause' : 'Auto-Play'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white flex items-center justify-center cursor-pointer transition-colors"
              title="Close tour"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Persona Selector Tabs */}
        <div className="bg-slate-50 px-3 py-2 border-b border-gray-200 flex items-center gap-1.5 overflow-x-auto flex-shrink-0 no-scrollbar">
          {PERSONA_SLIDES.map((slide, idx) => {
            const isSelected = idx === currentIdx;
            return (
              <button
                key={slide.role}
                onClick={() => setCurrentIdx(idx)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap cursor-pointer transition-all flex-shrink-0 ${
                  isSelected
                    ? 'bg-white text-navy shadow-xs border border-gray-200 ring-2 ring-teal/30'
                    : 'text-gray-600 hover:text-navy hover:bg-white/60'
                }`}
              >
                <span className="text-sm">{slide.avatarEmoji}</span>
                <span className="hidden sm:inline">{slide.name.split(' ')[0]}</span>
                <span className="sm:hidden">{slide.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${slide.badgeBg} ${slide.badgeText} border ${slide.badgeBorder}`}>
                  {slide.roleTitle.split('·')[0].trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Scrollable Slide Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          {/* Persona Hero Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50/70 border border-slate-200">
            <div className="flex items-center gap-3.5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shadow-sm flex-shrink-0 border border-white"
                style={{ backgroundColor: `${currentSlide.color}15` }}
              >
                {currentSlide.avatarEmoji}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-bold text-navy font-serif">{currentSlide.name}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${currentSlide.badgeBg} ${currentSlide.badgeText} ${currentSlide.badgeBorder}`}>
                    {currentSlide.roleTitle}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-0.5">{currentSlide.subtitle}</p>
              </div>
            </div>

            <button
              onClick={handleLaunch}
              className="w-full sm:w-auto px-4 py-2.5 bg-teal hover:bg-teal-medium text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
            >
              <span>{currentSlide.launchButtonText}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Persona Empathy & Problem Statement */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-6 p-4 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                <span>⚠️ The Real-World Pain Point</span>
              </div>
              <p className="text-xs text-navy font-medium italic leading-relaxed">
                {currentSlide.quote}
              </p>
              <p className="text-[11px] text-gray-600 mt-2">
                {currentSlide.realWorldChallenge}
              </p>
            </div>

            <div className="md:col-span-6 p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-1.5">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>How See My Mind Solves This</span>
              </div>
              <p className="text-xs text-navy font-medium leading-relaxed">
                {currentSlide.solution}
              </p>
            </div>
          </div>

          {/* Operational Loop: 3-Step Sequence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal" />
                <span>Daily Operational Workflow (Loop Execution)</span>
              </h4>
              <span className="text-[10px] text-gray-400 font-medium">Adult Proxy · Zero Child Burden</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {currentSlide.loopSteps.map((step, sIdx) => (
                <div
                  key={sIdx}
                  className="p-3.5 rounded-2xl bg-white border border-gray-200 hover:border-teal transition-all space-y-1.5 shadow-2xs relative"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-navy text-white">
                      {step.time}
                    </span>
                    <span className="w-5 h-5 rounded-full bg-teal/10 text-teal flex items-center justify-center font-bold text-[10px]">
                      {sIdx + 1}
                    </span>
                  </div>
                  <div className="text-xs font-bold text-navy">{step.action}</div>
                  <p className="text-[11px] text-gray-600 leading-snug">{step.detail}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Platform Superpowers for this Persona */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>Key Superpowers in {currentSlide.name.split(' ')[0]}’s Workspace</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {currentSlide.superpowers.map((pow, pIdx) => {
                const PowIcon = pow.icon;
                return (
                  <div
                    key={pIdx}
                    className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-xl bg-white shadow-2xs flex items-center justify-center text-teal border border-gray-100">
                        <PowIcon className="w-3.5 h-3.5" />
                      </div>
                      <div className="text-xs font-bold text-navy">{pow.title}</div>
                    </div>
                    <p className="text-[11px] text-gray-600 leading-relaxed mt-1">{pow.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer with Controls */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrev}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Dots */}
            <div className="flex items-center gap-1.5">
              {PERSONA_SLIDES.map((_, dotIdx) => (
                <button
                  key={dotIdx}
                  onClick={() => setCurrentIdx(dotIdx)}
                  className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                    dotIdx === currentIdx ? 'w-5 bg-teal' : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-xs font-semibold text-gray-700 cursor-pointer transition-colors"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-500 hover:text-navy cursor-pointer"
            >
              Close
            </button>

            <button
              onClick={handleLaunch}
              className="flex-1 sm:flex-none px-5 py-2.5 bg-navy hover:bg-navy-light text-white rounded-xl text-xs font-bold shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <span>{currentSlide.launchButtonText}</span>
              <ArrowRight className="w-4 h-4 text-mint" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
