import React, { useState, useEffect } from 'react';
import { api } from '../api';
import { EmailPreview } from '../types';

interface InvitationNotificationBannerProps {
  onOpenInvitation: (token: string) => void;
  latestInvitation?: EmailPreview | null;
}

export const InvitationNotificationBanner: React.FC<InvitationNotificationBannerProps> = ({
  onOpenInvitation,
  latestInvitation,
}) => {
  const [activeInvite, setActiveInvite] = useState<EmailPreview | null>(latestInvitation || null);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    if (latestInvitation) {
      setActiveInvite(latestInvitation);
      setIsDismissed(false);
      return;
    }

    // Check recent invitations on load
    api.getRecentInvitations().then((invites) => {
      if (invites && invites.length > 0) {
        setActiveInvite(invites[0]);
      }
    }).catch(() => {});
  }, [latestInvitation]);

  if (!activeInvite || isDismissed) return null;

  // Extract token from activation_url
  const tokenMatch = activeInvite.activation_url.match(/token=([^&]+)/);
  const token = tokenMatch ? tokenMatch[1] : '';

  if (!token) return null;

  return (
    <div className="bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white px-4 py-2.5 text-xs flex items-center justify-between shadow-md border-b border-indigo-700/50">
      <div className="flex items-center gap-3 overflow-hidden">
        <span className="flex h-2 w-2 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <div className="flex items-center gap-2 truncate">
          <span className="font-bold text-indigo-200">📩 Parent Invitation Dispatched:</span>
          <span className="truncate text-slate-200">
            {activeInvite.to_email} &bull; &ldquo;{activeInvite.subject}&rdquo;
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 flex-shrink-0">
        <button
          onClick={() => onOpenInvitation(token)}
          className="px-3 py-1 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition-all shadow-sm hover:shadow text-[11px] flex items-center gap-1.5"
        >
          <span>🚀</span>
          <span>Simulate Parent Acceptance</span>
        </button>
        <button
          onClick={() => setIsDismissed(true)}
          className="text-slate-400 hover:text-white transition-colors text-xs px-1"
          title="Dismiss notification"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
