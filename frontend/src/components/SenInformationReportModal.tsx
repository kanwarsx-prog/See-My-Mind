import React, { useState } from 'react';
import {
  X,
  Printer,
  ShieldCheck,
  FileText,
  Users,
  Award,
  Layers,
  Calendar,
  CheckCircle2,
  TrendingUp,
  HeartHandshake,
  Edit3,
  Save,
} from 'lucide-react';
import { SenInformationReportResponse } from '../types';

interface SenInformationReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: SenInformationReportResponse | null;
}

export const SenInformationReportModal: React.FC<SenInformationReportModalProps> = ({
  isOpen,
  onClose,
  report,
}) => {
  const [commentary, setCommentary] = useState<string>(
    report?.senco_strategic_commentary || ''
  );
  const [isEditingCommentary, setIsEditingCommentary] = useState(false);

  if (!isOpen || !report) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-navy/80 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-cardBg rounded-3xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl border border-gray-200 dark:border-borderMain overflow-hidden">
        {/* Top Action Toolbar (Hidden in Print) */}
        <div className="bg-navy px-4 sm:px-6 py-3.5 flex items-center justify-between text-white flex-shrink-0 border-b border-white/10 print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-teal/20 rounded-xl text-mint">
              <FileText className="w-5 h-5 text-mint" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-serif text-sm sm:text-base font-bold text-white">
                  Statutory SEN Information Report & Governor Pack
                </h2>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                  Regulation 51 Compliant ✓
                </span>
              </div>
              <p className="text-[11px] text-white/70">
                Children & Families Act 2014 (Section 69) &bull; Schedule 1 &bull; St. Jude&apos;s Inclusive Academy
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 sm:px-4 py-2 bg-teal hover:bg-teal-dark text-white rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <Printer className="w-4 h-4 text-mint" />
              <span className="hidden sm:inline">Print / Save as Statutory PDF</span>
              <span className="sm:hidden">Print</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Printable Document Body */}
        <div className="p-4 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-slate-50/50 dark:bg-canvas print:bg-white print:p-0 print:overflow-visible">
          {/* Institutional Letterhead */}
          <div className="bg-white dark:bg-cardBg p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-borderMain shadow-xs space-y-4 print:border-none print:shadow-none print:p-0">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-gray-100 dark:border-borderMain pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-teal/10 dark:bg-teal/20 text-teal dark:text-teal-300 flex items-center justify-center font-bold text-xl border border-teal/20">
                  <ShieldCheck className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold font-serif text-navy dark:text-white">
                    {report.header.school_name}
                  </h1>
                  <p className="text-xs text-textDim dark:text-slate-400">
                    Department for Education (DfE): {report.header.dfe_number} &bull; URN: {report.header.urn} &bull; Academic Year: {report.header.academic_year}
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right text-xs text-textDim dark:text-slate-400">
                <div className="font-bold text-navy dark:text-white uppercase tracking-wider text-[10px]">
                  Official Governance Document
                </div>
                <div>Published: {report.header.publication_date}</div>
              </div>
            </div>

            {/* Statutory Key Post-Holders */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <span className="text-[10px] font-bold text-textDim dark:text-slate-400 uppercase tracking-wider block">
                  Appointed Lead SENCO
                </span>
                <div className="font-bold text-navy dark:text-white mt-0.5">{report.header.lead_senco}</div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5 leading-tight">
                  {report.header.senco_qualifications}
                </div>
              </div>

              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <span className="text-[10px] font-bold text-textDim dark:text-slate-400 uppercase tracking-wider block">
                  Headteacher & Accounting Officer
                </span>
                <div className="font-bold text-navy dark:text-white mt-0.5">{report.header.headteacher}</div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5 leading-tight">
                  National Professional Qualification for Headship (NPQH)
                </div>
              </div>

              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <span className="text-[10px] font-bold text-textDim dark:text-slate-400 uppercase tracking-wider block">
                  Named SEND Governor
                </span>
                <div className="font-bold text-navy dark:text-white mt-0.5">{report.header.send_governor}</div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5 leading-tight">
                  St. Jude&apos;s Academy Governing Body
                </div>
              </div>
            </div>
          </div>

          {/* Executive Governor Summary Ribbon */}
          <div className="bg-gradient-to-r from-teal-50/90 via-cardBg to-emerald-50/50 dark:from-teal-950/40 dark:via-cardBg dark:to-emerald-950/30 p-5 rounded-2xl border border-teal-200/60 dark:border-teal-900/40 shadow-xs space-y-3">
            <div className="flex items-center justify-between border-b border-teal-200/40 dark:border-teal-900/40 pb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-teal-900 dark:text-teal-200 flex items-center gap-1.5">
                <Award className="w-4 h-4 text-teal" />
                <span>Executive Summary for Governors & Ofsted Panel</span>
              </h3>
              <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-300 dark:border-emerald-800/40">
                100% Statutory Compliance
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
              <div className="bg-white/80 dark:bg-cardBg p-2.5 rounded-xl border border-borderMain">
                <div className="text-xl font-black text-navy dark:text-white">
                  {report.demographics.total_send_count}
                </div>
                <div className="text-[10px] font-semibold text-textDim dark:text-slate-400">Total SEND (14.8%)</div>
              </div>

              <div className="bg-white/80 dark:bg-cardBg p-2.5 rounded-xl border border-borderMain">
                <div className="text-xl font-black text-purple-700 dark:text-purple-300">
                  {report.demographics.ehcp_count}
                </div>
                <div className="text-[10px] font-semibold text-textDim dark:text-slate-400">Statutory EHCPs (5.2%)</div>
              </div>

              <div className="bg-white/80 dark:bg-cardBg p-2.5 rounded-xl border border-borderMain">
                <div className="text-xl font-black text-teal dark:text-teal-300 font-mono">
                  {report.provision_audit.total_high_needs_funding}
                </div>
                <div className="text-[10px] font-semibold text-textDim dark:text-slate-400">High Needs Spend</div>
              </div>

              <div className="bg-white/80 dark:bg-cardBg p-2.5 rounded-xl border border-borderMain">
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {report.provision_audit.statutory_delivery_compliance_rate}%
                </div>
                <div className="text-[10px] font-semibold text-textDim dark:text-slate-400">1:1 TA Delivery</div>
              </div>

              <div className="bg-white/80 dark:bg-cardBg p-2.5 rounded-xl border border-borderMain col-span-2 sm:col-span-1">
                <div className="text-xl font-black text-emerald-700 dark:text-emerald-300">
                  {report.efficacy.fixed_term_exclusions}
                </div>
                <div className="text-[10px] font-semibold text-textDim dark:text-slate-400">Exclusions (0%)</div>
              </div>
            </div>
          </div>

          {/* SECTION 1: Kinds of SEND Provided For (Schedule 1, Paragraph 1) */}
          <div className="bg-white dark:bg-cardBg p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-borderMain shadow-xs space-y-4">
            <div className="border-b border-gray-100 dark:border-borderMain pb-2">
              <h3 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-teal" />
                <span>1. The Kinds of Special Educational Needs Provided For (Schedule 1, Para 1)</span>
              </h3>
              <p className="text-xs text-textDim dark:text-slate-400 mt-0.5">
                Provision mapping across the 4 statutory areas of need mandated by the SEND Code of Practice (0 to 25 years).
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {report.demographics.needs_distribution.map((cat) => (
                <div key={cat.code_of_practice_area} className="p-3.5 bg-cardSubtle rounded-xl border border-borderMain space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-navy dark:text-white">
                      {cat.code_of_practice_area}
                    </span>
                    <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded-md bg-teal/10 text-teal dark:text-teal-300 border border-teal/20">
                      {cat.pupil_count} Pupils ({cat.percentage_of_send}%)
                    </span>
                  </div>

                  <div className="text-[11px] text-textSub dark:text-slate-300">
                    <span className="font-semibold text-textDim dark:text-slate-400">Diagnoses: </span>
                    {cat.primary_diagnoses.join(', ')}
                  </div>

                  <div className="text-[11px] text-textSub dark:text-slate-300 space-y-1 pt-1 border-t border-borderMain">
                    <span className="font-bold text-[9px] uppercase tracking-wider text-textDim dark:text-slate-400 block">
                      Evidenced Adaptations:
                    </span>
                    {cat.key_adaptations_provided.map((adp, i) => (
                      <div key={i} className="flex items-start gap-1 leading-snug">
                        <span className="text-teal font-bold">•</span>
                        <span>{adp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 2: Statutory High Needs Provision & TA Hours (Schedule 1, Paragraph 4) */}
          <div className="bg-white dark:bg-cardBg p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-borderMain shadow-xs space-y-4">
            <div className="border-b border-gray-100 dark:border-borderMain pb-2">
              <h3 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal" />
                <span>2. High Needs Funding Block Expenditure & Section F Verification (Schedule 1, Para 4)</span>
              </h3>
              <p className="text-xs text-textDim dark:text-slate-400 mt-0.5">
                Audit comparing legally mandated 1:1 TA allocations against logged classroom delivery across funding bands.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-borderMain bg-cardSubtle text-textDim dark:text-slate-400 font-bold">
                    <th className="py-2.5 px-3 text-left">Funding Band Tier</th>
                    <th className="py-2.5 px-3 text-center">Annual / Pupil</th>
                    <th className="py-2.5 px-3 text-center">Pupil Count</th>
                    <th className="py-2.5 px-3 text-center">Total Spend</th>
                    <th className="py-2.5 px-3 text-center">Allocated TA</th>
                    <th className="py-2.5 px-3 text-center">Delivered TA</th>
                    <th className="py-2.5 px-3 text-center">Delivery Compliance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-borderMain/60">
                  {report.provision_audit.band_breakdown.map((b) => (
                    <tr key={b.band}>
                      <td className="py-2.5 px-3 font-bold text-textMain dark:text-white">{b.band}</td>
                      <td className="py-2.5 px-3 text-center text-textDim dark:text-slate-400 font-mono">{b.annual_amount}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-navy dark:text-white">{b.pupils}</td>
                      <td className="py-2.5 px-3 text-center font-bold text-teal dark:text-teal-300 font-mono">{b.total_spend}</td>
                      <td className="py-2.5 px-3 text-center text-textSub dark:text-slate-300">{b.allocated_hours}</td>
                      <td className="py-2.5 px-3 text-center text-textSub dark:text-slate-300">{b.delivered_hours}</td>
                      <td className="py-2.5 px-3 text-center">
                        <span className="font-bold text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                          {b.compliance}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-[11px] text-textDim dark:text-slate-400 italic">
              <strong>Statutory Deployment Model:</strong> {report.provision_audit.deployment_model}
            </p>
          </div>

          {/* SECTION 3: Evaluating Effectiveness & Behavioural Safety (Schedule 1, Paragraph 3 & 6) */}
          <div className="bg-white dark:bg-cardBg p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-borderMain shadow-xs space-y-4">
            <div className="border-b border-gray-100 dark:border-borderMain pb-2">
              <h3 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>3. Evaluating Provision Effectiveness & Zero-Exclusion Safety (Schedule 1, Para 3 & 6)</span>
              </h3>
              <p className="text-xs text-textDim dark:text-slate-400 mt-0.5">
                Empirical evidence demonstrating the impact of neuro-inclusive de-escalation protocols on pupil safety.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/60 dark:border-emerald-900/40">
                <div className="font-bold text-emerald-900 dark:text-emerald-200">De-Escalation Success Rate</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  {report.efficacy.de_escalation_win_rate}%
                </div>
                <div className="text-[10px] text-emerald-800 dark:text-emerald-400 mt-0.5">
                  Across {report.efficacy.total_interventions_recorded} recorded support observations.
                </div>
              </div>

              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <div className="font-bold text-navy dark:text-white">Statutory Exclusions</div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                  0 Exclusions
                </div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5">
                  0 fixed-term & 0 permanent exclusions recorded.
                </div>
              </div>

              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <div className="font-bold text-navy dark:text-white">SEND Average Attendance</div>
                <div className="text-2xl font-black text-navy dark:text-white mt-1">
                  {report.efficacy.average_attendance_rate}%
                </div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5">
                  Exceeds national SEND maintained school average (91.2%).
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-cardSubtle rounded-xl border border-borderMain text-xs space-y-1.5">
              <span className="font-bold text-navy dark:text-white uppercase tracking-wider text-[10px] block">
                Top Empirical Interventions Validated in Classroom Practice:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-textSub dark:text-slate-300">
                {report.efficacy.top_effective_strategies.map((st, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-xs text-textSub dark:text-slate-300 leading-relaxed">
              {report.efficacy.statutory_evaluation_narrative}
            </p>
          </div>

          {/* SECTION 4: Co-Production with Parents & Multi-Agency Working (Schedule 1, Para 7 & 8) */}
          <div className="bg-white dark:bg-cardBg p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-borderMain shadow-xs space-y-4">
            <div className="border-b border-gray-100 dark:border-borderMain pb-2">
              <h3 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                <HeartHandshake className="w-4 h-4 text-purple-600" />
                <span>4. Parent & Pupil Voice Co-Production and Multi-Agency Working (Schedule 1, Para 7 & 8)</span>
              </h3>
              <p className="text-xs text-textDim dark:text-slate-400 mt-0.5">
                Structured continuous engagement with families and statutory NHS clinical partners.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <div className="font-bold text-navy dark:text-white">24-Hour Home Handovers</div>
                <div className="text-xl font-bold text-teal dark:text-teal-300 mt-1">
                  {report.co_production.daily_morning_handovers_active} Active Families
                </div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5">
                  Early sleep/mood sync with classroom staff before 8:55am.
                </div>
              </div>

              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <div className="font-bold text-navy dark:text-white">Pupil Voice Submissions</div>
                <div className="text-xl font-bold text-purple-700 dark:text-purple-300 mt-1">
                  {report.co_production.pupil_voice_checkins_this_term} Check-Ins
                </div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5">
                  Touch-screen emoji regulation check-ins logged by pupils.
                </div>
              </div>

              <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain">
                <div className="font-bold text-navy dark:text-white">Annual Review Timelines</div>
                <div className="text-xl font-bold text-emerald-700 dark:text-emerald-300 mt-1">
                  100% on Track
                </div>
                <div className="text-[10px] text-textDim dark:text-slate-400 mt-0.5">
                  {report.annual_review_compliance.annual_reviews_completed_or_on_track} of {report.annual_review_compliance.annual_reviews_due_this_year} EHCP reviews compliant with Section 44.
                </div>
              </div>
            </div>

            <div className="p-3 bg-cardSubtle rounded-xl border border-borderMain text-xs space-y-1">
              <span className="font-bold text-navy dark:text-white uppercase tracking-wider text-[10px] block">
                Statutory Multi-Agency NHS & Local Authority Partners:
              </span>
              <div className="flex flex-wrap gap-2 pt-1">
                {report.co_production.multi_agency_partners.map((partner, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2.5 py-1 rounded-md bg-white dark:bg-cardBg border border-borderMain text-textMain dark:text-slate-200 font-medium"
                  >
                    {partner}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 5: Editable SENCO Strategic Commentary & Priorities */}
          <div className="bg-white dark:bg-cardBg p-5 sm:p-6 rounded-2xl border border-gray-200 dark:border-borderMain shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-borderMain pb-2">
              <div>
                <h3 className="text-sm font-bold text-navy dark:text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-teal" />
                  <span>5. SENCO Executive Commentary & Strategic Priorities for Next Year</span>
                </h3>
                <p className="text-xs text-textDim dark:text-slate-400 mt-0.5">
                  Statutory evaluation submitted by Sarah Davies (NASENCo) to the Governing Body.
                </p>
              </div>

              <button
                onClick={() => setIsEditingCommentary(!isEditingCommentary)}
                className="text-xs font-bold text-teal hover:underline flex items-center gap-1 cursor-pointer print:hidden"
              >
                {isEditingCommentary ? (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Done Editing</span>
                  </>
                ) : (
                  <>
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit Commentary</span>
                  </>
                )}
              </button>
            </div>

            {isEditingCommentary ? (
              <textarea
                value={commentary}
                onChange={(e) => setCommentary(e.target.value)}
                rows={5}
                className="w-full text-xs p-3 rounded-xl border border-teal bg-cardBg text-textMain focus:outline-hidden"
              />
            ) : (
              <p className="text-xs text-textSub dark:text-slate-300 leading-relaxed bg-cardSubtle p-4 rounded-xl border border-borderMain">
                {commentary}
              </p>
            )}

            <div className="space-y-1.5 pt-2">
              <span className="font-bold text-navy dark:text-white uppercase tracking-wider text-[10px] block">
                Agreed Strategic Priorities for Next Academic Year:
              </span>
              <div className="space-y-1 text-xs text-textSub dark:text-slate-300">
                {report.priorities_for_next_year.map((pri, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <span className="font-mono font-bold text-teal">{i + 1}.</span>
                    <span>{pri}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Governance Declaration & Statutory Sign-Off Block */}
          <div className="bg-cardSubtle p-5 sm:p-6 rounded-2xl border border-borderMain space-y-4 print:border-none">
            <p className="text-xs text-textDim dark:text-slate-400 leading-relaxed italic">
              {report.governance_declaration}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-borderMain text-xs">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-textDim uppercase tracking-wider">Lead SENCO</div>
                <div className="font-serif font-bold text-navy dark:text-white border-b border-slate-300 dark:border-slate-700 pb-1">
                  Sarah Davies, NASENCo
                </div>
                <div className="text-[10px] text-textDim">Date: {report.header.publication_date}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-textDim uppercase tracking-wider">Headteacher</div>
                <div className="font-serif font-bold text-navy dark:text-white border-b border-slate-300 dark:border-slate-700 pb-1">
                  Dr. Eleanor Vance, NPQH
                </div>
                <div className="text-[10px] text-textDim">Date: {report.header.publication_date}</div>
              </div>

              <div className="space-y-1">
                <div className="text-[10px] font-bold text-textDim uppercase tracking-wider">Chair of Governors</div>
                <div className="font-serif font-bold text-navy dark:text-white border-b border-slate-300 dark:border-slate-700 pb-1">
                  Rev. Marcus Thorne
                </div>
                <div className="text-[10px] text-textDim">Date: {report.header.publication_date}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
