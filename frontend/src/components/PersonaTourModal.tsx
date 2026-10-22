import React, { useState, useEffect, useRef } from 'react';
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
  Bell,
  Smartphone,
  Check,
} from 'lucide-react';

interface PersonaTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectRole: (role: RoleView) => void;
  initialRole?: RoleView;
}

interface StepSimulation {
  time: string;
  action: string;
  detail: string;
  overlayBadge: string;
  overlayText: string;
  simType: string;
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
  loopSteps: StepSimulation[];
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
        overlayBadge: '⚡ ZERO ADMIN OVERLOAD',
        overlayText: 'Teacher scans critical sensory status in under 10 seconds before the morning bell.',
        simType: 'teacher_handover',
      },
      {
        time: '8:50 AM',
        action: '1-Click Acknowledge Handover',
        detail: 'Clicks "✓ Acknowledge Handover" which sends an instant read receipt straight to Dana’s phone at home.',
        overlayBadge: '📲 INSTANT HOME LOOP',
        overlayText: 'Instantly relieves parental anxiety at home; Dana receives confirmation that noise defenders are ready.',
        simType: 'teacher_ack',
      },
      {
        time: '9:45 AM',
        action: 'Differentiate Lesson Live',
        detail: 'Launches visual game design maths slopes on Phoenix’s desk while running whole-class algebra.',
        overlayBadge: '🎯 COGNITIVE OVERLOAD PREVENTED',
        overlayText: 'Phoenix accesses Year 5 algebra through his video game design hook without anxiety.',
        simType: 'teacher_worksheet',
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
        overlayBadge: '💡 ZERO CHILD LOGGING BURDEN',
        overlayText: 'Phoenix is never forced to self-report or fill out clinical forms. Adult-proxy inputs only.',
        simType: 'parent_form',
      },
      {
        time: '8:50 AM',
        action: 'Instant Read Receipt',
        detail: 'Phone updates: "✓ Read by Ms Johnson at 8:50am · Noise defenders ready at Room 4 door".',
        overlayBadge: '🛡️ PARENT ANXIETY ELIMINATED',
        overlayText: 'Dana has complete peace of mind knowing the classroom team is prepared before assembly.',
        simType: 'parent_notification',
      },
      {
        time: '3:15 PM',
        action: '3:15 PM Decompression Bridge',
        detail: 'Checks sensory battery gauge (48%) and follows the arrival recipe: low light, quiet snack, no interrogation.',
        overlayBadge: '🧘 RESTRAINT COLLAPSE DECODED',
        overlayText: 'Actionable home recipes prevent afternoon meltdowns after heavy school masking.',
        simType: 'parent_bridge',
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
        overlayBadge: '⚡ PROACTIVE SENSORY BUFFER',
        overlayText: 'TA intercepts acoustic overload before Phoenix ever reaches the noisy hall.',
        simType: 'ta_arrival',
      },
      {
        time: '9:05 AM',
        action: 'Assembly Buddy Pairing',
        detail: 'Ensures Jake O’Brien sits alongside Phoenix near the quiet exit corridor.',
        overlayBadge: '🤝 PEER SAFETY NET',
        overlayText: 'Peer buddy seating provides natural social safety without segregating Phoenix.',
        simType: 'ta_assembly',
      },
      {
        time: '10:00 AM',
        action: 'Medication Dip Preemption',
        detail: 'Offers crackers and water during expected medication dip window, preventing hunger-induced anxiety.',
        overlayBadge: '💊 PHYSIOLOGICAL CALIBRATION',
        overlayText: 'Restlessness at 10:00am is identified as blood sugar/med dip rather than defiance.',
        simType: 'ta_meds',
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
        time: '9:00 AM',
        action: 'Monitor Whole-School Caseload',
        detail: 'Reviews 34 SEND learners, high-needs block allocation, and upcoming 30-day statutory deadlines.',
        overlayBadge: '📊 WHOLE-SCHOOL GOVERNANCE',
        overlayText: 'Instant oversight of £148,600 High-Needs Funding and 185h weekly TA hours.',
        simType: 'senco_matrix',
      },
      {
        time: '1:00 PM',
        action: 'Generate Section 44 Review Pack',
        detail: 'Compiles 3 months of adult-verified observations, strategy success rates, and attendance for LA meetings.',
        overlayBadge: '📜 1-CLICK LEGAL COMPLIANCE',
        overlayText: 'Assembles Section B needs, Section E outcomes, and Section F provisions in seconds.',
        simType: 'senco_review',
      },
      {
        time: '3:30 PM',
        action: 'NOYA Longitudinal RAG Query',
        detail: 'Asks AI: "What sensory accommodations produced the highest maths engagement for Phoenix this term?"',
        overlayBadge: '🧠 EVIDENCE-GROUNDED AI',
        overlayText: 'Every AI synthesis is anchored to verified adult observations with clickable citations.',
        simType: 'senco_rag',
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
        time: '8:50 AM',
        action: '1-Tap Emoji Check-In',
        detail: 'Taps 🙂 (Good) or 😰 (Overwhelmed) on a giant visual card without forced typing or pressure.',
        overlayBadge: '🧒 STRESS-FREE SELF-ADVOCACY',
        overlayText: 'Pupil voice is gathered effortlessly without clinical intimidation or test anxiety.',
        simType: 'child_emoji',
      },
      {
        time: '9:45 AM',
        action: 'Interactive Game Slopes',
        detail: 'Moves Rise/Run sliders on the coordinate plane to help a climber scale the mountain.',
        overlayBadge: '🎮 GAMIFIED VISUAL STEM',
        overlayText: 'Translates abstract linear equations into game design slopes matching his passion.',
        simType: 'child_slope',
      },
      {
        time: '3:00 PM',
        action: 'Star Wins & Superpowers',
        detail: 'Sees teacher praise and his progress towards his game design dream career unlocked on his dashboard.',
        overlayBadge: '⭐ INTRINSIC RESILIENCE',
        overlayText: 'Daily micro-breakthroughs build self-worth and confidence that carry over into home.',
        simType: 'child_star',
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
  const [activeStep, setActiveStep] = useState<number>(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(true);
  const [stepProgress, setStepProgress] = useState<number>(0);

  // References for auto-scrolling
  const stepsContainerRef = useRef<HTMLDivElement>(null);
  const stepCardsRef = useRef<(HTMLDivElement | null)[]>([]);

  // Reset active step when changing persona
  useEffect(() => {
    setActiveStep(0);
    setStepProgress(0);
  }, [currentIdx]);

  useEffect(() => {
    if (isOpen) {
      const found = PERSONA_SLIDES.findIndex((s) => s.role === initialRole);
      if (found !== -1) setCurrentIdx(found);
      setActiveStep(0);
      setStepProgress(0);
    }
  }, [isOpen, initialRole]);

  // Auto-scrolling the active step into view
  useEffect(() => {
    if (!isOpen) return;
    const targetCard = stepCardsRef.current[activeStep];
    if (targetCard && stepsContainerRef.current) {
      targetCard.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center',
      });
    }
  }, [activeStep, isOpen]);

  // Animated progression timer (advances step every 4.5 seconds with progress bar)
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isOpen && isAutoPlaying) {
      interval = setInterval(() => {
        setStepProgress((prev) => {
          if (prev >= 100) {
            setActiveStep((currStep) => {
              const nextStep = currStep + 1;
              if (nextStep >= PERSONA_SLIDES[currentIdx].loopSteps.length) {
                // If loop finished for this persona, advance persona slide
                setCurrentIdx((prevIdx) => (prevIdx + 1) % PERSONA_SLIDES.length);
                return 0;
              }
              return nextStep;
            });
            return 0;
          }
          return prev + 2.5; // ~4 seconds full bar
        });
      }, 100);
    }
    return () => clearInterval(interval);
  }, [isOpen, isAutoPlaying, currentIdx]);

  if (!isOpen) return null;

  const currentSlide = PERSONA_SLIDES[currentIdx];
  const activeStepData = currentSlide.loopSteps[activeStep] || currentSlide.loopSteps[0];

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

  // Render simulated mini UI for each step
  const renderSimulatedUI = () => {
    const { simType } = activeStepData;

    switch (simType) {
      case 'teacher_handover':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">Pre-Flight Morning Handover</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                🔔 Needs Teacher Ack
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Sleep:</span>
                <span className="font-bold text-navy">Restless (woke at 4am)</span>
              </div>
              <div className="p-2 bg-gray-50 rounded-xl">
                <span className="text-gray-500 block text-[10px]">Breakfast:</span>
                <span className="font-bold text-rose-700">⚠️ Skipped</span>
              </div>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900">
              💬 <em>"Worried about loud assembly noise. Noise defenders in bag."</em>
            </div>
          </div>
        );

      case 'teacher_ack':
        return (
          <div className="p-4 rounded-2xl bg-white border border-emerald-300 shadow-sm space-y-3 relative overflow-hidden">
            <div className="absolute inset-0 bg-emerald-50/30 pointer-events-none" />
            <div className="flex items-center justify-between pb-2 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">Handover Status</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3 text-emerald-600" />
                <span>Read Receipt Delivered</span>
              </span>
            </div>
            <div className="p-3 bg-emerald-100/60 rounded-xl border border-emerald-200 flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 flex-shrink-0 animate-bounce" />
              <div className="text-xs font-semibold text-emerald-900">
                Acknowledged by Ms Johnson at 8:50am · Dana notified instantly
              </div>
            </div>
            <div className="text-[11px] text-gray-500 italic text-center">
              "Noise defenders confirmed ready at Room 4 door."
            </div>
          </div>
        );

      case 'teacher_worksheet':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">Visual Slopes · Game Level Climbing</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                🧗 Gradient = 3
              </span>
            </div>
            <div className="h-24 bg-slate-900 rounded-xl p-2 relative flex items-center justify-center overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 200 80">
                <line x1="20" y1="70" x2="180" y2="70" stroke="#475569" strokeWidth="1" />
                <line x1="20" y1="70" x2="160" y2="20" stroke="#9ECFC4" strokeWidth="3" />
                <polygon points="20,70 160,70 160,20" fill="rgba(158,207,196,0.15)" />
                <text x="80" y="78" fill="#94A3B8" fontSize="8">Run: 2</text>
                <text x="165" y="45" fill="#94A3B8" fontSize="8">Rise: 6</text>
                <circle cx="90" cy="45" r="4" fill="#E8B84B" className="animate-ping" />
                <circle cx="90" cy="45" r="4" fill="#E8B84B" />
              </svg>
              <span className="absolute bottom-1 right-2 text-[9px] text-mint font-mono font-bold">
                $y = 3x$ (Linear Algebra Validated)
              </span>
            </div>
          </div>
        );

      case 'parent_form':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-amber-600" />
                <span>Dana's Phone · 20s Morning Handover</span>
              </span>
              <span className="text-[10px] text-emerald-700 font-bold">✓ Ready</span>
            </div>
            <div className="space-y-1.5 text-[11px]">
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-gray-700">Sleep:</span>
                <span className="font-bold text-rose-700">Restless (woke at 4am)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-gray-700">Breakfast Eaten:</span>
                <span className="font-bold text-rose-700">No (Skipped)</span>
              </div>
              <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50">
                <span className="text-gray-700">Medication Given:</span>
                <span className="font-bold text-emerald-700">Yes (8:30am)</span>
              </div>
            </div>
          </div>
        );

      case 'parent_notification':
        return (
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-lg space-y-3 border border-slate-700 relative overflow-hidden">
            <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 flex items-start gap-2.5 animate-in slide-in-from-top duration-300">
              <Bell className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0 animate-bounce" />
              <div>
                <div className="text-[11px] font-bold text-white flex items-center gap-2">
                  <span>St. Jude's Academy · Room 4</span>
                  <span className="text-[9px] text-white/50">Just now</span>
                </div>
                <div className="text-xs font-medium text-emerald-300 mt-0.5">
                  ✓ Handover read by Ms Johnson at 8:50am
                </div>
                <p className="text-[10px] text-white/70 mt-1 leading-snug">
                  "Thank you Dana. Noise defenders are ready at the door for 9:05am assembly."
                </p>
              </div>
            </div>
            <div className="text-center text-[11px] text-white/50">
              📱 Dana Carter's lockscreen instant read-receipt
            </div>
          </div>
        );

      case 'parent_bridge':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy flex items-center gap-1.5">
                <BatteryCharging className="w-4 h-4 text-amber-600" />
                <span>3:15 PM Sensory Battery</span>
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                ⚠️ Moderate Masking (48%)
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
              <div className="bg-gradient-to-r from-amber-400 to-amber-500 h-full w-[48%] rounded-full transition-all duration-500" />
            </div>
            <div className="p-2 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-950">
              <strong>Arrival Recipe:</strong> Low stimulation snack · 20 mins quiet iPad · zero school questions until 4:00pm.
            </div>
          </div>
        );

      case 'ta_arrival':
        return (
          <div className="p-4 rounded-2xl bg-white border border-rose-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-rose-800">⚡ 8:55 AM High-Risk Schedule</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200 animate-pulse">
                Critical Moment
              </span>
            </div>
            <div className="p-3 bg-rose-50/80 rounded-xl border border-rose-200 space-y-1">
              <div className="text-xs font-bold text-navy">Position at Classroom Door</div>
              <p className="text-[11px] text-gray-700">
                Hand Phoenix headphones <em>before</em> he reaches hallway crowd noise. Do not wait until overstimulated.
              </p>
            </div>
          </div>
        );

      case 'ta_assembly':
        return (
          <div className="p-4 rounded-2xl bg-white border border-teal-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-teal-900">⚡ 9:05 AM Assembly Protocol</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-teal-50 text-teal-800 border border-teal-200">
                Buddy Active
              </span>
            </div>
            <div className="p-3 bg-teal-50/70 rounded-xl border border-teal-200 space-y-1">
              <div className="text-xs font-bold text-navy">Buddy Pairing: Jake O'Brien</div>
              <p className="text-[11px] text-gray-700">
                Seated near quiet corridor exit. TA positioned 2 rows behind for unobtrusive support.
              </p>
            </div>
          </div>
        );

      case 'ta_meds':
        return (
          <div className="p-4 rounded-2xl bg-white border border-amber-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-amber-900">⚡ 10:00 AM Attention Dip</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
                Medication Window
              </span>
            </div>
            <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200 space-y-1">
              <div className="text-xs font-bold text-navy">Preemptive Crackers & Water</div>
              <p className="text-[11px] text-gray-700">
                Phoenix skipped breakfast. Offer light snack now to avoid anxiety spike. Do not interpret fidgeting as defiance.
              </p>
            </div>
          </div>
        );

      case 'senco_matrix':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">Whole-School SEND Caseload</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-900 border border-indigo-200">
                34 Learners
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 rounded-xl bg-purple-50 border border-purple-100">
                <div className="font-bold text-purple-900 text-sm">12</div>
                <div className="text-[9px] text-gray-500">EHCP Plans</div>
              </div>
              <div className="p-2 rounded-xl bg-teal-50 border border-teal-100">
                <div className="font-bold text-teal-800 text-sm">185h</div>
                <div className="text-[9px] text-gray-500">TA Hours / Wk</div>
              </div>
              <div className="p-2 rounded-xl bg-amber-50 border border-amber-100">
                <div className="font-bold text-amber-800 text-sm">£148.6k</div>
                <div className="text-[9px] text-gray-500">Block Funding</div>
              </div>
            </div>
          </div>
        );

      case 'senco_review':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">Section 44 Statutory Review Pack</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                Ready for Export
              </span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-center gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Section B: Autism Spectrum & Sensory Needs</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Section E: Independence in STEM Outcomes</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <Check className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                <span>Section F: 22.5h 1:1 TA Support Provision</span>
              </div>
            </div>
          </div>
        );

      case 'senco_rag':
        return (
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs">
              <span className="font-serif font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-mint" />
                <span>NOYA Longitudinal Query</span>
              </span>
              <span className="text-[9px] font-mono text-mint">RAG Active</span>
            </div>
            <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-[11px] text-white/90">
              "Visual Task Cards and game level slope differentiation yielded 92% strategy effectiveness during maths practicals this term."
            </div>
            <div className="text-[9px] text-white/50 flex items-center gap-1">
              <span>Verified Citations:</span>
              <span className="text-mint underline cursor-pointer">Observation #2481</span>
              <span>·</span>
              <span className="text-mint underline cursor-pointer">Timeline #1940</span>
            </div>
          </div>
        );

      case 'child_emoji':
        return (
          <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-2.5">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">How are you feeling right now?</span>
              <span className="text-[10px] text-gray-400">1 Tap</span>
            </div>
            <div className="flex items-center justify-around py-1 text-2xl">
              <span className="cursor-pointer hover:scale-125 transition-transform">😄</span>
              <span className="cursor-pointer scale-125 bg-amber-100 p-1 rounded-xl shadow-xs">🙂</span>
              <span className="cursor-pointer hover:scale-125 transition-transform">😐</span>
              <span className="cursor-pointer hover:scale-125 transition-transform">😟</span>
              <span className="cursor-pointer hover:scale-125 transition-transform">😰</span>
            </div>
            <div className="text-center text-[10px] font-bold text-navy">
              Tapped 🙂 (Ready to Learn) · Saved to Room 4
            </div>
          </div>
        );

      case 'child_slope':
        return (
          <div className="p-4 rounded-2xl bg-slate-900 text-white shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-white/10 text-xs font-bold">
              <span>🧗 Climb the Mountain: Rise ÷ Run</span>
              <span className="text-[10px] text-mint font-mono">Gradient: 3</span>
            </div>
            <div className="p-2 bg-white/5 rounded-xl flex items-center justify-between text-xs">
              <div>
                <span className="text-white/60 text-[10px] block">Vertical Rise</span>
                <span className="font-bold text-amber">6 Blocks</span>
              </div>
              <div className="text-white/40">÷</div>
              <div>
                <span className="text-white/60 text-[10px] block">Horizontal Run</span>
                <span className="font-bold text-mint">2 Blocks</span>
              </div>
              <div className="text-white/40">=</div>
              <div className="p-1.5 rounded-lg bg-teal/30 text-mint font-bold">
                Steepness: 3
              </div>
            </div>
          </div>
        );

      case 'child_star':
        return (
          <div className="p-4 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-2">
            <div className="flex items-center justify-between pb-1.5 border-b border-gray-100">
              <span className="text-xs font-bold text-navy">Today's Star Superpowers</span>
              <span className="text-xs">⭐ ⭐ ⭐</span>
            </div>
            <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2.5">
              <span className="text-2xl">🏆</span>
              <div>
                <div className="text-xs font-bold text-amber-950">Drew Gradient Triangle Independently</div>
                <div className="text-[10px] text-amber-800">Ms Johnson praised spatial reasoning in Science & Maths</div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-4xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col max-h-[94vh]">
        {/* Top Header */}
        <div className="px-5 py-4 bg-navy text-white flex items-center justify-between border-b border-white/10 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber via-coral to-mint p-0.5 flex items-center justify-center shadow-xs">
              <div className="w-full h-full bg-navy rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-mint animate-pulse" />
              </div>
            </div>
            <div>
              <div className="text-sm font-bold flex items-center gap-2 font-serif">
                <span>See My Mind · Interactive Persona Animation & Tour</span>
                <span className="text-[10px] bg-teal/30 text-mint px-2 py-0.5 rounded-full font-mono">
                  Live Animated Simulator
                </span>
              </div>
              <p className="text-[11px] text-white/60">
                Continuous SEND operational loops connecting Home, Classroom, TA, and Inclusion Lead
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isAutoPlaying
                  ? 'bg-amber-400 text-navy font-bold shadow-xs'
                  : 'bg-white/10 text-white hover:bg-white/20'
              }`}
              title={isAutoPlaying ? 'Pause auto-play animation' : 'Start auto-play animation'}
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
                <span>{slide.name.split(' ')[0]}</span>
                <span className={`text-[10px] px-1.5 py-0.2 rounded-md ${slide.badgeBg} ${slide.badgeText} border ${slide.badgeBorder}`}>
                  {slide.roleTitle.split('·')[0].trim()}
                </span>
              </button>
            );
          })}
        </div>

        {/* Slide Body */}
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

          {/* ⭐ ANIMATED LIVE-ACTION SIMULATOR WITH FLOATING TEXT OVERLAY ⭐ */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-navy to-slate-900 text-white relative shadow-lg overflow-hidden border border-slate-700 space-y-4">
            {/* Playback Progress Bar */}
            <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-teal-400 via-amber to-mint rounded-full transition-all duration-100 ease-linear"
                style={{ width: `${stepProgress}%` }}
              />
            </div>

            {/* Stage Selector Pills */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-mint flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber" />
                  <span>Live Action Loop Simulation</span>
                </span>
                <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-white/70">
                  Step {activeStep + 1} of {currentSlide.loopSteps.length}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                {currentSlide.loopSteps.map((step, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setActiveStep(idx);
                      setStepProgress(0);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                      idx === activeStep
                        ? 'bg-teal text-white shadow-xs'
                        : 'bg-white/10 text-white/60 hover:text-white'
                    }`}
                  >
                    <span>{step.time}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Simulation Canvas with Text Overlay */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center pt-1 relative">
              {/* Left Column: Simulated Interactive UI Mockup */}
              <div className="lg:col-span-7 relative">
                <div className="relative transform transition-all duration-300">
                  {renderSimulatedUI()}
                </div>
              </div>

              {/* Right Column: Floating Text Overlay with Callout */}
              <div className="lg:col-span-5 relative">
                <div className="p-4 rounded-2xl bg-navy-light/90 border border-teal/40 backdrop-blur-md shadow-xl space-y-2 relative animate-in fade-in slide-in-from-right-3 duration-300">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-400 text-navy font-mono">
                      {activeStepData.overlayBadge}
                    </span>
                    <span className="text-[10px] text-white/60 font-mono">{activeStepData.time}</span>
                  </div>

                  <div className="text-xs font-bold text-white font-serif">
                    {activeStepData.action}
                  </div>

                  <p className="text-xs text-white/90 leading-relaxed font-sans">
                    {activeStepData.overlayText}
                  </p>

                  <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-white/60">
                    <span className="flex items-center gap-1 text-mint">
                      <CheckCircle2 className="w-3 h-3 text-mint" />
                      <span>Zero Friction</span>
                    </span>
                    <span>Adult-Proxy Loop</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Operational Loop: 3-Step Auto-Scrolling Sequence */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-navy uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-teal" />
                <span>Daily Operational Sequence (Auto-Scrolling Timeline)</span>
              </h4>
              <span className="text-[10px] text-gray-400 font-medium">Click any card to inspect moment</span>
            </div>

            {/* Horizontal Auto-Scrolling Container */}
            <div
              ref={stepsContainerRef}
              className="flex items-stretch gap-3 overflow-x-auto pb-2 scroll-smooth no-scrollbar"
            >
              {currentSlide.loopSteps.map((step, sIdx) => {
                const isActive = sIdx === activeStep;
                return (
                  <div
                    key={sIdx}
                    ref={(el) => (stepCardsRef.current[sIdx] = el)}
                    onClick={() => {
                      setActiveStep(sIdx);
                      setStepProgress(0);
                    }}
                    className={`min-w-[260px] sm:min-w-[280px] p-3.5 rounded-2xl border transition-all space-y-1.5 shadow-2xs relative cursor-pointer flex-shrink-0 ${
                      isActive
                        ? 'bg-teal/5 border-teal ring-2 ring-teal/20 scale-[1.01]'
                        : 'bg-white border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        isActive ? 'bg-teal text-white' : 'bg-navy text-white'
                      }`}>
                        {step.time}
                      </span>
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] ${
                        isActive ? 'bg-teal text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {sIdx + 1}
                      </span>
                    </div>
                    <div className="text-xs font-bold text-navy">{step.action}</div>
                    <p className="text-[11px] text-gray-600 leading-snug">{step.detail}</p>
                  </div>
                );
              })}
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
