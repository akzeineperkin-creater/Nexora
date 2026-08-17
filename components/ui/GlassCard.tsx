import React from 'react';
import { cn } from '@/lib/utils';

export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'xl' | 'interactive' | 'lime-glow' | 'dark' | 'glass';
}

export function GlassCard({ className, variant = 'default', children, ...props }: GlassCardProps) {
  const base =
    'bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] text-slate-dark dark:text-[#F5F5F5] rounded-card p-5 shadow-card dark:shadow-dark-card transition-all duration-200';

  const variants = {
    default: 'hover:border-slate-300 dark:hover:border-[#4A4A4E] hover:shadow-card-hover',
    xl: 'rounded-card-lg p-6 hover:border-slate-300 dark:hover:border-[#4A4A4E] hover:shadow-card-hover',
    interactive:
      'cursor-pointer hover:-translate-y-0.5 hover:shadow-card-hover hover:border-slate-300 dark:hover:border-[#B8F500]/60',
    glass:
      'bg-white/85 dark:bg-[#28282B]/95 backdrop-blur-md border-slate-border dark:border-[#3A3A3D] shadow-card dark:shadow-dark-card hover:border-slate-300 dark:hover:border-[#4A4A4E]',
    'lime-glow':
      'bg-white dark:bg-[#28282B] border-lime-300/60 dark:border-lime/40 shadow-subtle hover:border-lime-400 dark:hover:border-lime hover:shadow-lime',
    dark: 'bg-[#28282B] text-[#F5F5F5] border-[#3A3A3D] shadow-lg',
  };

  return (
    <div className={cn(base, variants[variant], className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCardHeader({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('flex items-center justify-between gap-3 mb-4', className)} {...props}>
      {children}
    </div>
  );
}

export function GlassCardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-base font-bold text-slate-dark dark:text-[#F5F5F5] flex items-center gap-2 tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
}

export function GlassCardSubtitle({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-xs text-slate-muted dark:text-[#A1A1AA]', className)} {...props}>
      {children}
    </p>
  );
}

// Aliases
export const Card = GlassCard;
export const CardHeader = GlassCardHeader;
export const CardTitle = GlassCardTitle;
export const CardSubtitle = GlassCardSubtitle;
