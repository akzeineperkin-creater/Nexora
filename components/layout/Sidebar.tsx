'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  Star,
  ArrowLeftRight,
  History,
  BarChart3,
  Newspaper,
  Calendar,
  GraduationCap,
  Trophy,
  Gamepad2,
  ShieldCheck,
  Wallet,
  Gift,
  ChevronRight,
  User,
  X,
} from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import { useAuth } from '@/providers/AuthProvider';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useWatchlist } from '@/hooks/useWatchlist';

interface SidebarProps {
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { data: portfolioData } = usePortfolio();
  const { data: watchlistData } = useWatchlist();

  const totalNetWorth = portfolioData?.totalPortfolioValue ?? 0;
  const cashBalance = portfolioData?.cashBalance ?? 0;
  const watchlistCount = watchlistData?.length ?? 0;

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'Markets', href: '/markets', icon: TrendingUp },
    { label: 'Portfolio', href: '/portfolio', icon: PieChart },
    { label: 'Watchlist', href: '/watchlist', icon: Star, badge: watchlistCount > 0 ? watchlistCount : undefined },
    { label: 'Trade', href: '/trade', icon: ArrowLeftRight, tag: 'Sim' },
    { label: 'History', href: '/history', icon: History },
    { label: 'Analytics', href: '/analytics', icon: BarChart3, liveDot: true },
    { label: 'News', href: '/news', icon: Newspaper },
    { label: 'Calendar', href: '/calendar', icon: Calendar },
    { label: 'Academy', href: '/academy', icon: GraduationCap },
    { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
    { label: 'Games', href: '/games', icon: Gamepad2, tag: 'Live' },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/60 dark:bg-black/75 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-200"
        />
      )}

      <aside
        className={cn(
          'w-[280px] max-w-[85vw] lg:w-[228px] lg:min-w-[228px] lg:max-w-[228px] h-screen fixed top-0 left-0 bottom-0 bg-white dark:bg-[#0F0B0A] border-r border-slate-border dark:border-[#3A3A3D] flex flex-col z-50 transition-all duration-200 overflow-y-auto overflow-x-hidden select-none',
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* BRAND LOGO HEADER */}
        <div className="p-5 pb-4 flex items-center justify-between">
          <Link href="/dashboard" onClick={onCloseMobile} className="flex items-center gap-2.5 group select-none">
            <div className="w-[36px] h-[36px] rounded-xl overflow-hidden bg-black flex items-center justify-center shadow-sm shrink-0 border border-slate-800 dark:border-[#3A3A3D]">
              <Image
                src="/logo.png"
                alt="Nexra Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-black text-lg text-slate-dark dark:text-[#F5F5F5] leading-none tracking-tight">
                NEXRA
              </span>
              <span className="text-[10px] font-semibold text-slate-muted dark:text-[#71717A] lowercase tracking-tight mt-0.5">
                invest. grow. repeat.
              </span>
            </div>
          </Link>
          <button
            onClick={onCloseMobile}
            className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-muted dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#28282B] cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MAIN NAVIGATION (Signature Lime Green Pill for Active Route) */}
        <nav className="px-3 py-2 flex-1" aria-label="Main Navigation">
          <ul className="flex flex-col gap-1">
            {navItems.map((item) => {
              const isDashboard = item.href === '/dashboard' && (pathname === '/' || pathname === '/dashboard');
              const isActive = isDashboard || (item.href !== '/dashboard' && (pathname === item.href || pathname.startsWith(item.href + '/')));
              const Icon = item.icon;

              return (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    onClick={onCloseMobile}
                    className={cn(
                      'flex items-center gap-3 px-3.5 py-2 rounded-full text-[13px] font-semibold transition-all duration-180 ease-out relative group select-none active:scale-[0.98]',
                      isActive
                        ? 'bg-lime text-[#0F0B0A] font-extrabold shadow-lime'
                        : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-100 dark:hover:bg-[#28282B] hover:translate-x-0.5'
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4 h-4 shrink-0 transition-transform',
                        isActive ? 'text-[#0F0B0A] stroke-[2.5px]' : 'text-slate-500 dark:text-[#71717A] group-hover:text-slate-900 dark:group-hover:text-[#F5F5F5]'
                      )}
                    />
                    <span className="flex-1 whitespace-nowrap">{item.label}</span>

                    {item.badge !== undefined && (
                      <span
                        className={cn(
                          'text-[10px] font-bold px-1.5 py-0.2 rounded-full border transition-colors',
                          isActive
                            ? 'bg-[#0F0B0A]/15 text-[#0F0B0A] border-transparent'
                            : 'bg-slate-100 dark:bg-[#323236] text-slate-600 dark:text-[#F5F5F5] border-slate-200 dark:border-[#3A3A3D]'
                        )}
                      >
                        {item.badge}
                      </span>
                    )}

                    {item.tag && (
                      <span
                        className={cn(
                          'text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full',
                          isActive
                            ? 'bg-[#0F0B0A]/15 text-[#0F0B0A]'
                            : 'bg-slate-200/60 dark:bg-[#323236] text-slate-700 dark:text-[#A1A1AA]'
                        )}
                      >
                        {item.tag}
                      </span>
                    )}

                    {item.liveDot && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* SIDEBAR BOTTOM SECTION */}
        <div className="p-3 bg-slate-50/80 dark:bg-[#0F0B0A] border-t border-slate-border dark:border-[#3A3A3D] flex flex-col gap-2.5">
          {/* VIRTUAL CAPITAL CARD */}
          <div className="bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-xl p-3 shadow-subtle dark:shadow-dark-card">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-muted dark:text-[#A1A1AA] flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" /> Virtual Capital
              </span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-lime-50 dark:bg-lime/10 text-lime-900 dark:text-lime border border-lime-300 dark:border-lime/30">
                Sandbox
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-1">
              <span className="text-xs text-slate-600 dark:text-[#A1A1AA]">Total Net Worth</span>
              <span className="text-sm font-extrabold font-mono text-slate-dark dark:text-[#F5F5F5]">
                {formatCurrency(totalNetWorth)}
              </span>
            </div>
            <div className="flex items-baseline justify-between mb-2.5">
              <span className="text-xs text-slate-600 dark:text-[#A1A1AA]">Buying Power</span>
              <span className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400">
                {formatCurrency(cashBalance)}
              </span>
            </div>
            <Link
              href="/virtual-cash"
              onClick={onCloseMobile}
              className="w-full py-1.5 px-2.5 rounded-full bg-slate-100 dark:bg-[#323236] hover:bg-slate-dark dark:hover:bg-lime hover:text-white dark:hover:text-[#0F0B0A] text-slate-dark dark:text-[#F5F5F5] border border-slate-200 dark:border-[#3A3A3D] text-xs font-bold transition-all duration-180 flex items-center justify-center gap-1.5 group active:scale-[0.98]"
            >
              <Wallet className="w-3.5 h-3.5 group-hover:text-lime dark:group-hover:text-[#0F0B0A]" />
              <span>Manage Virtual Cash</span>
            </Link>
          </div>

          {/* INVITE FRIENDS CARD */}
          <Link
            href="/invite"
            onClick={onCloseMobile}
            className="bg-gradient-to-br from-white to-lime-50 dark:from-[#28282B] dark:to-[#28282B] border border-slate-border dark:border-[#3A3A3D] hover:border-lime dark:hover:border-lime rounded-xl p-2.5 flex items-center gap-2 transition-all duration-180 shadow-subtle group active:scale-[0.98]"
          >
            <div className="w-7 h-7 rounded-lg bg-lime flex items-center justify-center text-[#0F0B0A] shrink-0">
              <Gift className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] leading-tight">Invite Friends</div>
              <div className="text-[10px] text-slate-muted dark:text-[#71717A] truncate">Earn $1,000 sim cash together</div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-muted dark:text-[#71717A] group-hover:translate-x-0.5 transition-transform" />
          </Link>

          {/* USER LEVEL FOOTER */}
          {(() => {
            const nickname = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader';
            return (
              <div className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-[#28282B] transition-colors cursor-pointer group">
                <div className="relative w-8 h-8 rounded-full bg-slate-100 dark:bg-[#323236] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center shrink-0">
                  {profile?.avatar_url ? (
                    <Image
                      src={profile.avatar_url}
                      alt={nickname}
                      width={32}
                      height={32}
                      className="w-full h-full rounded-full object-cover border border-white dark:border-[#28282B]"
                    />
                  ) : (
                    <User className="w-4 h-4 text-slate-600 dark:text-[#A1A1AA]" />
                  )}
                  <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border border-white dark:border-[#28282B]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] truncate">
                      {nickname}
                    </span>
                    <span className="text-[9px] font-extrabold bg-[#0F0B0A] text-lime border border-[#3A3A3D] px-1.5 py-0.2 rounded-full">
                      Lvl {profile?.level || 1}
                    </span>
                  </div>
                  <div className="w-full h-1 bg-slate-200 dark:bg-[#3A3A3D] rounded-full mt-1 overflow-hidden">
                    <div
                      className="h-full bg-lime rounded-full"
                      style={{ width: `${Math.min(100, ((profile?.xp || 0) / (profile?.xp_max || 1000)) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </aside>
    </>
  );
}
