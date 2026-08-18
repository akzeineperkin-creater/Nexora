'use client';

import React from 'react';
import Link from 'next/link';
import { Menu, PlusCircle } from 'lucide-react';
import { SearchBar } from './SearchBar';
import { NotificationButton } from './NotificationButton';
import { UserMenu } from './UserMenu';
import { ThemeToggle } from '@/components/ui/ThemeToggle';
import { GlassButton } from '@/components/ui/GlassButton';

interface TopbarProps {
  onOpenSearch: () => void;
  onOpenMobileMenu: () => void;
  onOpenQuickTrade?: () => void;
}

export function Topbar({ onOpenSearch, onOpenMobileMenu, onOpenQuickTrade }: TopbarProps) {
  return (
    <header className="h-14 sm:h-16 bg-white/85 dark:bg-[#0F0B0A]/95 backdrop-blur-md border-b border-slate-border dark:border-[#3A3A3D] flex items-center justify-between px-3 sm:px-6 sticky top-0 z-30 transition-colors w-full max-w-full">
      {/* Left: Mobile Toggle & Global Search Pill */}
      <div className="flex items-center gap-2 sm:gap-3.5 flex-1 min-w-0 max-w-[540px]">
        <button
          onClick={onOpenMobileMenu}
          className="lg:hidden w-10 h-10 rounded-full flex items-center justify-center text-slate-600 dark:text-[#A1A1AA] hover:bg-slate-100 dark:hover:bg-[#28282B] transition-colors cursor-pointer shrink-0"
          aria-label="Open Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <SearchBar onOpenSearch={onOpenSearch} />
      </div>

      {/* Right: US Market Open Status, Quick Trade, Theme Toggle, Notifications & User Avatar */}
      <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
        {/* US Market Open Status Pill */}
        <div className="hidden lg:flex items-center gap-2 bg-emerald-50/80 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-800/40 px-3 py-1.5 rounded-full select-none">
          <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)] animate-pulse" />
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400">US Market Open</span>
        </div>

        {/* Quick Trade Button (Desktop & Tablet) */}
        <div className="hidden sm:inline-flex">
          {onOpenQuickTrade ? (
            <GlassButton variant="lime" size="sm" onClick={onOpenQuickTrade}>
              <PlusCircle className="w-4 h-4" />
              <span>Quick Trade</span>
            </GlassButton>
          ) : (
            <Link href="/trade">
              <GlassButton variant="lime" size="sm">
                <PlusCircle className="w-4 h-4" />
                <span>Quick Trade</span>
              </GlassButton>
            </Link>
          )}
        </div>

        {/* Theme Toggle Button */}
        <ThemeToggle />

        {/* Notifications Button */}
        <NotificationButton />

        {/* User Profile Menu */}
        <UserMenu />
      </div>
    </header>
  );
}
