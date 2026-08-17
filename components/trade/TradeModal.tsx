'use client';

import React, { useState } from 'react';
import { ShieldCheck, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { PillTabs } from '@/components/ui/Tabs';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { useAssets } from '@/hooks/useAssets';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTrade } from '@/hooks/useTrade';
import { formatCurrency } from '@/lib/utils';
import { REAL_STOCKS_UNIVERSE, toAssetModel } from '@/lib/market-data/market-service';

interface TradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTicker?: string;
}

export function TradeModal({ isOpen, onClose, defaultTicker = 'NVDA' }: TradeModalProps) {
  const { data: assets } = useAssets();
  const { data: portfolioData } = usePortfolio();
  const tradeMutation = useTrade();

  const [selectedTicker, setSelectedTicker] = useState(defaultTicker);
  const [tradeType, setTradeType] = useState<'BUY' | 'SELL'>('BUY');
  const [orderType, setOrderType] = useState<'MARKET' | 'LIMIT' | 'STOP'>('MARKET');
  const [shares, setShares] = useState<number>(1);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const matchedUniverse = REAL_STOCKS_UNIVERSE.find(
    (s) => s.ticker.toUpperCase() === selectedTicker.toUpperCase()
  );
  const asset =
    assets?.find((a) => a.ticker.toUpperCase() === selectedTicker.toUpperCase()) ||
    (matchedUniverse ? toAssetModel(matchedUniverse) : assets?.[0] || toAssetModel(REAL_STOCKS_UNIVERSE[1]));

  const userHolding = portfolioData?.holdings?.find(
    (h) => h.asset_id === asset?.id || h.asset?.ticker?.toUpperCase() === asset?.ticker?.toUpperCase()
  );
  const availableCash = portfolioData?.cashBalance ?? 10000.00;
  const sharesHeld = userHolding?.shares ?? 0;

  const currentPrice = Number(asset?.current_price ?? 100);
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
          text: `${tradeType} order executed successfully (${shares} ${asset.ticker} @ ${formatCurrency(res.executed_price ?? currentPrice)})`,
        });
        setTimeout(() => {
          onClose();
          setStatusMessage(null);
        }, 1800);
      } else {
        setStatusMessage({ type: 'error', text: res?.message || 'Trade validation failed on server.' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Error processing trade.' });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Simulated Trade: ${asset?.ticker ?? ''}`}
      subtitle="Orders execute securely against the PostgreSQL database engine."
      size="md"
    >
      <div className="flex flex-col gap-4">
        {/* BUY / SELL Switcher */}
        <div className="grid grid-cols-2 bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] p-1 rounded-xl gap-1">
          <button
            onClick={() => setTradeType('BUY')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tradeType === 'BUY' ? 'bg-emerald-500 text-white shadow-sm' : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
            }`}
          >
            BUY {asset?.ticker}
          </button>
          <button
            onClick={() => setTradeType('SELL')}
            className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              tradeType === 'SELL' ? 'bg-red-500 text-white shadow-sm' : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
            }`}
          >
            SELL {asset?.ticker}
          </button>
        </div>

        {/* Asset Selector */}
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">Select Instrument</label>
          <select
            value={selectedTicker}
            onChange={(e) => setSelectedTicker(e.target.value)}
            className="w-full py-2 px-3.5 bg-white dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-sm font-bold text-slate-dark dark:text-[#F5F5F5] shadow-subtle focus:outline-none focus:border-[#B8F500]/60"
          >
            {(assets && assets.length > 0 ? assets : REAL_STOCKS_UNIVERSE).map((a) => (
              <option key={a.ticker} value={a.ticker}>
                {a.ticker} — {a.name} ({formatCurrency(Number(a.current_price))})
              </option>
            ))}
          </select>
        </div>

        {/* Order Type */}
        <div>
          <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] mb-1.5 block">Order Type</label>
          <PillTabs
            items={[
              { id: 'MARKET', label: 'Market' },
              { id: 'LIMIT', label: 'Limit' },
              { id: 'STOP', label: 'Stop' },
            ]}
            activeId={orderType}
            onChange={(id) => setOrderType(id as any)}
            variant="lime"
          />
        </div>

        {/* Quantity */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5]">Quantity (Shares)</label>
            <span className="text-xs font-mono text-slate-muted dark:text-[#A1A1AA]">
              {tradeType === 'BUY'
                ? `Max Affordable: ${Math.floor(availableCash / currentPrice)}`
                : `Holding: ${sharesHeld}`}
            </span>
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

        {/* Order Value & Available Cash Summary */}
        <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-[#1E1E21] border border-slate-border dark:border-[#3A3A3D] flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between text-slate-muted dark:text-[#A1A1AA]">
            <span>Market Price:</span>
            <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(currentPrice)}</span>
          </div>
          <div className="flex items-center justify-between text-slate-muted dark:text-[#A1A1AA]">
            <span>Available Buying Power:</span>
            <span className="font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">{formatCurrency(availableCash)}</span>
          </div>
          <div className="pt-2 border-t border-slate-200 dark:border-[#3A3A3D] flex items-center justify-between font-bold text-sm text-slate-dark dark:text-[#F5F5F5]">
            <span>Total Value:</span>
            <span className="font-mono">{formatCurrency(orderValue)}</span>
          </div>
        </div>

        {/* Feedback Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl border flex items-center gap-2 text-xs font-bold ${
              statusMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/50'
                : 'bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800/50'
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

        {/* Submit Button */}
        <Button
          variant={tradeType === 'BUY' ? 'lime' : 'danger'}
          size="lg"
          className="w-full justify-center mt-2 font-extrabold"
          disabled={!canExecute || tradeMutation.isPending}
          onClick={handleExecute}
        >
          {tradeMutation.isPending ? (
            <span className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 border-2 border-[#0F0B0A] border-t-transparent rounded-full animate-spin" />
              <span>Executing Order...</span>
            </span>
          ) : (
            <span>
              {tradeType} {shares} {shares === 1 ? 'Share' : 'Shares'}
            </span>
          )}
        </Button>
      </div>
    </Modal>
  );
}
