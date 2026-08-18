'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  Sparkles,
  ArrowUpRight,
  BarChart3,
  Lock,
} from 'lucide-react';
import { MarketHeroCanvas } from './MarketHeroCanvas';
import { FloatingStockCard } from './FloatingStockCard';

export function MarketHero() {
  return (
    <section className="relative min-h-[92vh] sm:min-h-screen flex items-center justify-center overflow-hidden bg-[#050807] pt-28 sm:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
      {/* 1. Dynamic Stock Market Canvas Animation Background */}
      <MarketHeroCanvas />

      {/* 2. Floating Perimeter Live Stock Cards (Placed strictly on left & right margins) */}
      <FloatingStockCard
        ticker="NVDA"
        name="NVIDIA Corp."
        price="$184.72"
        change="+4.71%"
        positionClasses="left-6 lg:left-14 top-36 lg:top-44"
        delaySec={0}
        durationSec={6.5}
      />
      <FloatingStockCard
        ticker="TSLA"
        name="Tesla Inc."
        price="$341.27"
        change="+3.26%"
        positionClasses="left-8 lg:left-20 bottom-24 lg:bottom-32"
        delaySec={1.2}
        durationSec={7.2}
      />
      <FloatingStockCard
        ticker="AAPL"
        name="Apple Inc."
        price="$306.14"
        change="+2.84%"
        positionClasses="right-6 lg:right-14 top-40 lg:top-48"
        delaySec={0.6}
        durationSec={6.8}
      />
      <FloatingStockCard
        ticker="MSFT"
        name="Microsoft Corp."
        price="$448.90"
        change="+1.92%"
        positionClasses="right-8 lg:right-20 bottom-28 lg:bottom-36"
        delaySec={1.8}
        durationSec={7.5}
      />

      {/* 3. Central Hero Content Hierarchy */}
      <div className="relative z-20 max-w-4xl mx-auto text-center flex flex-col items-center">
        {/* Brand Tagline Badge Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-6 shadow-xl animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="w-2 h-2 rounded-full bg-lime animate-pulse ring-4 ring-lime/20" />
          <span className="text-xs font-extrabold uppercase tracking-widest text-zinc-200">
            Learn. Trade. Grow.
          </span>
        </div>

        {/* Massive Headline with Subtle White -> Light Green -> Lime Gradient */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-[86px] font-black tracking-tight leading-[1.05] sm:leading-[1.02] mb-6 select-none font-display">
          <span className="bg-gradient-to-b from-white via-zinc-100 to-[#B8F500] bg-clip-text text-transparent drop-shadow-sm">
            Learn. Trade. Grow.
          </span>
        </h1>

        {/* Product Description */}
        <p className="text-base sm:text-lg md:text-xl text-zinc-300 max-w-2xl mx-auto font-normal leading-relaxed mb-4">
          Nexra is an investment simulator that helps you learn how financial markets work through real market data and virtual money.
        </p>

        {/* Highlighted Core Statement */}
        <p className="text-sm sm:text-base font-semibold text-lime max-w-xl mx-auto mb-9 tracking-wide flex items-center justify-center gap-2">
          <span>Trade without risk. Build your strategy. Understand the market.</span>
        </p>

        {/* Primary and Secondary Call To Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full max-w-md mx-auto mb-12">
          <Link
            href="/register"
            className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-lime text-[#0F0B0A] font-extrabold text-sm sm:text-base hover:bg-lime-300 hover:scale-[1.03] active:scale-[0.98] transition-all duration-200 shadow-lime flex items-center justify-center gap-2 group cursor-pointer"
          >
            <span>Start Trading</span>
            <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
          </Link>

          <Link
            href="/markets"
            className="w-full sm:w-auto flex-1 px-7 py-4 rounded-2xl bg-white/5 border border-white/15 text-white font-bold text-sm sm:text-base hover:bg-white/10 hover:border-white/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 backdrop-blur-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <BarChart3 className="w-4 h-4 text-zinc-400" />
            <span>Explore Markets</span>
          </Link>
        </div>

        {/* Live Simulation Badges Footer Pill Row */}
        <div className="flex items-center justify-center gap-4 sm:gap-6 text-xs text-zinc-400 font-mono flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-lime" />
            <span><strong>$10,000.00</strong> Virtual Capital</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time NYSE & NASDAQ Data</span>
          </div>
          <span className="hidden sm:inline text-zinc-700">•</span>
          <div className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-zinc-400" />
            <span>Zero Real Financial Risk</span>
          </div>
        </div>
      </div>
    </section>
  );
}
