'use client';

import React, { useState } from 'react';
import {
  Trophy,
  ShieldCheck,
  Calendar,
  Clock,
  Lock,
  Users,
  DollarSign,
  ArrowRight,
  AlertCircle,
  KeyRound,
  Award,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useJoinGame } from '@/hooks/useGames';
import { formatCurrency } from '@/lib/utils';
import { TradingGame } from '@/lib/games/types';
import { formatEasternDateTime, getComputedGameStatus } from '@/lib/games/games-service';

interface JoinTournamentModalProps {
  isOpen: boolean;
  game: TradingGame;
  onClose: () => void;
  onSuccess?: () => void;
}

export function JoinTournamentModal({
  isOpen,
  game,
  onClose,
  onSuccess,
}: JoinTournamentModalProps) {
  const joinMutation = useJoinGame(game.slug || game.id);
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const currentStatus = getComputedGameStatus(game);
  const isUpcoming = currentStatus === 'upcoming';
  const isCompleted = currentStatus === 'completed';
  const isPrivate = game.visibility === 'private';

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (isPrivate && !password.trim()) {
      setErrorMsg('Please enter the private tournament password.');
      return;
    }

    try {
      await joinMutation.mutateAsync({
        password: isPrivate ? password.trim() : undefined,
      });

      setPassword('');
      setErrorMsg(null);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to join tournament.');
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
      title={`Join "${game.title}"?`}
      subtitle="Confirm participation to receive your isolated starting virtual capital."
      size="md"
    >
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        {/* Tournament Key Parameters Summary Card */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex flex-col gap-2.5 text-xs">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#3A3A3D] pb-2">
            <span className="text-slate-500 dark:text-[#71717A]">Tournament:</span>
            <span className="font-extrabold text-slate-dark dark:text-[#F5F5F5] truncate max-w-[200px]">
              {game.title}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#71717A] flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-lime" /> Starting Capital:
            </span>
            <span className="font-mono font-extrabold text-slate-dark dark:text-[#F5F5F5] text-sm">
              {formatCurrency(game.startingCapital, 0)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#71717A] flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-[#71717A]" /> Start Time:
            </span>
            <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
              {formatEasternDateTime(game.startDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#71717A] flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-[#71717A]" /> End Time:
            </span>
            <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
              {formatEasternDateTime(game.endDate)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-[#71717A] flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400 dark:text-[#71717A]" /> Enrolled Players:
            </span>
            <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">
              {game.participantsCount.toLocaleString()} {game.maxParticipants ? `/ ${game.maxParticipants}` : 'Players'}
            </span>
          </div>
        </div>

        {/* Private Tournament Password Field */}
        {isPrivate && (
          <div>
            <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>League Password Required</span>
            </label>
            <Input
              type="password"
              placeholder="Enter private tournament password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setErrorMsg(null);
              }}
              className="font-medium text-sm"
              autoFocus
            />
          </div>
        )}

        {/* Isolation Guarantee Badge */}
        <div className="p-3 rounded-xl bg-lime-50 dark:bg-lime/10 border border-lime-200 dark:border-lime/30 flex items-center gap-2.5 text-xs text-lime-950 dark:text-[#F5F5F5]">
          <ShieldCheck className="w-4 h-4 text-lime-900 dark:text-lime shrink-0" />
          <span className="leading-snug">
            <strong>100% Isolated:</strong> Joining will NOT affect your normal Nexra virtual cash balance or buying power.
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
            disabled={joinMutation.isPending || isCompleted}
            className="font-extrabold shadow-lime cursor-pointer"
          >
            <span>{joinMutation.isPending ? 'Joining Arena...' : 'Confirm & Join'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
