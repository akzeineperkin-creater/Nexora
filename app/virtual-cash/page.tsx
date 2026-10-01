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
import { useTranslation } from '@/providers/LanguageProvider';

export default function VirtualCashPage() {
  const { t } = useTranslation();
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
      setStatusMessage(t('virtualCash.resetSuccessMsg'));
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
            {t('virtualCash.title')}
          </h1>
          <p className="text-xs md:text-sm text-slate-muted dark:text-[#A1A1AA] mt-0.5">
            {t('virtualCash.subtitle')}
          </p>
        </div>
        <Badge variant="lime" size="sm">{t('virtualCash.badge')}</Badge>
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
            <span className="text-[11px] font-bold uppercase text-slate-muted dark:text-[#A1A1AA] tracking-wider">{t('virtualCash.totalNetWorth')}</span>
            <div className="text-3xl font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5] mt-1">
              {formatCurrency(totalValue)}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="lime" size="sm">{t('virtualCash.simulationMode')}</Badge>
              <span className="text-xs text-slate-muted dark:text-[#71717A]">{t('virtualCash.simulationNotice')}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 font-mono text-left sm:text-right flex-wrap">
            <div>
              <div className="text-xs text-slate-muted dark:text-[#A1A1AA]">{t('virtualCash.buyingPower')}</div>
              <div className="text-lg sm:text-xl font-bold text-lime-900 dark:text-lime mt-0.5">{formatCurrency(cashBalance)}</div>
            </div>
            <div>
              <div className="text-xs text-slate-muted dark:text-[#A1A1AA]">{t('virtualCash.investedAssets')}</div>
              <div className="text-lg sm:text-xl font-bold text-slate-dark dark:text-[#F5F5F5] mt-0.5">{formatCurrency(totalInvested)}</div>
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
                <span>{t('virtualCash.sandboxCapTitle')}</span>
              </CardTitle>
              <CardSubtitle>{t('virtualCash.sandboxCapSubtitle')}</CardSubtitle>
            </div>
          </CardHeader>
          <p className="text-xs text-slate-600 dark:text-[#A1A1AA] mb-4 leading-relaxed">
            {t('virtualCash.sandboxCapDesc')}
          </p>
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] text-xs text-slate-700 dark:text-[#F5F5F5] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-lime-900 dark:text-lime" />
            <span>{t('virtualCash.standardSandboxCap', { amount: '$10,000.00' })}</span>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <div>
              <CardTitle>
                <RotateCcw className="w-4 h-4 text-red-500" />
                <span>{t('virtualCash.resetPortfolioTitle')}</span>
              </CardTitle>
              <CardSubtitle>{t('virtualCash.resetPortfolioSubtitle')}</CardSubtitle>
            </div>
          </CardHeader>
          <p className="text-xs text-slate-600 dark:text-[#A1A1AA] mb-4 leading-relaxed">
            {t('virtualCash.resetPortfolioDesc')}
          </p>
          <Button
            variant="danger"
            size="sm"
            onClick={handleReset}
            disabled={isResetting}
          >
            <RotateCcw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
            <span>{isResetting ? t('virtualCash.resetting') : t('virtualCash.resetButton')}</span>
          </Button>
        </Card>
      </div>

      {/* FAIR PLAY & ISOLATION RULES */}
      <div className="bg-white dark:bg-[#28282B] border-l-4 border-lime border-y border-r border-slate-border dark:border-[#3A3A3D] rounded-card p-5 shadow-card dark:shadow-dark-card">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-4 h-4 text-lime-900 dark:text-lime" />
          <span className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5]">{t('virtualCash.rulesTitle')}</span>
        </div>
        <div className="flex flex-col gap-1.5 text-xs text-slate-700 dark:text-[#A1A1AA] leading-relaxed">
          <div>• {t('virtualCash.ruleEqualCap')}</div>
          <div>• {t('virtualCash.ruleEdu')}</div>
          <div>• {t('virtualCash.ruleNoReal')}</div>
        </div>
      </div>
    </div>
  );
}
