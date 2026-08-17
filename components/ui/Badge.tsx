import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'lime' | 'up' | 'down' | 'neutral' | 'blue';
  size?: 'sm' | 'md';
}

export function Badge({ className, variant = 'neutral', size = 'sm', children, ...props }: BadgeProps) {
  const base = 'inline-flex items-center gap-1.5 font-bold rounded-full border leading-none whitespace-nowrap';

  const variants = {
    lime: 'bg-lime-50 dark:bg-lime/10 text-lime-900 dark:text-lime border-lime-300/60 dark:border-lime/30',
    up: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/40',
    down: 'bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800/40',
    neutral: 'bg-slate-100 dark:bg-[#323236] text-slate-600 dark:text-[#F5F5F5] border-slate-200 dark:border-[#3A3A3D]',
    blue: 'bg-slate-100 dark:bg-[#323236] text-slate-700 dark:text-[#F5F5F5] border-slate-200 dark:border-[#3A3A3D]',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
  };

  return (
    <span className={cn(base, variants[variant], sizes[size], className)} {...props}>
      {children}
    </span>
  );
}
