'use client';

import React, { useEffect, useState } from 'react';
import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '@/providers/ThemeProvider';
import { cn } from '@/lib/utils';

interface ThemeToggleProps {
  variant?: 'icon' | 'pill' | 'segmented';
  className?: string;
}

export function ThemeToggle({ variant = 'icon', className }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    // Skeleton placeholder before mount to avoid hydration mismatch
    return (
      <div
        className={cn(
          'w-9 h-9 rounded-full bg-slate-100 dark:bg-[#28282B] animate-pulse border border-slate-border dark:border-[#3A3A3D]',
          className
        )}
      />
    );
  }

  if (variant === 'segmented') {
    return (
      <div
        className={cn(
          'inline-flex items-center p-1 bg-slate-100 dark:bg-[#1E1E21] rounded-full border border-slate-border dark:border-[#3A3A3D] gap-1',
          className
        )}
      >
        <button
          type="button"
          onClick={() => setTheme('light')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all',
            theme === 'light'
              ? 'bg-white text-slate-dark shadow-sm'
              : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
          )}
          title="Light Mode"
        >
          <Sun className="w-3.5 h-3.5" />
          <span>Light</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('dark')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all',
            theme === 'dark'
              ? 'bg-[#28282B] text-lime shadow-sm'
              : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
          )}
          title="Dark Mode"
        >
          <Moon className="w-3.5 h-3.5" />
          <span>Dark</span>
        </button>

        <button
          type="button"
          onClick={() => setTheme('system')}
          className={cn(
            'flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-all',
            theme === 'system'
              ? 'bg-lime text-[#0F0B0A] shadow-sm'
              : 'text-slate-500 dark:text-[#71717A] hover:text-slate-dark dark:hover:text-[#F5F5F5]'
          )}
          title="System Default"
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Auto</span>
        </button>
      </div>
    );
  }

  // Default Icon Button
  const isDark = resolvedTheme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={cn(
        'w-9 h-9 rounded-full flex items-center justify-center transition-all cursor-pointer border',
        isDark
          ? 'bg-[#28282B] text-lime border-[#3A3A3D] hover:bg-[#323236] hover:border-[#4A4A4E] shadow-sm'
          : 'bg-white/90 text-slate-700 border-slate-border hover:bg-slate-100 hover:text-slate-dark shadow-subtle',
        className
      )}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-lime transition-transform duration-200 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-slate-600 transition-transform duration-200 hover:-rotate-12" />
      )}
    </button>
  );
}
