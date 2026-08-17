import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  affix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, affix, ...props }, ref) => {
    return (
      <div className="relative flex items-center w-full">
        {icon && (
          <span className="absolute left-3 text-slate-muted dark:text-[#A1A1AA] pointer-events-none flex items-center">
            {icon}
          </span>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full py-2 px-3.5 bg-white dark:bg-[#28282B] border border-slate-border dark:border-[#3A3A3D] rounded-xl text-sm text-slate-dark dark:text-[#F5F5F5] placeholder:text-slate-muted dark:placeholder:text-[#71717A] transition-all duration-150 shadow-subtle focus:outline-none focus:border-slate-400 dark:focus:border-[#B8F500]/60 focus:ring-2 focus:ring-lime/30',
            icon && 'pl-9',
            affix && 'pr-12',
            className
          )}
          {...props}
        />
        {affix && (
          <span className="absolute right-3.5 text-xs font-bold text-slate-muted dark:text-[#A1A1AA] pointer-events-none">
            {affix}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
