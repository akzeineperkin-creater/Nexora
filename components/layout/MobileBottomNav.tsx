'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  ArrowLeftRight,
  PieChart,
  Menu,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onOpenMobileMenu: () => void;
  onOpenQuickTrade?: () => void;
}

export function MobileBottomNav({ onOpenMobileMenu, onOpenQuickTrade }: MobileBottomNavProps) {
  const pathname = usePathname();

  const isDashboard = pathname === '/' || pathname === '/dashboard';
  const isMarkets = pathname.startsWith('/markets');
  const isTrade = pathname.startsWith('/trade');
  const isPortfolio = pathname.startsWith('/portfolio');

  return (
    <nav
      aria-label="Mobile Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0F0B0A]/95 backdrop-blur-lg border-t border-slate-border dark:border-[#3A3A3D] px-2 py-1.5 pb-safe select-none shadow-[0_-4px_16px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.4)]"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {/* 1. Dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors',
            isDashboard
              ? 'text-[#0F0B0A] dark:text-lime font-extrabold'
              : 'text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
          )}
        >
          <div className={cn('p-1 rounded-lg transition-all', isDashboard && 'bg-lime text-[#0F0B0A]')}>
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Home</span>
        </Link>

        {/* 2. Markets */}
        <Link
          href="/markets"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors',
            isMarkets
              ? 'text-[#0F0B0A] dark:text-lime font-extrabold'
              : 'text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
          )}
        >
          <div className={cn('p-1 rounded-lg transition-all', isMarkets && 'bg-lime text-[#0F0B0A]')}>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Markets</span>
        </Link>

        {/* 3. Trade (Center Action) */}
        {onOpenQuickTrade ? (
          <button
            type="button"
            onClick={onOpenQuickTrade}
            className="flex flex-col items-center justify-center -mt-4 py-1 px-2.5 group cursor-pointer focus:outline-none"
            aria-label="Quick Trade"
          >
            <div className="w-11 h-11 rounded-full bg-lime text-[#0F0B0A] flex items-center justify-center shadow-lime border-2 border-white dark:border-[#0F0B0A] active:scale-95 transition-transform">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5 text-slate-dark dark:text-[#F5F5F5]">Trade</span>
          </button>
        ) : (
          <Link
            href="/trade"
            className="flex flex-col items-center justify-center -mt-4 py-1 px-2.5 group cursor-pointer"
            aria-label="Trade Terminal"
          >
            <div className="w-11 h-11 rounded-full bg-lime text-[#0F0B0A] flex items-center justify-center shadow-lime border-2 border-white dark:border-[#0F0B0A] active:scale-95 transition-transform">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5px]" />
            </div>
            <span className="text-[10px] font-extrabold mt-0.5 text-slate-dark dark:text-[#F5F5F5]">Trade</span>
          </Link>
        )}

        {/* 4. Portfolio */}
        <Link
          href="/portfolio"
          className={cn(
            'flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] transition-colors',
            isPortfolio
              ? 'text-[#0F0B0A] dark:text-lime font-extrabold'
              : 'text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F5F5F5]'
          )}
        >
          <div className={cn('p-1 rounded-lg transition-all', isPortfolio && 'bg-lime text-[#0F0B0A]')}>
            <PieChart className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">Portfolio</span>
        </Link>

        {/* 5. More Menu Drawer */}
        <button
          type="button"
          onClick={onOpenMobileMenu}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-xl min-w-[56px] min-h-[44px] text-slate-500 dark:text-[#A1A1AA] hover:text-slate-900 dark:hover:text-[#F5F5F5] transition-colors cursor-pointer"
          aria-label="Open Navigation Menu"
        >
          <div className="p-1 rounded-lg">
            <Menu className="w-4 h-4" />
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight font-bold">More</span>
        </button>
      </div>
    </nav>
  );
}
