'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Trophy,
  Users,
  Clock,
  ArrowRight,
  ShieldCheck,
  Lock,
  Globe,
  Award,
  Sparkles,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PrivateGamePasswordModal } from './PrivateGamePasswordModal';
import { formatCurrency } from '@/lib/utils';
import { TradingGame } from '@/lib/games/types';
import { isClientGameAuthorized } from '@/hooks/useGames';
import { formatEasternDateTime, getCountdownString, getComputedGameStatus } from '@/lib/games/games-service';
import { useAuth } from '@/providers/AuthProvider';

interface GameCardProps {
  game: TradingGame;
  userRank?: number;
  onJoin?: () => void;
}

export function GameCard({ game, userRank, onJoin }: GameCardProps) {
  const router = useRouter();
  const { user } = useAuth();
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [countdown, setCountdown] = useState<string>('');

  const currentStatus = getComputedGameStatus(game);
  const isUpcoming = currentStatus === 'upcoming';
  const isCompleted = currentStatus === 'completed';
  const isActive = currentStatus === 'active';

  const isPrivate = game.visibility === 'private';
  const isAuthorized = isPrivate ? isClientGameAuthorized(game.slug || game.id, game.creatorId, user?.id) : true;

  // Real-time countdown timer tick
  useEffect(() => {
    const updateCountdown = () => {
      if (isCompleted) {
        setCountdown('Concluded');
      } else if (isUpcoming) {
        setCountdown(getCountdownString(game.startDate, true));
      } else {
        setCountdown(getCountdownString(game.endDate, false));
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [game.startDate, game.endDate, isUpcoming, isCompleted]);

  // Handle entry click
  const handleEntryClick = (e: React.MouseEvent) => {
    if (isPrivate && !isAuthorized) {
      e.preventDefault();
      setIsPasswordModalOpen(true);
    } else {
      if (onJoin) {
        onJoin();
      } else {
        router.push(`/games/${game.slug || game.id}`);
      }
    }
  };

  return (
    <>
      <Card className="p-5 flex flex-col justify-between hover:border-slate-300 dark:hover:border-[#4A4A4E] transition-all group shadow-sm dark:shadow-dark-card relative overflow-hidden">
        <div>
          {/* Top Header Row: Exact Status Badge + Category + Visibility */}
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-1.5">
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

              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#1E1E21] px-2 py-0.5 rounded-full border border-slate-200 dark:border-[#3A3A3D]">
                {game.category}
              </span>
            </div>

            {isPrivate ? (
              <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/50 shrink-0">
                <Lock className="w-3 h-3" /> Private
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[10px] font-bold text-slate-500 dark:text-[#71717A] shrink-0">
                <Globe className="w-3 h-3" /> Public
              </span>
            )}
          </div>

          {/* Game Title */}
          <button
            type="button"
            onClick={handleEntryClick}
            className="text-left w-full focus:outline-none"
          >
            <h3 className="text-base font-extrabold text-slate-dark dark:text-[#F5F5F5] group-hover:text-lime-950 dark:group-hover:text-lime transition-colors leading-tight mb-1.5">
              {game.title}
            </h3>
          </button>

          {/* Description */}
          <p className="text-xs text-slate-600 dark:text-[#A1A1AA] line-clamp-2 leading-relaxed mb-3">
            {game.description}
          </p>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-2 p-3 bg-slate-subtle dark:bg-[#1E1E21] rounded-xl border border-slate-border dark:border-[#3A3A3D] mb-3 text-xs">
            <div>
              <span className="text-[10px] text-slate-muted dark:text-[#71717A] block font-medium">Isolated Capital</span>
              <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-sm">
                {formatCurrency(game.startingCapital, 0)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-muted dark:text-[#71717A] block font-medium">Participants</span>
              <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-sm flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-slate-500 dark:text-[#71717A]" />
                <span>{game.participantsCount.toLocaleString()}</span>
              </span>
            </div>
          </div>

          {/* Lifecycle & Timing Box */}
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1A1A1D] border border-slate-200/80 dark:border-[#333337] flex flex-col gap-1 mb-3 text-xs">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-medium text-slate-500 dark:text-[#8E8E93]">
                {isUpcoming ? 'Starts:' : isCompleted ? 'Status:' : 'Ends:'}
              </span>
              <span className="font-mono font-bold text-slate-700 dark:text-[#E5E5EA]">
                {isUpcoming
                  ? formatEasternDateTime(game.startDate)
                  : isCompleted
                  ? 'XP Rewards Distributed'
                  : formatEasternDateTime(game.endDate)}
              </span>
            </div>

            <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/60 dark:border-[#2C2C30]">
              <span className="flex items-center gap-1 text-slate-500 dark:text-[#71717A] font-mono">
                <Clock className="w-3 h-3 text-slate-400 dark:text-[#71717A]" />
                <span>{countdown}</span>
              </span>
              {isUpcoming ? (
                <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">
                  🔒 Trading locked
                </span>
              ) : isActive ? (
                <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400">
                  🟢 Trading active
                </span>
              ) : (
                <span className="text-[10px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <Award className="w-3 h-3" /> Rankings Frozen
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-100 dark:border-[#3A3A3D] flex items-center justify-between gap-2">
          <span className="text-[10px] text-slate-400 dark:text-[#71717A] font-mono">
            {game.allowLateJoiners ? 'Late Join: ON' : 'Pre-Start Only'}
          </span>
          <Button
            variant={isActive ? 'lime' : isUpcoming ? 'outline' : 'outline'}
            size="sm"
            onClick={handleEntryClick}
            className="w-full sm:w-auto justify-center font-extrabold text-xs cursor-pointer"
          >
            <span>
              {isActive
                ? 'Enter Game Arena'
                : isUpcoming
                ? 'Preview Arena'
                : 'View Results'}
            </span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </div>
      </Card>

      {/* Private Game Password Modal */}
      <PrivateGamePasswordModal
        isOpen={isPasswordModalOpen}
        game={game}
        onClose={() => setIsPasswordModalOpen(false)}
        onSuccess={() => {
          setIsPasswordModalOpen(false);
          router.push(`/games/${game.slug || game.id}`);
        }}
      />
    </>
  );
}
