'use client';

import React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SearchBarProps {
  onOpenSearch: () => void;
  className?: string;
}

export function SearchBar({ onOpenSearch, className }: SearchBarProps) {
  return (
    <div
      onClick={onOpenSearch}
      className={cn(
        'w-full max-w-[500px] h-10 bg-white/85 dark:bg-[#28282B] backdrop-blur-md border border-slate-border dark:border-[#3A3A3D] hover:border-slate-300 dark:hover:border-[#B8F500]/50 rounded-full flex items-center gap-2.5 px-4 cursor-pointer shadow-subtle dark:shadow-none hover:shadow-card transition-all duration-150 group select-none',
        className
      )}
    >
      <Search className="w-4 h-4 text-slate-muted dark:text-[#A1A1AA] group-hover:text-slate-dark dark:group-hover:text-[#F5F5F5] transition-colors shrink-0" />
      <span className="text-xs text-slate-muted dark:text-[#A1A1AA] group-hover:text-slate-dark dark:group-hover:text-[#F5F5F5] flex-1 truncate font-medium">
        Search stocks, ETFs, indices, lessons...
      </span>
      <kbd className="text-[11px] font-mono font-bold text-slate-500 dark:text-[#A1A1AA] bg-slate-100 dark:bg-[#323236] border border-slate-200 dark:border-[#3A3A3D] rounded-md px-1.5 py-0.5 flex items-center gap-0.5 shrink-0">
        <span className="text-xs">⌘</span> K
      </kbd>
    </div>
  );
}
