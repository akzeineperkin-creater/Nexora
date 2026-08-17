'use client';

import React, { forwardRef } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface GlassButtonProps extends Omit<HTMLMotionProps<'button'>, 'children'> {
  variant?: 'lime' | 'glass' | 'glass-dark' | 'outline' | 'danger' | 'ghost';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'icon';
  fullWidth?: boolean;
  children: React.ReactNode;
}

export const GlassButton = forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = 'glass', size = 'md', fullWidth = false, children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-bold transition-all rounded-full cursor-pointer select-none border whitespace-nowrap focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none';

    const variants = {
      lime: 'bg-lime text-[#0F0B0A] border-lime/80 shadow-lime hover:bg-[#A6DE00] hover:shadow-lg hover:-translate-y-0.5 active:bg-[#92C400]',
      glass:
        'bg-white/85 dark:bg-[#28282B] text-slate-dark dark:text-[#F5F5F5] border-slate-border dark:border-[#3A3A3D] backdrop-blur-md shadow-subtle hover:bg-white dark:hover:bg-[#323236] hover:border-slate-300 dark:hover:border-[#4A4A4E] hover:-translate-y-0.5 hover:shadow-card active:bg-slate-100 dark:active:bg-[#202023]',
      'glass-dark':
        'bg-[#0F0B0A] text-[#F5F5F5] border-[#3A3A3D] shadow-sm hover:bg-[#28282B] hover:-translate-y-0.5 hover:shadow-md active:bg-[#000000]',
      outline:
        'bg-transparent text-slate-600 dark:text-[#A1A1AA] border-slate-border dark:border-[#3A3A3D] hover:bg-white dark:hover:bg-[#28282B] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:border-slate-300 dark:hover:border-[#4A4A4E] hover:-translate-y-0.5',
      danger:
        'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/40 hover:bg-red-600 hover:text-white hover:shadow-md hover:-translate-y-0.5',
      ghost:
        'bg-transparent text-slate-600 dark:text-[#A1A1AA] border-transparent hover:bg-slate-100 dark:hover:bg-[#28282B] hover:text-slate-dark dark:hover:text-[#F5F5F5]',
    };

    const sizes = {
      xs: 'px-2.5 py-1 text-xs gap-1.5',
      sm: 'px-3.5 py-1.5 text-xs font-semibold gap-1.5',
      md: 'px-4 py-2 text-sm gap-2',
      lg: 'px-6 py-3 text-base gap-2.5',
      icon: 'w-9 h-9 p-0 rounded-full',
    };

    return (
      <motion.button
        ref={ref}
        whileTap={!disabled ? { scale: 0.98 } : undefined}
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth && 'w-full',
          className
        )}
        disabled={disabled}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

GlassButton.displayName = 'GlassButton';

// Re-export alias
export const Button = GlassButton;
