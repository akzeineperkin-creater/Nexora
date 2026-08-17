'use client';

import React from 'react';
import Link from 'next/link';
import {
  Wallet,
  Activity,
  DollarSign,
  Trophy,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  PlusCircle,
  Clock,
  Star,
  Layers,
  ArrowLeftRight,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { GlassCard, GlassCardHeader, GlassCardTitle, GlassCardSubtitle } from '@/components/ui/GlassCard';
import { GlassButton } from '@/components/ui/GlassButton';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { Skeleton, SkeletonCard, SkeletonTableRow } from '@/components/ui/Skeleton';
import { PerformanceChart } from '@/components/charts/PerformanceChart';
import { Sparkline } from '@/components/charts/Sparkline';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAssets } from '@/hooks/useAssets';
import { useWatchlist } from '@/hooks/useWatchlist';
import { useAuth } from '@/providers/AuthProvider';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const { data: portfolio, isLoading: isPortfolioLoading } = usePortfolio();
  const { data: assets, isLoading: isAssetsLoading } = useAssets();
  const { data: watchlist, isLoading: isWatchlistLoading } = useWatchlist();

  const totalValue = portfolio?.totalPortfolioValue ?? 10000.00;
  const totalPnl = portfolio?.totalPnl ?? 0;
  const totalReturnPct = portfolio?.totalReturnPct ?? 0;
  const dailyPnlDollar = portfolio?.dailyGainDollar ?? 0;
  const dailyPnlPct = portfolio?.dailyGainPct ?? 0;
  const cashBalance = portfolio?.cashBalance ?? 10000.00;
  const isPositive = totalPnl >= 0;

  const holdings = portfolio?.holdings || [];
  const transactions = portfolio?.transactions || [];

  // Top gainers from real Supabase assets table
  const marketMovers = assets ? [...assets].sort((a, b) => b.day_change_pct - a.day_change_pct).slice(0, 4) : [];

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* 1. WELCOME HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              Dashboard
            </h1>
            <Badge variant="lime" size="sm" className="hidden sm:inline-flex">
              Live Simulation
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Welcome back, <span className="font-bold text-slate-dark dark:text-[#F5F5F5]">{profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader'}</span>. Here is your real-time virtual capital performance.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/trade">
            <GlassButton variant="lime" size="sm">
              <PlusCircle className="w-4 h-4" />
              <span>Quick Trade</span>
            </GlassButton>
          </Link>
          <Link href="/analytics">
            <GlassButton variant="glass" size="sm">
              <span>View Analytics →</span>
            </GlassButton>
          </Link>
        </div>
      </div>

      {/* 2. PORTFOLIO OVERVIEW: 4 TOP FINTECH METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        {isPortfolioLoading ? (
          <SkeletonCard />
        ) : (
          <GlassCard className="flex flex-col justify-between" variant="glass">
            <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
              <Tooltip content="Total virtual equity combining cash and live asset holdings">
                <span className="cursor-help border-b border-dotted border-slate-300 dark:border-[#3A3A3D]">Portfolio Value</span>
              </Tooltip>
              <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
                <Wallet className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
                {formatCurrency(totalValue)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={isPositive ? 'up' : 'down'} size="sm">
                <TrendingUp className="w-3 h-3" />
                <span>{formatPercent(totalReturnPct)} All Time</span>
              </Badge>
              <span className="text-[11px] text-slate-muted dark:text-[#71717A] font-mono">
                {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
              </span>
            </div>
          </GlassCard>
        )}

        {/* Today's P&L */}
        {isPortfolioLoading ? (
          <SkeletonCard />
        ) : (
          <GlassCard className="flex flex-col justify-between" variant="glass">
            <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
              <Tooltip content="24-hour gain/loss calculated from your open market positions">
                <span className="cursor-help border-b border-dotted border-slate-300 dark:border-[#3A3A3D]">Today&apos;s P&L</span>
              </Tooltip>
              <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
                <Activity className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className={`text-2xl font-extrabold font-mono tracking-tight ${dailyPnlDollar >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                {dailyPnlDollar >= 0 ? '+' : ''}{formatCurrency(dailyPnlDollar)}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={dailyPnlDollar >= 0 ? 'up' : 'down'} size="sm">
                {dailyPnlDollar >= 0 ? '+' : ''}{dailyPnlPct.toFixed(2)}% Today
              </Badge>
              <span className="text-[11px] text-slate-muted dark:text-[#71717A]">Database sync</span>
            </div>
          </GlassCard>
        )}

        {/* Buying Power / Cash Balance */}
        {isPortfolioLoading ? (
          <SkeletonCard />
        ) : (
          <GlassCard className="flex flex-col justify-between" variant="glass">
            <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
              <Tooltip content="Available simulated virtual capital ready for order execution">
                <span className="cursor-help border-b border-dotted border-slate-300 dark:border-[#3A3A3D]">Buying Power</span>
              </Tooltip>
              <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
                <DollarSign className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="my-2">
              <div className="text-2xl font-extrabold font-mono text-lime-900 dark:text-lime tracking-tight">
                {formatCurrency(cashBalance)}
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-[#A1A1AA]">
              <span>Zero-risk sandbox balance</span>
            </div>
          </GlassCard>
        )}

        {/* Tournament Rank */}
        <GlassCard className="flex flex-col justify-between" variant="glass">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Global Standing</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <Trophy className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              #14
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="lime" size="sm">Top 2.5%</Badge>
            <span className="text-[11px] text-slate-muted dark:text-[#71717A]">2,840 traders</span>
          </div>
        </GlassCard>
      </div>

      {/* 3. MAIN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* LEFT 2 COLUMNS: Performance Chart, Active Holdings, Recent Transactions */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* INTERACTIVE PERFORMANCE CHART CARD */}
          <GlassCard className="p-6">
            <PerformanceChart baseValue={totalValue} />
          </GlassCard>

          {/* ACTIVE HOLDINGS TABLE */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between">
              <div>
                <GlassCardTitle>Current Holdings ({holdings.length})</GlassCardTitle>
                <GlassCardSubtitle>Real-time valuation synchronized against live feeds</GlassCardSubtitle>
              </div>
              <Link href="/portfolio">
                <GlassButton variant="outline" size="xs">View All Positions →</GlassButton>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[11px] font-bold tracking-wider select-none">
                    <th className="py-3 px-4">Asset</th>
                    <th className="py-3 px-4">Shares</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Market Value</th>
                    <th className="py-3 px-4">Unrealized P&L</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
                  {isPortfolioLoading ? (
                    <>
                      <SkeletonTableRow />
                      <SkeletonTableRow />
                    </>
                  ) : holdings.length > 0 ? (
                    holdings.slice(0, 4).map((h: any) => {
                      const ticker = h.asset?.ticker || h.ticker || 'ASSET';
                      const name = h.asset?.name || h.name || '';
                      return (
                        <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-[#323236] transition-colors">
                          <td className="py-3.5 px-4">
                            <Link href={`/markets/${ticker}`} className="flex items-center gap-3">
                              <CompanyLogo ticker={ticker} name={name} size="sm" />
                              <div>
                                <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5]">{ticker}</div>
                                <div className="text-[11px] text-slate-muted dark:text-[#71717A]">{name}</div>
                              </div>
                            </Link>
                          </td>
                          <td className="py-3.5 px-4 font-mono font-semibold text-slate-dark dark:text-[#F5F5F5]">{h.shares}</td>
                          <td className="py-3.5 px-4 font-mono text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(h.currentPrice)}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(h.marketValue)}</td>
                          <td className="py-3.5 px-4">
                            <Badge variant={h.isPositive ? 'up' : 'down'} size="sm">
                              {h.isPositive ? '+' : ''}{formatCurrency(h.unrealizedPnl)} ({formatPercent(h.unrealizedPnlPct)})
                            </Badge>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <Link href={`/trade?ticker=${ticker}`}>
                              <GlassButton variant="glass-dark" size="xs">Trade</GlassButton>
                            </Link>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={6} className="text-center py-10 text-slate-muted dark:text-[#71717A]">
                        <div className="flex flex-col items-center gap-2">
                          <Layers className="w-8 h-8 text-slate-300 dark:text-[#3A3A3D]" />
                          <span className="font-semibold text-xs text-slate-600 dark:text-[#A1A1AA]">No open positions yet.</span>
                          <span className="text-[11px] text-slate-400 dark:text-[#71717A]">Execute your first simulated BUY order using your $10,000.00 virtual cash.</span>
                          <Link href="/trade" className="mt-2">
                            <GlassButton variant="lime" size="xs">
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Explore & Trade</span>
                            </GlassButton>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>

          {/* Recent Transactions Ledger */}
          <GlassCard className="p-0 overflow-hidden">
            <div className="p-5 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between">
              <div>
                <GlassCardTitle>Recent Orders ({transactions.length})</GlassCardTitle>
                <GlassCardSubtitle>Executed via PostgreSQL execute_trade() RPC</GlassCardSubtitle>
              </div>
              <Link href="/portfolio">
                <GlassButton variant="outline" size="xs">View Ledger →</GlassButton>
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50/80 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[11px] font-bold tracking-wider">
                    <th className="py-3 px-4">Order ID</th>
                    <th className="py-3 px-4">Instrument</th>
                    <th className="py-3 px-4">Side</th>
                    <th className="py-3 px-4">Quantity</th>
                    <th className="py-3 px-4">Price</th>
                    <th className="py-3 px-4">Total Amount</th>
                    <th className="py-3 px-4 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
                  {transactions.length > 0 ? (
                    transactions.slice(0, 4).map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-[#323236] transition-colors">
                        <td className="py-3 px-4 font-mono text-slate-400 dark:text-[#71717A] text-[11px]">
                          {tx.id.slice(0, 8)}...
                        </td>
                        <td className="py-3 px-4 font-extrabold text-slate-dark dark:text-[#F5F5F5]">
                          {tx.asset?.ticker || 'ASSET'}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={tx.type === 'BUY' ? 'lime' : 'down'} size="sm">
                            {tx.type}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold text-slate-dark dark:text-[#F5F5F5]">{tx.shares}</td>
                        <td className="py-3 px-4 font-mono text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(tx.price_per_share)}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(tx.total_amount)}</td>
                        <td className="py-3 px-4 text-right font-mono text-slate-muted dark:text-[#71717A] text-[11px]">
                          {formatDate(tx.created_at)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="text-center py-6 text-slate-muted dark:text-[#71717A] text-xs">
                        No transactions recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </GlassCard>
        </div>

        {/* RIGHT COLUMN: Tournament Banner, Movers, Watchlist */}
        <div className="flex flex-col gap-6">
          {/* TOURNAMENT HERO CARD */}
          <div className="bg-gradient-to-br from-[#1E1E21] via-[#28282B] to-[#1E1E21] border border-[#3A3A3D] text-white rounded-card-lg p-5 relative overflow-hidden shadow-dark-card">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime/10 rounded-full blur-2xl pointer-events-none" />
            <Badge variant="lime" size="sm" className="mb-3">Tournament</Badge>
            <h3 className="text-lg font-extrabold text-white leading-snug">Alpha Trader Summer Cup</h3>
            <p className="text-xs text-zinc-300 dark:text-[#A1A1AA] mt-1">
              All 2,840 participants started with equal $10,000.00 capital.
            </p>

            <div className="flex items-center justify-between my-4 py-3 border-y border-white/10 dark:border-[#3A3A3D] font-mono text-xs">
              <div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Your Rank</div>
                <div className="text-base font-extrabold text-lime mt-0.5">#14</div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Total Return</div>
                <div className="text-base font-extrabold text-lime mt-0.5">
                  {totalReturnPct >= 0 ? '+' : ''}{totalReturnPct.toFixed(2)}%
                </div>
              </div>
              <div>
                <div className="text-[10px] text-zinc-400 dark:text-[#71717A] uppercase">Time Left</div>
                <div className="text-base font-extrabold text-white mt-0.5">14 Days</div>
              </div>
            </div>

            <Link href="/leaderboard" className="w-full block">
              <GlassButton variant="lime" size="sm" fullWidth>
                <Trophy className="w-3.5 h-3.5" />
                <span>View Full Leaderboard</span>
              </GlassButton>
            </Link>
          </div>

          {/* TOP 24H MARKET MOVERS */}
          <GlassCard>
            <GlassCardHeader className="mb-3">
              <GlassCardTitle className="text-sm">
                <Zap className="w-4 h-4 text-amber-500" />
                <span>Market Movers (24h)</span>
              </GlassCardTitle>
              <Link href="/markets" className="text-xs font-bold text-slate-muted dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] transition-colors">
                Markets →
              </Link>
            </GlassCardHeader>

            <div className="grid grid-cols-2 gap-2.5">
              {marketMovers.map((m) => (
                <Link
                  key={m.id}
                  href={`/markets/${m.ticker}`}
                  className="p-2.5 rounded-xl border border-slate-border dark:border-[#3A3A3D] hover:border-slate-300 dark:hover:border-[#4A4A4E] hover:bg-slate-50 dark:hover:bg-[#323236] transition-all group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] group-hover:text-lime-900 dark:group-hover:text-lime">{m.ticker}</span>
                    <Badge variant={m.day_change_pct >= 0 ? 'up' : 'down'} size="sm">
                      +{m.day_change_pct}%
                    </Badge>
                  </div>
                  <div className="text-sm font-bold font-mono text-slate-dark dark:text-[#F5F5F5] mt-1">
                    {formatCurrency(m.current_price)}
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>

          {/* WATCHLIST PREVIEW */}
          <GlassCard>
            <GlassCardHeader className="mb-3">
              <GlassCardTitle className="text-sm">
                <Star className="w-4 h-4 text-amber-500" />
                <span>Starred Watchlist</span>
              </GlassCardTitle>
              <Link href="/watchlist" className="text-xs font-bold text-slate-muted dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] transition-colors">
                Watchlist →
              </Link>
            </GlassCardHeader>

            <div className="flex flex-col gap-2 divide-y divide-slate-100 dark:divide-[#3A3A3D]">
              {watchlist && watchlist.length > 0 ? (
                watchlist.slice(0, 4).map((w) => {
                  const asset = w.asset;
                  if (!asset) return null;
                  const isUp = asset.day_change >= 0;
                  return (
                    <div key={w.id} className="pt-2 first:pt-0 flex items-center justify-between">
                      <Link href={`/markets/${asset.ticker}`} className="flex items-center gap-2 group">
                        <span className="font-extrabold text-xs text-slate-dark dark:text-[#F5F5F5] group-hover:text-lime-900 dark:group-hover:text-lime">{asset.ticker}</span>
                        <span className="text-[11px] text-slate-muted dark:text-[#71717A] font-mono">{formatCurrency(asset.current_price)}</span>
                      </Link>
                      <div className="flex items-center gap-2">
                        <Badge variant={isUp ? 'up' : 'down'} size="sm">
                          {isUp ? '+' : ''}{asset.day_change_pct}%
                        </Badge>
                        <Link href={`/trade?ticker=${asset.ticker}`}>
                          <GlassButton variant="outline" size="xs">Trade</GlassButton>
                        </Link>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-slate-muted dark:text-[#71717A]">
                  No starred instruments yet.
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
