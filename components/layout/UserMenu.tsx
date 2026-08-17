'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  ChevronDown,
  PieChart,
  Wallet,
  Gift,
  LogOut,
  ShieldCheck,
  Trophy,
  Sparkles,
  User,
  Sun,
  Moon,
  Monitor,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import { usePortfolio } from '@/hooks/usePortfolio';
import { useTheme } from '@/providers/ThemeProvider';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

export function UserMenu() {
  const { user, profile, signOut } = useAuth();
  const { data: portfolioData } = usePortfolio();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const nickname = profile?.nickname || profile?.username || user?.email?.split('@')[0] || 'Trader';
  const cashBalance = portfolioData?.cashBalance ?? 0;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 pr-2.5 bg-white/85 dark:bg-[#28282B] backdrop-blur-md border border-slate-border dark:border-[#3A3A3D] hover:border-slate-300 dark:hover:border-[#B8F500]/50 rounded-full transition-all shadow-subtle hover:shadow-card cursor-pointer focus:outline-none"
        aria-label="User Menu"
      >
        <div className="relative w-7 h-7 rounded-full bg-slate-100 dark:bg-[#323236] border border-slate-200 dark:border-[#3A3A3D] flex items-center justify-center shrink-0">
          {profile?.avatar_url ? (
            <Image
              src={profile.avatar_url}
              alt={nickname}
              width={28}
              height={28}
              className="rounded-full object-cover w-full h-full"
            />
          ) : (
            <User className="w-3.5 h-3.5 text-slate-600 dark:text-[#A1A1AA]" />
          )}
          <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 ring-1 ring-white dark:ring-[#28282B]" />
        </div>
        <span className="hidden md:inline text-xs font-bold text-slate-dark dark:text-[#F5F5F5] max-w-[110px] truncate">
          {nickname}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-muted dark:text-[#71717A]" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-card shadow-card-hover p-1.5 z-50 text-slate-dark dark:text-[#F5F5F5]"
          >
            {/* Header */}
            <div className="p-3 pb-2.5 border-b border-slate-border dark:border-[#3A3A3D] mb-1">
              <div className="text-xs font-bold text-slate-dark dark:text-[#F5F5F5] truncate">{nickname}</div>
              <div className="text-[11px] text-slate-muted dark:text-[#71717A] truncate font-mono mt-0.5">
                {user?.email || 'Authenticated User'}
              </div>
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="lime" size="sm">
                  Lvl {profile?.level || 4} • Pro Sim
                </Badge>
                <span className="text-[10px] font-mono text-slate-500 dark:text-[#A1A1AA] font-bold">
                  {formatCurrency(cashBalance)}
                </span>
              </div>
            </div>

            {/* Navigation links */}
            <Link
              href="/portfolio"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-[#323236] rounded-lg transition-colors"
            >
              <PieChart className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
              <span>My Portfolio</span>
            </Link>

            <Link
              href="/virtual-cash"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-[#323236] rounded-lg transition-colors"
            >
              <Wallet className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
              <span>Virtual Cash</span>
            </Link>

            <Link
              href="/invite"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-50 dark:hover:bg-[#323236] rounded-lg transition-colors"
            >
              <Gift className="w-4 h-4 text-slate-500 dark:text-[#71717A]" />
              <span>Invite & Earn</span>
            </Link>

            {/* Theme Selector */}
            <div className="px-3 py-2 my-1 border-t border-slate-border dark:border-[#3A3A3D]">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#71717A] mb-1.5">
                Theme
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] p-1 rounded-xl">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    theme === 'light'
                      ? 'bg-white text-slate-dark shadow-sm'
                      : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  <Sun className="w-3 h-3" />
                  <span>Light</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    theme === 'dark'
                      ? 'bg-[#28282B] text-lime shadow-sm'
                      : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  <Moon className="w-3 h-3" />
                  <span>Dark</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('system')}
                  className={`flex items-center justify-center gap-1 py-1 rounded-lg text-[11px] font-bold transition-all ${
                    theme === 'system'
                      ? 'bg-lime text-[#0F0B0A] shadow-sm'
                      : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
                  }`}
                >
                  <Monitor className="w-3 h-3" />
                  <span>Auto</span>
                </button>
              </div>
            </div>

            <div className="my-1 border-t border-slate-border dark:border-[#3A3A3D]" />

            <button
              onClick={() => {
                setIsOpen(false);
                signOut();
              }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
