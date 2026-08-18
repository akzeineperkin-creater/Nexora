'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  PieChart,
  Wallet,
  DollarSign,
  Layers,
  Activity,
  Download,
  PlusCircle,
  Clock,
  ArrowLeftRight,
  ArrowRight,
  History,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SkeletonTableRow } from '@/components/ui/Skeleton';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { Sparkline } from '@/components/charts/Sparkline';
import { AssetPriceChart } from '@/components/charts/AssetPriceChart';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAssetHistory } from '@/hooks/useAssets';
import { formatCurrency, formatPercent, formatDate } from '@/lib/utils';
import { Timeframe } from '@/lib/market-data/types';

export default function PortfolioPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const [selectedHoldingTicker, setSelectedHoldingTicker] = useState<string | null>(null);
  const [holdingTimeframe, setHoldingTimeframe] = useState<Timeframe>('1M');

  const totalValue = portfolio?.totalPortfolioValue ?? 10000.00;
  const cashBalance = portfolio?.cashBalance ?? 10000.00;
  const startingCapital = portfolio?.startingCapital ?? 10000.00;
  const totalInvested = portfolio?.totalHoldingsValue ?? 0;
  const totalPnl = portfolio?.totalPnl ?? 0;
  const totalReturnPct = portfolio?.totalReturnPct ?? 0;
  const totalRealizedPnl = portfolio?.totalRealizedPnl ?? 0;
  const totalUnrealizedPnl = portfolio?.totalUnrealizedPnl ?? 0;
  const dailyGainDollar = portfolio?.dailyGainDollar ?? 0;
  const dailyGainPct = portfolio?.dailyGainPct ?? 0;

  const holdings = portfolio?.holdings ?? [];
  const transactions = portfolio?.transactions ?? [];

  // Selected holding for detailed interactive performance chart
  const activeSelectedHolding = holdings.find(
    (h: any) => h.ticker?.toUpperCase() === selectedHoldingTicker?.toUpperCase()
  );

  const { data: selectedHistoryPoints } = useAssetHistory(
    selectedHoldingTicker || '',
    holdingTimeframe
  );

  const timeframes: { id: Timeframe; label: string }[] = [
    { id: '1D', label: '1D' },
    { id: '5D', label: '5D' },
    { id: '1M', label: '1M' },
    { id: '3M', label: '3M' },
    { id: 'YTD', label: 'YTD' },
    { id: '1Y', label: '1Y' },
  ];

  const handleExportCSV = () => {
    const headers = ['Order ID', 'Ticker', 'Type', 'Shares', 'Price', 'Total', 'Status', 'Date'];
    const rows = transactions.map((t) => [
      t.id,
      t.asset?.ticker || 'ASSET',
      t.type,
      t.shares,
      t.price_per_share,
      t.total_amount,
      t.status,
      t.created_at,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexra_transactions_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            Portfolio Overview
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Real-time simulated equity valuation, positions, and performance accounting.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/history">
            <Button variant="outline" size="sm">
              <History className="w-4 h-4 mr-1.5" />
              <span>Trade Ledger</span>
            </Button>
          </Link>
          <Link href="/trade">
            <Button variant="lime" size="sm" className="font-extrabold shadow-lime">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>New Trade</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* METRIC CARDS (ALL 8 REQUIRED ACCOUNTING METRICS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Portfolio Value */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Total Portfolio Value</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {formatCurrency(totalValue)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={totalPnl >= 0 ? 'up' : 'down'} size="sm">
              {totalPnl >= 0 ? '+' : ''}{formatCurrency(totalPnl)} ({formatPercent(totalReturnPct)})
            </Badge>
          </div>
        </Card>

        {/* Current Cash (Buying Power) */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Available Cash</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-lime-900 dark:text-lime tracking-tight">
              {formatCurrency(cashBalance)}
            </div>
          </div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A] font-mono">
            {totalValue > 0 ? ((cashBalance / totalValue) * 100).toFixed(1) : '100.0'}% of net worth
          </div>
        </Card>

        {/* Holdings Value */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Holdings Value</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {formatCurrency(totalInvested)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="neutral" size="sm">{holdings.length} Active Positions</Badge>
          </div>
        </Card>

        {/* Starting Capital */}
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Starting Capital</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {formatCurrency(startingCapital)}
            </div>
          </div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A]">
            Initial virtual allocation
          </div>
        </Card>
      </div>

      {/* SECONDARY ACCOUNTING METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Realized P&L */}
        <Card className="py-3.5 px-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">Realized Net P&L</div>
            <div className={`text-lg font-extrabold font-mono mt-0.5 ${totalRealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalRealizedPnl >= 0 ? '+' : ''}{formatCurrency(totalRealizedPnl)}
            </div>
          </div>
          <Badge variant={totalRealizedPnl >= 0 ? 'up' : 'down'} size="sm">
            Closed Trades
          </Badge>
        </Card>

        {/* Unrealized P&L */}
        <Card className="py-3.5 px-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">Unrealized P&L</div>
            <div className={`text-lg font-extrabold font-mono mt-0.5 ${totalUnrealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {totalUnrealizedPnl >= 0 ? '+' : ''}{formatCurrency(totalUnrealizedPnl)}
            </div>
          </div>
          <Badge variant={totalUnrealizedPnl >= 0 ? 'up' : 'down'} size="sm">
            Open Positions
          </Badge>
        </Card>

        {/* Today's Gain */}
        <Card className="py-3.5 px-4 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">Today&apos;s Day Gain</div>
            <div className={`text-lg font-extrabold font-mono mt-0.5 ${dailyGainDollar >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
              {dailyGainDollar >= 0 ? '+' : ''}{formatCurrency(dailyGainDollar)} ({dailyGainPct >= 0 ? '+' : ''}{dailyGainPct.toFixed(2)}%)
            </div>
          </div>
          <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
            <Activity className="w-3.5 h-3.5" />
          </div>
        </Card>
      </div>

      {/* INTERACTIVE HOLDING PERFORMANCE INSPECTOR (IF SELECTED) */}
      {activeSelectedHolding && (
        <Card className="p-6 border-lime/50 dark:border-lime/30 bg-gradient-to-br from-white to-lime-50/20 dark:from-[#28282B] dark:to-[#28282B] shadow-md">
          <div className="flex items-center justify-between flex-wrap gap-4 pb-4 border-b border-slate-border dark:border-[#3A3A3D]">
            <div className="flex items-center gap-3.5">
              <CompanyLogo ticker={activeSelectedHolding.ticker} name={activeSelectedHolding.name} size="md" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-slate-dark dark:text-[#F5F5F5] tracking-tight">{activeSelectedHolding.ticker}</h3>
                  <Badge variant="lime" size="sm">Position Detail</Badge>
                </div>
                <div className="text-xs text-slate-500 dark:text-[#A1A1AA] font-semibold">{activeSelectedHolding.name}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Timeframe selector for position chart */}
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-[#1E1E21] p-1 rounded-full border border-slate-200 dark:border-[#3A3A3D]">
                {timeframes.map((tf) => (
                  <button
                    key={tf.id}
                    onClick={() => setHoldingTimeframe(tf.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-all cursor-pointer ${
                      holdingTimeframe === tf.id
                        ? 'bg-lime text-[#0F0B0A] shadow-sm'
                        : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                    }`}
                  >
                    {tf.label}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setSelectedHoldingTicker(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#323236]"
                aria-label="Close Inspector"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-5 items-center">
            <div className="lg:col-span-2">
              <AssetPriceChart
                data={selectedHistoryPoints}
                currentPrice={activeSelectedHolding.currentPrice}
                timeframe={holdingTimeframe}
                isPositive={activeSelectedHolding.isPositive}
                height={260}
              />
            </div>

            <div className="p-4 rounded-xl bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] shadow-subtle flex flex-col gap-3 text-xs">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-[#A1A1AA]">
                Position Summary
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#A1A1AA]">Shares Owned:</span>
                <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{activeSelectedHolding.shares}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#A1A1AA]">Average Cost Basis:</span>
                <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(activeSelectedHolding.average_buy_price)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#A1A1AA]">Current Market Price:</span>
                <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(activeSelectedHolding.currentPrice)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 dark:text-[#A1A1AA]">Position Market Value:</span>
                <span className="font-mono font-extrabold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(activeSelectedHolding.marketValue)}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-[#3A3A3D]">
                <span className="text-slate-500 dark:text-[#A1A1AA]">Unrealized P&L:</span>
                <span className={`font-mono font-extrabold ${activeSelectedHolding.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                  {activeSelectedHolding.isPositive ? '+' : ''}{formatCurrency(activeSelectedHolding.unrealizedPnl)} ({formatPercent(activeSelectedHolding.unrealizedPnlPct)})
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                <Link href={`/trade?ticker=${activeSelectedHolding.ticker}&type=BUY`}>
                  <Button variant="lime" size="sm" className="w-full justify-center">
                    Buy More
                  </Button>
                </Link>
                <Link href={`/trade?ticker=${activeSelectedHolding.ticker}&type=SELL`}>
                  <Button variant="outline" size="sm" className="w-full justify-center">
                    Sell
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* HOLDINGS TABLE */}
      <Card className="p-0 overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between">
          <div>
            <CardTitle>Holdings ({holdings.length})</CardTitle>
            <CardSubtitle>Current market prices, position values, and live P&L</CardSubtitle>
          </div>
          <Link href="/trade">
            <Button variant="lime" size="xs">
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Position</span>
            </Button>
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] font-bold tracking-wider select-none">
                <th className="py-3 px-2 sm:px-4">Asset</th>
                <th className="py-3 px-2 sm:px-4 text-right">Quantity</th>
                <th className="py-3 px-2 sm:px-4 text-right hidden md:table-cell">Avg Cost</th>
                <th className="py-3 px-2 sm:px-4 text-right">Current Price</th>
                <th className="py-3 px-2 sm:px-4 text-right hidden sm:table-cell">24H % Change</th>
                <th className="py-3 px-2 sm:px-4 text-right hidden md:table-cell">Market Value</th>
                <th className="py-3 px-2 sm:px-4 text-right hidden sm:table-cell">Unrealized P&L</th>
                <th className="py-3 px-2 sm:px-4 text-right">P&L %</th>
                <th className="py-3 px-2 sm:px-4 text-center hidden lg:table-cell">Trend Chart</th>
                <th className="py-3 px-2 sm:px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D]">
              {isLoading ? (
                <>
                  <SkeletonTableRow />
                  <SkeletonTableRow />
                </>
              ) : holdings.length > 0 ? (
                holdings.map((h: any) => {
                  const ticker = h.asset?.ticker || h.ticker || 'ASSET';
                  const name = h.asset?.name || h.name || '';
                  const dayChangePct = Number(h.dayChangePct ?? h.asset?.day_change_pct ?? 0);
                  const isDayChangePositive = dayChangePct >= 0;
                  const isSelected = selectedHoldingTicker?.toUpperCase() === ticker.toUpperCase();

                  return (
                    <tr
                      key={h.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-[#323236] transition-colors group ${
                        isSelected ? 'bg-lime-50/30 dark:bg-[#353539]' : ''
                      }`}
                    >
                      {/* Asset & Logo */}
                      <td className="py-3 px-2 sm:px-4">
                        <Link href={`/markets/${ticker}`} className="flex items-center gap-2 sm:gap-3">
                          <CompanyLogo ticker={ticker} name={name} size="sm" />
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5] text-xs sm:text-sm group-hover:text-lime-900 dark:group-hover:text-lime transition-colors">
                              {ticker}
                            </div>
                            <div className="text-[10px] sm:text-[11px] text-slate-muted dark:text-[#71717A] truncate max-w-[90px] sm:max-w-[160px]">{name}</div>
                          </div>
                        </Link>
                      </td>

                      {/* Quantity */}
                      <td className="py-3 px-2 sm:px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-right text-xs">
                        {h.shares}
                      </td>

                      {/* Average Purchase Price */}
                      <td className="py-3 px-2 sm:px-4 font-mono text-slate-600 dark:text-[#A1A1AA] text-right hidden md:table-cell">
                        {formatCurrency(h.average_buy_price)}
                      </td>

                      {/* Current Market Price */}
                      <td className="py-3 px-2 sm:px-4 font-mono font-bold text-slate-dark dark:text-[#F5F5F5] text-right text-xs sm:text-sm">
                        {formatCurrency(h.currentPrice)}
                      </td>

                      {/* Current % Change (24H) */}
                      <td className="py-3 px-2 sm:px-4 text-right font-sans hidden sm:table-cell">
                        <span
                          className={`inline-flex items-center text-[11px] font-extrabold font-mono px-1.5 py-0.5 rounded ${
                            isDayChangePositive ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40' : 'text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-950/40'
                          }`}
                        >
                          {isDayChangePositive ? '+' : ''}{dayChangePct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Position Market Value */}
                      <td className="py-3 px-2 sm:px-4 font-mono font-black text-slate-dark dark:text-[#F5F5F5] text-right text-xs sm:text-sm hidden md:table-cell">
                        {formatCurrency(h.marketValue)}
                      </td>

                      {/* Unrealized P&L ($) */}
                      <td className="py-3 px-2 sm:px-4 text-right font-mono font-bold hidden sm:table-cell">
                        <span className={h.isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}>
                          {h.isPositive ? '+' : ''}{formatCurrency(h.unrealizedPnl)}
                        </span>
                      </td>

                      {/* P&L % */}
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <Badge variant={h.isPositive ? 'up' : 'down'} size="sm">
                          {h.isPositive ? '+' : ''}{formatPercent(h.unrealizedPnlPct)}
                        </Badge>
                      </td>

                      {/* Trend Sparkline */}
                      <td className="py-3 px-2 sm:px-4 text-center hidden lg:table-cell">
                        <div className="w-20 mx-auto">
                          <Sparkline
                            data={[
                              h.average_buy_price * 0.98,
                              h.average_buy_price * 0.99,
                              h.average_buy_price * 1.01,
                              h.currentPrice,
                            ]}
                            width={75}
                            height={22}
                            isPositive={h.isPositive}
                          />
                        </div>
                      </td>

                      {/* Action Dropdown / Trade Quick Trigger */}
                      <td className="py-3 px-2 sm:px-4 text-right">
                        <div className="flex items-center justify-end gap-1 sm:gap-1.5">
                          <button
                            onClick={() => setSelectedHoldingTicker(isSelected ? null : ticker)}
                            className="px-2 sm:px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-lg border border-slate-200 dark:border-[#3A3A3D] hover:bg-slate-100 dark:hover:bg-[#323236] text-slate-700 dark:text-[#F5F5F5] transition-colors cursor-pointer min-h-[30px]"
                          >
                            {isSelected ? 'Close' : 'Chart'}
                          </button>
                          <Link href={`/trade?symbol=${ticker}&type=SELL`}>
                            <Button variant="outline" size="xs">
                              Trade
                            </Button>
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="text-center py-12 px-4 text-slate-muted dark:text-[#71717A]">
                    <div className="flex flex-col items-center gap-2">
                      <Layers className="w-8 h-8 text-slate-300 dark:text-[#3A3A3D]" />
                      <span className="font-semibold text-xs text-slate-600 dark:text-[#A1A1AA]">No open positions in your portfolio.</span>
                      <span className="text-[11px] text-slate-400 dark:text-[#71717A]">Use your $10,000.00 virtual cash to start trading top equities.</span>
                      <Link href="/markets" className="mt-2">
                        <Button variant="lime" size="xs">
                          <PlusCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Explore Markets</span>
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
