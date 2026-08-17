'use client';

import React, { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ShieldCheck, PlusCircle, RotateCcw, ShieldAlert, Check, Sparkles } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardSubtitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useAuth } from '@/providers/AuthProvider';
import { supabase } from '@/lib/supabase/client';
import { formatCurrency } from '@/lib/utils';

export default function VirtualCashPage() {
  const { user } = useAuth();
  const { data: portfolio } = usePortfolio();
  const queryClient = useQueryClient();
  const [isResetting, setIsResetting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const totalValue = portfolio?.totalPortfolioValue ?? 10000.00;
  const cashBalance = portfolio?.cashBalance ?? 10000.00;
  const totalInvested = portfolio?.totalHoldingsValue ?? 0.00;
  const startingCap = portfolio?.startingCapital ?? 10000.00;
  const portfolioId = portfolio?.portfolioId;

  const handleReset = async () => {
    if (!portfolioId || !user?.id) return;
    setIsResetting(true);
    setStatusMessage(null);

    try {
      // 1. Delete open holdings for this portfolio
      await (supabase as any)
        .from('holdings')
        .delete()
        .eq('portfolio_id', portfolioId);

      // 2. Reset cash_balance and starting_capital back to $10,000.00 in public.portfolios
      await (supabase as any)
        .from('portfolios')
        .update({
          cash_balance: 10000.00,
          starting_capital: 10000.00,
          updated_at: new Date().toISOString(),
        })
        .eq('id', portfolioId);

      queryClient.invalidateQueries({ queryKey: ['portfolio'] });
      setStatusMessage('Portfolio successfully reset to $10,000.00 virtual cash.');
      setTimeout(() => setStatusMessage(null), 4000);
    } catch (err: any) {
      console.error('Error resetting portfolio:', err.message);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* HEADER */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-dark dark:text-[#F5F5F5] tracking-tight">
            Manage Virtual Capital
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            Configure simulated educational capital and review sandbox portfolio parameters.
          </p>
        </div>
        <Badge variant="lime" size="sm">100% Virtual Capital</Badge>
      </div>

      {/* STATUS NOTIFICATION */}
      {statusMessage && (
        <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50 text-xs font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{statusMessage}</span>
        </div>
      )}

      {/* CAPITAL OVERVIEW */}
      <Card variant="xl" className="bg-gradient-to-br from-white to-lime-50 dark:from-[#28282B] dark:to-[#1E1E21] border-lime-300/60 dark:border-[#3A3A3D]">
        <div className="flex items-center justify-between flex-wrap gap-6">
          <div>
            <span className="text-[11px] font-bold uppercase text-slate-muted dark:text-[#A1A1AA] tracking-wider">Total Virtual Net Worth</span>
            <div className="text-3xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] mt-1">
              {formatCurrency(totalValue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="lime" size="sm">Simulation Mode</Badge>
              <span className="text-xs text-slate-muted dark:text-[#71717A]">All balances are strictly educational & virtual</span>
            </div>
          </div>

          <div className="flex items-center gap-6 font-mono text-right">
            <div>
              <div className="text-xs text-slate-muted dark:text-[#A1A1AA]">Available Buying Power</div>
              <div className="text-xl font-bold text-lime-900 dark:text-lime mt-0.5">{formatCurrency(cashBalance)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-muted dark:text-[#A1A1AA]">Invested in Assets</div>
              <div className="text-xl font-bold text-slate-dark dark:text-[#F5F5F5] mt-0.5">{formatCurrency(totalInvested)}</div>
            </div>
          </div>
        </div>
      </Card>

      {/* PRACTICE CONTROLS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <PlusCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Sandbox Educational Capital</span>
              </CardTitle>
              <CardSubtitle>Standard starting capital allocation</CardSubtitle>
            </div>
          </CardHeader>
          <p className="text-xs text-slate-600 dark:text-[#A1A1AA] mb-4 leading-relaxed">
            Every newly registered Nexra account is initialized with <strong>$10,000.00</strong> in virtual simulation capital to practice risk management and trading strategies without risking real capital.
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] text-xs text-slate-700 dark:text-[#F5F5F5] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-900 dark:text-lime" />
            <span>Standard Sandbox Capital: <strong>$10,000.00</strong></span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <RotateCcw className="w-4 h-4 text-red-500" />
                <span>Reset Practice Portfolio</span>
              </CardTitle>
              <CardSubtitle>Restore starting balance to $10,000.00</CardSubtitle>
            </div>
          </CardHeader>
          <p className="text-xs text-slate-600 dark:text-[#A1A1AA] mb-4 leading-relaxed">
            Resetting clears open sandbox holdings and re-initializes your virtual buying power back to the exact initial default of $10,000.00.
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? 'Resetting...' : 'Reset to $10,000.00'}</span>
          </Button>
        </Card>
      </div>

      {/* FAIR PLAY & ISOLATION RULES */}
      <div className="bg-white dark:bg-[#28282B] border-l-4 border-lime border-y border-r border-slate-border dark:border-[#3A3A3D] rounded-card p-5 shadow-card dark:shadow-dark-card">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-lime-900 dark:text-lime" />
          <span className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5]">Simulation Rules & Capital Notice</span>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-slate-700 dark:text-[#A1A1AA] leading-relaxed">
          <div>• <strong>Equal Starting Capital:</strong> Every user begins with strictly $10,000.00 virtual capital in their sandbox portfolio.</div>
          <div>• <strong>Educational Purpose:</strong> All market orders and cash allocations are purely simulated for educational practice.</div>
          <div>• <strong>No Real Money:</strong> Virtual balances cannot be withdrawn, transferred, or converted to real currency.</div>
        </div>
      </div>
    </div>
  );
}
