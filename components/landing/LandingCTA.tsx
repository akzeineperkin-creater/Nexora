'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, ShieldCheck, Trophy, Sparkles } from 'lucide-react';

export function LandingCTA() {
  return (
    <section className="py-20 sm:py-28 px-4 sm:px-6 lg:px-8 bg-[#07110C] relative overflow-hidden">
      {/* Subtle radial glow background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-lime/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-5xl mx-auto relative z-10">
        <div className="rounded-3xl bg-gradient-to-b from-[#1E1E21] to-[#28282B] border border-[#3A3A3D] p-8 sm:p-12 md:p-16 text-center relative overflow-hidden shadow-2xl">
          {/* Subtle grid pattern background */}
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#B8F500_1px,transparent_1px)] [background-size:20px_20px]" />

          <div className="relative z-10 max-w-3xl mx-auto flex flex-col items-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime/10 border border-lime/20 text-xs font-bold text-lime mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Ready to Master the Market?</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight mb-6 font-display leading-tight">
              Trade without risk. <br />
              <span className="bg-gradient-to-r from-white via-zinc-200 to-lime bg-clip-text text-transparent">
                Build your strategy. Understand the market.
              </span>
            </h2>

            <p className="text-sm sm:text-base text-zinc-300 max-w-xl mx-auto leading-relaxed mb-8">
              Join thousands of aspiring investors and traders learning to navigate global equity markets with $10,000 in virtual starting capital.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md">
              <Link
                href="/register"
                className="w-full sm:w-auto flex-1 px-8 py-4 rounded-2xl bg-lime text-[#0F0B0A] font-extrabold text-sm sm:text-base hover:bg-lime-300 hover:scale-[1.03] active:scale-[0.98] transition-all shadow-lime flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Start Trading with $10,000</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5] group-hover:translate-x-1 transition-transform" />
              </Link>

              <Link
                href="/leaderboard"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm sm:text-base hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2"
              >
                <Trophy className="w-4 h-4 text-amber-400" />
                <span>View Leaderboards</span>
              </Link>
            </div>

            <div className="mt-8 flex items-center justify-center gap-4 text-xs text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-lime" /> Zero credit card required
              </span>
              <span>•</span>
              <span>Instant virtual balance</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
