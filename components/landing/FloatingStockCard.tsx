'use client';

import React from 'react';
import { ArrowUpRight, TrendingUp } from 'lucide-react';
import { CompanyLogo } from '@/components/market/CompanyLogo';

export interface FloatingCardProps {
  ticker: string;
  name: string;
  price: string;
  change: string;
  positionClasses: string;
  delaySec?: number;
  durationSec?: number;
}

export function FloatingStockCard({
  ticker,
  name,
  price,
  change,
  positionClasses,
  delaySec = 0,
  durationSec = 6,
}: FloatingCardProps) {
  return (
    <div
      className={`absolute hidden md:flex items-center gap-3 p-3 sm:p-3.5 rounded-2xl bg-[#1E1E21]/80 backdrop-blur-md border border-[#3A3A3D]/70 shadow-2xl z-10 pointer-events-auto hover:border-lime/60 hover:bg-[#28282B]/90 transition-all duration-300 group select-none ${positionClasses}`}
      style={{
        animation: `floatingCard ${durationSec}s ease-in-out ${delaySec}s infinite alternate`,
      }}
    >
      <CompanyLogo ticker={ticker} name={name} size="sm" />

      <div className="min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-extrabold text-xs font-mono text-white group-hover:text-lime transition-colors">
            {ticker}
          </span>
          <span className="text-[9px] font-bold text-zinc-400 uppercase truncate max-w-[80px]">
            {name}
          </span>
        </div>

        <div className="flex items-baseline gap-2 mt-0.5 font-mono">
          <span className="text-xs font-bold text-zinc-200">{price}</span>
          <span className="inline-flex items-center text-[10px] font-bold text-lime">
            <ArrowUpRight className="w-3 h-3 mr-0.5 stroke-[2.5]" />
            {change}
          </span>
        </div>
      </div>
    </div>
  );
}
