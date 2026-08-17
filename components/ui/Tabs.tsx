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
        'inline-flex items-center bg-slate-100 dark:bg-[#0F0B0A] p-1 rounded-full border border-slate-border dark:border-[#3A3A3D] gap-1',
        className
      )}
    >
      {tabList.map((tab) => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={cn(
              'px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer',
              isActive
                ? variant === 'lime'
                  ? 'bg-lime text-[#0F0B0A] font-extrabold shadow-lime-subtle'
                  : 'bg-white dark:bg-[#28282B] text-slate-dark dark:text-[#F5F5F5] font-bold shadow-subtle border border-slate-200 dark:border-[#3A3A3D]'
                : 'text-slate-600 dark:text-[#A1A1AA] hover:text-slate-dark dark:hover:text-[#F5F5F5] hover:bg-slate-200/50 dark:hover:bg-[#28282B]'
            )}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className="ml-1.5 text-[10px] opacity-75 font-mono">({tab.count})</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
