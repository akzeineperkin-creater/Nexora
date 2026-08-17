'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, KeyRound, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { TradingGame } from '@/lib/games/types';
import { useVerifyGamePassword } from '@/hooks/useGames';
import { formatCurrency } from '@/lib/utils';

interface PrivateGamePasswordModalProps {
  isOpen: boolean;
  game: TradingGame | null;
  onClose: () => void;
  onSuccess?: () => void;
}

export function PrivateGamePasswordModal({
  isOpen,
  game,
  onClose,
  onSuccess,
}: PrivateGamePasswordModalProps) {
  const router = useRouter();
  const verifyMutation = useVerifyGamePassword();
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!game) return null;

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);

    if (!password.trim()) {
      setErrorMsg('Please enter the tournament password.');
      return;
    }

    try {
      await verifyMutation.mutateAsync({
        gameIdOrSlug: game.slug || game.id,
        password: password.trim(),
      });

      onClose();
      if (onSuccess) {
        onSuccess();
      } else {
        router.push(`/games/${game.slug || game.id}`);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Incorrect tournament password. Access denied.');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setErrorMsg(null);
        setPassword('');
        onClose();
      }}
      title="Private Tournament Access"
      subtitle="This tournament is private. Enter the authorization password to join the arena."
      size="sm"
    >
      <form onSubmit={handleVerify} className="flex flex-col gap-4">
        {/* Game Info Summary Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D]">
          <div className="flex items-center justify-between gap-2 mb-1">
            <h4 className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] truncate">
              {game.title}
            </h4>
            <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 shrink-0">
              <Lock className="w-3 h-3" /> Private
            </span>
          </div>
          <div className="text-[11px] text-slate-500 dark:text-[#71717A] flex items-center gap-2">
            <span>{game.category}</span>
            <span>•</span>
            <span>Starting Balance: <strong className="text-slate-700 dark:text-slate-300 font-mono">{formatCurrency(game.startingCapital, 0)}</strong></span>
          </div>
        </div>

        {/* Password Input */}
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 flex items-center gap-1.5">
            <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>Tournament Password</span>
          </label>
          <Input
            type="password"
            placeholder="Enter private password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setErrorMsg(null);
            }}
            className="font-medium text-sm"
            autoFocus
          />
        </div>

        {/* Error Message Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between gap-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setErrorMsg(null);
              setPassword('');
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lime"
            size="sm"
            disabled={!password.trim() || verifyMutation.isPending}
            className="font-extrabold shadow-lime cursor-pointer"
          >
            <span>{verifyMutation.isPending ? 'Verifying...' : 'Enter Game Arena'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
