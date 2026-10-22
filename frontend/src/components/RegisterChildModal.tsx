import React, { useState } from 'react';
import { api } from '../api';
import { ChildRegistrationRequest, ChildRegistrationResponse } from '../types';

interface RegisterChildModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (newChildId: string) => void;
  onOpenParentOnboarding?: (token: string) => void;
}

export const RegisterChildModal: React.FC<RegisterChildModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
  onOpenParentOnboarding,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrationResult, setRegistrationResult] = useState<ChildRegistrationResponse | null>(null);
  const [showEmailPreview, setShowEmailPreview] = useState(false);

  // Form State
  const [formData, setFormData] = useState<ChildRegistrationRequest>({
    first_name: '',
    last_name: '',
    preferred_name: '',
    date_of_birth: '2015-06-20',
    sex: 'Male',
    year_group: 'Year 5',
    primary_need: 'Autism Spectrum Condition (ASC)',
    secondary_need: 'Working Memory & Auditory Processing',
    has_ehcp: true,
    ehcp_status: 'Active',
    summary: 'Pupil responds well to visual scheduling, structured breaks, and clear low-arousal environments.',
    communication_preferences: 'Prefers visual icon strips and short, step-by-step instructions.',
    sensory_profile: 'Sensitive to loud unexpected bell tones; benefits from noise-cancelling headphones in hall.',
    strengths_interests: 'Highly creative, excels in LEGO construction, spatial design, and computing.',
    baseline_strategy: 'Offer calm transition warning 5 minutes before lesson switch. Provide visual checklist.',
    guardian_first_name: '',
    guardian_last_name: '',
    guardian_email: '',
    guardian_mobile: '',
    relationship_to_child: 'Mother',
    send_invitation_immediately: true,
  });

  if (!isOpen) return null;

  const handleChange = (field: keyof ChildRegistrationRequest, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    setError(null);
    if (step === 1) {
      if (!formData.first_name.trim() || !formData.last_name.trim()) {
        setError('Please enter pupil first and last name.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      setStep(3);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.guardian_first_name.trim() || !formData.guardian_email.trim()) {
      setError('Please provide parent/guardian name and email address.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.registerChild(formData);
      setRegistrationResult(res);
      setStep(4);
      onRegistered(res.child_id);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setStep(1);
    setRegistrationResult(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-lg shadow-indigo-500/20 flex-shrink-0">
              📋
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                Register SEND Pupil
                <span className="text-[10px] sm:text-xs px-2 sm:px-2.5 py-0.5 rounded-full font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
                  SENCO
                </span>
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                Register pupil profile, establish SEND baseline, and invite parents.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Wizard Steps Tracker */}
        {step < 4 && (
          <div className="px-3 sm:px-6 py-3 bg-slate-50 dark:bg-slate-850 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs font-semibold">
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                step === 1 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  step === 1
                    ? 'bg-indigo-600 text-white'
                    : step > 1
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                {step > 1 ? '✓' : '1'}
              </span>
              <span className="hidden sm:inline">Pupil Demographics</span>
              <span className="sm:hidden text-[11px]">Demographics</span>
            </div>
            <div className="h-0.5 w-4 sm:w-8 bg-slate-200 dark:bg-slate-700" />
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                step === 2 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  step === 2
                    ? 'bg-indigo-600 text-white'
                    : step > 2
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                {step > 2 ? '✓' : '2'}
              </span>
              <span className="hidden sm:inline">SEND & EHCP Profile</span>
              <span className="sm:hidden text-[11px]">SEND Profile</span>
            </div>
            <div className="h-0.5 w-4 sm:w-8 bg-slate-200 dark:bg-slate-700" />
            <div
              className={`flex items-center gap-1.5 sm:gap-2 ${
                step === 3 ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                  step === 3
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-600'
                }`}
              >
                3
              </span>
              <span className="hidden sm:inline">Guardian & Invite</span>
              <span className="sm:hidden text-[11px]">Guardian</span>
            </div>
          </div>
        )}

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STEP 1: Pupil Demographics */}
          {step === 1 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Step 1: Pupil Demographics
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Archie"
                    value={formData.first_name}
                    onChange={(e) => handleChange('first_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Watson"
                    value={formData.last_name}
                    onChange={(e) => handleChange('last_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Preferred Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Archie"
                    value={formData.preferred_name || ''}
                    onChange={(e) => handleChange('preferred_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Date of Birth *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange('date_of_birth', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Sex
                  </label>
                  <select
                    value={formData.sex}
                    onChange={(e) => handleChange('sex', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Year Group / Class
                </label>
                <input
                  type="text"
                  placeholder="e.g. Year 5 (Sycamore Class)"
                  value={formData.year_group || ''}
                  onChange={(e) => handleChange('year_group', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 2: SEND Profile & Needs */}
          {step === 2 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Step 2: SEND Support Profile & EHCP
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Primary Need Category *
                  </label>
                  <select
                    value={formData.primary_need || ''}
                    onChange={(e) => handleChange('primary_need', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Autism Spectrum Condition (ASC)">Autism Spectrum Condition (ASC)</option>
                    <option value="ADHD / Attention & Executive Function">ADHD / Attention & Executive Function</option>
                    <option value="Dyslexia & Processing">Dyslexia & Processing</option>
                    <option value="Speech, Language & Communication (SLCN)">Speech, Language & Communication (SLCN)</option>
                    <option value="Social, Emotional & Mental Health (SEMH)">Social, Emotional & Mental Health (SEMH)</option>
                    <option value="Moderate Learning Difficulty (MLD)">Moderate Learning Difficulty (MLD)</option>
                    <option value="Sensory / Physical Impairment">Sensory / Physical Impairment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Secondary Need (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Working memory & auditory processing"
                    value={formData.secondary_need || ''}
                    onChange={(e) => handleChange('secondary_need', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* EHCP Status */}
              <div className="p-4 rounded-2xl bg-indigo-50/60 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white block">
                    Education, Health and Care Plan (EHCP)
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    Does this pupil have a statutory local authority EHCP?
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.has_ehcp}
                      onChange={(e) => handleChange('has_ehcp', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                  </label>
                  {formData.has_ehcp && (
                    <select
                      value={formData.ehcp_status}
                      onChange={(e) => handleChange('ehcp_status', e.target.value)}
                      className="text-xs px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 font-semibold focus:outline-none"
                    >
                      <option value="Active">Active Plan</option>
                      <option value="Draft">Draft Stage</option>
                      <option value="Under Review">Annual Review</option>
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  SEND Support Summary & Strengths
                </label>
                <textarea
                  rows={2}
                  placeholder="Key pupil strengths and how they learn best..."
                  value={formData.summary || ''}
                  onChange={(e) => handleChange('summary', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Baseline Pedagogical Strategy
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Visual instruction cards, 5-minute pre-transition warning, structured break..."
                  value={formData.baseline_strategy || ''}
                  onChange={(e) => handleChange('baseline_strategy', e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Guardian Details & Invite */}
          {step === 3 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Step 3: Parent / Guardian & Onboarding Link
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter the primary contact. A secure invitation token will be generated immediately so they can create their parent portal account and configure pupil voice access.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guardian First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Fiona"
                    value={formData.guardian_first_name}
                    onChange={(e) => handleChange('guardian_first_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Watson"
                    value={formData.guardian_last_name}
                    onChange={(e) => handleChange('guardian_last_name', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Guardian Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="e.g. fiona.watson@example.com"
                    value={formData.guardian_email}
                    onChange={(e) => handleChange('guardian_email', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Relationship to Pupil
                  </label>
                  <select
                    value={formData.relationship_to_child || 'Mother'}
                    onChange={(e) => handleChange('relationship_to_child', e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Mother">Mother</option>
                    <option value="Father">Father</option>
                    <option value="Foster Carer">Foster Carer</option>
                    <option value="Legal Guardian">Legal Guardian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Mobile Telephone (Optional)
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 07700 900555"
                  value={formData.guardian_mobile || ''}
                  onChange={(e) => handleChange('guardian_mobile', e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <input
                  type="checkbox"
                  id="send_invite"
                  checked={formData.send_invitation_immediately}
                  onChange={(e) => handleChange('send_invitation_immediately', e.target.checked)}
                  className="mt-1 rounded text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="send_invite" className="text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                  <strong className="text-emerald-700 dark:text-emerald-300 block font-semibold">
                    Dispatch Parent Invitation Immediately
                  </strong>
                  Generates an encrypted 72-hour security token and emails onboarding credentials directly to the parent.
                </label>
              </div>
            </div>
          )}

          {/* STEP 4: Success State & Email Preview */}
          {step === 4 && registrationResult && (
            <div className="space-y-5 animate-fade-in">
              <div className="text-center py-4">
                <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl mb-3 shadow-lg shadow-emerald-500/10">
                  🎉
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {registrationResult.full_name} Registered Successfully!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1">
                  Profile created on SEND Register. Automated onboarding email dispatched to{' '}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {registrationResult.email_preview?.to_email || formData.guardian_email}
                  </span>
                  .
                </p>
              </div>

              {registrationResult.invitation_token && (
                <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <span>🔗</span> Secure Invitation Link (72hr Expiry)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                      Active
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={registrationResult.invitation_url || ''}
                      className="flex-1 px-3 py-2 text-xs font-mono rounded-xl bg-white dark:bg-slate-900 border border-indigo-200 dark:border-indigo-800 text-slate-700 dark:text-slate-300 select-all"
                    />
                    <button
                      onClick={() => {
                        if (registrationResult.invitation_url) {
                          navigator.clipboard.writeText(registrationResult.invitation_url);
                        }
                      }}
                      className="px-3 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
                      title="Copy URL"
                    >
                      Copy
                    </button>
                  </div>

                  {/* Immediate Simulation Button */}
                  {onOpenParentOnboarding && (
                    <button
                      onClick={() => {
                        handleClose();
                        onOpenParentOnboarding(registrationResult.invitation_token!);
                      }}
                      className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
                    >
                      <span>🚀</span>
                      <span>Simulate Parent Opening Invite (Test Onboarding Now)</span>
                    </button>
                  )}
                </div>
              )}

              {/* Delivery Warning / Error notice */}
              {registrationResult.email_preview?.delivery_error && (
                <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-amber-800 dark:text-amber-300">
                    <span>⚠️</span>
                    <span>Email Delivery Notice:</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-700 dark:text-amber-300/90 font-mono">
                    {registrationResult.email_preview.delivery_error}
                  </p>
                </div>
              )}

              {/* Transactional Email Preview Toggle */}
              {registrationResult.email_preview && (
                <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setShowEmailPreview(!showEmailPreview)}
                    className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <span>📧</span> Dispatched Transactional Email
                      {registrationResult.email_preview.delivery_channel === 'resend' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-300 dark:border-emerald-700">
                          Live Resend Delivered 🚀
                        </span>
                      ) : registrationResult.email_preview.delivery_channel === 'smtp' ? (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-bold border border-blue-300 dark:border-blue-700">
                          Live SMTP Delivered 📬
                        </span>
                      ) : (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
                          In-App Preview Mode 🧪
                        </span>
                      )}
                    </span>
                    <span>{showEmailPreview ? '▲ Hide' : '▼ Expand'}</span>
                  </button>

                  {showEmailPreview && (
                    <div className="p-4 bg-white dark:bg-slate-900 text-xs space-y-2 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-slate-500">
                        <strong className="text-slate-700 dark:text-slate-300">Subject:</strong>{' '}
                        {registrationResult.email_preview.subject}
                      </div>
                      <div
                        className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 text-slate-800 dark:text-slate-200 overflow-x-auto text-[11px]"
                        dangerouslySetInnerHTML={{
                          __html: registrationResult.email_preview.html_content,
                        }}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between">
          {step < 4 ? (
            <>
              {step > 1 ? (
                <button
                  type="button"
                  onClick={() => setStep((prev) => (prev - 1) as any)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  ← Back
                </button>
              ) : (
                <div />
              )}

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  Next Step →
                </button>
              ) : (
                <button
                  type="button"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Registering Pupil...
                    </>
                  ) : (
                    <>
                      <span>✓</span> Complete Registration & Send Invite
                    </>
                  )}
                </button>
              )}
            </>
          ) : (
            <button
              onClick={handleClose}
              className="w-full py-2.5 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white text-xs font-bold transition-colors"
            >
              Done & Return to SENCO Dashboard
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
