'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/providers/LanguageProvider';
import { SUPPORTED_LOCALES, Locale } from '@/lib/i18n/types';
import { cn } from '@/lib/utils';

interface LanguageSwitcherProps {
  variant?: 'dropdown' | 'segmented' | 'menu';
  className?: string;
  showFlag?: boolean;
}

export function LanguageSwitcher({
  variant = 'dropdown',
  className,
  showFlag = true,
}: LanguageSwitcherProps) {
  const { locale, setLocale, isMounted } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  if (!isMounted) {
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-full bg-slate-100 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]',
          className
        )}
      />
    );
  }

  const currentOption = SUPPORTED_LOCALES.find((l) => l.code === locale) || SUPPORTED_LOCALES[0];

  // 1. SEGMENTED VARIANT (Inline pill bar)
  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center p-1 bg-slate-100 dark:bg-[#1E1E21] rounded-full border border-slate-border dark:border-[#3A3A3D] gap-1 select-none',
          className
        )}
      >
        {SUPPORTED_LOCALES.map((opt) => {
          const isActive = opt.code === locale;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLocale(opt.code)}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all cursor-pointer',
                isActive
                  ? 'bg-white dark:bg-[#28282B] text-slate-dark dark:text-lime shadow-sm'
                  : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
              )}
              title={opt.label}
            >
              {showFlag && <span className="text-xs">{opt.flag}</span>}
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 2. MENU VARIANT (For drawers and UserMenu)
  if (variant === 'menu') {
    return (
      <div className={cn('grid grid-cols-3 gap-1 bg-slate-100 dark:bg-[#1E1E21] border border-slate-200 dark:border-[#3A3A3D] p-1 rounded-xl select-none', className)}>
        {SUPPORTED_LOCALES.map((opt) => {
          const isActive = opt.code === locale;
          return (
            <button
              key={opt.code}
              type="button"
              onClick={() => setLocale(opt.code)}
              className={cn(
                'flex items-center justify-center gap-1 py-1 px-1.5 rounded-lg text-[11px] font-bold transition-all cursor-pointer',
                isActive
                  ? 'bg-white dark:bg-[#28282B] text-slate-dark dark:text-lime shadow-sm'
                  : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
              )}
            >
              <span className="text-xs">{opt.flag}</span>
              <span>{opt.shortLabel}</span>
            </button>
          );
        })}
      </div>
    );
  }

  // 3. DROPDOWN VARIANT (Default for Topbar and Navbars)
  return (
    <div className={cn('relative inline-block text-left', className)} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="h-9 px-2.5 rounded-full flex items-center gap-1.5 bg-white/90 dark:bg-[#28282B] text-slate-700 dark:text-[#F5F5F5] border border-slate-border dark:border-[#3A3A3D] hover:bg-slate-100 dark:hover:bg-[#323236] transition-all shadow-subtle cursor-pointer focus:outline-none select-none text-xs font-bold"
        aria-label="Select Language"
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <Globe className="w-3.5 h-3.5 text-slate-500 dark:text-lime shrink-0" />
        {showFlag && <span className="text-xs">{currentOption.flag}</span>}
        <span className="font-extrabold tracking-wide uppercase text-[11px]">{currentOption.shortLabel}</span>
        <ChevronDown className={cn('w-3 h-3 text-slate-400 dark:text-[#71717A] transition-transform duration-150', isOpen && 'rotate-180')} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.95 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 mt-1.5 w-44 rounded-xl bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] shadow-card-hover p-1 z-50 overflow-hidden"
          >
            <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-[#71717A] border-b border-slate-100 dark:border-[#3A3A3D] mb-1">
              Select Language
            </div>
            {SUPPORTED_LOCALES.map((opt) => {
              const isActive = opt.code === locale;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={() => {
                    setLocale(opt.code);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer',
                    isActive
                      ? 'bg-lime-50 dark:bg-lime/10 text-lime-900 dark:text-lime'
                      : 'text-slate-700 dark:text-[#A1A1AA] hover:bg-slate-50 dark:hover:bg-[#323236] hover:text-slate-dark dark:hover:text-white'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm">{opt.flag}</span>
                    <span>{opt.label}</span>
                  </span>
                  {isActive && <Check className="w-3.5 h-3.5 text-lime-600 dark:text-lime" />}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
