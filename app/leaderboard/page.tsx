'use client';

import React, { useState } from 'react';
import { Trophy, Award, User, Crown, PlusCircle, Gamepad2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/Tabs';
import { GamesSection } from '@/components/games/GamesSection';
import { formatCurrency } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';

export default function LeaderboardPage() {
  const { user, profile } = useAuth();
  const [tab, setTab] = useState('global');

  const currentNickname = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader (You)';

  const leaderboardData = [
    { rank: 1, name: 'SatoshiQuant', portfolioValue: 16840.50, returnPct: 68.41, pnl: 6840.50, trades: 42, winRate: '78%' },
    { rank: 2, name: 'CyberBull_99', portfolioValue: 15420.10, returnPct: 54.20, pnl: 5420.10, trades: 38, winRate: '74%' },
    { rank: 3, name: 'ValkyrieTrading', portfolioValue: 14950.00, returnPct: 49.50, pnl: 4950.00, trades: 29, winRate: '72%' },
    { rank: 4, name: 'AlphaSeeker_X', portfolioValue: 14120.75, returnPct: 41.21, pnl: 4120.75, trades: 51, winRate: '67%' },
    { rank: 5, name: 'NovaTrader', portfolioValue: 13890.30, returnPct: 38.90, pnl: 3890.30, trades: 31, winRate: '65%' },
    { rank: 14, name: `${currentNickname}`, portfolioValue: 12483.27, returnPct: 24.83, pnl: 2483.27, trades: 18, winRate: '68.4%', isCurrentUser: true },
  ];

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
            { id: 'global', label: 'Global Arena (2,840)' },
            { id: 'friends', label: 'Friends League (8)' },
          ]}
          activeId={tab}
          onChange={setTab}
          variant="lime"
        />
      </div>

      {/* 2. ACTIVE TOURNAMENT BANNER */}
      <div className="bg-gradient-to-br from-[#1E1E21] via-[#28282B] to-[#1E1E21] text-white rounded-card-lg p-6 flex items-center justify-between flex-wrap gap-4 shadow-dark-card border border-[#3A3A3D]">
        <div>
          <Badge variant="lime" size="sm">Active Tournament</Badge>
          <h3 className="text-xl font-extrabold text-white mt-1">Alpha Trader Summer Cup 2026</h3>
          <p className="text-xs text-zinc-300 dark:text-[#A1A1AA] mt-0.5">
            Equal starting capital: $25,000.00. Ranking determined strictly by net % return.
          </p>
        </div>

        <div className="flex items-center gap-6 font-mono text-center">
          <div>
            <div className="text-2xl font-extrabold text-lime">14d 08h 22m</div>
            <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Time Remaining</div>
          </div>
          <div>
            <div className="text-2xl font-extrabold text-white">$25,000</div>
            <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Starting Pool</div>
          </div>
        </div>
      </div>

      {/* 3. TOP 3 PODIUM CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        {/* 2nd Place */}
        <Card className="flex flex-col items-center text-center p-5 relative">
          <div className="w-7 h-7 rounded-full bg-slate-500 text-white font-bold text-xs flex items-center justify-center absolute -top-3">2</div>
          <div className="w-13 h-13 rounded-full bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center text-slate-700 dark:text-[#F5F5F5] shadow-subtle mb-2">
            <User className="w-6 h-6 text-slate-600 dark:text-[#A1A1AA]" />
          </div>
          <h4 className="text-sm font-bold text-slate-dark dark:text-[#F5F5F5]">{top3[1].name}</h4>
          <div className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 my-1">+{top3[1].returnPct}%</div>
          <div className="text-xs font-mono font-bold text-slate-600 dark:text-[#A1A1AA]">{formatCurrency(top3[1].portfolioValue)}</div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A] mt-1">Win Rate: {top3[1].winRate}</div>
        </Card>

        {/* 1st Place */}
        <Card className="flex flex-col items-center text-center p-6 bg-gradient-to-b from-lime-50 to-white dark:from-[#28282B] dark:to-[#1E1E21] border-lime dark:border-lime/80 shadow-lime dark:shadow-dark-card relative -translate-y-2">
          <div className="w-8 h-8 rounded-full bg-amber-500 text-white font-extrabold text-xs flex items-center justify-center absolute -top-4 shadow-sm">
            <Crown className="w-4 h-4" />
          </div>
          <div className="w-16 h-16 rounded-full bg-lime-100 dark:bg-lime/10 border-2 border-lime flex items-center justify-center text-slate-900 dark:text-lime shadow-subtle mb-2">
            <User className="w-7 h-7 text-slate-800 dark:text-lime" />
          </div>
          <h4 className="text-base font-extrabold text-slate-dark dark:text-[#F5F5F5]">{top3[0].name}</h4>
          <div className="text-2xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 my-1">+{top3[0].returnPct}%</div>
          <div className="text-xs font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(top3[0].portfolioValue)}</div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A] mt-1">Win Rate: {top3[0].winRate} • {top3[0].trades} Trades</div>
        </Card>

        {/* 3rd Place */}
        <Card className="flex flex-col items-center text-center p-5 relative">
          <div className="w-7 h-7 rounded-full bg-amber-700 text-white font-bold text-xs flex items-center justify-center absolute -top-3">3</div>
          <div className="w-13 h-13 rounded-full bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center text-slate-700 dark:text-[#F5F5F5] shadow-subtle mb-2">
            <User className="w-6 h-6 text-slate-600 dark:text-[#A1A1AA]" />
          </div>
          <h4 className="text-sm font-bold text-slate-dark dark:text-[#F5F5F5]">{top3[2].name}</h4>
          <div className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 my-1">+{top3[2].returnPct}%</div>
          <div className="text-xs font-mono font-bold text-slate-600 dark:text-[#A1A1AA]">{formatCurrency(top3[2].portfolioValue)}</div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A] mt-1">Win Rate: {top3[2].winRate}</div>
        </Card>
      </div>

      {/* 4. FULL RANKINGS TABLE */}
      <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[11px] font-bold tracking-wider select-none">
                <th className="py-3 px-4 w-16">Rank</th>
                <th className="py-3 px-4">Trader Nickname</th>
                <th className="py-3 px-4">Portfolio Value</th>
                <th className="py-3 px-4">Total Return</th>
                <th className="py-3 px-4">Simulated P&L</th>
                <th className="py-3 px-4">Trades</th>
                <th className="py-3 px-4 text-right">Win Rate</th>
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
                    <td className="py-3.5 px-4 font-mono font-extrabold text-sm text-slate-dark dark:text-[#F5F5F5]">#{u.rank}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA] shrink-0">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">{u.name}</span>
                        {isYou && <Badge variant="lime" size="sm">You</Badge>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(u.portfolioValue)}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-600 dark:text-emerald-400">+{u.returnPct}%</td>
                    <td className="py-3.5 px-4 font-mono text-emerald-600 dark:text-emerald-400">+{formatCurrency(u.pnl)}</td>
                    <td className="py-3.5 px-4 font-mono text-slate-600 dark:text-[#A1A1AA]">{u.trades}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{u.winRate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

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
