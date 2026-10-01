'use client';

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldCheck,
  LogOut,
  AlertCircle,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { useLeaveGame } from '@/hooks/useGames';

interface LeaveTournamentModalProps {
  isOpen: boolean;
  gameTitle: string;
  gameIdOrSlug: string;
  onClose: () => void;
  onSuccess?: () => void;
}

export function LeaveTournamentModal({
  isOpen,
  gameTitle,
  gameIdOrSlug,
  onClose,
  onSuccess,
}: LeaveTournamentModalProps) {
  const leaveMutation = useLeaveGame(gameIdOrSlug);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLeave = async () => {
    setErrorMsg(null);
    try {
      await leaveMutation.mutateAsync();
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to leave tournament.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setErrorMsg(null);
        onClose();
      }}
      title="Leave Tournament?"
      subtitle="Are you sure you want to withdraw your participation?"
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* Warning Card */}
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-700 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="text-xs text-amber-900 dark:text-amber-200 leading-relaxed">
            <strong className="block mb-0.5">Progress will be removed:</strong>
            Your competition portfolio, virtual positions, and leaderboard ranking in <strong>{gameTitle}</strong> will be permanently closed.
          </div>
        </div>

        {/* Normal Cash Safety Guarantee */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center gap-2.5 text-xs text-slate-600 dark:text-[#A1A1AA]">
          <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>
            <strong>Zero risk to account:</strong> This will <strong>NOT</strong> affect your normal Nexra virtual cash, sandbox portfolio, or profile achievements.
          </span>
        </div>

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setErrorMsg(null);
              onClose();
            }}
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={handleLeave}
            disabled={leaveMutation.isPending}
            className="font-extrabold cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 mr-1.5" />
            <span>{leaveMutation.isPending ? 'Leaving Tournament...' : 'Leave Tournament'}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
