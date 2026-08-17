'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  LayoutDashboard,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowLeftRight,
  BarChart3,
  GraduationCap,
  Trophy,
  Wallet,
  Gift,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { CompanyLogo } from '@/components/market/CompanyLogo';
import { useStockSearch } from '@/hooks/useAssets';
import { Modal } from '@/components/ui/Modal';
import { formatCurrency, formatPercent } from '@/lib/utils';
import { Asset } from '@/types/database.types';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const { data: assets, isLoading } = useStockSearch(query);

  const pages = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Markets Directory', href: '/markets', icon: TrendingUp },
    { name: 'Portfolio & Holdings', href: '/portfolio', icon: PieChart },
    { name: 'Trade Terminal', href: '/trade', icon: ArrowLeftRight },
    { name: 'Analytics Master Suite', href: '/analytics', icon: BarChart3 },
    { name: 'Academy Courses', href: '/academy', icon: GraduationCap },
    { name: 'Trading Leaderboard', href: '/leaderboard', icon: Trophy },
    { name: 'Manage Virtual Capital', href: '/virtual-cash', icon: Wallet },
    { name: 'Invite Friends & Rewards', href: '/invite', icon: Gift },
  ];

  const filteredPages = pages.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (href: string) => {
    router.push(href);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" className="p-0 overflow-hidden">
      {/* Search Input Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-border dark:border-[#3A3A3D] bg-white dark:bg-[#28282B]">
        <Search className="w-5 h-5 text-slate-muted dark:text-[#A1A1AA] shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search tickers (AAPL, NVDA, TSLA) or companies (Apple, Microsoft)..."
          className="w-full text-base font-medium text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-muted dark:placeholder:text-[#71717A] focus:outline-none bg-transparent"
          autoFocus
        />
        <kbd className="text-[11px] font-mono bg-slate-100 dark:bg-[#323236] border border-slate-200 dark:border-[#3A3A3D] rounded px-1.5 py-0.5 text-slate-muted dark:text-[#A1A1AA] shrink-0">
          ESC
        </kbd>
      </div>

      {/* Results Container */}
      <div className="max-h-96 overflow-y-auto p-3 flex flex-col gap-3 divide-y divide-slate-100 dark:divide-[#3A3A3D]">
        {/* Matched Assets */}
        {assets && assets.length > 0 && (
          <div>
            <div className="text-[11px] font-bold uppercase text-slate-muted dark:text-[#A1A1AA] px-3 py-1.5 tracking-wider flex items-center justify-between">
              <span>Matching Stocks & ETFs ({assets.length})</span>
              <span className="text-[10px] text-slate-400 dark:text-[#71717A] font-normal">Real Exchange Data</span>
            </div>
            <div className="flex flex-col gap-1">
              {assets.slice(0, 6).map((a: Asset) => {
                const ticker = a.ticker || (a as any).symbol || '';
                const name = a.name || ticker || 'Company';
                const sector = a.sector || a.category || 'Equities';
                const price = Number(a.current_price || 0);
                const dayChange = Number(a.day_change || 0);
                const dayChangePct = Number(a.day_change_pct || 0);
                const isPositive = dayChangePct >= 0;
                const destination = ticker ? `/markets/${encodeURIComponent(ticker)}` : '/markets';

                return (
                  <div
                    key={a.id || ticker}
                    onClick={() => handleSelect(destination)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-[#323236] transition-colors cursor-pointer group"
                  >
                    <div className="flex items-center gap-3">
                      <CompanyLogo ticker={ticker} name={name} size="sm" />
                      <div>
                        <div className="text-xs font-extrabold text-slate-dark dark:text-[#F5F5F5] group-hover:text-lime-900 dark:group-hover:text-lime transition-colors">
                          {ticker} <span className="font-normal text-slate-500 dark:text-[#A1A1AA]">• {name}</span>
                        </div>
                        <div className="text-[11px] text-slate-muted dark:text-[#71717A]">
                          {sector}
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-bold text-slate-dark dark:text-[#F5F5F5]">
                        {formatCurrency(price)}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold flex items-center gap-0.5 ${
                          isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
                        }`}
                      >
                        {isPositive ? (
                          <TrendingUp className="w-2.5 h-2.5 inline" />
                        ) : (
                          <TrendingDown className="w-2.5 h-2.5 inline" />
                        )}
                        {isPositive ? '+' : ''}
                        {dayChange.toFixed(2)} ({formatPercent(dayChangePct)})
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Matched Navigation Pages */}
        {filteredPages.length > 0 && (
          <div className="pt-2">
            <div className="text-[11px] font-bold uppercase text-slate-muted dark:text-[#A1A1AA] px-3 py-1.5 tracking-wider">
              Navigation Pages
            </div>
            <div className="flex flex-col gap-1">
              {filteredPages.map((p) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.name}
                    onClick={() => handleSelect(p.href)}
                    className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-[#323236] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-[#323236] flex items-center justify-center text-slate-600 dark:text-[#A1A1AA]">
                        <Icon className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5]">{p.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-slate-muted dark:text-[#71717A]">Jump to page →</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-5 py-2.5 bg-slate-50 dark:bg-[#1E1E21] border-t border-slate-border dark:border-[#3A3A3D] flex items-center justify-between text-[11px] text-slate-muted dark:text-[#A1A1AA]">
        <span>Press <kbd className="font-mono bg-white dark:bg-[#28282B] border border-slate-200 dark:border-[#3A3A3D] px-1 py-0.5 rounded text-[10px] text-slate-700 dark:text-[#F5F5F5]">↵</kbd> to select</span>
        <span><kbd className="font-mono bg-white dark:bg-[#28282B] border border-slate-200 dark:border-[#3A3A3D] px-1 py-0.5 rounded text-[10px] text-slate-700 dark:text-[#F5F5F5]">ESC</kbd> to close</span>
      </div>
    </Modal>
  );
}
