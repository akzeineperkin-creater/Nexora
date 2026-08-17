'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  History,
  Download,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  PlusCircle,
  Clock,
  TrendingUp,
  Activity,
  Layers,
  CheckCircle2,
  DollarSign,
  Wallet,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PillTabs } from '@/components/ui/Tabs';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency, formatPercent } from '@/lib/utils';

export default function TradeHistoryPage() {
  const { data: portfolio, isLoading } = usePortfolio();
  const transactions: any[] = useMemo(() => portfolio?.transactions ?? [], [portfolio?.transactions]);

  const [activeTab, setActiveTab] = useState<'all' | 'buy' | 'sell' | 'limit'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. Calculate Aggregate Trade History Metrics
  const totalTradesCount = transactions.length;
  const buyTrades = transactions.filter((t) => t.type === 'BUY');
  const sellTrades = transactions.filter((t) => t.type === 'SELL');

  const totalVolume = transactions.reduce((sum, t) => sum + Number(t.total_amount || 0), 0);
  const totalRealizedPnl = portfolio?.totalRealizedPnl ?? sellTrades.reduce((sum, t) => sum + (t.realized_pnl ? Number(t.realized_pnl) : 0), 0);
  const profitableSells = sellTrades.filter((t) => Number(t.realized_pnl || 0) > 0);
  const winRate = sellTrades.length > 0 ? ((profitableSells.length / sellTrades.length) * 100).toFixed(1) : '—';

  // 2. Filter Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      // Type Filter
      if (activeTab === 'buy' && tx.type !== 'BUY') return false;
      if (activeTab === 'sell' && tx.type !== 'SELL') return false;
      if (activeTab === 'limit' && tx.order_type !== 'LIMIT') return false;

      // Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const ticker = (tx.asset?.ticker || tx.ticker || '').toLowerCase();
        const name = (tx.asset?.name || tx.name || '').toLowerCase();
        return ticker.includes(q) || name.includes(q);
      }

      return true;
    });
  }, [transactions, activeTab, searchQuery]);

  // 3. Export CSV Handler
  const handleExportCSV = () => {
    const headers = [
      'Order ID',
      'Execution Timestamp (UTC)',
      'Type',
      'Ticker',
      'Company Name',
      'Shares',
      'Execution Price',
      'Current Price',
      'Price Change %',
      'Total Value',
      'Cash Before',
      'Cash After',
      'Commission',
      'Cost Basis',
      'Realized PnL',
      'Remaining Position',
      'Order Type',
      'Status',
    ];

    const rows = transactions.map((t) => [
      t.id,
      t.created_at,
      t.type,
      t.asset?.ticker || t.ticker || 'ASSET',
      `"${t.asset?.name || t.name || ''}"`,
      t.shares,
      t.price_per_share,
      t.current_price || t.price_per_share,
      t.price_change_pct || 0,
      t.total_amount,
      t.cash_before !== null && t.cash_before !== undefined ? t.cash_before : '',
      t.cash_after !== null && t.cash_after !== undefined ? t.cash_after : '',
      t.commission || 0,
      t.cost_basis || '',
      t.realized_pnl || '',
      t.remaining_position || '',
      t.order_type || 'MARKET',
      t.status || 'COMPLETED',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexra_trade_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  // Format exact date & time string
  const formatExactDateTime = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* 1. HEADER SECTION */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              Trade History & Execution Ledger
            </h1>
            <Badge variant="neutral" size="sm">
              Ledger Sync Active
            </Badge>
          </div>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Immutable audit record of all simulation transactions, fills, cash changes, and realized gains.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            disabled={transactions.length === 0}
            className="font-bold"
          >
            <Download className="w-4 h-4 mr-1.5" />
            <span>Export CSV</span>
          </Button>

          <Link href="/trade">
            <Button variant="lime" size="sm" className="font-extrabold shadow-lime">
              <PlusCircle className="w-4 h-4 mr-1.5" />
              <span>New Order</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* 2. STATS CARDS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Total Executed Trades</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <History className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {totalTradesCount}
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-slate-muted dark:text-[#71717A] font-mono">
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">{buyTrades.length} Buys</span>
            <span>•</span>
            <span className="text-red-600 dark:text-red-400 font-bold">{sellTrades.length} Sells</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Total Traded Volume</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <DollarSign className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] tracking-tight">
              {formatCurrency(totalVolume)}
            </div>
          </div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A]">
            Cumulative simulated execution value
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Realized Closed P&L</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div
              className={`text-2xl font-extrabold font-mono tracking-tight ${
                totalRealizedPnl >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
              }`}
            >
              {totalRealizedPnl >= 0 ? '+' : ''}
              {formatCurrency(totalRealizedPnl)}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={totalRealizedPnl >= 0 ? 'up' : 'down'} size="sm">
              {totalRealizedPnl >= 0 ? 'Profitable' : 'Loss'}
            </Badge>
            <span className="text-[11px] text-slate-muted dark:text-[#71717A] font-mono">from {sellTrades.length} sells</span>
          </div>
        </Card>

        <Card className="flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs font-bold text-slate-muted dark:text-[#A1A1AA] uppercase tracking-wider">
            <span>Sell Win Rate</span>
            <div className="w-7 h-7 rounded-lg bg-slate-subtle dark:bg-[#1E1E21] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold font-mono text-lime-900 dark:text-lime tracking-tight">
              {winRate}%
            </div>
          </div>
          <div className="text-[11px] text-slate-muted dark:text-[#71717A] font-mono">
            {profitableSells.length} of {sellTrades.length} sells closed in profit
          </div>
        </Card>
      </div>

      {/* 3. FILTER BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#28282B] p-3.5 rounded-2xl border border-slate-border dark:border-[#3A3A3D] shadow-subtle dark:shadow-dark-card">
        <div className="flex items-center gap-2">
          <PillTabs
            tabs={[
              { id: 'all', label: `All (${transactions.length})` },
              { id: 'buy', label: `Buy (${buyTrades.length})` },
              { id: 'sell', label: `Sell (${sellTrades.length})` },
              { id: 'limit', label: 'Limit Orders' },
            ]}
            activeId={activeTab}
            onChange={(id) => setActiveTab(id as any)}
          />
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 dark:text-[#71717A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search symbol or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] rounded-xl focus:outline-none focus:border-[#B8F500]/60 font-medium text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-400 dark:placeholder:text-[#71717A]"
          />
        </div>
      </div>

      {/* 4. TRADE HISTORY TABLE */}
      <Card className="p-0 overflow-hidden shadow-sm dark:shadow-dark-card">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-[#1E1E21] border-b border-slate-border dark:border-[#3A3A3D] text-slate-muted dark:text-[#A1A1AA] uppercase text-[10px] font-bold tracking-wider select-none">
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Instrument</th>
                <th className="py-3 px-4 text-right">Shares</th>
                <th className="py-3 px-4 text-right">Execution Price</th>
                <th className="py-3 px-4 text-right">Current Price</th>
                <th className="py-3 px-4 text-right">Price Change %</th>
                <th className="py-3 px-4 text-right">Total Value</th>
                <th className="py-3 px-4 text-right">Cash Before</th>
                <th className="py-3 px-4 text-right">Cash After</th>
                <th className="py-3 px-4 text-right">Realized / Unrealized P&L</th>
                <th className="py-3 px-4 text-right">Remaining Position</th>
                <th className="py-3 px-4">Order Type</th>
                <th className="py-3 px-4">Timestamp (UTC)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-[#3A3A3D] font-mono">
              {isLoading ? (
                <tr>
                  <td colSpan={14} className="text-center py-12 text-slate-400 dark:text-[#71717A] font-bold font-sans">
                    Loading trade records from ledger...
                  </td>
                </tr>
              ) : filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => {
                  const isBuy = tx.type === 'BUY';
                  const ticker = tx.asset?.ticker || tx.ticker || 'ASSET';
                  const name = tx.asset?.name || tx.name || ticker;

                  const execPrice = Number(tx.price_per_share || 0);
                  const currPrice = Number(tx.current_price || tx.asset?.current_price || execPrice);
                  const sharesCount = Number(tx.shares || 1);

                  // PRICE CHANGE SINCE PURCHASE:
                  // ((Current Market Price - Average Purchase Price) / Average Purchase Price) * 100
                  const priceChangePct = Number(
                    tx.price_change_pct !== undefined && tx.price_change_pct !== null
                      ? tx.price_change_pct
                      : (execPrice > 0 ? (((currPrice - execPrice) / execPrice) * 100).toFixed(2) : 0)
                  );
                  const isChangePositive = priceChangePct >= 0;

                  // P&L Logic:
                  // For SELL: Realized P&L
                  // For BUY: Unrealized P&L = (Current Price - Execution Price) * Shares
                  const isSell = tx.type === 'SELL';
                  const pnlValue = isSell
                    ? Number(tx.realized_pnl || 0)
                    : Number(((currPrice - execPrice) * sharesCount).toFixed(2));
                  const isPnlPositive = pnlValue >= 0;

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 dark:hover:bg-[#323236] transition-colors">
                      {/* BUY / SELL Badge */}
                      <td className="py-3.5 px-4 font-sans">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                            isBuy
                              ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50'
                              : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800/50'
                          }`}
                        >
                          {isBuy ? (
                            <ArrowDownRight className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                          ) : (
                            <ArrowUpRight className="w-3 h-3 text-red-600 dark:text-red-400" />
                          )}
                          <span>{tx.type}</span>
                        </span>
                      </td>

                      {/* Instrument & Logo */}
                      <td className="py-3.5 px-4 font-sans">
                        <Link href={`/markets/${ticker}`} className="flex items-center gap-2.5 group">
                          <CompanyLogo ticker={ticker} name={name} size="sm" />
                          <div>
                            <div className="font-extrabold text-slate-dark dark:text-[#F5F5F5] text-xs group-hover:text-lime-900 dark:group-hover:text-lime transition-colors">
                              {ticker}
                            </div>
                            <div className="text-[10px] text-slate-400 dark:text-[#71717A] truncate max-w-[130px] font-medium">
                              {name}
                            </div>
                          </div>
                        </Link>
                      </td>

                      {/* Shares */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-dark dark:text-[#F5F5F5] text-xs">
                        {tx.shares}
                      </td>

                      {/* Execution Price */}
                      <td className="py-3.5 px-4 text-right font-semibold text-slate-700 dark:text-[#A1A1AA]">
                        {formatCurrency(execPrice)}
                      </td>

                      {/* Current Price */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-dark dark:text-[#F5F5F5]">
                        {formatCurrency(currPrice)}
                      </td>

                      {/* Price Change % Since Purchase */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        <span
                          className={`inline-flex items-center text-[11px] font-extrabold font-mono px-2 py-0.5 rounded-full ${
                            isChangePositive
                              ? 'text-emerald-800 dark:text-emerald-300 bg-emerald-100/70 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800/50'
                              : 'text-red-800 dark:text-red-300 bg-red-100/70 dark:bg-red-950/40 border border-red-300 dark:border-red-800/50'
                          }`}
                        >
                          {isChangePositive ? '+' : ''}{priceChangePct.toFixed(2)}%
                        </span>
                      </td>

                      {/* Total Value */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-dark dark:text-[#F5F5F5] text-xs">
                        {formatCurrency(Number(tx.total_amount))}
                      </td>

                      {/* Cash Before */}
                      <td className="py-3.5 px-4 text-right text-slate-600 dark:text-[#A1A1AA] text-xs">
                        {tx.cash_before !== null && tx.cash_before !== undefined
                          ? formatCurrency(Number(tx.cash_before))
                          : '—'}
                      </td>

                      {/* Cash After */}
                      <td className="py-3.5 px-4 text-right font-bold text-slate-dark dark:text-[#F5F5F5] text-xs">
                        {tx.cash_after !== null && tx.cash_after !== undefined
                          ? formatCurrency(Number(tx.cash_after))
                          : '—'}
                      </td>

                      {/* Realized / Unrealized P&L */}
                      <td className="py-3.5 px-4 text-right font-sans">
                        {isSell ? (
                          <div className="flex flex-col items-end">
                            <Badge variant={isPnlPositive ? 'up' : 'down'} size="sm">
                              {isPnlPositive ? '+' : ''}{formatCurrency(pnlValue)}
                            </Badge>
                            <span className="text-[9px] text-slate-400 dark:text-[#71717A] font-medium mt-0.5">Realized</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span
                              className={`text-xs font-extrabold font-mono ${
                                isPnlPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {isPnlPositive ? '+' : ''}{formatCurrency(pnlValue)}
                            </span>
                            <span className="text-[9px] text-slate-400 dark:text-[#71717A] font-medium">Unrealized</span>
                          </div>
                        )}
                      </td>

                      {/* Remaining Position */}
                      <td className="py-3.5 px-4 text-right text-xs font-sans">
                        <span
                          className={`font-semibold ${
                            tx.remaining_shares === 0
                              ? 'text-slate-400 dark:text-[#71717A]'
                              : 'text-slate-700 dark:text-[#A1A1AA]'
                          }`}
                        >
                          {tx.remaining_position || (tx.remaining_shares !== undefined ? `${tx.remaining_shares} shares` : '—')}
                        </span>
                      </td>

                      {/* Order Type */}
                      <td className="py-3.5 px-4 font-sans text-xs">
                        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-[#1E1E21] text-slate-700 dark:text-[#A1A1AA] border border-slate-200 dark:border-[#3A3A3D] font-bold text-[10px]">
                          {tx.order_type || 'MARKET'}
                        </span>
                      </td>

                      {/* Timestamp */}
                      <td className="py-3.5 px-4 text-slate-500 dark:text-[#71717A] text-[11px] font-sans">
                        {formatExactDateTime(tx.created_at)}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center font-sans">
                        <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800/50">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{tx.status || 'FILLED'}</span>
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={14} className="text-center py-16 text-slate-muted dark:text-[#71717A] font-sans">
                    <div className="flex flex-col items-center gap-2 max-w-sm mx-auto">
                      <Layers className="w-8 h-8 text-slate-300 dark:text-[#3A3A3D]" />
                      <span className="font-semibold text-xs text-slate-600 dark:text-[#A1A1AA]">No transactions found.</span>
                      <span className="text-[11px] text-slate-400 dark:text-[#71717A]">
                        When you execute BUY or SELL orders, they are permanently recorded in this ledger.
                      </span>
                      <Link href="/trade" className="mt-2">
                        <Button variant="lime" size="xs">
                          <PlusCircle className="w-3.5 h-3.5 mr-1" />
                          <span>Execute First Trade</span>
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
