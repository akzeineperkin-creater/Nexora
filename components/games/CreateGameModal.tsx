'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  ShieldCheck,
  Calendar,
  Clock,
  Lock,
  Globe,
  Users,
  DollarSign,
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Copy,
  ExternalLink,
  Sparkles,
  Award,
} from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { useCreateGame } from '@/hooks/useGames';
import { formatCurrency } from '@/lib/utils';
import { CreateGamePayload, XP_REWARDS } from '@/lib/games/types';

interface CreateGameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateGameModal({ isOpen, onClose }: CreateGameModalProps) {
  const router = useRouter();
  const createGameMutation = useCreateGame();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1); // 4 = Success step
  const [createdGame, setCreatedGame] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('09:00');
  const [endDate, setEndDate] = useState(
    new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [endTime, setEndTime] = useState('18:00');
  const [visibility, setVisibility] = useState<'public' | 'private'>('public');
  const [password, setPassword] = useState('');

  // Rules State
  const [startingCapital, setStartingCapital] = useState<number>(25000);
  const [maxPlayers, setMaxPlayers] = useState<number>(100);
  const [allowedStocks, setAllowedStocks] = useState(true);
  const [allowedEtfs, setAllowedEtfs] = useState(true);
  const [allowedIndices, setAllowedIndices] = useState(true);
  const [duration, setDuration] = useState('14 days');
  const [allowLateJoiners, setAllowLateJoiners] = useState(true);

  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleNext = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!name.trim()) {
        setErrorMsg('Please provide a game name.');
        return;
      }
      if (visibility === 'private' && !password.trim()) {
        setErrorMsg('Please provide a password for private games.');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!allowedStocks && !allowedEtfs && !allowedIndices) {
        setErrorMsg('Please select at least one tradeable asset class.');
        return;
      }
      setStep(3);
    }
  };

  const handleCreate = async () => {
    setErrorMsg(null);
    const assetClasses: ('stocks' | 'etfs' | 'indices')[] = [];
    if (allowedStocks) assetClasses.push('stocks');
    if (allowedEtfs) assetClasses.push('etfs');
    if (allowedIndices) assetClasses.push('indices');

    const payload: CreateGamePayload = {
      name,
      description,
      startDate,
      startTime,
      endDate,
      endTime,
      timezone: 'US Eastern Time (EDT/EST)',
      visibility,
      password: visibility === 'private' ? password.trim() : undefined,
      startingCapital,
      maxPlayers,
      allowedAssetClasses: assetClasses,
      duration,
      allowLateJoiners,
      allowJoinAfterStart: allowLateJoiners,
    };

    try {
      const res = await createGameMutation.mutateAsync(payload);
      if (res?.game) {
        setCreatedGame(res.game);
        setStep(4);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create game.');
    }
  };

  const handleCopyLink = () => {
    if (!createdGame) return;
    const url = `${window.location.origin}/games/${createdGame.slug}?code=${createdGame.inviteCode}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleFinish = () => {
    onClose();
    if (createdGame) {
      router.push(`/games/${createdGame.slug}`);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        step === 4
          ? 'Trading Game Created!'
          : `Create Trading Game (Step ${step} of 3)`
      }
      subtitle={
        step === 4
          ? 'Your simulated tournament has been scheduled on Nexra.'
          : 'Setup scheduled competitions with isolated capital and XP rewards.'
      }
      size="lg"
    >
      <div className="flex flex-col gap-5">
        {/* Step Indicator Progress Bar */}
        {step <= 3 && (
          <div className="flex items-center gap-2">
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= 1 ? 'bg-lime' : 'bg-slate-200 dark:bg-[#3A3A3D]'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= 2 ? 'bg-lime' : 'bg-slate-200 dark:bg-[#3A3A3D]'
              }`}
            />
            <div
              className={`h-1.5 flex-1 rounded-full transition-all ${
                step >= 3 ? 'bg-lime' : 'bg-slate-200 dark:bg-[#3A3A3D]'
              }`}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 1: GAME SETUP & SCHEDULING */}
        {/* ========================================================================= */}
        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Game Name *
              </label>
              <Input
                type="text"
                placeholder="e.g. Wall Street Summer Sprint 2026"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="font-bold text-sm"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Description / Educational Theme
              </label>
              <textarea
                rows={2}
                placeholder="Briefly describe tournament objectives, focus sectors, or strategy guidelines..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full py-2 px-3 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs text-slate-dark dark:text-[#F5F5F5] focus:outline-none focus:border-[#B8F500]/60 resize-none placeholder:text-slate-400 dark:placeholder:text-[#71717A]"
              />
            </div>

            {/* Date & Time Inputs in US Eastern Time */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D]">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-500 dark:text-[#71717A]" /> Start Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-500 dark:text-[#71717A]" /> End Date & Time
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="text-xs"
                  />
                  <Input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="col-span-1 sm:col-span-2 text-[11px] text-slate-500 dark:text-[#71717A] flex items-center justify-between border-t border-slate-200 dark:border-[#3A3A3D] pt-2">
                <span>Timezone: <strong>US Eastern Time (EDT/EST, GMT-4)</strong></span>
                <span className="font-semibold text-amber-600 dark:text-amber-400">🔒 Trading unlocks at exact start time</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Tournament Visibility
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setVisibility('public')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    visibility === 'public'
                      ? 'border-lime bg-slate-900 dark:bg-[#323236] text-white shadow-sm'
                      : 'border-slate-border dark:border-[#3A3A3D] bg-white dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#2A2A2E]'
                  }`}
                >
                  <Globe className="w-4 h-4 text-lime shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Public Tournament</div>
                    <div className="text-[10px] opacity-75">Visible in Nexra Games Hub</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setVisibility('private')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    visibility === 'private'
                      ? 'border-lime bg-slate-900 dark:bg-[#323236] text-white shadow-sm'
                      : 'border-slate-border dark:border-[#3A3A3D] bg-white dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#2A2A2E]'
                  }`}
                >
                  <Lock className="w-4 h-4 text-amber-400 shrink-0" />
                  <div>
                    <div className="text-xs font-bold">Private League</div>
                    <div className="text-[10px] opacity-75">Password / Invite Code only</div>
                  </div>
                </button>
              </div>
            </div>

            {visibility === 'private' && (
              <div>
                <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                  Access Password *
                </label>
                <Input
                  type="password"
                  placeholder="Enter private league password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: RULES & REWARDS */}
        {/* ========================================================================= */}
        {step === 2 && (
          <div className="flex flex-col gap-4">
            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Starting Virtual Capital (Isolated Per Player)
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10000, 25000, 50000, 100000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setStartingCapital(amt)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-mono font-bold transition-all cursor-pointer ${
                      startingCapital === amt
                        ? 'bg-lime text-[#0F0B0A] border-lime shadow-sm'
                        : 'bg-white dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] border-slate-border dark:border-[#3A3A3D] hover:bg-slate-50 dark:hover:bg-[#323236]'
                    }`}
                  >
                    {formatCurrency(amt, 0)}
                  </button>
                ))}
              </div>
              <span className="text-[10px] text-slate-500 dark:text-[#71717A] mt-1 block">
                * Completely separated from normal Nexra sandbox cash.
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Maximum Players
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 50, 100, 0].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setMaxPlayers(cnt)}
                    className={`py-2 px-1 text-center rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      maxPlayers === cnt
                        ? 'bg-lime text-[#0F0B0A] border-lime shadow-sm'
                        : 'bg-white dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA] border-slate-border dark:border-[#3A3A3D] hover:bg-slate-50 dark:hover:bg-[#323236]'
                    }`}
                  >
                    {cnt === 0 ? 'Unlimited' : `${cnt} Players`}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Tradeable Asset Classes (Global Universe)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    allowedStocks
                      ? 'bg-lime-50 dark:bg-lime/10 border-lime dark:border-lime/60 text-lime-950 dark:text-lime'
                      : 'bg-white dark:bg-[#1E1E21] border-slate-border dark:border-[#3A3A3D] text-slate-500 dark:text-[#71717A]'
                  }`}
                >
                  <span>Stocks (80+)</span>
                  <input
                    type="checkbox"
                    checked={allowedStocks}
                    onChange={(e) => setAllowedStocks(e.target.checked)}
                    className="accent-[#B8F500]"
                  />
                </label>

                <label
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    allowedEtfs
                      ? 'bg-lime-50 dark:bg-lime/10 border-lime dark:border-lime/60 text-lime-950 dark:text-lime'
                      : 'bg-white dark:bg-[#1E1E21] border-slate-border dark:border-[#3A3A3D] text-slate-500 dark:text-[#71717A]'
                  }`}
                >
                  <span>ETFs (SPY, QQQ)</span>
                  <input
                    type="checkbox"
                    checked={allowedEtfs}
                    onChange={(e) => setAllowedEtfs(e.target.checked)}
                    className="accent-[#B8F500]"
                  />
                </label>

                <label
                  className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-between cursor-pointer transition-all ${
                    allowedIndices
                      ? 'bg-lime-50 dark:bg-lime/10 border-lime dark:border-lime/60 text-lime-950 dark:text-lime'
                      : 'bg-white dark:bg-[#1E1E21] border-slate-border dark:border-[#3A3A3D] text-slate-500 dark:text-[#71717A]'
                  }`}
                >
                  <span>Indices (SPX)</span>
                  <input
                    type="checkbox"
                    checked={allowedIndices}
                    onChange={(e) => setAllowedIndices(e.target.checked)}
                    className="accent-[#B8F500]"
                  />
                </label>
              </div>
            </div>

            {/* Late Joiners Setting */}
            <div className="p-3 bg-slate-50 dark:bg-[#1E1E21] rounded-xl border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5]">Allow Late Joiners</div>
                <div className="text-[10px] text-slate-500 dark:text-[#71717A]">
                  {allowLateJoiners
                    ? 'Users can join after competition starts (trading locked until start time)'
                    : 'Registration closes strictly when competition begins'}
                </div>
              </div>
              <input
                type="checkbox"
                checked={allowLateJoiners}
                onChange={(e) => setAllowLateJoiners(e.target.checked)}
                className="w-4 h-4 accent-[#B8F500] cursor-pointer"
              />
            </div>

            {/* XP Rewards Structure Showcase */}
            <div className="p-3 bg-slate-50 dark:bg-[#1E1E21] rounded-xl border border-slate-200 dark:border-[#3A3A3D]">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-2">
                <Award className="w-3.5 h-3.5 text-lime" /> XP Placement Rewards (Distributed upon completion)
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 text-center text-[11px]">
                <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 font-bold text-amber-700 dark:text-amber-300">
                  🥇 1st: +500 XP
                </div>
                <div className="p-1.5 rounded-lg bg-slate-400/10 border border-slate-400/20 font-bold text-slate-700 dark:text-slate-300">
                  🥈 2nd: +350 XP
                </div>
                <div className="p-1.5 rounded-lg bg-amber-700/10 border border-amber-700/20 font-bold text-amber-800 dark:text-amber-400">
                  🥉 3rd: +250 XP
                </div>
                <div className="p-1.5 rounded-lg bg-lime-500/10 border border-lime-500/20 font-bold text-lime-800 dark:text-lime">
                  Top 10: +100 XP
                </div>
                <div className="p-1.5 rounded-lg bg-slate-500/10 border border-slate-500/20 font-bold text-slate-600 dark:text-slate-400 col-span-2 sm:col-span-1">
                  Finish: +25 XP
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: REVIEW & LAUNCH */}
        {/* ========================================================================= */}
        {step === 3 && (
          <div className="flex flex-col gap-4">
            <div className="p-4 rounded-xl bg-slate-subtle dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] flex flex-col gap-2.5 text-xs">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-[#3A3A3D] pb-2">
                <span className="text-slate-muted dark:text-[#71717A]">Tournament Title:</span>
                <span className="font-extrabold text-slate-dark dark:text-[#F5F5F5]">{name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-muted dark:text-[#71717A]">Isolated Starting Capital:</span>
                <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
                  {formatCurrency(startingCapital, 0)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-muted dark:text-[#71717A]">Visibility:</span>
                <Badge variant={visibility === 'public' ? 'lime' : 'neutral'} size="sm">
                  {visibility === 'public' ? 'Public' : 'Private (Password)'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-muted dark:text-[#71717A]">Scheduled Start:</span>
                <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
                  {startDate} · {startTime} EDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-muted dark:text-[#71717A]">Scheduled End:</span>
                <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
                  {endDate} · {endTime} EDT
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-muted dark:text-[#71717A]">Late Joiners:</span>
                <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">
                  {allowLateJoiners ? 'Allowed' : 'Disabled (Pre-start only)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-muted dark:text-[#71717A]">Capacity:</span>
                <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">
                  {maxPlayers === 0 ? 'Unlimited' : `${maxPlayers} Players`}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-lime-50 dark:bg-lime/10 border border-lime-200 dark:border-lime/30 flex items-center gap-2 text-xs text-lime-950 dark:text-[#F5F5F5] font-medium">
              <ShieldCheck className="w-4 h-4 text-lime-900 dark:text-lime shrink-0" />
              <span>Simulated tournament with isolated virtual cash. Zero impact on main Nexra funds.</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STEP 4: SUCCESS CONFIRMATION */}
        {/* ========================================================================= */}
        {step === 4 && createdGame && (
          <div className="flex flex-col items-center text-center gap-4 py-4">
            <div className="w-14 h-14 rounded-2xl bg-lime-100 dark:bg-lime/20 text-lime-900 dark:text-lime flex items-center justify-center">
              <Trophy className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-dark dark:text-[#F5F5F5] mb-1">
                {createdGame.title}
              </h3>
              <p className="text-xs text-slate-muted dark:text-[#A1A1AA]">
                Scheduled for {createdGame.startTime || '9:00 AM EDT'} ({createdGame.timezone}).
              </p>
            </div>

            <div className="w-full p-3.5 bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] rounded-xl flex items-center justify-between gap-2">
              <div className="text-left font-mono">
                <div className="text-[10px] text-slate-400 dark:text-[#71717A] uppercase">Invite Code</div>
                <div className="text-base font-extrabold text-slate-dark dark:text-[#F5F5F5]">
                  {createdGame.inviteCode}
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleCopyLink}>
                <Copy className="w-3.5 h-3.5 mr-1" />
                <span>{copiedLink ? 'Copied!' : 'Copy Link'}</span>
              </Button>
            </div>
          </div>
        )}

        {/* Error Notice */}
        {errorMsg && (
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-bold flex items-center gap-2">
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="pt-2 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between gap-3">
          {step > 1 && step < 4 && (
            <Button variant="outline" size="sm" onClick={() => setStep((s) => (s - 1) as any)}>
              <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back
            </Button>
          )}

          {step < 3 && (
            <div className="ml-auto">
              <Button variant="lime" size="sm" onClick={handleNext} className="font-extrabold">
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {step === 3 && (
            <div className="ml-auto flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="lime"
                size="sm"
                onClick={handleCreate}
                disabled={createGameMutation.isPending}
                className="font-extrabold shadow-lime cursor-pointer"
              >
                <span>{createGameMutation.isPending ? 'Scheduling Game...' : 'Confirm & Schedule'}</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          )}

          {step === 4 && (
            <Button variant="lime" size="md" onClick={handleFinish} className="w-full font-extrabold shadow-lime">
              <span>Enter Tournament Lobby</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
