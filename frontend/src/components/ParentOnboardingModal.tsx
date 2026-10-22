import React, { useState, useEffect } from 'react';
import { api, setApiRole } from '../api';
import { InvitationValidationResponse } from '../types';

interface ParentOnboardingModalProps {
  isOpen: boolean;
  token: string | null;
  onClose: () => void;
  onCompleted: (childId?: string, activatedRole?: string) => void;
}

const AVATAR_OPTIONS = ['🚀', '🌟', '🦁', '🎨', '⚽', '🎮', '🦄', '🧩', '🎸', '🐬'];

export const ParentOnboardingModal: React.FC<ParentOnboardingModalProps> = ({
  isOpen,
  token,
  onClose,
  onCompleted,
}) => {
  const [loading, setLoading] = useState(false);
  const [valInfo, setValInfo] = useState<InvitationValidationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [stage, setStage] = useState<'validate' | 'password' | 'child_account' | 'done'>('validate');

  // Password state
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Child account state
  const [childUsername, setChildUsername] = useState('');
  const [childPin, setChildPin] = useState('');
  const [childAvatar, setChildAvatar] = useState('🚀');

  useEffect(() => {
    if (!isOpen || !token) return;

    let isMounted = true;
    setLoading(true);
    setError(null);
    setStage('validate');

    api
      .validateInvitation(token)
      .then((res) => {
        if (!isMounted) return;
        setValInfo(res);
        if (res.valid) {
          setFullName(res.recipient_email ? res.recipient_email.split('@')[0] : 'Parent');
          if (res.child_name) {
            const first = res.child_name.toLowerCase().split(' ')[0];
            setChildUsername(first);
          }
          setStage('password');
        } else {
          setError('This invitation link is invalid or has already been used.');
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err.message || 'Failed to validate invitation token.');
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleAcceptPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    try {
      setLoading(true);
      await api.acceptInvitation({
        token: token!,
        password,
        full_name: fullName.trim() || undefined,
      });
      // Move to child account setup
      setStage('child_account');
    } catch (err: any) {
      setError(err.message || 'Activation failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetupChild = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!valInfo?.child_id) {
      setStage('done');
      return;
    }

    if (!childUsername.trim()) {
      setError('Please choose a username for pupil check-ins.');
      return;
    }

    if (childPin.length < 4) {
      setError('Please choose a 4-digit PIN for pupil voice login.');
      return;
    }

    try {
      setLoading(true);
      await api.setupChildAccount(valInfo.child_id, {
        child_id: valInfo.child_id,
        username: childUsername.trim().toLowerCase(),
        pin: childPin,
        avatar_emoji: childAvatar,
      });
      setStage('done');
    } catch (err: any) {
      setError(err.message || 'Failed to setup child account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-indigo-500/10 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-xl shadow-lg shadow-emerald-500/20 flex-shrink-0">
              💌
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                Parent & Pupil Onboarding
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                {valInfo?.school_name || "St. Jude's Inclusive Academy"}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex-shrink-0"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 flex-1">
          {loading && stage === 'validate' && (
            <div className="text-center py-8 space-y-3">
              <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs text-slate-500">Validating invitation credentials...</p>
            </div>
          )}

          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          {/* STAGE 1: Password Creation */}
          {stage === 'password' && valInfo && (
            <form onSubmit={handleAcceptPassword} className="space-y-4 animate-fade-in">
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Pupil:</span>{' '}
                  {valInfo.child_name}
                </div>
                <div>
                  <span className="font-semibold text-slate-900 dark:text-white">Invited Email:</span>{' '}
                  {valInfo.recipient_email}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Your Full Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fiona Watson"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Create Parent Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Confirm Password *
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  placeholder="Repeat your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Activating Account...' : 'Continue to Pupil Voice Setup →'}
              </button>
            </form>
          )}

          {/* STAGE 2: Child Account (PIN & Avatar) */}
          {stage === 'child_account' && (
            <form onSubmit={handleSetupChild} className="space-y-4 animate-fade-in">
              <div className="text-center py-2">
                <span className="text-3xl mb-1 block">{childAvatar}</span>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Configure {valInfo?.child_name || 'Pupil'}&apos;s Voice Login
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Allow your child to sign in with an easy 4-digit PIN to record their daily emoji check-in.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Choose Pupil Avatar Icon
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {AVATAR_OPTIONS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setChildAvatar(emoji)}
                      className={`text-2xl p-2.5 rounded-2xl border transition-all ${
                        childAvatar === emoji
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/60 scale-105 shadow-sm'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Child Username
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. archie"
                    value={childUsername}
                    onChange={(e) => setChildUsername(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    4-Digit Secret PIN *
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    required
                    placeholder="e.g. 1234"
                    value={childPin}
                    onChange={(e) => setChildPin(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-sm font-mono tracking-widest text-center focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setStage('done')}
                  className="px-4 py-2.5 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 text-center order-2 sm:order-1"
                >
                  Skip for now
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20 flex items-center justify-center gap-2 disabled:opacity-50 order-1 sm:order-2"
                >
                  {loading ? 'Configuring Voice...' : 'Save & Finish Onboarding ✓'}
                </button>
              </div>
            </form>
          )}

          {/* STAGE 3: Done */}
          {stage === 'done' && (
            <div className="text-center py-6 space-y-4 animate-fade-in">
              <div className="w-14 h-14 mx-auto rounded-3xl bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-3xl shadow-lg shadow-emerald-500/10">
                ✨
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Welcome to See My Mind!
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1">
                  Your parent account and {valInfo?.child_name || "your pupil"}&apos;s voice access are now active.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={() => {
                    setApiRole('parent');
                    onClose();
                    onCompleted(valInfo?.child_id, 'parent');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-500/20"
                >
                  Enter Parent Portal 👨‍👩‍👧
                </button>
                <button
                  onClick={() => {
                    setApiRole('child');
                    onClose();
                    onCompleted(valInfo?.child_id, 'child');
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-md shadow-indigo-500/20"
                >
                  Test Pupil Voice View 🧒
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
