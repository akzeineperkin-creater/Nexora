'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
}

interface PillTabsProps {
  items?: TabItem[];
  tabs?: TabItem[];
  activeId: string;
  onChange: (id: string) => void;
  variant?: 'default' | 'lime';
  className?: string;
}

export function PillTabs({ items, tabs, activeId, onChange, variant = 'lime', className }: PillTabsProps) {
  const tabList = items || tabs || [];
  return (
    <div
      className={cn(
        'inline-flex items-center bg-slate-100/90 dark:bg-[#1E1E21] p-1 rounded-full border border-slate-200 dark:border-[#3A3A3D] shadow-sm dark:shadow-dark-card gap-1 transition-colors',
        className
      )}
    >
      {tabList.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs transition-all duration-150 whitespace-nowrap cursor-pointer select-none',
              isActive
                ? variant === 'lime'
                  ? 'bg-lime text-[#0F0B0A] font-extrabold shadow-lime scale-[1.02]'
                  : 'bg-white dark:bg-[#28282B] text-slate-dark dark:text-[#F5F5F5] font-bold shadow-subtle border border-slate-200 dark:border-[#3A3A3D]'
                : 'text-slate-600 dark:text-zinc-300 font-semibold hover:text-slate-950 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-[#28282B]'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-80 font-mono font-bold">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
