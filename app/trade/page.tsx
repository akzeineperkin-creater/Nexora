'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { ShieldCheck, AlertCircle, CheckCircle2, Lock, History } from 'lucide-react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PillTabs } from '@/components/ui/Tabs';
import { Badge } from '@/components/ui/Badge';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { useAssets, useAssetQuote } from '@/hooks/useAssets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTrade } from '@/hooks/useTrade';
import { formatCurrency } from '@/lib/utils';
import { REAL_STOCKS_UNIVERSE, toAssetModel } from '@/lib/market-data/market-service';

function TradeContent() {
  const searchParams = useSearchParams();
  const symbolParam = searchParams.get('symbol') || searchParams.get('ticker');
  const typeParam = searchParams.get('type');

  const { data: assets } = useAssets();
  const { data: portfolio } = usePortfolio();
  const tradeMutation = useTrade();

  const [selectedTicker, setSelectedTicker] = useState<string>(symbolParam?.toUpperCase() || 'NVDA');
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>(typeParam === 'SELL' ? 'SELL' : 'BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [shares, setShares] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Live real-time quote for selected stock
  const { data: liveQuote } = useAssetQuote(selectedTicker);

  useEffect(() => {
    if (symbolParam) {
      setSelectedTicker(symbolParam.toUpperCase());
    }
    if (typeParam === 'BUY' || typeParam === 'SELL') {
      setTradeType(typeParam);
    }
  }, [symbolParam, typeParam]);

  // Robust asset resolution across fetched assets or global universe
  const matchedUniverse = REAL_STOCKS_UNIVERSE.find(
    (s) => s.ticker.toUpperCase() === selectedTicker.toUpperCase()
  );
  const asset =
    assets?.find((a) => a.ticker.toUpperCase() === selectedTicker.toUpperCase()) ||
    (matchedUniverse ? toAssetModel(matchedUniverse) : assets?.[0] || toAssetModel(REAL_STOCKS_UNIVERSE[1]));

  const userHolding = portfolio?.holdings?.find(
    (h) => h.asset_id === asset?.id || h.asset?.ticker?.toUpperCase() === asset?.ticker?.toUpperCase()
  );
  const availableCash = portfolio?.cashBalance ?? 10000.00;
  const sharesHeld = userHolding?.shares ?? 0;

  const currentPrice = Number(liveQuote?.currentPrice ?? asset?.current_price ?? 100);
  const orderValue = Number(((shares || 0) * currentPrice).toFixed(2));
  const canExecute = tradeType === 'BUY' ? orderValue <= availableCash && shares > 0 : shares <= sharesHeld && shares > 0;

  const handleExecute = async () => {
    if (!asset || !canExecute) return;
    setStatusMessage(null);

    try {
      const res = await tradeMutation.mutateAsync({
        assetId: asset.id,
        ticker: asset.ticker,
        type: tradeType,
        shares,
        orderType,
        price: currentPrice,
      });

      if (res?.success) {
        setStatusMessage({
          type: 'success',
          text: `${tradeType} order executed successfully (${shares} ${shares === 1 ? 'share' : 'shares'} of ${asset.ticker} @ ${formatCurrency(res.executed_price ?? currentPrice)})`,
        });

        setTimeout(() => {
          setStatusMessage(null);
        }, 4000);
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Order failed to execute.' });
      }
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Execution error occurred.' });
    }
  };

  return (
    <div className="max-w-2xl mx-auto flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            Execute Order
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Simulated market and limit orders backed by PostgreSQL atomic transactions.
          </p>
        </div>
        <Link href="/history">
          <Button variant="outline" size="sm">
            <History className="w-4 h-4 mr-1.5 text-slate-500 dark:text-[#A1A1AA]" />
            <span>Trade History</span>
          </Button>
        </Link>
      </div>

      <Card className="flex flex-col gap-5 p-4 sm:p-6">
        {/* BUY / SELL Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-subtle dark:bg-[#1E1E21] border border-slate-200/60 dark:border-[#3A3A3D] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTradeType('BUY')}
            className={`py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer min-h-[40px] ${
              tradeType === 'BUY'
                ? 'bg-lime text-[#0F0B0A] shadow-sm'
                : 'text-slate-500 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
            }`}
          >
            BUY / LONG
          </button>
          <button
            type="button"
            onClick={() => setTradeType('SELL')}
            className={`py-2.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer min-h-[40px] ${
              tradeType === 'SELL'
                ? 'bg-red-500 text-white shadow-sm'
                : 'text-slate-500 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
            }`}
          >
            SELL / SHORT
          </button>
        </div>

        {/* Popular Instrument Quick Switcher */}
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">Select Instrument</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(assets && assets.length > 0 ? assets.slice(0, 8) : REAL_STOCKS_UNIVERSE.slice(0, 8)).map((a) => (
              <button
                key={a.ticker}
                type="button"
                onClick={() => setSelectedTicker(a.ticker)}
                className={`p-2 sm:p-2.5 rounded-xl border text-left transition-all cursor-pointer min-h-[44px] ${
                  selectedTicker.toUpperCase() === a.ticker.toUpperCase()
                    ? 'border-lime dark:border-lime/80 bg-lime-50/50 dark:bg-[#353539] shadow-sm'
                    : 'border-slate-border dark:border-[#3A3A3D] hover:border-slate-300 dark:hover:border-[#4A4A4E] bg-white dark:bg-[#1E1E21]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5]">{a.ticker}</span>
                  <Badge variant={Number(a.day_change) >= 0 ? 'up' : 'down'} size="sm">
                    {Number(a.day_change_pct).toFixed(1)}%
                  </Badge>
                </div>
                <div className="text-xs font-mono font-semibold text-slate-muted dark:text-[#A1A1AA] mt-1 truncate">
                  {formatCurrency(Number(a.current_price))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Selected Instrument Summary Card */}
        {asset && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-slate-subtle dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D]">
            <div className="flex items-center gap-3">
              <CompanyLogo ticker={asset.ticker} name={asset.name} size="md" />
              <div className="min-w-0">
                <div className="font-extrabold text-sm text-slate-dark dark:text-[#F5F5F5]">{asset.ticker}</div>
                <div className="text-xs text-slate-muted dark:text-[#A1A1AA] truncate max-w-[200px]">{asset.name}</div>
              </div>
            </div>
            <div className="text-left sm:text-right">
              <div className="font-mono font-extrabold text-base text-slate-dark dark:text-[#F5F5F5]">
                {formatCurrency(currentPrice)}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-[#71717A] font-mono">
                {tradeType === 'BUY'
                  ? `Available Cash: ${formatCurrency(availableCash)}`
                  : `Position Owned: ${sharesHeld} shares`}
              </div>
            </div>
          </div>
        )}

        {/* Order Type */}
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">Order Type</label>
          <div className="overflow-x-auto no-scrollbar max-w-full pb-0.5">
            <PillTabs
              items={[
                { id: 'MARKET', label: 'Market (Instant)' },
                { id: 'LIMIT', label: 'Limit Order' },
                { id: 'STOP', label: 'Stop Loss' },
              ]}
              activeId={orderType}
              onChange={(id) => setOrderType(id as any)}
              variant="lime"
            />
          </div>
        </div>

        {/* Quantity (Shares) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5]">Number of Shares</label>
            <div className="flex items-center gap-1.5">
              {[1, 5, 10, 25].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setShares(preset)}
                  className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 dark:bg-[#1E1E21] hover:bg-slate-200 dark:hover:bg-[#323236] text-slate-700 dark:text-[#F5F5F5] border border-slate-200 dark:border-[#3A3A3D] transition-colors cursor-pointer"
                >
                  +{preset}
                </button>
              ))}
            </div>
          </div>
          <Input
            type="number"
            min={1}
            step={1}
            value={shares.toString()}
            onChange={(e) => setShares(Math.max(1, parseInt(e.target.value, 10) || 1))}
            className="font-mono text-base font-bold bg-white dark:bg-[#1E1E21] border-slate-border dark:border-[#3A3A3D] text-slate-dark dark:text-[#F5F5F5]"
          />
        </div>

        {/* Order Cost Breakdown */}
        <div className="p-4 rounded-xl bg-slate-subtle dark:bg-[#1E1E21] border border-slate-200/60 dark:border-[#3A3A3D] flex flex-col gap-2 text-xs">
          <div className="flex items-center justify-between text-slate-muted dark:text-[#A1A1AA]">
            <span>Execution Price</span>
            <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(currentPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-muted dark:text-[#A1A1AA]">
            <span>Estimated Commission</span>
            <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">$0.00 (Zero Fee)</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-[#3A3A3D] flex items-center justify-between font-bold text-sm text-slate-dark dark:text-[#F5F5F5]">
            <span>Total Estimated Cost</span>
            <span className="font-mono text-base text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(orderValue)}</span>
          </div>
        </div>

        {/* Status Message (Subtle Feedback) */}
        {statusMessage && (
          <div
            className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800/50'
                : 'bg-red-50 dark:bg-red-950/40 text-red-900 dark:text-red-300 border-red-300 dark:border-red-800/50'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Submit Execution Button */}
        <Button
          variant={tradeType === 'BUY' ? 'lime' : 'danger'}
          size="lg"
          className="w-full justify-center font-extrabold text-sm"
          disabled={!canExecute || tradeMutation.isPending}
          onClick={handleExecute}
        >
          {tradeMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-[#0F0B0A] border-t-transparent rounded-full animate-spin" />
              <span>Executing Order on Blockchain Ledger...</span>
            </span>
          ) : (
            <span>
              {tradeType} {shares} {shares === 1 ? 'Share' : 'Shares'} of {asset?.ticker}
            </span>
          )}
        </Button>
      </Card>
    </div>
  );
}

export default function TradePage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-2xl mx-auto py-12 text-center text-slate-400 dark:text-[#71717A] font-bold text-xs">
          Loading order terminal...
        </div>
      }
    >
      <TradeContent />
    </Suspense>
  );
}
