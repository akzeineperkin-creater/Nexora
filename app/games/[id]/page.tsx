'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  ShieldCheck,
  Clock,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  PieChart,
  History,
  CheckCircle2,
  AlertCircle,
  Lock,
  Globe,
  User,
  Crown,
  Info,
  DollarSign,
  ChevronRight,
  Award,
  Sparkles,
  UserPlus,
  LogOut,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PillTabs } from '@/components/ui/Tabs';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { JoinTournamentModal } from '@/components/games/JoinTournamentModal';
import { LeaveTournamentModal } from '@/components/games/LeaveTournamentModal';
import { useGameSession, useGameTrade, useVerifyGamePassword } from '@/hooks/useGames';
import { useAssets } from '@/hooks/useAssets';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { REAL_STOCKS_UNIVERSE } from '@/lib/market-data/market-service';
import {
  formatEasternDateTime,
  getCountdownString,
  getComputedGameStatus,
} from '@/lib/games/games-service';
import { calculateRewardXp } from '@/lib/games/types';

export default function GameDetailPage() {
  const params = useParams();
  const router = useRouter();
  const gameSlugOrId = (params?.id as string) || '';

  const { data: sessionData, isLoading, isError } = useGameSession(gameSlugOrId);
  const verifyMutation = useVerifyGamePassword();
  const tradeMutation = useGameTrade(gameSlugOrId);
  const { data: globalAssets } = useAssets();

  const [unlockPassword, setUnlockPassword] = useState('');
  const [unlockError, setUnlockError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<string>('');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isLeaveModalOpen, setIsLeaveModalOpen] = useState(false);

  const game = sessionData?.game;
  const portfolio = sessionData?.portfolio;
  const hasJoined = Boolean(sessionData?.hasJoined ?? portfolio);
  const hasLeft = Boolean(sessionData?.hasLeft);
  const leaderboard = sessionData?.leaderboard || [];

  const currentStatus = game ? getComputedGameStatus(game) : 'active';
  const isUpcoming = currentStatus === 'upcoming';
  const isCompleted = currentStatus === 'completed';
  const isActive = currentStatus === 'active';

  // Real-time ticking countdown
  useEffect(() => {
    if (!game) return;
    const update = () => {
      if (isCompleted) {
        setCountdown('Concluded');
      } else if (isUpcoming) {
        setCountdown(getCountdownString(game.startDate, true));
      } else {
        setCountdown(getCountdownString(game.endDate, false));
      }
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [game, isUpcoming, isCompleted]);

  // Trading Form State
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [shares, setShares] = useState<number>(1);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Selected Stock Details
  const allStocks = globalAssets && globalAssets.length > 0 ? globalAssets : REAL_STOCKS_UNIVERSE;
  const currentStock = useMemo(() => {
    const matched = allStocks.find(
      (s) => s.ticker.toUpperCase() === selectedTicker.toUpperCase()
    );
    return matched || allStocks[0] || REAL_STOCKS_UNIVERSE[0];
  }, [allStocks, selectedTicker]);

  const currentPrice = Number(currentStock?.current_price ?? 100);
  const orderValue = Number(((shares || 0) * currentPrice).toFixed(2));
  const availableCash = portfolio?.cashBalance ?? (game?.startingCapital || 25000);

  // User position for current stock
  const currentPosition = portfolio?.holdings?.find(
    (h) => h.ticker.toUpperCase() === currentStock?.ticker?.toUpperCase()
  );
  const sharesHeld = currentPosition?.shares ?? 0;

  // Validation: Only allowed when LIVE (Active) and user HAS JOINED
  const canExecute =
    hasJoined &&
    isActive &&
    (tradeType === 'BUY'
      ? orderValue <= availableCash && shares > 0
      : shares <= sharesHeld && shares > 0);

  // Filter stocks by search
  const filteredStocks = useMemo(() => {
    if (!searchQuery.trim()) return allStocks.slice(0, 8);
    const q = searchQuery.toLowerCase().trim();
    return allStocks.filter(
      (s) =>
        s.ticker.toLowerCase().includes(q) ||
        s.name.toLowerCase().includes(q) ||
        (s.sector && s.sector.toLowerCase().includes(q))
    ).slice(0, 10);
  }, [allStocks, searchQuery]);

  // Execute Trade Handler
  const handleExecuteTrade = async () => {
    if (!canExecute || !currentStock) return;
    setFeedbackMessage(null);

    try {
      const res = await tradeMutation.mutateAsync({
        ticker: currentStock.ticker,
        type: tradeType,
        shares,
        price: currentPrice,
      });

      if (res?.success) {
        setFeedbackMessage({
          type: 'success',
          text: `${tradeType} order executed: ${shares} ${currentStock.ticker} @ ${formatCurrency(currentPrice)}`,
        });
        setTimeout(() => setFeedbackMessage(null), 3000);
      } else {
        setFeedbackMessage({ type: 'error', text: res?.message || 'Trade execution failed.' });
      }
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message || 'Error processing trade.' });
    }
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 max-w-[1600px] mx-auto py-8">
        <div className="h-10 w-48 bg-slate-200 dark:bg-[#28282B] rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 h-[600px] bg-slate-100 dark:bg-[#28282B] rounded-2xl animate-pulse" />
          <div className="lg:col-span-6 h-[600px] bg-slate-100 dark:bg-[#28282B] rounded-2xl animate-pulse" />
          <div className="lg:col-span-3 h-[600px] bg-slate-100 dark:bg-[#28282B] rounded-2xl animate-pulse" />
        </div>
      </div>
    );
  }

  // Locked Private Game View
  if (sessionData?.isLocked) {
    const handleUnlock = async (e: React.FormEvent) => {
      e.preventDefault();
      setUnlockError(null);
      if (!unlockPassword.trim()) {
        setUnlockError('Please enter the tournament password.');
        return;
      }
      try {
        await verifyMutation.mutateAsync({
          gameIdOrSlug: gameSlugOrId,
          password: unlockPassword.trim(),
        });
      } catch (err: any) {
        setUnlockError(err.message || 'Incorrect tournament password. Access denied.');
      }
    };

    return (
      <div className="flex items-center justify-center min-h-[70vh] p-4">
        <Card className="max-w-md w-full p-6 sm:p-8 text-center flex flex-col items-center gap-5 shadow-lg dark:shadow-dark-card border-slate-200 dark:border-[#3A3A3D]">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lock className="w-7 h-7" />
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1.5 mb-1.5">
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50">
                <Lock className="w-3 h-3" /> Private Tournament
              </span>
            </div>
            <h2 className="text-xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {game?.title || 'Private Arena'}
            </h2>
            <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1.5 max-w-sm mx-auto">
              This tournament is private. Enter the authorization password to access live trading and leaderboard rankings.
            </p>
          </div>

          <form onSubmit={handleUnlock} className="w-full flex flex-col gap-3 text-left">
            <div>
              <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">
                Tournament Password
              </label>
              <Input
                type="password"
                placeholder="Enter password"
                value={unlockPassword}
                onChange={(e) => {
                  setUnlockPassword(e.target.value);
                  setUnlockError(null);
                }}
                className="font-medium"
                autoFocus
              />
            </div>

            {unlockError && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                <span>{unlockError}</span>
              </div>
            )}

            <Button
              type="submit"
              variant="lime"
              size="md"
              disabled={!unlockPassword.trim() || verifyMutation.isPending}
              className="w-full justify-center font-extrabold mt-1 shadow-lime cursor-pointer"
            >
              <span>{verifyMutation.isPending ? 'Verifying Password...' : 'Enter Game Arena'}</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          <Link href="/games" className="text-xs text-slate-500 dark:text-[#71717A] hover:underline flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Tournaments Hub
          </Link>
        </Card>
      </div>
    );
  }

  if (isError || !game) {
    return (
      <div className="text-center py-20 max-w-lg mx-auto">
        <div className="w-12 h-12 rounded-full bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto mb-3">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-lg font-bold text-slate-dark dark:text-[#F5F5F5]">Tournament Not Found</h2>
        <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 mb-4">
          The requested trading game may have expired or is unavailable.
        </p>
        <Link href="/games">
          <Button variant="lime" size="sm">
            <ArrowLeft className="w-4 h-4 mr-1.5" /> Back to Games Hub
          </Button>
        </Link>
      </div>
    );
  }

  const userRankEntry = leaderboard.find((p) => p.isCurrentUser);
  const currentRank = userRankEntry?.rank || portfolio?.rank || 1;
  const currentRewardXp = calculateRewardXp(currentRank);

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto">
      {/* 1. ARENA TOP BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#28282B] p-4 rounded-2xl border border-slate-border dark:border-[#3A3A3D] shadow-subtle dark:shadow-dark-card">
        <div className="flex items-center gap-3">
          <Link href="/games">
            <button className="p-2 rounded-xl bg-slate-100 dark:bg-[#1E1E21] hover:bg-slate-200 dark:hover:bg-[#323236] text-slate-600 dark:text-[#A1A1AA] transition-colors cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg md:text-xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
                {game.title}
              </h1>

              {/* Status Badge */}
              {isActive ? (
                <Badge variant="lime" size="sm" className="font-extrabold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 dark:bg-emerald-400 animate-pulse" />
                  <span>LIVE</span>
                </Badge>
              ) : isUpcoming ? (
                <Badge variant="neutral" size="sm" className="font-extrabold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/40">
                  <Lock className="w-2.5 h-2.5 mr-0.5 inline" /> UPCOMING
                </Badge>
              ) : (
                <Badge variant="down" size="sm" className="font-extrabold">
                  COMPLETED
                </Badge>
              )}

              {/* Participation Status Badge */}
              {hasJoined ? (
                <span className="text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Joined
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-slate-100 dark:bg-[#1E1E21] text-slate-500 dark:text-[#71717A] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#3A3A3D]">
                  Not Joined
                </span>
              )}
            </div>

            <div className="flex items-center gap-3 text-[11px] text-slate-muted dark:text-[#A1A1AA] mt-0.5 flex-wrap">
              <span>{game.category}</span>
              <span>•</span>
              <span>Isolated Capital: <strong className="font-mono text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(game.startingCapital, 0)}</strong></span>
              <span>•</span>
              <span>{game.participantsCount.toLocaleString()} Players</span>
              <span>•</span>
              <span className="font-mono text-slate-500 dark:text-[#71717A]">{game.timezone || 'US Eastern Time'}</span>
            </div>
          </div>
        </div>

        {/* Top Right Action & Countdown */}
        <div className="flex items-center gap-2.5 font-mono text-right flex-wrap">
          {/* Join / Leave Buttons in Header */}
          {!hasJoined && !isCompleted && (
            <Button
              variant="lime"
              size="sm"
              onClick={() => setIsJoinModalOpen(true)}
              className="font-extrabold text-xs shadow-lime cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 mr-1" />
              <span>Join Tournament</span>
            </Button>
          )}

          {hasJoined && !isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLeaveModalOpen(true)}
              className="font-bold text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 border-red-200 dark:border-red-800/40 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 mr-1" />
              <span>Leave Tournament</span>
            </Button>
          )}

          {/* Countdown Pill */}
          <div className="p-2 px-3 rounded-xl bg-slate-900 dark:bg-[#1E1E21] border border-transparent dark:border-[#3A3A3D] text-white flex items-center gap-2 shadow-sm">
            <Clock className={`w-3.5 h-3.5 ${isActive ? 'text-lime animate-spin-slow' : 'text-amber-400'}`} />
            <div className={`text-xs font-extrabold ${isActive ? 'text-lime' : isUpcoming ? 'text-amber-400' : 'text-slate-300'}`}>
              {countdown}
            </div>
            <span className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">
              {isUpcoming ? 'Until Start' : isCompleted ? 'Status' : 'Remaining'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. UNJOINED NOTICE BANNER (Prominent Join CTA) */}
      {!hasJoined && !isCompleted && (
        <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-lime/15 via-lime/5 to-transparent border border-lime/30 dark:border-lime/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-lime/20 text-[#0F0B0A] dark:text-lime flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-dark dark:text-[#F5F5F5]">
                You haven&apos;t joined {game.title} yet
              </h3>
              <p className="text-xs text-slate-600 dark:text-[#A1A1AA] mt-0.5 leading-snug">
                Join now to receive an isolated virtual starting balance of <strong>{formatCurrency(game.startingCapital, 0)}</strong> and compete for XP rewards!
              </p>
            </div>
          </div>

          <Button
            variant="lime"
            size="md"
            onClick={() => setIsJoinModalOpen(true)}
            className="font-extrabold text-xs shadow-lime shrink-0 cursor-pointer"
          >
            <UserPlus className="w-4 h-4 mr-1.5" />
            <span>Join Tournament Now</span>
          </Button>
        </div>
      )}

      {/* 3. LIFECYCLE ANNOUNCEMENT BANNER */}
      {isUpcoming && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-amber-900 dark:text-amber-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                <span>Trading starts at {formatEasternDateTime(game.startDate)}</span>
                <span className="text-[10px] font-bold bg-amber-500/20 px-2 py-0.5 rounded-full"> Trading locked</span>
              </h4>
              <p className="text-xs opacity-80 mt-0.5">
                {hasJoined
                  ? 'You are enrolled! Order execution unlocks automatically at the scheduled start time.'
                  : 'Join now to secure your starting capital before the competition begins.'}
              </p>
            </div>
          </div>
          <div className="font-mono font-bold text-xs bg-amber-500/20 text-amber-900 dark:text-amber-300 px-3 py-1.5 rounded-xl shrink-0">
            {countdown}
          </div>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-purple-900 dark:text-purple-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center shrink-0">
              <Trophy className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-1.5">
                <span>Tournament Concluded — Final Rankings Frozen</span>
                <span className="text-[10px] font-bold bg-purple-500/20 px-2 py-0.5 rounded-full"> XP Distributed</span>
              </h4>
              <p className="text-xs opacity-80 mt-0.5">
                Competition ended on {formatEasternDateTime(game.endDate)}. Final rankings are frozen and XP rewards have been awarded to all participants.
              </p>
            </div>
          </div>
          <div className="font-mono font-extrabold text-xs bg-purple-500/20 text-purple-900 dark:text-purple-300 px-3 py-1.5 rounded-xl shrink-0">
            {hasJoined ? `+${currentRewardXp} XP Awarded` : 'Rankings Finalized'}
          </div>
        </div>
      )}

      {/* 4. THREE-COLUMN ARENA GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLUMN 1: LEFT SIDEBAR */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          {/* A. User Performance Card (if joined) OR Tournament Overview Card (if not joined) */}
          {hasJoined ? (
            <Card className="p-4 bg-gradient-to-b from-[#1E1E21] to-[#28282B] text-white border-[#3A3A3D]">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="text-[10px] uppercase font-bold text-zinc-400 dark:text-[#A1A1AA]">Tournament Performance</span>
                <span className="text-[10px] font-extrabold bg-lime text-[#0F0B0A] px-2 py-0.5 rounded-full font-mono">
                  Rank #{currentRank}
                </span>
              </div>

              <div className="mb-3">
                <span className="text-[10px] text-zinc-400 dark:text-[#A1A1AA] block">Total Competition Value</span>
                <div className="text-2xl font-extrabold font-mono text-white">
                  {formatCurrency(portfolio?.totalPortfolioValue ?? game.startingCapital)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-3 border-t border-white/10 dark:border-[#3A3A3D] text-xs">
                <div>
                  <span className="text-[10px] text-zinc-400 dark:text-[#71717A] block">Net P&L</span>
                  <span
                    className={`font-mono font-extrabold ${
                      (portfolio?.pnl || 0) >= 0 ? 'text-lime' : 'text-red-400'
                    }`}
                  >
                    {(portfolio?.pnl || 0) >= 0 ? '+' : ''}
                    {formatCurrency(portfolio?.pnl ?? 0)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 dark:text-[#71717A] block">Total Return</span>
                  <span
                    className={`font-mono font-extrabold ${
                      (portfolio?.returnPct || 0) >= 0 ? 'text-lime' : 'text-red-400'
                    }`}
                  >
                    {(portfolio?.returnPct || 0) >= 0 ? '+' : ''}
                    {portfolio?.returnPct ?? 0}%
                  </span>
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 dark:border-[#3A3A3D] flex items-center justify-between text-[11px] text-zinc-300 dark:text-[#A1A1AA]">
                <span>Isolated Cash:</span>
                <span className="font-mono font-bold text-white">
                  {formatCurrency(availableCash)}
                </span>
              </div>

              <div className="mt-3 pt-3 border-t border-white/10 dark:border-[#3A3A3D] flex items-center justify-between text-[11px]">
                <span className="text-zinc-300 dark:text-[#A1A1AA] flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-lime" /> Current XP Tier:
                </span>
                <span className="font-mono font-extrabold text-lime">
                  +{currentRewardXp} XP
                </span>
              </div>
            </Card>
          ) : (
            <Card className="p-4 bg-gradient-to-b from-[#1E1E21] to-[#28282B] text-white border-[#3A3A3D] flex flex-col gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-5 h-5 text-lime" />
                <h4 className="text-sm font-extrabold text-white">Join Competition</h4>
              </div>
              <p className="text-xs text-zinc-300 dark:text-[#A1A1AA] leading-relaxed">
                Enroll to get <strong>{formatCurrency(game.startingCapital, 0)}</strong> starting sandbox balance and join the real-time leaderboard.
              </p>
              {!isCompleted && (
                <Button
                  variant="lime"
                  size="sm"
                  onClick={() => setIsJoinModalOpen(true)}
                  className="w-full justify-center font-extrabold text-xs shadow-lime cursor-pointer mt-1"
                >
                  <UserPlus className="w-3.5 h-3.5 mr-1" />
                  <span>Join Tournament</span>
                </Button>
              )}
            </Card>
          )}

          {/* Tournament Overview & Rules Card */}
          <Card className="p-4">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Rules & Information</span>
            </div>

            <ul className="space-y-2 text-xs text-slate-600 dark:text-[#A1A1AA]">
              {game.rules?.map((rule, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime shrink-0 mt-1.5" />
                  <span className="leading-snug">{rule}</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between text-[11px] text-slate-muted dark:text-[#71717A]">
              <span>Late Joiners</span>
              <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">
                {game.allowLateJoiners ? 'Allowed' : 'Disabled (Pre-Start Only)'}
              </span>
            </div>

            <div className="mt-2 pt-2 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between text-[11px] text-slate-muted dark:text-[#71717A]">
              <span>Account Separation</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">100% Isolated Cash</span>
            </div>
          </Card>

          {/* XP Rewards Structure */}
          <Card className="p-4">
            <div className="flex items-center gap-1.5 text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] uppercase tracking-wider mb-2.5">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Placement XP Rewards</span>
            </div>
            <div className="flex flex-col gap-1.5 text-xs font-mono">
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold">
                <span> 1st Place</span>
                <span>+500 XP</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-400/10 text-slate-700 dark:text-slate-300 font-bold">
                <span> 2nd Place</span>
                <span>+350 XP</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-amber-700/10 text-amber-800 dark:text-amber-400 font-bold">
                <span> 3rd Place</span>
                <span>+250 XP</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-lime-500/10 text-lime-800 dark:text-lime font-bold">
                <span> Top 10</span>
                <span>+100 XP</span>
              </div>
              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-100 dark:bg-[#1E1E21] text-slate-600 dark:text-slate-400 font-bold">
                <span> Finisher</span>
                <span>+25 XP</span>
              </div>
            </div>
          </Card>

          {/* Invite Code Share Card */}
          {game.inviteCode && (
            <Card className="p-3.5 bg-slate-50 dark:bg-[#1E1E21] border-slate-200 dark:border-[#3A3A3D] text-xs">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-muted dark:text-[#71717A] block">Invite Code</span>
                  <span className="font-mono font-extrabold text-slate-dark dark:text-[#F5F5F5] text-sm">{game.inviteCode}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}/games/${game.slug}?code=${game.inviteCode}`
                    );
                    alert('Tournament invite link copied to clipboard!');
                  }}
                  className="text-xs"
                >
                  Copy Link
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* COLUMN 2: MAIN AREA */}
        <div className="lg:col-span-6 flex flex-col gap-5">
          {/* A. INSTRUMENT SEARCH & SELECTOR */}
          <Card className="p-4">
            <div className="relative mb-3">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[#71717A]" />
              <input
                type="text"
                placeholder="Search stocks in this tournament (e.g. NVDA, AAPL, SPY, ASML)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-xs font-semibold text-slate-dark dark:text-[#F5F5F5] focus:outline-none focus:border-[#B8F500]/60 placeholder:text-slate-400 dark:placeholder:text-[#71717A]"
              />
            </div>

            {/* Quick stock chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {filteredStocks.map((s) => (
                <button
                  key={s.ticker}
                  onClick={() => {
                    setSelectedTicker(s.ticker);
                    setSearchQuery('');
                  }}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                    selectedTicker.toUpperCase() === s.ticker.toUpperCase()
                      ? 'bg-lime text-[#0F0B0A] shadow-sm'
                      : 'bg-slate-100 dark:bg-[#1E1E21] hover:bg-slate-200 dark:hover:bg-[#323236] text-slate-700 dark:text-[#F5F5F5]'
                  }`}
                >
                  <span>{s.ticker}</span>
                  <span className="font-mono text-[10px] opacity-75">${Number(s.current_price).toFixed(2)}</span>
                </button>
              ))}
            </div>
          </Card>

          {/* B. SELECTED INSTRUMENT HEADER & CHART DISPLAY */}
          <Card className="p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <CompanyLogo
                  ticker={currentStock.ticker}
                  name={currentStock.name}
                  size="md"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-dark dark:text-[#F5F5F5]">
                      {currentStock.name}
                    </h3>
                    <Badge variant="neutral" size="sm">
                      {currentStock.ticker}
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-muted dark:text-[#A1A1AA]">
                    {(currentStock as any).exchange || 'NASDAQ'} • {currentStock.sector || 'Equities'}
                  </div>
                </div>
              </div>

              {/* Price & Day Change */}
              <div className="text-right">
                <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
                  {formatCurrency(currentPrice)}
                </div>
                <div
                  className={`text-xs font-mono font-bold flex items-center justify-end gap-1 ${
                    Number(currentStock.day_change_pct || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {Number(currentStock.day_change_pct || 0) >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {Number(currentStock.day_change_pct || 0) >= 0 ? '+' : ''}
                    {currentStock.day_change_pct || 0}%
                  </span>
                </div>
              </div>
            </div>

            {/* Interactive Price Waveform Illustration */}
            <div className="h-32 w-full bg-slate-50 dark:bg-[#1E1E21] border border-slate-100 dark:border-[#3A3A3D] rounded-xl p-3 flex flex-col justify-between relative overflow-hidden mb-4 select-none">
              <div className="flex items-center justify-between text-[10px] text-slate-400 dark:text-[#71717A] font-mono">
                <span>52W Low: {formatCurrency(Number((currentStock as any).low_52w || currentPrice * 0.75))}</span>
                <span>52W High: {formatCurrency(Number((currentStock as any).high_52w || currentPrice * 1.25))}</span>
              </div>

              {/* Decorative SVG Price Line */}
              <svg viewBox="0 0 400 80" className="w-full h-16 text-slate-800 fill-none stroke-current stroke-2">
                <path
                  d="M0 60 Q 50 20, 100 45 T 200 30 T 300 15 T 400 10"
                  className="stroke-lime stroke-[2.5]"
                />
              </svg>

              <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-[#71717A] font-mono">
                <span>Volume: {currentStock.volume_24h || '24.5M'}</span>
                <span>Cap: {currentStock.market_cap || '$1.2T'}</span>
                <span className="font-bold text-slate-700 dark:text-[#A1A1AA]">Real-Time Feed</span>
              </div>
            </div>

            {/* C. BUY / SELL TRADING PANEL (OR JOIN TOURNAMENT CALLOUT) */}
            {hasJoined ? (
              <div className="p-4 bg-slate-subtle dark:bg-[#1E1E21] rounded-2xl border border-slate-border dark:border-[#3A3A3D] flex flex-col gap-3.5">
                <div className="grid grid-cols-2 bg-white dark:bg-[#28282B] p-1 rounded-xl gap-1 border border-slate-200 dark:border-[#3A3A3D]">
                  <button
                    disabled={!isActive}
                    onClick={() => setTradeType('BUY')}
                    className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      tradeType === 'BUY'
                        ? 'bg-lime text-[#0F0B0A] shadow-sm'
                        : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                    } ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    BUY {currentStock.ticker}
                  </button>
                  <button
                    disabled={!isActive}
                    onClick={() => setTradeType('SELL')}
                    className={`py-2 text-xs font-extrabold rounded-lg transition-all cursor-pointer ${
                      tradeType === 'SELL'
                        ? 'bg-red-500 text-white shadow-sm'
                        : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                    } ${!isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    SELL {currentStock.ticker}
                  </button>
                </div>

                {/* Quantity Input */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5]">Quantity (Shares)</label>
                    <span className="text-[11px] font-mono text-slate-muted dark:text-[#71717A]">
                      {tradeType === 'BUY'
                        ? `Max Affordable: ${Math.floor(availableCash / currentPrice)}`
                        : `Holding: ${sharesHeld}`}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      disabled={!isActive}
                      value={shares.toString()}
                      onChange={(e) => setShares(Math.max(1, parseInt(e.target.value, 10) || 1))}
                      className="font-mono text-base font-bold bg-white dark:bg-[#28282B] border-slate-border dark:border-[#3A3A3D] text-slate-dark dark:text-[#F5F5F5]"
                    />
                    <div className="flex items-center gap-1">
                      {[1, 5, 10, 25].map((q) => (
                        <button
                          key={q}
                          type="button"
                          disabled={!isActive}
                          onClick={() => setShares(q)}
                          className="px-2.5 py-2 rounded-xl bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] hover:bg-slate-100 dark:hover:bg-[#323236] text-xs font-mono font-bold text-slate-dark dark:text-[#F5F5F5] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          +{q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Order Cost Calculation */}
                <div className="p-3 bg-white dark:bg-[#28282B] rounded-xl border border-slate-200 dark:border-[#3A3A3D] text-xs flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-slate-muted dark:text-[#A1A1AA]">
                    <span>Execution Price:</span>
                    <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(currentPrice)}</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-muted dark:text-[#A1A1AA]">
                    <span>Available Competition Cash:</span>
                    <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(availableCash)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between font-bold text-slate-dark dark:text-[#F5F5F5]">
                    <span>Estimated Total:</span>
                    <span className="font-mono text-sm">{formatCurrency(orderValue)}</span>
                  </div>
                </div>

                {/* Trade Feedback Alert */}
                {feedbackMessage && (
                  <div
                    className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
                      feedbackMessage.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                        : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50'
                    }`}
                  >
                    {feedbackMessage.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
                    )}
                    <span>{feedbackMessage.text}</span>
                  </div>
                )}

                {/* Confirm Trade Button */}
                <Button
                  variant={tradeType === 'BUY' ? 'lime' : 'danger'}
                  size="lg"
                  disabled={!canExecute || tradeMutation.isPending}
                  onClick={handleExecuteTrade}
                  className="w-full justify-center font-extrabold cursor-pointer"
                >
                  {isUpcoming ? (
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-4 h-4" /> Trading Starts at {formatEasternDateTime(game.startDate)}
                    </span>
                  ) : isCompleted ? (
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-4 h-4" /> Competition Concluded (Trading Closed)
                    </span>
                  ) : tradeMutation.isPending ? (
                    <span>Executing Order...</span>
                  ) : (
                    <span>
                      Confirm {tradeType} ({shares} {shares === 1 ? 'Share' : 'Shares'})
                    </span>
                  )}
                </Button>
              </div>
            ) : (
              <div className="p-6 bg-slate-subtle dark:bg-[#1E1E21] rounded-2xl border border-slate-border dark:border-[#3A3A3D] text-center flex flex-col items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-lime/20 text-[#0F0B0A] dark:text-lime flex items-center justify-center">
                  <UserPlus className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-slate-dark dark:text-[#F5F5F5]">
                    Join Tournament to Start Trading
                  </h4>
                  <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-1 max-w-sm mx-auto">
                    You must enroll in this tournament to place buy and sell orders with your isolated starting capital.
                  </p>
                </div>
                {!isCompleted && (
                  <Button
                    variant="lime"
                    size="md"
                    onClick={() => setIsJoinModalOpen(true)}
                    className="font-extrabold text-xs shadow-lime cursor-pointer mt-1"
                  >
                    <UserPlus className="w-4 h-4 mr-1.5" />
                    <span>Join Tournament Now</span>
                  </Button>
                )}
              </div>
            )}
          </Card>

          {/* D. USER'S CURRENT POSITIONS IN THIS TOURNAMENT (if joined) */}
          {hasJoined && (
            <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
              <div className="p-4 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <PieChart className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-dark dark:text-[#F5F5F5]">
                    Tournament Holdings ({portfolio?.holdings?.length || 0})
                  </h4>
                </div>
              </div>

              {portfolio?.holdings && portfolio.holdings.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] font-bold select-none">
                        <th className="py-2.5 px-4">Instrument</th>
                        <th className="py-2.5 px-4">Shares</th>
                        <th className="py-2.5 px-4">Avg Cost</th>
                        <th className="py-2.5 px-4">Market Value</th>
                        <th className="py-2.5 px-4 text-right">P&L</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D] font-mono">
                      {portfolio.holdings.map((h) => (
                        <tr
                          key={h.ticker}
                          onClick={() => setSelectedTicker(h.ticker)}
                          className="hover:bg-slate-50 dark:hover:bg-[#323236] cursor-pointer transition-colors"
                        >
                          <td className="py-3 px-4">
                            <span className="font-extrabold text-slate-dark dark:text-[#F5F5F5]">{h.ticker}</span>
                            <span className="text-[10px] text-slate-400 dark:text-[#71717A] block truncate max-w-[120px]">{h.name}</span>
                          </td>
                          <td className="py-3 px-4 font-bold text-slate-dark dark:text-[#F5F5F5]">{h.shares}</td>
                          <td className="py-3 px-4 text-slate-600 dark:text-[#A1A1AA]">{formatCurrency(h.avgCost)}</td>
                          <td className="py-3 px-4 font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(h.currentValue)}</td>
                          <td className="py-3 px-4 text-right">
                            <span className={h.unrealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400 font-bold' : 'text-red-600 dark:text-red-400 font-bold'}>
                              {h.unrealizedPnl >= 0 ? '+' : ''}{formatCurrency(h.unrealizedPnl)} ({h.returnPct}%)
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-xs text-slate-muted dark:text-[#A1A1AA]">
                  {isUpcoming
                    ? 'Trading is locked until start time. You will be able to buy and sell once the tournament goes live.'
                    : 'No active positions in this tournament. Use the trade panel above to build your portfolio.'}
                </div>
              )}
            </Card>
          )}

          {/* E. RECENT TOURNAMENT TRADES LEDGER (if joined) */}
          {hasJoined && (
            <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
              <div className="p-4 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-dark dark:text-[#F5F5F5]">
                    Recent Tournament Trades ({portfolio?.transactions?.length || 0})
                  </h4>
                </div>
              </div>

              {portfolio?.transactions && portfolio.transactions.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] font-bold select-none">
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4">Ticker</th>
                        <th className="py-2.5 px-4">Shares</th>
                        <th className="py-2.5 px-4">Execution Price</th>
                        <th className="py-2.5 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
                      {portfolio.transactions.slice(0, 5).map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-50 dark:hover:bg-[#323236]">
                          <td className="py-2.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                                tx.type === 'BUY'
                                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300'
                              }`}
                            >
                              {tx.type}
                            </span>
                          </td>
                          <td className="py-2.5 px-4 font-bold text-slate-dark dark:text-[#F5F5F5]">{tx.ticker}</td>
                          <td className="py-2.5 px-4 text-slate-dark dark:text-[#F5F5F5]">{tx.shares}</td>
                          <td className="py-2.5 px-4 text-slate-600 dark:text-[#A1A1AA]">{formatCurrency(tx.price)}</td>
                          <td className="py-2.5 px-4 text-right font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(tx.totalValue)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-slate-muted dark:text-[#A1A1AA]">
                  No trades executed yet in this tournament.
                </div>
              )}
            </Card>
          )}
        </div>

        {/* COLUMN 3: RIGHT SIDEBAR */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
            <div className="p-4 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between bg-slate-50 dark:bg-[#1E1E21]">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-dark dark:text-[#F5F5F5]">
                  {isCompleted ? 'Final Standings' : 'Live Standings'}
                </h4>
              </div>
              <Badge variant={isCompleted ? 'down' : 'lime'} size="sm">
                {isCompleted ? 'Finalized' : 'Ranked by %'}
              </Badge>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
              {leaderboard.map((player) => {
                const isYou = player.isCurrentUser;
                const playerXp = calculateRewardXp(player.rank);
                return (
                  <div
                    key={player.userId}
                    className={`p-3.5 flex items-center justify-between transition-colors ${
                      isYou
                        ? 'bg-lime-50/90 dark:bg-[#353539] border-l-4 border-lime font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-[#323236]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span
                        className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-extrabold shrink-0 ${
                          player.rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-sm'
                            : player.rank === 2
                            ? 'bg-slate-300 text-slate-900'
                            : player.rank === 3
                            ? 'bg-amber-700 text-white'
                            : 'bg-slate-100 dark:bg-[#1E1E21] text-slate-600 dark:text-[#A1A1AA]'
                        }`}
                      >
                        {player.rank}
                      </span>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] truncate max-w-[100px]">
                            {player.username}
                          </span>
                          {isYou && (
                            <span className="text-[9px] font-extrabold bg-lime text-[#0F0B0A] px-1.5 py-0.2 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 dark:text-[#71717A] flex items-center gap-1">
                          <span>{formatCurrency(player.portfolioValue)}</span>
                          <span>•</span>
                          <span className="text-lime-700 dark:text-lime font-bold">+{playerXp} XP</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div
                        className={`text-xs font-mono font-extrabold ${
                          player.returnPct >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {player.returnPct >= 0 ? '+' : ''}
                        {player.returnPct}%
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-[#71717A] font-mono">
                        {player.totalTrades} {player.totalTrades === 1 ? 'trade' : 'trades'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 bg-slate-50 dark:bg-[#1E1E21] border-t border-slate-border dark:border-[#3A3A3D] text-center">
              <span className="text-[11px] text-slate-muted dark:text-[#71717A]">
                {isCompleted
                  ? 'All rankings are finalized. XP has been distributed.'
                  : 'Standings refresh continuously on real-time market updates.'}
              </span>
            </div>
          </Card>
        </div>
      </div>

      {/* Join Tournament Confirmation Modal */}
      {game && (
        <JoinTournamentModal
          isOpen={isJoinModalOpen}
          game={game}
          onClose={() => setIsJoinModalOpen(false)}
          onSuccess={() => setIsJoinModalOpen(false)}
        />
      )}

      {/* Leave Tournament Confirmation Modal */}
      {game && (
        <LeaveTournamentModal
          isOpen={isLeaveModalOpen}
          gameTitle={game.title}
          gameIdOrSlug={game.slug || game.id}
          onClose={() => setIsLeaveModalOpen(false)}
          onSuccess={() => setIsLeaveModalOpen(false)}
        />
      )}
    </div>
  );
}
