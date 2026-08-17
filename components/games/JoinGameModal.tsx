'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Lock, ArrowRight, AlertCircle, Trophy, KeyRound } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useGames, useVerifyGamePassword } from '@/hooks/useGames';

interface JoinGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function JoinGameModal({ isOpen, onClose }: JoinGameModalProps) {
  const router = useRouter();
  const { data } = useGames();
  const verifyMutation = useVerifyGamePassword();
  const allGames = data?.games || [];

  const [codeOrSearch, setCodeOrSearch] = useState('');
  const [password, setPassword] = useState('');
  const [selectedGameSlug, setSelectedGameSlug] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const matchedGame = allGames.find(
    (g) =>
      g.inviteCode?.toUpperCase() === codeOrSearch.trim().toUpperCase() ||
      g.slug.toLowerCase() === codeOrSearch.trim().toLowerCase() ||
      g.title.toLowerCase().includes(codeOrSearch.trim().toLowerCase())
  );

  const handleJoin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    const targetGame = selectedGameSlug ? allGames.find((g) => g.slug === selectedGameSlug) : matchedGame;

    if (!targetGame) {
      setErrorMsg('Tournament not found. Please verify the invite code or tournament name.');
      return;
    }

    if (targetGame.visibility === 'private') {
      if (!password.trim()) {
        setErrorMsg('Please enter the tournament password.');
        return;
      }

      try {
        await verifyMutation.mutateAsync({
          gameIdOrSlug: targetGame.slug || targetGame.id,
          password: password.trim(),
        });

        onClose();
        router.push(`/games/${targetGame.slug || targetGame.id}`);
      } catch (err: any) {
        setErrorMsg(err.message || 'Incorrect tournament password. Access denied.');
      }
      return;
    }

    // Public game
    onClose();
    router.push(`/games/${targetGame.slug || targetGame.id}`);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setErrorMsg(null);
        setPassword('');
        setCodeOrSearch('');
        onClose();
      }}
      title="Find & Join Tournament"
      subtitle="Enter a tournament invite code or search by title to enter the arena."
      size="md"
    >
      <form onSubmit={handleJoin} className="flex flex-col gap-4">
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
            Invite Code or Tournament Name
          </label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717A]" />
            <Input
              type="text"
              placeholder="e.g. ALPHA2026, TECH2026, or tournament title"
              value={codeOrSearch}
              onChange={(e) => {
                setCodeOrSearch(e.target.value);
                setSelectedGameSlug(null);
                setErrorMsg(null);
              }}
              className="pl-9 font-bold text-sm"
              autoFocus
            />
          </div>
        </div>

        {/* Found Game Preview Card */}
        {matchedGame && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] truncate">
                  {matchedGame.title}
                </span>
                {matchedGame.visibility === 'private' && (
                  <span className="flex items-center gap-1 text-[9px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                    <Lock className="w-2.5 h-2.5" /> Private
                  </span>
                )}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-[#71717A]">
                {matchedGame.category} • ${(matchedGame.startingCapital).toLocaleString()} Starting Cash • {matchedGame.participantsCount} Players
              </div>
            </div>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-lime text-[#0F0B0A] shrink-0">
              Matched
            </span>
          </div>
        )}

        {/* Password input if private */}
        {matchedGame?.visibility === 'private' && (
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

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <div className="pt-2 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setErrorMsg(null);
              setPassword('');
              setCodeOrSearch('');
              onClose();
            }}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="lime"
            size="sm"
            disabled={!codeOrSearch.trim() || (matchedGame?.visibility === 'private' && !password.trim()) || verifyMutation.isPending}
            className="font-extrabold shadow-lime cursor-pointer"
          >
            <span>{verifyMutation.isPending ? 'Verifying...' : 'Enter Tournament'}</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
          </Button>
        </div>
      </form>
    </Modal>
  );
}
