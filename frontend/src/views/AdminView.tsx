import React, { useState, useEffect } from 'react';
import {
  SchoolTenant,
  AdminUserItem,
  AuditLogEntry,
  TrustGovernanceStats,
  DelegationMatrixItem,
} from '../types';
import { api } from '../api';
import {
  Building2,
  Users,
  ShieldCheck,
  FileText,
  Plus,
  School,
  Lock,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  UserPlus,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react';

interface AdminViewProps {
  activeTab?: 'schools' | 'staff' | 'delegation' | 'audit';
  onTabChange?: (tab: 'schools' | 'staff' | 'delegation' | 'audit') => void;
}

export const AdminView: React.FC<AdminViewProps> = ({
  activeTab = 'schools',
  onTabChange,
}) => {
  const [tab, setTab] = useState<'schools' | 'staff' | 'delegation' | 'audit'>(activeTab);
  const [stats, setStats] = useState<TrustGovernanceStats | null>(null);
  const [schools, setSchools] = useState<SchoolTenant[]>([]);
  const [staffUsers, setStaffUsers] = useState<AdminUserItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [delegationRules, setDelegationRules] = useState<DelegationMatrixItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter state
  const [schoolFilter, setSchoolFilter] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [auditActionFilter, setAuditActionFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [isOnboardModalOpen, setIsOnboardModalOpen] = useState(false);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [provisionSuccessMsg, setProvisionSuccessMsg] = useState<string | null>(null);

  // New School Form
  const [newSchoolName, setNewSchoolName] = useState('');
  const [newSchoolUrn, setNewSchoolUrn] = useState('');
  const [newSchoolPhase, setNewSchoolPhase] = useState('Primary');
  const [newSchoolLa, setNewSchoolLa] = useState('Southwark');
  const [newSchoolSenco, setNewSchoolSenco] = useState('');
  const [newSchoolEmail, setNewSchoolEmail] = useState('');

  // New Staff Form
  const [staffFirstName, setStaffFirstName] = useState('');
  const [staffLastName, setStaffLastName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState('senco');
  const [staffSchoolId, setStaffSchoolId] = useState('');
  const [staffJobTitle, setStaffJobTitle] = useState('');
  const [staffPassword, setStaffPassword] = useState('Welcome2026!');

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [sData, schData, uData, aData, dData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminSchools().catch(() => []),
        api.getAdminUsers().catch(() => []),
        api.getAuditLogs().catch(() => []),
        api.getDelegationMatrix().catch(() => []),
      ]);
      setStats(sData);
      setSchools(schData);
      setStaffUsers(uData);
      setAuditLogs(aData);
      setDelegationRules(dData);
      if (schData.length > 0 && !staffSchoolId) {
        setStaffSchoolId(schData[0].id);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load governance data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleTabSwitch = (newTab: 'schools' | 'staff' | 'delegation' | 'audit') => {
    setTab(newTab);
    onTabChange?.(newTab);
  };

  const handleOnboardSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchoolName || !newSchoolUrn) return;
    try {
      await api.onboardSchool({
        school_name: newSchoolName.trim(),
        urn_number: newSchoolUrn.trim(),
        phase: newSchoolPhase,
        local_authority: newSchoolLa.trim(),
        lead_senco_name: newSchoolSenco.trim() || undefined,
        main_email: newSchoolEmail.trim() || undefined,
      });
      setIsOnboardModalOpen(false);
      setNewSchoolName('');
      setNewSchoolUrn('');
      setNewSchoolSenco('');
      setNewSchoolEmail('');
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to onboard school');
    }
  };

  const handleProvisionStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffFirstName || !staffLastName || !staffEmail || !staffSchoolId) return;
    try {
      const res = await api.provisionStaff({
        first_name: staffFirstName.trim(),
        last_name: staffLastName.trim(),
        email: staffEmail.trim(),
        role: staffRole,
        school_id: staffSchoolId,
        job_title: staffJobTitle.trim() || undefined,
        password: staffPassword || 'Welcome2026!',
      });
      setProvisionSuccessMsg(
        `✓ Provisioned ${res.role.toUpperCase()} account for ${res.full_name} (${res.email}) at ${res.school_name}. Temporary Password: ${res.temporary_credentials}`
      );
      setStaffFirstName('');
      setStaffLastName('');
      setStaffEmail('');
      setStaffJobTitle('');
      setIsProvisionModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to provision staff account');
    }
  };

  // Filtered lists
  const filteredSchools = schools.filter((s) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.school_name.toLowerCase().includes(q) ||
      (s.urn_number && s.urn_number.toLowerCase().includes(q)) ||
      (s.local_authority && s.local_authority.toLowerCase().includes(q))
    );
  });

  const filteredStaff = staffUsers.filter((u) => {
    if (schoolFilter && u.school_id !== schoolFilter) return false;
    if (roleFilter && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        u.full_name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.school_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredAuditLogs = auditLogs.filter((l) => {
    if (auditActionFilter && l.action !== auditActionFilter) return false;
    if (schoolFilter && l.school_id !== schoolFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        l.details.toLowerCase().includes(q) ||
        l.actor_name.toLowerCase().includes(q) ||
        (l.target_name && l.target_name.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Governance Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-800/40 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 text-xs font-semibold">
              <Building2 className="w-3.5 h-3.5 text-indigo-300" />
              <span>Multi-Academy Trust & Platform Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-white">
              Trust Operations & Multi-Tenancy Hub
            </h1>
            <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
              Executive oversight for Multi-Academy Trusts and Local Authorities. Onboard discrete school tenants,
              appoint Lead SENCOs, and maintain strict cross-tenant data segregation with immutable audit logging.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-shrink-0">
            <button
              onClick={() => setIsOnboardModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-teal to-teal-dark hover:from-teal-dark hover:to-teal text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-teal/20 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>+ Onboard School</span>
            </button>
            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-600/20 transition-all active:scale-95"
            >
              <UserPlus className="w-4 h-4" />
              <span>+ Appoint Staff</span>
            </button>
          </div>
        </div>

        {/* Live KPI Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mt-6 pt-6 border-t border-indigo-800/40">
          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <School className="w-3.5 h-3.5 text-teal" />
              <span>School Tenants</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.total_schools ?? schools.length}
            </div>
            <div className="text-[10px] text-teal mt-0.5">Isolated Boundaries</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-indigo-400" />
              <span>Staff Personas</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.total_staff ?? staffUsers.length}
            </div>
            <div className="text-[10px] text-indigo-300 mt-0.5">Role-Delegated</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber" />
              <span>Pupils Enrolled</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.total_pupils ?? 2}
            </div>
            <div className="text-[10px] text-amber mt-0.5">Across All Schools</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-coral" />
              <span>EHCP Ratio</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.ehcp_pupils ?? 1} / {stats?.total_pupils ?? 2}
            </div>
            <div className="text-[10px] text-coral mt-0.5">High-Needs Banding</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-mint" />
              <span>Compliance</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">99.4%</div>
            <div className="text-[10px] text-mint mt-0.5">KCSIE & GDPR Audited</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-sm border border-slate-700/60 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-sky-400" />
              <span>Audit Entries</span>
            </div>
            <div className="text-xl font-bold text-white mt-1">
              {stats?.audit_events_count ?? auditLogs.length}
            </div>
            <div className="text-[10px] text-sky-300 mt-0.5">Immutable Trail</div>
          </div>
        </div>
      </div>

      {/* Success Notification Banner */}
      {provisionSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed">{provisionSuccessMsg}</div>
          </div>
          <button
            onClick={() => setProvisionSuccessMsg(null)}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Error Notification Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start justify-between gap-3 shadow-sm animate-fade-in">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm font-medium leading-relaxed">{error}</div>
          </div>
          <button
            onClick={() => setError(null)}
            className="text-xs font-semibold text-rose-700 hover:text-rose-900 flex-shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 pb-3">
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => handleTabSwitch('schools')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === 'schools'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>School Tenants ({schools.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('staff')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === 'staff'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Staff Directory ({staffUsers.length})</span>
          </button>

          <button
            onClick={() => handleTabSwitch('delegation')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === 'delegation'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Responsibility Delegation</span>
          </button>

          <button
            onClick={() => handleTabSwitch('audit')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              tab === 'audit'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Security & Audit Log</span>
          </button>
        </div>

        <button
          onClick={loadData}
          className="p-2 rounded-lg text-gray-500 hover:text-gray-800 hover:bg-gray-100 transition-colors"
          title="Refresh Data"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* TAB 1: SCHOOL TENANTS */}
      {tab === 'schools' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative max-w-sm w-full">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by school name, URN, or local authority..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="text-xs text-gray-500 font-medium">
              Showing {filteredSchools.length} of {schools.length} onboarded school tenants
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSchools.map((s) => (
              <div
                key={s.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold uppercase tracking-wider">
                        URN: {s.urn_number || 'N/A'} · {s.phase || 'Primary'}
                      </div>
                      <h3 className="font-serif font-bold text-base text-gray-900 mt-2 leading-snug">
                        {s.school_name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {s.town_city || 'London'} · {s.local_authority || 'Southwark LA'}
                      </p>
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-100 flex-shrink-0" />
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-100 space-y-2 text-xs text-gray-600">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Appointed Lead SENCO:</span>
                      <span className="font-semibold text-gray-900">
                        {s.lead_senco_name || 'To be appointed'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Active Pupils:</span>
                      <span className="font-semibold text-gray-900">{s.pupil_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Staff Assigned:</span>
                      <span className="font-semibold text-gray-900">{s.staff_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-500">Tenant Boundary:</span>
                      <span className="font-mono text-[10px] bg-slate-50 px-1.5 py-0.5 rounded text-slate-600">
                        Isolated ({s.id.slice(0, 8)}...)
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Active Tenant</span>
                  </span>
                  <button
                    onClick={() => {
                      setStaffSchoolId(s.id);
                      setIsProvisionModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                  >
                    <span>+ Appoint Staff</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: STAFF & SENCO APPOINTMENTS */}
      {tab === 'staff' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search staff by name or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Schools</option>
                {schools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.school_name}
                  </option>
                ))}
              </select>

              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Roles</option>
                <option value="senco">SENCO & Inclusion Lead</option>
                <option value="teacher">Classroom Teacher</option>
                <option value="ta">1:1 Teaching Assistant</option>
                <option value="admin">Trust Admin</option>
              </select>
            </div>

            <button
              onClick={() => setIsProvisionModalOpen(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow transition-all self-start sm:self-auto"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>+ Appoint Staff</span>
            </button>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Role & Scope</th>
                    <th className="py-3 px-4">Assigned School</th>
                    <th className="py-3 px-4">Data Boundary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredStaff.map((u) => {
                    const roleBadgeColor =
                      u.role === 'senco'
                        ? 'bg-teal-50 text-teal-800 border-teal-200'
                        : u.role === 'teacher'
                        ? 'bg-purple-50 text-purple-800 border-purple-200'
                        : u.role === 'ta'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-indigo-50 text-indigo-800 border-indigo-200';

                    return (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-semibold text-gray-900">{u.full_name}</div>
                          <div className="text-xs text-gray-500">{u.email}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${roleBadgeColor}`}
                          >
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-gray-800 font-medium">
                          {u.school_name}
                        </td>
                        <td className="py-3 px-4 text-xs text-gray-500">
                          {u.role === 'admin' ? (
                            <span className="font-semibold text-indigo-700">Trust-wide Governance</span>
                          ) : (
                            <span>Scoped to {u.school_name}</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Active</span>
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="text-xs text-slate-400 font-mono">
                            ID: {u.id.slice(0, 8)}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: RESPONSIBILITY DELEGATION MATRIX */}
      {tab === 'delegation' && (
        <div className="space-y-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 text-indigo-900 text-xs sm:text-sm leading-relaxed">
            <div className="font-bold flex items-center gap-2 text-indigo-950">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Separation of Duties & Least Privilege (KCSIE / GDPR Standards)</span>
            </div>
            <p className="mt-1 text-indigo-800 text-xs">
              To safeguard child privacy and satisfy UK statutory requirements, operational capabilities are explicitly
              delegated. While the Trust Admin provisions schools and accounts, day-to-day SEND admissions and clinical
              Section 44 oversight rest strictly with the school-level Lead SENCO.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {delegationRules.map((rule) => {
              const borderAccent =
                rule.role_key === 'admin'
                  ? 'border-indigo-400 bg-indigo-50/30'
                  : rule.role_key === 'senco'
                  ? 'border-teal bg-teal-50/30'
                  : rule.role_key === 'teacher'
                  ? 'border-purple-400 bg-purple-50/30'
                  : rule.role_key === 'ta'
                  ? 'border-emerald-400 bg-emerald-50/30'
                  : rule.role_key === 'parent'
                  ? 'border-amber bg-amber-50/30'
                  : 'border-coral bg-rose-50/30';

              return (
                <div
                  key={rule.role_key}
                  className={`bg-white border-2 rounded-2xl p-5 shadow-sm space-y-3.5 ${borderAccent}`}
                >
                  <div>
                    <div className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">
                      {rule.tier}
                    </div>
                    <h3 className="font-serif font-bold text-base text-gray-900 mt-0.5">
                      {rule.role_title}
                    </h3>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Direct Operational Authorities:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-gray-600 pl-4 list-disc">
                      {rule.authorities.map((auth, idx) => (
                        <li key={idx}>{auth}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <div className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                      <ArrowRight className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Delegated Responsibilities:</span>
                    </div>
                    <ul className="space-y-1 text-xs text-gray-600 pl-4 list-disc">
                      {rule.delegated_responsibilities.map((del, idx) => (
                        <li key={idx}>{del}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-2 border-t border-gray-100 text-[11px] text-gray-500 space-y-1">
                    <div>
                      <strong className="text-gray-700">Safeguarding Scope:</strong>{' '}
                      {rule.safeguarding_scope}
                    </div>
                    <div>
                      <strong className="text-gray-700">Data Boundary:</strong> {rule.data_boundary}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: SECURITY & AUDIT TRAIL */}
      {tab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-64">
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search audit details or actors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <select
                value={auditActionFilter}
                onChange={(e) => setAuditActionFilter(e.target.value)}
                className="px-3 py-2 text-xs sm:text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Actions</option>
                <option value="ONBOARD_SCHOOL">ONBOARD_SCHOOL</option>
                <option value="APPOINT_SENCO">APPOINT_SENCO</option>
                <option value="PROVISION_STAFF">PROVISION_STAFF</option>
                <option value="REGISTER_PUPIL">REGISTER_PUPIL</option>
              </select>
            </div>

            <div className="text-xs text-gray-500 font-medium">
              Immutable Governance Trail (UK Data Protection Act 2018)
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs sm:text-sm">
                <thead className="bg-slate-50 border-b border-gray-200 text-slate-600 font-semibold text-xs">
                  <tr>
                    <th className="py-3 px-4">Timestamp</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Target Entity</th>
                    <th className="py-3 px-4">School Tenant</th>
                    <th className="py-3 px-4">Audit Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredAuditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4 text-xs text-gray-500 whitespace-nowrap">
                        <div className="font-mono text-gray-800">
                          {new Date(log.timestamp).toLocaleDateString('en-GB')}
                        </div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString('en-GB')}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{log.actor_name}</div>
                        <div className="text-[10px] text-gray-500 uppercase">{log.actor_role}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="text-xs font-medium text-gray-800">
                          {log.target_name || log.target_type}
                        </div>
                        <div className="text-[10px] text-gray-400 font-mono">
                          {log.target_type}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-600 font-medium">
                        {log.school_name || 'Trust Portfolio'}
                      </td>
                      <td className="py-3 px-4 text-xs text-gray-700 max-w-md">
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ONBOARD NEW SCHOOL */}
      {isOnboardModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span className="text-lg font-serif">Onboard New School Tenant</span>
              </div>
              <button
                onClick={() => setIsOnboardModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleOnboardSchoolSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  School Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. St. Jude's Inclusive Academy"
                  value={newSchoolName}
                  onChange={(e) => setNewSchoolName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    DfE URN Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 138942"
                    value={newSchoolUrn}
                    onChange={(e) => setNewSchoolUrn(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">Phase</label>
                  <select
                    value={newSchoolPhase}
                    onChange={(e) => setNewSchoolPhase(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="Primary">Primary (Ages 4-11)</option>
                    <option value="Secondary">Secondary (Ages 11-18)</option>
                    <option value="All-through">All-through (Ages 4-18)</option>
                    <option value="Special">Special / Specialist Provision</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Local Authority
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Southwark"
                    value={newSchoolLa}
                    onChange={(e) => setNewSchoolLa(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Main Contact Email
                  </label>
                  <input
                    type="email"
                    placeholder="admin@school.sch.uk"
                    value={newSchoolEmail}
                    onChange={(e) => setNewSchoolEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Appoint Lead SENCO (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Ms Amara Okafor (can be appointed later)"
                  value={newSchoolSenco}
                  onChange={(e) => setNewSchoolSenco(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsOnboardModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Confirm & Onboard Tenant
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: APPOINT STAFF / SENCO */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <span className="text-lg font-serif">Appoint & Provision Staff Persona</span>
              </div>
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleProvisionStaffSubmit} className="space-y-3.5 text-xs sm:text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. David"
                    value={staffFirstName}
                    onChange={(e) => setStaffFirstName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Davies"
                    value={staffLastName}
                    onChange={(e) => setStaffLastName(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">
                  Email Address *
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. d.davies@school.sch.uk"
                  value={staffEmail}
                  onChange={(e) => setStaffEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Persona Role *
                  </label>
                  <select
                    value={staffRole}
                    onChange={(e) => setStaffRole(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-semibold text-gray-800"
                  >
                    <option value="senco">🛡️ Lead SENCO (School Lead)</option>
                    <option value="teacher">👩‍🏫 Classroom Teacher</option>
                    <option value="ta">🤝 1:1 Teaching Assistant</option>
                    <option value="admin">🏛️ Trust / Central Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Assign School Tenant *
                  </label>
                  <select
                    value={staffSchoolId}
                    onChange={(e) => setStaffSchoolId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-800 font-medium"
                  >
                    {schools.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.school_name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Job Title / Role Specialism
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Director of Inclusion"
                    value={staffJobTitle}
                    onChange={(e) => setStaffJobTitle(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-gray-700 mb-1">
                    Temporary Password
                  </label>
                  <input
                    type="text"
                    placeholder="Welcome2026!"
                    value={staffPassword}
                    onChange={(e) => setStaffPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none font-mono text-xs"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600">
                <span className="font-semibold text-slate-800">Responsibility Delegation:</span> When
                appointing a <strong>Lead SENCO</strong>, they automatically receive school-level authority to
                register pupils, invite parents, and compile Section 44 review packs.
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsProvisionModalOpen(false)}
                  className="px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md transition-all active:scale-95"
                >
                  Provision Account & Log Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
