import React, { useState, useEffect } from 'react';
import {
  Child,
  ChildEvent,
  AskNoyaResponse,
  DocumentItem,
  IncidentDetail,
  AnnualReviewPackResponse,
  SchoolProvisionMatrixResponse,
  ProvisionMapPupil,
  AdminUserItem,
} from '../types';
import {
  ShieldCheck,
  Sparkles,
  Search,
  FileText,
  CheckCircle2,
  Upload,
  AlertTriangle,
  Printer,
  ArrowRight,
  Filter,
  Users,
  Check,
  Mail,
  X,
  UserPlus,
  RefreshCw,
  GraduationCap,
  UserCheck,
} from 'lucide-react';
import { api } from '../api';
import { AnnualReviewPackModal } from '../components/AnnualReviewPackModal';

export type SencoTab = 'review_pack' | 'provision_map' | 'assistant' | 'staff_team';

interface SencoViewProps {
  child: Child;
  timeline: ChildEvent[];
  activeTab?: SencoTab;
  onTabChange?: (tab: SencoTab) => void;
  onOpenDocModal?: () => void;
  onOpenIncidentModal?: () => void;
  onRegisterChild?: () => void;
}

export const SencoView: React.FC<SencoViewProps> = ({
  child,
  timeline,
  activeTab: propActiveTab,
  onTabChange,
  onOpenDocModal,
  onOpenIncidentModal,
  onRegisterChild,
}) => {
  const [activeTab, setActiveTab] = useState<SencoTab>(
    propActiveTab || 'review_pack'
  );

  useEffect(() => {
    if (propActiveTab && propActiveTab !== activeTab) {
      setActiveTab(propActiveTab);
    }
  }, [propActiveTab]);

  const handleTabSelect = (tab: SencoTab) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  // AI & Overview state
  const [query, setQuery] = useState('What sensory calming strategies have proven most effective this month?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<AskNoyaResponse | null>(null);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [incidents, setIncidents] = useState<IncidentDetail[]>([]);

  // Annual Review Pack state
  const [reviewPack, setReviewPack] = useState<AnnualReviewPackResponse | null>(null);
  const [loadingPack, setLoadingPack] = useState(false);
  const [showPackModal, setShowPackModal] = useState(false);

  // Caseload Provision Matrix state
  const [provisionMatrix, setProvisionMatrix] = useState<SchoolProvisionMatrixResponse | null>(null);
  const [loadingMatrix, setLoadingMatrix] = useState(false);
  const [provisionFilter, setProvisionFilter] = useState<'all' | 'ehcp' | 'k' | 'asc' | 'adhd' | 'due_soon'>('all');

  useEffect(() => {
    if (child?.id) {
      api.getDocuments(child.id).then(setDocuments).catch(console.error);
      api.getIncidents(child.id).then(setIncidents).catch(console.error);

      setLoadingPack(true);
      api.getAnnualReviewPack(child.id)
        .then(setReviewPack)
        .catch(console.error)
        .finally(() => setLoadingPack(false));
    }
  }, [child?.id]);

  useEffect(() => {
    if (activeTab === 'provision_map' && !provisionMatrix) {
      setLoadingMatrix(true);
      api.getSchoolProvisionMatrix()
        .then(setProvisionMatrix)
        .catch(console.error)
        .finally(() => setLoadingMatrix(false));
    }
  }, [activeTab, provisionMatrix]);

  // Staff Directory & Provisioning state
  const [staffList, setStaffList] = useState<AdminUserItem[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [staffFilter, setStaffFilter] = useState<'all' | 'teacher' | 'ta' | 'specialist'>('all');
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [submittingStaff, setSubmittingStaff] = useState(false);
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<{
    name: string;
    email: string;
    role: string;
    password?: string;
  } | null>(null);

  const [staffForm, setStaffForm] = useState<{
    firstName: string;
    lastName: string;
    email: string;
    role: 'teacher' | 'ta' | 'specialist';
    jobTitle: string;
    password?: string;
  }>({
    firstName: '',
    lastName: '',
    email: '',
    role: 'teacher',
    jobTitle: '',
    password: '',
  });

  const loadStaff = async () => {
    try {
      setLoadingStaff(true);
      const data = await api.getAdminUsers();
      setStaffList(data);
    } catch (err) {
      console.error('Failed to load staff list:', err);
    } finally {
      setLoadingStaff(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'staff_team') {
      loadStaff();
    }
  }, [activeTab]);

  const handleProvisionStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffForm.firstName || !staffForm.lastName || !staffForm.email) {
      alert('Please fill out all required fields.');
      return;
    }
    try {
      setSubmittingStaff(true);
      const res = await api.provisionStaff({
        first_name: staffForm.firstName,
        last_name: staffForm.lastName,
        email: staffForm.email,
        role: staffForm.role,
        job_title: staffForm.jobTitle || undefined,
        password: staffForm.password || undefined,
      });
      setProvisionSuccessMsg({
        name: res.full_name,
        email: res.email,
        role: res.role,
        password: res.temporary_credentials,
      });
      setIsAddStaffModalOpen(false);
      setStaffForm({
        firstName: '',
        lastName: '',
        email: '',
        role: 'teacher',
        jobTitle: '',
        password: '',
      });
      await loadStaff();
    } catch (err: any) {
      alert(`Staff appointment failed: ${err.message}`);
    } finally {
      setSubmittingStaff(false);
    }
  };

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    try {
      const resp = await api.askNoya(child.id, query);
      setResult(resp);
    } catch (err) {
      console.error(err);
      alert('Failed to query NOYA.');
    } finally {
      setLoading(false);
    }
  };

  // Filtered pupils for provision map
  const getFilteredPupils = (pupils: ProvisionMapPupil[]) => {
    switch (provisionFilter) {
      case 'ehcp':
        return pupils.filter((p) => p.support_tier.includes('EHCP'));
      case 'k':
        return pupils.filter((p) => p.support_tier.includes('SEN Support'));
      case 'asc':
        return pupils.filter((p) => p.primary_need.toLowerCase().includes('autism') || p.primary_need.toLowerCase().includes('asc'));
      case 'adhd':
        return pupils.filter((p) => p.primary_need.toLowerCase().includes('adhd'));
      case 'due_soon':
        return pupils.filter((p) => p.days_until_review <= 30);
      default:
        return pupils;
    }
  };

  return (
    <div className="space-y-6">
      {/* SENCO Header Bar & Quick Register Action */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-navy flex items-center gap-2">
              <span>SEND Coordination & Statutory Compliance</span>
              <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-teal/10 text-teal font-semibold">
                St. Jude&apos;s Academy
              </span>
            </h2>
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            Sarah Davies (NASENCo) &bull; Managing 34 SEND pupils, statutory EHCP Annual Reviews & Local Authority panels.
          </p>
        </div>
        {onRegisterChild && (
          <button
            onClick={onRegisterChild}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer flex-shrink-0"
          >
            <span>📋</span>
            <span>+ Register SEND Pupil</span>
          </button>
        )}
      </div>

      {/* 3-Sub-Tab Navigation Bar */}
      <div className="bg-white p-1.5 rounded-2xl border border-gray-200/80 flex items-center gap-1.5 overflow-x-auto shadow-2xs">
        <button
          onClick={() => handleTabSelect('review_pack')}
          className={`flex-1 min-w-[200px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'review_pack'
              ? 'bg-purple-dark text-white shadow-xs'
              : 'text-gray-600 hover:text-navy hover:bg-gray-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>📑 Statutory Annual Review Pack</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
            EHCP Final
          </span>
        </button>

        <button
          onClick={() => handleTabSelect('provision_map')}
          className={`flex-1 min-w-[200px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'provision_map'
              ? 'bg-teal text-white shadow-xs'
              : 'text-gray-600 hover:text-navy hover:bg-gray-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>📊 Caseload & Provision Mapping</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
            34 Pupils
          </span>
        </button>

        <button
          onClick={() => handleTabSelect('staff_team')}
          className={`flex-1 min-w-[200px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'staff_team'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-gray-600 hover:text-navy hover:bg-gray-100'
          }`}
        >
          <UserPlus className="w-4 h-4" />
          <span>👥 School Staff & Team</span>
          <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-white/20 text-white font-mono">
            {staffList.length > 0 ? `${staffList.length} Staff` : 'Team'}
          </span>
        </button>

        <button
          onClick={() => handleTabSelect('assistant')}
          className={`flex-1 min-w-[200px] py-2.5 px-3.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 whitespace-nowrap ${
            activeTab === 'assistant'
              ? 'bg-navy text-white shadow-xs'
              : 'text-gray-600 hover:text-navy hover:bg-gray-100'
          }`}
        >
          <Sparkles className="w-4 h-4 text-mint" />
          <span>🔍 AI Evidence & RAG Assistant</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* TAB 1: STATUTORY ANNUAL REVIEW EVIDENCE PACK                   */}
      {/* ============================================================== */}
      {activeTab === 'review_pack' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Pupil Target Bar & Quick Export */}
          <div className="bg-gradient-to-r from-purple-900 via-indigo-900 to-navy text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-xl font-bold font-serif text-mint border border-white/10">
                PC
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                    {reviewPack?.child_name || 'Phoenix Carter'}
                  </h3>
                  <span className="text-[10px] bg-purple-400/20 text-purple-200 border border-purple-400/30 px-2 py-0.5 rounded-full font-bold">
                    Statutory EHCP
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                    Review Due in 14 Days
                  </span>
                </div>
                <p className="text-xs text-white/70 mt-0.5">
                  Year 5 &bull; Primary Need: {reviewPack?.primary_need || 'Autism Spectrum Condition (ASC)'} &bull; {timeline.length} Evidence Events Logged
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {loadingPack && (
                <div className="text-[11px] text-mint font-semibold animate-pulse mr-2">
                  Synthesizing evidence...
                </div>
              )}
              <button
                onClick={() => setShowPackModal(true)}
                className="w-full sm:w-auto justify-center px-4 py-2.5 bg-gradient-to-r from-teal to-mint text-navy rounded-xl text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer className="w-4 h-4 text-navy" />
                <span>Print / Save Statutory PDF</span>
              </button>
            </div>
          </div>

          {/* Longitudinal Evidence Metrics Ribbon */}
          {reviewPack && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              <div className="stat-card border-teal">
                <div className="font-serif text-2xl font-bold text-teal">
                  {reviewPack.metrics.total_evidence_observations}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Classroom Observation Logs</div>
              </div>
              <div className="stat-card border-emerald-600">
                <div className="font-serif text-2xl font-bold text-emerald-700">
                  {reviewPack.metrics.de_escalation_win_rate.split(' ')[0]}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">De-Escalation Success Rate</div>
              </div>
              <div className="stat-card border-amber-dark">
                <div className="font-serif text-2xl font-bold text-amber-dark">
                  {reviewPack.metrics.morning_handovers_received}
                </div>
                <div className="text-[11px] text-gray-500 mt-0.5">Parent Handovers Received</div>
              </div>
              <div className="stat-card border-purple-dark">
                <div className="font-serif text-2xl font-bold text-purple-dark">0</div>
                <div className="text-[11px] text-gray-500 mt-0.5">Fixed-Term Exclusions</div>
              </div>
            </div>
          )}

          {/* Statutory Sections A & B */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Section A: Views of Child & Parent */}
            <div className="lg:col-span-6 space-y-4">
              <div className="card p-5 border-l-4 border-l-teal space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-teal/10 text-teal flex items-center justify-center font-bold text-xs">
                      A
                    </span>
                    <h4 className="text-sm font-bold text-navy">Section A: Child & Parent Voice</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal/10 text-teal font-bold">
                    Co-Produced
                  </span>
                </div>

                {reviewPack && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-teal-50/40 rounded-xl border border-teal/20 space-y-1">
                      <div className="font-bold text-navy flex items-center gap-1.5">
                        <span>🧒 Phoenix&apos;s Voice & What Matters:</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed italic">
                        &ldquo;{reviewPack.section_a.child_views}&rdquo;
                      </p>
                    </div>

                    <div className="p-3 bg-amber-50/40 rounded-xl border border-amber-200 space-y-1">
                      <div className="font-bold text-navy">
                        <span>👩‍👦 Dana Carter (Parent Views & Progress):</span>
                      </div>
                      <p className="text-gray-700 leading-relaxed">
                        {reviewPack.section_a.parent_views}
                      </p>
                    </div>

                    <div className="text-[11px] text-gray-500 italic bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                      <strong>Aspirations: </strong>{reviewPack.section_a.child_aspirations}
                    </div>
                  </div>
                )}
              </div>

              {/* Section E: Target Progress */}
              <div className="card p-5 border-l-4 border-l-emerald-600 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                      E
                    </span>
                    <h4 className="text-sm font-bold text-navy">Section E: Measurable Outcomes & Target Progress</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Statutory Targets
                  </span>
                </div>

                {reviewPack && (
                  <div className="space-y-2 text-xs">
                    {reviewPack.section_e.map((out) => (
                      <div key={out.target_id} className="p-2.5 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy">{out.title}</span>
                          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                            {out.status}
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] leading-snug">{out.evidence_summary}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Section B & Section F */}
            <div className="lg:col-span-6 space-y-4">
              {/* Section B: Special Educational Needs */}
              <div className="card p-5 border-l-4 border-l-purple-dark space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-purple-light text-purple-dark flex items-center justify-center font-bold text-xs">
                      B
                    </span>
                    <h4 className="text-sm font-bold text-navy">Section B: Special Educational Needs (4 Areas)</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-light text-purple-dark font-bold">
                    Evidence Verified
                  </span>
                </div>

                {reviewPack && (
                  <div className="space-y-2.5 text-xs">
                    {reviewPack.section_b.map((need, idx) => (
                      <div key={idx} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy">{need.area_of_need}</span>
                          <span className="text-[10px] text-teal font-semibold">
                            {need.evidence_count} Live Observations
                          </span>
                        </div>
                        <p className="text-gray-600 text-[11px] leading-snug">{need.statutory_summary}</p>
                        <div className="pt-1 text-[10px] text-gray-400">
                          <strong>Citations: </strong>{need.citations.join(' · ')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Section F: Quantified Provision */}
              <div className="card p-5 border-l-4 border-l-indigo-600 space-y-3">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                      F
                    </span>
                    <h4 className="text-sm font-bold text-navy">Section F: Quantified Special Provision Delivered</h4>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-bold">
                    100% Tracked
                  </span>
                </div>

                {reviewPack && (
                  <div className="space-y-2 text-xs">
                    {reviewPack.section_f.map((prov) => (
                      <div key={prov.provision_id} className="p-3 bg-gray-50 rounded-xl border border-gray-100 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-navy">{prov.title}</span>
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                            {prov.evidence_delivery_rate}
                          </span>
                        </div>
                        <p className="text-purple-dark text-[11px] font-semibold">{prov.quantified_support}</p>
                        <p className="text-gray-500 text-[10px]">{prov.impact_notes}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Full Screen Review Pack Modal */}
          {showPackModal && (
            <AnnualReviewPackModal
              isOpen={showPackModal}
              onClose={() => setShowPackModal(false)}
              pack={reviewPack}
            />
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 2: WHOLE-SCHOOL CASELOAD & PROVISION MAPPING MATRIX         */}
      {/* ============================================================== */}
      {activeTab === 'provision_map' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Caseload Strategic Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="stat-card border-teal">
              <div className="font-serif text-2xl font-bold text-teal">
                {provisionMatrix?.total_send_count || 34}
              </div>
              <div className="text-[10px] text-gray-500 mt-0.5">Whole-School SEND Caseload</div>
            </div>
            <div className="stat-card border border-gray-100 border-l-4 border-l-purple-600">
              <div className="font-serif text-2xl font-bold text-purple-900">
                {provisionMatrix?.ehcp_count || 12}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">Statutory EHCPs Managed</div>
            </div>
            <div className="stat-card border border-gray-100 border-l-4 border-l-indigo-600">
              <div className="font-serif text-2xl font-bold text-indigo-800">
                {provisionMatrix?.sen_support_count || 22}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">SEN Support (K) Learners</div>
            </div>
            <div className="stat-card border border-gray-100 border-l-4 border-l-emerald-600">
              <div className="font-serif text-2xl font-bold text-emerald-800">
                {provisionMatrix ? `${provisionMatrix.total_ta_hours_weekly.toFixed(0)}h` : '185h'}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">1:1 TA Hours / Week</div>
            </div>
            <div className="stat-card border border-gray-100 border-l-4 border-l-amber-500">
              <div className="font-serif text-2xl font-bold text-amber-800">
                {provisionMatrix?.high_needs_funding_total || '£148,600'}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">High Needs Block Funding</div>
            </div>
            <div className="stat-card border border-gray-100 border-l-4 border-l-rose-500">
              <div className="font-serif text-2xl font-bold text-rose-700">
                {provisionMatrix?.reviews_due_next_30_days || 3}
              </div>
              <div className="text-[10px] text-gray-600 mt-0.5">Reviews Due in &le; 30 Days</div>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="card p-3 flex flex-wrap items-center justify-between gap-2 bg-white">
            <div className="flex items-center gap-1.5 text-xs font-bold text-navy px-2">
              <Filter className="w-3.5 h-3.5 text-teal" />
              <span>Filter Caseload Register:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { key: 'all', label: 'All Pupils (34)' },
                { key: 'ehcp', label: 'Statutory EHCP (12)' },
                { key: 'k', label: 'SEN Support (22)' },
                { key: 'asc', label: 'ASC / Autism' },
                { key: 'adhd', label: 'ADHD' },
                { key: 'due_soon', label: '⚠️ Reviews Due Soon (≤30d)' },
              ].map((f) => (
                <button
                  key={f.key}
                  onClick={() => setProvisionFilter(f.key as any)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
                    provisionFilter === f.key
                      ? 'bg-teal text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Provision Table / Cards Container */}
          <div className="card overflow-hidden bg-white">
            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="font-serif font-bold text-sm text-navy">
                  St. Jude&apos;s Academy Provision & Funding Register (2026/2027)
                </h3>
                <p className="text-[11px] text-gray-500">
                  Showing {provisionMatrix ? getFilteredPupils(provisionMatrix.pupils).length : 12} active SEND learners with statutory review dates.
                </p>
              </div>
              <span className="text-[10px] px-2.5 py-1 rounded-full bg-teal/10 text-teal font-bold hidden sm:inline">
                DfE SEND Code of Practice Compliant
              </span>
            </div>

            {loadingMatrix ? (
              <div className="p-12 text-center text-gray-400 text-xs">
                <div className="w-7 h-7 border-2 border-teal border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                <span>Loading whole-school provision matrix...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 text-gray-500 text-[10px] uppercase font-bold tracking-wider border-b border-gray-100">
                      <th className="py-3 px-4">Pupil & Year</th>
                      <th className="py-3 px-3">Support Tier</th>
                      <th className="py-3 px-3">Primary Need</th>
                      <th className="py-3 px-3">High Needs Funding Band</th>
                      <th className="py-3 px-3">Weekly 1:1 TA Hours</th>
                      <th className="py-3 px-3">Assigned Key Worker</th>
                      <th className="py-3 px-4">Annual Review Due</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {provisionMatrix &&
                      getFilteredPupils(provisionMatrix.pupils).map((p) => (
                        <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-bold text-navy">
                            <div className="flex items-center gap-2">
                              <span>{p.name}</span>
                              <span className="text-[10px] font-normal text-gray-400">({p.year_group})</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-3">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                p.support_tier.includes('EHCP')
                                  ? 'bg-purple-light text-purple-dark'
                                  : 'bg-teal/10 text-teal'
                              }`}
                            >
                              {p.support_tier}
                            </span>
                          </td>
                          <td className="py-3.5 px-3 text-gray-600 max-w-[160px] truncate">
                            {p.primary_need}
                          </td>
                          <td className="py-3.5 px-3 font-semibold text-gray-700">
                            {p.funding_band}
                          </td>
                          <td className="py-3.5 px-3 font-bold text-teal">
                            {p.allocated_ta_hours > 0 ? `${p.allocated_ta_hours}h/wk` : 'Universal'}
                          </td>
                          <td className="py-3.5 px-3 text-gray-600">
                            {p.assigned_ta}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                  p.review_status === 'overdue'
                                    ? 'bg-red-100 text-red-800'
                                    : p.review_status === 'due_soon'
                                    ? 'bg-amber-100 text-amber-900'
                                    : 'bg-gray-100 text-gray-600'
                                }`}
                              >
                                {p.review_status === 'overdue'
                                  ? '⚠️ Overdue'
                                  : p.review_status === 'due_soon'
                                  ? `⚠️ Due in ${p.days_until_review}d`
                                  : `In ${p.days_until_review}d`}
                              </span>
                              <span className="text-[11px] text-gray-400">{p.annual_review_due}</span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              onClick={() => {
                                setActiveTab('review_pack');
                                setShowPackModal(true);
                              }}
                              className="text-[11px] font-bold text-purple-dark hover:underline cursor-pointer flex items-center gap-1 justify-end"
                            >
                              <span>Pack</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 3: AI EVIDENCE RETRIEVAL & RAG ASSISTANT                   */}
      {/* ============================================================== */}
      {activeTab === 'assistant' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in duration-200">
          {/* Left Column: Ask NOYA & EHCP Outcomes */}
          <div className="lg:col-span-7 space-y-4">
            {/* Ask NOYA RAG & Evidence Tool */}
            <div className="card p-5 border-l-4 border-l-teal">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-gray-100">
                <Sparkles className="w-4 h-4 text-teal" />
                <h3 className="text-sm font-bold text-navy">Ask NOYA &bull; SEND Longitudinal Evidence Retrieval</h3>
              </div>
              <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                Ask questions across Phoenix&apos;s observation history, morning handovers, and EHCP provision records. Answers include verifiable citations.
              </p>

              <form onSubmit={handleAsk} className="flex flex-col sm:flex-row gap-2 mb-4">
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Ask NOYA about triggers, strategies, or learning wins..."
                  className="flex-1 text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:border-teal"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-4 py-2.5 bg-teal hover:bg-teal-medium text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>{loading ? 'Searching...' : 'Ask'}</span>
                </button>
              </form>

              {result && (
                <div className="p-4 rounded-xl bg-mint/10 border border-mint/40 space-y-2.5 animate-in fade-in">
                  <div className="flex items-center justify-between text-[11px] text-teal font-bold">
                    <span>NOYA Synthesis ({result.model_used})</span>
                    <span>{result.latency_ms}ms</span>
                  </div>
                  <div className="text-xs text-navy whitespace-pre-line leading-relaxed">
                    {result.answer_markdown}
                  </div>
                  {result.citations.length > 0 && (
                    <div className="pt-2 border-t border-mint/20 text-[10px] text-gray-500">
                      <span className="font-bold">Citations: </span>
                      {result.citations.map((c) => c.citation_text).join(' &bull; ')}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Statutory EHCP Progress Section */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3 border-b border-gray-100 pb-2">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-dark" />
                  <h3 className="text-sm font-bold text-navy">EHCP Annual Review & Outcomes</h3>
                </div>
                <span className="text-[10px] bg-purple-light text-purple-dark px-2 py-0.5 rounded-full font-bold">
                  Section F Active
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <div className="font-bold text-navy">Target 1: Sensory Regulation in Large Spaces</div>
                  <p className="text-gray-600">Provision: Access to noise defenders & visual timetable for whole-school transitions.</p>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>On track &bull; 8 positive observation logs this term</span>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                  <div className="font-bold text-navy">Target 2: Peer Collaboration & Group Tasks</div>
                  <p className="text-gray-600">Provision: Visual task breakdown strip for partner work in practical subjects.</p>
                  <div className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1 pt-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Demonstrated in Science practical (Water density task)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Documents, Incidents & Caseload */}
          <div className="lg:col-span-5 space-y-4">
            {/* Statutory Documents Section */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-dark" />
                  <h3 className="text-sm font-bold text-navy">Statutory Documents ({documents.length})</h3>
                </div>
                {onOpenDocModal && (
                  <button
                    onClick={onOpenDocModal}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-purple-light text-purple-dark rounded-lg hover:bg-purple-200 cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>+ Upload</span>
                  </button>
                )}
              </div>

              {documents.length === 0 ? (
                <p className="text-xs text-gray-400 italic">No statutory documents uploaded yet.</p>
              ) : (
                <div className="space-y-2">
                  {documents.map((doc) => (
                    <div key={doc.id} className="p-2.5 rounded-xl border border-gray-100 bg-gray-50 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold text-navy">{doc.title}</div>
                        <div className="text-[10px] text-gray-400">{doc.document_type} &bull; {(doc.file_size_bytes ? doc.file_size_bytes / 1024 : 0).toFixed(1)} KB</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Stored</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ABC Incident Triage */}
            <div className="card p-5">
              <div className="flex items-center justify-between mb-3 pb-2 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-coral" />
                  <h3 className="text-sm font-bold text-navy">ABC Incidents ({incidents.length})</h3>
                </div>
                {onOpenIncidentModal && (
                  <button
                    onClick={onOpenIncidentModal}
                    className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold bg-rose-50 text-rose-800 border border-rose-200 rounded-lg hover:bg-rose-100 cursor-pointer"
                  >
                    <span>+ Report ABC</span>
                  </button>
                )}
              </div>

              {incidents.length === 0 ? (
                <div className="p-3 rounded-xl border border-emerald-100 bg-emerald-50 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Zero major incidents recorded this term.</span>
                </div>
              ) : (
                <div className="space-y-2">
                  {incidents.map((inc) => (
                    <div key={inc.id} className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                      <div className="flex justify-between font-bold text-navy">
                        <span>{inc.location || 'Classroom'}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          inc.severity === 'Safeguarding Incident' ? 'bg-red-100 text-red-800' : 'bg-coral-100 text-coral-800'
                        }`}>
                          {inc.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-600"><strong>A:</strong> {inc.antecedent}</p>
                      <p className="text-[11px] text-gray-600"><strong>B:</strong> {inc.behaviour}</p>
                      <p className="text-[11px] text-emerald-700"><strong>C:</strong> {inc.consequence}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inclusion Triage & Reviews */}
            <div className="card p-5">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-100">
                <ShieldCheck className="w-4 h-4 text-teal" />
                <h3 className="text-sm font-bold text-navy">Inclusion Triage & Reviews</h3>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-navy">
                    <span>Phoenix Carter (Year 5)</span>
                    <span className="text-coral-dark text-[10px]">Today: Assembly Alert</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">ASC &bull; Noise defenders prepared &bull; Handover received from Dana Carter</p>
                </div>

                <div className="p-3 rounded-xl border border-gray-100 bg-gray-50 text-xs space-y-1">
                  <div className="flex justify-between font-bold text-navy">
                    <span>Luca Moretti (Year 4)</span>
                    <span className="text-emerald-700 text-[10px]">Stable</span>
                  </div>
                  <p className="text-gray-500 text-[11px]">Speech & Language therapy scheduled for Thursday 2:00pm</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* TAB 4: SCHOOL STAFF & TEAM DIRECTORY (SENCO RECRUITING & DELEGATION) */}
      {/* ============================================================== */}
      {activeTab === 'staff_team' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Header Action Banner */}
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-navy text-white p-5 rounded-2xl shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xs flex items-center justify-center text-xl font-bold font-serif text-mint border border-white/10">
                👥
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base sm:text-lg font-bold font-serif text-white">
                    School Staff & Inclusion Team Directory
                  </h3>
                  <span className="text-[10px] bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 px-2 py-0.5 rounded-full font-bold">
                    St. Jude&apos;s Inclusive Academy
                  </span>
                </div>
                <p className="text-xs text-mint/80 mt-1 max-w-2xl">
                  SENCO operational authority: Appoint, provision, and allocate Classroom Teachers, Teaching Assistants, and Specialists within your school tenant.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 flex-shrink-0">
              <button
                onClick={loadStaff}
                disabled={loadingStaff}
                className="px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-all border border-white/15 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                title="Refresh Staff List"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingStaff ? 'animate-spin' : ''}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>
              <button
                onClick={() => setIsAddStaffModalOpen(true)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-400 to-mint hover:from-teal-300 hover:to-mint text-navy text-xs font-bold transition-all shadow-sm hover:shadow-md flex items-center gap-2 cursor-pointer"
              >
                <UserPlus className="w-4 h-4 text-navy" />
                <span>+ Add Staff Member</span>
              </button>
            </div>
          </div>

          {/* Provisioning Success Notification */}
          {provisionSuccessMsg && (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-xs">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div className="text-xs space-y-1">
                  <p className="font-bold">
                    ✓ Successfully appointed and provisioned {provisionSuccessMsg.name} ({provisionSuccessMsg.email})
                  </p>
                  <p className="text-emerald-700">
                    Role: <span className="font-semibold uppercase tracking-wider">{provisionSuccessMsg.role}</span> &bull; Initial Password: <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">{provisionSuccessMsg.password || 'Welcome2026!'}</code> &bull; Invitation email logged in audit trail.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setProvisionSuccessMsg(null)}
                className="text-emerald-700 hover:text-emerald-900 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 4 Summary Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">Total Appointed</span>
                <Users className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-serif text-navy">
                {staffList.length}
              </div>
              <p className="text-[10px] text-gray-400 mt-0.5">Active School Team</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">Teachers</span>
                <GraduationCap className="w-4 h-4 text-purple-600" />
              </div>
              <div className="text-2xl font-bold font-serif text-navy">
                {staffList.filter((s) => s.role === 'teacher').length}
              </div>
              <p className="text-[10px] text-purple-600 font-medium mt-0.5">Classroom & Handover Leads</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">1:1 TAs</span>
                <Users className="w-4 h-4 text-teal" />
              </div>
              <div className="text-2xl font-bold font-serif text-navy">
                {staffList.filter((s) => s.role === 'ta').length}
              </div>
              <p className="text-[10px] text-teal font-medium mt-0.5">SEND Transition & Micro-Logs</p>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-2xs">
              <div className="flex items-center justify-between text-gray-500 mb-1">
                <span className="text-xs font-semibold">Specialists / SENCO</span>
                <ShieldCheck className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="text-2xl font-bold font-serif text-navy">
                {staffList.filter((s) => s.role === 'specialist' || s.role === 'senco').length}
              </div>
              <p className="text-[10px] text-indigo-600 font-medium mt-0.5">SaLT, Ed Psych & Leadership</p>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-gray-100 shadow-2xs">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setStaffFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffFilter === 'all'
                    ? 'bg-navy text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                All Staff ({staffList.length})
              </button>
              <button
                onClick={() => setStaffFilter('teacher')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffFilter === 'teacher'
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Classroom Teachers ({staffList.filter((s) => s.role === 'teacher').length})
              </button>
              <button
                onClick={() => setStaffFilter('ta')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffFilter === 'ta'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Teaching Assistants ({staffList.filter((s) => s.role === 'ta').length})
              </button>
              <button
                onClick={() => setStaffFilter('specialist')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  staffFilter === 'specialist'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Specialists ({staffList.filter((s) => s.role === 'specialist').length})
              </button>
            </div>

            <div className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-teal" />
              <span>Strict School Tenant Boundary Enforced</span>
            </div>
          </div>

          {/* Staff Grid */}
          {loadingStaff ? (
            <div className="p-12 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
              <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-teal" />
              <p className="text-xs">Loading appointed school team...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList
                .filter((s) => {
                  if (staffFilter === 'teacher') return s.role === 'teacher';
                  if (staffFilter === 'ta') return s.role === 'ta';
                  if (staffFilter === 'specialist') return s.role === 'specialist';
                  return true;
                })
                .map((staff) => {
                  const roleConfig = {
                    teacher: {
                      badge: 'Classroom Teacher',
                      badgeBg: 'bg-purple-100 text-purple-700 border-purple-200',
                      avatarBg: 'bg-purple-600 text-white',
                      duties: 'Pre-Flight Handovers, differentiated pathways & lesson worksheets',
                    },
                    ta: {
                      badge: '1:1 Teaching Assistant',
                      badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
                      avatarBg: 'bg-emerald-600 text-white',
                      duties: 'High-risk timetable execution, <45s micro-logs & sensory decompression',
                    },
                    specialist: {
                      badge: 'Specialist / Therapist',
                      badgeBg: 'bg-indigo-100 text-indigo-700 border-indigo-200',
                      avatarBg: 'bg-indigo-600 text-white',
                      duties: 'Clinical observations, SaLT therapy programs & diagnostic reports',
                    },
                    senco: {
                      badge: 'Lead SENCO & Inclusion Lead',
                      badgeBg: 'bg-teal/10 text-teal border-teal/20',
                      avatarBg: 'bg-teal text-white',
                      duties: 'Statutory Section 44 packs, SEND register & staff team management',
                    },
                  }[staff.role] || {
                    badge: staff.role.toUpperCase(),
                    badgeBg: 'bg-gray-100 text-gray-700 border-gray-200',
                    avatarBg: 'bg-gray-600 text-white',
                    duties: 'Staff operations',
                  };

                  const initials = staff.full_name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2);

                  return (
                    <div
                      key={staff.id}
                      className="bg-white rounded-2xl border border-gray-100 p-5 shadow-2xs hover:shadow-xs transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm ${roleConfig.avatarBg}`}
                            >
                              {initials}
                            </div>
                            <div>
                              <h4 className="font-bold text-navy text-sm leading-tight">
                                {staff.full_name}
                              </h4>
                              <a
                                href={`mailto:${staff.email}`}
                                className="text-[11px] text-gray-400 hover:text-teal flex items-center gap-1 mt-0.5"
                              >
                                <Mail className="w-3 h-3" />
                                <span>{staff.email}</span>
                              </a>
                            </div>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleConfig.badgeBg} whitespace-nowrap`}
                          >
                            {roleConfig.badge}
                          </span>
                        </div>

                        <div className="space-y-1.5 py-3 border-t border-b border-gray-100 my-3 text-xs">
                          <div className="flex justify-between items-center text-gray-500">
                            <span>Assigned Tenant:</span>
                            <span className="font-semibold text-navy">
                              {staff.school_name || "St. Jude's Inclusive Academy"}
                            </span>
                          </div>
                          <div className="flex justify-between items-center text-gray-500">
                            <span>Status:</span>
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                              <UserCheck className="w-3 h-3" />
                              Active & Verified
                            </span>
                          </div>
                        </div>

                        <div className="bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-gray-400 block mb-1">
                            Delegated Responsibilities:
                          </span>
                          <p className="text-[11px] text-gray-600 leading-relaxed">
                            {roleConfig.duties}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400">
                        <span>Appointed by SENCO</span>
                        <span className="text-teal font-semibold">1-Click Connected</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          )}

          {/* Modal: Add Staff Member */}
          {isAddStaffModalOpen && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-xs animate-in fade-in duration-150">
              <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150">
                <div className="flex items-start justify-between gap-3 mb-4 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                      <UserPlus className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-navy text-base">
                        Provision School Staff Member
                      </h3>
                      <p className="text-xs text-gray-500">
                        St. Jude&apos;s Inclusive Academy &bull; Recruited under SENCO leadership
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAddStaffModalOpen(false)}
                    className="text-gray-400 hover:text-navy p-1 rounded-lg hover:bg-gray-100 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleProvisionStaff} className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffForm.firstName}
                        onChange={(e) =>
                          setStaffForm({ ...staffForm, firstName: e.target.value })
                        }
                        placeholder="e.g. Thomas"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-teal"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-navy mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={staffForm.lastName}
                        onChange={(e) =>
                          setStaffForm({ ...staffForm, lastName: e.target.value })
                        }
                        placeholder="e.g. Clarke"
                        className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-teal"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      School Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={staffForm.email}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, email: e.target.value })
                      }
                      placeholder="e.g. t.clarke@stjudes.sch.uk"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      Role & Support Tier *
                    </label>
                    <select
                      value={staffForm.role}
                      onChange={(e) =>
                        setStaffForm({
                          ...staffForm,
                          role: e.target.value as 'teacher' | 'ta' | 'specialist',
                        })
                      }
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-teal bg-white cursor-pointer"
                    >
                      <option value="teacher">Classroom Teacher (Class Lead, Handover recipient)</option>
                      <option value="ta">Teaching Assistant / 1:1 Support (Micro-logs, High-risk transitions)</option>
                      <option value="specialist">Specialist / Therapist / SaLT (Clinical observations)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      Class / Room / Specialism Assignment
                    </label>
                    <input
                      type="text"
                      value={staffForm.jobTitle}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, jobTitle: e.target.value })
                      }
                      placeholder="e.g. Year 4 Teacher (Room 2) or Autism 1:1 Specialist"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-navy mb-1">
                      Initial Temporary Password (Optional)
                    </label>
                    <input
                      type="text"
                      value={staffForm.password}
                      onChange={(e) =>
                        setStaffForm({ ...staffForm, password: e.target.value })
                      }
                      placeholder="Defaults to Welcome2026!"
                      className="w-full text-xs px-3 py-2 rounded-xl border border-gray-200 focus:outline-hidden focus:border-teal font-mono"
                    />
                    <p className="text-[10px] text-gray-400 mt-1">
                      The user will be prompted to change their password upon first login.
                    </p>
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                    <button
                      type="button"
                      onClick={() => setIsAddStaffModalOpen(false)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-gray-600 hover:bg-gray-100 cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={submittingStaff}
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal text-white text-xs font-bold shadow-sm hover:shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      {submittingStaff ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Provisioning...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Appoint & Provision Staff</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
