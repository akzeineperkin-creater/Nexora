'use client';

import React from 'react';
import { Sparkles, ShieldCheck, CheckSquare, Download } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { usePortfolio } from '@/hooks/usePortfolio';
import { formatCurrency } from '@/lib/utils';

interface AiAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AiAuditModal({ isOpen, onClose }: AiAuditModalProps) {
  const { data: portfolio } = usePortfolio();
  const totalVal = portfolio?.totalPortfolioValue ?? 1000.00;
  const cashVal = portfolio?.cashBalance ?? 1000.00;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="lg"
      title={
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-lime flex items-center justify-center text-slate-dark">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div>Quantitative Portfolio Audit</div>
            <div className="text-xs text-slate-muted font-normal">
              AI-Generated Risk & Alpha Diagnostics • {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      }
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button variant="lime" size="sm" onClick={onClose}>
            <Download className="w-4 h-4" />
            <span>Download Audit PDF</span>
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Score Header */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center bg-gradient-to-br from-slate-900 to-slate-800 text-white p-5 rounded-card-lg">
          <div className="text-center sm:border-r border-white/10 sm:pr-4">
            <div className="text-4xl font-extrabold font-mono text-lime leading-tight">
              88<span className="text-lg text-slate-400">/100</span>
            </div>
            <Badge variant="lime" size="sm" className="mt-2">Optimized Alpha</Badge>
          </div>

          <div className="sm:col-span-2">
            <h4 className="text-sm font-extrabold text-white">Portfolio Health Status: Strong</h4>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">
              Your portfolio demonstrates above-average Sharpe efficiency (2.14) and solid alpha generation relative to the broad S&P 500 index.
            </p>
          </div>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Card className="p-3.5">
            <span className="text-[10px] font-bold uppercase text-slate-muted tracking-wider">Risk Level</span>
            <div className="text-sm font-bold font-mono text-emerald-600 my-1">Low (Beta 1.28)</div>
            <p className="text-[11px] text-slate-500">Controlled drawdown relative to peers.</p>
          </Card>

          <Card className="p-3.5">
            <span className="text-[10px] font-bold uppercase text-slate-muted tracking-wider">Concentration</span>
            <div className="text-sm font-bold font-mono text-amber-600 my-1">Moderate (64%)</div>
            <p className="text-[11px] text-slate-500">Heavily weighted in technology & AI.</p>
          </Card>

          <Card className="p-3.5">
            <span className="text-[10px] font-bold uppercase text-slate-muted tracking-wider">Cash Reserve</span>
            <div className="text-sm font-bold font-mono text-lime-900 my-1">
              {((cashVal / totalVal) * 100).toFixed(1)}% ({formatCurrency(cashVal)})
            </div>
            <p className="text-[11px] text-slate-500">Ample liquidity to buy pullbacks.</p>
          </Card>
        </div>

        {/* Actionable Steps */}
        <Card>
          <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-dark">
            <CheckSquare className="w-4 h-4 text-emerald-600" />
            <span>Actionable Rebalancing Steps</span>
          </div>

          <div className="flex flex-col gap-2.5 text-xs text-slate-700">
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-lime text-slate-dark flex items-center justify-center font-bold text-[10px] shrink-0">1</span>
              <div><strong>Trim High Beta:</strong> Take 10% profit on NVDA near $130 resistance to lock in realized gains.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-lime text-slate-dark flex items-center justify-center font-bold text-[10px] shrink-0">2</span>
              <div><strong>Hedge with Broad Index:</strong> Re-allocate $1,000 cash into SPY or VOO to smooth volatility.</div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 flex items-start gap-2.5">
              <span className="w-5 h-5 rounded-full bg-lime text-slate-dark flex items-center justify-center font-bold text-[10px] shrink-0">3</span>
              <div><strong>Automate Stop Protection:</strong> Place a trailing stop at -5% under current TSLA levels.</div>
            </div>
          </div>
        </Card>
      </div>
    </Modal>
  );
}
