'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Trophy, Award, User, Crown, PlusCircle, Gamepad2, ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/Tabs';
import { GamesSection } from '@/components/games/GamesSection';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { useGames } from '@/hooks/useGames';
import { formatEasternDateTime, getCountdownString } from '@/lib/games/games-service';

export default function LeaderboardPage() {
  const { user, profile, portfolio } = useAuth();
  const [tab, setTab] = useState('global');
  const { data: gamesData } = useGames('active');

  const activeGames = gamesData?.games || [];
  const activeTournament = activeGames[0];

  const currentNickname = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader (You)';
  const currentStartingCash = (portfolio as any)?.starting_cash ?? (portfolio as any)?.starting_capital ?? 10000;
  const currentCash = (portfolio as any)?.cash ?? (portfolio as any)?.cash_balance ?? 10000;
  const currentPnl = currentCash - currentStartingCash;
  const currentReturnPct = currentStartingCash > 0 ? Number(((currentPnl / currentStartingCash) * 100).toFixed(2)) : 0;

  // Real participants only (no mock bots)
  const leaderboardData = user ? [
    {
      rank: 1,
      name: currentNickname,
      portfolioValue: currentCash,
      returnPct: currentReturnPct,
      pnl: currentPnl,
      trades: 0,
      winRate: '—',
      isCurrentUser: true,
    }
  ] : [];

  const top3 = leaderboardData.slice(0, 3);

  return (
    <div className="flex flex-col gap-8 max-w-[1440px] mx-auto">
      {/* 1. HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            Trading Leaderboard
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Real-time standings for equal-capital simulated tournaments.
          </p>
        </div>

        <PillTabs
          items={[
            { id: 'global', label: `Global Arena (${leaderboardData.length})` },
            { id: 'friends', label: 'Friends League' },
          ]}
          activeId={tab}
          onChange={setTab}
          variant="lime"
        />
      </div>

      {/* 2. ACTIVE TOURNAMENT BANNER */}
      {activeTournament ? (
        <div className="bg-gradient-to-br from-[#1E1E21] via-[#28282B] to-[#1E1E21] text-white rounded-card-lg p-6 flex items-center justify-between flex-wrap gap-4 shadow-dark-card border border-[#3A3A3D]">
          <div>
            <Badge variant="lime" size="sm">Active Tournament</Badge>
            <h3 className="text-xl font-extrabold text-white mt-1">{activeTournament.title}</h3>
            <p className="text-xs text-zinc-300 dark:text-[#A1A1AA] mt-0.5">
              {activeTournament.description}
            </p>
          </div>

          <div className="flex items-center gap-6 font-mono text-center">
            <div>
              <div className="text-2xl font-extrabold text-lime">{getCountdownString(activeTournament.endDate, false)}</div>
              <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Time Remaining</div>
            </div>
            <div>
              <div className="text-2xl font-extrabold text-white">{formatCurrency(activeTournament.startingCapital, 0)}</div>
              <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Starting Pool</div>
            </div>
            <Link href={`/games/${activeTournament.slug}`}>
              <Button variant="lime" size="sm" className="font-extrabold">
                <span>Enter Arena</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      ) : null}

      {/* 3. TOP PODIUM CARDS (IF REAL USERS PRESENT) */}
      {top3.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          {top3.map((u, idx) => (
            <Card key={u.name} className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-lime-50 to-white dark:from-[#28282B] dark:to-[#1E1E21] border-lime dark:border-lime/80 shadow-lime dark:shadow-dark-card relative">
              <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center absolute -top-4 shadow-sm">
                <Crown className="w-4 h-4" />
              </div>
              <div className="w-16 h-16 rounded-full bg-lime-100 dark:bg-lime/10 border-2 border-lime flex items-center justify-center text-slate-900 dark:text-lime shadow-subtle mb-2">
                <User className="w-7 h-7 text-slate-800 dark:text-lime" />
              </div>
              <h4 className="text-base font-extrabold text-slate-dark dark:text-[#F5F5F5]">{u.name}</h4>
              <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 my-1">
                {u.returnPct >= 0 ? '+' : ''}{u.returnPct}%
              </div>
              <div className="text-xs font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(u.portfolioValue)}</div>
              <div className="text-[11px] text-slate-muted dark:text-[#71717A] mt-1">Real-time Leaderboard</div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-2xl">
          <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-[#1E1E21] text-slate-500 dark:text-[#71717A] flex items-center justify-center mx-auto mb-2">
            <Trophy className="w-5 h-5" />
          </div>
          <h4 className="text-sm font-bold text-slate-dark dark:text-[#F5F5F5]">No Tournament Rankings Yet</h4>
          <p className="text-xs text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Join a live competition or execute trades to appear on the official leaderboard.
          </p>
        </div>
      )}

      {/* 4. FULL RANKINGS TABLE */}
      {leaderboardData.length > 0 && (
        <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] sm:text-[11px] font-bold tracking-wider select-none">
                  <th className="py-3 px-2.5 sm:px-4 w-12 sm:w-16">Rank</th>
                  <th className="py-3 px-2.5 sm:px-4">Trader Nickname</th>
                  <th className="py-3 px-2.5 sm:px-4">Portfolio Value</th>
                  <th className="py-3 px-2.5 sm:px-4">Total Return</th>
                  <th className="py-3 px-2.5 sm:px-4 hidden md:table-cell">Simulated P&L</th>
                  <th className="py-3 px-2.5 sm:px-4 hidden sm:table-cell">Trades</th>
                  <th className="py-3 px-2.5 sm:px-4 text-right hidden sm:table-cell">Win Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
                {leaderboardData.map((u) => {
                  const isYou = u.isCurrentUser;
                  return (
                    <tr
                      key={u.name}
                      className={`hover:bg-slate-50/70 dark:hover:bg-[#323236] transition-colors ${
                        isYou ? 'bg-lime-50/80 dark:bg-[#353539] border-l-4 border-lime font-bold' : ''
                      }`}
                    >
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono font-extrabold text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5]">#{u.rank}</td>
                      <td className="py-3.5 px-2.5 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA] shrink-0">
                            <User className="w-3.5 h-3.5" />
                          </div>
                          <span className="font-extrabold text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5]">{u.name}</span>
                          {isYou && <Badge variant="lime" size="sm">You</Badge>}
                        </div>
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono font-bold text-xs sm:text-sm text-slate-dark dark:text-[#F5F5F5]">
                        {formatCurrency(u.portfolioValue)}
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4">
                        <Badge variant={u.returnPct >= 0 ? 'up' : 'down'} size="sm">
                          {u.returnPct >= 0 ? '+' : ''}{u.returnPct}%
                        </Badge>
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono text-slate-600 dark:text-[#A1A1AA] hidden md:table-cell">
                        {u.pnl >= 0 ? '+' : ''}{formatCurrency(u.pnl)}
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 font-mono text-slate-600 dark:text-[#A1A1AA] hidden sm:table-cell">
                        {u.trades}
                      </td>
                      <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-slate-700 dark:text-[#F5F5F5] hidden sm:table-cell">
                        {u.winRate}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 5. TRADING GAMES & TOURNAMENTS SECTION */}
      <div className="pt-4 border-t border-slate-200/80 dark:border-[#3A3A3D]">
        <GamesSection
          title="Trading Games & Tournaments"
          subtitle="Join active simulated tournaments or create a private competition with custom rules and starting capital."
        />
      </div>
    </div>
  );
}
