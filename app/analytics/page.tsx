'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Target,
  ShieldCheck,
  Zap,
  Sparkles,
  PieChart,
  ArrowLeftRight,
  TrendingDown,
  Activity,
  Layers,
  Info,
  DollarSign,
  Briefcase,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/Tabs';
import { AllocationDonut, Slice } from '@/components/charts/AllocationDonut';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency, formatPercent } from '@/lib/utils';

const COLOR_PALETTE = [
  '#B8F500',
  '#38BDF8',
  '#34D399',
  '#FBBF24',
  '#A78BFA',
  '#F87171',
  '#2DD4BF',
  '#94A3B8',
];

export default function AnalyticsPage() {
  const { data: portfolio } = usePortfolio();
  const [activeTab, setActiveTab] = useState<'holdings' | 'allocation' | 'activity'>('holdings');

  const totalValue = portfolio?.totalPortfolioValue ?? 10000.00;
  const startingCapital = portfolio?.startingCapital ?? 10000.00;
  const totalInvested = portfolio?.totalHoldingsValue ?? 0.00;
  const cashVal = portfolio?.cashBalance ?? 10000.00;
  const totalPnl = portfolio?.totalPnl ?? 0.00;
  const totalReturnPct = portfolio?.totalReturnPct ?? 0.00;
  const dailyGainDollar = portfolio?.dailyGainDollar ?? 0.00;
  const dailyGainPct = portfolio?.dailyGainPct ?? 0.00;

  const holdings = portfolio?.holdings ?? [];
  const transactions = portfolio?.transactions ?? [];

  const isOverallPositive = totalPnl >= 0;
  const isDailyPositive = dailyGainDollar >= 0;

  const cashPct = totalValue > 0 ? (cashVal / totalValue) * 100 : 100;
  const investedPct = totalValue > 0 ? (totalInvested / totalValue) * 100 : 0;

  // Real Allocation Slices from actual database holdings
  const allocationSlices: Slice[] = [
    {
      label: 'Cash (Buying Power)',
      value: cashPct,
      color: '#B8F500',
    },
    ...holdings.map((h, i) => {
      const ticker = h.asset?.ticker || h.asset?.symbol || 'STOCK';
      const weight = totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0;
      return {
        label: `${ticker} (${h.shares} sh)`,
        value: weight,
        color: COLOR_PALETTE[(i + 1) % COLOR_PALETTE.length],
      };
    }),
  ];

  // Performance calculations from actual positions
  const winningPositions = holdings.filter((h) => h.unrealizedPnl > 0);
  const losingPositions = holdings.filter((h) => h.unrealizedPnl < 0);
  const neutralPositions = holdings.filter((h) => h.unrealizedPnl === 0);

  const sortedByPerf = [...holdings].sort((a, b) => b.unrealizedPnlPct - a.unrealizedPnlPct);
  const bestPerforming = sortedByPerf.length > 0 ? sortedByPerf[0] : null;
  const worstPerforming = sortedByPerf.length > 0 ? sortedByPerf[sortedByPerf.length - 1] : null;

  // Largest single holding for concentration risk
  const sortedByValue = [...holdings].sort((a, b) => b.marketValue - a.marketValue);
  const largestHolding = sortedByValue.length > 0 ? sortedByValue[0] : null;
  const largestWeight = largestHolding && totalValue > 0 ? (largestHolding.marketValue / totalValue) * 100 : 0;

  // Transaction activity stats
  const buyTrades = transactions.filter((t) => t.type === 'BUY');
  const sellTrades = transactions.filter((t) => t.type === 'SELL');
  const realizedPnlTotal = transactions.reduce((sum, t) => sum + (t.realized_pnl ? Number(t.realized_pnl) : 0), 0);

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* 1. PAGE HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              Portfolio Analytics
            </h1>
            <Badge variant="lime" size="sm">
              Live Database Metrics
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Real-time quantitative performance, holding breakdown, and educational risk analytics for your simulated account.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link href="/trade">
            <Button variant="lime" size="sm">
              <ArrowLeftRight className="w-4 h-4" />
              <span>New Trade</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. OVERVIEW METRICS GRID (ALL FROM REAL DB STATE) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Net Worth Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Portfolio Value</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-muted dark:text-[#71717A]">
            <span>Starting:</span>
            <span className="font-mono font-bold text-slate-700 dark:text-[#A1A1AA]">{formatCurrency(startingCapital)}</span>
          </div>
        </Card>

        {/* Total Return & P&L Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Total Return / P&L</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className={`text-2xl font-extrabold font-mono tracking-tight ${isOverallPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalReturnPct >= 0 ? '+' : ''}{formatPercent(totalReturnPct)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant={isOverallPositive ? 'up' : 'down'} size="sm">
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)}
            </Badge>
            <span className="text-[11px] text-slate-muted dark:text-[#71717A]">unrealized + cash</span>
          </div>
        </Card>

        {/* Available Cash / Buying Power Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Available Cash</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-lime-900 dark:text-lime tracking-tight">
              {formatCurrency(cashVal)}
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Badge variant="lime" size="sm">{cashPct.toFixed(1)}% Cash</Badge>
            <span className="text-[11px] text-slate-muted dark:text-[#71717A]">{investedPct.toFixed(1)}% Invested</span>
          </div>
        </Card>

        {/* Positions & Win Rate Card */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Active Positions</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <Target className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {holdings.length} {holdings.length === 1 ? 'Holding' : 'Holdings'}
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold font-mono">+{winningPositions.length} Up</span>
            <span className="text-slate-300 dark:text-[#71717A]">•</span>
            <span className="text-red-600 dark:text-red-400 font-bold font-mono">-{losingPositions.length} Down</span>
          </div>
        </Card>
      </div>

      {/* 3. CONDITIONAL RENDER: EMPTY STATE OR FULL REAL ANALYTICS */}
      {holdings.length === 0 ? (
        <Card className="text-center py-16 px-6">
          <div className="w-14 h-14 rounded-2xl bg-lime-50 dark:bg-lime/10 border border-lime-200 dark:border-lime/30 text-slate-dark dark:text-[#F5F5F5] flex items-center justify-center mx-auto mb-4 shadow-sm">
            <PieChart className="w-7 h-7 text-lime-900 dark:text-lime" />
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-dark dark:text-[#F5F5F5]">
            Your portfolio analysis will appear here once you make your first trade.
          </h2>
          <p className="text-xs sm:text-sm text-slate-muted dark:text-[#A1A1AA] mt-1.5 max-w-md mx-auto leading-relaxed">
            Execute simulated BUY orders on real US equities in the Markets directory to unlock live asset allocation, position analysis, and educational risk analytics.
          </p>
          <div className="flex items-center justify-center gap-3 mt-6">
            <Link href="/markets">
              <Button variant="lime" size="md">
                Explore Markets
              </Button>
            </Link>
            <Link href="/trade">
              <Button variant="outline" size="md">
                Open Trade Terminal
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* 4. HOLDINGS ANALYSIS TABLE ("Your Holdings") */}
          <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
            <CardHeader className="p-4 sm:p-5 pb-3">
              <div>
                <CardTitle>Your Holdings</CardTitle>
                <CardSubtitle>Detailed breakdown of your current simulated equity positions</CardSubtitle>
              </div>
            </CardHeader>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] font-bold tracking-wider select-none">
                    <th className="py-3 px-2.5 sm:px-4">Instrument</th>
                    <th className="py-3 px-2.5 sm:px-4 text-right">Shares</th>
                    <th className="py-3 px-2.5 sm:px-4 text-right hidden md:table-cell">Avg Cost</th>
                    <th className="py-3 px-2.5 sm:px-4 text-right">Current Price</th>
                    <th className="py-3 px-2.5 sm:px-4 text-right hidden sm:table-cell">Market Value</th>
                    <th className="py-3 px-2.5 sm:px-4 text-right">Unrealized P&L</th>
                    <th className="py-3 px-2.5 sm:px-4 text-right hidden sm:table-cell">Portfolio %</th>
                    <th className="py-3 px-2.5 sm:px-4 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
                  {holdings.map((h) => {
                    const ticker = h.asset?.ticker || h.asset?.symbol || 'STOCK';
                    const name = h.asset?.name || ticker;
                    const isPos = h.unrealizedPnl >= 0;
                    const weight = totalValue > 0 ? (h.marketValue / totalValue) * 100 : 0;

                    return (
                      <tr key={h.id} className="hover:bg-slate-50/80 dark:hover:bg-[#323236] transition-colors">
                        <td className="py-3.5 px-2.5 sm:px-4">
                          <Link href={`/markets/${ticker}`} className="flex items-center gap-2 sm:gap-3">
                            <CompanyLogo ticker={ticker} name={name} size="sm" />
                            <div className="min-w-0">
                              <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm group-hover:text-lime-900 dark:group-hover:text-lime transition-colors">{ticker}</div>
                              <div className="text-[10px] sm:text-[11px] text-slate-muted dark:text-[#71717A] truncate max-w-[100px] sm:max-w-[180px]">{name}</div>
                            </div>
                          </Link>
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm">
                          {h.shares}
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono text-slate-600 dark:text-[#A1A1AA] hidden md:table-cell">
                          {formatCurrency(h.average_buy_price)}
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm">
                          {formatCurrency(h.currentPrice)}
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm hidden sm:table-cell">
                          {formatCurrency(h.marketValue)}
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-right">
                          <Badge variant={isPos ? 'up' : 'down'} size="sm">
                            {isPos ? '+' : ''}{formatCurrency(h.unrealizedPnl)} <span className="hidden sm:inline">({formatPercent(h.unrealizedPnlPct)})</span>
                          </Badge>
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-right font-mono font-bold text-slate-700 dark:text-[#A1A1AA] hidden sm:table-cell">
                          {weight.toFixed(1)}%
                        </td>
                        <td className="py-3.5 px-2.5 sm:px-4 text-center">
                          <Link href={`/trade?symbol=${ticker}&type=SELL`}>
                            <Button variant="outline" size="xs">
                              Trade
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* 5. ALLOCATION & PERFORMANCE SPLIT */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Portfolio Allocation Card */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Portfolio Allocation</CardTitle>
                  <CardSubtitle>Capital distribution across your active holdings and cash reserve</CardSubtitle>
                </div>
              </CardHeader>

              <div className="py-2">
                <AllocationDonut totalValue={totalValue} slices={allocationSlices} size={180} />
              </div>
            </Card>

            {/* Performance & Holding Insights */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Performance Insights</CardTitle>
                  <CardSubtitle>Relative performance metrics across your open positions</CardSubtitle>
                </div>
              </CardHeader>

              <div className="flex flex-col gap-4 text-xs">
                {bestPerforming && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        ticker={bestPerforming.asset?.ticker || bestPerforming.asset?.symbol}
                        name={bestPerforming.asset?.name}
                        size="sm"
                      />
                      <div>
                        <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5]">
                          Best Performer: {bestPerforming.asset?.ticker || bestPerforming.asset?.symbol}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#71717A]">
                          {bestPerforming.shares} shares @ avg {formatCurrency(bestPerforming.average_buy_price)}
                        </div>
                      </div>
                    </div>
                    <Badge variant="up" size="md">
                      +{formatPercent(bestPerforming.unrealizedPnlPct)}
                    </Badge>
                  </div>
                )}

                {worstPerforming && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D]">
                    <div className="flex items-center gap-3">
                      <CompanyLogo
                        ticker={worstPerforming.asset?.ticker || worstPerforming.asset?.symbol}
                        name={worstPerforming.asset?.name}
                        size="sm"
                      />
                      <div>
                        <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5]">
                          Lowest Performer: {worstPerforming.asset?.ticker || worstPerforming.asset?.symbol}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-[#71717A]">
                          {worstPerforming.shares} shares @ avg {formatCurrency(worstPerforming.average_buy_price)}
                        </div>
                      </div>
                    </div>
                    <Badge variant={worstPerforming.unrealizedPnl >= 0 ? 'up' : 'down'} size="md">
                      {worstPerforming.unrealizedPnl >= 0 ? '+' : ''}{formatPercent(worstPerforming.unrealizedPnlPct)}
                    </Badge>
                  </div>
                )}

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-border dark:border-[#3A3A3D]">
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                    <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">Winning</div>
                    <div className="text-sm font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{winningPositions.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                    <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">Losing</div>
                    <div className="text-sm font-extrabold font-mono text-red-600 dark:text-red-400 mt-0.5">{losingPositions.length}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                    <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">Neutral</div>
                    <div className="text-sm font-extrabold font-mono text-slate-600 dark:text-[#A1A1AA] mt-0.5">{neutralPositions.length}</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* 6. EDUCATIONAL RISK & CONCENTRATION ANALYSIS */}
          <Card>
            <CardHeader>
              <div>
                <CardTitle className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Educational Risk & Diversification Analysis</span>
                </CardTitle>
                <CardSubtitle>Learn how your asset allocation and concentration impact portfolio volatility</CardSubtitle>
              </div>
            </CardHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-[#71717A] uppercase">Top Holding Concentration</span>
                <div className="my-2">
                  <span className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
                    {largestWeight.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-[#A1A1AA]">
                  {largestHolding ? `Allocated in ${largestHolding.asset?.ticker || largestHolding.asset?.symbol}` : 'No holdings'}
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-[#71717A] uppercase">Diversification Level</span>
                <div className="my-2">
                  <span className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
                    {holdings.length <= 1 ? 'High Risk' : holdings.length <= 3 ? 'Moderate' : 'Diversified'}
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-[#A1A1AA]">
                  {holdings.length} distinct instruments held
                </span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] flex flex-col justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-[#71717A] uppercase">Cash Buffer</span>
                <div className="my-2">
                  <span className="text-2xl font-extrabold font-mono text-lime-900 dark:text-lime">
                    {cashPct.toFixed(1)}%
                  </span>
                </div>
                <span className="text-xs text-slate-600 dark:text-[#A1A1AA]">
                  {formatCurrency(cashVal)} available for deployment
                </span>
              </div>
            </div>

            {/* Educational takeaway message */}
            <div className="p-4 rounded-xl bg-lime-50/70 dark:bg-lime/10 border border-lime-300 dark:border-lime/30 text-xs text-slate-800 dark:text-[#F5F5F5] leading-relaxed flex items-start gap-2.5">
              <Info className="w-4 h-4 text-lime-900 dark:text-lime shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-900 dark:text-[#F5F5F5] block mb-0.5">Educational Investor Tip:</span>
                {largestWeight > 50 ? (
                  <span>
                    Your portfolio is concentrated in your top holding (<strong>{largestWeight.toFixed(1)}%</strong>). In real investing, heavy concentration in a single stock exposes your capital to company-specific news and quarterly earnings volatility. Consider exploring index ETFs or complementary industry sectors to learn about risk diversification.
                  </span>
                ) : cashPct > 70 ? (
                  <span>
                    You maintain a large cash reserve (<strong>{cashPct.toFixed(1)}%</strong>). While cash eliminates downside market volatility, simulated investing is a great environment to practice dollar-cost averaging and position sizing across market leaders.
                  </span>
                ) : (
                  <span>
                    Your portfolio demonstrates a healthy balance across active positions and cash reserves. Maintaining structured position sizes helps smooth out market drawdowns.
                  </span>
                )}
              </div>
            </div>
          </Card>

          {/* 7. TRANSACTION ACTIVITY ANALYSIS */}
          {transactions.length > 0 && (
            <Card>
              <CardHeader>
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
                    <span>Transaction Activity & Ledger History</span>
                  </CardTitle>
                  <CardSubtitle>Summary of executed simulated orders from your database ledger</CardSubtitle>
                </div>
              </CardHeader>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">Total Orders</div>
                  <div className="text-lg font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] mt-0.5">{transactions.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">BUY Orders</div>
                  <div className="text-lg font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-0.5">{buyTrades.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">SELL Orders</div>
                  <div className="text-lg font-extrabold font-mono text-red-600 dark:text-red-400 mt-0.5">{sellTrades.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] text-center">
                  <div className="text-[10px] text-slate-500 dark:text-[#71717A] font-bold uppercase">Realized P&L</div>
                  <div className={`text-lg font-extrabold font-mono mt-0.5 ${realizedPnlTotal >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {realizedPnlTotal >= 0 ? '+' : ''}{formatCurrency(realizedPnlTotal)}
                  </div>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
